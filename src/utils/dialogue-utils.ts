import type { Module, Domain, Node as NeuroNode } from '@/types/neuro';
import type { GenerateReadingDialogueOutput } from '@/ai/flows/types/generateReadingDialogueTypes';

/**
 * Generate dialogue directly using the direct API endpoint
 */
export async function generateDialogueDirectly(
  node: NeuroNode,
  module: Module,
  domain: Domain,
  personalities: string[],
  previousDialogue?: { characterId: string; message: string }[]
): Promise<GenerateReadingDialogueOutput> {
  try {
    console.log("Using direct dialogue API endpoint");
    
    const response = await fetch('/api/direct-dialogue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodeTitle: node.title,
        nodeShortDefinition: node.shortDefinition,
        nodeClarification: node.clarification,
        moduleTitle: module.title,
        moduleAlignmentBias: module.alignmentBias,
        domainTitle: domain.title,
        domainSpecters: domain.specterAffinities,
        domainCharacterAffinities: domain.characterAffinities,
        personalities: personalities,
        previousDialogue: previousDialogue,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Direct dialogue API returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Direct dialogue generation failed:", error);
    throw error;
  }
} 