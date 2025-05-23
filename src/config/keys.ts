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
      displayName: 'GPT-4o',
      apiName: 'gpt-4o', // Latest GPT-4 Omni model
      temperature: 0.7,
      maxTokens: 800
    },
    claude: {
      displayName: 'Claude 3.5 Sonnet v2',
      apiName: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 800
    },
    // Claude 4 models (using correct model names)
    claudeOpus4: {
      displayName: 'Claude 4 Opus',
      apiName: 'claude-opus-4-20250514', // Real Claude 4 Opus
      temperature: 0.7,
      maxTokens: 800
    },
    claudeSonnet4: {
      displayName: 'Claude 4 Sonnet',
      apiName: 'claude-sonnet-4-20250514', // Real Claude 4 Sonnet
      temperature: 0.7,
      maxTokens: 800
    },
    claudeSonnet37: {
      displayName: 'Claude 3.7 Sonnet',
      apiName: 'claude-3-7-sonnet-20250219', // Real Claude 3.7 Sonnet
      temperature: 0.7,
      maxTokens: 800
    }
  }
}; 