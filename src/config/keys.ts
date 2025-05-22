/**
 * DEVELOPMENT ONLY CONFIG
 * 
 * This file contains API keys and is intended for development use only.
 * Replace this with proper environment variables before deploying to production.
 */

export const GOOGLE_AI_API_KEY = 'AIzaSyAHfuVIAmPz1qbyam2P71STgAqVmzGUSzA';

// You can add other API keys or configuration values here
export const CONFIG = {
  AI: {
    googleApiKey: GOOGLE_AI_API_KEY,
    defaultModel: 'googleai/gemini-1.5-flash',
    timeout: 60000,
  },
  app: {
    name: 'NeurOS',
    version: '0.1.0',
  }
}; 