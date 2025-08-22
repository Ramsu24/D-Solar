import { NextResponse } from 'next/server';
import Appointment, { AppointmentStatus } from '@/models/Appointment';
import connectDB from '@/lib/mongodb';

// Function to check admin authorization - simplified for now
async function isAuthorized() {
  // For now, we'll bypass authentication to get the admin page working
  // TODO: Implement proper authentication later using cookies, JWT, or NextAuth
  return true;
}

// Handler for fetching all appointments
export async function GET(request: Request) {
  try {
    // Check admin authorization
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build filter criteria
    const filter: any = {};
    
    // Filter by status if provided
    if (status) {
      filter.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filter.date = {};
      
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // End of the day
        filter.date.$lte = endDateObj;
      }
    }
    
    // Count total appointments matching the filter
    const total = await Appointment.countDocuments(filter);
    
    // Fetch appointments with pagination
    const appointments = await Appointment.find(filter)
      .sort({ date: -1, time: 1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      appointments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' }, 
      { status: 500 }
    );
  }
}

// Types for the update appointment request
interface UpdateAppointmentRequest {
  id: string;
  status: AppointmentStatus;
  notes?: string;
}

// Handler for updating appointment status
export async function PATCH(request: Request) {
  try {
    // Check admin authorization
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectDB();
    
    // Parse the request body
    const data = await request.json() as UpdateAppointmentRequest;
    const { id, status, notes } = data;
    
    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Validate status value
    if (!Object.values(AppointmentStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid appointment status' }, 
        { status: 400 }
      );
    }
    
    // Find and update the appointment
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' }, 
        { status: 404 }
      );
    }
    
    // Update fields
    appointment.status = status;
    
    if (notes !== undefined) {
      appointment.notes = notes;
    }
    
    // Save the updated appointment
    await appointment.save();
    
    // Return the updated appointment
    return NextResponse.json({
      success: true,
      appointment,
    });
    
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' }, 
      { status: 500 }
    );
  }
} 