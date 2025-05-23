'use client';

import type { LearningPhase, LearningProgress, Module, ModuleStatus, Node, NodeStatus, UserLearningState, ActiveReadingSession, EpicStep, UserInput, AnalysisContext, EvaluationResult, WikiModule, ActiveReviewSession, ReviewSessionNode, DiagnosticTest, RubricScores, QualityFlags, NodeEPIC, RubricDimensionScore, PlayerCharacterBase as NeuroPlayerCharacterBase, UserProfile as NeuroUserProfile, Domain } from '@/types/neuro';
// Flows
import { generateProbeQuestions } from '@/ai/flows/generate-probe-questions';
import { evaluateResponse as evaluateResponseFlow } from '@/ai/flows/evaluate-response-flow';
import type { EvaluateResponseInput, EvaluateResponseOutput as DetailedEvaluateResponseOutput } from '@/ai/flows/types/evaluateResponseTypes';
import { generateCustomModule } from '@/ai/flows/generate-custom-module-flow';
import { selectAppropriateCharacterId, getCharacterById, getAllCharacters } from '@/lib/server/characters';
import { generateDialogue as generateDialogueFlow } from '@/ai/flows/generate-dialogue-flow';
import { generateReadingDialogue as generateReadingDialogueFlow } from '@/ai/flows/generateReadingDialogueFlow';
import type { GenerateReadingDialogueOutput, GenerateReadingDialogueInput } from '@/ai/flows/types/generateReadingDialogueTypes';
import { ai, generateWithCharacter } from '@/lib/server/genkit';
import { z } from 'genkit';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
// Services
import { analyzeThoughtProcess } from '@/ai/flows/thought-analyzer-flow';
import { processWithShameEngine } from '@/ai/flows/neural-shame-engine-flow';

import { useToast } from '@/hooks/use-toast';
import { getAllModules, getModuleById as getPredefinedModuleById } from '@/data/predefined-modules';
import { 
    getAvailableDungeons, 
    getDungeonById, 
    getItemById, 
    getSpellbookById, 
    getEncounterById, 
    allEncounterDefinitions, 
    chronicleItems, 
    spellbooksData, 
    getSpellById, 
    getEnemyById, 
    ENTITY_DEFINITIONS_EXPORT, 
    generateNextInfiniteFloorInternal, 
    SACRED_CIRCUIT_STRUCTURE_EXPORT, 
    RESPONSE_QUALITY_EFFECTS_EXPORT,
    generateEPICChallenge as chronicleGenerateEPICChallenge,
    initializeChronicleData,
    allSpells as allSpellsData
} from '@/data/chronicle-data';
import { 
    startDungeonRun as chronicleStartDungeonRun, 
    movePlayer as chronicleMovePlayer, 
    initiateBattleInternal as chronicleInitiateBattle, 
    processBattleAction as chronicleProcessBattleAction, 
    updateMemoryStrengthFromChronicle, 
    distributeRewardsInternal as chronicleDistributeRewards, 
    recruitCompanion as chronicleRecruitCompanion, 
    checkPuzzleSolution as chronicleCheckPuzzleSolution, 
    getPlayerStateBaseInternal, 
    savePlayerStateBaseInternal, 
    chronicleGetCurrentRun
} from '@/data/chronicle-logic';
import _ from 'lodash';
import { placeholderEPIC } from '@/data/modules/_common';
import { CONFIG } from '@/config/keys';
import type { Dungeon, EncounterDefinition as ChronicleEncounterDefinition, ChronicleRunState, PlayerState, Coordinates, MapCell as ChronicleMapCell, Spellbook, Item as ChronicleItem, Quest, QuestObjective, BattleParticipant, Ability as ChronicleAbility, Floor, BattleRewards, BattleActionRequest, EPICChallenge as ChronicleEPICChallenge, EPICResponse as ChronicleEPICResponse, Item, Companion as ChronicleCompanion, Specter, Construct, Archetype, EntityStats as ChronicleEntityStats, Position, EffectType, CoreEntityType, Battle } from '@/types/chronicle';
import { generateKnowledgeChecks } from '@/ai/flows/generate-knowledge-checks';
import type { KnowledgeCheckQuestion, KnowledgeCheckSet } from '@/types/neuro';

// Additional types
type AnalysisResult = {
    thoughtPatterns: string[];
    cognitiveStrengths: string[];
    cognitiveWeaknesses: string[];
    recommendations: string[];
};

type ShameIndexResult = {
    overallScore: number;
    triggers: string[];
    recommendations: string[];
};

type FeedbackOutput = {
    mainFeedback: string;
    detailedBreakdown: string[];
    suggestions: string[];
};

const LOCAL_STORAGE_KEY = 'neuroosV2LearningState_v0_1_3';
const CHRONICLE_RUN_KEY = 'currentChronicleRun_NeuroOS_v2_INTERNAL_0_1_0';
const PLAYER_BASE_KEY = 'neuroPlayerCharacterBase_NeuroOS_v2_INTERNAL_0_1_0';


export type LoadingStepStatus = 'loading' | 'success' | 'error' | 'idle';
export interface LoadingStepState {
    status: LoadingStepStatus;
    error: string | null;
}
export interface DetailedLoadingState {
    dungeonData: LoadingStepState;
    characterData: LoadingStepState;
    aiConnection: LoadingStepState;
}

const initialLoadingStepState: LoadingStepState = { status: 'idle', error: null };
const initialDetailedLoadingState: DetailedLoadingState = {
    dungeonData: { ...initialLoadingStepState },
    characterData: { ...initialLoadingStepState },
    aiConnection: { ...initialLoadingStepState },
};

// Initial state values
const initialEntityStats: ChronicleEntityStats = {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    strength: 10,
    intelligence: 15,
    wisdom: 10,
    adaptability: 5,
    speed: 10,
    elementalWeaknesses: [],
    elementalResistances: []
};

const defaultPosition = { x: 0, y: 0 };

const getDefaultLearningState = async (): Promise<UserLearningState> => {
    const predefinedModulesList = getAllModules(); 
    const playerBase = await getPlayerStateBaseInternal();

    const defaultUserProfile: NeuroUserProfile = {
        cognitivePatterns: [],
        domainProficiency: {},
        knownTriggers: [],
        shameProfile: {
            overallResilience: 70,
            domainResilience: {},
            knownTriggers: [],
            responseHistory: [],
        },
        learningHistory: [],
        thresholds: {
            challengeTolerance: 75,
            recoveryRate: 0.5,
            optimalChallengeZone: { min: 60, max: 85 },
        },
    };
    
    return {
        modules: predefinedModulesList.reduce((acc, module) => {
            acc[module.id] = module;
            return acc;
        }, {} as Record<string, Module | WikiModule >),
        activeSession: null,
        activeChronicleRun: null,
        playerCharacterBase: playerBase,
        activeReadingSession: null,
        currentUserProfile: defaultUserProfile,
        activeReviewSession: null,
        isThoughtAnalyzerEnabled: true,
        aiProvider: CONFIG.AI.provider,
    };
};


const loadStateFromLocalStorage = async (): Promise<UserLearningState | null> => {
  try {
    if (typeof window === 'undefined') return null;
    
    // Check if localStorage is available
    try {
      const testKey = '_neuro_test_key';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      console.error("localStorage is not available:", e);
      return await getDefaultLearningState();
    }
    
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    const defaultState = await getDefaultLearningState(); 
    
    if (serializedState === null) return defaultState;

    let parsedState: Partial<UserLearningState> | null = null;
    try {
      parsedState = JSON.parse(serializedState) as Partial<UserLearningState>;
      
      // Add version check to handle schema changes
      const stateVersion = (parsedState as any)?._version || '0.0.0';
      const currentVersion = '1.0.0'; // Update this when making breaking changes
      
      if (stateVersion !== currentVersion) {
        console.log(`[loadStateFromLocalStorage] Version mismatch: stored ${stateVersion}, current ${currentVersion}. Using defaults with migration.`);
        // Could implement version-specific migrations here
      }
    } catch (e) {
      console.error("Error parsing state from localStorage:", e);
      return defaultState;
    }

    if (!parsedState) return defaultState;

    await initializeChronicleData(); 

    const loadedState = _.mergeWith({}, defaultState, parsedState, (objValue, srcValue, key) => {
        if ((key === 'spellbooks' || key === 'inventory' || key === 'party') && Array.isArray(objValue) && srcValue === undefined) {
            return objValue; 
        }
        if (key === 'activeChronicleRun' && srcValue === null && objValue !== null) {
            return null;
        }
        if (key === 'activeChronicleRun' && srcValue !== null && typeof srcValue === 'object') {
            return _.mergeWith({}, objValue, srcValue, (crObj: any, crSrc: any, crKey: string) => {
                if (crKey === 'stats' && typeof crSrc === 'object' && crSrc !== null && defaultState.playerCharacterBase.stats) {
                    return { ...defaultState.playerCharacterBase.stats, ...crSrc };
                }
                return undefined; 
            });
        }
        if (key === 'nodes' && Array.isArray(objValue) && srcValue && !Array.isArray(srcValue)) {
            return objValue; 
        }
        if (key === 'domains' && Array.isArray(objValue) && srcValue && !Array.isArray(srcValue)) {
            return objValue; 
        }
        return undefined; 
    });

    // Ensure proper stats initialization
    loadedState.playerCharacterBase.stats = { ...initialEntityStats, ...loadedState.playerCharacterBase.stats };

    // Handle Chronicle run state
    if (loadedState.activeChronicleRun) {
        const currentRunPlayerState = loadedState.activeChronicleRun.playerState;
        loadedState.activeChronicleRun.playerState = {
            ...loadedState.playerCharacterBase,
            ...currentRunPlayerState,
            id: currentRunPlayerState.id || loadedState.playerCharacterBase.id,
            name: currentRunPlayerState.name || loadedState.playerCharacterBase.name,
            currentHealth: currentRunPlayerState.currentHealth ?? loadedState.playerCharacterBase.maxHealth,
            currentMana: currentRunPlayerState.currentMana ?? loadedState.playerCharacterBase.maxMana,
            coordinates: loadedState.activeChronicleRun.currentFloor?.playerPosition || { x: 0, y: 0 },
            currentFloor: loadedState.activeChronicleRun.currentFloor,
            stats: { ...initialEntityStats, ...currentRunPlayerState.stats },
            abilities: (loadedState.playerCharacterBase.spellbooks.find((sb: Spellbook) => sb.id === loadedState.playerCharacterBase.equippedSpellbookId)?.abilities || []) as ChronicleAbility[],
        };
    }

    return loadedState;
  } catch (error) {
    console.error("Error loading state:", error);
    return await getDefaultLearningState();
  }
};

// Save state to localStorage
const saveStateToLocalStorage = (state: UserLearningState) => {
  try {
    if (typeof window === 'undefined') return;
    
    // Check if localStorage is available
    try {
      const testKey = '_neuro_test_key';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      console.error("localStorage is not available:", e);
      return;
    }
    
    // Add version metadata
    const stateToSave = {
      ...state,
      _version: '1.0.0', // Update this when making breaking changes
      _savedAt: new Date().toISOString()
    };
    
    // Don't save full floor data to reduce size
    const minimizedPlayerState = {
      ...stateToSave,
      playerCharacterBase: {
        ...stateToSave.playerCharacterBase,
        floors: [], // Do not save full floor data here to reduce localStorage size
      }
    };
    
    const serializedState = JSON.stringify(minimizedPlayerState);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    console.log("[saveStateToLocalStorage] State saved successfully", new Date().toISOString());
  } catch (error) {
    console.error("Could not save state to localStorage:", error);
  }
};

// Debounce function
function debounce<F extends (...args: any[]) => void>(func: F, waitFor: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), waitFor);
  };
}

export interface LearningSessionState extends UserLearningState {
  knowledgeCheckQuestions: KnowledgeCheckQuestion[];
  currentKnowledgeCheckIndex: number;
  selectedKnowledgeCheckAnswer: number | null;
}

export function useLearningSession() {
  const { toast: queueToast } = useToast();

  // State initialization
  const [learningState, setLearningState] = useState<UserLearningState>(() => {
      const predefinedModulesList = getAllModules();
      const playerBaseSync: NeuroPlayerCharacterBase = { 
          id: 'player', 
          name: 'Sovereign', 
          maxHealth: 100, 
          maxMana: 50, 
          speed: 10,
          strength: 10, 
          intelligence: 15, 
          wisdom: 10, 
          adaptability: 10,
          elementalWeaknesses: [], 
          elementalResistances: [],
          spellbooks: [], 
          equippedSpellbookId: null, 
          inventory: [], 
          party: [],
          stats: { ...initialEntityStats }
      };
      const defaultUserProfileSync: NeuroUserProfile = {
          cognitivePatterns: [],
          domainProficiency: {},
          knownTriggers: [],
          shameProfile: {
              overallResilience: 70,
              domainResilience: {},
              knownTriggers: [],
              responseHistory: [],
          },
          learningHistory: [],
          thresholds: {
              challengeTolerance: 75,
              recoveryRate: 0.5,
              optimalChallengeZone: { min: 60, max: 85 },
          },
      };
      return {
          modules: predefinedModulesList.reduce((acc, module) => {
              acc[module.id] = module;
              return acc;
          }, {} as Record<string, Module | WikiModule>),
          activeSession: null,
          activeChronicleRun: null,
          playerCharacterBase: playerBaseSync,
          activeReadingSession: null,
          currentUserProfile: defaultUserProfileSync,
          activeReviewSession: null,
          isThoughtAnalyzerEnabled: true,
          aiProvider: CONFIG.AI.provider,
      };
  });

  // State for evaluation results and knowledge checks
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [knowledgeChecks, setKnowledgeChecks] = useState<KnowledgeCheckSet | null>(null);

  // Callbacks
  const clearEvaluationResultCallback = useCallback(() => {
    setEvaluationResult(null);
  }, []);

  // Legacy function to keep for compatibility
  const _legacyGenerateKnowledgeChecksCallback = useCallback(async (moduleId: string, domainIndex: number, nodeIndex: number) => {
    const module = learningState.modules[moduleId] as Module;
    if (!module?.domains?.[domainIndex]?.nodes?.[nodeIndex]) {
      console.error("Invalid module/domain/node indices for knowledge check generation");
      return;
    }

    const node = module.domains[domainIndex].nodes[nodeIndex];
    const nodeContent = typeof node === 'object' && node !== null ? (node as { content?: string }).content || '' : '';
    const checks = await generateKnowledgeChecks({
      nodeTitle: node.title || '',
      nodeContent: nodeContent,
      shortDefinition: node.shortDefinition || '',
      clarification: node.clarification || '',
      example: node.example || '',
      characterId: 'neuros',
      count: 5
    });
    if (checks) {
      // Create a complete KnowledgeCheckSet with all required fields
      const knowledgeCheckSet: KnowledgeCheckSet = {
        nodeId: node.id,
        completed: false,
        score: 0,
        questions: checks.questions,
        domain: node.domainId || 'default',
        difficulty: 1
      };
      setKnowledgeChecks(knowledgeCheckSet);
    }
  }, [learningState.modules]);

  // Track nodes marked as understood/familiar
  const [nodesMarked, setNodesMarked] = useState<{
    understood: Set<string>;
    familiar: Set<string>;
  }>(() => ({
    understood: new Set<string>(),
    familiar: new Set<string>()
  }));

  // Handle Chronicle run state updates
  const updateChronicleRunState = useCallback((run: ChronicleRunState) => {
    if (!run.playerState) return run;
    
    const position = run.currentFloor && typeof run.currentFloor === 'object' && 'playerPosition' in run.currentFloor 
      ? ((run.currentFloor as { playerPosition: Position }).playerPosition)
      : defaultPosition;
      
    return {
      ...run,
      playerState: {
        ...run.playerState,
        coordinates: position
      }
    };
  }, []);

  // Basic state updates
  const updateModuleStatusCallback = useCallback((moduleId: string, newStatus: ModuleStatus) => {
    setLearningState(prev => {
      const module = prev.modules[moduleId];
      if (!module) return prev;
      
      const updatedModule = { ...module, status: newStatus } as Module | WikiModule;
      
      // Update node statuses based on module status
      if (newStatus === 'downloaded' && (updatedModule as Module).domains) {
        (updatedModule as Module).domains.forEach(d => 
          d.nodes.forEach(n => { 
            n.status = 'familiar'; 
            n.familiar = true; 
            n.understood = false; 
          })
        );
      } else if (newStatus === 'installed' && (updatedModule as Module).domains) {
        (updatedModule as Module).domains.forEach(d => 
          d.nodes.forEach(n => { 
            n.status = 'understood'; 
            n.familiar = true; 
            n.understood = true; 
            n.memoryStrength = 100; 
            n.lastReviewed = new Date(); 
          })
        );
      } else if ((newStatus === 'in_library' || newStatus === 'new') && (updatedModule as Module).domains) {
        const defaultModuleState = getPredefinedModuleById(moduleId);
        if (defaultModuleState && (updatedModule as Module).domains) {
          (updatedModule as Module).domains = JSON.parse(JSON.stringify(defaultModuleState.domains));
          (updatedModule as Module).domains.forEach(d => 
            d.nodes.forEach(n => { 
              n.status = 'new'; 
              n.familiar = false; 
              n.understood = false; 
              n.memoryStrength = 0; 
              n.lastReviewed = undefined; 
            })
          );
        }
      }
      
      return { 
        ...prev, 
        modules: { 
          ...prev.modules, 
          [moduleId]: updatedModule 
        } 
      };
    });
  }, []);

  // Other state
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [isLoadingChronicle, setIsLoadingChronicle] = useState(false);
  const [isChronicleSystemReady, setIsChronicleSystemReady] = useState(false);
  const [probeQuestions, setProbeQuestions] = useState<string[]>([]);
  const [activeInteraction, setActiveInteraction] = useState<'initial' | 'learning' | 'chronicle' | 'finished' | 'admin' | 'reviewing' | 'diagnosing' | 'status_viewing' | 'reading'>('initial');
  const [currentEpicStep, setCurrentEpicStep] = useState<EpicStep>('explain');
  const [availableDungeons, setAvailableDungeons] = useState<Dungeon[]>([]);
  const [detailedLoadingProgress, setDetailedLoadingProgress] = useState<DetailedLoadingState>({
    dungeonData: { status: 'idle', error: null },
    characterData: { status: 'idle', error: null },
    aiConnection: { status: 'idle', error: null }
  });

  // Voice-related state
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [capturedAudio, setCapturedAudio] = useState<Blob | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [isLoadingSTT, setIsLoadingSTT] = useState(false);
  const [voiceTranscriptTarget, setVoiceTranscriptTarget] = useState<React.Dispatch<React.SetStateAction<string>> | null>(null);

  // Refs
  const isInitialLoadDoneRef = useRef(false);
  const reviewNotificationShownRef = useRef(false);
  const debouncedSaveStateRef = useRef<(state: UserLearningState) => void>(
    debounce((state: UserLearningState) => saveStateToLocalStorage(state), 1000)
  );

  // Extract state from learningState
  const {
    modules: userModules,
    activeSession,
    playerCharacterBase,
    activeReadingSession,
    currentUserProfile,
    activeReviewSession: currentActiveReviewSession,
    activeChronicleRun: currentActiveChronicleRun,
  } = learningState;

  // Determine active module ID
  const activeModuleId = useMemo(() => {
    if (activeSession?.currentModuleId) return activeSession.currentModuleId;
    if (activeReadingSession?.moduleId) return activeReadingSession.moduleId;
    if (currentActiveReviewSession?.nodesToReview && currentActiveReviewSession.nodesToReview.length > 0) {
      const reviewNode = currentActiveReviewSession?.nodesToReview[currentActiveReviewSession?.currentNodeIndex];
      if (reviewNode) return reviewNode.moduleId;
    }
    return null;
  }, [activeSession, activeReadingSession, currentActiveReviewSession]);

  // Derived state
  const currentActiveModule = useMemo(() => {
    if (activeSession?.currentModuleId) return userModules[activeSession.currentModuleId] as Module;
    if (activeReadingSession?.moduleId) return userModules[activeReadingSession.moduleId] as Module;
    
    const reviewNode = currentActiveReviewSession?.nodesToReview?.[currentActiveReviewSession?.currentNodeIndex];
    if (reviewNode?.moduleId) {
        return userModules[reviewNode.moduleId] as Module;
    }
    
    return null;
}, [activeSession, activeReadingSession, currentActiveReviewSession, userModules]);

  const currentDomainIndex = useMemo(() => {
    if (activeSession?.currentModuleId && typeof activeSession.currentDomainIndex === 'number' && activeSession.currentDomainIndex !== -1) {
        return activeSession.currentDomainIndex;
    }
    if (activeReadingSession?.moduleId && typeof activeReadingSession.domainIndex === 'number' && activeReadingSession.domainIndex !== -1) {
        return activeReadingSession.domainIndex;
    }
    
    const reviewNode = currentActiveReviewSession?.nodesToReview?.[currentActiveReviewSession?.currentNodeIndex];
    if (reviewNode?.nodeId && currentActiveModule && (currentActiveModule as Module).domains) {
        const domainIdx = (currentActiveModule as Module).domains.findIndex(d => d.nodes.some(n => n.id === reviewNode.nodeId));
        return domainIdx !== -1 ? domainIdx : 0;
    }
    
    return -1;
}, [activeSession, activeReadingSession, currentActiveReviewSession, currentActiveModule]);

  const currentDomain = useMemo(() => {
    if (!currentActiveModule || typeof currentDomainIndex !== 'number' || currentDomainIndex === -1 || 
        !(currentActiveModule as Module).domains || currentDomainIndex >= (currentActiveModule as Module).domains.length) {
      return null;
    }
    return (currentActiveModule as Module).domains[currentDomainIndex];
  }, [currentActiveModule, currentDomainIndex]);

  const currentNodeIndex = useMemo(() => {
    if (activeSession?.currentModuleId && typeof activeSession.currentNodeIndex === 'number' && activeSession.currentNodeIndex !== -1) {
        return activeSession.currentNodeIndex;
    }
    if (activeReadingSession?.moduleId && typeof activeReadingSession.nodeIndex === 'number' && activeReadingSession.nodeIndex !== -1) {
        return activeReadingSession.nodeIndex;
    }
    
    const reviewNode = currentActiveReviewSession?.nodesToReview?.[currentActiveReviewSession?.currentNodeIndex];
    if (reviewNode?.nodeId && currentActiveModule && (currentActiveModule as Module).domains && typeof currentDomainIndex === 'number' && currentDomainIndex !== -1) {
        const domain = (currentActiveModule as Module).domains[currentDomainIndex];
        if (domain?.nodes) {
            const nodeIdx = domain.nodes.findIndex(n => n.id === reviewNode.nodeId);
            return nodeIdx !== -1 ? nodeIdx : -1;
        }
    }
    
    return -1;
}, [activeSession, activeReadingSession, currentActiveReviewSession, currentActiveModule, currentDomainIndex]);

  const currentNode = useMemo(() => {
    if (!currentDomain || !currentDomain.nodes || typeof currentNodeIndex !== 'number' || 
        currentNodeIndex === -1 || currentNodeIndex >= currentDomain.nodes.length) {
      return null;
    }
    return currentDomain.nodes[currentNodeIndex];
  }, [currentDomain, currentNodeIndex]);

  // Check if this is the last node in the module
  const isLastNode = useMemo(() => {
    if (!currentActiveModule || !activeSession || typeof currentDomainIndex !== 'number' || typeof currentNodeIndex !== 'number') {
      return false;
    }
    
    const module = currentActiveModule as Module;
    if (!module.domains) return false;
    
    // Check if we're at the last node of the last domain that has nodes
    const lastDomainWithNodes = module.domains.slice().reverse().find(d => d.nodes && d.nodes.length > 0);
    if (!lastDomainWithNodes) return false;
    
    const lastDomainIndex = module.domains.findIndex(d => d.id === lastDomainWithNodes.id);
    const lastNodeIndex = lastDomainWithNodes.nodes.length - 1;
    
    return currentDomainIndex === lastDomainIndex && currentNodeIndex === lastNodeIndex;
  }, [currentActiveModule, activeSession, currentDomainIndex, currentNodeIndex]);

  // Base callbacks that don't depend on derived state
  const updateNodeStatusCallback = useCallback((moduleId: string, domainIndex: number, nodeIndex: number, status: NodeStatus, familiar?: boolean, understood?: boolean, lastReviewed?: Date, memoryStrength?: number) => {
    setLearningState(prev => {
        const moduleToUpdate = prev.modules[moduleId];
        if (!moduleToUpdate || !('domains' in moduleToUpdate) || !moduleToUpdate.domains?.[domainIndex]?.nodes?.[nodeIndex]) {
            console.warn(`Node not found for update: ${moduleId}, D:${domainIndex}, N:${nodeIndex}`);
            return prev;
        }

        const updatedModules = { ...prev.modules };
        const updatedModule = { ...moduleToUpdate } as Module;
        const updatedDomains = [...updatedModule.domains];
        const updatedDomain = { ...updatedDomains[domainIndex] };
        const updatedNodes = [...updatedDomain.nodes];
        const nodeToUpdateRef = { ...updatedNodes[nodeIndex] };
        
        nodeToUpdateRef.status = status;
        if (familiar !== undefined) nodeToUpdateRef.familiar = familiar;
        if (understood !== undefined) nodeToUpdateRef.understood = understood;
        if (lastReviewed !== undefined) nodeToUpdateRef.lastReviewed = lastReviewed;
        if (memoryStrength !== undefined) nodeToUpdateRef.memoryStrength = Math.max(0, Math.min(100, memoryStrength));

        updatedNodes[nodeIndex] = nodeToUpdateRef;
        updatedDomain.nodes = updatedNodes;
        updatedDomains[domainIndex] = updatedDomain;
        updatedModule.domains = updatedDomains;
        updatedModules[moduleId] = updatedModule;
        return { ...prev, modules: updatedModules };
    });
}, []);

  // Derived callbacks that depend on derived state
  const _markNodeFamiliarInternalCallback = useCallback(() => {
    if (!currentActiveModule?.id || !activeSession || !currentNode) return;
    updateNodeStatusCallback(
      currentActiveModule.id,
      activeSession.currentDomainIndex,
      activeSession.currentNodeIndex,
      'familiar',
      true,
      currentNode.understood,
      new Date(),
      (currentNode.memoryStrength || 0) + 10
    );
  }, [currentActiveModule?.id, activeSession, currentNode, updateNodeStatusCallback]);

  const _markNodeUnderstoodInternalCallback = useCallback(() => {
    if (!currentActiveModule?.id || !activeSession || !currentNode) return;
    updateNodeStatusCallback(
      currentActiveModule.id,
      activeSession.currentDomainIndex,
      activeSession.currentNodeIndex,
      'understood',
      true,
      true,
      new Date(),
      (currentNode.memoryStrength || 0) + 20
    );
  }, [currentActiveModule?.id, activeSession, currentNode, updateNodeStatusCallback]);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

 useEffect(() => {
    const initializeSession = async () => {
      if (hasHydrated && typeof window !== 'undefined' && !isInitialLoadDoneRef.current) {
        console.log("STARTUP: Initializing Chronicle Data System...");
        await initializeChronicleData(); 
        console.log("STARTUP: Chronicle Data System READY.");
        setIsChronicleSystemReady(true);

        console.log("STARTUP: Loading state from localStorage or defaults...");
        let loadedState = await loadStateFromLocalStorage(); 
        if (!loadedState) {
            console.log("STARTUP: No saved state, using default learning state.");
            loadedState = await getDefaultLearningState();
        } else {
            console.log("STARTUP: Successfully loaded and merged state from localStorage.");
        }
        console.log("[initializeSession] isThoughtAnalyzerEnabled AFTER loadState/getDefault:", loadedState.isThoughtAnalyzerEnabled);
        
        // Prevent auto-restoration of chronicle runs
        if (loadedState.activeChronicleRun) {
            console.log("STARTUP: Found active chronicle run - clearing to prevent auto-navigation");
            loadedState.activeChronicleRun = null;
        }
        
        // Clear any active sessions to prevent auto-navigation
        loadedState.activeReadingSession = null;
        loadedState.activeSession = null;
        loadedState.activeReviewSession = null;
        
        setLearningState(loadedState);
        console.log("[initializeSession] isThoughtAnalyzerEnabled AFTER setLearningState:", loadedState.isThoughtAnalyzerEnabled);
        isInitialLoadDoneRef.current = true; 
        console.log("STARTUP: Full initial load and hydration complete.");
        
        // Always start on the initial dashboard screen
        setActiveInteraction('initial');
      }
    };
    initializeSession();
  }, [hasHydrated, setLearningState, setActiveInteraction, setCurrentEpicStep, setIsChronicleSystemReady]);

  useEffect(() => {
    if (hasHydrated && typeof window !== 'undefined' && isInitialLoadDoneRef.current) {
      debouncedSaveStateRef.current(learningState);
    }
  }, [learningState, hasHydrated]);

  useEffect(() => {
    const loadDungeons = async () => {
        if(isChronicleSystemReady){ 
            const dungeons = await getAvailableDungeons();
             if (dungeons.length === 0 && isInitialLoadDoneRef.current) {
                console.error("CRITICAL: No dungeons loaded from getAvailableDungeons after system ready.");
            }
            setAvailableDungeons(dungeons);
        }
    };
    if(hasHydrated && isInitialLoadDoneRef.current){
        loadDungeons();
    }
  }, [isChronicleSystemReady, hasHydrated]);


  const hasAnyInstalledModules = useMemo(() => { 
    if (!userModules) return false;
    return Object.values(userModules).some(m => (m as Module).status === 'installed');
  }, [userModules]);

  const addModuleToLibraryCallback = useCallback((moduleId: string, moduleData?: Partial<WikiModule>) => {
      if (moduleData && moduleData.id === moduleId) {
          const newWikiModule: WikiModule = {
              id: moduleData.id,
              type: moduleData.type || 'auxiliary',
              title: moduleData.title || 'Wikipedia Module',
              description: moduleData.shortDefinition || moduleData.description || 'Content from Wikipedia.',
              moduleLearningGoal: moduleData.moduleLearningGoal || `Understand ${moduleData.title || 'this topic'}.`,
              domains: (moduleData.domains || []).map((d, dIdx) => ({ 
                    ...(d as Domain), 
                    id: d.id || `${moduleId}-d${dIdx + 1}-${Date.now()}`, 
                    title: d.title || `Domain ${dIdx + 1}`,
                    learningGoal: d.learningGoal || `Learn concepts within ${d.title || ''}`,
                    chronicleTheme: d.chronicleTheme || 'General knowledge challenges', 
                    domainDungeonType: d.domainDungeonType || 'generic_trial',
                    characterAffinities: d.characterAffinities || [], 
                    specterAffinities: d.specterAffinities || [],
                    nodes: (d.nodes || []).map((n, nIdx) => ({
                        ...(n as Node), 
                        id: n.id || `${moduleId}-d${dIdx + 1}-n${nIdx + 1}-${Date.now()}`, 
                        moduleId: moduleId,
                        domainId: d.id || `${moduleId}-d${dIdx + 1}-${Date.now()}`, 
                        epic: n.epic || placeholderEPIC, 
                        shortDefinition: (n as Node).shortDefinition || "Default short definition",
                        learningObjective: (n as Node).learningObjective || "Default learning objective",
                        keyTerms: (n as Node).keyTerms || [],
                        download: (n as Node).download || { clarification: "", example: "", scenario: "", recallPrompt: "" },
                        status: (n as Node).status || 'new',
                        familiar: (n as Node).familiar ?? false,
                        understood: (n as Node).understood ?? false,
                    })),
              })),
              status: 'in_library',
              dependencies: moduleData.dependencies || [],
              tags: moduleData.tags || ['wikipedia', 'dynamic'],
              alignmentBias: moduleData.alignmentBias || 'neutral',
              defaultCompanion: moduleData.defaultCompanion || 'veriscribe',
              associatedSpecters: moduleData.associatedSpecters || ['complexity-specter', 'fragmentation-specter'], 
              recommendedChronicleDungeon: moduleData.recommendedChronicleDungeon || 'Archive of Lost Knowledge',
              moduleCategory: moduleData.moduleCategory || ['dynamic_content', 'wikipedia'],
              reviewProfile: moduleData.reviewProfile || { decayModel: 'standard_exponential', reviewClusters: [], interleaveRatio: 0.2 },
              sourceUrl: moduleData.sourceUrl || '',
              extractionDate: moduleData.extractionDate || new Date(),
              confidenceScore: moduleData.confidenceScore || 0.7, 
              generatedContent: moduleData.generatedContent ?? true,
              epicGenerationStatus: moduleData.epicGenerationStatus || { status: 'pending' }
          };
          setLearningState(prev => {
            const newModules = { ...prev.modules, [newWikiModule.id]: newWikiModule };
            return { ...prev, modules: newModules };
          });
          queueToast({ title: "Wiki Module Added", description: `${newWikiModule.title} added to your library for EPIC generation.` });
      } else if (learningState.modules[moduleId] && (learningState.modules[moduleId] as Module).status === 'new') {
          updateModuleStatusCallback(moduleId, 'in_library');
          queueToast({ title: "Module Added", description: `${learningState.modules[moduleId]?.title} added to your library.` });
      } else {
         queueToast({ title: "Module Info", description: `Module ${learningState.modules[moduleId]?.title || moduleId} is already in your library or past that stage.` });
      }
  }, [learningState.modules, updateModuleStatusCallback, queueToast, setLearningState]);

  const startModuleCallback = useCallback((moduleId: string) => {
    const moduleToStart = learningState.modules[moduleId] as Module; 
    if (!moduleToStart || !moduleToStart.id || !moduleToStart.domains) {
        queueToast({ title: "Error Starting Module", description: "Module data is missing or invalid.", variant: "destructive" });
        setLearningState(prev => ({ ...prev, activeSession: null }));
        setActiveInteraction('initial');
        return;
    }

    // Check if user has read this module before starting download/install
    if (learningState.currentLearningFlow !== 'reading' && !learningState.activeReadingSession) {
      // Suggest reading first
      queueToast({ 
        title: "Learning Flow", 
        description: "It's recommended to read the module first. Starting with reading mode.", 
      });
      startReadingModeCallback(moduleId);
      return;
    }

    let sessionToStart: LearningProgress | null = null;
    const currentModuleStatus = moduleToStart.status;

    if (activeSession && activeSession.currentModuleId === moduleId) {
      const savedSession = activeSession;
      if ((currentModuleStatus === 'downloading' && savedSession.currentPhase === 'download') ||
          (currentModuleStatus === 'installing' && savedSession.currentPhase === 'install') ||
          (currentModuleStatus === 'downloaded' && savedSession.currentPhase === 'install')) { 

          sessionToStart = savedSession; 
          if (currentModuleStatus === 'downloaded' && savedSession.currentPhase !== 'install') {
            sessionToStart = {...savedSession, currentPhase: 'install', currentDomainIndex: 0, currentNodeIndex: 0};
            setCurrentEpicStep('explain'); 
            updateModuleStatusCallback(moduleId, 'installing'); 
          } else if (currentModuleStatus === 'installing') {
            const node = moduleToStart.domains[savedSession.currentDomainIndex]?.nodes[savedSession.currentNodeIndex];
            if (node && !node.understood) { 
              setCurrentEpicStep('explain'); 
            }
          }
          queueToast({ title: `Resuming Session: ${moduleToStart.title}` });
      }
    }

    if (!sessionToStart) {
      let startDomainIndex = 0; 
      let startNodeIndex = 0; 
      let startPhase: LearningPhase = 'download';
      
      if (currentModuleStatus === 'installing' || currentModuleStatus === 'downloaded') {
        startPhase = 'install';
        let resumeFound = false;
        for (let dIdx = 0; dIdx < moduleToStart.domains.length; dIdx++) {
          if (!moduleToStart.domains[dIdx].nodes || moduleToStart.domains[dIdx].nodes.length === 0) continue;
          for (let nIdx = 0; nIdx < moduleToStart.domains[dIdx].nodes.length; nIdx++) {
            if (moduleToStart.domains[dIdx].nodes[nIdx].status !== 'understood') {
              startDomainIndex = dIdx; startNodeIndex = nIdx; resumeFound = true; break;
            }
          }
          if (resumeFound) break;
        }
        if (!resumeFound && moduleToStart.domains.length > 0 && moduleToStart.domains[0].nodes.length > 0) { 
          startDomainIndex = 0; startNodeIndex = 0;
        } else if (!resumeFound) { 
          updateModuleStatusCallback(moduleId, 'installed');
          queueToast({ title: "Module Already Completed", description: `${moduleToStart.title} is fully installed.` });
          setActiveInteraction('initial'); return;
        }

        if(currentModuleStatus === 'downloaded') updateModuleStatusCallback(moduleId, 'installing');
        setCurrentEpicStep('explain'); 
      } else if (currentModuleStatus === 'in_library' || currentModuleStatus === 'new') {
        startPhase = 'download';
        moduleToStart.domains.forEach((domain, dIdx) => {
           (domain.nodes || []).forEach((_, nIdx) => { 
             updateNodeStatusCallback(moduleId, dIdx, nIdx, 'new', false, false, undefined, 0);
          });
        });
        for (let dIdx = 0; dIdx < moduleToStart.domains.length; dIdx++) {
           if (moduleToStart.domains[dIdx].nodes && moduleToStart.domains[dIdx].nodes.length > 0) {
             startDomainIndex = dIdx; startNodeIndex = 0; break;
           }
        }
        if (startDomainIndex >= moduleToStart.domains.length || !moduleToStart.domains[startDomainIndex]?.nodes?.length) { 
          queueToast({ title: "Empty Module", description: `${moduleToStart.title} has no learning nodes.`, variant: "default" });
          updateModuleStatusCallback(moduleId, 'downloaded'); 
          setActiveInteraction('initial'); return;
        }
        updateModuleStatusCallback(moduleId, 'downloading');
      } else if (currentModuleStatus === 'installed') {
        queueToast({ title: "Module Installed", description: "This module is already installed. No session started." });
        setActiveInteraction('initial'); return;
      } else if (currentModuleStatus === 'downloading') { 
        startPhase = 'download';
        let resumeFound = false;
        for (let dIdx = 0; dIdx < moduleToStart.domains.length; dIdx++) {
          if (!moduleToStart.domains[dIdx].nodes || moduleToStart.domains[dIdx].nodes.length === 0) continue;
          for (let nIdx = 0; nIdx < moduleToStart.domains[dIdx].nodes.length; nIdx++) {
            if (moduleToStart.domains[dIdx].nodes[nIdx].status === 'new') {
              startDomainIndex = dIdx; startNodeIndex = nIdx; resumeFound = true; break;
            }
          }
          if (resumeFound) break;
        }
         if (!resumeFound) { 
            updateModuleStatusCallback(moduleId, 'downloaded');
            startPhase = 'install'; startDomainIndex = 0; startNodeIndex = 0;
            setCurrentEpicStep('explain');
            updateModuleStatusCallback(moduleId, 'installing'); 
         }
      }

      if (startDomainIndex >= moduleToStart.domains.length || !moduleToStart.domains[startDomainIndex]?.nodes || startNodeIndex >= (moduleToStart.domains[startDomainIndex].nodes?.length || 0) ) {
        queueToast({ title: "Error Starting Module", description: "Could not find a valid starting node.", variant: "destructive" });
        setLearningState(prev => ({ ...prev, activeSession: null })); setActiveInteraction('initial'); return;
      }
      sessionToStart = {
        currentModuleId: moduleId, 
        currentDomainIndex: startDomainIndex,
        currentNodeIndex: startNodeIndex, 
        currentPhase: startPhase,
        knowledgeChecks: {},
        completedDomainIntegrations: [],
        completedModuleIntegrations: false
      };
      queueToast({ title: `Learning Session Started: ${moduleToStart.title}` });
    }
    
    setLearningState(prev => ({ 
      ...prev, 
      activeSession: sessionToStart, 
      activeReadingSession: null, 
      activeReviewSession: null,
      currentLearningFlow: sessionToStart?.currentPhase
    }));
    setProbeQuestions([]); 
    setEvaluationResult(null);
    setActiveInteraction('learning');
    
    // Generate knowledge checks if starting in download phase
    // Commenting out for now to fix circular reference issue
    // if (sessionToStart?.currentPhase === 'download') {
    //   setTimeout(() => {
    //     generateKnowledgeChecksCallback(moduleId, sessionToStart.currentDomainIndex, sessionToStart.currentNodeIndex);
    //   }, 500);
    // }
    
  }, [learningState.modules, learningState.activeReadingSession, learningState.currentLearningFlow, activeSession, queueToast, updateModuleStatusCallback, updateNodeStatusCallback, setLearningState, setActiveInteraction, setProbeQuestions, setEvaluationResult, setCurrentEpicStep]);

  const createCustomModuleCallback = useCallback(async (topic: string) => {
    setIsLoadingCustom(true); 
    clearEvaluationResultCallback(); 
    const creationCharacterId = await selectAppropriateCharacterId('download'); 
    try {
      const newModuleData = await generateCustomModule({ topic, characterId: creationCharacterId });
      if (!newModuleData || !newModuleData.id) { 
        throw new Error("AI failed to return valid module data.");
      }
      const moduleId = newModuleData.id;
      const domainsWithNodes = (newModuleData.domains || []).map((domain, dIdx) => {
            const domainId = domain.id || `custom-d${dIdx + 1}-${Date.now()}`; 
            return {
                ...domain,
                id: domainId,
                title: domain.title || `Domain ${dIdx + 1}`,
                learningGoal: domain.learningGoal || `Learn concepts within ${domain.title || ''}`,
                chronicleTheme: domain.chronicleTheme || 'General knowledge challenges', 
                domainDungeonType: domain.domainDungeonType || 'generic_trial',
                characterAffinities: domain.characterAffinities || [], 
                specterAffinities: domain.specterAffinities || [],
                nodes: (domain.nodes || []).map((node, nIdx) => ({
                    ...node,
                    id: node.id || `${domainId}-n${nIdx + 1}-${Date.now()}`, 
                    nodeType: node.nodeType || 'concept',
                    shortDefinition: node.shortDefinition || "No definition provided.",
                    learningObjective: node.learningObjective || `Understand ${node.title}`,
                    keyTerms: node.keyTerms || [],
                    download: {
                        clarification: node.download?.clarification || "No clarification",
                        example: node.download?.example || "No example",
                        scenario: node.download?.scenario || "No scenario",
                        recallPrompt: node.download?.recallPrompt || `Explain ${node.title}`
                    },
                    epic: node.epic || placeholderEPIC, 
                    status: 'new' as NodeStatus, 
                    familiar: false, 
                    understood: false, 
                    moduleId: moduleId, 
                    domainId: domainId, 
                    memoryStrength: 0,
                    lastReviewed: undefined,
                }))
            };
        });
      const newModule: Module = {
        ...newModuleData, id: moduleId, type: 'auxiliary', 
        title: newModuleData.title || topic, 
        description: newModuleData.description || `A custom module about ${topic}.`,
        moduleLearningGoal: newModuleData.moduleLearningGoal || `Learn about ${topic}`, status: 'in_library', 
        alignmentBias: newModuleData.alignmentBias || 'neutral', defaultCompanion: newModuleData.defaultCompanion || 'neuros',
        associatedSpecters: newModuleData.associatedSpecters || [], recommendedChronicleDungeon: newModuleData.recommendedChronicleDungeon || 'Custom Trial',
        moduleCategory: newModuleData.moduleCategory || ['custom'],
        reviewProfile: newModuleData.reviewProfile || { decayModel: 'standard_exponential', reviewClusters: [], interleaveRatio: 0.2, },
        domains: domainsWithNodes,
      };
       setLearningState(prev => {
           const newModules = { ...prev.modules, [newModule.id]: newModule };
           return { ...prev, modules: newModules, activeSession: null, activeReadingSession: null, activeReviewSession: null };
       });
      queueToast({ title: "Custom Module Created", description: `${newModule.title} added to your library.` });
    } catch (err) { 
        const error = err as Error; 
        console.error("Error creating custom module:", err);
        queueToast({ title: "Module Creation Failed", description: error.message || "Could not generate the custom module.", variant: "destructive" });
    } finally { setIsLoadingCustom(false); }
  }, [queueToast, clearEvaluationResultCallback, setLearningState, setIsLoadingCustom]);

 const advanceProgressCallback = useCallback(() => {
    if (!activeSession || !currentActiveModule) return;
    const currentModule = currentActiveModule as Module; 
    const { currentModuleId, currentDomainIndex, currentNodeIndex, currentPhase } = activeSession;

    let nextNodeIndex = currentNodeIndex;
    let nextDomainIndex = currentDomainIndex;
    let nextPhase = currentPhase;
    let nextEpicStep: EpicStep = 'explain'; 

    // If we're in the reading phase, move to download phase
    if (currentPhase === 'reading') {
      nextPhase = 'download';
      nextNodeIndex = 0;
      nextDomainIndex = 0;
      updateModuleStatusCallback(currentModuleId!, 'downloading');
      queueToast({ title: "Phase Transition", description: "Moving from Reading to Download phase." });
    } 
    // If we're in download phase and have completed all nodes in the domain
    else if (currentPhase === 'download') {
      nextNodeIndex++;
      const currentDomainNodes = currentModule.domains[nextDomainIndex]?.nodes;

      if (currentDomainNodes && nextNodeIndex < currentDomainNodes.length) {
        // Just move to the next node in download phase
      } else {
        // Check if there are domain integration questions needed
        const hasDomainCompletionChecks = activeSession.completedDomainIntegrations?.includes(currentModule.domains[currentDomainIndex].id) === false;
        
        if (hasDomainCompletionChecks) {
          // TODO: Generate domain integration questions
          // For now, just mark it as completed
          setLearningState(prev => ({
            ...prev,
            activeSession: {
              ...prev.activeSession!,
              completedDomainIntegrations: [
                ...(prev.activeSession?.completedDomainIntegrations || []),
                currentModule.domains[currentDomainIndex].id
              ]
            }
          }));
          queueToast({ title: "Domain Complete", description: `Completed download for ${currentModule.domains[currentDomainIndex].title}` });
        }
        
        // Move to next domain
        nextDomainIndex++;
        nextNodeIndex = 0; 
        
        if (nextDomainIndex < currentModule.domains.length) {
          // Find next domain with nodes
          let foundDomainWithNodes = false;
          while(nextDomainIndex < currentModule.domains.length){
            if(currentModule.domains[nextDomainIndex]?.nodes?.length > 0){
              foundDomainWithNodes = true;
              break;
            }
            nextDomainIndex++; 
          }
          
          if(!foundDomainWithNodes){ 
            // No more domains with nodes, move to install phase
            if (currentPhase === 'download') {
              nextPhase = 'install'; 
              nextDomainIndex = 0; 
              nextNodeIndex = 0;
              let installDomainFound = false;
              for(let i=0; i < currentModule.domains.length; i++){
                if(currentModule.domains[i]?.nodes?.length > 0){
                  nextDomainIndex = i;
                  installDomainFound = true;
                  break;
                }
              }
              if(installDomainFound){
                updateModuleStatusCallback(currentModuleId!, 'downloaded');
                queueToast({ title: "Phase Transition", description: "Download phase complete. Entering Install Phase." });
              } else { 
                updateModuleStatusCallback(currentModuleId!, 'installed');
                setLearningState(prev => ({ ...prev, activeSession: null })); 
                setActiveInteraction('finished');
                queueToast({ title: "Module Complete", description: `${currentModule.title} has no nodes for install.` }); 
                return;
              }
            }
          }
        } else {
          // No more domains, transition to install phase
          if (currentPhase === 'download') {
            nextPhase = 'install'; 
            nextDomainIndex = 0; 
            nextNodeIndex = 0;
            let installDomainFound = false;
            for(let i=0; i < currentModule.domains.length; i++){
              if(currentModule.domains[i]?.nodes?.length > 0){
                nextDomainIndex = i;
                installDomainFound = true;
                break;
              }
            }
            if(installDomainFound){
              updateModuleStatusCallback(currentModuleId!, 'downloaded');
              queueToast({ title: "Phase Transition", description: "Download phase complete. Entering Install Phase." });
            } else {
              updateModuleStatusCallback(currentModuleId!, 'installed');
              setLearningState(prev => ({ ...prev, activeSession: null })); 
              setActiveInteraction('finished');
              queueToast({ title: "Module Complete", description: `${currentModule.title} has no nodes for install.` }); 
              return;
            }
          }
        }
      }
    } else if (currentPhase === 'install') {
      // Install phase logic
      let nextStep = currentEpicStep;
      let shouldAdvanceNode = false;

      const epicStepsOrder: EpicStep[] = ['explain', 'probe', 'implement', 'connect'];
      const currentStepIndex = epicStepsOrder.indexOf(currentEpicStep);

      if (currentStepIndex < epicStepsOrder.length - 1) {
        nextStep = epicStepsOrder[currentStepIndex + 1];
        // Note: don't call fetchProbeQuestionsInternalCallback directly here
        // it will be triggered by the state change when currentEpicStep is updated
      } else { 
        shouldAdvanceNode = true; 
      }
      
      if (shouldAdvanceNode) {
        _markNodeUnderstoodInternalCallback(); 
        
        nextNodeIndex++;
        const currentDomainNodes = currentModule.domains[nextDomainIndex]?.nodes;
        // Check if there are more nodes in this domain
        if (currentDomainNodes && nextNodeIndex < currentDomainNodes.length) {
          // Just move to next node in install
          nextEpicStep = 'explain'; // Reset EPIC step for new node
          setCurrentEpicStep('explain');
        } else {
          // No more nodes in this domain, find the next domain with nodes
          nextDomainIndex++;
          nextNodeIndex = 0;
          
          if (nextDomainIndex < currentModule.domains.length) {
            // Search for the next domain with nodes
            let foundDomainWithNodes = false;
            while (nextDomainIndex < currentModule.domains.length) {
              if (currentModule.domains[nextDomainIndex]?.nodes?.length > 0) {
                foundDomainWithNodes = true;
                break;
              }
              nextDomainIndex++;
            }
            
            if (!foundDomainWithNodes) {
              // No more domains with nodes, complete the module
              updateModuleStatusCallback(currentModuleId!, 'installed');
              setLearningState(prev => ({ ...prev, activeSession: null }));
              setActiveInteraction('finished');
              queueToast({ title: "Module Installation Complete!", description: `Completed ${currentModule.title}.` });
              return;
            } else {
              // Found a valid domain with nodes
              nextEpicStep = 'explain'; // Reset EPIC step for new domain/node
              setCurrentEpicStep('explain');
            }
          } else {
            // No more domains, complete the module
            updateModuleStatusCallback(currentModuleId!, 'installed');
            setLearningState(prev => ({ ...prev, activeSession: null }));
            setActiveInteraction('finished');
            queueToast({ title: "Module Installation Complete!", description: `Completed ${currentModule.title}.` });
            return;
          }
        }
      } else {
        // Just update the EPIC step
        setCurrentEpicStep(nextStep);
        return; // Don't update the session state, just the EPIC step
      }
    }

    // Update session state
    const newSession: LearningProgress = {
      ...activeSession,
      currentDomainIndex: nextDomainIndex,
      currentNodeIndex: nextNodeIndex,
      currentPhase: nextPhase,
    };
    
    setLearningState(prev => ({ ...prev, activeSession: newSession, currentLearningFlow: nextPhase }));
    
    // Update module status if needed
    if (nextPhase === 'install' && currentModule.status !== 'installing' && currentModule.status !== 'installed') {
      updateModuleStatusCallback(currentModuleId!, 'installing');
    } else if (nextPhase === 'download' && currentModule.status !== 'downloading') {
      updateModuleStatusCallback(currentModuleId!, 'downloading');
    }
    
    // Reset state for new node/phase
    setCurrentEpicStep(nextEpicStep); 
    setProbeQuestions([]); 
    clearEvaluationResultCallback();
  }, [activeSession, currentActiveModule, currentEpicStep, queueToast, updateModuleStatusCallback, clearEvaluationResultCallback, probeQuestions, _markNodeUnderstoodInternalCallback, setLearningState, setActiveInteraction, setProbeQuestions, setCurrentEpicStep]);

  const fetchProbeQuestionsInternalCallback = useCallback(async () => {
    if (!currentNode || !currentActiveModule || isLoading) return;
    setIsLoading(true);
    
    // First check if the node has the required 3 probe questions in its epic object
    if (currentNode.epic && currentNode.epic.probeQuestions && Array.isArray(currentNode.epic.probeQuestions) && currentNode.epic.probeQuestions.length === 3) {
      console.log("Using predefined probe questions from the module");
      setProbeQuestions(currentNode.epic.probeQuestions);
      setIsLoading(false);
      return;
    }
    
    // Check for legacy probePrompt (for backward compatibility during transition)
    if (currentNode.epic && (currentNode.epic as any).probePrompt) {
      console.log("Using legacy probe prompt from the module, converting to questions");
      const prompt = (currentNode.epic as any).probePrompt;
      
      // Split by question marks to get individual questions, or use the prompt as is if it's already multiple questions
      let questions = prompt.split('?').filter((q: string) => q.trim()).map((q: string) => q.trim() + '?');
      
      // If we only got one question or the split didn't work well, create variations
      if (questions.length <= 1) {
        questions = [
          prompt,
          `Can you provide a specific example related to ${currentNode.title}?`,
          `What are the implications or consequences of ${currentNode.title}?`
        ];
      } else if (questions.length === 2) {
        // Add a third question if we only have 2
        questions.push(`How does ${currentNode.title} connect to other concepts in this domain?`);
      } else if (questions.length > 3) {
        // Take only the first 3 questions
        questions = questions.slice(0, 3);
      }
      
      setProbeQuestions(questions);
      setIsLoading(false);
      return;
    }
    
    // If no predefined questions exist, generate them via the AI
    const characterId = (currentActiveModule as Module).defaultCompanion || await selectAppropriateCharacterId('install');
    try {
      const contextContent = `Module: ${(currentActiveModule as Module).title}, Domain: ${currentDomain?.title}, Concept: ${currentNode.title}, Definition: ${currentNode.shortDefinition}, Clarification: ${currentNode.download.clarification}`;
      const result = await generateProbeQuestions({ concept: currentNode.title, moduleContent: contextContent, characterId });
      // Ensure we have exactly 3 questions
      const generatedQuestions = result.questions.slice(0, 3);
      while (generatedQuestions.length < 3) {
        generatedQuestions.push(`Additional question about ${currentNode.title}?`);
      }
      setProbeQuestions(generatedQuestions);
    } catch (error) {
      console.error("Error generating probe questions:", error);
      queueToast({ title: "Error", description: "Could not generate probe questions.", variant: "destructive" });
      setProbeQuestions([]); 
    } finally { setIsLoading(false); }
  }, [currentNode, currentActiveModule, currentDomain, queueToast, isLoading, setIsLoading, setProbeQuestions]);

  // Automatically fetch probe questions when EPIC step changes to 'probe'
  useEffect(() => {
    if (currentEpicStep === 'probe' && currentNode && currentActiveModule && activeSession?.currentPhase === 'install') {
      // Only fetch if we don't already have probe questions
      if (probeQuestions.length === 0) {
        console.log("Auto-fetching probe questions for EPIC step change");
        fetchProbeQuestionsInternalCallback();
      }
    }
  }, [currentEpicStep, currentNode, currentActiveModule, activeSession?.currentPhase, probeQuestions.length, fetchProbeQuestionsInternalCallback]);

  const performFullEvaluationCallback = useCallback(async (
    userInputText: string,
    analysisContext: AnalysisContext,
    judgingCharacterId?: string 
  ): Promise<EvaluationResult> => {
    setIsLoading(true);
    clearEvaluationResultCallback();
    console.log('[performFullEvaluationCallback]: ENTERED with context:', analysisContext);

    try {
        const userInput: UserInput = { 
          content: userInputText,
          text: userInputText 
        };
        const currentProfile = learningState.currentUserProfile || (await getDefaultLearningState()).currentUserProfile;
        
        let stepTypeForFlow: EvaluateResponseInput['stepType'];
        let baseInteractionType = analysisContext.interactionType;
        
        const epicStepMapping: Record<string, EpicStep | 'recall' | 'diagnostic' | 'chronicle_interaction' | 'review'> = {
            epic_explain: 'explain', epic_probe: 'probe',
            epic_implement: 'implement', epic_connect: 'connect',
            recall: 'recall', diagnostic: 'diagnostic', 
            chronicle_interaction: 'chronicle_interaction', review: 'review'
        };

        if (analysisContext.interactionType === 'review' && analysisContext.componentType && Object.keys(epicStepMapping).includes(analysisContext.componentType as string)) {
             baseInteractionType = analysisContext.componentType as EvaluateResponseInput['stepType'];
        } else if (Object.keys(epicStepMapping).includes(String(analysisContext.interactionType))) {
           baseInteractionType = epicStepMapping[analysisContext.interactionType] as EvaluateResponseInput['stepType'];
        } else if (analysisContext.interactionType === "chronicle_interaction" && analysisContext.componentType) {
             const chronicleInteractionStepTypes: EvaluateResponseInput['stepType'][] = ["explain", "probe", "implement", "connect", "chronicle_interaction"];
            if (chronicleInteractionStepTypes.includes(analysisContext.componentType as any)) { 
                baseInteractionType = analysisContext.componentType as EvaluateResponseInput['stepType'];
            } else {
                 baseInteractionType = 'chronicle_interaction'; 
            }
        } else if (analysisContext.interactionType === "diagnostic" && analysisContext.componentType && Object.keys(epicStepMapping).includes(analysisContext.componentType as string)) {
            baseInteractionType = analysisContext.componentType as EvaluateResponseInput['stepType'] || 'explain'; 
        }


        const validStepTypesForFlow: EvaluateResponseInput['stepType'][] = ["recall", "explain", "probe", "implement", "connect", "review", "diagnostic", "chronicle_interaction"];
        
        if (validStepTypesForFlow.includes(baseInteractionType as any)) {
            stepTypeForFlow = baseInteractionType as EvaluateResponseInput['stepType'];
        } else {
            stepTypeForFlow = 'recall'; 
            console.warn("Unsupported stepType for evaluation flow:", analysisContext.interactionType, "Defaulting to recall.");
        }


        let nodeForEval: Node | undefined | null = null;
        let nodeContentForMimicryCheck: string | undefined = undefined;
        if (analysisContext.moduleId && analysisContext.nodeId) {
            const moduleOfNode = userModules[analysisContext.moduleId] as Module; 
            if (moduleOfNode && moduleOfNode.domains) {
                for (const domain of moduleOfNode.domains) {
                    if (domain.nodes) { 
                        nodeForEval = domain.nodes.find(n => n.id === analysisContext.nodeId);
                        if (nodeForEval) {
                            nodeContentForMimicryCheck = `${nodeForEval.shortDefinition} ${nodeForEval.download.clarification} ${nodeForEval.download.example} ${nodeForEval.download.scenario}`;
                            break;
                        }
                    }
                }
            }
        } else if (currentNode && currentActiveModule && analysisContext.moduleId === (currentActiveModule as Module).id && analysisContext.nodeId === currentNode.id) {
           nodeForEval = currentNode;
           nodeContentForMimicryCheck = `${currentNode.shortDefinition} ${currentNode.download.clarification} ${currentNode.download.example} ${currentNode.download.scenario}`;
        }

        const nodeDefinitionForEval = nodeForEval?.shortDefinition || 'N/A';
        const nodeExplanationForEval = nodeForEval?.download?.clarification || 'N/A';
        
        let stepPromptForEval = "User's response to the current learning challenge.";
        if (nodeForEval && analysisContext.componentType && Object.prototype.hasOwnProperty.call(nodeForEval.epic, analysisContext.componentType)) {
            const componentKey = analysisContext.componentType as keyof NodeEPIC;
            stepPromptForEval = nodeForEval.epic[componentKey] || stepPromptForEval;
        } else if (analysisContext.interactionType === 'recall' && nodeForEval) {
            stepPromptForEval = nodeForEval.download.recallPrompt || stepPromptForEval;
        } else if (analysisContext.interactionType === 'chronicle_interaction' && analysisContext.componentType?.startsWith('epic_') && nodeForEval) {
            const chronicleEpicStep = analysisContext.componentType.replace('epic_', '') as keyof NodeEPIC;
            if (Object.prototype.hasOwnProperty.call(nodeForEval.epic, chronicleEpicStep)) {
                stepPromptForEval = nodeForEval.epic[chronicleEpicStep] || stepPromptForEval;
            }
        } else if (activeInteraction === 'reviewing' && currentActiveReviewSession && nodeForEval && currentActiveReviewSession.nodesToReview[currentActiveReviewSession.currentNodeIndex]) { 
            const reviewNode = currentActiveReviewSession.nodesToReview[currentActiveReviewSession.currentNodeIndex];
            if (reviewNode && Object.prototype.hasOwnProperty.call(nodeForEval.epic, reviewNode.epicComponentToReview)) {
                stepPromptForEval = nodeForEval.epic[reviewNode.epicComponentToReview];
            }
        }

        const evalInputForFlow: EvaluateResponseInput = {
            nodeTitle: analysisContext.nodeTitle || nodeForEval?.title || 'N/A',
            nodeDefinition: nodeDefinitionForEval,
            nodeExplanation: nodeExplanationForEval,
            stepType: stepTypeForFlow, 
            stepPrompt: stepPromptForEval,
            userResponse: userInputText,
            judgingCharacterId: judgingCharacterId, 
            nodeContent: nodeContentForMimicryCheck,
            isThoughtAnalyzerEnabled: learningState.isThoughtAnalyzerEnabled,
            // Add provider information to evaluation flow
            provider: learningState.aiProvider, // Pass the user's selected AI provider
            modelKey: learningState.aiProvider, // Use the same value for modelKey
        };
        
        console.log('[performFullEvaluationCallback]: Calling evaluateResponseFlow with input:', JSON.stringify(evalInputForFlow, null, 2));
        const detailedEvalResult: DetailedEvaluateResponseOutput = await evaluateResponseFlow(evalInputForFlow);
        console.log('[performFullEvaluationCallback]: Received result from flow:', JSON.stringify(detailedEvalResult, null, 2));
        if (detailedEvalResult.debug_error) {
            console.log('[performFullEvaluationCallback]: Server-side info from flow:', detailedEvalResult.debug_error);
            // Don't treat this as an error since we have fallback evaluation
        }
        if (detailedEvalResult.debug_rawAiOutput) {
            console.log('[performFullEvaluationCallback]: Raw AI Output from server:', detailedEvalResult.debug_rawAiOutput);
             try {
                const parsedDebugOutput = JSON.parse(detailedEvalResult.debug_rawAiOutput);
                console.log('[performFullEvaluationCallback]: Parsed Raw AI Output from server:', parsedDebugOutput);
            } catch (parseError) {
                console.warn('[performFullEvaluationCallback]: Raw AI Output from server was not valid JSON.');
            }
        }
        
        const personalityFeedbackText = detailedEvalResult.personalityFeedback || "Feedback generation in progress.";
        let analysisResultData: AnalysisResult | undefined;
        let shameIndexResultData: ShameIndexResult | undefined;
        let feedbackOutputData: FeedbackOutput | undefined = detailedEvalResult.feedbackOutput;

        if (learningState.isThoughtAnalyzerEnabled && detailedEvalResult.rubricScores && Object.values(detailedEvalResult.rubricScores).some(rs => rs && rs.label && !rs.label.endsWith("N/A"))) {
            console.log(`🧠 [EVAL-HOOK] Thought Analyzer ENABLED - calling analyzeThoughtProcess...`);
            console.log(`🧠 [EVAL-HOOK] userInput:`, JSON.stringify(userInput, null, 2));
            console.log(`🧠 [EVAL-HOOK] analysisContext:`, JSON.stringify(analysisContext, null, 2));
            try {
                analysisResultData = await analyzeThoughtProcess({ userInput, analysisContext });
                console.log(`🧠 [EVAL-HOOK] analyzeThoughtProcess result:`, JSON.stringify(analysisResultData, null, 2));
                
                console.log(`🔧 [EVAL-HOOK] Calling processWithShameEngine...`);
                console.log(`🔧 [EVAL-HOOK] currentProfile:`, JSON.stringify(currentProfile, null, 2));
                const shameEngineOutput = await processWithShameEngine({
                    analysisResult: analysisResultData,
                    userProfile: currentProfile!,
                });
                console.log(`🔧 [EVAL-HOOK] processWithShameEngine result:`, JSON.stringify(shameEngineOutput, null, 2));
                
                shameIndexResultData = shameEngineOutput.shameIndexResult;
                feedbackOutputData = { 
                    ...detailedEvalResult.feedbackOutput, 
                    ...shameEngineOutput.feedbackOutput,  
                    mainFeedback: feedbackOutputData?.mainFeedback || shameEngineOutput.feedbackOutput.mainFeedback, 
                };
                console.log(`🎯 [EVAL-HOOK] Final feedbackOutputData:`, JSON.stringify(feedbackOutputData, null, 2));
            } catch (thoughtAnalyzerError) {
                console.error(`❌ [EVAL-HOOK] Thought Analyzer Error:`, thoughtAnalyzerError);
                // Continue with basic evaluation if thought analyzer fails
            }
        } else {
            console.log(`🧠 [EVAL-HOOK] Thought Analyzer DISABLED or insufficient rubric data`);
            console.log(`  - isThoughtAnalyzerEnabled: ${learningState.isThoughtAnalyzerEnabled}`);
            console.log(`  - has rubricScores: ${!!detailedEvalResult.rubricScores}`);
            if (detailedEvalResult.rubricScores) {
                console.log(`  - rubric labels: ${Object.entries(detailedEvalResult.rubricScores).map(([k,v]) => `${k}:${v?.label}`).join(', ')}`);
            }
            feedbackOutputData = {
                mainFeedback: detailedEvalResult.overallFeedback, 
                growthSuggestions: [],
                metacognitivePrompts: [],
                warningFlags: undefined
            };
        }
        
        const finalEvaluationResult: EvaluationResult = {
            score: detailedEvalResult.overallScore,
            overallFeedback: detailedEvalResult.overallFeedback, 
            isPass: detailedEvalResult.isPass,
            rubricScores: detailedEvalResult.rubricScores,
            qualityFlags: detailedEvalResult.qualityFlags,
            personalityFeedback: personalityFeedbackText, 
            analysisResult: analysisResultData, 
            shameIndexResult: shameIndexResultData, 
            feedbackOutput: feedbackOutputData, 
        };

        setEvaluationResult(finalEvaluationResult);
        return finalEvaluationResult;

    } catch (error) {
        console.error("[performFullEvaluationCallback]: Error during full evaluation:", error);
        queueToast({ title: "Evaluation Error", description: "Could not evaluate response.", variant: "destructive" });
        const errorResult: EvaluationResult = {
            score: 0,
            overallFeedback: "Evaluation failed due to an internal error.",
            isPass: false,
            personalityFeedback: "An error occurred while generating personalized feedback."
        };
        setEvaluationResult(errorResult);
        return errorResult;
    } finally {
        setIsLoading(false);
    }
  }, [learningState.currentUserProfile, learningState.isThoughtAnalyzerEnabled, userModules, currentActiveModule, currentNode, queueToast, clearEvaluationResultCallback, activeInteraction, currentActiveReviewSession, setIsLoading, setEvaluationResult]); 


  const submitRecallResponseCallback = useCallback(async (response: string) => {
      if (!response || !currentNode || !currentActiveModule || !activeSession) {
          // We can't proceed without these values
          if (!response) {
              queueToast({ title: "Error", description: "No response provided for evaluation.", variant: "destructive" });
          } else if (!currentNode || !currentActiveModule || !activeSession) {
              queueToast({ title: "Error", description: "Missing context for evaluation.", variant: "destructive" });
          }
          return;
      }
      
      try {
          const analysisContext: AnalysisContext = {
              interactionType: 'recall', 
              nodeTitle: currentNode.title,
              learningObjective: currentNode.learningObjective,
              moduleId: (currentActiveModule as Module).id, 
              nodeId: currentNode.id,
          };
          const result = await performFullEvaluationCallback(response, analysisContext, (currentActiveModule as Module).defaultCompanion || 'neuros');

          if (result.isPass) {
              queueToast({ title: "Recall Passed!", description: `Score: ${result.score.toFixed(0)}/100. Review feedback for insights.` });
              _markNodeFamiliarInternalCallback();
          } else {
              queueToast({ title: "Recall Needs Improvement", description: `Score: ${result.score.toFixed(0)}/100. ${result.overallFeedback || result.personalityFeedback}`, variant: "destructive" });
          }
      } catch (error) {
          console.error("Error in submitRecallResponseCallback:", error);
          queueToast({ title: "Evaluation Error", description: "An error occurred while evaluating your response.", variant: "destructive" });
      }
  }, [currentNode, currentActiveModule, activeSession, performFullEvaluationCallback, queueToast, _markNodeFamiliarInternalCallback]);

   const submitEpicResponseCallback = useCallback(async (response: string) => {
      if (!response || !currentNode || !currentActiveModule || !activeSession) {
          // We can't proceed without these values
          if (!response) {
              queueToast({ title: "Error", description: "No response provided for evaluation.", variant: "destructive" });
          } else if (!currentNode || !currentActiveModule || !activeSession) {
              queueToast({ title: "Error", description: "Missing context for evaluation.", variant: "destructive" });
          }
          return;
      }
      
      try {
          const analysisContext: AnalysisContext = {
              interactionType: `epic_${currentEpicStep}` as AnalysisContext['interactionType'], 
              nodeTitle: currentNode.title,
              learningObjective: currentNode.learningObjective,
              moduleId: (currentActiveModule as Module).id, 
              nodeId: currentNode.id,
              componentType: currentEpicStep, 
          };
          const judgingCharId = currentEpicStep === 'probe' ? 'neurosis' : (currentActiveModule as Module).defaultCompanion || 'neuros';
          const result = await performFullEvaluationCallback(response, analysisContext, judgingCharId);

          if (result.isPass) {
              queueToast({ title: `EPIC: ${currentEpicStep} Passed!`, description: `Score: ${result.score.toFixed(0)}/100. Review feedback for insights.` });
              if (currentEpicStep === 'connect') { 
                  _markNodeUnderstoodInternalCallback(); 
              }
          } else {
              queueToast({ title: `EPIC: ${currentEpicStep} Needs Improvement`, description: `Score: ${result.score.toFixed(0)}/100. ${result.overallFeedback || result.personalityFeedback}`, variant: "destructive" });
          }
      } catch (error) {
          console.error("Error in submitEpicResponseCallback:", error);
          queueToast({ title: "Evaluation Error", description: "An error occurred while evaluating your response.", variant: "destructive" });
      }
   }, [currentNode, currentActiveModule, activeSession, currentEpicStep, performFullEvaluationCallback, queueToast, _markNodeUnderstoodInternalCallback]);


  const handleProceedAfterSuccessCallback = useCallback(() => {
    if (!activeSession || !currentActiveModule || !currentNode) return;

    clearEvaluationResultCallback(); 

    if (activeSession.currentPhase === 'download') {
        if (currentNode.familiar) { 
             advanceProgressCallback();
        } else {
            _markNodeFamiliarInternalCallback(); 
            advanceProgressCallback();
        }
    } else if (activeSession.currentPhase === 'install') {
        const epicStepsOrder: EpicStep[] = ['explain', 'probe', 'implement', 'connect'];
        const currentStepIndex = epicStepsOrder.indexOf(currentEpicStep);

        if (currentStepIndex < epicStepsOrder.length - 1) {
            // Move to next EPIC step
            const nextStep = epicStepsOrder[currentStepIndex + 1];
            setCurrentEpicStep(nextStep);
            if (nextStep === 'probe') {
                fetchProbeQuestionsInternalCallback(); 
            }
        } else { 
            // We're at the connect step, so advance to next node
            _markNodeUnderstoodInternalCallback(); 
            advanceProgressCallback(); 
        }
    }
  }, [activeSession, currentActiveModule, currentNode, currentEpicStep, advanceProgressCallback, fetchProbeQuestionsInternalCallback, clearEvaluationResultCallback, _markNodeFamiliarInternalCallback, _markNodeUnderstoodInternalCallback, setCurrentEpicStep]);


  const submitDiagnosticResponseCallback = useCallback(async (nodeForContext: Node, diagnosticPromptText: string, response: string, diagnosticLevel: AnalysisContext['interactionType'] = 'diagnostic', epicStep?: EpicStep) => {
      if (!nodeForContext || !nodeForContext.moduleId) { 
          queueToast({ title: "Diagnostic Error", description: "Node or module information missing for context.", variant: "destructive" });
          setEvaluationResult({score: 0, overallFeedback: "Context error for diagnostic.", isPass:false}); 
          return;
      }
      const analysisContext: AnalysisContext = {
        interactionType: diagnosticLevel, 
        nodeTitle: nodeForContext.title,
        learningObjective: nodeForContext.learningObjective,
        moduleId: nodeForContext.moduleId, 
        nodeId: nodeForContext.id,
        componentType: epicStep || 'explain', 
      };
      const result = await performFullEvaluationCallback(response, analysisContext, 'veritas'); 
      
      if (result.isPass) {
          queueToast({ title: "Diagnostic Passed!", description: `Score: ${result.score.toFixed(0)}/100. Review feedback for insights.` });
          const module = userModules[nodeForContext.moduleId] as Module; 
          if (module && module.domains && (diagnosticLevel === 'diagnostic' || diagnosticLevel === 'node' || analysisContext.componentType === 'node') && nodeForContext.domainId) { 
              const domainIndex = module.domains.findIndex(d => d.id === nodeForContext.domainId);
              if (domainIndex !== -1 && module.domains[domainIndex].nodes) {
                  const nodeIndex = module.domains[domainIndex].nodes.findIndex(n => n.id === nodeForContext.id);
                  if (nodeIndex !== -1) {
                     updateNodeStatusCallback(nodeForContext.moduleId!, domainIndex, nodeIndex, 'understood', true, true, new Date(), result.score);
                  }
              }
          }
      } else {
          queueToast({ title: "Diagnostic Needs Improvement", description: `Score: ${result.score.toFixed(0)}/100. ${result.overallFeedback || 'See detailed report.'}`, variant: "destructive" });
      }
  }, [performFullEvaluationCallback, queueToast, userModules, updateNodeStatusCallback, setEvaluationResult]);

  const endChronicleRunCallback = useCallback((didWin = false) => {
      if (!currentActiveChronicleRun) return; 

      queueToast({ title: "Chronicle Ended", description: `Run in ${currentActiveChronicleRun.currentDungeon?.name || 'dungeon'} has concluded.`, duration: 3000});
      setLearningState(prevState => ({ ...prevState!, activeChronicleRun: null }));
      setActiveInteraction('initial');
  }, [currentActiveChronicleRun, queueToast, setLearningState, setActiveInteraction]);


  const resetSessionCallback = useCallback(() => {
    const currentModuleId = activeSession?.currentModuleId;
    if (currentModuleId) {
        const mod = userModules[currentModuleId] as Module; 
        if (mod && mod.status === 'downloading') updateModuleStatusCallback(currentModuleId, 'in_library');
        else if (mod && mod.status === 'installing') updateModuleStatusCallback(currentModuleId, 'downloaded');
    }
    setLearningState(prev => ({ ...prev, activeSession: null, activeReadingSession: null, activeReviewSession: null }));
    setProbeQuestions([]); clearEvaluationResultCallback(); setCurrentEpicStep('explain');
    setActiveInteraction('initial'); setIsLoading(false); setIsLoadingCustom(false);
    queueToast({ description: "Learning session ended." });
  }, [queueToast, activeSession, userModules, updateModuleStatusCallback, clearEvaluationResultCallback, setLearningState, setProbeQuestions, setCurrentEpicStep, setActiveInteraction, setIsLoading, setIsLoadingCustom]);

  const startChronicleRunCallback = useCallback(async (dungeonId: string) => {
    if (!isInitialLoadDoneRef.current || !isChronicleSystemReady) { 
        queueToast({ title: "System Busy", description: "Chronicle system is still initializing. Please try again shortly.", variant: "default" });
        return;
    }
    setIsLoadingChronicle(true);
    setDetailedLoadingProgress(initialDetailedLoadingState); 
    setActiveInteraction('chronicle'); 

    setDetailedLoadingProgress(prev => ({ ...prev, dungeonData: { status: 'loading', error: null } }));
    let dungeon: Dungeon | undefined;
    try {
        dungeon = await getDungeonById(dungeonId);
        if (!dungeon) throw new Error(`Dungeon ${dungeonId} not found.`);
        setDetailedLoadingProgress(prev => ({ ...prev, dungeonData: { status: 'success', error: null } }));
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to load dungeon data.";
        console.error("startChronicleRunCallback - Dungeon Load Error:", msg);
        queueToast({ title: "Dungeon Load Error", description: msg, variant: "destructive" });
        setDetailedLoadingProgress(prev => ({ ...prev, dungeonData: { status: 'error', error: msg } }));
        setIsLoadingChronicle(false); setActiveInteraction('initial'); return;
    }

    setDetailedLoadingProgress(prev => ({ ...prev, characterData: { status: 'loading', error: null } }));
    let runOrError: ChronicleRunState | string;
    try {
        const currentCharacterBase = await getPlayerStateBaseInternal(); 
        runOrError = await chronicleStartDungeonRun(dungeonId, learningState.modules, currentCharacterBase, hasAnyInstalledModules);
        if (typeof runOrError === 'string') throw new Error(runOrError); 
        
        if (dungeon) {
             runOrError.currentDungeon = dungeon; 
        } else if (!runOrError.currentDungeon || !runOrError.currentDungeon.floors) {
            const freshDungeonData = await getDungeonById(runOrError.dungeonId);
            if(freshDungeonData) runOrError.currentDungeon = freshDungeonData;
            else throw new Error (`Failed to re-fetch dungeon data for ${runOrError.dungeonId} within startChronicleRun.`);
        }

        setDetailedLoadingProgress(prev => ({ ...prev, characterData: { status: 'success', error: null } }));
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to initialize player for dungeon.";
        console.error("startChronicleRunCallback - Player Init Error:", msg);
        queueToast({ title: "Player Setup Error", description: msg, variant: "destructive" });
        setDetailedLoadingProgress(prev => ({ ...prev, characterData: { status: 'error', error: msg } }));
        setIsLoadingChronicle(false); setActiveInteraction('initial'); return;
    }
    
    setDetailedLoadingProgress(prev => ({ ...prev, aiConnection: { status: 'loading', error: null } }));
    await new Promise(resolve => setTimeout(resolve, 700)); 
    setDetailedLoadingProgress(prev => ({ ...prev, aiConnection: { status: 'success', error: null } }));
    
    const runStateToSet = runOrError as ChronicleRunState; 
    
    setLearningState(prev => ({ ...prev, activeChronicleRun: runStateToSet, activeSession: null, activeReadingSession: null, activeReviewSession: null }));
    clearEvaluationResultCallback();
    setIsLoadingChronicle(false);
    queueToast({title: "Chronicle Initiated", description: `Entering ${runStateToSet.currentDungeon?.name || 'the Neuroverse'}`});

  }, [isChronicleSystemReady, learningState.modules, hasAnyInstalledModules, queueToast, clearEvaluationResultCallback, setLearningState, setActiveInteraction, setIsLoadingChronicle, setDetailedLoadingProgress]);

  const retryDungeonLoadCallback = useCallback((dungeonId?: string) => {
    const runToRetryId = dungeonId || currentActiveChronicleRun?.dungeonId;
    if(runToRetryId) {
        startChronicleRunCallback(runToRetryId);
    } else {
        setActiveInteraction('initial'); 
    }
  }, [startChronicleRunCallback, currentActiveChronicleRun, setActiveInteraction]);


  const movePlayerCallback = useCallback(async (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!currentActiveChronicleRun) {
         queueToast({ title: "Error", description: "No active run to move player.", variant: "destructive" });
         return;
    }
    
    const result = await chronicleMovePlayer(currentActiveChronicleRun, direction); 
    
    if (result.toast) queueToast(result.toast);
    
    if (result.updatedRunState) {
        setLearningState(prev => ({
            ...prev,
            activeChronicleRun: result.updatedRunState 
        }));

        if(result.updatedRunState?.activeBattle){
          queueToast({title: "Battle!", description: `You encounter enemies!`});
        } else if (result.updatedRunState?.currentEncounter){
          queueToast({title: "Encounter!", description: `You've run into ${result.updatedRunState.currentEncounter.title || 'a mysterious event'}`});
        }
    }
    
    if (result.endRun) {
        endChronicleRunCallback(result.endRun.didWin);
    }
  }, [queueToast, endChronicleRunCallback, currentActiveChronicleRun, setLearningState]); 

  const interactWithTileCallback = useCallback(async () => {
    if (!currentActiveChronicleRun) {
         queueToast({ title: "Error", description: "No active run to interact with tile.", variant: "destructive" });
         return;
    }

    // TODO: Implement tile interaction - function missing
    // Placeholder implementation
    const result = { 
      toast: null,
      updatedRunState: null,
      updatedPlayerBase: null
    };
    
    if (result.toast) queueToast(result.toast);
    if (result.updatedRunState) {
        setLearningState(prev => ({ ...prev, activeChronicleRun: result.updatedRunState }));
    }
     if(result.updatedPlayerBase) {
        setLearningState(prev => ({ ...prev, playerCharacterBase: result.updatedPlayerBase! }));
    }
  }, [queueToast, currentActiveChronicleRun, setLearningState]); 

  const onPlayerCombatActionCallback = useCallback(async (action: BattleActionRequest) => {
    if (!currentActiveChronicleRun || !currentActiveChronicleRun.activeBattle) {
        queueToast({ description: "No active battle.", variant: "destructive" });
        return;
    }
    
    let cognitiveScore = 75; 
    const battle = currentActiveChronicleRun.activeBattle;
    const actor = battle.participants.find(p => p.id === battle!.currentTurnActorId);
    const spell = action.spellId && actor ? actor.abilities.find(ab => ab.id === action.spellId) : null;
    
    let currentActionModuleId = spell?.moduleReference?.moduleId;
    let currentActionNodeId = spell?.moduleReference?.nodeId;
    let currentActionNodeTitle = "General Knowledge"; 
    let analysisContextModuleId = currentActionModuleId; 
    let nodeIdForContext: string | undefined = currentActionNodeId; 

    if (!currentActionModuleId && currentActiveChronicleRun.playerState.equippedSpellbookId && (actor?.isPlayer || actor?.isAlly)) {
        const equippedSpellbook = learningState.playerCharacterBase.spellbooks.find(sb => sb.id === currentActiveChronicleRun.playerState.equippedSpellbookId);
        if (equippedSpellbook) {
          analysisContextModuleId = equippedSpellbook.moduleId;
          if (spell?.moduleReference?.nodeId) nodeIdForContext = spell.moduleReference.nodeId;
        }
    } else if (!currentActionModuleId && spell?.moduleReference?.moduleId){ 
        analysisContextModuleId = spell.moduleReference.moduleId;
    }
    
    const moduleForNode = analysisContextModuleId ? userModules[analysisContextModuleId] as Module : null; 
    const nodeForAction = moduleForNode?.domains?.flatMap(d => d.nodes).find(n => n.id === currentActionNodeId);
    if(nodeForAction) currentActionNodeTitle = nodeForAction.title;
    
    const promptToUse = action.type === 'defend' && battle.currentPrompt
    ? battle.currentPrompt 
    : spell?.epicType ? chronicleGenerateEPICChallenge( 
        spell.epicType,
        currentActionNodeId || 'general_knowledge_node', 
        spell.effectPower > 20 ? 3 : (spell.effectPower > 10 ? 2: 1), 
        nodeForAction 
    ) : null;


    if (action.cognitiveResponse && action.cognitiveResponse.answer && promptToUse) {
        const analysisContext: AnalysisContext = {
            interactionType: 'chronicle_interaction', 
            componentType: action.type === 'defend' ? 'battle_action_defense' : 'battle_action', 
            nodeTitle: currentActionNodeTitle, 
            moduleId: analysisContextModuleId, 
            nodeId: promptToUse.referenceNodeId, 
            encounterId: battle.encounterId, 
        };
        const judgingCharId = currentActiveChronicleRun.currentDungeon?.guardian?.characterId || currentActiveModule?.id || 'neuros';
        const evalResult = await performFullEvaluationCallback(action.cognitiveResponse.answer, analysisContext, judgingCharId);
        cognitiveScore = evalResult.score;
        setEvaluationResult(evalResult); 
    }

    const result = await chronicleProcessBattleAction(currentActiveChronicleRun, action, cognitiveScore); 

    if (result.toast) queueToast(result.toast);

    if (result.updatedRunState) {
        setLearningState(prev => ({
            ...prev,
            activeChronicleRun: result.updatedRunState 
        }));
        if (result.updatedRunState.playerState) {
            const basePlayer = await getPlayerStateBaseInternal(); 
            setLearningState(prevState => ({
                ...prevState,
                playerCharacterBase: {
                    ...basePlayer, 
                    inventory: result.updatedRunState.playerState.inventory,
                    spellbooks: result.updatedRunState.playerState.spellbooks,
                    party: result.updatedRunState.playerState.party || [], 
                }
            }));
        }
    }

    if (result.battleEnded) {
        if (result.playerWon) {
            queueToast({ title: "Victory!", description: "All enemies defeated!" });
            if (result.rewards && result.rewards.items && result.rewards.items.length > 0) {
              queueToast({description: `Loot: ${result.rewards.items.map(i => i.name).join(', ')}`});
            }
            const battlePromptNodeId = battle?.currentPrompt?.referenceNodeId || spell?.moduleReference?.nodeId;
            if(battlePromptNodeId && analysisContextModuleId){ 
                 const { userLearningState: updatedLearningState, oldStrength, newStrength } = updateMemoryStrengthFromChronicle(learningState, battlePromptNodeId, cognitiveScore); 
                 const nodeForDisplay = (userModules[analysisContextModuleId!] as Module)?.domains.flatMap(d=>d.nodes).find(n=>n.id===battlePromptNodeId); 
                 queueToast({description: `Cognitive Link Strengthened for ${nodeForDisplay?.title || battlePromptNodeId.split('-').pop()} to ${newStrength.toFixed(0)}%`});
                 setLearningState(updatedLearningState); 
            }
        } else {
            queueToast({ title: "Defeat!", description: "Your party has fallen.", variant: "destructive" });
        }
         setTimeout(() => {
            if (result.playerWon && currentActiveChronicleRun) { 
                 setLearningState(prev => {
                    if (!prev.activeChronicleRun) return prev; 
                    const updatedRun = {...prev.activeChronicleRun, activeBattle: null};
                    return {...prev, activeChronicleRun: updatedRun};
                 });
                 clearEvaluationResultCallback(); 
            } else {
                endChronicleRunCallback(false); 
            }
        }, 3000); 
    } else if (result.updatedRunState?.activeBattle?.defendingPlayerId === learningState.playerCharacterBase.id && result.updatedRunState.activeBattle.currentPrompt) {
        queueToast({ title: "Defend!", description: "Enemy attacks! Answer the challenge to mitigate damage."});
    } else {
        setTimeout(() => clearEvaluationResultCallback(), 1500);
    }
  }, [queueToast, endChronicleRunCallback, performFullEvaluationCallback, learningState.playerCharacterBase, userModules, currentActiveModule, currentActiveChronicleRun, clearEvaluationResultCallback, learningState, setLearningState]);


  const submitChronicleEncounterResponseCallback = useCallback(async (response: string, battleAction?: BattleActionRequest) => {
    if (!currentActiveChronicleRun || (!currentActiveChronicleRun.currentEncounter && !battleAction)) return; 
    
    const isDefenseAction = battleAction?.type === 'defend'; 
    const encounterToEvaluate = currentActiveChronicleRun.currentEncounter; 
    const nodeFromEncounter = encounterToEvaluate?.moduleReference?.nodeIds?.[0];
    const moduleFromEncounter = encounterToEvaluate?.moduleReference?.moduleId;

    let nodeTitleForContext = encounterToEvaluate?.title || (isDefenseAction ? "Defensive Action" : "Chronicle Action");
    let moduleIdForContext = moduleFromEncounter || currentActiveModule?.id; 
    let nodeIdForContext = nodeFromEncounter || battleAction?.cognitiveResponse?.promptId; 
    
    if (nodeFromEncounter && moduleFromEncounter) {
        const mod = userModules[moduleFromEncounter] as Module; 
        const node = mod?.domains.flatMap(d => d.nodes).find(n => n.id === nodeFromEncounter);
        if(node) nodeTitleForContext = node.title;
    }

    const analysisContext: AnalysisContext = {
        interactionType: 'chronicle_interaction',
        nodeTitle: nodeTitleForContext,
        moduleId: moduleIdForContext,
        nodeId: nodeIdForContext,
        encounterId: encounterToEvaluate?.id || currentActiveChronicleRun.activeBattle?.encounterId, 
        componentType: isDefenseAction ? 'battle_action_defense' : (encounterToEvaluate?.type as EpicStep | undefined) || undefined, 
    };

    const judgingCharId = currentActiveChronicleRun.currentDungeon?.guardian?.characterId || currentActiveModule?.id || 'neuros';
    const result = await performFullEvaluationCallback(response, analysisContext, judgingCharId);
    setEvaluationResult(result); 

    if (encounterToEvaluate) { 
        let updatedRun = { ...currentActiveChronicleRun }; 
        if (result.isPass) {
            queueToast({ title: "Encounter Success!", description: `Score: ${result.score.toFixed(0)}/100. ${result.overallFeedback || 'Well done!'}` });
            
            if (encounterToEvaluate.rewards) {
                const rewardsSummary = await chronicleDistributeRewards(playerCharacterBase, encounterToEvaluate.rewards); 
                if(rewardsSummary.items && rewardsSummary.items.length > 0) queueToast({description: `Received: ${rewardsSummary.items.map(i=>i.name).join(', ')}`});
                
                if(rewardsSummary.companionId) {
                     const recruitResult = await chronicleRecruitCompanion(updatedRun, rewardsSummary.companionId);
                     if(recruitResult.success && recruitResult.companion){
                        queueToast({description: `${recruitResult.companion.name} has joined your party!`});
                        updatedRun = recruitResult.updatedRunState; 
                     } else {
                        queueToast({description: `Failed to recruit ${rewardsSummary.companionId}. Party might be full or companion unavailable.`});
                     }
                }
                if(rewardsSummary.spellbookId) {
                    const spellbook = await getSpellbookById(rewardsSummary.spellbookId); 
                    if(spellbook) {
                        queueToast({description: `Spellbook knowledge of ${spellbook.name} acquired!`});
                        if(!updatedRun.playerState.spellbooks.find(sb => sb.id === spellbook.id)){
                            updatedRun.playerState.spellbooks.push(spellbook);
                             const latestPlayerBase = await getPlayerStateBaseInternal(); 
                             latestPlayerBase.spellbooks = updatedRun.playerState.spellbooks;
                             savePlayerStateBaseInternal(latestPlayerBase); 
                             setLearningState(prev => ({...prev, playerCharacterBase: latestPlayerBase}));
                        }
                    }
                }
                
                const latestPlayerBaseAfterRewards = await getPlayerStateBaseInternal(); 
                setLearningState(prev => ({...prev, playerCharacterBase: latestPlayerBaseAfterRewards})); 
            }

            updatedRun.completedEncounters = [...(updatedRun.completedEncounters || []), encounterToEvaluate.id];
            updatedRun.currentEncounter = null; 
            
            if (updatedRun.currentDungeon && updatedRun.currentDungeon.floors) {
                const floorIdx = updatedRun.currentDungeon.floors.findIndex(f => f.level === updatedRun.currentFloor);
                const pos = encounterToEvaluate.position || {x: -1, y: -1}; 
                if (floorIdx !== -1 && updatedRun.currentDungeon.floors[floorIdx].map?.[pos.y]?.[pos.x]) {
                   (updatedRun.currentDungeon.floors[floorIdx].map[pos.y][pos.x] as ChronicleMapCell).type = 'floor'; 
                   (updatedRun.currentDungeon.floors[floorIdx].map[pos.y][pos.x] as ChronicleMapCell).encounterId = undefined; 
                }
            }
            
            setLearningState(prev => ({...prev, activeChronicleRun: updatedRun}));
            setTimeout(() => clearEvaluationResultCallback(), 3000); 
            
        } else { 
            queueToast({ title: "Encounter Failed", description: `Score: ${result.score.toFixed(0)}/100. ${result.overallFeedback || 'Needs improvement.'}`, variant: "destructive" });
            
            if ((encounterToEvaluate.type === 'discussion' || encounterToEvaluate.type === 'debate') && currentActiveChronicleRun) {
                 const dialogueData = encounterToEvaluate.discussionData || encounterToEvaluate.debateData;
                 const responseNode = dialogueData?.dialogueTree.find(dtn => dtn.responses?.some(r => r.text.toLowerCase() === response.toLowerCase())); 
                 
                 if (responseNode?.triggersBattleId || (dialogueData && (dialogueData as any).fallbackResult === 'battle')) { 
                    const battleEncounterDef: ChronicleEncounterDefinition = {
                        id: responseNode?.triggersBattleId || `battle-from-${encounterToEvaluate.id}`,
                        type: 'battle',
                        entityType: encounterToEvaluate.entityType || 'specter', 
                        entityId: encounterToEvaluate.entityId,
                        difficulty: encounterToEvaluate.difficulty,
                        moduleReference: encounterToEvaluate.moduleReference,
                        completed: false,
                        title: `Confrontation with ${encounterToEvaluate.entityId}`,
                        description: "The discussion has escalated to a battle!",
                    };
                    const battleResult = await chronicleInitiateBattle(battleEncounterDef, currentActiveChronicleRun.playerState); 
                    setLearningState(prev => {
                        if (!prev.activeChronicleRun) return prev;
                        const updatedRunWithBattle = {
                            ...prev.activeChronicleRun,
                            activeBattle: typeof battleResult === 'string' ? null : battleResult, 
                            currentEncounter: null, 
                        };
                        if (typeof battleResult === 'string') {
                            queueToast({title: "Battle Error", description: battleResult, variant: "destructive"});
                        } else {
                            queueToast({title: "Battle!", description: `The interaction failed and a battle has begun!`});
                        }
                        return {...prev, activeChronicleRun: updatedRunWithBattle};
                    });
                 } else {
                     setTimeout(() => clearEvaluationResultCallback(), 3000); 
                 }
            } else {
                 setTimeout(() => clearEvaluationResultCallback(), 3000); 
            }
        }
    }
  }, [performFullEvaluationCallback, queueToast, currentActiveModule, userModules, clearEvaluationResultCallback, currentActiveChronicleRun, playerCharacterBase, setLearningState]);
  
  const admin_removeModuleFromLibraryCallback = useCallback((moduleId: string) => {
    setLearningState(prev => {
        const updatedModules = { ...prev.modules };
        if (updatedModules[moduleId]) {
            const moduleToReset = getPredefinedModuleById(moduleId); 
            if (moduleToReset) { 
                 updatedModules[moduleId] = JSON.parse(JSON.stringify(moduleToReset)); 
                 (updatedModules[moduleId] as Module).status = 'new'; 
                 if ((updatedModules[moduleId] as Module).domains) { 
                     (updatedModules[moduleId] as Module).domains.forEach(domain => { 
                         if (domain.nodes) {
                             domain.nodes.forEach(node => {
                                 node.status = 'new';
                                 node.familiar = false;
                                 node.understood = false;
                                 node.memoryStrength = 0;
                                 node.lastReviewed = undefined;
                             });
                         }
                     });
                 }
            } else { 
                delete updatedModules[moduleId];
            }
        }
        return { ...prev, modules: updatedModules, 
                 activeSession: prev.activeSession?.currentModuleId === moduleId ? null : prev.activeSession,
                 activeChronicleRun: prev.activeChronicleRun?.dungeonId?.includes(moduleId) ? null : prev.activeChronicleRun, 
                 activeReviewSession: null, 
                 activeReadingSession: prev.activeReadingSession?.moduleId === moduleId ? null : prev.activeReadingSession
               };
    });
    queueToast({ title: "Admin Action", description: `Module ${moduleId} reset/removed.` });
    if (activeSession?.currentModuleId === moduleId || currentActiveChronicleRun?.dungeonId?.includes(moduleId) || activeReadingSession?.moduleId === moduleId) {
        setActiveInteraction('initial');
    }
  }, [queueToast, activeSession, currentActiveChronicleRun, activeReadingSession, setLearningState, setActiveInteraction]);

  const admin_setModuleStatusCallback = useCallback((moduleId: string, newStatus: ModuleStatus) => {
    setLearningState(prev => {
        const module = prev.modules[moduleId];
        if (!module) return prev;
        const updatedModule = { ...module, status: newStatus } as Module | WikiModule; 

        if (newStatus === 'downloaded' && (updatedModule as Module).domains) { 
            (updatedModule as Module).domains.forEach(d => d.nodes.forEach(n => { n.status = 'familiar'; n.familiar = true; n.understood = false; }));
        } else if (newStatus === 'installed' && (updatedModule as Module).domains) { 
            (updatedModule as Module).domains.forEach(d => d.nodes.forEach(n => { n.status = 'understood'; n.familiar = true; n.understood = true; n.memoryStrength = 100; n.lastReviewed = new Date(); }));
        } else if ((newStatus === 'in_library' || newStatus === 'new')) {
            const defaultModuleState = getPredefinedModuleById(moduleId); 
            if (defaultModuleState && (updatedModule as Module).domains) {  
                (updatedModule as Module).domains = JSON.parse(JSON.stringify(defaultModuleState.domains)); 
                (updatedModule as Module).domains.forEach(d => d.nodes.forEach(n => { n.status = 'new'; n.familiar = false; n.understood = false; n.memoryStrength = 0; n.lastReviewed = undefined; }));
            } else if ((updatedModule as Module).domains){ 
                 (updatedModule as Module).domains.forEach(d => d.nodes.forEach(n => { n.status = 'new'; n.familiar = false; n.understood = false; n.memoryStrength = 0; n.lastReviewed = undefined; }));
            }
        }

        let newActiveSession = prev.activeSession;
        if (prev.activeSession?.currentModuleId === moduleId && (newStatus === 'installed' || newStatus === 'new' || newStatus === 'in_library')) {
            newActiveSession = null; 
        }
        
        const updatedModules = { ...prev.modules, [moduleId]: updatedModule };
        return { ...prev, modules: updatedModules, activeSession: newActiveSession, activeReviewSession: null };
    });
    queueToast({ title: "Admin Action", description: `Module ${moduleId} status set to ${newStatus}.` });
     if (activeSession?.currentModuleId === moduleId && (newStatus === 'installed' || newStatus === 'new' || newStatus === 'in_library')) setActiveInteraction('initial');
  }, [queueToast, activeSession?.currentModuleId, setLearningState, setActiveInteraction]);

  const admin_clearUserDataCallback = useCallback(async () => {
    if (typeof window !== 'undefined') {
        // Clear main learning state
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(CHRONICLE_RUN_KEY); 
        localStorage.removeItem(PLAYER_BASE_KEY); 
        
        // Clear all chat dialogue history
        // Chat history is stored with keys like: "neuro_chat_history_[moduleId]"
        const allKeys = Object.keys(localStorage);
        const chatHistoryKeys = allKeys.filter(key => key.startsWith('neuro_chat_history_'));
        chatHistoryKeys.forEach(key => {
          console.log("Clearing chat history:", key);
          localStorage.removeItem(key);
        });
        
        console.log(`Cleared ${chatHistoryKeys.length} chat history entries`);
    }
    const defaultState = await getDefaultLearningState();
    setLearningState(defaultState);
    setActiveInteraction('initial');
    setProbeQuestions([]);
    setEvaluationResult(null);
    setCurrentEpicStep('explain');
    setAvailableDungeons([]); 
    setIsChronicleSystemReady(false); 
    reviewNotificationShownRef.current = false; 
    isInitialLoadDoneRef.current = false; 
    queueToast({ title: "All Data Cleared", description: "All progress, settings, and chat history have been reset. Application will reload.", variant: "destructive" });
    if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 1500);
    }
  }, [queueToast, setLearningState, setActiveInteraction, setProbeQuestions, setEvaluationResult, setCurrentEpicStep, setAvailableDungeons, setIsChronicleSystemReady]);


  const startReadingModeCallback = useCallback((moduleId: string) => {
    const moduleToRead = userModules[moduleId] as Module; 
    if (!moduleToRead) {
        queueToast({ title: "Error", description: "Module not found.", variant: "destructive" });
        return;
    }

    const domains = Array.isArray(moduleToRead.domains) ? moduleToRead.domains : [];
    let initialDomainIndex = -1;
    let initialNodeIndex = -1;

    for (let dIdx = 0; dIdx < domains.length; dIdx++) {
        if (domains[dIdx] && Array.isArray(domains[dIdx].nodes) && domains[dIdx].nodes.length > 0) {
            initialDomainIndex = dIdx;
            initialNodeIndex = 0; 
            break;
        }
    }

    if (initialDomainIndex === -1) {
        queueToast({ title: "Module Empty", description: `${moduleToRead.title} has no readable content.`, variant: "destructive" });
        return;
    }

    setLearningState(prev => {
        let resumeDomainIndex = initialDomainIndex;
        let resumeNodeIndex = initialNodeIndex;

        if (prev.activeReadingSession?.moduleId === moduleId) {
            const prevModule = prev.modules[moduleId] as Module; 
            if (prevModule?.domains && 
                prev.activeReadingSession.domainIndex >= 0 && 
                prev.activeReadingSession.domainIndex < prevModule.domains.length) {
                 
                const prevDomain = prevModule.domains[prev.activeReadingSession.domainIndex];
                if(prevDomain?.nodes && 
                   prev.activeReadingSession.nodeIndex >= 0 && 
                   prev.activeReadingSession.nodeIndex < prevDomain.nodes.length){
                    resumeDomainIndex = prev.activeReadingSession.domainIndex;
                    resumeNodeIndex = prev.activeReadingSession.nodeIndex;
                 } else if (prevDomain?.nodes?.length > 0) { 
                    resumeDomainIndex = prev.activeReadingSession.domainIndex;
                    resumeNodeIndex = 0;
                 }
            }
        }

        return {
            ...prev,
            activeSession: null, 
            activeReviewSession: null, 
            activeReadingSession: {
                moduleId: moduleId,
                domainIndex: resumeDomainIndex,
                nodeIndex: resumeNodeIndex,
            }
        };
    });
    setActiveInteraction('reading');
    queueToast({ description: `Reading Mode: ${moduleToRead.title}` });
  }, [userModules, queueToast, setLearningState, setActiveInteraction]);

  const navigateReadingModeCallback = useCallback((direction: 'next_node' | 'prev_node' | 'next_domain' | 'prev_domain' | 'domain_start' | `jump_to_node:${number}`) => {
    setLearningState(prev => {
        if (!prev.activeReadingSession || !prev.modules[prev.activeReadingSession.moduleId]) return prev;
        const currentModule = prev.modules[prev.activeReadingSession.moduleId] as Module; 
        if (!currentModule.domains) return prev; 
        let { domainIndex, nodeIndex } = prev.activeReadingSession;

        if (direction.startsWith('jump_to_node:')) {
            const targetNodeIndex = parseInt(direction.split(':')[1]);
            if (currentModule.domains[domainIndex]?.nodes && targetNodeIndex >= 0 && targetNodeIndex < currentModule.domains[domainIndex].nodes.length) {
                nodeIndex = targetNodeIndex;
            }
        } else {
            switch (direction) {
                case 'next_node':
                    if (currentModule.domains[domainIndex]?.nodes && nodeIndex + 1 < currentModule.domains[domainIndex].nodes.length) {
                        nodeIndex++;
                    } else if (domainIndex + 1 < currentModule.domains.length) {
                         let nextValidDomain = domainIndex + 1;
                         while(nextValidDomain < currentModule.domains.length && (!currentModule.domains[nextValidDomain].nodes || currentModule.domains[nextValidDomain].nodes.length === 0)){
                            nextValidDomain++;
                         }
                         if(nextValidDomain < currentModule.domains.length){
                            domainIndex = nextValidDomain;
                            nodeIndex = 0;
                         } 
                    }
                    break;
                case 'prev_node':
                    if (nodeIndex - 1 >= 0) {
                        nodeIndex--;
                    } else if (domainIndex - 1 >= 0) {
                        let prevValidDomain = domainIndex - 1;
                        while(prevValidDomain >= 0 && (!currentModule.domains[prevValidDomain].nodes || currentModule.domains[prevValidDomain].nodes.length === 0)){
                            prevValidDomain--;
                         }
                         if(prevValidDomain >= 0){
                            domainIndex = prevValidDomain;
                            nodeIndex = currentModule.domains[domainIndex].nodes.length - 1;
                         } 
                    }
                    break;
                case 'next_domain':
                     let nextDomIdx = domainIndex + 1;
                     while(nextDomIdx < currentModule.domains.length && (!currentModule.domains[nextDomIdx].nodes || currentModule.domains[nextDomIdx].nodes.length === 0)){
                        nextDomIdx++;
                     }
                     if (nextDomIdx < currentModule.domains.length) {
                        domainIndex = nextDomIdx;
                        nodeIndex = 0;
                    }
                    break;
                case 'prev_domain':
                    let prevDomIdx = domainIndex - 1;
                    while(prevDomIdx >= 0 && (!currentModule.domains[prevDomIdx].nodes || currentModule.domains[prevDomIdx].nodes.length === 0)){
                        prevDomIdx--;
                     }
                     if (prevDomIdx >= 0) {
                        domainIndex = prevDomIdx;
                        nodeIndex = 0;
                    }
                    break;
                case 'domain_start':
                    nodeIndex = 0; 
                    break;
            }
        }
        return { ...prev, activeReadingSession: { ...prev.activeReadingSession, domainIndex, nodeIndex } };
    });
  }, [setLearningState]);

  const exitReadingModeCallback = useCallback((transitionToDownload = false) => {
    const moduleId = learningState.activeReadingSession?.moduleId;
    
    // Clear reading session and immediately save to localStorage to prevent it from persisting
    setLearningState(prev => {
      const updatedState = { ...prev, activeReadingSession: null };
      // Force immediate save to localStorage to prevent the reading session from persisting
      try {
        if (typeof window !== 'undefined') {
          const stateToSave = {
            ...updatedState,
            _version: '1.0.0',
            _savedAt: new Date().toISOString()
          };
          const serializedState = JSON.stringify(stateToSave);
          localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
          console.log("[exitReadingMode] State saved immediately");
        }
      } catch (error) {
        console.error("Could not save state to localStorage:", error);
      }
      return updatedState;
    });
    
    // Always go back to initial dashboard, never auto-transition to download
    setActiveInteraction('initial');
    queueToast({ description: "Exited Reading Mode." });
    
  }, [learningState.activeReadingSession, queueToast, setLearningState, setActiveInteraction]);

  const getNodesForReviewCallback = useCallback((): ReviewSessionNode[] => {
    const reviewableNodes: ReviewSessionNode[] = [];
    
    // Calculate memory decay based on time since last review
    const calculateMemoryDecay = (node: Node): number => {
      if (!node.lastReviewed) return 0; // No decay for nodes never reviewed
      
      const now = new Date();
      const lastReviewed = new Date(node.lastReviewed);
      const hoursSinceReview = (now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60);
      const currentStrength = node.memoryStrength || 0;
      
      // Calculate memory decay rate based on current memory strength
      // Higher memory strength means slower decay
      let decayRate = 0;
      if (currentStrength < 20) decayRate = 5;        // Fast decay for weak memories
      else if (currentStrength < 40) decayRate = 2;   // Significant decay
      else if (currentStrength < 60) decayRate = 1;   // Moderate decay
      else if (currentStrength < 75) decayRate = 0.5; // Slow decay
      else if (currentStrength < 90) decayRate = 0.2; // Very slow decay
      else decayRate = 0.1;                           // Minimal decay for strong memories
      
      // Calculate decay amount based on time and rate
      const decayAmount = Math.min(currentStrength, decayRate * (hoursSinceReview / 24)); // Daily decay
      return Math.max(0, decayAmount);
    };
    
    // Calculate when a node is due for review based on memory strength
    const calculateReviewDueDate = (node: Node): Date => {
      const lastReviewed = node.lastReviewed ? new Date(node.lastReviewed) : new Date(0);
      const currentStrength = node.memoryStrength || 0;
      
      // Define intervals in hours based on memory strength
      let intervalHours = 1; // Default to 1 hour
      if (currentStrength < 20) intervalHours = 1;      // 1 hour
      else if (currentStrength < 40) intervalHours = 24;     // 1 day 
      else if (currentStrength < 60) intervalHours = 48;     // 2 days
      else if (currentStrength < 75) intervalHours = 96;     // 4 days
      else if (currentStrength < 90) intervalHours = 168;    // 1 week
      else intervalHours = 336;                              // 2 weeks
      
      const dueDate = new Date(lastReviewed);
      dueDate.setHours(dueDate.getHours() + intervalHours);
      return dueDate;
    };
    
    // Get weighted EPIC component with emphasis on most effective components
    const getWeightedEpicComponent = (): EpicStep => {
      const rand = Math.random();
      if (rand < 0.4) return 'probe';         // 40% chance - most effective for recall
      if (rand < 0.7) return 'explain';       // 30% chance - good for reinforcement
      if (rand < 0.9) return 'implement';     // 20% chance - practical application
      return 'connect';                       // 10% chance - connecting concepts
    };
    
    Object.values(learningState.modules).forEach(module => {
        const fullModule = module as Module; 
        if (!fullModule.domains) return; 
        if (fullModule.status === 'installed' || fullModule.status === 'understood' || fullModule.status === 'needs_review') {
            fullModule.domains.forEach(domain => {
                (domain.nodes || []).forEach(node => {
                    // Apply memory decay to get current memory strength
                    const memoryDecay = calculateMemoryDecay(node);
                    const currentMemoryStrength = Math.max(0, (node.memoryStrength || 0) - memoryDecay);
                    
                    // Calculate when this node is due for review
                    const reviewDueDate = calculateReviewDueDate(node);
                    const isDue = new Date() >= reviewDueDate;
                    
                    // Calculate days since last review for priority scoring
                    const daysSinceLastReview = node.lastReviewed
                        ? (new Date().getTime() - new Date(node.lastReviewed).getTime()) / (1000 * 3600 * 24)
                        : Infinity;

                    const needsReviewBasedOnStrength = currentMemoryStrength < 50; 
                    const needsReviewBasedOnTime = isDue;

                    if ((node.status === 'needs_review' || needsReviewBasedOnStrength || needsReviewBasedOnTime) && node.understood) {
                        // Select a weighted EPIC component for more effective review
                        const epicComponent = getWeightedEpicComponent();
                        
                        // Calculate priority score based on multiple factors
                        const hoursOverdue = isDue 
                            ? Math.max(0, (new Date().getTime() - reviewDueDate.getTime()) / (1000 * 3600)) 
                            : 0;
                            
                        const priorityScore = 
                            (node.status === 'needs_review' ? 200 : 0) +   // Explicitly marked gets highest priority
                            Math.min(hoursOverdue, 200) +                  // More overdue = higher priority (capped)
                            (100 - currentMemoryStrength);                 // Weaker memory = higher priority
                        
                        reviewableNodes.push({
                            nodeId: node.id,
                            moduleId: fullModule.id, 
                            priorityScore: priorityScore,
                            epicComponentToReview: epicComponent,
                            lastReviewed: node.lastReviewed,
                            currentMemoryStrength: currentMemoryStrength,
                            reviewDueDate: reviewDueDate
                        });
                    }
                });
            });
        }
    });
    reviewableNodes.sort((a, b) => b.priorityScore - a.priorityScore); 
    return reviewableNodes;
  }, [learningState.modules]);

  const hasStandardReviewNodes = useMemo(() => getNodesForReviewCallback().length > 0, [getNodesForReviewCallback]);

  const getManualReviewNodesCallback = useCallback((): ReviewSessionNode[] => {
    const manualReviewNodes: ReviewSessionNode[] = [];
    Object.values(learningState.modules).forEach(module => {
        const fullModule = module as Module; 
        if (fullModule.status === 'installed' && fullModule.domains) {
            fullModule.domains.forEach(domain => {
                (domain.nodes || []).forEach(node => {
                    const epicComponents: EpicStep[] = ['explain', 'probe', 'implement', 'connect'];
                    manualReviewNodes.push({
                        nodeId: node.id,
                        moduleId: fullModule.id, 
                        priorityScore: 0, 
                        epicComponentToReview: epicComponents[Math.floor(Math.random() * epicComponents.length)],
                        lastReviewed: node.lastReviewed,
                        currentMemoryStrength: node.memoryStrength,
                    });
                });
            });
        }
    });
    
    for (let i = manualReviewNodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [manualReviewNodes[i], manualReviewNodes[j]] = [manualReviewNodes[j], manualReviewNodes[i]];
    }
    return manualReviewNodes;
  }, [learningState.modules]);

  const hasManualReviewNodes = useMemo(() => getManualReviewNodesCallback().length > 0, [getManualReviewNodesCallback]);


  const startReviewSessionCallback = useCallback(() => {
    const nodesForSession = getNodesForReviewCallback().slice(0, 10); 

    if (nodesForSession.length > 0) {
        const firstReviewNode = nodesForSession[0];
        const firstModule = learningState.modules[firstReviewNode.moduleId] as Module; 
        let firstDomainIndex = 0;
        let firstNodeIndex = 0;

        if (firstModule?.domains) {
            firstDomainIndex = firstModule.domains.findIndex(d => d.nodes.some(n => n.id === firstReviewNode.nodeId));
            if(firstDomainIndex !== -1 && firstModule.domains[firstDomainIndex]?.nodes){
                 firstNodeIndex = firstModule.domains[firstDomainIndex].nodes.findIndex(n => n.id === firstReviewNode.nodeId);
            } else { 
                firstDomainIndex = 0; firstNodeIndex = 0; 
            }
        }

        setLearningState(prev => ({
            ...prev,
            activeSession: { 
                currentModuleId: firstReviewNode.moduleId,
                currentDomainIndex: firstDomainIndex === -1 ? 0 : firstDomainIndex, 
                currentNodeIndex: firstNodeIndex === -1 ? 0 : firstNodeIndex,   
                currentPhase: 'install', 
            },
            activeReviewSession: {
                sessionId: `review-${Date.now()}`,
                nodesToReview: nodesForSession,
                currentNodeIndex: 0, 
                startTime: new Date(),
            }
        }));
        setCurrentEpicStep(nodesForSession[0].epicComponentToReview);
        setActiveInteraction('reviewing');
        queueToast({ title: "Review Session Started", description: `Reviewing ${nodesForSession.length} node(s).` });
    } else {
        queueToast({ description: "No nodes currently need review." });
    }
  }, [learningState.modules, queueToast, getNodesForReviewCallback, setLearningState, setActiveInteraction, setCurrentEpicStep]);

  const startManualReviewSessionCallback = useCallback(() => {
    const nodesForManualSession = getManualReviewNodesCallback().slice(0, 10); 
    if (nodesForManualSession.length > 0) {
        const firstReviewNode = nodesForManualSession[0];
        const firstModule = learningState.modules[firstReviewNode.moduleId] as Module; 
        let firstDomainIndex = 0; let firstNodeIndex = 0;
        if (firstModule?.domains) {
            firstDomainIndex = firstModule.domains.findIndex(d => d.nodes.some(n => n.id === firstReviewNode.nodeId));
            if (firstDomainIndex !== -1 && firstModule.domains[firstDomainIndex]?.nodes) { 
                firstNodeIndex = firstModule.domains[firstDomainIndex].nodes.findIndex(n => n.id === firstReviewNode.nodeId);
            } else { firstDomainIndex = 0; firstNodeIndex = 0; } 
        }
        setLearningState(prev => ({
            ...prev,
            activeSession: { 
                currentModuleId: firstReviewNode.moduleId,
                currentDomainIndex: firstDomainIndex === -1 ? 0 : firstDomainIndex,
                currentNodeIndex: firstNodeIndex === -1 ? 0 : firstNodeIndex,
                currentPhase: 'install', 
            },
            activeReviewSession: {
                sessionId: `manual-review-${Date.now()}`,
                nodesToReview: nodesForManualSession,
                currentNodeIndex: 0,
                startTime: new Date(),
            }
        }));
        setCurrentEpicStep(nodesForManualSession[0].epicComponentToReview);
        setActiveInteraction('reviewing');
        queueToast({ title: "Manual Study Session Started", description: `Reviewing ${nodesForManualSession.length} installed node(s).` });
    } else {
        queueToast({ description: "No installed nodes available for manual review." });
    }
  }, [learningState.modules, queueToast, getManualReviewNodesCallback, setLearningState, setActiveInteraction, setCurrentEpicStep]);
  
  const admin_markAllInstalledNodesForReviewCallback = useCallback(() => {
    let nodesMarked = 0;
    setLearningState(prev => {
        const updatedModules = { ...prev.modules };
        Object.keys(updatedModules).forEach(moduleId => {
            const module = updatedModules[moduleId] as Module; 
            if (module.status === 'installed' && module.domains) {
                (module as Module).domains.forEach((domain, dIdx) => { 
                    (domain.nodes || []).forEach((_, nIdx) => { 
                        const nodeToUpdate = (updatedModules[moduleId] as Module).domains[dIdx].nodes[nIdx]; 
                        if (nodeToUpdate && nodeToUpdate.status !== 'needs_review') {
                            nodeToUpdate.status = 'needs_review';
                            nodeToUpdate.lastReviewed = new Date(0); 
                            nodesMarked++;
                        }
                    });
                });
            }
        });
        return { ...prev, modules: updatedModules };
    });
    if (nodesMarked > 0) {
      queueToast({ title: "Admin Action", description: `${nodesMarked} installed nodes marked for review.` });
    } else {
      queueToast({ title: "Admin Action", description: "No installed nodes needed marking for review." });
    }
  }, [queueToast, setLearningState]);

  const toggleThoughtAnalyzerCallback = useCallback(() => {
    setLearningState(prev => {
        const newStateValue = !prev.isThoughtAnalyzerEnabled;
        const newState = { ...prev, isThoughtAnalyzerEnabled: newStateValue };
        
        console.log(`[toggleThoughtAnalyzerCallback] Current: ${prev.isThoughtAnalyzerEnabled}, Toggling to: ${newStateValue}`);
        queueToast({ title: "Thought Analyzer", description: newStateValue ? "Enabled" : "Disabled" });
        
        // Save immediately to localStorage to ensure persistence
        setTimeout(() => saveStateToLocalStorage(newState), 0);
        
        return newState;
    });
  }, [queueToast, setLearningState]);

  // Set AI provider function
  const setAIProviderCallback = useCallback((provider: string) => {
    // Only accept valid providers (including specific Claude models)
    const validProviders = ['gemini', 'openai', 'claude', 'claude37', 'claude4', 'claudeOpus4'];
    if (validProviders.includes(provider)) {
      setLearningState(prev => {
        const newState = { ...prev, aiProvider: provider };
        let displayName = provider.charAt(0).toUpperCase() + provider.slice(1);
        
        // Provide better display names for specific models
        switch (provider) {
          case 'claude37':
            displayName = 'Claude 3.7 Sonnet';
            break;
          case 'claude4':
            displayName = 'Claude 4 Sonnet';
            break;
          case 'claudeOpus4':
            displayName = 'Claude 4 Opus';
            break;
          case 'claude':
            displayName = 'Claude 3.5 Sonnet';
            break;
          case 'gemini':
            displayName = 'Gemini 1.5 Pro';
            break;
          case 'openai':
            displayName = 'GPT-4 Turbo';
            break;
        }
        
        queueToast({ title: "AI Provider", description: `Set to ${displayName}` });
        console.log(`AI provider set to: ${provider}`);
        
        // Save immediately to localStorage to ensure persistence
        setTimeout(() => saveStateToLocalStorage(newState), 0);
        
        return newState;
      });
    } else {
      console.error(`Invalid AI provider: ${provider}`);
      queueToast({ title: "Error", description: `Invalid AI provider: ${provider}`, variant: "destructive" });
    }
  }, [queueToast, setLearningState]);

  const advanceReviewSessionCallback = useCallback(() => {
    setLearningState(prev => {
      if (!prev.activeReviewSession) return prev;

      const nextReviewNodeIndex = prev.activeReviewSession.currentNodeIndex + 1;
      if (nextReviewNodeIndex < prev.activeReviewSession.nodesToReview.length) {
          const nextReviewNode = prev.activeReviewSession.nodesToReview[nextReviewNodeIndex];
          const nextModule = prev.modules[nextReviewNode.moduleId] as Module; 
          let nextDomainIdx = 0;
          let nextNodeIdx = 0;
          if(nextModule?.domains){
              nextDomainIdx = nextModule.domains.findIndex(d => d.nodes.some(n => n.id === nextReviewNode.nodeId));
               if(nextDomainIdx !== -1 && nextModule.domains[nextDomainIdx]?.nodes){ 
                  nextNodeIdx = nextModule.domains[nextDomainIdx].nodes.findIndex(n => n.id === nextReviewNode.nodeId);
              } else { nextDomainIdx = 0; nextNodeIdx = 0; } 
          }

          setCurrentEpicStep(nextReviewNode.epicComponentToReview); 
          clearEvaluationResultCallback(); 

          return {
              ...prev,
              activeSession: { 
                  currentModuleId: nextReviewNode.moduleId,
                  currentDomainIndex: nextDomainIdx === -1 ? 0 : nextDomainIdx,
                  currentNodeIndex: nextNodeIdx === -1 ? 0 : nextNodeIdx,
                  currentPhase: 'install', 
              },
              activeReviewSession: {
                  ...prev.activeReviewSession,
                  currentNodeIndex: nextReviewNodeIndex, 
              }
          };
      } else {
          queueToast({ title: "Review Session Complete!", description: "All nodes in this session have been reviewed." });
          setActiveInteraction('initial');
          return { ...prev, activeSession: null, activeReviewSession: null }; 
      }
    });
  }, [queueToast, clearEvaluationResultCallback, setLearningState, setActiveInteraction, setCurrentEpicStep]);

  useEffect(() => {
    if (evaluationResult && currentActiveReviewSession && activeInteraction === 'reviewing' && currentNode && currentActiveModule && typeof currentDomainIndex === 'number' && currentDomainIndex !== -1 && typeof currentNodeIndex === 'number' && currentNodeIndex !== -1) {
      const nodeToUpdate = currentNode; 
      const { score, isPass: currentPassStatus } = evaluationResult; 
      
      const oldMemoryStrength = nodeToUpdate.memoryStrength || 50; 
      
      let strengthChange = 0;
      if (currentPassStatus) { 
          strengthChange = score >= 95 ? 30 : (score >= 90 ? 25 : 20); 
      } else { 
          strengthChange = score >= 60 ? -5 : (score >= 40 ? -10 : -15); 
      }
      const newMemoryStrength = Math.max(0, Math.min(100, oldMemoryStrength + strengthChange)); 
      
      updateNodeStatusCallback(
        nodeToUpdate.moduleId,
        currentDomainIndex, 
        currentNodeIndex,   
        currentPassStatus ? 'understood' : 'needs_review', 
        true, 
        currentPassStatus ? true : nodeToUpdate.understood, 
        new Date(), 
        newMemoryStrength 
      );
    }
  }, [evaluationResult, currentActiveReviewSession, activeInteraction, currentNode, currentActiveModule, updateNodeStatusCallback, currentDomainIndex, currentNodeIndex]); 


  const toggleVoiceModeCallback = useCallback(() => setIsVoiceModeActive(prev => !prev), [setIsVoiceModeActive]);
  
  const _neuroOsInternalStopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoadingTTS(false); 
  }, [setIsSpeaking, setIsLoadingTTS]);

  const speakTextCallback = useCallback(async (text: string) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); 
        }
      }
      setIsSpeaking(false); 
      setIsLoadingTTS(false); 

      if (!text || text.trim().length === 0) {
          queueToast({ description: "No text to speak.", variant: "destructive" });
          return;
      }

      if (!('speechSynthesis' in window)) {
          queueToast({ description: "Browser Speech Synthesis not supported.", variant: "destructive" });
          return;
      }

      setIsLoadingTTS(true);
      try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsLoadingTTS(false); 
          };
          utterance.onend = () => {
            setIsSpeaking(false);
          };
          utterance.onerror = (event) => {
            console.error("SpeechSynthesisUtterance Error:", event.error);
            queueToast({ description: `Speech error: ${event.error || 'Unknown speech error'}`, variant: "destructive" });
            setIsSpeaking(false);
            setIsLoadingTTS(false);
          };
          window.speechSynthesis.speak(utterance);
      } catch (error) {
          console.error("TTS Error:", error);
          queueToast({ description: "Text-to-Speech failed.", variant: "destructive" });
          setIsSpeaking(false);
          setIsLoadingTTS(false);
      }
  }, [queueToast, setIsSpeaking, setIsLoadingTTS]);
  
  useEffect(() => {
    return () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); 
        }
    };
  }, []);

  const submitVoiceInputCallback = useCallback(async () => {
      if (!capturedAudio) {
          queueToast({ description: "No audio captured to submit.", variant: "destructive" });
          return;
      }
      setIsLoadingSTT(true);
      try {
          await new Promise(resolve => setTimeout(resolve, 1500)); 
          const mockTranscript = "This is a mock transcript from speech-to-text processing.";
          
          setVoiceTranscript(mockTranscript); 
          if (voiceTranscriptTarget) { 
            voiceTranscriptTarget(prev => prev + (prev.endsWith(' ') || prev === '' ? "" : " ") + mockTranscript); 
          }
          queueToast({ description: `Transcript: ${mockTranscript}`});
      } catch (error) {
          console.error("STT Error:", error);
          queueToast({ description: "Speech-to-Text failed.", variant: "destructive" });
      } finally {
          setIsLoadingSTT(false);
          setCapturedAudio(null); 
      }
  }, [capturedAudio, queueToast, voiceTranscriptTarget, setIsLoadingSTT, setVoiceTranscript, setCapturedAudio]); 

  useEffect(() => {
    if (capturedAudio && voiceTranscriptTarget && !isListening && !isLoadingSTT) {
        submitVoiceInputCallback();
    }
  }, [capturedAudio, voiceTranscriptTarget, isListening, isLoadingSTT, submitVoiceInputCallback]);

  useEffect(() => {
    if (!isInitialLoadDoneRef.current || !hasHydrated) return;
    const reviewableCount = getNodesForReviewCallback().length;
    if (activeInteraction === 'initial') {
        if (reviewableCount > 0 && !reviewNotificationShownRef.current) {
            queueToast({
                title: "Review Due",
                description: `You have ${reviewableCount} node(s) due for review. Keep your knowledge sharp!`,
                duration: 8000,
            });
            reviewNotificationShownRef.current = true;
        } else if (reviewableCount === 0 && reviewNotificationShownRef.current) {
            reviewNotificationShownRef.current = false;
        }
    } else {
        if (reviewNotificationShownRef.current && reviewableCount === 0) {
            reviewNotificationShownRef.current = false;
        }
    }
  }, [learningState.modules, activeInteraction, getNodesForReviewCallback, queueToast, hasHydrated]);

  const [knowledgeCheckQuestions, setKnowledgeCheckQuestions] = useState<KnowledgeCheckQuestion[]>([]);
  const [currentKnowledgeCheckIndex, setCurrentKnowledgeCheckIndex] = useState(0);
  const [selectedKnowledgeCheckAnswer, setSelectedKnowledgeCheckAnswer] = useState<number | null>(null);
  
  // Generate knowledge checks for the current node
  const generateKnowledgeChecksCallback = useCallback(async (moduleId?: string, startDomainIndex?: number, startNodeIndex?: number) => {
    if (!activeSession || !currentNode) return;
    
    try {
      const node = currentNode;
      const result = await generateKnowledgeChecks({
        nodeTitle: currentNode.title,
        nodeContent: currentNode.shortDefinition + ' ' + currentNode.download.example,
        shortDefinition: currentNode.shortDefinition,
        clarification: currentNode.download.clarification,
        example: currentNode.download.example,
        characterId: (currentActiveModule as Module).defaultCompanion,
        count: 5
      });
      
      setKnowledgeCheckQuestions(result.questions);
      setCurrentKnowledgeCheckIndex(0);
      setSelectedKnowledgeCheckAnswer(null);
      
      // Store the knowledge checks in the session state
      setLearningState(prev => {
        const updatedSession = {
          ...prev.activeSession!,
          knowledgeChecks: {
            ...(prev.activeSession?.knowledgeChecks || {}),
            [currentNode.id]: {
              nodeId: currentNode.id,
              questions: result.questions,
              completed: false,
              score: 0,
              domain: currentNode.domainId || 'default',
              difficulty: 1
            }
          }
        };
        return { ...prev, activeSession: updatedSession };
      });
      
    } catch (error) {
      console.error("Error generating knowledge checks:", error);
      queueToast({ title: "Error", description: "Could not generate knowledge checks.", variant: "destructive" });
      setKnowledgeCheckQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentNode, currentActiveModule, activeSession, setIsLoading, queueToast, setLearningState]);

  // Handle knowledge check answer submission
  const submitKnowledgeCheckAnswerCallback = useCallback((selectedIndex: number) => {
    setSelectedKnowledgeCheckAnswer(selectedIndex);
    
    // Check if this is the last question
    if (currentKnowledgeCheckIndex >= knowledgeCheckQuestions.length - 1) {
      // Calculate score
      const correctAnswers = knowledgeCheckQuestions.reduce((total, q, idx) => {
        const isCorrect = idx === currentKnowledgeCheckIndex 
          ? selectedIndex === q.correctOptionIndex 
          : selectedKnowledgeCheckAnswer === q.correctOptionIndex;
        return isCorrect ? total + 1 : total;
      }, 0);
      
      const score = Math.round((correctAnswers / knowledgeCheckQuestions.length) * 100);
      
      // Update session state
      if (currentNode && activeSession) {
        setLearningState(prev => {
          const updatedKnowledgeChecks = {
            ...(prev.activeSession?.knowledgeChecks || {}),
            [currentNode.id]: {
              nodeId: currentNode.id,
              questions: knowledgeCheckQuestions,
              completed: true,
              score,
              domain: currentNode.domainId || 'default',
              difficulty: 1
            }
          };
          
          return {
            ...prev,
            activeSession: {
              ...prev.activeSession!,
              knowledgeChecks: updatedKnowledgeChecks
            }
          };
        });
        
        // Provide feedback
        if (score >= 70) {
          queueToast({ title: "Knowledge Check Complete", description: `Score: ${score}%. You're ready for active recall!` });
        } else {
          queueToast({ title: "Knowledge Check Needs Review", description: `Score: ${score}%. Review the material before proceeding.` });
        }
      }
    } else {
      // Move to next question
      setCurrentKnowledgeCheckIndex(prevIndex => prevIndex + 1);
      setSelectedKnowledgeCheckAnswer(null);
    }
  }, [currentKnowledgeCheckIndex, knowledgeCheckQuestions, currentNode, activeSession, selectedKnowledgeCheckAnswer, setLearningState, queueToast]);

  // Add a proper sequential flow for learning
  const ensureProperLearningFlowCallback = useCallback((moduleId: string) => {
    // Check if user has already gone through reading phase
    if (!learningState.activeReadingSession && !activeSession) {
      // If not, start with reading
      startReadingModeCallback(moduleId);
      queueToast({ title: "Learning Flow", description: "Starting with Reading phase. After reading, move to Download and Install phases." });
      return 'reading';
    } else if (!activeSession) {
      // If reading is done but no active session, start download
      startModuleCallback(moduleId);
      queueToast({ title: "Learning Flow", description: "Moving to Download phase after Reading." });
      return 'download';
    }
    return activeSession.currentPhase;
  }, [learningState.activeReadingSession, activeSession, queueToast, startReadingModeCallback, startModuleCallback]);

  // Return the new callbacks and state
  return {
    userModules, 
    availableDungeons, 
    hasAnyInstalledModules, 
    currentModule: currentActiveModule, 
    currentDomain, 
    currentNode, 
    currentDomainIndex, 
    currentNodeIndex, 
    isLastNode,
    progress: activeSession ?? { currentModuleId: null, currentDomainIndex: 0, currentNodeIndex: 0, currentPhase: 'download', },
    isLoading, 
    isLoadingCustom, 
    isLoadingChronicle, 
    detailedLoadingProgress, 
    probeQuestions, 
    currentInteraction: activeInteraction, 
    evaluationResult, 
    currentEpicStep, 
    activeChronicleRun: currentActiveChronicleRun, 
    addModuleToLibrary: addModuleToLibraryCallback,
    startModule: startModuleCallback,
    createCustomModule: createCustomModuleCallback,
    submitRecallResponse: submitRecallResponseCallback,
    submitEpicResponse: submitEpicResponseCallback,
    fetchProbeQuestions: fetchProbeQuestionsInternalCallback,
    resetSession: resetSessionCallback,
    clearEvaluationResult: clearEvaluationResultCallback,
    handleProceedAfterSuccess: handleProceedAfterSuccessCallback,
    startChronicleRun: startChronicleRunCallback,
    submitChronicleEncounterResponse: submitChronicleEncounterResponseCallback,
    endChronicleRun: endChronicleRunCallback,
    movePlayer: movePlayerCallback,
    interactWithTile: interactWithTileCallback,
    onPlayerCombatAction: onPlayerCombatActionCallback,
    retryDungeonLoad: retryDungeonLoadCallback,
    admin_removeModuleFromLibrary: admin_removeModuleFromLibraryCallback,
    admin_setModuleStatus: admin_setModuleStatusCallback,
    admin_markAllInstalledNodesForReview: admin_markAllInstalledNodesForReviewCallback,
    admin_clearUserData: admin_clearUserDataCallback, 
    setCurrentInteraction: setActiveInteraction, 
    playerCharacterBase, 
    activeReadingSession, 
    startReadingMode: startReadingModeCallback,
    navigateReadingMode: navigateReadingModeCallback,
    exitReadingMode: exitReadingModeCallback,
    updateNodeStatus: updateNodeStatusCallback, 
    submitDiagnosticResponse: submitDiagnosticResponseCallback,
    activeReviewSession: currentActiveReviewSession, 
    startReviewSession: startReviewSessionCallback,
    startManualReviewSession: startManualReviewSessionCallback,
    hasStandardReviewNodes, 
    hasManualReviewNodes, 
    advanceReviewSession: advanceReviewSessionCallback,
    currentUserProfile, 
    toggleVoiceMode: toggleVoiceModeCallback,
    isVoiceModeActive, 
    voiceTranscript, 
    isListening, 
    capturedAudio, 
    submitVoiceInput: submitVoiceInputCallback, 
    speakText: speakTextCallback, 
    stopSpeaking: _neuroOsInternalStopSpeaking, 
    isSpeaking, 
    isLoadingTTS, 
    isLoadingSTT, 
    setIsListening, 
    setCapturedAudio, 
    setVoiceTranscriptTarget, 
    isThoughtAnalyzerEnabled: learningState.isThoughtAnalyzerEnabled, 
    toggleThoughtAnalyzer: toggleThoughtAnalyzerCallback, 
    knowledgeCheckQuestions,
    currentKnowledgeCheckIndex,
    selectedKnowledgeCheckAnswer,
    generateKnowledgeChecks: generateKnowledgeChecksCallback,
    submitKnowledgeCheckAnswer: submitKnowledgeCheckAnswerCallback,
    ensureProperLearningFlow: ensureProperLearningFlowCallback,
    aiProvider: learningState.aiProvider || CONFIG.AI.provider,
    setAIProvider: setAIProviderCallback,
  };
}
