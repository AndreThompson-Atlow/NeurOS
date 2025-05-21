import {z} from 'genkit';
import type { RubricScores as NeuroRubricScores, QualityFlags as NeuroQualityFlags, RubricDimensionScore as NeuroRubricDimensionScore, FeedbackOutput as NeuroFeedbackOutput, AnalysisResult, ShameIndexResult } from '@/types/neuro';

/**
 * Schema for input to the evaluateResponse function
 */
export const EvaluateResponseInputSchema = z.object({
  nodeTitle: z.string().describe('The title of the concept/node being learned.'),
  nodeDefinition: z.string().describe('The brief definition of the concept.'),
  nodeExplanation: z.string().describe('The detailed clarification or explanation of the concept for context.'),
  stepType: z.enum(['recall', 'explain', 'probe', 'implement', 'connect', 'diagnostic', 'review', 'chronicle_interaction']).describe('The type of learning step.'),
  stepPrompt: z.string().describe('The specific instruction or question given to the user for this step.'),
  userResponse: z.string().describe("The user's submitted response for the step."),
  judgingCharacterId: z.string().optional().describe("ID of the AI character whose personality should influence the evaluation style for generic feedback."),
  nodeContent: z.string().optional().describe("The full content of the node (clarification, example, scenario) for mimicry detection if available."),
  isThoughtAnalyzerEnabled: z.boolean().optional().describe("Flag to indicate if full Thought Analyzer processing is enabled.")
});
export type EvaluateResponseInput = z.infer<typeof EvaluateResponseInputSchema>;

/**
 * Schema for a single dimension score in the rubric
 */
export const RubricDimensionScoreSchema = z.object({
  score: z.number().min(0).max(1.0).describe("Score for this dimension, from 0.0 (poor) to 1.0 (excellent)."),
  label: z.string().max(30).describe("Short narrative label (2-5 words) for this dimension's score, e.g., 'Very clear,' 'Lacks depth'.")
}) satisfies z.ZodType<NeuroRubricDimensionScore>; 

/**
 * Schema for all rubric scores
 */
export const RubricScoresSchema = z.object({
  clarity: RubricDimensionScoreSchema.optional(),
  relevance: RubricDimensionScoreSchema.optional(),
  depthOfThought: RubricDimensionScoreSchema.optional(),
  domainAlignment: RubricDimensionScoreSchema.optional(),
  logicalIntegrity: RubricDimensionScoreSchema.optional(),
  specificity: RubricDimensionScoreSchema.optional(),
  voiceAppropriateness: RubricDimensionScoreSchema.optional(),
  originality: RubricDimensionScoreSchema.optional(),
});

/**
 * Schema for quality flags in the evaluation
 */
export const QualityFlagsSchema = z.object({
  mimicry: z.boolean().optional(),
  insufficientLength: z.boolean().optional(),
  lowCoherence: z.boolean().optional(),
});

const requiredDimensionsForTransform = ['clarity', 'relevance', 'depthOfThought', 'domainAlignment', 'logicalIntegrity', 'specificity', 'voiceAppropriateness', 'originality'] as const;

/**
 * Schema for the detailed evaluation result
 */
export const DetailedEvaluationResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100).describe('A derived overall score from 0 to 100.'),
  overallFeedback: z.string().describe('Generic constructive feedback explaining the overall score and highlighting key areas for improvement. This feedback should be character-neutral or adopt the judgingCharacter persona if provided.'),
  isPass: z.boolean().describe('Whether the overall score and rubric scores meet the passing threshold.'),
  rubricScores: RubricScoresSchema.transform(val => {
        const ensuredScores: Partial<NeuroRubricScores> = {};
        for (const dim of requiredDimensionsForTransform) {
            const providedDim = val[dim];
            const score = (providedDim && typeof providedDim.score === 'number') ? Math.max(0, Math.min(1, providedDim.score)) : 0.0;
            const label = (providedDim && typeof providedDim.label === 'string' && providedDim.label.trim() !== "") ? providedDim.label.trim() : `${dim.charAt(0).toUpperCase() + dim.slice(1).replace(/([A-Z])/g, ' $1')} N/A`;
            ensuredScores[dim] = { score, label };
        }
        return ensuredScores as NeuroRubricScores; 
    }).describe("Detailed scores for each rubric dimension."), // Added describe
  qualityFlags: QualityFlagsSchema.transform(val => ({ 
        mimicry: val.mimicry ?? false,
        insufficientLength: val.insufficientLength ?? false,
        lowCoherence: val.lowCoherence ?? false,
    })).describe("Flags indicating specific quality issues."), // Added describe
  personalityFeedback: z.string().optional().describe("Concise, in-character feedback from the judging AI personality (1-3 sentences)."),
  analysisResult: z.custom<AnalysisResult>().optional().describe("Full analysis result from the Thought Analyzer."), // Use z.custom for external types
  shameIndexResult: z.custom<ShameIndexResult>().optional().describe("Result from the Neural Shame Engine."), // Use z.custom for external types
  feedbackOutput: z.custom<NeuroFeedbackOutput>().optional().describe("Combined feedback output including growth suggestions."), // Use z.custom for external types
  debug_rawAiOutput: z.string().nullable().optional().describe("Raw AI output for debugging purposes."), // Changed to nullable and optional
  debug_error: z.string().nullable().optional().describe("Error message from server-side processing for debugging."), // Changed to nullable and optional
});
export type EvaluateResponseOutput = z.infer<typeof DetailedEvaluationResultSchema>;

/**
 * Schema for the simplified LLM output when Thought Analyzer is OFF
 */
export const simplifiedLlmOutputSchema = z.object({
    overallScore: z.number().int().min(0).max(100),
    overallFeedback: z.string().min(1, "Overall feedback cannot be empty."),
});
export type SimplifiedLlmOutput = z.infer<typeof simplifiedLlmOutputSchema>;

/**
 * DialogueTurn interface for dialogue generation types
 */
export interface DialogueTurn {
    speaker: string;
    text: string;
    emotion?: string;
    isPlayer?: boolean;
}
