import { NextResponse } from 'next/server';
import { Message } from '@/types/chat';
import { 
  sendTextMessage, 
  sendTypingIndicator,
  sendPackageOptions,
  sendCommonQuestions,
  sendPackageInfoAsText
} from '@/utils/messengerHelpers';

// Import the direct chat processor instead of making a fetch call
import { processChatMessage } from '@/utils/chatProcessor';

// Verify webhook (required by Facebook)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Get verification parameters from Facebook
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;
  
  // Check if token and mode are present
  if (mode && token) {
    // Check the mode and token
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      return new Response(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      return new Response('Forbidden', { status: 403 });
    }
  }
  
  return new Response('Bad Request', { status: 400 });
}

// Handle incoming messages from Facebook Messenger
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Make sure this is a page subscription
    if (body.object !== 'page') {
      return new Response('Not Found', { status: 404 });
    }
    
    console.log('Received webhook body:', JSON.stringify(body));
    
    // Process each entry
    for (const entry of body.entry) {
      // Get the webhook event
      const webhookEvent = entry.messaging[0];
      console.log('Webhook event:', JSON.stringify(webhookEvent));
      
      // Get the sender PSID
      const senderPsid = webhookEvent.sender.id;
      console.log('Sender PSID:', senderPsid);
      
      // Check if it's a message event
      if (webhookEvent.message) {
        // Process the message
        await handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        // Log postback data for debugging
        console.log('Postback received:', JSON.stringify(webhookEvent.postback));
        
        // Process the postback (button clicks, etc.)
        await handlePostback(senderPsid, webhookEvent.postback);
      }
    }
    
    // Return a '200 OK' response
    return new Response('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Handle message events
async function handleMessage(senderPsid: string, receivedMessage: any) {
  try {
    // Check if the message contains text
    if (receivedMessage.text) {
      // Show typing indicator
      await sendTypingIndicator(senderPsid, true);
      
      // Check for package-related text queries
      const messageText = receivedMessage.text.toLowerCase();
      
      // Handle direct text requests for package types
      if (messageText.includes('grid-tied packages') || messageText.includes('grid tied packages')) {
        await sendTypingIndicator(senderPsid, false);
        try {
          await sendPackageOptions(senderPsid, 'grid-tied');
        } catch (error) {
          console.error('Failed to send template, using text fallback:', error);
          await sendPackageInfoAsText(senderPsid, 'grid-tied');
        }
        return;
      } else if (messageText.includes('5kwh') || messageText.includes('5 kwh') || messageText.includes('5.12')) {
        await sendTypingIndicator(senderPsid, false);
        try {
          await sendPackageOptions(senderPsid, 'hybrid-small');
        } catch (error) {
          console.error('Failed to send template, using text fallback:', error);
          await sendPackageInfoAsText(senderPsid, 'hybrid-small');
        }
        return;
      } else if (messageText.includes('10kwh') || messageText.includes('10 kwh') || messageText.includes('10.24')) {
        await sendTypingIndicator(senderPsid, false);
        try {
          await sendPackageOptions(senderPsid, 'hybrid-large');
        } catch (error) {
          console.error('Failed to send template, using text fallback:', error);
          await sendPackageInfoAsText(senderPsid, 'hybrid-large');
        }
        return;
      } else if (messageText === 'packages' || messageText === 'solar packages') {
        await sendTypingIndicator(senderPsid, false);
        try {
          await sendPackageOptions(senderPsid, '');
        } catch (error) {
          console.error('Failed to send template, using text fallback:', error);
          await sendPackageInfoAsText(senderPsid, null);
        }
        return;
      }
      
      // Process the message using the direct chat processor for other messages
      const chatResponse = await processChatMessage(receivedMessage.text);
      
      // Turn off typing indicator
      await sendTypingIndicator(senderPsid, false);
      
      // Send the response back to the user
      await sendTextMessage(senderPsid, chatResponse.message);
      
      // If this is one of the first few messages, suggest common questions
      if (Math.random() < 0.3) { // 30% chance to show suggestions
        await sendCommonQuestions(senderPsid);
      }
    } else if (receivedMessage.attachments) {
      // Handle attachments (like images, files, etc.)
      await sendTextMessage(
        senderPsid, 
        "Thanks for sending that attachment. I'm currently only able to respond to text messages about solar energy."
      );
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await sendTextMessage(
      senderPsid, 
      "I'm sorry, I encountered an error processing your message. Please try again later."
    );
  }
}

// Handle postback events (button clicks, etc.)
async function handlePostback(senderPsid: string, receivedPostback: any) {
  try {
    // Get the payload for the postback
    const payload = receivedPostback.payload;
    console.log('Processing postback with payload:', payload);
    
    // Show typing indicator
    await sendTypingIndicator(senderPsid, true);
    
    // Handle different postback payloads
    switch (payload) {
      case 'GET_STARTED':
        await sendTypingIndicator(senderPsid, false);
        await sendTextMessage(
          senderPsid, 
          "👋 Hi! I'm D-Solar's AI assistant. How can I help you with solar energy today?"
        );
        await sendCommonQuestions(senderPsid);
        break;
        
      case 'VIEW_PACKAGES':
        await sendTypingIndicator(senderPsid, false);
        await sendTextMessage(
          senderPsid,
          "We offer various solar packages to suit your needs. Please select from the options below:"
        );
        try {
          await sendPackageOptions(senderPsid, '');
        } catch (error) {
          console.error('Failed to send template, using text fallback:', error);
          await sendPackageInfoAsText(senderPsid, null);
        }
        break;
        
      case 'PACKAGE_TYPE_GRID_TIED':
        console.log('Handling grid-tied package selection');
        await sendTypingIndicator(senderPsid, false);
        try {
          await sendPackageOptions(senderPsid, 'grid-tied');
        } catch (error) {
          console.error('Failed to send template, using text fallback:', error);
          await sendPackageInfoAsText(senderPsid, 'grid-tied');
        }
        break;
        
      case 'PACKAGE_TYPE_HYBRID_SMALL':
        console.log('Handling hybrid-small package selection');
        await sendTypingIndicator(senderPsid, false);
        try {
          await sendPackageOptions(senderPsid, 'hybrid-small');
        } catch (error) {
          console.error('Failed to send template, using text fallback:', error);
          await sendPackageInfoAsText(senderPsid, 'hybrid-small');
        }
        break;
        
      case 'PACKAGE_TYPE_HYBRID_LARGE':
        console.log('Handling hybrid-large package selection');
        await sendTypingIndicator(senderPsid, false);
        try {
          await sendPackageOptions(senderPsid, 'hybrid-large');
        } catch (error) {
          console.error('Failed to send template, using text fallback:', error);
          await sendPackageInfoAsText(senderPsid, 'hybrid-large');
        }
        break;
        
      case 'SHOW_FAQS':
        await sendTypingIndicator(senderPsid, false);
        await sendCommonQuestions(senderPsid);
        break;
        
      case 'CALCULATE_SAVINGS':
        await sendTypingIndicator(senderPsid, false);
        await sendTextMessage(
          senderPsid,
          "To calculate your potential savings, I'll need to know a bit about your electricity usage. What's your average monthly electric bill in pesos?"
        );
        break;
        
      default:
        // If the postback is related to a package inquiry, process it
        if (payload.startsWith('PACKAGE_')) {
          // Extract the package type from the payload
          let packageQuery = "";
          
          if (payload === 'PACKAGE_ONG_SMALL') {
            packageQuery = "Tell me about small grid-tied packages";
          } else if (payload === 'PACKAGE_ONG_MEDIUM') {
            packageQuery = "Tell me about medium grid-tied packages";
          } else if (payload === 'PACKAGE_ONG_LARGE') {
            packageQuery = "Tell me about large grid-tied packages";
          } else if (payload === 'PACKAGE_HYB5_SMALL') {
            packageQuery = "Tell me about small 5kWh hybrid packages";
          } else if (payload === 'PACKAGE_HYB5_MEDIUM') {
            packageQuery = "Tell me about medium 5kWh hybrid packages";
          } else if (payload === 'PACKAGE_HYB5_LARGE') {
            packageQuery = "Tell me about large 5kWh hybrid packages";
          } else if (payload === 'PACKAGE_HYB10_SMALL') {
            packageQuery = "Tell me about small 10kWh hybrid packages";
          } else if (payload === 'PACKAGE_HYB10_MEDIUM') {
            packageQuery = "Tell me about medium 10kWh hybrid packages";
          } else if (payload === 'PACKAGE_HYB10_LARGE') {
            packageQuery = "Tell me about large 10kWh hybrid packages";
          } else {
            // For other package payloads
            const packageType = payload.replace('PACKAGE_', '');
            packageQuery = `Tell me about ${packageType} packages`;
          }
          
          const chatResponse = await processChatMessage(packageQuery);
          await sendTypingIndicator(senderPsid, false);
          await sendTextMessage(senderPsid, chatResponse.message);
        } else if (payload.startsWith('FAQ_')) {
          // Handle FAQ payloads
          const faqTopic = payload.replace('FAQ_', '');
          let faqQuery = "";
          
          switch (faqTopic) {
            case 'SAVINGS':
              faqQuery = "How much money will I save with Solar?";
              break;
            case 'BATTERIES':
              faqQuery = "Do I need a battery for my solar system?";
              break;
            case 'INSTALLATION_TIME':
              faqQuery = "How long does it take to install solar panels?";
              break;
            default:
              faqQuery = faqTopic.replace(/_/g, ' ');
          }
          
          const chatResponse = await processChatMessage(faqQuery);
          await sendTypingIndicator(senderPsid, false);
          await sendTextMessage(senderPsid, chatResponse.message);
        } else {
          await sendTypingIndicator(senderPsid, false);
          await sendTextMessage(
            senderPsid, 
            "I'm not sure how to handle that request. Please try asking a question about solar energy."
          );
        }
    }
  } catch (error) {
    console.error('Error handling postback:', error);
    await sendTextMessage(
      senderPsid, 
      "I'm sorry, I encountered an error. Please try again later."
    );
  }
} 