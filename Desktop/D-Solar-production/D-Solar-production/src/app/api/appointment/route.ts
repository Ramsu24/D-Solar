import { NextResponse } from 'next/server';
import Appointment, { AppointmentStatus } from '@/models/Appointment';
import { createTokenExpiration } from '@/utils/tokens';
import connectDB from '@/lib/mongodb';
import { isValidDate, formatDate } from '@/utils/dateUtils';

// Regular expression to validate email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regular expression to validate phone format (basic validation)
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

// Types for the appointment request
interface AppointmentRequest {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message?: string;
  confirmationToken: string; // Now provided by the client
}

// Handler for creating a new appointment
export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Parse the request body
    const data = await request.json() as AppointmentRequest;
    const { name, email, phone, date, time, message, confirmationToken } = data;
    
    console.log('Creating appointment with data:', { name, email, phone, date, time, confirmationToken });
    
    // Validate required fields
    if (!name || !email || !phone || !date || !time || !confirmationToken) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' }, 
        { status: 400 }
      );
    }
    
    // Validate phone format
    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' }, 
        { status: 400 }
      );
    }
    
    // Validate date
    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: 'Invalid date format' }, 
        { status: 400 }
      );
    }

    // Check if the appointment date is in the past
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      return NextResponse.json(
        { error: 'Appointment date cannot be in the past' }, 
        { status: 400 }
      );
    }
    
    // Check if the requested time is available
    const existingAppointments = await Appointment.find({
      date: appointmentDate,
      time,
      status: { 
        $in: [
          AppointmentStatus.PENDING_ADMIN, 
          AppointmentStatus.PENDING_CUSTOMER, 
          AppointmentStatus.CONFIRMED
        ] 
      }
    });
    
    if (existingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please select another time.' }, 
        { status: 409 }
      );
    }
    
    // Use confirmation token from client and create expiration time
    const confirmationExpires = createTokenExpiration(24); // 24 hours expiration
    
    // Create new appointment with pending status
    const appointment = new Appointment({
      name,
      email,
      phone,
      date: appointmentDate,
      time,
      message: message || '',
      status: AppointmentStatus.PENDING_CUSTOMER,
      confirmationToken,
      confirmationExpires,
    });
    
    await appointment.save();
    console.log('Appointment saved successfully with ID:', appointment._id);
    
    // Return success with the appointment ID
    return NextResponse.json({
      success: true,
      message: 'Appointment created. Please check your email to confirm.',
      appointmentId: appointment._id,
    });
    
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment. Please try again.' }, 
      { status: 500 }
    );
  }
}

// Handler for getting available time slots
export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Validate date parameter
    if (!dateParam || !isValidDate(dateParam)) {
      return NextResponse.json(
        { error: 'Invalid or missing date parameter' }, 
        { status: 400 }
      );
    }
    
    // Set the date for checking availability
    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);
    
    // Set available time slots
    const availableTimeSlots = [
      '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
    ];
    
    // Find all appointments for the given date
    const bookedAppointments = await Appointment.find({
      date,
      status: { 
        $in: [
          AppointmentStatus.PENDING_ADMIN, 
          AppointmentStatus.PENDING_CUSTOMER, 
          AppointmentStatus.CONFIRMED
        ] 
      }
    }).select('time');
    
    // Get already booked time slots
    const bookedTimeSlots = bookedAppointments.map(appt => appt.time);
    
    // Format available slots for the frontend
    const slots = availableTimeSlots.map(time => ({
      time,
      available: !bookedTimeSlots.includes(time)
    }));
    
    return NextResponse.json({
      date: dateParam,
      slots
    });
    
  } catch (error: any) {
    console.error('Error getting available time slots:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve available time slots. Please try again.' }, 
      { status: 500 }
    );
  }
} 