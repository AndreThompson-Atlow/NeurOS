
import { z } from 'genkit';
import type { UserProfile as NeuroUserProfileType, ThoughtQuality as NeuroThoughtQuality, LogicalViolation as NeuroLogicalViolation, CognitiveBias as NeuroCognitiveBias, EpistemicDistortion as NeuroEpistemicDistortion, EmotionalInterference as NeuroEmotionalInterference, LanguageIssue as NeuroLanguageIssue, CognitivePattern as NeuroCognitivePattern, RecursiveStructure as NeuroRecursiveStructure, Issue as NeuroIssue, AnalysisResult as NeuroAnalysisResult, ShameIndexResult as NeuroShameIndexResult, FeedbackOutput as NeuroFeedbackOutput, GrowthEdge as NeuroGrowthEdge, ShameTrigger as NeuroShameTrigger } from '@/types/neuro';


// Schemas for Thought Analyzer Flow
export const UserInputSchema = z.object({
  text: z.string().describe("The user's textual input to be analyzed."),
});

export const AnalysisContextSchema = z.object({
  domain: z.string().optional().describe("The learning domain, e.g., 'Sovereign Core'."),
  nodeTitle: z.string().optional().describe("The title of the specific node or concept."),
  learningObjective: z.string().optional().describe("The learning objective for the current context."),
  interactionType: z.enum(['recall', 'epic_explain', 'epic_probe', 'epic_implement', 'epic_connect', 'review', 'chronicle_interaction', 'diagnostic']).describe("The type of interaction being analyzed."),
  moduleId: z.string().optional(),
  nodeId: z.string().optional(),
  componentType: z.string().optional(), // For EPIC steps
  encounterId: z.string().optional(), // For Chronicle interactions
  previousAnalysis: z.any().optional(), // Placeholder for actual previousAnalysis schema if needed
});

export const AnalyzeThoughtProcessInputSchema = z.object({
    userInput: UserInputSchema,
    analysisContext: AnalysisContextSchema,
});

const LogicalViolationSchema = z.object({
    type: z.string(),
    segment: z.string(),
    explanation: z.string(),
    severity: z.number().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
}) satisfies z.ZodType<NeuroLogicalViolation>;

const CognitiveBiasSchema = z.object({
    type: z.string(),
    segment: z.string().optional(),
    explanation: z.string(),
    severity: z.number().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
}) satisfies z.ZodType<NeuroCognitiveBias>;

const EpistemicDistortionSchema = z.object({
    type: z.string(),
    segment: z.string().optional(),
    explanation: z.string(),
    severity: z.number().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
}) satisfies z.ZodType<NeuroEpistemicDistortion>;

const EmotionalInterferenceSchema = z.object({
    type: z.string(),
    detectedEmotion: z.string(),
    segment: z.string().optional(),
    explanation: z.string(),
    severity: z.number().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
}) satisfies z.ZodType<NeuroEmotionalInterference>;

const LanguageIssueSchema = z.object({
    type: z.string(),
    segment: z.string(),
    suggestion: z.string(),
    severity: z.number().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
}) satisfies z.ZodType<NeuroLanguageIssue>;

const ThoughtQualitySchema = z.object({
  logicalIntegrity: z.number().min(0).max(100),
  epistemicCalibration: z.number().min(0).max(100),
  cognitiveFlexibility: z.number().min(0).max(100),
  emotionalIntegration: z.number().min(0).max(100),
  metacognitiveAwareness: z.number().min(0).max(100),
  expressiveClarity: z.number().min(0).max(100),
}) satisfies z.ZodType<NeuroThoughtQuality>;

const CognitivePatternSchema = z.object({
    patternId: z.string(),
    name: z.string(),
    description: z.string(),
    frequency: z.number().optional(),
    implications: z.string().optional(),
}) satisfies z.ZodType<NeuroCognitivePattern>;

const RecursiveStructureSchema = z.object({
    type: z.string(),
    description: z.string(),
    detectedIn: z.string(),
}) satisfies z.ZodType<NeuroRecursiveStructure>;

const IssueSchema = z.object({
    type: z.string(),
    description: z.string(),
    severity: z.number(),
}) satisfies z.ZodType<NeuroIssue>;

export const AnalyzeThoughtProcessOutputSchema = z.object({
  logicalViolations: z.array(LogicalViolationSchema).default([]),
  cognitiveBiases: z.array(CognitiveBiasSchema).default([]),
  epistemicDistortions: z.array(EpistemicDistortionSchema).default([]),
  emotionalInterference: z.array(EmotionalInterferenceSchema).default([]),
  languageIssues: z.array(LanguageIssueSchema).default([]),
  thoughtQuality: ThoughtQualitySchema,
  detectedPatterns: z.array(CognitivePatternSchema).default([]),
  recursiveStructures: z.array(RecursiveStructureSchema).default([]),
  domainSpecificIssues: z.record(z.string(), z.array(IssueSchema)).default({}),
  overallScore: z.number().min(0).max(100).optional(),
  feedbackSummary: z.string().optional(),
}) satisfies z.ZodType<NeuroAnalysisResult>;


// Schemas for Neural Shame Engine Flow
const ShameTriggerSchema = z.object({
  triggerId: z.string(),
  description: z.string(),
  sensitivity: z.number().min(0).max(1),
}) satisfies z.ZodType<NeuroShameTrigger>;

const ShameProfileSchema = z.object({
  overallResilience: z.number().min(0).max(100).default(70),
  domainResilience: z.record(z.string(), z.number()).default({}),
  knownTriggers: z.array(ShameTriggerSchema).default([]),
  responseHistory: z.array(z.any()).default([]), // Simplified
});

const UserProfileSchema = z.object({
  cognitivePatterns: z.array(CognitivePatternSchema).default([]),
  domainProficiency: z.record(z.string(), z.number()).default({}),
  knownTriggers: z.array(ShameTriggerSchema).default([]),
  shameProfile: ShameProfileSchema.default({ overallResilience: 70, domainResilience: {}, knownTriggers: [], responseHistory:[] }),
  learningHistory: z.array(z.any()).default([]), // Simplified
  thresholds: z.object({
    challengeTolerance: z.number().default(75),
    recoveryRate: z.number().default(0.5),
    optimalChallengeZone: z.object({ min: z.number().default(60), max: z.number().default(85) }),
  }).default({ challengeTolerance: 75, recoveryRate: 0.5, optimalChallengeZone: {min: 60, max: 85} }),
}) satisfies z.ZodType<NeuroUserProfileType>;


export const ProcessWithShameEngineInputSchema = z.object({
  analysisResult: AnalyzeThoughtProcessOutputSchema,
  userProfile: UserProfileSchema,
});

const GrowthEdgeSchema = z.object({
    edgeId: z.string(),
    domain: z.string(),
    description: z.string(),
    recommendedAction: z.string(),
}) satisfies z.ZodType<NeuroGrowthEdge>;

const ShameIndexResultSchema = z.object({
  score: z.number().min(0).max(100),
  category: z.enum(["Compromised", "Shaky", "Stable", "Strong", "Architect"]),
  strengths: z.array(z.string()),
  vulnerabilities: z.array(z.string()),
  growthEdges: z.array(GrowthEdgeSchema),
  recommendedChallengeIntensity: z.number().min(0).max(100),
}) satisfies z.ZodType<NeuroShameIndexResult>;

const FeedbackOutputSchema = z.object({
  mainFeedback: z.string(),
  growthSuggestions: z.array(z.string()).optional(),
  metacognitivePrompts: z.array(z.string()).optional(),
  warningFlags: z.array(z.string()).optional(),
}) satisfies z.ZodType<NeuroFeedbackOutput>;

export const ProcessWithShameEngineOutputSchema = z.object({
  shameIndexResult: ShameIndexResultSchema,
  feedbackOutput: FeedbackOutputSchema,
});
