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

import { callAIProvider } from '../../../src/utils/ai-providers';
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

// Function to get user's selected AI provider from localStorage on server-side
// Note: This won't work server-side, so we'll pass it from client or use default
function getUserAIProvider(): { provider?: string; modelKey?: string } {
  // Since this is server-side, we'll return default and let the client-side API endpoints handle provider selection
  return { provider: 'gemini', modelKey: 'gemini' };
}

// Helper function to call AI with provider selection and character personality
async function callAIWithDialogueCharacter(prompt: string, characterId?: string, provider?: string, modelKey?: string): Promise<string | null> {
  try {
    console.log(`🤖 [DIALOGUE AI] Calling AI provider: ${provider || 'default'} with model: ${modelKey || 'default'} for character: ${characterId || 'none'}`);
    
    // Get character personality if provided
    let enhancedPrompt = prompt;
    if (characterId) {
      try {
        const character = await getCharacterById(characterId);
        if (character?.personalityProfile) {
          enhancedPrompt = `Character Personality: ${character.personalityProfile}\n\nTask: ${prompt}`;
          console.log(`🎭 [DIALOGUE AI] Enhanced prompt with ${character.name} personality (${character.alignment} alignment)`);
        }
      } catch (characterError) {
        console.warn(`⚠️ [DIALOGUE AI] Could not load character ${characterId}:`, characterError);
      }
    }

    console.log(`📝 [DIALOGUE AI] Prompt length: ${enhancedPrompt.length} characters`);
    
    // Call the AI provider
    const response = await callAIProvider(enhancedPrompt, provider, modelKey);
    
    if (response.error) {
      console.error(`❌ [DIALOGUE AI] Provider error:`, response.error);
      return null;
    }

    console.log(`✅ [DIALOGUE AI] Response received, length: ${response.text?.length || 0} characters`);
    return response.text;
  } catch (error) {
    console.error(`💥 [DIALOGUE AI] Error in callAIWithDialogueCharacter:`, error);
    return null;
  }
}

export async function generateReadingDialogue(input: GenerateReadingDialogueInput): Promise<GenerateReadingDialogueOutput> {
  try {
    return await generateReadingDialogueFlow(input);
  } catch (error) {
    console.error("Error in generateReadingDialogue, using fallback:", error);
    // Get personalities for fallback dialogue generation
    const personalitiesDetails: Character[] = [];
    for (const charId of input.personalities) {
      const char = await getCharacterById(charId); 
      if (char) {
        personalitiesDetails.push(char);
      }
    }
    
    // Use test dialogue as fallback
    return generateTestDialogue(input, personalitiesDetails);
  }
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

## IMPORTANT FORMATTING INSTRUCTIONS
RETURN ONLY VALID JSON. Your entire response must be a single, properly-formatted JSON object.
Do not include anything before or after the JSON object.
Do not use markdown code blocks or other formatting.
Structure your response exactly like this example:

{
  "dialogue": [
    { 
      "characterId": "characterId1", 
      "message": "First response message that addresses the context."
    },
    { 
      "characterId": "characterId2", 
      "message": "Second response message that builds on the first one."
    }
  ]
}

Generate thoughtful, educational dialogue that helps the user understand the concept.
`;

const generateReadingDialogueFlow = async (input: GenerateReadingDialogueInput): Promise<GenerateReadingDialogueOutput> => {
    console.log(`🚀 [DIALOGUE FLOW] Starting dialogue generation for node: ${input.nodeTitle}`);
    
    const personalitiesDetails: Character[] = [];
    for (const charId of input.personalities) {
      const char = await getCharacterById(charId); 
      if (char) {
        personalitiesDetails.push(char);
        console.log(`👤 [DIALOGUE FLOW] Loaded character: ${char.name} (${char.alignment} alignment)`);
      } else {
        console.warn(`⚠️ [DIALOGUE FLOW] Character not found: ${charId}, using fallback`);
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
        console.error("❌ [DIALOGUE FLOW] No valid personalities provided for dialogue. Input personalities:", input.personalities);
        return { dialogue: [], error: "No valid personalities found to generate dialogue." };
    }

    const previousDialogueWithNames = await Promise.all(
        (input.previousDialogue || []).map(async (turn: any) => {
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

    console.log(`🔍 [DIALOGUE FLOW] User question detected: ${isUserQuestion}`);

    // Get user's AI provider preference (will default to gemini for server-side)
    const userProvider = getUserAIProvider();
    
    // Build the dialogue prompt with all the context
    let processedPrompt = generateReadingDialoguePromptString;
    
    // Replace variables manually since we're not using genkit flow
    processedPrompt = processedPrompt.replace('{{{moduleTitle}}}', input.moduleTitle || 'Unknown Module');
    processedPrompt = processedPrompt.replace('{{moduleAlignmentBias T="neutral"}}', input.moduleAlignmentBias || 'neutral');
    processedPrompt = processedPrompt.replace('{{{domainTitle}}}', input.domainTitle || 'General Knowledge');
    processedPrompt = processedPrompt.replace('{{{nodeTitle}}}', input.nodeTitle || 'Concept');
    processedPrompt = processedPrompt.replace('{{{nodeShortDefinition}}}', input.nodeShortDefinition || 'No definition provided');
    processedPrompt = processedPrompt.replace('{{{nodeClarification}}}', input.nodeClarification || 'No clarification provided');
    
    // Replace personalities details
    const personalitiesList = personalitiesDetails.map(p => 
      `- ${p.name} (ID: ${p.id}, Role: ${p.role}, Alignment: ${p.alignment}): ${p.personalityProfile || 'A helpful AI character'}`
    ).join('\n');
    processedPrompt = processedPrompt.replace(/\{\{#each personalities_details\}\}[\s\S]*?\{\{\/each\}\}/g, personalitiesList);
    
    // Replace previous dialogue if exists
    if (previousDialogueWithNames.length > 0) {
      const dialogueList = previousDialogueWithNames.map(turn => `- ${turn.characterName}: "${turn.message}"`).join('\n');
      processedPrompt = processedPrompt.replace(/\{\{#if previousDialogue\}\}[\s\S]*?\{\{\/if\}\}/g, `## Recent Conversation Context\n${dialogueList}`);
    } else {
      processedPrompt = processedPrompt.replace(/\{\{#if previousDialogue\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }
    
    // Add domain specters
    if (input.domainSpecters && input.domainSpecters.length > 0) {
      processedPrompt = processedPrompt.replace('{{#if domainSpecters}}{{join domainSpecters ", "}}{{else}}learning focus{{/if}}', input.domainSpecters.join(', '));
    } else {
      processedPrompt = processedPrompt.replace('{{#if domainSpecters}}{{join domainSpecters ", "}}{{else}}learning focus{{/if}}', 'learning focus');
    }

    try {
      console.log(`📤 [DIALOGUE FLOW] Sending request to AI provider...`);
      
      // Use our new provider system with detailed logging
      const outputText = await callAIWithDialogueCharacter(
        processedPrompt,
        personalitiesDetails[0].id,
        userProvider.provider,
        userProvider.modelKey
      );
      
      let output: GenerateReadingDialogueOutput = { dialogue: [] };
      
      try {
        if (outputText) {
          console.log(`📥 [DIALOGUE FLOW] Raw AI Response length: ${outputText.length}`);
          console.log(`📋 [DIALOGUE FLOW] Raw AI Response preview: ${outputText.substring(0, 200)}...`);
          
          // First try to extract JSON from the response with regex - more reliable
          const jsonMatch = outputText.match(/\{[\s\S]*?\}/g);
          let jsonString = '';
          
          if (jsonMatch && jsonMatch.length > 0) {
            // Take the largest JSON object which is likely to be the complete one
            jsonString = jsonMatch.reduce((a: string, b: string) => a.length > b.length ? a : b, '');
            console.log(`🔍 [DIALOGUE FLOW] Found JSON object, length: ${jsonString.length}`);
          } else {
            // If no JSON object found, use the whole text
            jsonString = outputText;
            console.log(`⚠️ [DIALOGUE FLOW] No JSON object found, using whole response`);
          }
          
          try {
            // Replace escaped quotes for more reliable parsing
            jsonString = jsonString.replace(/\\"/g, '"').replace(/\\n/g, ' ');
            const parsedOutput = JSON.parse(jsonString);
            
            if (parsedOutput.dialogue && Array.isArray(parsedOutput.dialogue)) {
              console.log(`✅ [DIALOGUE FLOW] Successfully parsed ${parsedOutput.dialogue.length} dialogue turns`);
              output = { 
                dialogue: parsedOutput.dialogue.map((entry: any) => {
                  // Ensure each entry has the required fields
                  if (typeof entry.characterId !== 'string' || typeof entry.message !== 'string') {
                    console.warn(`⚠️ [DIALOGUE FLOW] Invalid dialogue entry, fixing:`, entry);
                    return {
                      characterId: personalitiesDetails[0].id,
                      message: typeof entry.message === 'string' ? entry.message : 
                              (typeof entry === 'string' ? entry : JSON.stringify(entry))
                    };
                  }
                  return entry;
                }),
                error: parsedOutput.error
              };
            } else if (parsedOutput.conversations || parsedOutput.messages || parsedOutput.response) {
              // Handle alternate output formats
              console.log(`🔄 [DIALOGUE FLOW] Using alternate output format`);
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
            console.error("❌ [DIALOGUE FLOW] JSON parse error:", jsonParseError);
            console.log("📄 [DIALOGUE FLOW] Failed JSON string:", jsonString.substring(0, 500));
            
            // Enhanced regex approach
            // First try to extract explicit dialogue turns
            let dialogueTurns: { characterId: string, message: string }[] = [];
            
            // Pattern for {"characterId": "...", "message": "..."}
            const dialoguePattern = /\"characterId\"\s*:\s*\"([^\"]+)\"\s*,\s*\"message\"\s*:\s*\"((?:[^\"]|\\\")*)\"/g;
            const matches = [...outputText.matchAll(dialoguePattern)];
            
            if (matches.length > 0) {
              console.log(`🔧 [DIALOGUE FLOW] Using regex fallback, found ${matches.length} matches`);
              dialogueTurns = matches.map(match => ({
                characterId: match[1],
                message: match[2].replace(/\\"/g, '"')
              }));
              
              output = {
                dialogue: dialogueTurns,
                error: "Used regex fallback parsing"
              };
            } else {
              // Look for quoted text that might be dialogue
              const quotedTextPattern = /\"([^\"]+)\"/g;
              const quotedMatches = [...outputText.matchAll(quotedTextPattern)];
              
              if (quotedMatches.length > 0 && quotedMatches.length <= 6) { // Reasonable number of quotes
                const longQuotes = quotedMatches
                  .map(m => m[1])
                  .filter((text: string) => text.length > 20) // Only reasonably long quotes
                  .slice(0, 2); // Take at most 2 dialogue turns
                
                if (longQuotes.length > 0) {
                  console.log(`🔧 [DIALOGUE FLOW] Using quoted text fallback, found ${longQuotes.length} quotes`);
                  output = {
                    dialogue: longQuotes.map((quote: string, i: number) => ({
                      characterId: i < personalitiesDetails.length ? 
                                   personalitiesDetails[i].id : personalitiesDetails[0].id,
                      message: quote
                    })),
                    error: "Used quoted text fallback parsing"
                  };
                }
              } else {
                // Last resort: Split by paragraphs and use as dialogue
                const paragraphs = outputText
                  .split(/\n\n+/)
                  .map((p: string) => p.trim())
                  .filter((p: string) => p.length > 30);
                
                if (paragraphs.length > 0) {
                  console.log(`🔧 [DIALOGUE FLOW] Using paragraph fallback, found ${paragraphs.length} paragraphs`);
                  output = {
                    dialogue: paragraphs.slice(0, 2).map((para: string, i: number) => ({
                      characterId: i < personalitiesDetails.length ? 
                                  personalitiesDetails[i].id : personalitiesDetails[0].id,
                      message: para
                    })),
                    error: "Used paragraph fallback parsing"
                  };
                }
              }
            }
          }
        } else {
          console.error("❌ [DIALOGUE FLOW] Empty or undefined outputText from AI response");
        }
      } catch (parseError) {
        console.error("💥 [DIALOGUE FLOW] Error parsing dialogue output:", parseError);
        output = { 
          dialogue: [],
          error: "Failed to parse AI response"
        };
      }

      // Improved fallback logic for empty output
      if (!output.dialogue || output.dialogue.length === 0) {
        console.warn("⚠️ [DIALOGUE FLOW] AI generation returned empty output, using fallback");
        
        // Try our robust test dialogue generator for guaranteed output
        const testDialogue = generateTestDialogue(input, personalitiesDetails);
        
        // Only add error information if test dialogue has error
        if (testDialogue.error) {
          testDialogue.error = "AI dialogue generation failed. " + testDialogue.error;
        }
        
        return testDialogue;
      }
      
      // Enhance the dialogue with specific references if they're missing
      const enhancedDialogue = output.dialogue.map((turn: {characterId: string, message: string}) => {
        // If the dialogue doesn't reference the concept specifically, add a reference
        if (!turn.message.includes(input.nodeTitle) && 
            !input.nodeClarification.split(' ').some((word: string) => word.length > 5 && turn.message.includes(word))) {
          return {
            characterId: turn.characterId,
            message: `Regarding ${input.nodeTitle}, ${turn.message}`
          };
        }
        return turn;
      });
      
      console.log(`🎉 [DIALOGUE FLOW] Successfully generated ${enhancedDialogue.length} dialogue turns`);
      return { dialogue: enhancedDialogue, error: output.error };
    } catch (error) {
      console.error("💥 [DIALOGUE FLOW] Error during AI generation:", error);
      return { dialogue: [], error: error instanceof Error ? error.message : "Unknown error during reading dialogue generation." };
    }
  };

/**
 * Generate fallback/test dialogue for development and troubleshooting
 * This function can be used when the actual AI dialogue generation fails
 * or during development/testing
 */
function generateTestDialogue(input: GenerateReadingDialogueInput, personalities: Character[]): GenerateReadingDialogueOutput {
  if (!personalities || personalities.length === 0) {
    return {
      dialogue: [{
        characterId: "neuros",
        message: `Let's discuss ${input.nodeTitle}. This concept relates to ${input.nodeShortDefinition}.`
      }],
      error: "Using fallback dialogue - API connection issue"
    };
  }

  // Simple dialogue generation for 1-2 personalities
  const character1 = personalities[0];
  const responses = [];
  
  // Extract key terms or phrases from node content for more relevant responses
  const keyPhrases = extractKeyPhrases(input.nodeClarification, 3);
  const randomPhrase = keyPhrases[Math.floor(Math.random() * keyPhrases.length)];
  
  // First character response
  let message1 = "";
  if (character1.alignment === 'law') {
    message1 = `Let's analyze ${input.nodeTitle} systematically. The core concept is ${input.nodeShortDefinition}. ${randomPhrase} is particularly important to understand in this context.`;
  } else if (character1.alignment === 'chaos') {
    message1 = `I find ${input.nodeTitle} fascinating because it challenges conventional thinking. Beyond the basic definition, ${input.nodeShortDefinition}, ${randomPhrase} opens up creative possibilities.`;
  } else {
    message1 = `When considering ${input.nodeTitle}, which is ${input.nodeShortDefinition}, I think about how ${randomPhrase} applies in real-world scenarios. What's your take on this?`;
  }
  
  responses.push({
    characterId: character1.id,
    message: message1
  });
  
  // Second character response (if available)
  if (personalities.length > 1) {
    const character2 = personalities[1];
    let message2 = "";
    
    // Get a different key phrase for the second character
    const differentPhrase = keyPhrases.find(p => p !== randomPhrase) || randomPhrase;
    
    // Make the second character disagree or extend the first character's point
    if (character2.type === 'antagonist') {
      message2 = `I need to challenge ${character1.name}'s perspective. When we talk about ${input.nodeTitle}, many oversimplify. ${differentPhrase} is actually more complex than it appears at first.`;
    } else if (character2.alignment !== character1.alignment) {
      message2 = `I see this differently than ${character1.name}. While ${input.nodeTitle} is indeed ${input.nodeShortDefinition}, I would emphasize ${differentPhrase} as the most crucial aspect to understand.`;
    } else {
      message2 = `Building on what ${character1.name} said, I'd add that ${differentPhrase} also connects to ${input.domainTitle} in interesting ways. What specific aspects are you most curious about?`;
    }
    
    responses.push({
      characterId: character2.id,
      message: message2
    });
  }
  
  // Check if there was a user question and provide a direct answer if possible
  const previousDialogue = input.previousDialogue || [];
  const lastMessage = previousDialogue.length > 0 ? previousDialogue[previousDialogue.length - 1] : null;
  
  if (lastMessage && lastMessage.characterId === 'user_sovereign') {
    const userQuestion = lastMessage.message;
    if (userQuestion.includes('?') || 
        userQuestion.toLowerCase().includes('what') || 
        userQuestion.toLowerCase().includes('how') || 
        userQuestion.toLowerCase().includes('why')) {
      
      // Add a direct response to the user question
      const respondingCharacter = personalities[responses.length % personalities.length];
      let answer = `That's a good question about ${input.nodeTitle}. Based on the concept, ${extractSentenceWithKeywords(input.nodeClarification, userQuestion)}`;
      
      responses.push({
        characterId: respondingCharacter.id,
        message: answer
      });
    }
  }
  
  return {
    dialogue: responses,
    error: "Using fallback dialogue (API connection issue)"
  };
}

/**
 * Helper function to extract key phrases from text
 */
function extractKeyPhrases(text: string, count: number): string[] {
  // Simple implementation - extract sentences and pick a few based on length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) {
    return ["this concept", "this principle", "this important idea"];
  }
  
  // Sort by length and pick medium-length sentences (not too short, not too long)
  const sortedSentences = [...sentences].sort((a, b) => a.length - b.length);
  const midIndex = Math.floor(sortedSentences.length / 2);
  const startIndex = Math.max(0, midIndex - Math.floor(count / 2));
  
  // Take a few sentences from the middle of the sorted list
  return sortedSentences.slice(startIndex, startIndex + count)
    .map(s => s.trim())
    // If still too long, take just the beginning
    .map(s => s.length > 120 ? s.substring(0, 120) + "..." : s);
}

/**
 * Extract a sentence from text that contains keywords from a query
 */
function extractSentenceWithKeywords(text: string, query: string): string {
  // Get keywords from the query (words longer than 3 chars)
  const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  
  // Split text into sentences
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  // Find sentences containing keywords
  const matchedSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return keywords.some(keyword => lowerSentence.includes(keyword));
  });
  
  if (matchedSentences.length > 0) {
    // Return the first matching sentence
    return matchedSentences[0];
  }
  
  // Fallback - return the first sentence or a generic response
  return sentences.length > 0 ? sentences[0] : "we need to understand the concept thoroughly first.";
}


    



