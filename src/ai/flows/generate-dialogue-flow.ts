'use server';
/**
 * @fileOverview Flow for generating a dialogue between two AI characters about a learning node.
 *
 * - generateDialogue - A function that generates a dialogue.
 * - GenerateDialogueInput - The input type for the generateDialogue function.
 * - GenerateDialogueOutput - The return type for the generateDialogue function.
 */

import { ai as baseAi } from '../../../lib/server/genkit'; 
import { getCharacterById } from '../../../lib/server/characters'; 
import type { Character } from '@/types/characterTypes'; 
import { z } from 'genkit';

const GenerateDialogueInputSchema = z.object({
  nodeTitle: z.string().describe("The title of the learning node."),
  nodeShortDefinition: z.string().describe("The short definition of the learning node."),
  nodeClarification: z.string().describe("The detailed clarification of the learning node."),
  character1Id: z.string().describe("The ID of the first character participating in the dialogue."),
  character2Id: z.string().describe("The ID of the second character participating in the dialogue."),
});
export type GenerateDialogueInput = z.infer<typeof GenerateDialogueInputSchema>;

const DialogueTurnSchema = z.object({
  speaker: z.string().describe("The name of the character speaking."),
  line: z.string().describe("The character's dialogue line."),
});

const GenerateDialogueOutputSchema = z.object({
  dialogue: z.array(DialogueTurnSchema).describe("An array of dialogue turns, each with a speaker and their line."),
  error: z.string().optional().describe("Error message if dialogue generation failed."),
});
export type GenerateDialogueOutput = z.infer<typeof GenerateDialogueOutputSchema>;

export async function generateDialogue(input: GenerateDialogueInput): Promise<GenerateDialogueOutput> {
  return generateDialogueFlow(input);
}

const generateDialoguePromptString = `
You are a master dialogue writer for an educational system called NeuroOS.
Your task is to generate a short, insightful, and engaging dialogue (2-3 exchanges per character, max 6 turns total) between two AI personalities about a specific learning concept.
The dialogue should help a user understand the concept better by showcasing different perspectives or by exploring its nuances.

The Learning Concept:
Title: {{{nodeTitle}}}
Short Definition: {{{nodeShortDefinition}}}
Clarification: {{{nodeClarification}}}

The Characters:
Character 1 (ID: {{{character1Id}}}):
Personality: {{{character1Personality}}}
Name: {{{character1Name}}}

Character 2 (ID: {{{character2Id}}}):
Personality: {{{character2Personality}}}
Name: {{{character2Name}}}

Instructions:
1.  The dialogue should be directly relevant to the provided learning concept (Title, Definition, Clarification).
2.  Each character should speak in a voice consistent with their personality profile.
3.  The dialogue should be enlightening, perhaps offering a new angle, a practical example, a common pitfall, or a connection to a broader idea.
4.  The dialogue should be concise, with each character having 2-3 speaking turns.
5.  Output the dialogue as a JSON array of objects, where each object has a "speaker" (the character's name) and a "line" (what they say).

Example Output Format:
{
  "dialogue": [
    { "speaker": "{{{character1Name}}}", "line": "An interesting concept, this '{{{nodeTitle}}}'. It reminds me of..." },
    { "speaker": "{{{character2Name}}}", "line": "Indeed. But one must be careful not to overlook its application in..." },
    { "speaker": "{{{character1Name}}}", "line": "A valid point. Perhaps a good way to illustrate that is..." }
  ]
}

Generate the dialogue now.
`;

const generateDialogueFlow = baseAi.defineFlow(
  {
    name: 'generateDialogueFlow',
    inputSchema: GenerateDialogueInputSchema,
    outputSchema: GenerateDialogueOutputSchema,
  },
  async (input) => {
    const char1 = await getCharacterById(input.character1Id);
    const char2 = await getCharacterById(input.character2Id);

    if (!char1 || !char2) {
      return { dialogue: [], error: "One or both characters not found." };
    }

    const promptInput = {
      ...input,
      character1Name: char1.name,
      character1Personality: char1.personalityProfile,
      character2Name: char2.name,
      character2Personality: char2.personalityProfile,
    };

    try {
      const { output } = await baseAi.generate({
        prompt: generateDialoguePromptString,
        input: promptInput,
        output: { schema: GenerateDialogueOutputSchema },
        config: {
          temperature: 0.7, 
        }
      });

      if (!output || !output.dialogue || output.dialogue.length === 0) {
        console.warn("Dialogue generation returned empty or invalid output:", output);
        return { dialogue: [], error: "AI failed to generate dialogue." };
      }
      return output;
    } catch (error) {
      console.error("Error in generateDialogueFlow:", error);
      return { dialogue: [], error: error instanceof Error ? error.message : "Unknown error during dialogue generation." };
    }
  }
);



