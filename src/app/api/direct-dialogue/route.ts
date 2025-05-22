import { NextResponse } from 'next/server';
import { CONFIG } from '@/config/keys';
import { getCharacterById } from '../../../lib/server/characters';

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
    } = requestData;
    
    // Get character details
    const personalitiesDetails = [];
    for (const charId of personalities) {
      const char = await getCharacterById(charId);
      if (char) {
        personalitiesDetails.push(char);
      }
    }
    
    // Build a prompt for dialogue generation
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
${personalitiesDetails.map(p => `- ${p.name} (${p.alignment || 'neutral'}): ${p.personalityProfile ? p.personalityProfile.substring(0, 100) + '...' : 'A helpful AI'}`).join('\n')}

${previousDialogue && previousDialogue.length > 0 ? 
`## Recent Conversation
${previousDialogue.slice(-5).map((d: {characterId: string, message: string}) => `- ${d.characterId || 'unknown'}: "${d.message || 'No message'}""`).join('\n')}` : ''}

## Instructions
Generate 2 dialogue turns where the personalities discuss the concept. Keep responses concise and educational.
Make responses sound natural and match each personality's alignment and characteristics.
Include specific references to concepts from the learning material.

FORMAT YOUR RESPONSE AS VALID JSON with this structure:
{
  "dialogue": [
    { "characterId": "[first personality ID]", "message": "[first response message]" },
    { "characterId": "[second personality ID]", "message": "[second response message]" }
  ]
}
`;

    // Use the API key directly
    const apiKey = CONFIG.AI.googleApiKey;
    
    console.log("Making direct dialogue API call with prompt length:", prompt.length);
    
    // Prepare the request payload according to Google's API docs
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 40
      }
    };
    
    // Make a direct HTTP request to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
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
        error: `API error: ${response.status}`
      });
    }
    
    const data = await response.json();
    console.log("Gemini API response received:", !!data);
    
    // Try to extract the JSON response
    try {
      // First try to get the text response
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error("No text in response");
      }
      
      // Try to find and parse JSON in the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsedResponse = JSON.parse(jsonString);
        
        // Check if it has the expected structure
        if (parsedResponse.dialogue && Array.isArray(parsedResponse.dialogue)) {
          return NextResponse.json(parsedResponse);
        }
      }
      
      // If we can't parse JSON or the structure is wrong, create a structured response from the text
      return NextResponse.json({
        dialogue: [
          {
            characterId: personalitiesDetails[0]?.id || personalities[0] || "neuros",
            message: textResponse.substring(0, 300)
          }
        ],
        error: "Could not parse structured dialogue format"
      });
      
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      
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
    console.error("Direct dialogue API call failed:", error);
    
    return NextResponse.json({
      dialogue: [],
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 