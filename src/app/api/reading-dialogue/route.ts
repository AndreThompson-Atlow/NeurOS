import { NextResponse } from 'next/server';
import { generateReadingDialogue } from '@/ai/flows/generateReadingDialogueFlow';
import { checkApiConnection } from '../../../../lib/server/genkit';

export const maxDuration = 30; // 30 seconds

export async function POST(request: Request) {
  try {
    // Check API connection status before proceeding
    const apiWorking = await checkApiConnection();
    
    // Parse the request body
    const requestData = await request.json();
    
    if (!apiWorking) {
      console.warn("API connection is not working, sending informative response");
      return NextResponse.json(
        { 
          dialogue: [],
          error: "API connection is not working - please use the offline mode"
        },
        { status: 200 } // Still return 200 to allow client-side handling
      );
    }
    
    // Generate the dialogue
    const result = await generateReadingDialogue(requestData);
    
    // Return the dialogue response
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in reading dialogue API:', error);
    
    // Return a proper error response
    return NextResponse.json(
      { 
        dialogue: [],
        error: error instanceof Error ? error.message : 'Unknown server error'
      },
      { status: 500 }
    );
  }
} 