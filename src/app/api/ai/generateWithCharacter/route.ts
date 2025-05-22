import { NextRequest, NextResponse } from 'next/server';
import { generateWithCharacter } from '../../../../../lib/server/genkit';

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
    
    // Call the server-side AI generation function with character
    const result = await generateWithCharacter(options);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API generateWithCharacter error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI response with character',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 