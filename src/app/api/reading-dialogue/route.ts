import { NextResponse } from 'next/server';
import { CONFIG } from '@/config/keys';
import { getCharacterById } from '../../../lib/server/characters';
import { type Character } from '@/types/characterTypes';
import { callAIProvider } from '@/utils/ai-providers';

export const maxDuration = 30; // 30 seconds

export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestData = await request.json();
    const {
      nodeTitle,
      nodeShortDefinition,
      nodeClarification,
      moduleTitle,
      moduleAlignmentBias,
      domainTitle,
      domainSpecters,
      domainCharacterAffinities,
      personalities,
      previousDialogue,
      provider, // Optional provider override
      modelKey  // Optional specific model (e.g., 'claudeSonnet4', 'claudeOpus4')
    } = requestData;
    
    // Get character details
    const personalitiesDetails: Character[] = [];
    for (const charId of personalities || []) {
      const char = await getCharacterById(charId);
      if (char) {
        personalitiesDetails.push(char);
      }
    }
    
    // Build a prompt for reading dialogue generation (works for all LLMs)
    const prompt = `
You are the dialogue generation system for NeuroOS v2, an advanced cognitive learning platform.
Your task is to generate natural, insightful, and engaging dialogue between AI personalities about a specific learning concept.
Make the dialogue feel like a real conversation with the user, providing unique perspectives, thoughtful responses, and educational value.

## Learning Context
Module: ${moduleTitle || 'Unknown Module'} (Alignment: ${moduleAlignmentBias || 'neutral'})
Domain: ${domainTitle || 'General Knowledge'} (Theme: ${domainSpecters ? domainSpecters.join(', ') : 'learning focus'})
Node Title: ${nodeTitle || 'Concept'}
Node Short Definition: ${nodeShortDefinition || 'No definition provided'}
Node Clarification:
${nodeClarification ? nodeClarification.substring(0, 500) + '...' : 'No clarification provided'}

## The Participating Personalities
${personalitiesDetails.map(p => `- ${p.name || 'AI'} (ID: ${p.id}, Role: ${p.role || 'Guide'}, Alignment: ${p.alignment || 'neutral'}): ${p.personalityProfile ? p.personalityProfile.substring(0, 100) + '...' : 'A helpful AI'}`).join('\n')}

${previousDialogue && previousDialogue.length > 0 ? 
`## Recent Conversation Context
${previousDialogue.slice(-5).map((d: {characterId: string, message: string}) => `- ${personalitiesDetails.find(p => p.id === d.characterId)?.name || d.characterId}: "${d.message || 'No message'}"`).join('\n')}` : ''}

## Instructions
1. Generate 1-2 dialogue turns that continue the conversation naturally. If the user asked a question, ensure at least one response directly addresses it.
2. Make each character's response authentically reflect their unique personality, knowledge level, and perspective.
3. Include specific references to the node content - incorporate terms, concepts, examples, or applications directly from the node.
4. Keep responses concise (1-3 sentences) but highly relevant and informative.
5. If appropriate, one character may pose a thought-provoking question to deepen the discussion.
6. Characters should occasionally disagree with or challenge each other to show different perspectives.
7. If the conversation has been going for a while (previous dialogue > 3 turns), introduce a new angle or aspect of the concept.
8. For user questions:
   - Directly answer with accurate information from the node content
   - Provide examples or explanations that clarify the concept
   - If the user question is unclear, ask for clarification in a helpful way

## IMPORTANT FORMATTING INSTRUCTIONS
RETURN ONLY VALID JSON. Your entire response must be a single, properly-formatted JSON object.
Do not include anything before or after the JSON object.
Do not use markdown code blocks or other formatting.
Structure your response exactly like this example:

{
  "dialogue": [
    { 
      "characterId": "${personalitiesDetails[0]?.id || personalities?.[0] || 'neuros'}", 
      "message": "First response message that addresses the context."
    },
    { 
      "characterId": "${personalitiesDetails[1]?.id || personalities?.[1] || personalitiesDetails[0]?.id || 'gemini'}", 
      "message": "Second response message that builds on the first one."
    }
  ]
}

Generate thoughtful, educational dialogue that helps the user understand the concept.
`;

    console.log("Making reading dialogue API call with provider:", provider || CONFIG.AI.provider, "model:", modelKey || 'default');
    
    // Call the selected AI provider with model support
    const aiResponse = await callAIProvider(prompt, provider, modelKey);
    
    if (aiResponse.error) {
      console.error("AI provider error:", aiResponse.error);
      
      // Return a fallback response
      return NextResponse.json({
        dialogue: [
          {
            characterId: personalitiesDetails[0]?.id || personalities?.[0] || "neuros",
            message: `Let's discuss "${nodeTitle}". This concept is about ${nodeShortDefinition}.`
          },
          {
            characterId: personalitiesDetails[1]?.id || personalities?.[1] || personalitiesDetails[0]?.id || "gemini",
            message: `Yes, and in ${domainTitle}, it's particularly important because it relates to how we understand the fundamental principles.`
          }
        ],
        provider: provider || CONFIG.AI.provider,
        modelKey: modelKey || 'default',
        error: aiResponse.error
      });
    }
    
    if (!aiResponse.text) {
      return NextResponse.json({
        dialogue: [
          {
            characterId: personalitiesDetails[0]?.id || personalities?.[0] || "neuros",
            message: `Let's discuss "${nodeTitle}". This concept is about ${nodeShortDefinition}.`
          }
        ],
        error: "No response from AI provider"
      });
    }
    
    // Try to extract the JSON response
    try {
      // Try to find and parse JSON in the response
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsedResponse = JSON.parse(jsonString);
        
        // Check if it has the expected structure
        if (parsedResponse.dialogue && Array.isArray(parsedResponse.dialogue)) {
          return NextResponse.json({
            ...parsedResponse,
            provider: provider || CONFIG.AI.provider,
            modelKey: modelKey || 'default'
          });
        }
      }
      
      // If we can't parse JSON or the structure is wrong, create a structured response from the text
      return NextResponse.json({
        dialogue: [
          {
            characterId: personalitiesDetails[0]?.id || personalities?.[0] || "neuros",
            message: aiResponse.text.substring(0, 300)
          }
        ],
        provider: provider || CONFIG.AI.provider,
        modelKey: modelKey || 'default',
        error: "Could not parse structured dialogue format"
      });
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      
      // Return a fallback response
      return NextResponse.json({
        dialogue: [
          {
            characterId: personalitiesDetails[0]?.id || personalities?.[0] || "neuros",
            message: `Let's discuss "${nodeTitle}". ${nodeShortDefinition} is a fascinating concept in ${domainTitle}.`
          }
        ],
        error: "Failed to parse API response"
      });
    }
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