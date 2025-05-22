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
  [key: string]: any;
};

type KnowledgeCheckQuestion = {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
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
      const response = await fetchWithTimeout('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
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
      const response = await fetchWithTimeout('/api/ai/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
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
    const response = await fetchWithTimeout('/api/ai/generateWithCharacter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
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