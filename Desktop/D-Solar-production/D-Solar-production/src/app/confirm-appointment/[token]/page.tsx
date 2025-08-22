'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AppointmentConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState({
    name: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    // Get the token from the URL
    const token = params.token as string;
    
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid confirmation link. Please contact support for assistance.');
      return;
    }
    
    const confirmAppointment = async () => {
      try {
        // Call the API to confirm the appointment
        // Instead of using Next.js's API route, call the confirmation endpoint directly
        const response = await fetch(`/api/appointment/confirm?token=${token}`);
        
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Failed to confirm your appointment. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Error confirming appointment:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again or contact our support team.');
      }
    };
    
    confirmAppointment();
  }, [params.token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-blue-500 px-6 py-8 text-white text-center">
          <h1 className="text-2xl font-bold">Appointment Confirmation</h1>
        </div>
        
        <div className="p-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Processing your confirmation...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="mt-4 text-xl font-semibold text-gray-800">Appointment Confirmed!</h2>
              
              <p className="mt-2 text-gray-600">
                Thank you for confirming your solar consultation appointment.
                {appointmentDetails.date && appointmentDetails.time && (
                  <span className="block mt-1">
                    Your appointment is scheduled for <strong>{appointmentDetails.date}</strong> at <strong>{appointmentDetails.time}</strong>.
                  </span>
                )}
              </p>
              
              <p className="mt-4 text-gray-600">
                You will receive a calendar invitation shortly. Our team is looking forward to meeting with you.
              </p>
              
              <div className="mt-8">
                <Link href="/" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h2 className="mt-4 text-xl font-semibold text-gray-800">Confirmation Failed</h2>
              
              <p className="mt-2 text-gray-600">
                {errorMessage || 'We were unable to confirm your appointment. The confirmation link may have expired or is invalid.'}
              </p>
              
              <p className="mt-4 text-gray-600">
                Please contact our support team for assistance or request a new appointment.
              </p>
              
              <div className="mt-8 space-y-3">
                <Link href="/" className="block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">
                  Return to Homepage
                </Link>
                <button 
                  onClick={() => router.push('/#contact')} 
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 