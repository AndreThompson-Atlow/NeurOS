
import { config } from 'dotenv';
config();

// Ensure Genkit and Characters are initialized from their new server location if dev.ts itself relies on them.
// However, dev.ts typically just imports flows, which internally import genkit/characters.
// So direct imports of genkit/characters here might not be needed unless dev.ts uses them directly.

import '@/ai/flows/generate-probe-questions';
import '@/ai/flows/evaluate-response-flow';
import '@/ai/flows/generate-custom-module-flow';
import '@/ai/flows/thought-analyzer-flow';
import '@/ai/flows/neural-shame-engine-flow';
import '@/ai/flows/generate-dialogue-flow';
import '@/ai/flows/generateReadingDialogueFlow'; // Assuming this was also an AI flow
import '@/ai/schemas';
