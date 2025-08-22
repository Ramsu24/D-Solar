import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateQuoteEmailHTML } from '@/utils/emailUtils';

// Types for the email data
interface EmailData {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  message: string;
  calculatorInputs: any;
  calculationResults: any;
  appointmentRequested?: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentId?: string | null;
  confirmationLink?: string | null;
}

export async function POST(request: Request) {
  try {
    console.log('Email API called');
    const data = await request.json() as EmailData;
    const { to, subject, html, replyTo } = data;

    console.log(`Sending email to: ${to}, subject: ${subject}`);

    // Validate required fields
    if (!to || !subject || !html) {
      console.error('Missing required fields:', { to, subject, htmlLength: html?.length });
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Retrieve email password from environment variables, fallback to the hardcoded one if not available
    const emailPassword = process.env.EMAIL_PASSWORD || 'aoey duhj iqjh mhpd';
    const emailUser = process.env.EMAIL_USER || 'dsolarph@gmail.com';

    // Create a nodemailer transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      // Adding debug option to see what's happening with the connection
      debug: true,
      logger: true
    });

    // Test the connection
    try {
      console.log('Verifying email connection...');
      await transporter.verify();
      console.log('Email connection verified successfully');
    } catch (verifyError: any) {
      console.error('Failed to connect to email server:', verifyError);
      return NextResponse.json(
        { error: `Failed to connect to email server: ${verifyError.message}` }, 
        { status: 500 }
      );
    }

    // Send the email to both the customer and the company
    try {
      console.log(`Sending email to customer: ${to}`);
      
      // Send to customer
      const customerResult = await transporter.sendMail({
        from: `"D-Solar Team" <${emailUser}>`,
        to,
        subject,
        html: generateQuoteEmailHTML(data, false), // Customer template
        replyTo: emailUser // Replies go to the company
      });
      
      console.log('Email sent to customer successfully:', customerResult?.messageId);

      // Send a copy to the company
      console.log(`Sending copy to company: ${emailUser}`);
      const companyResult = await transporter.sendMail({
        from: `"D-Solar Team" <${emailUser}>`,
        to: emailUser,
        subject: `[Company Copy] ${subject}`,
        html: generateQuoteEmailHTML(data, true), // Company template
        replyTo: to // Replies go to the customer
      });
      
      console.log('Email copy sent to company successfully:', companyResult?.messageId);
      
      return NextResponse.json({ 
        success: true,
        message: 'Emails sent successfully',
        customerMessageId: customerResult?.messageId,
        companyMessageId: companyResult?.messageId
      });
    } catch (sendError: any) {
      console.error('Failed to send email:', sendError);
      return NextResponse.json(
        { error: `Failed to send email: ${sendError.message}` }, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing email request:', error);
    return NextResponse.json(
      { error: `Failed to process email request: ${error.message}` }, 
      { status: 500 }
    );
  }
} 