import { NextRequest, NextResponse } from 'next/server';
import { callAIProvider } from '@/utils/ai-providers';

export const maxDuration = 120; // Set timeout to 120 seconds for knowledge generation

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
      count = 5,
      config = {},
      ...otherOptions
    } = options;

    // Prepare the final prompt for knowledge check generation
    let finalPrompt = prompt || '';
    if (system) {
      finalPrompt = `System: ${system}\n\nUser: ${finalPrompt}`;
    }

    // Add specific instructions for knowledge check generation if not already present
    if (!finalPrompt.includes('JSON') && !finalPrompt.includes('question')) {
      finalPrompt += `\n\nGenerate ${count} multiple choice questions as a JSON array with the following structure:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0,
    "explanation": "Explanation of the correct answer"
  }
]`;
    }

    console.log(`Calling AI provider for knowledge checks: ${provider || 'default'} with model: ${modelKey || 'default'}`);

    // Call the selected AI provider
    const aiResponse = await callAIProvider(finalPrompt, provider, modelKey);
    
    if (aiResponse.error) {
      console.error("AI provider error:", aiResponse.error);
      
      // Return fallback knowledge check questions
      const fallbackQuestions = Array(count).fill(null).map((_, index) => ({
        question: `What is a key concept related to this topic? (Question ${index + 1})`,
        options: [
          `Correct answer for question ${index + 1}`,
          `Incorrect option B for question ${index + 1}`,
          `Incorrect option C for question ${index + 1}`,
          `Incorrect option D for question ${index + 1}`,
        ],
        correctOptionIndex: 0,
        explanation: `This is a fallback question due to API connection issues. Please try again later.`,
      }));
      
      return NextResponse.json(fallbackQuestions);
    }

    // Try to parse the JSON response
    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        if (Array.isArray(questions) && questions.length > 0) {
          return NextResponse.json(questions);
        }
      }
      
      // If parsing fails, create fallback questions
      const fallbackQuestions = Array(count).fill(null).map((_, index) => ({
        question: `Generated question ${index + 1} about the topic`,
        options: [
          `Option A for question ${index + 1}`,
          `Option B for question ${index + 1}`,
          `Option C for question ${index + 1}`,
          `Option D for question ${index + 1}`,
        ],
        correctOptionIndex: 0,
        explanation: `Could not parse generated questions. This is a placeholder.`,
      }));
      
      return NextResponse.json(fallbackQuestions);
      
    } catch (parseError) {
      console.error('Failed to parse knowledge check response:', parseError);
      
      // Return fallback questions
      const fallbackQuestions = Array(count).fill(null).map((_, index) => ({
        question: `What is a key concept related to this topic? (Fallback ${index + 1})`,
        options: [
          `Option A for question ${index + 1}`,
          `Option B for question ${index + 1}`,
          `Option C for question ${index + 1}`,
          `Option D for question ${index + 1}`,
        ],
        correctOptionIndex: 0,
        explanation: `This is a fallback question due to parsing issues.`,
      }));
      
      return NextResponse.json(fallbackQuestions);
    }
  } catch (error) {
    console.error('API run error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate knowledge checks',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 