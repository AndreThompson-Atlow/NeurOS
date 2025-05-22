/**
 * DEVELOPMENT ONLY CONFIG
 * 
 * This file contains API keys and is intended for development use only.
 * Replace this with proper environment variables before deploying to production.
 */

// Try to use environment variables first, then fall back to hardcoded defaults
// Using a backup key that should work with basic Gemini models
export const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || 'AIzaSyAHfuVIAmPz1qbyam2P71STgAqVmzGUSzA';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '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';
export const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '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';

// You can add other API keys or configuration values here
export const CONFIG = {
  AI: {
    googleApiKey: GOOGLE_AI_API_KEY,
    openaiApiKey: OPENAI_API_KEY,
    claudeApiKey: CLAUDE_API_KEY,
    defaultModel: process.env.AI_DEFAULT_MODEL || 'gemini-pro',
    timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),
    fallbackMode: process.env.AI_FALLBACK_MODE === 'true' || false,
    provider: process.env.AI_PROVIDER || 'gemini', // 'gemini', 'openai', or 'claude'
  },
  app: {
    name: 'NeurOS',
    version: '0.1.0',
  },
  models: {
    gemini: {
      displayName: 'Gemini 1.5 Pro',
      apiName: 'gemini-1.5-pro',
      temperature: 0.7,
      maxTokens: 800
    },
    openai: {
      displayName: 'GPT-4',
      apiName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 800
    },
    claude: {
      displayName: 'Claude 3 Opus',
      apiName: 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 800
    }
  }
}; 