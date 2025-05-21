
import { z } from 'genkit';
import { placeholderEPIC } from '@/data/modules/_common';

export const NodeEPICSchema = z.object({
  explainPrompt: z.string().describe("Instruction for the 'Explain' EPIC step."),
  probePrompt: z.string().describe("Instruction for the 'Probe' EPIC step."),
  implementPrompt: z.string().describe("Instruction for the 'Implement' EPIC step."),
  connectPrompt: z.string().describe("Instruction for the 'Connect' EPIC step."),
});

export const NodeSchema = z.object({
  id: z.string().describe("Unique identifier for the node (e.g., 'custom-d1-n1')."),
  title: z.string().describe("Concise title for the learning concept/node."),
  shortDefinition: z.string().describe("A brief, clear definition of the concept (replaces 'definition')."),
  learningObjective: z.string().describe("What the user should be able to do after this node."),
  keyTerms: z.array(z.string()).describe("Key vocabulary or terms related to this node."),
  download: z.object({
      clarification: z.string().describe("A detailed explanation of the concept (replaces 'explanation')."),
      example: z.string().describe("A simple example illustrating the concept."),
      scenario: z.string().describe("A scenario showing the concept's application in a real-world context (replaces 'realWorldScenario')."),
      recallPrompt: z.string().describe("The prompt for the recall phase of download.")
  }),
  epic: NodeEPICSchema.describe("Prompts for the EPIC learning steps.").default(placeholderEPIC),
  familiar: z.boolean().default(false).describe("Initial state for download phase completion."),
  understood: z.boolean().default(false).describe("Initial state for install phase completion."),
  status: z.enum(['new', 'familiar', 'understood', 'needs_review']).default('new').describe("Lifecycle status of the node."),
  nodeType: z.enum(['concept', 'principle', 'strategy', 'skill']).default('concept').describe("Type of learning node."),
  reviewHint: z.string().optional().describe("A hint for reviewing this node."),
  chronicleEncounter: z.object({
    emotionalTheme: z.string().optional(),
    signatureEncounter: z.string().optional(),
  }).optional().describe("Chronicle encounter details related to this node."),
  moduleId: z.string().optional(), // Added to match type
  domainId: z.string().optional(), // Added to match type
  memoryStrength: z.number().optional(), // Added to match type
  lastReviewed: z.date().optional(), // Added to match type
});


export const DomainSchema = z.object({
  id: z.string().describe("Unique identifier for the domain (e.g., 'custom-d1')."),
  title: z.string().describe("Title of the learning domain."),
  nodes: z.array(NodeSchema).describe("An array of learning nodes within this domain."),
  learningGoal: z.string().optional().describe("Overall learning goal for this domain."),
  chronicleTheme: z.string().optional().describe("Theme for Chronicle encounters in this domain."),
  domainDungeonType: z.string().optional().describe("Specific dungeon type for this domain if applicable."),
  characterAffinities: z.array(z.string()).optional().describe("Character IDs with affinity for this domain."),
  specterAffinities: z.array(z.string()).optional().describe("Specter IDs associated with this domain."),
});

export const ModuleSchema = z.object({
  id: z.string().default('custom-module').describe("Identifier for the module, typically 'custom-module'."),
  title: z.string().describe("Overall title of the generated learning module."),
  description: z.string().describe("A brief description of the module's learning goal."),
  domains: z.array(DomainSchema).min(2).max(4).describe("An array of 2-4 learning domains."),
  moduleLearningGoal: z.string().optional().describe("The overarching learning goal for the entire module."),
  tags: z.array(z.string()).optional().describe("Keywords for categorization."),
  alignmentBias: z.string().optional().describe("Philosophical alignment (e.g., constructive, neutral)."),
  defaultCompanion: z.string().optional().describe("Default companion ID for this module."),
  associatedSpecters: z.array(z.string()).optional().describe("Specter IDs often encountered with this module."),
  recommendedChronicleDungeon: z.string().optional().describe("A fitting Chronicle dungeon name or theme."),
  moduleCategory: z.array(z.string()).optional().describe("Broad categories for the module."),
  reviewProfile: z.object({
      decayModel: z.string().default('standard_exponential'),
      reviewClusters: z.array(z.array(z.string())).default([]),
      interleaveRatio: z.number().default(0.2),
  }).optional().describe("Profile for spaced repetition reviews."),
  type: z.enum(['core', 'pillar', 'auxiliary', 'challenge']).default('auxiliary').describe("Type of module."), 
  dependencies: z.array(z.string()).optional().describe("Module IDs this module depends on.") 
});
export type GenerateCustomModuleOutput = z.infer<typeof ModuleSchema>;

export const GenerateCustomModuleInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a learning module.'),
  characterId: z.string().optional().describe("Optional ID of the character whose personality should influence the module generation style (e.g., Neuros for structured, E-KiTTY for creative)."),
});
export type GenerateCustomModuleInput = z.infer<typeof GenerateCustomModuleInputSchema>;
