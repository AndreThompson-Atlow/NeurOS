'use server';
/**
 * @fileOverview Flow for generating a multi-character dialogue about a learning node for Reading Mode.
 *
 * Provides an interactive chat experience where AI personas discuss concepts with the user.
 * The dialogue is context-aware and references specific aspects of the learning node.
 * 
 * - generateReadingDialogue - A function that generates a dialogue.
 * - GenerateReadingDialogueInput - The input type for the generateReadingDialogue function.
 * - GenerateReadingDialogueOutput - The return type for the generateReadingDialogue function.
 */

import { ai as baseAi, generateWithCharacter } from '../../../lib/server/genkit'; 
// Changed from '@/lib/server/ai/characters' to relative path
import { getCharacterById } from '../../../lib/server/characters';  
import type { Character } from '@/types/characterTypes'; 
import { 
    GenerateReadingDialogueInputSchema, 
    type GenerateReadingDialogueInput,
    GenerateReadingDialogueOutputSchema,
    type GenerateReadingDialogueOutput,
    DialogueTurnSchema
} from './types/generateReadingDialogueTypes'; 


export async function generateReadingDialogue(input: GenerateReadingDialogueInput): Promise<GenerateReadingDialogueOutput> {
  return generateReadingDialogueFlow(input);
}

const generateReadingDialoguePromptString = `
You are the dialogue generation system for NeuroOS v2, an advanced cognitive learning platform.
Your task is to generate natural, insightful, and engaging dialogue between AI personalities about a specific learning concept.
Make the dialogue feel like a real conversation with the user, providing unique perspectives, thoughtful responses, and educational value.

## Learning Context
Module: {{{moduleTitle}}} (Alignment: {{moduleAlignmentBias T="neutral"}})
Domain: {{{domainTitle}}} (Theme: {{#if domainSpecters}}{{join domainSpecters ", "}}{{else}}learning focus{{/if}})
Node Title: {{{nodeTitle}}}
Node Short Definition: {{{nodeShortDefinition}}}
Node Clarification:
{{{nodeClarification}}}

## The Participating Personalities
{{#each personalities_details}}
- {{this.name}} (ID: {{this.id}}, Role: {{this.role}}, Alignment: {{this.alignment}}): {{this.personalityProfile}}
{{/each}}

{{#if previousDialogue}}
## Recent Conversation Context
{{#each previousDialogue}}
- {{this.characterName}}: "{{this.message}}"
{{/each}}
{{/if}}

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

## Output Format
JSON array of dialogue turns, where each has a "characterId" and a "message".

Example:
{
  "dialogue": [
    { "characterId": "{{first_personality_id}}", "message": "The concept of {{nodeTitle}} reminds me of how [reference specific part of node content]. This matters because..." },
    { "characterId": "{{second_personality_id}}", "message": "Interesting perspective, though I'd suggest that [alternative view]. What do you think about [specific question related to node]?" }
  ]
}

Generate thoughtful, educational dialogue that helps the user understand the concept.
`;

const generateReadingDialogueFlow = baseAi.defineFlow(
  {
    name: 'generateReadingDialogueFlow',
    inputSchema: GenerateReadingDialogueInputSchema,
    outputSchema: GenerateReadingDialogueOutputSchema,
  },
  async (input) => {
    const personalitiesDetails: Character[] = [];
    for (const charId of input.personalities) {
      const char = await getCharacterById(charId); 
      if (char) {
        personalitiesDetails.push(char);
      } else {
        personalitiesDetails.push({ 
            id: charId, 
            name: charId, 
            type: 'specter', // Default type if not found
            role: 'Unknown Entity', 
            alignment: 'neutral', 
            description: 'An enigmatic presence.',
            domains: [],
            personalityProfile: 'Speaks with an air of mystery, offering general but occasionally profound statements.',
            phaseAffinity: { download: 10, install: 10, review: 10, chronicle: 10 },
            summonContexts: [],
            preferredPhases: [],
            voiceMode: 'text',
        } as Character);
      }
    }
    
    if (personalitiesDetails.length === 0) {
        console.error("No valid personalities provided for dialogue. Input personalities:", input.personalities);
        return { dialogue: [], error: "No valid personalities found to generate dialogue." };
    }

    const previousDialogueWithNames = await Promise.all(
        (input.previousDialogue || []).map(async (turn) => {
            const char = await getCharacterById(turn.characterId);
            return { ...turn, characterName: char?.name || turn.characterId };
        })
    );
    
    // Check if there's a user question in previous dialogue
    const isUserQuestion = previousDialogueWithNames.length > 0 && 
                          previousDialogueWithNames[previousDialogueWithNames.length - 1].characterId === 'user_sovereign' &&
                          (previousDialogueWithNames[previousDialogueWithNames.length - 1].message.trim().endsWith('?') ||
                           previousDialogueWithNames[previousDialogueWithNames.length - 1].message.toLowerCase().includes('what') ||
                           previousDialogueWithNames[previousDialogueWithNames.length - 1].message.toLowerCase().includes('how') ||
                           previousDialogueWithNames[previousDialogueWithNames.length - 1].message.toLowerCase().includes('why'));

    const promptInput = {
      ...input,
      personalities_details: personalitiesDetails,
      first_personality_id: personalitiesDetails[0].id,
      second_personality_id: personalitiesDetails.length > 1 ? personalitiesDetails[1].id : personalitiesDetails[0].id,
      previousDialogue: previousDialogueWithNames,
      isUserQuestion: isUserQuestion // Add flag for user question
    };

    try {
      // Use the simpler model calling approach
      const response = await generateWithCharacter({
        prompt: generateReadingDialoguePromptString,
        characterId: promptInput.personalities_details[0].id,
        config: {
          temperature: isUserQuestion ? 0.4 : 0.7,
          maxOutputTokens: 600
        }
      });
      
      // Extract the output text
      const outputText = (response as any)?.response?.candidates()?.[0]?.content?.parts?.[0]?.text;
      let output: GenerateReadingDialogueOutput = { dialogue: [] };
      
      try {
        if (outputText) {
          // First try to extract JSON from the response
          const jsonMatch = outputText.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : outputText;
          
          try {
            const parsedOutput = JSON.parse(jsonString);
            if (parsedOutput.dialogue && Array.isArray(parsedOutput.dialogue)) {
              output = { 
                dialogue: parsedOutput.dialogue,
                error: parsedOutput.error
              };
            } else if (parsedOutput.conversations || parsedOutput.messages || parsedOutput.response) {
              // Handle alternate output formats
              const possibleDialogue = parsedOutput.conversations || parsedOutput.messages || parsedOutput.response;
              if (Array.isArray(possibleDialogue)) {
                output = {
                  dialogue: possibleDialogue.map((item: any) => ({
                    characterId: item.characterId || item.speaker || personalitiesDetails[0].id,
                    message: item.message || item.text || item.content || String(item)
                  })),
                  error: undefined
                };
              }
            }
          } catch (jsonParseError) {
            console.error("JSON parse error:", jsonParseError);
            
            // Fallback 1: Try to extract dialogue through regex pattern matching
            const dialoguePattern = /\"characterId\"\s*:\s*\"([^\"]+)\"\s*,\s*\"message\"\s*:\s*\"([^\"]+)\"/g;
            const matches = [...outputText.matchAll(dialoguePattern)];
            
            if (matches.length > 0) {
              output = {
                dialogue: matches.map(match => ({
                  characterId: match[1],
                  message: match[2]
                })),
                error: "Used regex fallback parsing"
              };
            } else {
              // Fallback 2: Create a basic response from the raw text
              const textSegments = outputText.split('\n\n').filter((segment: string) => segment.trim().length > 10);
              if (textSegments.length > 0) {
                output = {
                  dialogue: [{
                    characterId: personalitiesDetails[0].id,
                    message: textSegments[0].replace(/^[^A-Za-z0-9]+/, '').trim()
                  }],
                  error: "Used text segment fallback"
                };
              }
            }
          }
        }
      } catch (parseError) {
        console.error("Error parsing dialogue output:", parseError);
        output = { 
          dialogue: [],
          error: "Failed to parse AI response"
        };
      }

      // Handle empty output with better fallbacks
      if (!output.dialogue || output.dialogue.length === 0) {
        console.warn("Reading dialogue generation returned empty or invalid output");
        
        // Create context-aware fallback responses
        let fallbackMessage = `I'm contemplating the concept of ${input.nodeTitle}. `;
        
        if (isUserQuestion) {
          const userQuestion = previousDialogueWithNames[previousDialogueWithNames.length - 1].message;
          fallbackMessage += `Regarding your question about ${userQuestion.replace(/\?/g, '')}, this relates to ${input.nodeShortDefinition}. What else would you like to know?`;
        } else {
          // Create different fallbacks based on the node content
          const keywords = input.nodeClarification.split(' ')
            .filter(word => word.length > 5)
            .slice(0, 3);
          
          if (keywords.length > 0) {
            fallbackMessage += `This concept involves ${keywords.join(', ')}. What aspects are you most curious about?`;
          } else {
            fallbackMessage += `What aspects of ${input.nodeTitle} are you most curious about?`;
          }
        }
        
        return { 
          dialogue: [{ 
            characterId: personalitiesDetails[0].id, 
            message: fallbackMessage
          }], 
          error: "AI couldn't generate proper dialogue. Falling back to simple response." 
        };
      }
      
      // Enhance the dialogue with specific references if they're missing
      const enhancedDialogue = output.dialogue.map((turn: {characterId: string, message: string}) => {
        // If the dialogue doesn't reference the concept specifically, add a reference
        if (!turn.message.includes(input.nodeTitle) && 
            !input.nodeClarification.split(' ').some(word => word.length > 5 && turn.message.includes(word))) {
          return {
            characterId: turn.characterId,
            message: `Regarding ${input.nodeTitle}, ${turn.message}`
          };
        }
        return turn;
      });
      
      return { dialogue: enhancedDialogue, error: output.error };
    } catch (error) {
      console.error("Error in generateReadingDialogueFlow during AI generation:", error);
      return { dialogue: [], error: error instanceof Error ? error.message : "Unknown error during reading dialogue generation." };
    }
  }
);


    



