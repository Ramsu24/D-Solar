import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, Clock, Link } from 'lucide-react';
import { sendQuoteRequestEmail } from '../utils/emailUtils';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';

interface QuoteRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorInputs: any;
  calculationResults: any | null;
}

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({
  isOpen,
  onClose,
  calculatorInputs,
  calculationResults,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    message: '',
    captcha: '',
    appointmentDate: '',
    appointmentTime: '',
    scheduleAppointment: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  
  // Generate available appointment times
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
      const amPm = hour < 12 ? 'AM' : 'PM';
      timeSlots.push(`${hourFormatted}:00 ${amPm}`);
      if (hour < 17) {
        timeSlots.push(`${hourFormatted}:30 ${amPm}`);
      }
    }
    return timeSlots;
  };

  const timeSlots = generateTimeSlots();
  
  // Generate min and max dates for appointment scheduling
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow scheduling up to 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };
  
  // Generate a unique appointment ID
  const generateAppointmentId = () => {
    return 'appt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  };
  
  // Initialize the captcha when the form opens
  useEffect(() => {
    if (isOpen) {
      try {
        // Load the captcha engine with 6 characters
        loadCaptchaEnginge(6, 'black', 'white', 'upper');
      } catch (error) {
        console.error("Failed to load captcha:", error);
      }
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear captcha error when user types in the captcha field
    if (name === 'captcha' && captchaError) {
      setCaptchaError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the captcha
    if (!validateCaptcha(formData.captcha)) {
      setCaptchaError(true);
      setSubmitError('Please enter the correct captcha code');
      return;
    }
    
    // Validate appointment details if scheduling is requested
    if (formData.scheduleAppointment) {
      if (!formData.appointmentDate || !formData.appointmentTime) {
        setSubmitError('Please select both date and time for your appointment');
        return;
      }
    }
    
    setCaptchaError(false);
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Generate a unique appointment ID if scheduling is requested
      const newAppointmentId = formData.scheduleAppointment ? generateAppointmentId() : null;
      if (newAppointmentId) {
        setAppointmentId(newAppointmentId);
      }
      
      // Determine the base URL for confirmation link
      // For Vercel deployment, we need to use the actual domain
      const baseUrl = window.location.origin;
      console.log(`Using base URL for confirmation link: ${baseUrl}`);
      
      // Prepare the email data
      const emailData = {
        to: formData.email,
        subject: `Solar Quote Request from ${formData.fullName}`,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        message: formData.message,
        calculatorInputs: {
          electricBill: calculatorInputs?.currentBill || 'N/A',
          location: typeof calculatorInputs?.location === 'object' 
            ? calculatorInputs?.location?.address || calculatorInputs?.location?.toString() || 'N/A' 
            : calculatorInputs?.location || 'N/A',
          roofSize: calculatorInputs?.roofSize || 'N/A',
          roofType: calculatorInputs?.roofType || 'N/A',
          packageTemplate: calculatorInputs?.template || 'N/A',
          region: calculatorInputs?.region || 'N/A',
          currentBill: calculatorInputs?.currentBill || 'N/A',
          systemType: calculatorInputs?.systemType || 'standard'
        },
        calculationResults: {
          systemSize: calculationResults?.system || 'N/A',
          monthlySavings: calculationResults ? Math.round(calculationResults.savings / 300).toString() : 'N/A', // Estimated monthly savings (25-year total / 300 months)
          annualProduction: calculationResults ? Math.round(calculationResults.savings / 25 / 5).toString() : 'N/A', // Rough estimate based on savings
          installationCost: calculationResults?.installationCost || calculationResults?.totalCost || 'N/A',
          totalCost: calculationResults?.totalCost || 'N/A',
          paybackPeriod: calculationResults?.formattedPayback || 'N/A'
        },
        appointmentRequested: formData.scheduleAppointment,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        appointmentId: newAppointmentId,
        confirmationLink: newAppointmentId ? `${baseUrl}/confirm-appointment/${newAppointmentId}` : null,
      };
      
      // Use the email utility to send the email
      const success = await sendQuoteRequestEmail(emailData);
      
      if (success && formData.scheduleAppointment && newAppointmentId) {
        // Create the appointment in the database after the email is sent
        try {
          const response = await fetch('/api/appointment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.fullName,
              email: formData.email,
              phone: formData.phoneNumber,
              date: formData.appointmentDate,
              time: formData.appointmentTime,
              message: formData.message,
              confirmationToken: newAppointmentId,
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to create appointment record:', await response.text());
          } else {
            console.log('Appointment record created successfully');
          }
        } catch (appointmentError) {
          console.error('Error creating appointment:', appointmentError);
          // Continue even if creating the appointment fails
          // The user can still confirm via email link
        }
      }
      
      if (success) {
        setIsSubmitting(false);
        setSubmitSuccess(true);
      } else {
        throw new Error('Failed to send quote request');
      }
    } catch (error: any) {
      console.error('Error sending quote request:', error);
      setIsSubmitting(false);
      setSubmitError('Failed to send your quote request. Please try again later.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative p-4 sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-xl font-semibold text-center text-primary mb-6">Request A Quote</h2>
          
          {submitSuccess ? (
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quote Request Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for your interest. We'll contact you shortly to discuss your personalized solar solution.
                {formData.scheduleAppointment && (
                  <span className="block mt-2">
                    <span className="font-medium">Your appointment request for {formData.appointmentDate} at {formData.appointmentTime} has been received.</span>
                    <span className="block mt-1 text-sm">
                      Please check the email we just sent to <strong>{formData.email}</strong> - it contains a confirmation link you must click to finalize your appointment.
                    </span>
                  </span>
                )}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Appointment Scheduling Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-start mb-3">
                  <div className="flex items-center h-5">
                    <input
                      id="scheduleAppointment"
                      name="scheduleAppointment"
                      type="checkbox"
                      checked={formData.scheduleAppointment}
                      onChange={handleInputChange}
                      className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="scheduleAppointment" className="font-medium text-gray-700">
                      Schedule a Consultation Appointment
                    </label>
                    <p className="text-gray-500 text-sm">
                      Select your preferred date and time for a virtual or in-person consultation
                    </p>
                  </div>
                </div>
                
                {formData.scheduleAppointment && (
                  <div className="space-y-3 mt-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center mb-2 text-sm text-blue-600">
                      <Link size={16} className="mr-1" />
                      <span>A confirmation link will be included in your quote request email</span>
                    </div>
                    
                    <div>
                      <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="appointmentDate"
                          name="appointmentDate"
                          min={getTomorrowDate()}
                          max={getMaxDate()}
                          value={formData.appointmentDate}
                          onChange={handleInputChange}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock size={18} className="text-gray-400" />
                        </div>
                        <select
                          id="appointmentTime"
                          name="appointmentTime"
                          value={formData.appointmentTime}
                          onChange={handleInputChange}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select a time</option>
                          {timeSlots.map((time, index) => (
                            <option key={index} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        All appointment times are in your local timezone
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                      <p className="font-medium mb-1">Confirmation Process:</p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>You will receive a quote request email with appointment details</li>
                        <li>Click the confirmation button in that same email</li>
                        <li>You'll receive a calendar invitation once confirmed</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Any additional details you'd like to share"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-col items-center justify-center my-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-3">Verification Required</p>
                
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <LoadCanvasTemplate />
                  </div>
                  
                  <div className="w-full">
                    <input
                      type="text"
                      id="captcha"
                      name="captcha"
                      value={formData.captcha}
                      onChange={handleInputChange}
                      placeholder="Enter the code shown above"
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        captchaError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {captchaError && (
                      <p className="text-red-500 text-xs mt-1">Verification code is incorrect. Please try again.</p>
                    )}
                  </div>
                </div>
              </div>
              
              {submitError && !captchaError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {submitError}
                </div>
              )}
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 text-white rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting this form, you agree to our terms and privacy policy.
                We'll only use your information to process your quote request.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestForm; 