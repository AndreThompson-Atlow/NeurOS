import type { ChronicleRunState, Companion as ChronicleCompanion, Quest, PlayerCharacter as ChroniclePlayerCharacter, Spellbook, Item as ChronicleItem, Ability as ChronicleAbility, EntityStats as ChronicleEntityStats, BattleActionRequest, EPICChallenge as ChronicleEPICChallenge, EPICResponse as ChronicleEPICResponse } from './chronicle'; // Import ChronicleRunState

export type LearningPhase = 'reading' | 'download' | 'install' | 'review';

export type ModuleType = 'core' | 'pillar' | 'auxiliary' | 'challenge';
export type ModuleStatus = 'new' | 'in_library' | 'downloading' | 'downloaded' | 'installing' | 'installed';
export type NodeStatus = 'new' | 'familiar' | 'understood' | 'needs_review';
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
}

export interface FeedbackOutput {
  mainFeedback: string;
  growthSuggestions?: string[];
  metacognitivePrompts?: string[];
  warningFlags?: string[]; // e.g., "High risk of shame trigger activation"
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
  probePrompt: string;
  implementPrompt: string;
  connectPrompt: string;
  connectTo?: string[]; // Optional for now, as it was added later
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
    domainIndex: number;
    nodeIndex: number;
}

export type EpicStep = 'explain' | 'probe' | 'implement' | 'connect';

export interface UserInput {
    text: string;
}
export interface AnalysisContext {
    domain?: string;
    nodeTitle?: string;
    learningObjective?: string;
    interactionType: 'recall' | 'epic_explain' | 'epic_probe' | 'epic_implement' | 'epic_connect' | 'review' | 'chronicle_interaction' | 'diagnostic';
    previousAnalysis?: AnalysisResult; 
    moduleId?: string;
    nodeId?: string;
    componentType?: EpicStep | 'battle_action' | 'battle_action_defense' | 'recall' | 'explain' | 'probe' | 'implement' | 'connect' | 'diagnostic' | 'review' | 'chronicle_interaction' | string;
    encounterId?: string; 
}

// New/Updated types for detailed rubric-based evaluation
export interface RubricDimensionScore {
  score: number; // 0.0 - 1.0
  label: string; // Narrative label, e.g., "Clear and concise," "Lacks depth"
}

export interface RubricScores {
  clarity: RubricDimensionScore;
  relevance: RubricDimensionScore;
  depthOfThought: RubricDimensionScore;
  domainAlignment: RubricDimensionScore;
  logicalIntegrity: RubricDimensionScore;
  specificity: RubricDimensionScore;
  voiceAppropriateness: RubricDimensionScore;
  originality: RubricDimensionScore;
}

export interface QualityFlags {
  mimicry: boolean;
  insufficientLength: boolean;
  lowCoherence: boolean;
  // repetition?: boolean; // Can be added later if needed
}

export interface EvaluationResult {
  score: number; 
  overallFeedback: string; // This will be the generic AI feedback
  isPass: boolean;
  analysisResult?: AnalysisResult; // From Thought Analyzer (Codex III)
  shameIndexResult?: ShameIndexResult; // From Neural Shame Engine (Codex III)
  feedbackOutput?: FeedbackOutput; // Growth suggestions from Shame Engine (Codex III)
  rubricScores?: RubricScores; // Detailed breakdown from rubric
  qualityFlags?: QualityFlags; // Flags for specific issues
  personalityFeedback?: string; // New: Feedback in character's voice
}


export interface ReviewSessionNode {
  nodeId: string;
  moduleId: string; 
  priorityScore: number;
  epicComponentToReview: EpicStep; 
  lastReviewed?: Date; 
  currentMemoryStrength?: number;
}
export interface ActiveReviewSession {
  sessionId: string;
  nodesToReview: ReviewSessionNode[];
  currentNodeIndex: number;
  startTime: Date;
}
export interface DiagnosticTest {
    id: string;
    name: string;
    level: 'node' | 'domain' | 'module' | 'system';
    targetId: string;
    targetName: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    prompt?: string;
    userInput?: string;
    result?: EvaluationResult;
    nodeContext?: Node;
}

export interface UserLearningState {
    modules: Record<string, Module | WikiModule>;
    activeSession: LearningProgress | null;
    activeChronicleRun: ChronicleRunState | null;
    playerCharacterBase: PlayerCharacterBase;
    activeReadingSession: ActiveReadingSession | null;
    currentUserProfile: UserProfile;
    activeReviewSession: ActiveReviewSession | null;
    isThoughtAnalyzerEnabled: boolean;
    currentLearningFlow?: 'reading' | 'download' | 'install' | 'review';
    _version?: string; // Version tracking for schema changes
    _savedAt?: string; // Timestamp of last save
}

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface KnowledgeCheckSet {
  nodeId: string;
  questions: KnowledgeCheckQuestion[];
  completed: boolean;
  score: number;
}
