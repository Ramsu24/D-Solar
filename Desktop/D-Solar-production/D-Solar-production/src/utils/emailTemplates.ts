/**
 * Generates the HTML for an appointment confirmation email
 */
export function getAppointmentConfirmationEmail(
  name: string,
  date: string,
  time: string,
  confirmationUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm Your D-Solar Appointment</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(to right, #f97316, #3b82f6);
      padding: 20px;
      color: white;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #fff;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(to right, #f97316, #3b82f6);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      color: #777;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>D-Solar Appointment Confirmation</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>
      <p>Thank you for scheduling an appointment with D-Solar. Please confirm your appointment by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${confirmationUrl}" class="button">Confirm Appointment</a>
      </div>
      
      <h3>Appointment Details:</h3>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      
      <p>If you did not schedule this appointment, please disregard this email.</p>
      
      <p>Thank you for choosing D-Solar for your solar energy needs!</p>
      
      <p>Best regards,<br>The D-Solar Team</p>
    </div>
    <div class="footer">
      <p>© 2023 D-Solar. All rights reserved.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates the HTML for an appointment confirmation success page
 */
export function getAppointmentConfirmationSuccessPage(
  name: string,
  date: string,
  time: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed - D-Solar</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(to right, #f97316, #3b82f6);
      padding: 30px 20px;
      color: white;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
    }
    .check-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: #4BB543;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 40px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(to right, #f97316, #3b82f6);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .details {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 20px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      color: #777;
      font-size: 12px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Confirmed</h1>
    </div>
    <div class="content">
      <div class="check-icon">✓</div>
      <h2 style="text-align: center; margin-bottom: 20px;">Thank You, ${name}!</h2>
      <p>Your appointment with D-Solar has been successfully confirmed. We look forward to meeting with you.</p>
      
      <div class="details">
        <h3>Appointment Details:</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
      </div>
      
      <p>If you need to make any changes to your appointment, please contact us at <a href="mailto:dsolarph@gmail.com">dsolarph@gmail.com</a> or call us at +63960-471-6968.</p>
      
      <div style="text-align: center;">
        <a href="https://www.d-solar.vercel.app" class="button">Return to Website</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2023 D-Solar. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates the HTML for an appointment confirmation error page
 */
export function getAppointmentConfirmationErrorPage(errorMessage: string = ''): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation Error - D-Solar</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .content { max-width: 600px; width: 100%; background-color: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(to right, #f97316, #3b82f6); padding: 30px 20px; color: white; text-align: center; }
    .error-icon { width: 80px; height: 80px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 30px auto; }
    .error-icon svg { width: 40px; height: 40px; color: #ef4444; }
    h1 { font-size: 24px; }
    h2 { font-size: 20px; margin-bottom: 16px; text-align: center; color: #4b5563; }
    .body { padding: 20px; text-align: center; }
    p { margin-bottom: 20px; color: #6b7280; }
    .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #f97316, #3b82f6); color: white; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 20px; }
    .button:hover { background: linear-gradient(to right, #ea580c, #2563eb); }
    .footer { margin-top: 20px; text-align: center; color: #9ca3af; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h1>Confirmation Error - D-Solar</h1>
      </div>
      <div class="body">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        
        <h2>Invalid or Expired Link</h2>
        
        <p>${errorMessage || 'We\'re sorry, but the appointment confirmation link you clicked is invalid or has expired.'}</p>
        
        <p>This may have happened because:</p>
        <ul style="text-align: left; max-width: 400px; margin: 0 auto; color: #6b7280;">
          <li>The link has already been used</li>
          <li>The confirmation period has expired</li>
          <li>The appointment request was cancelled</li>
        </ul>
        
        <p style="margin-top: 20px;">Please contact our support team or request a new appointment to proceed.</p>
        
        <a href="/" class="button">Return to Homepage</a>
      </div>
      <div class="footer">
        <p>&copy; 2023 D-Solar. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates the HTML for an admin notification email
 */
export function getAdminNotificationEmail(
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  date: string,
  time: string,
  message: string = ''
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Appointment Notification</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(to right, #f97316, #3b82f6);
      padding: 20px;
      color: white;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #fff;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(to right, #f97316, #3b82f6);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      color: #777;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Appointment Request</h1>
    </div>
    <div class="content">
      <p>A new customer has scheduled an appointment.</p>
      
      <h3>Customer Information:</h3>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      
      <h3>Appointment Details:</h3>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      
      ${message ? `<h3>Customer Message:</h3><p>${message}</p>` : ''}
      
      <p>Please log in to the admin dashboard to manage this appointment.</p>
      
      <div style="text-align: center;">
        <a href="https://www.d-solar.vercel.app/admin" class="button">Go to Admin Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2023 D-Solar. All rights reserved.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
} 