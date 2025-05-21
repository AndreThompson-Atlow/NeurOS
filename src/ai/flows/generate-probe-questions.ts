'use server';

/**
 * @fileOverview Flow for generating challenging probe questions related to a specific concept.
 *
 * - generateProbeQuestions - A function that generates probe questions for a given concept.
 * - GenerateProbeQuestionsInput - The input type for the generateProbeQuestions function.
 * - GenerateProbeQuestionsOutput - The return type for the generateProbeQuestions function.
 */

import {ai as baseAi, generateWithCharacter} from '../../../lib/server/genkit'; 
// Changed from '@/lib/server/ai/characters' to relative path
import { getCharacterPersonalityPrompt } from '../../../lib/server/characters'; 
import {z} from 'genkit';

const GenerateProbeQuestionsInputSchema = z.object({
  concept: z.string().describe('The concept title for which to generate probe questions.'),
  moduleContent: z.string().describe('The context including concept definition and clarification.'),
  characterId: z.string().optional().describe("Optional ID of the character whose personality should influence the question style."),
});
export type GenerateProbeQuestionsInput = z.infer<typeof GenerateProbeQuestionsInputSchema>;

const GenerateProbeQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('An array of 3-5 challenging questions related to the concept, based on its definition & clarification.'),
});
export type GenerateProbeQuestionsOutput = z.infer<typeof GenerateProbeQuestionsOutputSchema>;

export async function generateProbeQuestions(input: GenerateProbeQuestionsInput): Promise<GenerateProbeQuestionsOutput> {
  return generateProbeQuestionsFlow(input);
}

const generateProbeQuestionsPromptString = `You are an expert learning assistant. Your task is to generate challenging probe questions for a given concept based on its definition and clarification.
{{#if characterPersonality}}
You are adopting the following personality for your question generation:
{{{characterPersonality}}}
{{/if}}

Concept Title: {{{concept}}}
Concept Definition & Clarification: {{{moduleContent}}}

Generate 3-5 challenging questions that test deeper understanding of the concept based *only* on the provided definition and clarification. These questions should encourage the user to think critically, consider nuances, or explore implications mentioned in the provided text. Your question style should reflect the personality provided above, if any. Return the questions as a JSON array under the "questions" key.

Example (Neutral Personality):
{
  "questions": [
    "Based on the clarification, what is a potential limitation or edge case of this concept?",
    "How might the example provided illustrate a specific aspect mentioned in the definition?",
    "What does the clarification suggest about the relationship between this concept and [related idea mentioned in clarification]?"
  ]
}
`;

const generateProbeQuestionsFlow = baseAi.defineFlow(
  {
    name: 'generateProbeQuestionsFlow',
    inputSchema: GenerateProbeQuestionsInputSchema,
    outputSchema: GenerateProbeQuestionsOutputSchema,
  },
  async (input) => { 
    const characterPersonality = input.characterId ? await getCharacterPersonalityPrompt(input.characterId) : undefined;

    const promptInput = {
        concept: input.concept,
        moduleContent: input.moduleContent,
        characterPersonality: characterPersonality,
    };

    const {output} = await generateWithCharacter({ 
      prompt: generateProbeQuestionsPromptString,
      input: promptInput,
      output: {schema: GenerateProbeQuestionsOutputSchema},
      characterId: input.characterId,
      config: {
        temperature: 0.7, 
      }
    });

    if (!output || !Array.isArray(output.questions) || output.questions.length === 0) {
        console.warn("Probe question generation returned invalid output, using fallback.");
        return { questions: ["What is the core idea of this concept?", "How might this concept be applied?", "What questions do you still have about this concept?"] };
    }
    return output;
  }
);


    




    
