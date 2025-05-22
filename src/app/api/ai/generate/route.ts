import { NextRequest, NextResponse } from 'next/server';
import { ai } from '../../../../../lib/server/genkit';

export const maxDuration = 60; // Set timeout to 60 seconds

export async function POST(req: NextRequest) {
  try {
    const options = await req.json();
    
    // Validate input
    if (!options) {
      return NextResponse.json(
        { error: 'Invalid request: Missing options' },
        { status: 400 }
      );
    }
    
    // Call the server-side AI generation function
    const result = await ai.generate(options);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API generate error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI response',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 