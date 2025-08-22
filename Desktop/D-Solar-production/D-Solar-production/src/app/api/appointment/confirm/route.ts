import { NextResponse } from 'next/server';
import Appointment, { AppointmentStatus } from '@/models/Appointment';
import connectDB from '@/lib/mongodb';
import { isTokenExpired } from '@/utils/tokens';
import { getAppointmentConfirmationSuccessPage, getAppointmentConfirmationErrorPage, getAdminNotificationEmail } from '@/utils/emailTemplates';
import { formatDate } from '@/utils/dateUtils';

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get token from the URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    console.log('Appointment confirmation request received with token:', token);
    
    // Return error if token is missing
    if (!token) {
      console.error('Token is missing in confirmation request');
      return new NextResponse(getAppointmentConfirmationErrorPage('Missing confirmation token'), {
        status: 400,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    
    // Find the appointment with the given token
    const appointment = await Appointment.findOne({
      confirmationToken: token,
      status: AppointmentStatus.PENDING_CUSTOMER, // Only confirm if still pending customer confirmation
    });
    
    // Return error if appointment not found
    if (!appointment) {
      console.error('No appointment found with the provided token');
      return new NextResponse(getAppointmentConfirmationErrorPage('Invalid confirmation link'), {
        status: 404,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    
    console.log('Found appointment:', appointment._id);
    
    // Check if token has expired
    if (appointment.confirmationExpires && isTokenExpired(appointment.confirmationExpires)) {
      console.error('Confirmation token has expired');
      return new NextResponse(getAppointmentConfirmationErrorPage('Confirmation link expired'), {
        status: 410, // Gone - expired
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    
    // Update appointment status to pending admin confirmation
    appointment.status = AppointmentStatus.PENDING_ADMIN;
    appointment.confirmationToken = undefined; // Clear token after use
    appointment.confirmationExpires = undefined; // Clear expiration after use
    await appointment.save();
    
    console.log('Appointment updated to pending admin status');
    
    // Format the date for display
    const formattedDate = formatDate(appointment.date);
    
    // Notify admin about the confirmed appointment
    try {
      const adminEmailHtml = getAdminNotificationEmail(
        appointment.name,
        appointment.email,
        appointment.phone,
        formattedDate,
        appointment.time,
        appointment.message
      );
      
      // Determine the base URL for API call
      // For Vercel deployment, we'll use the actual domain
      const baseUrl = process.env.VERCEL
        ? 'https://d-solar-vercel.app'
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
      console.log(`Using base URL for admin notification: ${baseUrl}`);

      const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'dsolarph@gmail.com', // Admin email
          subject: 'New Appointment Confirmation',
          html: adminEmailHtml,
        }),
      });
      
      if (!emailResponse.ok) {
        console.error('Failed to send admin notification email:', await emailResponse.text());
      } else {
        console.log('Admin notification email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
      // Continue even if admin notification fails
    }
    
    // Return success page
    return new NextResponse(
      getAppointmentConfirmationSuccessPage(
        appointment.name,
        formattedDate,
        appointment.time
      ), 
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
    
  } catch (error: any) {
    console.error('Error confirming appointment:', error);
    
    // Return general error page
    return new NextResponse(getAppointmentConfirmationErrorPage(), {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
} 