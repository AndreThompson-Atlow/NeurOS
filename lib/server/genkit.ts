import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { getCharacterPersonalityPrompt } from './characters'; 

// Main AI configuration
export const ai = genkit({
  plugins: [googleAI()],
});

/**
 * Extended generate function that can incorporate character personalities.
 */
export const generateWithCharacter = async (
  options: Parameters<typeof ai.generate>[0] & { characterId?: string }
) => {
  // Ensure options is not a Promise before destructuring
  const resolvedOptions = options instanceof Promise ? await options : options;
  const { characterId, ...baseOptions } = resolvedOptions;
  let systemPrompt = baseOptions.system;

  const modelToUse = baseOptions.model || 'googleai/gemini-1.5-flash'; 

  if (characterId) {
    const personality = await getCharacterPersonalityPrompt(characterId); 
    if (personality) {
      if (typeof systemPrompt === 'string' || systemPrompt === undefined) {
        systemPrompt = `${personality}\n\n${systemPrompt || ''}`.trim();
      } else if (Array.isArray(systemPrompt)) {
         console.warn("Character personality injection with array system prompt is not fully implemented for complex structures.");
         systemPrompt = `${personality}\n\n${systemPrompt.map(p => (p as any).text || '').join('\n')}`.trim();
      }
    }
  }
  
  return ai.generate({
    ...baseOptions,
    model: modelToUse, 
    system: systemPrompt, 
  });
};

