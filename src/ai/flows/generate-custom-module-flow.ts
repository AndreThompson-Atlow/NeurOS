'use server';
/**
 * @fileOverview Flow for generating a custom learning module based on a topic.
 *
 * - generateCustomModule - A function that generates a module structure for a given topic.
 * - GenerateCustomModuleInput - The input type for the generateCustomModule function.
 * - GenerateCustomModuleOutput - The return type for the generateCustomModule function (matches the Module structure).
 */

import { ai as baseAi, generateWithCharacter } from '../../../lib/server/genkit'; 
// Changed from '@/lib/server/ai/characters' to relative path
import { getCharacterPersonalityPrompt } from '../../../lib/server/characters'; 
import type { Module } from '@/types/neuro';
import { placeholderEPIC } from '@/data/modules/_common'; 
import { 
    ModuleSchema, 
    type GenerateCustomModuleOutput,
    GenerateCustomModuleInputSchema,
    type GenerateCustomModuleInput
} from './types/generateCustomModuleTypes'; 


export async function generateCustomModule(input: GenerateCustomModuleInput): Promise<GenerateCustomModuleOutput> {
  return generateCustomModuleFlow(input);
}

const generateCustomModulePromptString = `You are an expert instructional designer tasked with creating a structured learning module based on a given topic.
{{#if characterPersonality}}
You are adopting the following personality for your design approach:
{{{characterPersonality}}}
{{/if}}

Topic: {{{topic}}}

Your goal is to break down the topic into a logical learning path, organized into domains and nodes, suitable for the NeuroOS learning system.

Instructions:
1.  **Module Definition:**
    *   Create a concise and engaging title for the module based on the topic.
    *   Write a brief description outlining the main learning objective.
    *   Set the module ID to "custom-module-{{topic_sanitized}}". Ensure this ID is unique and reflects the topic (e.g., 'custom-module-quantum-physics').
    *   Define 'moduleLearningGoal', 'tags' (3-5 relevant keywords), 'alignmentBias' (e.g., 'neutral', 'constructive', 'law', 'chaos'), 'defaultCompanion' (suggest one like 'neuros', 'ekitty', 'praxis', 'veritas', 'chronicler', 'architect'), 'associatedSpecters' (suggest 1-2 like 'certainty-specter', 'complexity-specter', 'fragmentation-specter', 'performance-specter'), 'recommendedChronicleDungeon' (a thematic name), 'moduleCategory' (1-2 broad categories like 'science', 'philosophy', 'personal development'), and a basic 'reviewProfile'. Default 'type' to 'auxiliary'. No dependencies for custom modules.
2.  **Domains:**
    *   Divide the topic into 2 to 4 logical domains. Each domain should represent a major sub-area or theme within the topic.
    *   Give each domain a clear title and a unique ID (e.g., 'custom-d1', 'custom-d2').
    *   For each domain, define 'learningGoal', 'chronicleTheme', 'domainDungeonType', 'characterAffinities', and 'specterAffinities'.
3.  **Nodes:**
    *   Within each domain, create 3 to 5 specific learning nodes. Each node should represent a single, digestible concept or skill.
    *   Give each node a clear title and a unique ID (e.g., 'custom-d1-n1', 'custom-d1-n2').
    *   For each node, provide:
        *   'nodeType': (concept, principle, strategy, skill)
        *   'shortDefinition': A concise definition.
        *   'learningObjective': What the user will be able to DO.
        *   'keyTerms': An array of 3-5 key terms.
        *   'download': object containing:
            *   'clarification': A more detailed explanation of the concept.
            *   'example': A simple, illustrative example.
            *   'scenario': A practical scenario showing the concept's application.
            *   'recallPrompt': A question for the user to explain the concept after reading. This should prompt for an explanation in their own words.
    *   Use the following placeholder EPIC prompts for *all* nodes:
        *   'explainPrompt': "${placeholderEPIC.explainPrompt}"
        *   'probePrompt': "${placeholderEPIC.probePrompt}"
        *   'implementPrompt': "${placeholderEPIC.implementPrompt}"
        *   'connectPrompt': "${placeholderEPIC.connectPrompt}"
    *   Set 'familiar', 'understood' to 'false' and 'status' to 'new' for all nodes initially.
    *   Include a brief 'reviewHint' for each node.
    *   Include an empty 'chronicleEncounter' object: { "emotionalTheme": "", "signatureEncounter": "" } for each node.
4.  **Output Format:** Return the entire structure as a JSON object conforming to the provided Module schema. Ensure all IDs are unique and follow the pattern ('custom-module-&lt;topic&gt;', 'custom-d&lt;index&gt;', 'custom-d&lt;index&gt;-n&lt;index&gt;'). The personality (if any) should subtly influence the tone, examples, or focus areas chosen, but the structure must remain consistent.

Example Node ID Structure:
- Module ID: custom-module-topic-name
- Domain 1 ID: custom-d1
- Node 1 in Domain 1 ID: custom-d1-n1

Generate the learning module now based on the topic: {{{topic}}}.
`;

const generateCustomModuleFlow = baseAi.defineFlow(
  {
    name: 'generateCustomModuleFlow',
    inputSchema: GenerateCustomModuleInputSchema,
    outputSchema: ModuleSchema,
  },
  async (input) => { 
    console.log(`Generating custom module for topic: ${input.topic}`);
    const characterPersonality = input.characterId ? await getCharacterPersonalityPrompt(input.characterId) : undefined;
    const sanitizedTopic = input.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const promptInput = {
        topic: input.topic,
        topic_sanitized: sanitizedTopic || 'untitled',
        characterPersonality: characterPersonality,
    };
    
    const { output } = await generateWithCharacter({ 
      prompt: generateCustomModulePromptString,
      input: promptInput,
      output: { schema: ModuleSchema },
      characterId: input.characterId, 
      config: {
        temperature: 0.6, 
      }
    });

    if (!output) {
        console.error("AI failed to generate module structure.");
        throw new Error("Module generation failed. The AI did not return a valid structure.");
    }

    if (!output.title || !output.description || !output.domains || output.domains.length === 0) {
        console.error("Generated module is incomplete:", output);
        throw new Error("Module generation failed. The AI returned an incomplete structure.");
    }
    
    output.id = `custom-module-${sanitizedTopic || 'untitled'}`;
    output.type = 'auxiliary'; 
    output.dependencies = []; 

     output.domains.forEach((domain, dIdx) => {
        domain.id = domain.id || `custom-d${dIdx + 1}`; 
        (domain.nodes || []).forEach((node, nIdx) => {
            node.id = node.id || `${domain.id}-n${nIdx + 1}`; 
            node.moduleId = output.id; 
            node.domainId = domain.id; 
            node.status = node.status || 'new';
            node.familiar = node.familiar ?? false;
            node.understood = node.understood ?? false;
            node.nodeType = node.nodeType || 'concept';
            node.download = node.download || { clarification: '', example: '', scenario: '', recallPrompt: `Explain "${node.title}"`};
            node.download.recallPrompt = node.download.recallPrompt || `Explain "${node.title}."`;
            node.epic = node.epic || { ...placeholderEPIC };
            node.epic.explainPrompt = node.epic.explainPrompt || placeholderEPIC.explainPrompt;
            node.epic.probePrompt = node.epic.probePrompt || placeholderEPIC.probePrompt;
            node.epic.implementPrompt = node.epic.implementPrompt || placeholderEPIC.implementPrompt;
            node.epic.connectPrompt = node.epic.connectPrompt || placeholderEPIC.connectPrompt;
            
            node.reviewHint = node.reviewHint || `Recall the key aspects of ${node.title}.`;
            node.chronicleEncounter = node.chronicleEncounter || { emotionalTheme: "", signatureEncounter: "" };
        });
    });

    console.log(`Successfully generated module: ${output.title}`);
    return output as GenerateCustomModuleOutput;
  }
);


    




    
