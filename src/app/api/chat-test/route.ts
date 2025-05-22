import { NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { CONFIG } from '@/config/keys';

// API key directly for testing
const apiKey = CONFIG.AI.googleApiKey || process.env.GOOGLE_AI_API_KEY || '';

const testAi = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    })
  ],
});

export async function GET() {
  try {
    // Log API key details (safely)
    console.log("Chat test API key:", {
      present: !!apiKey,
      length: apiKey.length,
      starts: apiKey.substring(0, 3),
      ends: apiKey.substring(apiKey.length - 3),
    });
    
    // Make a direct call to Gemini
    const result = await testAi.generate("Please respond with 'Hello, I am working!'");
    
    const response = (result as any)?.response?.candidates?.()?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({
      working: !!response,
      response: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Chat test API failed:", error);
    
    return NextResponse.json({
      working: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
} 