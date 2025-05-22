/**
 * Runtime environment variable checker for API
 * This helps identify if environment variables are properly loaded
 */

export const ENV = {
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? 
    `${process.env.GOOGLE_AI_API_KEY.substring(0, 5)}...${process.env.GOOGLE_AI_API_KEY.substring(process.env.GOOGLE_AI_API_KEY.length - 5)}` : undefined,
  GOOGLE_AI_KEY_LENGTH: process.env.GOOGLE_AI_API_KEY?.length,
  AI_DEFAULT_MODEL: process.env.AI_DEFAULT_MODEL,
  AI_TIMEOUT: process.env.AI_TIMEOUT,
  AI_FALLBACK_MODE: process.env.AI_FALLBACK_MODE,
  NODE_ENV: process.env.NODE_ENV
};

// Log environment availability on server startup
console.log('API Environment Check:', {
  GOOGLE_AI_KEY_SET: !!process.env.GOOGLE_AI_API_KEY,
  GOOGLE_AI_KEY_LENGTH: process.env.GOOGLE_AI_API_KEY?.length,
  AI_MODEL_SET: !!process.env.AI_DEFAULT_MODEL,
  NODE_ENV: process.env.NODE_ENV
}); 