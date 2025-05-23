// Client-side wrapper for Google Gemini AI API calls
// This implementation makes direct API calls to a Next.js API endpoint
// that proxies requests to Google Gemini API

import { CONFIG } from '../../config/keys';

type GenerateOptions = {
  model?: string;
  system?: string | any[];
  messages?: Array<{role: string; text: string}>;
  prompt?: string;
  characterId?: string;
  temperature?: number;
  maxTokens?: number;
  count?: number;
  provider?: string; // AI provider (gemini, openai, claude, etc.)
  modelKey?: string; // Specific model key for provider
  [key: string]: any;
};

type KnowledgeCheckQuestion = {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
};

// Function to get user's selected AI provider from localStorage
const getUserAIProvider = (): { provider?: string; modelKey?: string } => {
  if (typeof window === 'undefined') return {};
  
  try {
    const learningStateJSON = localStorage.getItem('neuroosV2LearningState_v0_1_3');
    if (learningStateJSON) {
      const learningState = JSON.parse(learningStateJSON);
      const selectedProvider = learningState?.aiProvider;
      
      if (selectedProvider) {
        // Map provider keys to provider and model
        switch (selectedProvider) {
          case 'claude37':
            return { provider: 'claude', modelKey: 'claude37' };
          case 'claude4':
            return { provider: 'claude', modelKey: 'claude4' };
          case 'claudeOpus4':
            return { provider: 'claude', modelKey: 'claudeOpus4' };
          case 'claude':
            return { provider: 'claude', modelKey: 'claude' };
          case 'openai':
            return { provider: 'openai', modelKey: 'openai' };
          case 'gemini':
          default:
            return { provider: 'gemini', modelKey: 'gemini' };
        }
      }
    }
  } catch (error) {
    console.error("Error accessing user AI provider preference:", error);
  }
  
  return { provider: CONFIG.AI.provider, modelKey: CONFIG.AI.provider };
};

const fetchWithTimeout = async (url: string, options: RequestInit & { timeout?: number } = {}) => {
  const { timeout = CONFIG.AI.timeout, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const ai = {
  generate: async (options: GenerateOptions) => {
    try {
      // Get user's AI provider preference and merge with explicit options
      const userProvider = getUserAIProvider();
      const optionsWithProvider = {
        ...options,
        provider: options.provider || userProvider.provider,
        modelKey: options.modelKey || userProvider.modelKey
      };
      
      const response = await fetchWithTimeout('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optionsWithProvider),
        timeout: CONFIG.AI.timeout,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI generate API error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling AI generate API:', error);
      // Provide fallback response in case of failure
      return { 
        text: 'Sorry, I encountered an issue generating a response. Please try again later.',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
  
  run: async (options: GenerateOptions) => {
    try {
      // Get user's AI provider preference and merge with explicit options
      const userProvider = getUserAIProvider();
      const optionsWithProvider = {
        ...options,
        provider: options.provider || userProvider.provider,
        modelKey: options.modelKey || userProvider.modelKey
      };
      
      const response = await fetchWithTimeout('/api/ai/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optionsWithProvider),
        timeout: CONFIG.AI.timeout * 2, // Longer timeout for knowledge check generation
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI run API error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling AI run API:', error);
      // Fallback knowledge check questions in case of failure
      return Array(options.count || 5).fill(null).map((_, index) => ({
        question: `What is a key concept related to ${
          typeof options.system === 'string' && options.system?.includes('Title:') 
            ? options.system.split('Title:')[1]?.split('\n')[0]?.trim() 
            : 'this topic'
        }?`,
        options: [
          `Option A for question ${index + 1}`,
          `Option B for question ${index + 1}`,
          `Option C for question ${index + 1}`,
          `Option D for question ${index + 1}`,
        ],
        correctOptionIndex: 0,
        explanation: `This is a fallback question due to API connection issues. Please try again later.`,
      }));
    }
  }
};

/**
 * Extended generate function that can incorporate character personalities.
 */
export const generateWithCharacter = async (options: GenerateOptions) => {
  try {
    // Get user's AI provider preference and merge with explicit options
    const userProvider = getUserAIProvider();
    const optionsWithProvider = {
      ...options,
      provider: options.provider || userProvider.provider,
      modelKey: options.modelKey || userProvider.modelKey
    };
    
    const response = await fetchWithTimeout('/api/ai/generateWithCharacter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(optionsWithProvider),
      timeout: CONFIG.AI.timeout,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI generateWithCharacter API error: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in generateWithCharacter:', error);
    return { 
      text: 'Sorry, I encountered an issue generating a character response. Please try again later.',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Compatibility exports
export { generateWithCharacter as generate }; 