/**
 * DEVELOPMENT ONLY CONFIG TEMPLATE
 * 
 * Copy this file to keys.ts and replace the placeholder values with your actual API keys.
 * The keys.ts file is ignored by git to prevent GitHub from invalidating your keys.
 */

// Try to use environment variables first, then fall back to hardcoded defaults
export const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || 'your-google-ai-api-key-here';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';
export const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'your-claude-api-key-here';

export const CONFIG = {
  AI: {
    googleApiKey: GOOGLE_AI_API_KEY,
    openaiApiKey: OPENAI_API_KEY,
    claudeApiKey: CLAUDE_API_KEY,
    defaultModel: process.env.AI_DEFAULT_MODEL || 'gemini-pro',
    timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),
    fallbackMode: process.env.AI_FALLBACK_MODE === 'true' || true,
    provider: process.env.AI_PROVIDER || 'claude', // 'gemini', 'openai', 'claude'
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
      apiName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 800
    },
    claude: {
      displayName: 'Claude 3.5 Sonnet v2',
      apiName: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 800
    },
    claude4: {
      displayName: 'Claude 4 Sonnet',
      apiName: 'claude-3-5-sonnet-20241022', // Fallback to 3.5 until 4 is available
      temperature: 0.7,
      maxTokens: 800
    },
    claude37: {
      displayName: 'Claude 3.7 Sonnet',
      apiName: 'claude-3-5-sonnet-20241022', // Fallback to 3.5 until 3.7 is available
      temperature: 0.7,
      maxTokens: 800
    },
    claudeOpus4: {
      displayName: 'Claude 4 Opus',
      apiName: 'claude-3-5-sonnet-20241022', // Fallback to 3.5 until 4 is available
      temperature: 0.7,
      maxTokens: 800
    }
  }
}; 