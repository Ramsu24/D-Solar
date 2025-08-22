interface QuoteEmailData {
  to: string;
  subject: string;
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

// New interface for appointment confirmation emails
interface AppointmentConfirmationEmailData {
  to: string;
  name: string;
  email: string;
  date: string;
  time: string;
  confirmationToken: string;
  message?: string;
}

// In a production environment, this would be handled by a server-side API
// This is a client-side implementation for demo purposes
export const sendQuoteRequestEmail = async (data: QuoteEmailData): Promise<boolean> => {
  console.log('Preparing to send email with data:', data);
  
  try {
    // Generate HTML content for the email
    const emailHTML = generateQuoteEmailHTML(data, false);

    // Call our API endpoint to send the email
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.to,
        subject: `D-Solar Quote Request - ${data.fullName}`,
        html: emailHTML, // Include the generated HTML
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        message: data.message,
        calculatorInputs: data.calculatorInputs,
        calculationResults: data.calculationResults,
        appointmentRequested: data.appointmentRequested,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        appointmentId: data.appointmentId,
        confirmationLink: data.confirmationLink,
        replyTo: data.email, // So replies go to the customer
      }),
    });
    
    if (!response.ok) {
      // Get more detailed error information
      const errorData = await response.json().catch(() => ({}));
      console.error('Email API error:', errorData);
      throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
    }
    
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Function to send appointment confirmation emails
export const sendAppointmentConfirmationEmail = async (data: AppointmentConfirmationEmailData): Promise<boolean> => {
  console.log('Preparing to send appointment confirmation email to:', data.to);
  
  // Generate the confirmation URL
  const baseUrl = window.location.origin; // Get the base URL from the browser
  const confirmationUrl = `${baseUrl}/api/appointment/confirm?token=${data.confirmationToken}`;
  
  // Generate HTML for the email
  const emailHTML = generateAppointmentConfirmationHTML(
    data.name,
    data.date,
    data.time,
    confirmationUrl
  );
  
  try {
    // Call our API endpoint to send the email
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.to,
        subject: 'Confirm Your D-Solar Appointment',
        html: emailHTML,
        replyTo: 'dsolarph@gmail.com', // Replies go to the company
      }),
    });
    
    if (!response.ok) {
      // Get more detailed error information
      const errorData = await response.json().catch(() => ({}));
      console.error('Appointment email API error:', errorData);
      throw new Error(`Failed to send appointment email: ${response.status} ${response.statusText}`);
    }
    
    console.log('Appointment confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    return false;
  }
};

// Helper function to generate HTML for quote request emails
export function generateQuoteEmailHTML(data: QuoteEmailData, isCompanyEmail: boolean = false): string {
  // Extract location coordinates from data if available
  const defaultCoords = '121.1708,14.5833'; // Default to Metro Manila if no location
  let coordinates = defaultCoords;
  let locationAddress = 'Location to be confirmed';

  if (data.calculatorInputs?.location) {
    try {
      // Get coordinates from the location object
      if (typeof data.calculatorInputs.location === 'string') {
        // Check if it's a JSON string or a plain text address
        if (data.calculatorInputs.location.startsWith('{')) {
          // It looks like JSON, try to parse it
          const locationObj = JSON.parse(data.calculatorInputs.location);
          if (locationObj.lat && locationObj.lon) {
            coordinates = `${locationObj.lon},${locationObj.lat}`;
            locationAddress = locationObj.address || locationObj.formatted || locationObj.place_name || 'Selected location';
          }
        } else {
          // It's a plain text address
          locationAddress = data.calculatorInputs.location;
        }
      } else if (data.calculatorInputs.location.lat && data.calculatorInputs.location.lon) {
        coordinates = `${data.calculatorInputs.location.lon},${data.calculatorInputs.location.lat}`;
        locationAddress = data.calculatorInputs.location.address || 
                         data.calculatorInputs.location.formatted || 
                         data.calculatorInputs.location.place_name || 
                         'Selected location';
      }
    } catch (e) {
      console.error('Error parsing location:', e);
      // If there's an error, use the location string directly if available
      if (typeof data.calculatorInputs.location === 'string') {
        locationAddress = data.calculatorInputs.location;
      }
    }
  }

  // Generate map image URLs
  const mapImagePlaceholder = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${coordinates}&zoom=17&marker=lonlat:${coordinates};color:%23ff6a00;size:large&apiKey=0daf39d4600c41d99b4506aab0742bc9`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.split(',').reverse().join(',')}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${coordinates.split(',')[1]}&mlon=${coordinates.split(',')[0]}&zoom=17`;
  
  // Parse system size or use default values
  let systemSize = 0;
  try {
    const sizeStr = data.calculationResults?.systemSize || '';
    if (sizeStr && sizeStr !== 'N/A') {
      // Extract the numeric portion if it's a string with kWp and panel count
      const numericPart = sizeStr.toString().match(/(\d+\.?\d*)/);
      systemSize = numericPart ? parseFloat(numericPart[0]) : 0;
    } else {
      // If no valid system size, use estimate based on roof size
      const roofSize = parseFloat(data.calculatorInputs?.roofSize || '0');
      systemSize = Math.max(1, Math.round(roofSize / 10)); // Roughly 10sqm per 1kW
    }
  } catch (e) {
    // Default to 5kW if parsing fails
    systemSize = 5;
  }
  
  // Calculate environmental benefits
  const treesPlanted = Math.round(systemSize * 15); // Approximately 15 trees per kW
  const co2Reduction = Math.round(systemSize * 1.5); // Approximately 1.5 tons of CO2 per kW per year
  
  // Format installation cost with commas
  const formatCurrency = (value: string | number | undefined): string => {
    if (!value || value === 'N/A') return 'N/A';
    
    // Remove non-numeric characters and parse
    const numericValue = value.toString().replace(/[^0-9.]/g, '');
    if (!numericValue) return 'N/A';
    
    // Parse to number and format with commas
    const num = parseFloat(numericValue);
    if (isNaN(num)) return 'N/A';
    
    // Format with commas
    return num.toLocaleString('en-PH');
  };
  
  // Get region name from code
  const getRegionName = (regionCode: string | undefined): string => {
    if (!regionCode) return 'N/A';
    
    const regionNames: Record<string, string> = {
      'metro-manila': 'Metro Manila',
      'central-luzon': 'Central Luzon',
      'calabarzon': 'CALABARZON',
      'northern-luzon': 'Northern Luzon',
      'southern-luzon': 'Southern Luzon'
    };
    
    return regionNames[regionCode] || regionCode;
  };
  
  // Determine system type icon and description
  const getSystemTypeDetails = (type: string | undefined) => {
    if (!type || type === 'N/A' || type === 'standard') {
      return {
        icon: '🔌',
        name: 'Standard System',
        description: 'A standard solar system will be recommended based on your needs.'
      };
    }
    
    switch(type.toLowerCase()) {
      case 'ongrid':
        return {
          icon: '🔌',
          name: 'On-Grid System',
          description: 'Connected to the utility grid, allowing excess energy to be sold back.'
        };
      case 'hybrid':
        return {
          icon: '🔋',
          name: 'Hybrid System',
          description: 'Combines grid connection with battery storage for better energy independence.'
        };
      case 'offgrid':
        return {
          icon: '🏝️',
          name: 'Off-Grid System',
          description: 'Completely independent from the utility grid with battery storage.'
        };
      default:
        return {
          icon: '☀️',
          name: type,
          description: 'Custom solar system configuration.'
        };
    }
  };
  
  const systemTypeDetails = getSystemTypeDetails(data.calculatorInputs?.systemType);
  
  // Format roof size with units
  const formatRoofSize = (size: string | number | undefined): string => {
    if (!size || size === 'N/A') return 'N/A';
    return `${size} sqm`;
  };
  
  // Format payback period
  const formatPaybackPeriod = (period: string | undefined): string => {
    if (!period || period === 'N/A') return 'N/A';
    return period;
  };
  
  // Get roof type description
  const getRoofTypeDescription = (roofType: string | undefined): string => {
    if (!roofType) return 'To be determined during consultation';
    
    switch(roofType.toLowerCase()) {
      case 'concrete':
        return 'Installation on concrete roofs requires metal structures for mounting the solar panels. This typically adds about 20% to the total package cost due to the additional materials and labor needed for proper structural support.';
      case 'metal':
        return 'Installation on metal tin roofs is straightforward with regular installation methods. There\'s no additional cost as the panels can be mounted directly to the metal surface using standard mounting hardware.';
      default:
        return 'Our team will evaluate your roof type during the consultation to determine the most appropriate installation method.';
    }
  };
  
  // Get technical specifications based on system type
  interface TechnicalSpecs {
    panelType: string;
    panelCount: string;
    inverterType: string;
    mountingSystem: string;
    warranty: string;
    certification: string;
    monitoring: string;
    gridConnection?: string;
    batterySystem?: string;
    batteryCapacity?: string;
    additionalFeatures?: string;
  }
  
  const getTechnicalSpecs = (systemType: string | undefined, systemSize: number): TechnicalSpecs => {
    const panelCount = Math.ceil(systemSize * 3); // Approximately 3 panels per kW
    const inverterSize = systemSize > 5 ? 'Multiple string inverters' : 'Single string inverter';
    
    const baseSpecs: TechnicalSpecs = {
      panelType: 'High-efficiency monocrystalline panels (450W)',
      panelCount: `${panelCount} panels`,
      inverterType: inverterSize,
      mountingSystem: data.calculatorInputs?.roofType === 'concrete' ? 'Concrete roof mounting system' : 'Standard metal roof mounting system',
      warranty: '25-year performance warranty on panels, 10-year warranty on inverter',
      certification: 'All components certified to international standards (IEC, UL)',
      monitoring: 'Web and mobile app monitoring system included'
    };
    
    if (!systemType || systemType === 'N/A') {
      return baseSpecs;
    }
    
    switch(systemType.toLowerCase()) {
      case 'ongrid':
        return {
          ...baseSpecs,
          gridConnection: 'Net metering ready with bidirectional meter',
          batterySystem: 'None (tied directly to grid)',
          additionalFeatures: 'Anti-islanding protection, surge protection'
        };
      case 'hybrid':
        return {
          ...baseSpecs,
          gridConnection: 'Grid-tied with battery backup',
          batterySystem: 'Lithium-ion battery storage (scalable capacity)',
          batteryCapacity: `${Math.round(systemSize * 5)} kWh storage capacity`,
          additionalFeatures: 'Automatic transfer switch, priority load panel'
        };
      case 'offgrid':
        return {
          ...baseSpecs,
          gridConnection: 'No grid connection',
          batterySystem: 'High-capacity lithium-ion battery bank',
          batteryCapacity: `${Math.round(systemSize * 10)} kWh storage capacity`,
          additionalFeatures: 'Charge controller, expanded battery storage, backup generator integration options'
        };
      default:
        return baseSpecs;
    }
  };
  
  // Get financial information
  const getFinancialInfo = (totalCost: string | number | undefined, monthlySavings: string | number | undefined) => {
    const costValue = totalCost ? parseFloat(totalCost.toString().replace(/[^0-9]/g, '')) : 0;
    const monthlyValue = monthlySavings ? parseFloat(monthlySavings.toString().replace(/[^0-9]/g, '')) : 0;
    
    // Calculate ROI if we have valid numbers
    const roi = costValue > 0 && monthlyValue > 0 
      ? Math.round((monthlyValue * 12 * 100) / costValue * 10) / 10 
      : 0;
    
    return {
      roi: `${roi}% annual return on investment`,
      financingOptions: 'Flexible payment options available (full payment, installment, or loan financing)',
      taxBenefits: 'May qualify for tax incentives (consult with a tax professional)',
      propertyValue: 'Typically increases property value by 3-4%',
      breakEven: data.calculationResults?.paybackPeriod || 'To be determined',
      monthlyBillReduction: monthlyValue > 0 ? `Approximately ₱${formatCurrency(monthlyValue)} reduction in monthly electric bills` : 'Significant reduction in monthly electric bills'
    };
  };
  
  // Get installation timeline
  const getInstallationTimeline = () => {
    return {
      siteAssessment: '1-2 days (on-site evaluation and finalization of system design)',
      permitAcquisition: '1-3 weeks (dependent on local regulations)',
      equipmentProcurement: '2-4 weeks (ordering and delivery of components)',
      installation: '1-3 days (standard residential installation)',
      inspection: '1 week (system testing and quality assurance)',
      gridConnection: data.calculatorInputs?.systemType?.toLowerCase() === 'offgrid' ? 'Not applicable' : '1-2 weeks (utility approval and meter installation)',
      totalEstimate: '4-8 weeks from contract signing to system activation'
    };
  };
  
  // Get additional benefits
  const getAdditionalBenefits = () => {
    return [
      'Energy Independence: Reduced reliance on the utility grid and protection from power outages',
      'Fixed Energy Costs: Protection from rising electricity rates and long-term energy cost predictability',
      'Low Maintenance: Solar systems require minimal maintenance with no moving parts',
      'Quiet Operation: Solar systems operate silently with no noise pollution',
      `Remote Monitoring: Track your system's performance from anywhere using our mobile app`,
      'Scalable Design: System can be expanded in the future as your energy needs grow'
    ];
  };
  
  const technicalSpecs = getTechnicalSpecs(data.calculatorInputs?.systemType, systemSize);
  const financialInfo = getFinancialInfo(data.calculationResults?.totalCost, data.calculationResults?.monthlySavings);
  const installationTimeline = getInstallationTimeline();
  const additionalBenefits = getAdditionalBenefits();
  
  // You can customize this HTML template as needed
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Solar Quote Request</title>
      <style>
        /* Base styles */
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f97316 10%, #fb923c 50%, #3b82f6 100%); padding: 35px 20px; color: white; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .header-logo { margin-bottom: 15px; max-width: 120px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
        .content { padding: 30px 25px; }
        .footer { background-color: #1e293b; padding: 25px; text-align: center; color: #e2e8f0; font-size: 12px; }
        
        /* Section styles */
        .section { margin-bottom: 30px; background-color: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 3px 10px rgba(0,0,0,0.06); }
        .section-header { background-color: #f1f5f9; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
        .section-header h3 { margin: 0; color: #1e293b; font-size: 18px; display: flex; align-items: center; gap: 8px; }
        .section-content { padding: 20px; }
        
        /* UI components */
        .highlight-box { background-color: #fff7ed; padding: 20px; border-left: 4px solid #f97316; margin: 15px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .data-row { display: flex; justify-content: space-between; margin-bottom: 14px; align-items: center; }
        .data-row:last-child { margin-bottom: 0; }
        .data-label { font-weight: 500; color: #4b5563; flex: 1; }
        .data-value { font-weight: 600; color: #1e293b; text-align: right; flex: 1; }
        
        .eco-benefits { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px; }
        .eco-benefit-item { flex: 1; min-width: 150px; background-color: #ecfdf5; padding: 18px; border-radius: 10px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .eco-benefit-value { font-size: 30px; font-weight: bold; color: #059669; margin: 10px 0; }
        .eco-benefit-label { color: #065f46; font-weight: 500; }
        .eco-benefit-unit { color: #065f46; font-size: 14px; }
        
        .map-section { margin-bottom: 30px; }
        .map-container { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-top: 15px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        .location-button { display: inline-block; padding: 12px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 15px; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .location-button:hover { background-color: #ea580c; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .map-buttons { display: flex; gap: 12px; margin-top: 15px; flex-wrap: wrap; }
        
        .price-tag { font-size: 30px; font-weight: 700; color: #f97316; margin: 10px 0; display: block; }
        .price-note { font-size: 13px; color: #64748b; }
        
        .system-type-card { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px; margin-top: 15px; display: flex; align-items: flex-start; gap: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .system-type-icon { font-size: 28px; }
        .system-type-info { flex: 1; }
        .system-type-name { font-weight: 600; color: #1e40af; margin-bottom: 5px; }
        .system-type-desc { font-size: 14px; color: #1e3a8a; }
        
        .appointment-section { margin-top: 30px; padding: 25px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
        .button { display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #f97316, #3b82f6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 0; text-align: center; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button:hover { opacity: 0.95; transform: translateY(-2px); box-shadow: 0 6px 10px rgba(0,0,0,0.15); }
        
        .specs-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .specs-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .specs-table tr:last-child td { border-bottom: none; }
        .specs-table tr:nth-child(odd) { background-color: #f8fafc; }
        .specs-table td:first-child { font-weight: 500; color: #4b5563; width: 40%; }
        .specs-table td:last-child { color: #1e293b; }
        
        .section.timeline-section {
          background-color: #f8fafc;
          border: none;
          box-shadow: none;
        }
        .timeline-item { 
          display: flex; 
          margin-bottom: 30px; 
          align-items: flex-start;
        }
        .timeline-marker { 
          flex: 0 0 30px; 
          height: 30px; 
          background: linear-gradient(135deg, #93c5fd, #60a5fa); 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #ffffff; 
          font-weight: bold; 
          margin-right: 20px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
        }
        .timeline-marker::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 45px;
          background: linear-gradient(to bottom, #93c5fd, #dbeafe);
          display: block;
        }
        .timeline-item:last-child .timeline-marker::after {
          display: none;
        }
        .timeline-content { 
          flex: 1; 
          padding-top: 3px;
        }
        .timeline-title { 
          font-weight: 600; 
          color: #1e40af; 
          margin-bottom: 8px; 
          font-size: 18px;
        }
        .timeline-desc { 
          font-size: 15px; 
          color: #475569; 
          line-height: 1.5;
        }
        
        .benefits-list { list-style-type: none; padding: 0; margin: 15px 0 0 0; }
        .benefits-list li { padding: 12px 18px; margin-bottom: 12px; background-color: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 0 8px 8px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        
        .section-divider { height: 2px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 30px 0; }
        
        /* Mobile responsiveness */
        @media screen and (max-width: 480px) {
          .content { padding: 20px 15px; }
          .data-row { flex-direction: column; align-items: flex-start; margin-bottom: 15px; }
          .data-value { text-align: left; margin-top: 5px; }
          .map-buttons { flex-direction: column; }
          .eco-benefits { flex-direction: column; }
          .eco-benefit-item { min-width: auto; }
          .system-type-card { flex-direction: column; }
          .system-type-icon { margin-bottom: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-logo">
            <img src="https://dsolar.ph/dsolar-logo-white.png" alt="D-Solar Logo" width="120" height="auto" style="display: block; margin: 0 auto;">
          </div>
          <h1>${isCompanyEmail ? 'New Solar Quote Request' : 'Your Solar Quote Request'}</h1>
        </div>
        <div class="content">
          ${isCompanyEmail ? `
            <p>You have received a quote request from ${data.fullName}.</p>
            <div class="section">
              <div class="section-header">
                <h3>📋 Contact Information</h3>
              </div>
              <div class="section-content">
                <div class="data-row">
                  <span class="data-label">Name:</span>
                  <span class="data-value">${data.fullName}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Email:</span>
                  <span class="data-value">${data.email}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Phone:</span>
                  <span class="data-value">${data.phoneNumber}</span>
                </div>
              </div>
            </div>
          ` : `
            <p>Dear ${data.fullName},</p>
            <p>Thank you for your interest in solar energy solutions. We've received your quote request and will review it shortly.</p>
            <p>Here's a summary of your solar system request:</p>
          `}
          
          ${data.message ? `
          <div class="section">
            <div class="section-header">
              <h3>💬 ${isCompanyEmail ? 'Customer Message:' : 'Your Message:'}</h3>
            </div>
            <div class="section-content">
              <p>${data.message}</p>
            </div>
          </div>
          ` : ''}
          
          <div class="map-section">
            <div class="section-header">
              <h3>📍 Installation Site</h3>
            </div>
            <div class="section-content">
              <p style="margin-top: 0;">${locationAddress}</p>
              <div class="map-container">
                <img src="${mapImagePlaceholder}" alt="Map of Installation Location" style="width: 100%; display: block;">
              </div>
              <div class="map-buttons">
                <a href="${googleMapsUrl}" class="location-button" target="_blank">View on Google Maps</a>
                <a href="${openStreetMapUrl}" class="location-button" style="background-color: #3b82f6;" target="_blank">View on OpenStreetMap</a>
              </div>
            </div>
          </div>
          
          <div class="section-divider"></div>
          
          <div class="section">
            <div class="section-header">
              <h3>📊 Calculator Inputs</h3>
            </div>
            <div class="section-content">
              <div class="data-row">
                <span class="data-label">Electric Bill:</span>
                <span class="data-value">${data.calculatorInputs?.electricBill && data.calculatorInputs?.electricBill !== 'N/A' ? `₱${formatCurrency(data.calculatorInputs?.electricBill)}/month` : 'Not provided'}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Roof Size:</span>
                <span class="data-value">${formatRoofSize(data.calculatorInputs?.roofSize)}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Roof Type:</span>
                <span class="data-value">${data.calculatorInputs?.roofType || 'N/A'}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Package Template:</span>
                <span class="data-value">${data.calculatorInputs?.packageTemplate || 'Standard'}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Region:</span>
                <span class="data-value">${getRegionName(data.calculatorInputs?.region)}</span>
              </div>
              
              <div class="system-type-card">
                <div class="system-type-icon">${systemTypeDetails.icon}</div>
                <div class="system-type-info">
                  <div class="system-type-name">${systemTypeDetails.name}</div>
                  <div class="system-type-desc">${systemTypeDetails.description}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">
              <h3>📈 Calculation Results</h3>
            </div>
            <div class="section-content">
              <div class="data-row">
                <span class="data-label">Recommended System Size:</span>
                <span class="data-value">${data.calculationResults?.systemSize || 'Not calculated'}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Estimated Monthly Savings:</span>
                <span class="data-value">${data.calculationResults?.monthlySavings && data.calculationResults?.monthlySavings !== 'N/A' ? `₱${formatCurrency(data.calculationResults?.monthlySavings)}` : 'Not calculated'}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Estimated Annual Production:</span>
                <span class="data-value">${data.calculationResults?.annualProduction && data.calculationResults?.annualProduction !== 'N/A' ? `${data.calculationResults?.annualProduction} kWh` : 'Not calculated'}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Total System Cost:</span>
                <span class="data-value">${data.calculationResults?.totalCost && data.calculationResults?.totalCost !== 'N/A' ? `₱${formatCurrency(data.calculationResults?.totalCost)}` : 'Not calculated'}</span>
              </div>
              
              <div class="highlight-box">
                <span class="price-tag">${data.calculationResults?.installationCost && data.calculationResults?.installationCost !== 'N/A' ? `₱${formatCurrency(data.calculationResults?.installationCost)}` : 'Custom quote required'}</span>
                <div class="data-row">
                  <span class="data-label">Estimated Payback Period:</span>
                  <span class="data-value">${formatPaybackPeriod(data.calculationResults?.paybackPeriod) || 'To be determined'}</span>
                </div>
                <p class="price-note">* Final price may vary based on site inspection and system requirements</p>
              </div>
              
              <h4 style="margin-top: 25px; margin-bottom: 10px; color: #065f46;">Environmental Benefits</h4>
              <div class="eco-benefits">
                <div class="eco-benefit-item">
                  <div class="eco-benefit-label">CO₂ Reduction</div>
                  <div class="eco-benefit-value">${co2Reduction}</div>
                  <div class="eco-benefit-unit">tons/year</div>
                </div>
                <div class="eco-benefit-item">
                  <div class="eco-benefit-label">Equivalent to</div>
                  <div class="eco-benefit-value">${treesPlanted}</div>
                  <div class="eco-benefit-unit">trees planted</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section-divider"></div>
          
          <div class="section">
            <div class="section-header">
              <h3>🔧 Installation Notes</h3>
            </div>
            <div class="section-content">
              <p>${getRoofTypeDescription(data.calculatorInputs?.roofType)}</p>
              
              <p style="margin-top: 15px;"><strong>Regional Information:</strong> ${
                data.calculatorInputs?.region === 'metro-manila' ? 'No additional transport and mobilization costs for Metro Manila installations.' :
                data.calculatorInputs?.region === 'central-luzon' ? 'Additional fees for transport and mobilization to Central Luzon area.' :
                data.calculatorInputs?.region === 'calabarzon' ? 'Additional fees for transport and mobilization to CALABARZON area.' :
                data.calculatorInputs?.region === 'northern-luzon' ? 'Additional fees for transport and mobilization to Northern Luzon area.' :
                data.calculatorInputs?.region === 'southern-luzon' ? 'Additional fees for transport and mobilization to Southern Luzon area.' :
                'Transport and mobilization fees will be calculated based on your location.'
              }</p>
              
              <p style="margin-top: 15px;"><strong>System Efficiency:</strong> The recommended system is designed to operate at optimal efficiency based on your location's solar irradiance and your electricity consumption patterns.</p>
            </div>
          </div>
          
          <div class="section-divider"></div>
          
          <!-- New sections with additional information -->
          <div class="section">
            <div class="section-header">
              <h3>⚙️ Technical Specifications</h3>
            </div>
            <div class="section-content">
              <table class="specs-table">
                <tr>
                  <td>Solar Panels</td>
                  <td>${technicalSpecs.panelType}</td>
                </tr>
                <tr>
                  <td>Panel Count</td>
                  <td>${technicalSpecs.panelCount}</td>
                </tr>
                <tr>
                  <td>Inverter System</td>
                  <td>${technicalSpecs.inverterType}</td>
                </tr>
                <tr>
                  <td>Mounting System</td>
                  <td>${technicalSpecs.mountingSystem}</td>
                </tr>
                ${technicalSpecs.batterySystem ? `
                <tr>
                  <td>Battery System</td>
                  <td>${technicalSpecs.batterySystem}</td>
                </tr>
                ` : ''}
                ${technicalSpecs.batteryCapacity ? `
                <tr>
                  <td>Battery Capacity</td>
                  <td>${technicalSpecs.batteryCapacity}</td>
                </tr>
                ` : ''}
                <tr>
                  <td>Grid Connection</td>
                  <td>${technicalSpecs.gridConnection || 'Standard grid connection with net metering'}</td>
                </tr>
                <tr>
                  <td>Monitoring System</td>
                  <td>${technicalSpecs.monitoring}</td>
                </tr>
                <tr>
                  <td>Warranty</td>
                  <td>${technicalSpecs.warranty}</td>
                </tr>
              </table>
              <p style="margin-top: 15px; font-size: 13px; color: #64748b;">* Final specifications may vary based on property assessment and system requirements</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">
              <h3>💰 Financial Information</h3>
            </div>
            <div class="section-content">
              <div class="data-row">
                <span class="data-label">ROI:</span>
                <span class="data-value">${financialInfo.roi}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Breakeven Point:</span>
                <span class="data-value">${financialInfo.breakEven}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Monthly Savings:</span>
                <span class="data-value">${financialInfo.monthlyBillReduction}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Property Value:</span>
                <span class="data-value">${financialInfo.propertyValue}</span>
              </div>
              
              <div class="highlight-box" style="background-color: #eff6ff; border-color: #3b82f6;">
                <h4 style="margin-top: 0; color: #1e40af;">Financing Options Available</h4>
                <p>We offer flexible payment solutions to make solar accessible:</p>
                <ul style="margin-top: 10px;">
                  <li>Full payment with discounts</li>
                  <li>12-60 month installment plans</li>
                  <li>Solar loan with partner banks</li>
                </ul>
                <p style="margin-top: 10px; font-size: 13px;">Our solar consultant will discuss financing options during your consultation.</p>
              </div>
            </div>
          </div>
          
          <div class="section-divider"></div>
          
          <div class="section timeline-section">
            <div class="section-header">
              <h3>⏱️ Installation Process & Timeline</h3>
            </div>
            <div class="section-content">
              <div class="timeline-item">
                <div class="timeline-marker">1</div>
                <div class="timeline-content">
                  <div class="timeline-title">Site Assessment</div>
                  <div class="timeline-desc">1-2 days (on-site evaluation and finalization of system design)</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker">2</div>
                <div class="timeline-content">
                  <div class="timeline-title">Permits & Approvals</div>
                  <div class="timeline-desc">1-3 weeks (dependent on local regulations)</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker">3</div>
                <div class="timeline-content">
                  <div class="timeline-title">Equipment Procurement</div>
                  <div class="timeline-desc">2-4 weeks (ordering and delivery of components)</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker">4</div>
                <div class="timeline-content">
                  <div class="timeline-title">Installation</div>
                  <div class="timeline-desc">1-3 days (standard residential installation)</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker">5</div>
                <div class="timeline-content">
                  <div class="timeline-title">Inspection & Testing</div>
                  <div class="timeline-desc">1 week (system testing and quality assurance)</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker">6</div>
                <div class="timeline-content">
                  <div class="timeline-title">Grid Connection & Activation</div>
                  <div class="timeline-desc">1-2 weeks (utility approval and meter installation)</div>
                </div>
              </div>
              
              <p style="margin-top: 20px; font-weight: 600;">Total Timeline: 4-8 weeks from contract signing to system activation</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">
              <h3>⭐ Additional Benefits</h3>
            </div>
            <div class="section-content">
              <ul class="benefits-list">
                ${additionalBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
              </ul>
              
              <div style="margin-top: 20px; padding: 18px; background-color: #ecfdf5; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h4 style="margin-top: 0; color: #065f46;">Live Performance Monitoring</h4>
                <p>Your solar system includes our easy-to-use monitoring platform that allows you to:</p>
                <ul style="margin-top: 10px;">
                  <li>Track real-time energy production</li>
                  <li>Monitor savings and environmental impact</li>
                  <li>Receive alerts for system issues</li>
                  <li>Access via web browser or mobile app</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="section-divider"></div>
          
          ${data.appointmentRequested ? `
          <div class="appointment-section">
            <h3 style="margin-top: 0;">📅 Appointment Request</h3>
            <p>${isCompanyEmail ? 'The customer has requested an appointment for:' : 'You have requested an appointment for:'}</p>
            <p><strong>Date:</strong> ${data.appointmentDate}</p>
            <p><strong>Time:</strong> ${data.appointmentTime}</p>
            
            ${data.confirmationLink && !isCompanyEmail ? `
            <p style="margin-top: 15px;"><strong>Please confirm your appointment by clicking the button below:</strong></p>
            <div style="text-align: center;">
              <a href="${data.confirmationLink}" class="button">Confirm Appointment</a>
            </div>
            <p style="font-size: 12px; margin-top: 10px;">If the button does not work, copy and paste this URL into your browser: ${data.confirmationLink}</p>
            ` : ''}
            
            <div style="margin-top: 15px; padding: 18px; background-color: #fff; border-radius: 10px; border: 1px dashed #bae6fd; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
              <h4 style="margin-top: 0; color: #0369a1;">What to Expect During Your Consultation</h4>
              <ul style="margin-top: 10px; padding-left: 20px;">
                <li>Detailed assessment of your property's solar potential</li>
                <li>Review of your energy consumption patterns</li>
                <li>Customized system design presentation</li>
                <li>Discussion of financial options and incentives</li>
                <li>Timeline for installation and activation</li>
                <li>Opportunity to ask any questions about solar energy</li>
              </ul>
              <p style="margin-top: 10px;">The consultation typically takes about 60-90 minutes.</p>
            </div>
          </div>
          ` : ''}
          
          <div class="section">
            <div class="section-header">
              <h3>📝 Warranty & Support</h3>
            </div>
            <div class="section-content">
              <p>Your D-Solar system includes comprehensive warranty coverage:</p>
              <ul style="margin-top: 10px;">
                <li><strong>25-year performance warranty</strong> on solar panels</li>
                <li><strong>10-year manufacturer warranty</strong> on inverters</li>
                <li><strong>10-year warranty</strong> on workmanship and installation</li>
                <li><strong>5-year warranty</strong> on monitoring equipment</li>
                ${data.calculatorInputs?.systemType?.toLowerCase() === 'hybrid' || data.calculatorInputs?.systemType?.toLowerCase() === 'offgrid' ? 
                  '<li><strong>10-year warranty</strong> on battery system (conditions apply)</li>' : ''}
              </ul>
              
              <div style="margin-top: 18px; padding: 18px; background-color: #f8fafc; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <h4 style="margin-top: 0; color: #334155;">Dedicated Support</h4>
                <p>As a D-Solar customer, you'll receive:</p>
                <ul style="margin-top: 10px;">
                  <li>24/7 system monitoring and alerts</li>
                  <li>Annual maintenance check-up</li>
                  <li>Priority customer support</li>
                  <li>Performance guarantee</li>
                </ul>
              </div>
            </div>
          </div>
          
          ${!isCompanyEmail ? `
            <div class="section-divider"></div>
            <p style="margin-top: 25px;">Our team will review your request and get back to you shortly with a detailed quote and options for your solar installation.</p>
            <p>If you have any questions in the meantime, please don't hesitate to contact us at <a href="mailto:dsolarph@gmail.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">dsolarph@gmail.com</a>.</p>
          ` : ''}
        </div>
        <div class="footer">
          <p style="font-size: 14px; margin-bottom: 8px;">© 2025 D-Solar. All rights reserved.</p>
          <p style="margin: 5px 0; color: #94a3b8;">This email was sent in response to your quote request.</p>
          <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">D-Solar Philippines | No.30-C Westbend Arcade, Dona Soledad Avenue, Paranaque City | +63-288-317-330 | <a href="https://dsolar.ph" style="color: #60a5fa; text-decoration: none;">dsolar.ph</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to generate HTML for appointment confirmation emails
function generateAppointmentConfirmationHTML(
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
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background: linear-gradient(to right, #f97316, #3b82f6);
        padding: 30px 20px;
        color: white;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .header-logo {
        margin-bottom: 15px;
      }
      .content {
        padding: 30px;
        background-color: #fff;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 5px 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      .button {
        display: inline-block;
        padding: 12px 30px;
        background: linear-gradient(to right, #f97316, #3b82f6);
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        margin: 20px 0;
      }
      .appointment-details {
        margin: 20px 0;
        padding: 15px;
        background-color: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 5px;
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
        <div class="header-logo">
          <img src="https://dsolar.ph/dsolar-logo-white.png" alt="D-Solar Logo" width="120" height="auto" style="display: block; margin: 0 auto;">
        </div>
        <h1>D-Solar Appointment Confirmation</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thank you for scheduling an appointment with D-Solar. Please confirm your appointment by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${confirmationUrl}" class="button">Confirm Appointment</a>
        </div>
        
        <div class="appointment-details">
          <h3 style="margin-top: 0; color: #0369a1;">Appointment Details:</h3>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Location:</strong> Virtual consultation or at your property as specified</p>
        </div>
        
        <p>If you did not schedule this appointment, please disregard this email.</p>
        
        <p>Thank you for choosing D-Solar for your solar energy needs!</p>
        
        <p>Best regards,<br>The D-Solar Team</p>
      </div>
      <div class="footer">
        <p>© 2023 D-Solar. All rights reserved.</p>
        <p>This is an automated email, please do not reply.</p>
        <p style="margin-top: 5px; font-size: 11px;">D-Solar Philippines | 123 Solar Avenue, Makati City | (02) 8123-4567 | <a href="https://dsolar.ph" style="color: #3b82f6; text-decoration: none;">dsolar.ph</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
} 