import { NextResponse } from 'next/server';
import { CONFIG } from '@/config/keys';
import { getCharacterById } from '../../../lib/server/characters';
import { callAIProvider } from '@/utils/ai-providers';

export async function POST(request: Request) {
  try {
    // Get the input data
    const requestData = await request.json();
    const {
      nodeTitle,
      nodeShortDefinition,
      nodeClarification,
      moduleTitle,
      moduleAlignmentBias,
      domainTitle,
      personalities,
      previousDialogue,
      provider, // Optional provider override
      modelKey  // Optional specific model (e.g., 'claudeSonnet4', 'claudeOpus4')
    } = requestData;
    
    console.log(`🔍 [MULTI-DIALOGUE API] Received request with:`);
    console.log(`  - provider: ${provider || 'undefined'}`);
    console.log(`  - modelKey: ${modelKey || 'undefined'}`);
    console.log(`  - CONFIG.AI.provider (default): ${CONFIG.AI.provider}`);
    
    // Get character details
    const personalitiesDetails = [];
    for (const charId of personalities) {
      const char = await getCharacterById(charId);
      if (char) {
        personalitiesDetails.push(char);
      }
    }
    
    // Build a prompt for dialogue generation (works for all LLMs)
    const prompt = `
You are the dialogue generation system for NeuroOS v2, an advanced cognitive learning platform.
Your task is to generate natural dialogue between AI personalities about a specific learning concept.

## Learning Context
Module: ${moduleTitle || 'Unknown Module'}
Domain: ${domainTitle || 'General Knowledge'}
Node Title: ${nodeTitle || 'Concept'}
Node Short Definition: ${nodeShortDefinition || 'No definition provided'}
Node Clarification: ${nodeClarification ? nodeClarification.substring(0, 500) + '...' : 'No clarification provided'}

## The Personalities
${personalitiesDetails.map(p => `- ${p.name || 'AI'} (${p.alignment || 'neutral'}): ${p.personalityProfile ? p.personalityProfile.substring(0, 100) + '...' : 'A helpful AI'}`).join('\n')}

${previousDialogue && previousDialogue.length > 0 ? 
`## Recent Conversation
${previousDialogue.slice(-5).map((d: {characterId: string, message: string}) => `- ${d.characterId || 'unknown'}: "${d.message || 'No message'}"`).join('\n')}` : ''}

## Instructions
Generate 2 dialogue turns where the personalities discuss the concept. Keep responses concise and educational.
Make responses sound natural and match each personality's alignment and characteristics.
Include specific references to concepts from the learning material.

FORMAT YOUR RESPONSE AS VALID JSON with this structure:
{
  "dialogue": [
    { "characterId": "${personalitiesDetails[0]?.id || personalities[0] || 'neuros'}", "message": "First response message" },
    { "characterId": "${personalitiesDetails[1]?.id || personalities[1] || personalitiesDetails[0]?.id || 'gemini'}", "message": "Second response message" }
  ]
}
`;

    console.log("Making multi-dialogue API call with provider:", provider || CONFIG.AI.provider, "model:", modelKey || 'default');
    
    // Call the selected AI provider with model support
    const aiResponse = await callAIProvider(prompt, provider, modelKey);
    
    if (aiResponse.error) {
      console.error("AI provider error:", aiResponse.error);
      
      // Return a fallback response
      return NextResponse.json({
        dialogue: [
          {
            characterId: personalitiesDetails[0]?.id || personalities[0] || "neuros",
            message: `Let's discuss "${nodeTitle}". This concept is about ${nodeShortDefinition}.`
          },
          {
            characterId: personalitiesDetails[1]?.id || personalities[1] || personalitiesDetails[0]?.id || "gemini",
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
            characterId: personalitiesDetails[0]?.id || personalities[0] || "neuros",
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
            characterId: personalitiesDetails[0]?.id || personalities[0] || "neuros",
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
            characterId: personalitiesDetails[0]?.id || personalities[0] || "neuros",
            message: `Let's discuss "${nodeTitle}". ${nodeShortDefinition} is a fascinating concept in ${domainTitle}.`
          }
        ],
        error: "Failed to parse API response"
      });
    }
  } catch (error) {
    console.error("Multi-dialogue API call failed:", error);
    
    return NextResponse.json({
      dialogue: [],
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 