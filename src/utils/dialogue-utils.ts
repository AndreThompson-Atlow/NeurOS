import type { Module, Domain, Node as NeuroNode } from '@/types/neuro';
import type { GenerateReadingDialogueOutput } from '@/ai/flows/types/generateReadingDialogueTypes';

// Function to get user's selected AI provider from localStorage
function getUserAIProvider(): { provider?: string; modelKey?: string } {
  if (typeof window === 'undefined') {
    return {}; // Server-side, let API handle defaults
  }
  
  try {
    const learningStateJSON = localStorage.getItem('neuroosV2LearningState_v0_1_3');
    if (learningStateJSON) {
      const learningState = JSON.parse(learningStateJSON);
      const aiProvider = learningState?.aiProvider;
      if (aiProvider) {
        console.log(`📱 [DIALOGUE-UTILS] Retrieved AI provider from localStorage: "${aiProvider}"`);
        return { provider: aiProvider, modelKey: aiProvider };
      }
    }
  } catch (error) {
    console.warn('📱 [DIALOGUE-UTILS] Error reading AI provider from localStorage:', error);
  }
  
  console.log(`📱 [DIALOGUE-UTILS] No AI provider found in localStorage, using defaults`);
  return {}; // Let API handle defaults
}

/**
 * Generate dialogue directly using the multi-dialogue API endpoint which supports provider selection
 */
export async function generateDialogueDirectly(
  node: NeuroNode,
  module: Module,
  domain: Domain,
  personalities: string[],
  previousDialogue?: { characterId: string; message: string }[]
): Promise<GenerateReadingDialogueOutput> {
  try {
    // Get the user's selected AI provider from localStorage
    const userProvider = getUserAIProvider();
    
    console.log(`🎯 [DIALOGUE-UTILS] Making API call with provider:`, userProvider);
    
    const response = await fetch('/api/multi-dialogue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodeTitle: node.title,
        nodeShortDefinition: node.shortDefinition,
        nodeClarification: node.download.clarification,
        moduleTitle: module.title,
        moduleAlignmentBias: module.alignmentBias,
        domainTitle: domain.title,
        domainSpecters: domain.specterAffinities,
        domainCharacterAffinities: domain.characterAffinities,
        personalities: personalities,
        previousDialogue: previousDialogue,
        // Now actually pass the provider information
        provider: userProvider.provider,
        modelKey: userProvider.modelKey,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Multi-dialogue API returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Multi-dialogue generation failed:", error);
    throw error;
  }
} 