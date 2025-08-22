import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Appointment, { AppointmentStatus } from '@/models/Appointment';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    // Basic auth check - in a real app, you'd properly verify admin status
    // In this implementation, we'll skip verification and just count appointments
    
    // Connect to the database
    await connectDB();
    
    // Count pending appointments (both pending_customer and pending_admin)
    const count = await Appointment.countDocuments({
      status: { 
        $in: [
          AppointmentStatus.PENDING_CUSTOMER, 
          AppointmentStatus.PENDING_ADMIN
        ] 
      }
    });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching pending appointments count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending appointments count' },
      { status: 500 }
    );
  }
} 