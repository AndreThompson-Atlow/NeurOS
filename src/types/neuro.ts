import type { ChronicleRunState, Companion as ChronicleCompanion, Quest, PlayerCharacter as ChroniclePlayerCharacter, Spellbook, Item as ChronicleItem, Ability as ChronicleAbility, EntityStats as ChronicleEntityStats, BattleActionRequest, EPICChallenge as ChronicleEPICChallenge, EPICResponse as ChronicleEPICResponse } from './chronicle'; // Import ChronicleRunState

export type LearningPhase = 'reading' | 'download' | 'install';

export type ModuleType = 'core' | 'pillar' | 'auxiliary' | 'challenge';
export type ModuleStatus = 'new' | 'in_library' | 'downloading' | 'downloaded' | 'installing' | 'installed';
export type NodeStatus = 'new' | 'familiar' | 'understood' | 'mastered' | 'needs_review';
export type NodeType = 'concept' | 'principle' | 'strategy' | 'skill';

// --- Thought Analyzer & Neural Shame Engine Core Types (Codex III) ---
export interface LogicalViolation {
  type: string; // e.g., "affirming the consequent", "ad hominem"
  segment: string; // Text segment where violation occurred
  explanation: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface CognitiveBias {
  type: string; // e.g., "confirmation bias", "anchoring"
  segment?: string;
  explanation: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface EpistemicDistortion {
  type: string; // e.g., "overgeneralization", "misinterpreting evidence"
  segment?: string;
  explanation: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface EmotionalInterference {
  type: string; // e.g., "emotional reasoning", "ego defense"
  detectedEmotion: string;
  segment?: string;
  explanation: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface LanguageIssue {
  type: string; // e.g., "ambiguity", "jargon", "imprecision"
  segment: string;
  suggestion: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface CognitivePattern {
  patternId: string;
  name: string; // e.g., "Tendency towards black-and-white thinking"
  description: string;
  frequency?: number;
  implications?: string;
}

export interface RecursiveStructure {
  type: string; // e.g., "self-referential loop", "infinite regress"
  description: string;
  detectedIn: string; // Where it was found
}

export interface Issue { // Generic issue type for domainSpecificIssues
  type: string;
  description: string;
  severity: number;
}

export interface ThoughtQuality {
  logicalIntegrity: number;      // 0-100
  epistemicCalibration: number;  // 0-100
  cognitiveFlexibility: number;  // 0-100
  emotionalIntegration: number;  // 0-100
  metacognitiveAwareness: number; // 0-100
  expressiveClarity: number;     // 0-100
}

export interface AnalysisResult {
  logicalViolations: LogicalViolation[];
  cognitiveBiases: CognitiveBias[];
  epistemicDistortions: EpistemicDistortion[];
  emotionalInterference: EmotionalInterference[];
  languageIssues: LanguageIssue[];
  thoughtQuality: ThoughtQuality;
  detectedPatterns: CognitivePattern[];
  recursiveStructures: RecursiveStructure[];
  domainSpecificIssues: Record<string, Issue[]>; // Keyed by domain ID or area
  overallScore?: number; // May be derived from thoughtQuality or specific rubric
  feedbackSummary?: string; // General feedback from analyzer
  thoughtPatterns?: string[];
  cognitiveStrengths?: string[];
  cognitiveWeaknesses?: string[];
  recommendations?: string[];
}

export type ShameCategory = "Compromised" | "Shaky" | "Stable" | "Strong" | "Architect";

export interface ShameTrigger {
  triggerId: string;
  description: string; // e.g., "fear of intellectual inadequacy"
  sensitivity: number; // 0-1
}

export interface GrowthEdge {
  edgeId: string;
  domain: string; // e.g., "logicalIntegrity", "emotionalIntegration"
  description: string; // e.g., "Developing comfort with ambiguity"
  recommendedAction: string;
}

export interface ShameIndexResult {
  score: number;              // 0-100 overall score
  category: ShameCategory;
  strengths: string[];        // Areas of cognitive strength
  vulnerabilities: string[];  // IDs or descriptions of shame triggers most relevant
  growthEdges: GrowthEdge[];
  recommendedChallengeIntensity: number; // 0-100, for next challenge
  overallScore?: number;      // Alias for score
  triggers?: string[];        // Alias for vulnerabilities
  recommendations?: string[]; // Derived from growthEdges
}

export interface FeedbackOutput {
  mainFeedback: string;
  growthSuggestions?: string[];
  metacognitivePrompts?: string[];
  warningFlags?: string[]; // e.g., "High risk of shame trigger activation"
  detailedBreakdown?: string[]; // Make it optional
  suggestions?: string[];  // Alias for growthSuggestions
}

export interface LearningEvent {
  timestamp: Date;
  eventType: string; // e.g., "node_recall_pass", "epic_probe_fail", "chronicle_specter_defeat"
  details: Record<string, any>;
}

export interface ShameProfile {
  overallResilience: number; // 0-100
  domainResilience: Record<string, number>; // e.g., { "logic": 70, "emotion": 50 }
  knownTriggers: ShameTrigger[]; // Active triggers for this user
  responseHistory: any[]; // Simplified for now
}

export interface UserProfile {
  cognitivePatterns: CognitivePattern[];
  domainProficiency: Record<string, number>; // Module or Domain ID to proficiency score
  knownTriggers: ShameTrigger[];
  shameProfile: ShameProfile;
  learningHistory: LearningEvent[];
  thresholds: {
    challengeTolerance: number; // 0-100
    recoveryRate: number; // 0-1 (e.g., how quickly shame index returns to baseline)
    optimalChallengeZone: { min: number; max: number }; // 0-100 intensity
  };
}

// --- Original Neuro Types ---
export interface NodeDownload {
    clarification: string;
    example: string;
    scenario: string;
    recallPrompt: string;
}

export interface NodeEPIC {
  explainPrompt: string;
  probeQuestions?: [string, string, string]; // Temporarily optional during migration
  implementPrompt: string;
  connectPrompt: string;
  connectTo?: string[]; // Optional for now, as it was added later
  [key: string]: string | string[] | undefined; // Make it indexable by string keys
}

export interface Node {
  id: string;
  moduleId: string; 
  domainId: string; 
  nodeType: NodeType;
  title: string;
  shortDefinition: string;
  learningObjective: string;
  keyTerms: string[];
  download: NodeDownload;
  epic: NodeEPIC;
  familiar: boolean;
  understood: boolean;
  status: NodeStatus;
  memoryStrength?: number; // 0-100
  lastReviewed?: Date;
  reviewHint?: string;
  chronicleEncounter?: {
    emotionalTheme?: string;
    signatureEncounter?: string; // Could be an encounter ID
  };
  clarification?: string;
  example?: string;
}

export interface Domain {
  id: string;
  title: string;
  learningGoal: string;
  chronicleTheme: string;
  domainDungeonType: string;
  characterAffinities: string[];
  specterAffinities: string[];
  nodes: Node[]; 
}

export interface ModuleReviewProfile {
    decayModel: string; // e.g., "standard_exponential", "performance_adaptive"
    reviewClusters: string[][]; // Groups of node IDs for clustered review
    interleaveRatio: number; // 0-1, how much to interleave with new content
}

export interface Module {
  id: string;
  type: ModuleType;
  title: string;
  description: string;
  moduleLearningGoal: string;
  domains: Domain[];
  status: ModuleStatus;
  dependencies?: string[];
  tags?: string[];
  alignmentBias: string; 
  defaultCompanion: string; 
  associatedSpecters: string[]; 
  recommendedChronicleDungeon: string;
  moduleCategory: string[]; 
  reviewProfile: ModuleReviewProfile;
}

export interface EPICGenerationMetadata {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  lastAttempt?: Date;
  errorMessage?: string;
}

export interface WikiModule extends Omit<Module, 'domains'> { // WikiModule might not have pre-defined domains fully, or they are generated
  domains: Partial<Domain>[]; // Allow domains to be partially defined or generated
  sourceUrl: string;
  extractionDate: Date;
  confidenceScore: number; 
  generatedContent: boolean; 
  epicGenerationStatus?: EPICGenerationMetadata;
  shortDefinition?: string; // Add this property to match usage in the code
}


export interface LearningProgress {
  currentModuleId: string | null;
  currentDomainIndex: number;
  currentNodeIndex: number;
  currentPhase: LearningPhase;
  knowledgeChecks?: Record<string, KnowledgeCheckSet>;
  completedDomainIntegrations?: string[];
  completedModuleIntegrations?: boolean;
}


export interface PlayerCharacterBase {
    id: string;
    name: string;
    maxHealth: number;
    maxMana: number;
    speed: number;
    strength: number; 
    intelligence: number; 
    wisdom: number;
    adaptability: number;
    elementalWeaknesses: string[];
    elementalResistances: string[];
    spellbooks: Spellbook[];
    equippedSpellbookId: string | null;
    inventory: ChronicleItem[];
    party?: ChronicleCompanion[]; 
    stats?: ChronicleEntityStats; 
}


export interface ActiveReadingSession {
    moduleId: string;
    currentPage: number;
    totalPages: number;
    content: string[];
    domainIndex?: number;
    nodeIndex?: number;
}

export type EpicStep = 'explain' | 'probe' | 'implement' | 'connect';

export interface UserInput {
    content: string;
    timestamp?: Date;
    type?: 'text' | 'voice';
    text?: string;
    input?: string;
}
export interface AnalysisContext {
    currentNode: Node;
    currentDomain: Domain;
    currentModule: Module;
    learningPhase: LearningPhase;
    epicStep?: EpicStep;
    interactionType?: 'recall' | 'epic_explain' | 'epic_probe' | 'epic_implement' | 'epic_connect' | 'review' | 'chronicle_interaction' | 'diagnostic';
    componentType?: string;
    nodeId?: string;
    moduleId?: string;
    nodeTitle?: string;
    learningObjective?: string;
    encounterId?: string;
}

// New/Updated types for detailed rubric-based evaluation
export interface RubricDimensionScore {
  label: string;
  score: number;
  feedback: string;
}

export interface RubricScores {
  [key: string]: RubricDimensionScore;
}

export interface QualityFlags {
  isComplete: boolean;
  isAccurate: boolean;
  isRelevant: boolean;
  isWellStructured: boolean;
  showsUnderstanding: boolean;
  mimicry?: boolean;
  insufficientLength?: boolean;
  lowCoherence?: boolean;
}

export interface EvaluationResult {
  score: number;
  overallFeedback: string;
  isPass: boolean;
  rubricScores?: RubricScores;
  qualityFlags?: QualityFlags;
  personalityFeedback?: string;
  analysisResult?: any;
  shameIndexResult?: any;
  feedbackOutput?: any;
}


export interface ReviewSessionNode {
  moduleId: string;
  nodeId: string;
  epicComponentToReview: EpicStep;
  priorityScore?: number;
  lastReviewed?: Date;
  currentMemoryStrength?: number;
  reviewDueDate?: Date;
}

export interface ActiveReviewSession {
  nodesToReview: ReviewSessionNode[];
  currentNodeIndex: number;
  moduleId: string;
  epicComponentToReview: EpicStep;
  sessionId?: string;
  startTime?: Date;
}

export interface DiagnosticTest {
    id: string;
    questions: KnowledgeCheckQuestion[];
    domain: string;
    difficulty: number;
}

export interface UserLearningState {
    modules: Record<string, Module | WikiModule>;
    activeSession: LearningProgress | null;
    activeChronicleRun: any | null;
    playerCharacterBase: any;
    activeReadingSession: ActiveReadingSession | null;
    currentUserProfile: UserProfile | null;
    activeReviewSession: ActiveReviewSession | null;
    isThoughtAnalyzerEnabled: boolean;
    currentLearningFlow?: string;
    aiProvider?: string; // Current AI provider: 'gemini', 'openai', or 'claude'
}

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  correctOptionIndex?: number; // Alias for correctAnswer
  explanation: string;
}

export interface KnowledgeCheckSet {
  questions: KnowledgeCheckQuestion[];
  domain: string;
  difficulty: number;
  nodeId?: string;
  completed?: boolean;
  score?: number;
}
