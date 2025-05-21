
import { z } from 'genkit';

export const GenerateReadingDialogueInputSchema = z.object({
  nodeTitle: z.string().describe("The title of the learning node."),
  nodeShortDefinition: z.string().describe("The short definition of the learning node."),
  nodeClarification: z.string().describe("The detailed clarification of the learning node."),
  moduleTitle: z.string().describe("The title of the parent module."),
  moduleAlignmentBias: z.string().optional().describe("The alignment bias of the module (law, chaos, neutral)."),
  domainTitle: z.string().describe("The title of the parent domain."),
  domainSpecters: z.array(z.string()).optional().describe("Specters associated with the domain."),
  domainCharacterAffinities: z.array(z.string()).optional().describe("Characters with affinity for the domain."),
  personalities: z.array(z.string()).min(1).max(5).describe("Array of character IDs to participate in the dialogue (3-5 recommended)."),
  previousDialogue: z.array(z.object({ characterId: z.string(), message: z.string() })).optional().describe("Previous turns in the conversation, if any.")
});
export type GenerateReadingDialogueInput = z.infer<typeof GenerateReadingDialogueInputSchema>;

export const DialogueTurnSchema = z.object({
  characterId: z.string().describe("The ID of the character speaking."),
  message: z.string().describe("The character's dialogue line."),
});

export const GenerateReadingDialogueOutputSchema = z.object({
  dialogue: z.array(DialogueTurnSchema).describe("An array of dialogue turns, each with a character ID and their line."),
  error: z.string().optional().describe("Error message if dialogue generation failed."),
});
export type GenerateReadingDialogueOutput = z.infer<typeof GenerateReadingDialogueOutputSchema>;
