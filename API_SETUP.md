# Google AI API Setup Guide

This document explains how to set up your Google AI API key for the NeurOS application.

## Option 1: Update Config File (Recommended for Development)

1. Open the file `src/config/keys.ts`
2. Replace `your_api_key_here` with your actual Google AI API key:

```typescript
export const GOOGLE_AI_API_KEY = 'your-actual-api-key-here';
```

3. Save the file and restart your development server.

## Option 2: Use Environment Variables

### Using setup script

1. Run the setup script:
```bash
node setup-env.js
```

2. Enter your API key when prompted.

3. The script will create both `.env` and `.env.local` files with your API key.

### Manual setup

1. Create a file named `.env.local` in the root of your project.
2. Add the following content:

```
GOOGLE_AI_API_KEY=your-actual-api-key-here
```

3. Save the file and restart your development server.

## How to Get a Google AI API Key

1. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Get API key"
4. Create a new API key or use an existing one
5. Copy the API key for use in this application

## Troubleshooting

If you encounter issues with the API key:

1. Verify that the API key is correctly entered without any extra spaces
2. Make sure you've restarted the development server after setting the key
3. Check the browser console for any API-related error messages
4. Ensure your API key has the necessary permissions and hasn't expired

For further assistance, please refer to the [Google AI documentation](https://ai.google.dev/docs). 