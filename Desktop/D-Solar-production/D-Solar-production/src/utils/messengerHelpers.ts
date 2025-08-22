/**
 * Helper functions for Facebook Messenger integration
 */

// Type definitions
interface QuickReply {
  content_type: string;
  title: string;
  payload: string;
  image_url?: string;
}

interface TemplateButton {
  type: string;
  title: string;
  payload?: string;
  url?: string;
  webview_height_ratio?: string;
}

interface TemplateElement {
  title: string;
  subtitle?: string;
  image_url?: string;
  buttons?: TemplateButton[];
  default_action?: {
    type: string;
    url: string;
    webview_height_ratio: string;
  };
}

/**
 * Get the Messenger API URL
 */
export function getMessengerAPIUrl(): string {
  return `https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.MESSENGER_PAGE_ACCESS_TOKEN}`;
}

/**
 * Send a text message with optional quick replies
 */
export async function sendTextMessage(recipientId: string, text: string, quickReplies?: QuickReply[]): Promise<any> {
  try {
    // Prepare the message payload
    const messagePayload: any = {
      text: text
    };
    
    // Add quick replies if provided
    if (quickReplies && quickReplies.length > 0) {
      messagePayload.quick_replies = quickReplies;
    }
    
    const requestBody = {
      recipient: {
        id: recipientId
      },
      message: messagePayload
    };
    
    // Send the HTTP request to the Messenger Platform
    const response = await fetch(getMessengerAPIUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send message: ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Send a typing indicator
 */
export async function sendTypingIndicator(recipientId: string, typingOn: boolean = true): Promise<any> {
  try {
    const requestBody = {
      recipient: {
        id: recipientId
      },
      sender_action: typingOn ? 'typing_on' : 'typing_off'
    };
    
    const response = await fetch(getMessengerAPIUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send typing indicator: ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending typing indicator:', error);
    throw error;
  }
}

/**
 * Send a generic template message (for displaying packages)
 */
export async function sendGenericTemplate(recipientId: string, elements: TemplateElement[]): Promise<any> {
  try {
    // Ensure we don't exceed the 10 element limit
    const limitedElements = elements.slice(0, 10);
    
    console.log('Sending generic template to:', recipientId);
    console.log('Template elements:', JSON.stringify(limitedElements));
    
    const requestBody = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: limitedElements
          }
        }
      }
    };
    
    const response = await fetch(getMessengerAPIUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Failed to send generic template. Status:', response.status);
      console.error('Error response:', JSON.stringify(responseData));
      throw new Error(`Failed to send generic template: ${JSON.stringify(responseData)}`);
    }
    
    console.log('Generic template sent successfully:', JSON.stringify(responseData));
    return responseData;
  } catch (error) {
    console.error('Error sending generic template:', error);
    // If there's an error with the template, send a simple text message instead
    await sendTextMessage(
      recipientId, 
      "I'm having trouble displaying the package options. Please type 'packages' for information about our solar packages."
    );
    throw error;
  }
}

/**
 * Send a button template message
 */
export async function sendButtonTemplate(recipientId: string, text: string, buttons: TemplateButton[]): Promise<any> {
  try {
    // Ensure we don't exceed the 3 button limit
    const limitedButtons = buttons.slice(0, 3);
    
    console.log('Sending button template to:', recipientId);
    console.log('Button template text:', text);
    console.log('Buttons:', JSON.stringify(limitedButtons));
    
    const requestBody = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: text,
            buttons: limitedButtons
          }
        }
      }
    };
    
    const response = await fetch(getMessengerAPIUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Failed to send button template. Status:', response.status);
      console.error('Error response:', JSON.stringify(responseData));
      throw new Error(`Failed to send button template: ${JSON.stringify(responseData)}`);
    }
    
    console.log('Button template sent successfully:', JSON.stringify(responseData));
    return responseData;
  } catch (error) {
    console.error('Error sending button template:', error);
    // If there's an error with the template, send a simple text message instead
    await sendTextMessage(
      recipientId, 
      "I'm having trouble displaying the buttons. Please type 'packages' for information about our solar packages."
    );
    throw error;
  }
}

/**
 * Send a list of package options
 */
export async function sendPackageOptions(recipientId: string, packageType: string): Promise<any> {
  // The different package types we support
  const packageTypes: {[key: string]: {title: string, subtitle: string, buttons: TemplateButton[]}} = {
    'grid-tied': {
      title: 'Grid-Tied Systems (No Battery)',
      subtitle: 'Lower cost solar systems that work when grid power is available',
      buttons: [
        {
          type: 'postback',
          title: 'Small (3kW-5kW)',
          payload: 'PACKAGE_ONG_SMALL'
        },
        {
          type: 'postback',
          title: 'Medium (6kW-8kW)',
          payload: 'PACKAGE_ONG_MEDIUM'
        },
        {
          type: 'postback',
          title: 'Large (10kW+)',
          payload: 'PACKAGE_ONG_LARGE'
        }
      ]
    },
    'hybrid-small': {
      title: 'Hybrid Systems (5.12kWh Battery)',
      subtitle: 'Solar systems with battery backup for essential appliances',
      buttons: [
        {
          type: 'postback',
          title: 'Small (3kW-5kW)',
          payload: 'PACKAGE_HYB5_SMALL'
        },
        {
          type: 'postback',
          title: 'Medium (6kW-8kW)',
          payload: 'PACKAGE_HYB5_MEDIUM'
        },
        {
          type: 'postback',
          title: 'Large (10kW+)',
          payload: 'PACKAGE_HYB5_LARGE'
        }
      ]
    },
    'hybrid-large': {
      title: 'Hybrid Systems (10.24kWh Battery)',
      subtitle: 'Solar systems with larger battery for longer backup time',
      buttons: [
        {
          type: 'postback',
          title: 'Small (3kW-5kW)',
          payload: 'PACKAGE_HYB10_SMALL'
        },
        {
          type: 'postback',
          title: 'Medium (6kW-8kW)',
          payload: 'PACKAGE_HYB10_MEDIUM'
        },
        {
          type: 'postback',
          title: 'Large (10kW+)',
          payload: 'PACKAGE_HYB10_LARGE'
        }
      ]
    }
  };
  
  // If a valid package type is specified, show that type
  if (packageType && packageTypes[packageType]) {
    const pkg = packageTypes[packageType];
    return sendButtonTemplate(recipientId, `${pkg.title}\n${pkg.subtitle}`, pkg.buttons);
  }
  
  // Otherwise, show all package type options
  const elements: TemplateElement[] = [
    {
      title: 'Grid-Tied Systems (No Battery)',
      subtitle: 'Lower cost, requires grid power to operate',
      image_url: 'https://d-solar.ph/images/grid-tied-system.jpg',
      buttons: [
        {
          type: 'postback',
          title: 'View Grid-Tied Options',
          payload: 'PACKAGE_TYPE_GRID_TIED'
        }
      ]
    },
    {
      title: 'Hybrid Systems (5.12kWh Battery)',
      subtitle: 'Medium backup power for essential appliances',
      image_url: 'https://d-solar.ph/images/hybrid-system.jpg',
      buttons: [
        {
          type: 'postback',
          title: 'View 5kWh Options',
          payload: 'PACKAGE_TYPE_HYBRID_SMALL'
        }
      ]
    },
    {
      title: 'Hybrid Systems (10.24kWh Battery)',
      subtitle: 'Longer backup time for more appliances',
      image_url: 'https://d-solar.ph/images/hybrid-large-system.jpg',
      buttons: [
        {
          type: 'postback',
          title: 'View 10kWh Options',
          payload: 'PACKAGE_TYPE_HYBRID_LARGE'
        }
      ]
    }
  ];
  
  return sendGenericTemplate(recipientId, elements);
}

/**
 * Send common questions as quick replies
 */
export async function sendCommonQuestions(recipientId: string): Promise<any> {
  const quickReplies: QuickReply[] = [
    {
      content_type: 'text',
      title: 'How much can I save?',
      payload: 'FAQ_SAVINGS'
    },
    {
      content_type: 'text',
      title: 'View solar packages',
      payload: 'VIEW_PACKAGES'
    },
    {
      content_type: 'text',
      title: 'Do I need batteries?',
      payload: 'FAQ_BATTERIES'
    },
    {
      content_type: 'text',
      title: 'How long to install?',
      payload: 'FAQ_INSTALLATION_TIME'
    }
  ];
  
  return sendTextMessage(
    recipientId, 
    'Here are some common questions I can help with. You can also ask me anything about solar energy!',
    quickReplies
  );
}

/**
 * Send package information as plain text (fallback if templates fail)
 */
export async function sendPackageInfoAsText(recipientId: string, packageType: string | null = null): Promise<any> {
  let message = "Here's information about our solar packages:\n\n";
  
  if (!packageType || packageType === 'all') {
    message += "We offer three main types of solar systems:\n\n" +
      "1️⃣ Grid-Tied Systems (No Battery)\n" +
      "• Lower cost option\n" +
      "• Requires grid power to operate\n" +
      "• Best for areas with stable electricity\n\n" +
      
      "2️⃣ Hybrid Systems with 5.12kWh Battery\n" +
      "• Medium backup power for essential appliances\n" +
      "• Can power refrigerator, lights, fans during outages\n\n" +
      
      "3️⃣ Hybrid Systems with 10.24kWh Battery\n" +
      "• Longer backup time for more appliances\n" +
      "• Can power AC, refrigerator, and more during outages\n\n" +
      
      "Please type one of these options to learn more:\n" +
      "• 'Grid-tied packages'\n" +
      "• '5kWh hybrid packages'\n" +
      "• '10kWh hybrid packages'";
  } else if (packageType === 'grid-tied') {
    message += "Grid-Tied Solar Packages (No Battery):\n\n" +
      "• Small (3kW-5kW): Best for monthly bills of ₱3,000-5,000\n" +
      "• Medium (6kW-8kW): Best for monthly bills of ₱6,000-10,000\n" +
      "• Large (10kW+): Best for monthly bills over ₱12,000\n\n" +
      "For specific pricing, please type 'Package P1' through 'Package P5'.";
  } else if (packageType === 'hybrid-small') {
    message += "Hybrid Solar Packages with 5.12kWh Battery:\n\n" +
      "• Small (3kW-5kW): Best for monthly bills of ₱3,000-5,000\n" +
      "• Medium (6kW-8kW): Best for monthly bills of ₱6,000-10,000\n" +
      "• Large (10kW+): Best for monthly bills over ₱12,000\n\n" +
      "For specific pricing, please type 'Package P6' through 'P10'.";
  } else if (packageType === 'hybrid-large') {
    message += "Hybrid Solar Packages with 10.24kWh Battery:\n\n" +
      "• Small (3kW-5kW): Best for monthly bills of ₱3,000-5,000\n" +
      "• Medium (6kW-8kW): Best for monthly bills of ₱6,000-10,000\n" +
      "• Large (10kW+): Best for monthly bills over ₱12,000\n\n" +
      "For specific pricing, please type 'Package P11' through 'P15'.";
  }
  
  return sendTextMessage(recipientId, message);
} 