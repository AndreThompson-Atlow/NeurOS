import { NextRequest, NextResponse } from 'next/server';
import { callAIProvider } from '@/utils/ai-providers';
import { getCharacterPersonalityPrompt, getCharacterById } from '../../../../lib/server/characters';

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
      characterId,
      provider,
      modelKey,
      config = {},
      ...otherOptions
    } = options;

    // Build the enhanced prompt with character personality if provided
    let enhancedPrompt = prompt || '';
    let systemPrompt = system;

    if (characterId) {
      try {
        const character = await getCharacterById(characterId);
        if (character) {
          const personalityPrompt = await getCharacterPersonalityPrompt(characterId);
          if (personalityPrompt) {
            // If we have a system prompt, combine it with personality
            if (systemPrompt) {
              systemPrompt = `${personalityPrompt}\n\n${systemPrompt}`;
            } else {
              // Add personality as context to the main prompt
              enhancedPrompt = `${personalityPrompt}\n\nUser Request: ${enhancedPrompt}`;
            }
          }
        }
      } catch (characterError) {
        console.warn(`Could not load character ${characterId}:`, characterError);
        // Continue without character enhancement
      }
    }

    // Prepare the final prompt for the AI provider
    let finalPrompt = enhancedPrompt;
    if (systemPrompt) {
      finalPrompt = `System: ${systemPrompt}\n\nUser: ${enhancedPrompt}`;
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

    // Format response to match the expected structure from the old genkit system
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