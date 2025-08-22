# D-Solar Facebook Messenger Chatbot Integration

This document provides instructions for setting up and deploying the D-Solar chatbot on Facebook Messenger.

## Overview

The D-Solar Messenger chatbot leverages our existing chat API to provide solar energy information through Facebook Messenger. The chatbot supports:

- Answering questions about solar energy
- Displaying solar package information
- Providing pricing and savings estimates
- Showing quick reply suggestions
- Rich message templates for package selection

## Prerequisites

- A Facebook Page for your business
- A Facebook Developer account with admin access to the Page
- A public HTTPS endpoint for your webhook (production environment)

## Setup Steps

### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/) and create a new app
2. Select "Business" as the app type
3. Fill in the required information and create the app
4. On the Add Products screen, find "Messenger" and click "Set Up"

### 2. Configure App Settings

1. In the Messenger settings, under "Access Tokens", click "Add or Remove Pages"
2. Select your business Facebook Page and follow the prompts to give the app access
3. After connecting your page, generate a Page Access Token and copy it
4. Add the token to your `.env.local` file:
   ```
   MESSENGER_PAGE_ACCESS_TOKEN=your_page_access_token_here
   ```

### 3. Configure Webhook

1. In the Messenger settings, under "Webhooks", click "Add Callback URL"
2. Create a verify token (a random string) and add it to your `.env.local` file:
   ```
   MESSENGER_VERIFY_TOKEN=your_verify_token_here
   ```
3. Enter your webhook URL: `https://your-domain.com/api/messenger`
4. Enter your verify token in the "Verify Token" field
5. Select the following subscription fields:
   - messages
   - messaging_postbacks
   - messaging_referrals
6. Click "Verify and Save"

### 4. Deploy Your Application

1. Ensure your Next.js application is deployed to a service that provides HTTPS
2. After deployment, verify that your webhook endpoint is accessible

### 5. Set Up Messenger Profile

Run the setup script to configure your bot's profile:

```bash
# Install ts-node if you haven't already
npm install -g ts-node

# Run the setup script
npx ts-node -r dotenv/config src/scripts/setup-messenger.ts
```

This sets up:
- Greeting message
- Get Started button
- Persistent menu

## Messenger Features

### Quick Replies

The chatbot uses quick replies to suggest common questions:

- How much can I save?
- View solar packages
- Do I need batteries?
- How long to install?

### Templates

The chatbot uses Messenger templates for rich interactions:

1. **Generic Template**: Used to display package categories
2. **Button Template**: Used to display specific package options
3. **Persistent Menu**: Provides quick access to common actions

### Persistent Menu Items

- View Solar Packages
- Calculate Savings
- Solar Energy FAQs
- Visit Our Website
- Contact Us

## Testing the Bot

1. Open Messenger and search for your Facebook Page
2. Send a message to start a conversation
3. The bot should respond with a greeting and quick reply suggestions
4. Test different scenarios:
   - Ask about solar packages
   - Ask about pricing
   - Ask about savings
   - Test quick replies and buttons

## Troubleshooting

### Webhook Issues

- Ensure your webhook URL is publicly accessible with HTTPS
- Check that your verify token matches in both Facebook settings and your environment variables
- Review server logs for any webhook verification errors

### Message Delivery Issues

- Verify your Page Access Token is correct and not expired
- Check that your app has proper permissions
- Review Facebook's developer console for any error messages
- Check your server logs for API request errors

### Content Issues

- If the bot is not responding correctly, check your chat API
- Verify that your AI model is functioning properly
- Check that package information is correctly synchronized

## Additional Resources

- [Facebook Messenger Platform Documentation](https://developers.facebook.com/docs/messenger-platform)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [D-Solar Chatbot User Manual](./DSolar_Chatbot_User_Manual.md) 