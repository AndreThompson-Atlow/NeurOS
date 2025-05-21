
import type { Node } from './neuro'; // For moduleReference.nodeIds

// ===============================
// CORE ENUMS & TYPE ALIASES (from new spec)
// ===============================

export type EncounterType = 'battle' | 'puzzle' | 'discussion' | 'debate' | 'scroll' | 'boss';
export type EntityAlignment = "law" | "chaos" | "neutral" | "varies";
export type CoreEntityType = 'specter' | 'construct' | 'archetype' | 'companion' | 'unknown_entity';
export type MapCellType = 
  | 'floor' 
  | 'wall' 
  | 'water' 
  | 'entrance' 
  | 'exit' 
  | 'encounter' 
  | 'item_cache' 
  | 'artifact_puzzle' 
  | 'npc' 
  | 'vault' 
  | 'crypt' 
  | 'floor_boss'
  | 'stairs_up'
  | 'stairs_down';

export type DungeonScalingMode = "static" | "dynamic";
export type DungeonType = 'challenge' | 'infinite';
export type ChronicleStatus = 'active' | 'completed' | 'retired' | 'defeated';
export type EncounterResultStatus = 'victory' | 'defeat' | 'retreat' | 'recruitment' | 'alliance' | 'solved' | 'failed' | 'deciphered';

export type ItemUsageType = 'passive' | 'active' | 'consumable';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type ItemCategory = 'artifact' | 'scroll' | 'potion' | 'key' | 'equipment';

export type EffectType = 
  | 'damage' 
  | 'heal' 
  | 'buff' 
  | 'debuff' 
  | 'status' 
  | 'utility' 
  | 'summon'
  | 'stat_boost_hp' 
  | 'stat_boost_mp' 
  | 'stat_boost_str' 
  | 'stat_boost_int' 
  | 'stat_boost_wis' 
  | 'stat_boost_adp' 
  | 'all_stats_boost';

export type AbilityTarget = 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self' | 'single' | 'all';
export type EPICChallengeType = 'explain' | 'probe' | 'implement' | 'connect';
export type EPICResponseQuality = 'PERFECT' | 'STRONG' | 'ADEQUATE' | 'POOR' | 'FAILED';


// ===============================
// CORE DATA MODELS (from new spec)
// ===============================

export interface Coordinates {
  x: number;
  y: number;
}

export interface Position {
  floorIndex: number; 
  x: number;
  y: number;
}

export interface SacredCircuitPhase {
  phase: 'Entrance' | 'Puzzle' | 'Dialogue' | 'Challenge' | 'Application' | 'Integration' | 'Verification';
  internalName: 'gateway' | 'tower' | 'library' | 'rift' | 'praxis' | 'hearth' | 'gate';
  description: string;
  encounterTypes: EncounterType[];
  difficulty: number;
}

export interface MapCell {
  type: MapCellType;
  isWalkable: boolean; 
  isExplored: boolean; 
  visited: boolean;
  encounterId?: string;
  itemId?: string; 
  npcId?: string; 
  puzzleId?: string; 
  bossId?: string; 
  keyIdRequired?: string; 
}

export interface Floor {
  id: string;
  dungeonId: string; 
  level: number;
  phaseType: SacredCircuitPhase;
  map: MapCell[][];
  dimensions: { width: number; height: number }; 
  entryPosition: Coordinates; 
  exitPosition: Coordinates; 
  encounters: EncounterDefinition[]; 
  description: string;
  visualTheme: string;
  ambientSound?: string; 
  specialRooms?: { 
    type: string;
    position: Coordinates;
    id?: string;
    details?: any;
  }[];
}

export interface Guardian {
  name: string;
  description: string;
  alignment: 'law' | 'neutral' | 'chaos';
  dialogue: {
    greeting: string;
    victory: string;
    defeat: string;
  };
  abilities: Ability[]; 
  moduleReference: {
    moduleId: string;
    nodeIds?: string[]; 
  };
  entityId?: string; 
  stats?: EntityStats; 
}

export interface EnvironmentDescription {
  description: string;
  visualTheme: string;
  ambientSound: string;
  colorPalette: string;
}

export interface Dungeon {
  id: string;
  name: string;
  type: DungeonType;
  description: string;
  difficultyLevel: number; 
  requiredModules: string[];
  affinityTags?: string[];
  scalingMode: DungeonScalingMode;
  guardian?: Guardian; 
  environment: EnvironmentDescription;
  floors: Floor[];
  reward?: { 
    artifact?: Item; 
    companion?: Companion; 
    memoryStrengthBonus?: number;
  };
  alignment: 'law' | 'neutral' | 'chaos';
  moduleId?: string; 
  domainDungeonType: string; 
  entranceCoordinate: Coordinates; 
  thumbnailUrl: string; 
  createdAt: number; 
  updatedAt: number; 
  sacredCircuitPhases?: SacredCircuitPhase[]; 
}

export interface Chronicle {
  id: string;
  userId: string;
  type: 'challenge' | 'infinite';
  status: ChronicleStatus; 
  dungeonId: string;
  currentFloor: number;
  currentPosition: Coordinates; 
  party: Companion[];
  inventory: Item[];
  spellbooks: Spellbook[];
  discoveredMap: Record<number, boolean[][]>; 
  completedEncounters: EncounterRecord[]; 
  activeQuests?: Quest[]; 
  startedAt: string; 
  lastActive: string; 
  completedAt?: string; 
  currentEncounter?: EncounterDefinition | null; 
  activeBattle?: Battle | null; 
  currentDungeon?: Dungeon; 
  playerProgress?: {
    nodesUnlocked: string[];
    nodeStrengths: Record<string, number>; 
    moduleAffinities: Record<string, number>; 
  };
  companionRelationships?: Record<string, number>; 
}


// ===============================
// ENTITY FRAMEWORK (from new spec)
// ===============================

export interface EntityStats { 
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  intelligence: number;
  wisdom: number;
  adaptability: number;
  speed: number;
  elementalWeaknesses?: string[];
  elementalResistances?: string[];
}
export type ChronicleEntityStats = EntityStats; // Alias for clarity in chronicle context

export interface Entity {
  id: string; 
  entityId: string; 
  name: string;
  type: CoreEntityType;
  description?: string;
  alignment: EntityAlignment;
  abilities: Ability[]; 
  dialogue?: Record<string, string>;
  stats: EntityStats;
  moduleReference?: {
    moduleId: string;
    nodeIds?: string[]; 
  };
  avatarUrl?: string; 
  statusEffects?: Effect[]; 
  isPlayer?: boolean; 
  isAlly?: boolean; 
}

export interface Specter extends Entity {
  type: 'specter';
  specterType: 'certainty' | 'emotion' | 'control' | 'identity' | 'contradiction' | 'complexity' | string; 
  collapseCondition: string;
  recruitCondition?: string;
}

export interface Construct extends Entity {
  type: 'construct';
  constructType: 'guardian' | 'sentinel' | 'architect' | 'enforcer' | string; 
  primaryFunction: string;
}

export interface Archetype extends Entity {
  type: 'archetype';
  archetypePattern: string; 
  domainInfluence: string[]; 
}

export interface Companion extends Entity {
  type: 'companion';
  originModule: string; 
  unlockCondition?: string;
  loyalty?: number; 
  personalityProfile?: string; 
  isPlayer?: boolean; 
  isAlly?: boolean; 
}


export interface PlayerCharacter extends Companion {
  isPlayer: true;
  archetype: 'sovereign'; 
  equippedSpellbookId?: string | null; 
}


// ===============================
// BATTLE & CHALLENGE SYSTEM (from new spec)
// ===============================

export interface Battle {
  id: string;
  chronicleId?: string; 
  playerParty: BattleParticipant[]; 
  enemyParty: BattleParticipant[]; 
  currentTurnActorId: string; 
  turnOrder: string[]; 
  currentTurnIndex: number; 
  turns?: BattleTurn[];
  status: 'active' | 'playerVictory' | 'playerDefeat' | 'ongoing' | 'fled'; 
  rewards?: BattleRewards;
  battleLog: string[]; 
  currentPrompt?: EPICChallenge | null; 
  defendingPlayerId?: string; 
  isPlayerTurn: boolean; 
  encounterId?: string; 
}

export interface BattleParticipant extends Entity { 
  isPlayer?: boolean;
  isAlly?: boolean;
}


export interface BattleActionRequest { 
  type: "attack" | "spell" | "item" | "flee" | "cognitive" | "defend" | "pass" | "switch_spellbook";
  actorId?: string;
  targetId?: string;
  spellId?: string;
  itemId?: string;
  newSpellbookId?: string;
  cognitiveResponse?: {
    promptId: string; 
    answer: string;
  };
}

export interface BattleTurn {
  entityId: string; 
  action: {
    type: 'ability' | 'item' | 'retreat' | 'attack' | 'pass'; 
    targetId?: string;
    abilityId?: string;
    itemId?: string;
  };
  epicChallenge?: EPICChallenge;
  epicResponse?: EPICResponse;
  result: {
    success: boolean;
    damage?: number;
    effectsApplied?: Effect[]; 
    message?: string; 
  };
}

export interface EPICChallenge { 
  type: EPICChallengeType;
  prompt: string; 
  referenceNodeId: string; 
  keywords?: string[]; 
  difficulty: number;
  timeLimit?: number; 
}

export interface EPICResponse {
  content: string;
  quality: EPICResponseQuality;
  score: number; 
  evaluation?: string; 
}

export interface Ability { 
  id: string;
  name: string;
  description: string;
  manaCost: number;
  target: AbilityTarget;
  epicType?: EPICChallengeType; 
  effectPower: number;
  effects: Effect[];
  moduleReference?: {
    moduleId: string;
    nodeId?: string; 
  };
  cooldown?: number; 
  animation?: string; 
  iconUrl?: string; 
  element?: string; 
}

export interface Effect {
  type: EffectType;
  value: number | string; 
  duration?: number;
  description: string;
  target?: AbilityTarget; 
  element?: string; 
  chance?: number; 
}

export interface Spellbook {
  id: string;
  name: string;
  description: string;
  moduleId: string;
  abilities: Ability[]; 
  unlockCondition?: string;
}

export interface Item { 
  id: string;
  name: string;
  type: ItemCategory;
  description: string;
  effects: Effect[];
  usageType: ItemUsageType;
  rarity: ItemRarity;
  originDungeonId?: string;
  iconUrl?: string; 
  moduleId?: string; 
}

export interface BattleRewards {
  experience?: number; 
  items?: Item[]; 
  companionRecruitedId?: string; 
  memoryStrengthBonus?: number | { nodeId: string; amount: number }; 
}

// ===============================
// ENCOUNTER DEFINITIONS (from new spec)
// ===============================

export interface EncounterDefinition { 
  id: string;
  type: EncounterType;
  title?: string; 
  description?: string; 
  entityType?: CoreEntityType; 
  entityId?: string; 
  entityIds?: string[]; 
  position?: Coordinates; 
  completed?: boolean;
  difficulty: number; 
  moduleReference: { 
    moduleId: string;
    nodeIds?: string[]; 
  };
  puzzleData?: PuzzleEncounterData; 
  discussionData?: DiscussionEncounterData; 
  debateData?: DebateEncounterData; 
  scrollData?: ScrollEncounterData; 
  rewards?: BattleRewards; 
}


export interface EncounterRecord {
  id: string;
  encounterId: string; 
  result: EncounterResultStatus;
  performanceScore?: number; 
  rewardsClaimed?: boolean; 
  completedAt: string; 
  floorLevel?: number; 
}


// ===============================
// MEMORY SYSTEM INTEGRATION (from new spec)
// ===============================
export interface MemoryUpdate {
  userId: string;
  nodeId: string;
  performanceScore: number; 
  contextType: 'battle' | 'puzzle' | 'discussion' | 'debate' | 'scroll_comprehension' | 'scroll_essay'; 
  chronicleId: string;
  encounterId: string;
}

// ====================================================================
// ADDITIONAL TYPES FROM OLD SPEC (Potentially still needed or for merging)
// ====================================================================

export interface PlayerCharacterBase { 
    id: string;
    name: string;
    maxHealth: number;
    maxMana: number;
    speed: number;
    strength?: number; 
    intelligence?: number; 
    wisdom?: number; 
    adaptability?: number; 
    elementalWeaknesses: string[];
    elementalResistances: string[];
    spellbooks: Spellbook[];
    equippedSpellbookId: string | null;
    inventory: Item[];
    party?: ChronicleCompanion[]; 
}

export interface PlayerState extends PlayerCharacterBase, Entity { 
    type: 'companion'; 
    isPlayer: true;
    currentHealth: number; 
    currentMana: number; 
    coordinates: Coordinates; 
    currentFloor: number; 
    activeQuests?: Quest[];
    completedQuests?: Quest[];
    abilities: Ability[]; // Overriding Entity's abilities for PlayerState
}

export interface ChronicleRunState extends Chronicle { 
    playerState: PlayerState;
    currentDungeon?: Dungeon; 
    companions: ChronicleCompanion[]; 
}

export interface PuzzleEncounterData {
  puzzleType: string;
  description: string;
  content: any; 
  hints?: string[];
  solution: any; 
  timeLimit?: number; 
  attemptsAllowed?: number;
  nodeConnections?: string[]; 
}

export interface DialogueNode {
  id: string;
  text: string;
  speakerId: string; 
  responses?: {
    id: string; 
    text: string; 
    nextNodeId: string; 
    requirements?: any; 
    effects?: any; 
  }[];
  conditions?: any; 
  effects?: any; 
  endsDiscussion?: boolean;
  triggersBattleId?: string; 
  triggersRecruitmentId?: string; 
  initial?: boolean; 
}

export interface DiscussionEncounterData {
  npcId: string; 
  initialPrompt?: string; 
  dialogueTree: DialogueNode[];
  persuasionThreshold?: number; 
  fallbackResult?: string; 
  keyTopics?: string[]; 
  nodeConnections?: string[]; 
}

export interface DebateEncounterData {
  opponentId: string;
  topic: string;
  playerStanceOptions?: string[]; 
  opponentArguments: string[]; 
  resolutionLogic: string; 
  winCondition?: string; 
  loseCondition?: string; 
  fallbackResult?: 'battle' | 'end_stalemate';
  keyConcepts?: string[]; 
}

export interface ScrollEncounterData {
  scrollTitle: string;
  content: string; 
  comprehensionQuestions?: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
  }[];
  essayPrompt?: string; 
  relatedNodeId: string; 
  unlockableSpellbookId?: string;
  unlockableSpellId?: string; 
}


export type QuestObjectiveType = 'kill_enemies' | 'find_item' | 'deliver_item' | 'solve_puzzle' | 'reach_location' | 'talk_to_npc';
export type QuestStatus = 'inactive' | 'active' | 'completed' | 'failed';
export type QuestType = 'main' | 'side' | 'daily';

export interface QuestObjective {
    id: string;
    description: string;
    type: QuestObjectiveType;
    targetId?: string; 
    targetNpcId?: string; 
    targetCoordinates?: Coordinates; 
    requiredCount?: number;
    currentCount: number;
    isCompleted: boolean;
}

export interface QuestReward {
    type: 'item' | 'experience' | 'spell' | 'companion' | 'reputation' | 'spellbook' | 'ability';
    value?: string | number; 
    itemId?: string;
    experience?: number;
    spellId?: string; 
    abilityId?: string; 
    companionId?: string;
    reputation?: { factionId: string; amount: number };
    spellbookId?: string;
    chance?: number; 
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  giverNpcId?: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards?: QuestReward[];
  expiresAt?: number; 
  prerequisiteQuestIds?: string[];
  cognitiveRequirements?: Record<string, number>; 
  isRepeatable?: boolean;
}


export type ChronicleSpell = Ability;
export type ChronicleCompanion = Companion;


export interface EntityTypeTaxonomy {
  name: string;
  manifestation: string;
  description: string;
  alignment: EntityAlignment;
  encounterTypes: EncounterType[];
  possibleOutcomes: string[];
}
