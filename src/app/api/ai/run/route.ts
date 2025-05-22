import { NextRequest, NextResponse } from 'next/server';
import { ai } from '../../../../../lib/server/genkit';

export const maxDuration = 120; // Set timeout to 120 seconds for knowledge check generation

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
    
    // Call the server-side AI run function (add type parameters if needed)
    const result = await ai.run(options);
    
    // Return the result 
    return NextResponse.json(result);
  } catch (error) {
    console.error('API run error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to run AI operation',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 