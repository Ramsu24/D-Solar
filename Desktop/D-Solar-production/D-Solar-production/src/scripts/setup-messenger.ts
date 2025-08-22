/**
 * Setup script for Facebook Messenger bot
 * 
 * This script configures the Messenger bot profile with:
 * - Greeting message
 * - Get started button
 * - Persistent menu
 * 
 * To run this script:
 * 1. Set MESSENGER_PAGE_ACCESS_TOKEN in .env.local
 * 2. Run: npx ts-node -r dotenv/config src/scripts/setup-messenger.ts
 */

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;

if (!PAGE_ACCESS_TOKEN) {
  console.error('Missing MESSENGER_PAGE_ACCESS_TOKEN in environment variables');
  process.exit(1);
}

/**
 * Sets the greeting message users see when they first open the chat
 */
async function setupGreeting() {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          greeting: [
            {
              locale: 'default',
              text: '👋 Hello! I\'m D-Solar\'s AI assistant. I can help you with information about solar energy, our packages, and how much you can save on your electricity bills.'
            }
          ]
        })
      }
    );
    
    const result = await response.json();
    
    if (result.result === 'success') {
      console.log('✅ Successfully set greeting message');
    } else {
      console.error('❌ Failed to set greeting message:', result);
    }
  } catch (error) {
    console.error('Error setting greeting message:', error);
  }
}

/**
 * Sets up the Get Started button which triggers when someone first interacts with the bot
 */
async function setupGetStarted() {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          get_started: {
            payload: 'GET_STARTED'
          }
        })
      }
    );
    
    const result = await response.json();
    
    if (result.result === 'success') {
      console.log('✅ Successfully set Get Started button');
    } else {
      console.error('❌ Failed to set Get Started button:', result);
    }
  } catch (error) {
    console.error('Error setting Get Started button:', error);
  }
}

/**
 * Sets up the persistent menu that appears in the chat
 */
async function setupPersistentMenu() {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persistent_menu: [
            {
              locale: 'default',
              composer_input_disabled: false,
              call_to_actions: [
                {
                  type: 'postback',
                  title: 'View Solar Packages',
                  payload: 'VIEW_PACKAGES'
                },
                {
                  type: 'postback',
                  title: 'Calculate Savings',
                  payload: 'CALCULATE_SAVINGS'
                },
                {
                  type: 'postback',
                  title: 'Solar Energy FAQs',
                  payload: 'SHOW_FAQS'
                },
                {
                  type: 'web_url',
                  title: 'Visit Our Website',
                  url: 'https://d-solar.ph',
                  webview_height_ratio: 'full'
                },
                {
                  type: 'web_url',
                  title: 'Contact Us',
                  url: 'https://d-solar.ph/contact',
                  webview_height_ratio: 'tall'
                }
              ]
            }
          ]
        })
      }
    );
    
    const result = await response.json();
    
    if (result.result === 'success') {
      console.log('✅ Successfully set persistent menu');
    } else {
      console.error('❌ Failed to set persistent menu:', result);
    }
  } catch (error) {
    console.error('Error setting persistent menu:', error);
  }
}

// Run all setup functions
async function setupMessengerProfile() {
  console.log('🤖 Setting up Messenger bot profile...');
  
  await setupGreeting();
  await setupGetStarted();
  await setupPersistentMenu();
  
  console.log('🎉 Finished setting up Messenger bot profile');
}

setupMessengerProfile(); 