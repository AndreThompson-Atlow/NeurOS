import { NextRequest, NextResponse } from 'next/server';
import { callAIProvider } from '@/utils/ai-providers';

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

    const {
      prompt,
      system,
      provider,
      modelKey,
      config = {},
      ...otherOptions
    } = options;

    // Prepare the final prompt for the AI provider
    let finalPrompt = prompt || '';
    if (system) {
      finalPrompt = `System: ${system}\n\nUser: ${finalPrompt}`;
    }

    console.log(`Calling AI provider: ${provider || 'default'} with model: ${modelKey || 'default'}`);

    // Call the selected AI provider
    const aiResponse = await callAIProvider(finalPrompt, provider, modelKey);
    
    if (aiResponse.error) {
      console.error("AI provider error:", aiResponse.error);
      return NextResponse.json(
        { 
          error: 'AI provider failed',
          details: aiResponse.error,
          fallback: true
        },
        { status: 500 }
      );
    }

    // Format response to match the expected structure
    const result = {
      response: {
        candidates: () => [{
          content: {
            parts: [{
              text: aiResponse.text
            }]
          }
        }]
      },
      text: aiResponse.text,
      provider: provider,
      modelKey: modelKey
    };
    
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