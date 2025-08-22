import { NextResponse } from 'next/server';
import Appointment from '@/models/Appointment';
import connectDB from '@/lib/mongodb';
import { startOfDay, endOfDay, format, parse, isWeekend, addDays } from 'date-fns';

// Define business hours and slot duration (in minutes)
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17, // 5 PM
};
const SLOT_DURATION = 60; // 1 hour slots
const MAX_APPOINTMENTS_PER_SLOT = 1; // How many appointments can be booked in the same time slot

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // If date is provided, return available slots for that date
    // Otherwise, return available dates for the next 14 days
    if (dateParam) {
      return await getAvailableSlotsForDate(dateParam);
    } else {
      return await getAvailableDates();
    }
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

// Function to get available dates for the next 14 days
async function getAvailableDates() {
  const result: { date: string; formatted: string; available: boolean }[] = [];
  const today = new Date();
  
  // Check the next 14 days
  for (let i = 1; i <= 14; i++) {
    const date = addDays(today, i);
    
    // Skip weekends
    if (isWeekend(date)) {
      continue;
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
    const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
    
    // Check if there are any slots available on this date
    const hasAvailableSlots = await checkDateAvailability(dateString);
    
    result.push({
      date: dateString,
      formatted: formattedDate,
      available: hasAvailableSlots,
    });
  }
  
  return NextResponse.json({ dates: result });
}

// Function to check if a date has any available slots
async function checkDateAvailability(dateString: string) {
  const date = parse(dateString, 'yyyy-MM-dd', new Date());
  const startTime = startOfDay(date);
  const endTime = endOfDay(date);
  
  // Get all appointments for the date
  const appointments = await Appointment.find({
    date: {
      $gte: startTime,
      $lte: endTime,
    },
  });
  
  // Count slots
  const slots = getTimeSlots();
  const appointmentCounts: Record<string, number> = {};
  
  // Initialize counts
  slots.forEach(slot => {
    appointmentCounts[slot] = 0;
  });
  
  // Count existing appointments
  appointments.forEach(appointment => {
    if (appointmentCounts[appointment.time] !== undefined) {
      appointmentCounts[appointment.time]++;
    }
  });
  
  // Check if any slot is available
  return slots.some(slot => appointmentCounts[slot] < MAX_APPOINTMENTS_PER_SLOT);
}

// Function to get available slots for a specific date
async function getAvailableSlotsForDate(dateString: string) {
  const date = parse(dateString, 'yyyy-MM-dd', new Date());
  
  // Don't allow appointments on weekends
  if (isWeekend(date)) {
    return NextResponse.json(
      { error: 'Appointments are not available on weekends' },
      { status: 400 }
    );
  }
  
  const startTime = startOfDay(date);
  const endTime = endOfDay(date);
  
  // Get all appointments for the date
  const appointments = await Appointment.find({
    date: {
      $gte: startTime,
      $lte: endTime,
    },
  });
  
  // Generate available time slots
  const slots = getTimeSlots();
  const result: { time: string; available: boolean }[] = [];
  
  // Count appointments per slot
  const appointmentCounts: Record<string, number> = {};
  
  // Initialize counts
  slots.forEach(slot => {
    appointmentCounts[slot] = 0;
  });
  
  // Count existing appointments
  appointments.forEach(appointment => {
    if (appointmentCounts[appointment.time] !== undefined) {
      appointmentCounts[appointment.time]++;
    }
  });
  
  // Build the result
  slots.forEach(slot => {
    result.push({
      time: slot,
      available: appointmentCounts[slot] < MAX_APPOINTMENTS_PER_SLOT,
    });
  });
  
  return NextResponse.json({ slots: result, date: format(date, 'EEEE, MMMM d, yyyy') });
}

// Helper function to generate time slots
function getTimeSlots(): string[] {
  const slots: string[] = [];
  
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    slots.push(format(new Date().setHours(hour, 0, 0, 0), 'hh:mm a'));
  }
  
  return slots;
} 