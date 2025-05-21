'use client';

import type { LearningPhase, LearningProgress, Module, ModuleStatus, Node, NodeStatus, UserLearningState, ActiveReadingSession, EpicStep, UserInput, AnalysisContext, EvaluationResult, WikiModule, ActiveReviewSession, ReviewSessionNode, NeuroDiagnosticTest, RubricScores, QualityFlags, NodeEPIC, RubricDimensionScore, PlayerCharacterBase as NeuroPlayerCharacterBase, UserProfile as NeuroUserProfile } from '@/types/neuro';
// Flows
import { generateProbeQuestions } from '@/ai/flows/generate-probe-questions';
import { evaluateResponse as evaluateResponseFlow, type EvaluateResponseInput, type EvaluateResponseOutput as DetailedEvaluateResponseOutput } from '@/ai/flows/evaluate-response-flow';
import { generateCustomModule } from '@/ai/flows/generate-custom-module-flow';
import { selectAppropriateCharacterId, getCharacterById, getAllCharacters } from '@/lib/server/characters';
import { generateDialogue as generateDialogueFlow } from '@/ai/flows/generate-dialogue-flow';
import { generateReadingDialogue as generateReadingDialogueFlow } from '@/ai/flows/generateReadingDialogueFlow';
import type { GenerateReadingDialogueOutput, GenerateReadingDialogueInput, DialogueTurn as GenkitDialogueTurn } from '@/ai/flows/types/generateReadingDialogueTypes';
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
    generateEPICChallenge as chronicleGenerateEPICChallenge, // Corrected alias from previous step
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
    getItemById as chronicleGetItemByIdFromLogic, 
    getPlayerStateBaseInternal, 
    savePlayerStateBaseInternal, 
    chronicleGetCurrentRun, 
    // saveCurrentRun as chronicleSaveCurrentRun, // Removed for centralized saving
    generateFloorInternal as chronicleGenerateFloorInternalAliased, 
    handleTileInteraction as chronicleHandleTileInteraction 
} from '@/data/chronicle-logic';
import _ from 'lodash';
import { placeholderEPIC } from '@/data/modules/_common';
import type { Dungeon, EncounterDefinition as ChronicleEncounterDefinition, ChronicleRunState, PlayerState, Coordinates, MapCell as ChronicleMapCell, Spellbook, Item as ChronicleItem, Quest, QuestObjective, BattleState, BattleParticipant, Ability as ChronicleAbility, Enemy, TileType, Floor, CoreEntityTypeManifestation, BattleRewards, BattleActionRequest, EPICChallenge as ChronicleEPICChallenge, EPICResponse as ChronicleEPICResponse, Item, Companion, Specter, Construct, Archetype, EntityStats as ChronicleEntityStats, Position, EffectType, CoreEntityType } from '@/types/chronicle';
import { generateKnowledgeChecks } from '@/ai/flows/generate-knowledge-checks';
import type { KnowledgeCheckQuestion, KnowledgeCheckSet } from '@/types/neuro';


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
        isThoughtAnalyzerEnabled: false, 
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
      const stateVersion = parsedState?._version || '0.0.0';
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

    const mergedState = _.mergeWith({}, defaultState, parsedState, (objValue, srcValue, key) => {
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
    
    let loadedThoughtAnalyzerEnabled = defaultState.isThoughtAnalyzerEnabled; // Default to false
    if (parsedState && typeof parsedState.isThoughtAnalyzerEnabled === 'boolean') {
        loadedThoughtAnalyzerEnabled = parsedState.isThoughtAnalyzerEnabled;
    }
    mergedState.isThoughtAnalyzerEnabled = loadedThoughtAnalyzerEnabled;
    console.log("[loadStateFromLocalStorage] Loaded isThoughtAnalyzerEnabled:", loadedThoughtAnalyzerEnabled);


    const rehydratedPlayerBaseSpellbooks = await Promise.all(
        (Array.isArray(parsedState.playerCharacterBase?.spellbooks) ? parsedState.playerCharacterBase!.spellbooks : defaultState.playerCharacterBase.spellbooks).map(async (sbStub: Partial<Spellbook>) => {
            if (sbStub.id) {
                const fullSb = await getSpellbookById(sbStub.id); 
                if (fullSb) {
                    fullSb.abilities = await Promise.all(
                        (fullSb.abilities || []).map(async (abIdOrObj: string | ChronicleAbility) => {
                            let spellToResolveId: string | undefined = undefined;
                            let baseAbilityObject: Partial<ChronicleAbility> = { effects: [] }; 
                            
                            if (typeof abIdOrObj === 'string') {
                                spellToResolveId = abIdOrObj;
                            } else if (abIdOrObj && typeof abIdOrObj === 'object' && abIdOrObj.id) {
                                spellToResolveId = abIdOrObj.id;
                                baseAbilityObject = abIdOrObj;
                            }
                            
                            if (spellToResolveId) {
                                const spellDetails = await getSpellById(spellToResolveId); 
                                return spellDetails ? _.merge({}, { effects: [] }, baseAbilityObject, spellDetails) : null;
                            }
                            return null;
                        })
                    ).then(resolvedAbilities => resolvedAbilities.filter(Boolean) as ChronicleAbility[]);
                    return fullSb;
                }
            }
            return null;
        })
    ).then(sbs => sbs.filter(Boolean) as Spellbook[]);
    
    mergedState.playerCharacterBase = {
        ...defaultState.playerCharacterBase,
        ...(mergedState.playerCharacterBase || {}), 
        spellbooks: rehydratedPlayerBaseSpellbooks.length > 0 ? rehydratedPlayerBaseSpellbooks : defaultState.playerCharacterBase.spellbooks,
        inventory: (Array.isArray(mergedState.playerCharacterBase?.inventory)
            ? mergedState.playerCharacterBase.inventory.map(item => ({ ...(defaultState.playerCharacterBase.inventory.find(defI => defI.id === item.id) || {}), ...item }))
            : defaultState.playerCharacterBase.inventory) as ChronicleItem[],
        party: (Array.isArray(mergedState.playerCharacterBase?.party) ? mergedState.playerCharacterBase.party : defaultState.playerCharacterBase.party) as ChronicleCompanion[],
        stats: { ...defaultState.playerCharacterBase.stats, ...(parsedState.playerCharacterBase?.stats || {}) }, 
    };

    if (mergedState.playerCharacterBase.spellbooks && !mergedState.playerCharacterBase.spellbooks.some(sb => sb.id === mergedState.playerCharacterBase.equippedSpellbookId)) {
        mergedState.playerCharacterBase.equippedSpellbookId = mergedState.playerCharacterBase.spellbooks[0]?.id || null;
    }
    
    mergedState.currentUserProfile = _.merge({}, defaultState.currentUserProfile, mergedState.currentUserProfile);

    if (mergedState.activeChronicleRun && mergedState.activeChronicleRun.dungeonId && (!mergedState.activeChronicleRun.currentDungeon || !mergedState.activeChronicleRun.currentDungeon.floors)) {
        console.log(`Rehydrating currentDungeon for active run: ${mergedState.activeChronicleRun.dungeonId}`);
        const dungeonData = await getDungeonById(mergedState.activeChronicleRun.dungeonId); 
        if (dungeonData) {
            mergedState.activeChronicleRun.currentDungeon = dungeonData;
             console.log("Rehydrated currentDungeon for active run.");
             if(mergedState.activeChronicleRun.playerState) {
                const currentRunPlayerState = mergedState.activeChronicleRun.playerState;
                mergedState.activeChronicleRun.playerState = {
                    ...mergedState.playerCharacterBase,
                    ...currentRunPlayerState, 
                    id: currentRunPlayerState.id || mergedState.playerCharacterBase.id,
                    name: currentRunPlayerState.name || mergedState.playerCharacterBase.name,
                    currentHealth: currentRunPlayerState.currentHealth ?? mergedState.playerCharacterBase.maxHealth,
                    currentMana: currentRunPlayerState.currentMana ?? mergedState.playerCharacterBase.maxMana,
                    coordinates: mergedState.activeChronicleRun.playerPosition, 
                    currentFloor: mergedState.activeChronicleRun.currentFloor,
                    stats: { ...mergedState.playerCharacterBase.stats, ...currentRunPlayerState.stats }, 
                    abilities: (mergedState.playerCharacterBase.spellbooks.find(sb => sb.id === mergedState.playerCharacterBase.equippedSpellbookId)?.abilities || []) as ChronicleAbility[],
                };
            }
        } else {
            console.warn(`Could not rehydrate currentDungeon for ${mergedState.activeChronicleRun.dungeonId}. Clearing active run.`);
            mergedState.activeChronicleRun = null; 
        }
    }

    const finalModules: Record<string, Module | WikiModule> = { ...defaultState.modules };
    for (const moduleId in mergedState.modules) {
        const defaultModule = defaultState.modules[moduleId];
        const savedModule = mergedState.modules[moduleId];

        if (defaultModule && savedModule) { 
            finalModules[moduleId] = _.mergeWith({}, defaultModule, { 
                status: savedModule.status, 
                domains: (defaultModule as Module).domains.map((defaultDomain) => { 
                    const savedDomain = (savedModule as Module).domains?.find(sd => sd.id === defaultDomain.id); 
                    return _.mergeWith({}, defaultDomain, {
                        nodes: defaultDomain.nodes.map((defaultNode) => {
                            const savedNode = savedDomain?.nodes?.find(sn => sn.id === defaultNode.id);
                            return {
                                ...defaultNode, 
                                status: savedNode?.status ?? defaultNode.status,
                                familiar: savedNode?.familiar ?? defaultNode.familiar,
                                understood: savedNode?.understood ?? defaultNode.understood,
                                memoryStrength: savedNode?.memoryStrength ?? defaultNode.memoryStrength,
                                lastReviewed: savedNode?.lastReviewed ? new Date(savedNode.lastReviewed) : defaultNode.lastReviewed,
                                moduleId: (defaultModule as Module).id, 
                                domainId: defaultDomain.id,
                            };
                        }),
                    }, (dObj: any, dSrcVal: any, dKey: string) => { 
                        if (dKey === 'nodes' && Array.isArray(dObj) && dSrcVal === undefined) return dObj;
                        return undefined;
                    });
                }),
            }, (objValue, srcValue, key) => {
                 if (key === 'domains' && Array.isArray(objValue) && Array.isArray(srcValue)) {
                    return objValue.map(defaultDomain => {
                        const savedDomain = srcValue.find(sd => sd.id === defaultDomain.id);
                        if (savedDomain) {
                            return _.mergeWith({}, defaultDomain, savedDomain, (dObj: any, dSrcVal: any, dKey: string) => { 
                                if (dKey === 'nodes' && Array.isArray(dObj) && Array.isArray(dSrcVal)) {
                                    return dObj.map(defaultNode => {
                                        const savedNode = dSrcVal.find(sn => sn.id === defaultNode.id);
                                        return savedNode ? {
                                            ...defaultNode,
                                            status: savedNode.status,
                                            familiar: savedNode.familiar,
                                            understood: savedNode.understood,
                                            memoryStrength: savedNode.memoryStrength,
                                            lastReviewed: savedNode.lastReviewed ? new Date(savedNode.lastReviewed) : undefined,
                                            moduleId: (defaultModule as Module).id, 
                                            domainId: defaultDomain.id
                                        } : defaultNode;
                                    });
                                }
                                return undefined; 
                            });
                        }
                        return defaultDomain;
                    });
                }
                 if (_.isArray(objValue) && srcValue === undefined) return objValue; 
                 return undefined; 
            });
        } else if (savedModule && (savedModule.id.startsWith('custom-module-') || savedModule.id.startsWith('wiki_'))) { 
            finalModules[moduleId] = savedModule;
            if ((finalModules[moduleId] as Module).domains) { 
                 (finalModules[moduleId] as Module).domains.forEach(domain => { 
                    if (domain.nodes) {
                        domain.nodes.forEach(node => {
                            node.moduleId = moduleId; 
                            node.domainId = domain.id; 
                            if (!node.epic) node.epic = placeholderEPIC; 
                        });
                    }
                 });
            }
        }
    }
    mergedState.modules = finalModules;

    if (mergedState.activeReadingSession && mergedState.activeReadingSession.moduleId) {
        const moduleForValidation = mergedState.modules[mergedState.activeReadingSession.moduleId] as Module; 
        if (moduleForValidation && Array.isArray(moduleForValidation.domains)) {
            let validatedDomainIndex = -1;
            let validatedNodeIndex = -1;

            const savedDomainIdx = mergedState.activeReadingSession.domainIndex;
            const savedNodeIdx = mergedState.activeReadingSession.nodeIndex;

            if (savedDomainIdx >= 0 && savedDomainIdx < moduleForValidation.domains.length) {
                const domainToValidate = moduleForValidation.domains[savedDomainIdx];
                if (domainToValidate && Array.isArray(domainToValidate.nodes) && domainToValidate.nodes.length > 0) {
                    if (savedNodeIdx >= 0 && savedNodeIdx < domainToValidate.nodes.length) {
                        validatedDomainIndex = savedDomainIdx;
                        validatedNodeIndex = savedNodeIdx;
                    } else {
                        validatedDomainIndex = savedDomainIdx;
                        validatedNodeIndex = 0;
                    }
                }
            }

            if (validatedDomainIndex === -1) {
                for (let dIdx = 0; dIdx < moduleForValidation.domains.length; dIdx++) {
                    if (moduleForValidation.domains[dIdx] && 
                        Array.isArray(moduleForValidation.domains[dIdx].nodes) && 
                        moduleForValidation.domains[dIdx].nodes.length > 0) {
                        validatedDomainIndex = dIdx;
                        validatedNodeIndex = 0;
                        break;
                    }
                }
            }

            if (validatedDomainIndex !== -1 && validatedNodeIndex !== -1) {
                mergedState.activeReadingSession.domainIndex = validatedDomainIndex;
                mergedState.activeReadingSession.nodeIndex = validatedNodeIndex;
            } else {
                mergedState.activeReadingSession = null;
            }
        } else {
            mergedState.activeReadingSession = null;
        }
    }
    return mergedState as UserLearningState; 
  } catch (error) {
    console.error("Could not load state from localStorage during merge:", error);
    return null; 
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

  const syncDefaultLearningState = useMemo(async () => {
      return await getDefaultLearningState();
  }, []);
  
  const [learningState, setLearningState] = useState<UserLearningState>(() => {
      const predefinedModulesList = getAllModules();
      const playerBaseSync: NeuroPlayerCharacterBase = { 
          id: 'player', name: 'Sovereign', maxHealth: 100, maxMana: 50, speed: 10,
          strength: 10, intelligence: 15, wisdom: 10, adaptability: 10,
          elementalWeaknesses: [], elementalResistances: [],
          spellbooks: [], equippedSpellbookId: null, inventory: [], party: [],
          stats: { health: 100, maxHealth: 100, mana: 50, maxMana: 50, strength: 10, intelligence: 15, wisdom: 10, adaptability: 5, speed: 10, elementalWeaknesses: [], elementalResistances: [] }
      };
       const defaultUserProfileSync: NeuroUserProfile = {
        cognitivePatterns: [], domainProficiency: {}, knownTriggers: [],
        shameProfile: { overallResilience: 70, domainResilience: {}, knownTriggers: [], responseHistory: [] },
        learningHistory: [],
        thresholds: { challengeTolerance: 75, recoveryRate: 0.5, optimalChallengeZone: { min: 60, max: 85 } },
    };
      return {
        modules: predefinedModulesList.reduce((acc, module) => { acc[module.id] = module; return acc; }, {} as Record<string, Module | WikiModule>),
        activeSession: null, activeChronicleRun: null, playerCharacterBase: playerBaseSync,
        activeReadingSession: null, currentUserProfile: defaultUserProfileSync, activeReviewSession: null, 
        isThoughtAnalyzerEnabled: false, 
    };
  });

  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [isLoadingChronicle, setIsLoadingChronicle] = useState(false);
  const [detailedLoadingProgress, setDetailedLoadingProgress] = useState<DetailedLoadingState>(initialDetailedLoadingState);
  const [probeQuestions, setProbeQuestions] = useState<string[]>([]);
  const [activeInteraction, setActiveInteraction] = useState<'initial' | 'learning' | 'chronicle' | 'finished' | 'admin' | 'reviewing' | 'diagnosing' | 'status_viewing' | 'reading' | 'explore_infinite'>('initial');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [currentEpicStep, setCurrentEpicStep] = useState<EpicStep>('explain');
  const [availableDungeons, setAvailableDungeons] = useState<Dungeon[]>([]);
  const [isChronicleSystemReady, setIsChronicleSystemReady] = useState(false);


  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [capturedAudio, setCapturedAudio] = useState<Blob | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [isLoadingSTT, setIsLoadingSTT] = useState(false);
  const [voiceTranscriptTarget, setVoiceTranscriptTarget] = useState<React.Dispatch<React.SetStateAction<string>> | null>(null);
  const isSpeakingStateRef = useRef(isSpeaking);
  const isInitialLoadDoneRef = useRef(false); 
  const reviewNotificationShownRef = useRef(false);

  const debouncedSaveStateRef = useRef(
    debounce((state: UserLearningState) => {
      saveStateToLocalStorage(state);
    }, 1000)
  );

  useEffect(() => {
    isSpeakingStateRef.current = isSpeaking;
  }, [isSpeaking]);

  const clearEvaluationResultCallback = useCallback(() => {
    setEvaluationResult(null);
  }, []);

  const updateModuleStatusCallback = useCallback((moduleId: string, status: ModuleStatus) => {
    setLearningState(prev => {
        const module = prev.modules[moduleId];
        if (!module) return prev;
        const updatedModule = { ...module, status: status };

        if ('sourceUrl' in module && 'sourceUrl' in updatedModule && module.type !== 'core' && module.type !== 'pillar') { 
            (updatedModule as WikiModule).sourceUrl = (module as WikiModule).sourceUrl;
            (updatedModule as WikiModule).extractionDate = (module as WikiModule).extractionDate;
            (updatedModule as WikiModule).confidenceScore = (module as WikiModule).confidenceScore;
            (updatedModule as WikiModule).generatedContent = (module as WikiModule).generatedContent;
            (updatedModule as WikiModule).epicGenerationStatus = (module as WikiModule).epicGenerationStatus;
        }
        
        const newModules = { ...prev.modules, [moduleId]: updatedModule };
        return { ...prev, modules: newModules };
    });
  }, []);

  const updateNodeStatusCallback = useCallback((moduleId: string, domainIndex: number, nodeIndex: number, status: NodeStatus, familiar?: boolean, understood?: boolean, lastReviewed?: Date, memoryStrength?: number) => {
    setLearningState(prev => {
        const moduleToUpdate = prev.modules[moduleId];
        if (!moduleToUpdate || !(moduleToUpdate as Module).domains || !(moduleToUpdate as Module).domains[domainIndex]?.nodes[nodeIndex]) {
            console.warn(`Node not found for update: ${moduleId}, D:${domainIndex}, N:${nodeIndex}`);
            return prev;
        }
        const updatedModules = { ...prev.modules };
        const updatedModule = { ...updatedModules[moduleId] } as Module; 
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
        
        if (loadedState.activeChronicleRun && loadedState.activeChronicleRun.dungeonId) {
            if (!loadedState.activeChronicleRun.currentDungeon || !loadedState.activeChronicleRun.currentDungeon.floors) {
                console.log(`STARTUP: Active chronicle run ${loadedState.activeChronicleRun.dungeonId} needs dungeon rehydration.`);
                const dungeon = await getDungeonById(loadedState.activeChronicleRun.dungeonId);
                if (dungeon) {
                    loadedState.activeChronicleRun.currentDungeon = dungeon;
                     console.log("STARTUP: Rehydrated currentDungeon for active run.");
                     if(loadedState.activeChronicleRun.playerState) {
                        const currentRunPlayerState = loadedState.activeChronicleRun.playerState;
                        loadedState.activeChronicleRun.playerState = {
                            ...mergedState.playerCharacterBase,
                            ...currentRunPlayerState, 
                            id: currentRunPlayerState.id || mergedState.playerCharacterBase.id,
                            name: currentRunPlayerState.name || mergedState.playerCharacterBase.name,
                            currentHealth: currentRunPlayerState.currentHealth ?? mergedState.playerCharacterBase.maxHealth,
                            currentMana: currentRunPlayerState.currentMana ?? mergedState.playerCharacterBase.maxMana,
                            coordinates: loadedState.activeChronicleRun.playerPosition, 
                            currentFloor: loadedState.activeChronicleRun.currentFloor,
                            stats: { ...mergedState.playerCharacterBase.stats, ...currentRunPlayerState.stats }, 
                            abilities: (mergedState.playerCharacterBase.spellbooks.find(sb => sb.id === mergedState.playerCharacterBase.equippedSpellbookId)?.abilities || []) as ChronicleAbility[],
                        };
                    }
                } else {
                    console.warn(`STARTUP: Could not rehydrate currentDungeon for ${loadedState.activeChronicleRun.dungeonId}. Clearing active run.`);
                    loadedState.activeChronicleRun = null;
                }
            }
        }
        
        setLearningState(loadedState);
        console.log("[initializeSession] isThoughtAnalyzerEnabled AFTER setLearningState:", loadedState.isThoughtAnalyzerEnabled);
        isInitialLoadDoneRef.current = true; 
        console.log("STARTUP: Full initial load and hydration complete.");

        if (loadedState.activeReadingSession) {
            setActiveInteraction('reading');
        } else if (loadedState.activeSession) {
            setActiveInteraction('learning');
             const moduleId = loadedState.activeSession.currentModuleId!;
             const sessionModule = loadedState.modules[moduleId] as Module;
             if (sessionModule && sessionModule.domains && loadedState.activeSession.currentDomainIndex < sessionModule.domains.length) {
                 const currentDomain = sessionModule.domains[loadedState.activeSession.currentDomainIndex];
                 if (currentDomain && currentDomain.nodes && loadedState.activeSession.currentNodeIndex < currentDomain.nodes.length) {
                     const sessionNode = currentDomain.nodes[loadedState.activeSession.currentNodeIndex];
                     if (loadedState.activeSession.currentPhase === 'install' && sessionNode && sessionNode.status === 'familiar') {
                        setCurrentEpicStep('explain');
                     }
                 }
             }
        } else if (loadedState.activeReviewSession) {
             const reviewSession = loadedState.activeReviewSession;
             if (reviewSession.nodesToReview.length > 0 && reviewSession.currentNodeIndex < reviewSession.nodesToReview.length && reviewSession.nodesToReview[reviewSession.currentNodeIndex]) {
                const reviewNodeDetail = reviewSession.nodesToReview[reviewSession.currentNodeIndex];
                const reviewModule = loadedState.modules[reviewNodeDetail.moduleId] as Module;
                if (reviewModule?.domains) {
                    const domainIdx = reviewModule.domains.findIndex(d => d.nodes.some(n => n.id === reviewNodeDetail.nodeId));
                    if (domainIdx !== -1) {
                        const nodeIdx = reviewModule.domains[domainIdx].nodes.findIndex(n => n.id === reviewNodeDetail.nodeId);
                        if (nodeIdx !== -1) {
                            setLearningState(prev => ({
                                ...prev,
                                activeSession: {
                                    currentModuleId: reviewNodeDetail.moduleId,
                                    currentDomainIndex: domainIdx,
                                    currentNodeIndex: nodeIdx,
                                    currentPhase: 'install', 
                                }
                            }));
                            setCurrentEpicStep(reviewNodeDetail.epicComponentToReview);
                            setActiveInteraction('reviewing');
                        }
                    }
                }
             } else { 
                loadedState.activeReviewSession = null; 
                setActiveInteraction('initial');
             }
        } else if (loadedState.activeChronicleRun) {
            console.log("STARTUP: Active chronicle run detected. Setting interaction to 'chronicle'.");
            const currentRun = loadedState.activeChronicleRun;
            if(currentRun) { 
                const loadDungeonsData = async () => {
                    if (!currentRun.currentDungeon?.floors || currentRun.currentDungeon.floors.length === 0) {
                        console.log(`Rehydrating dungeon: ${currentRun.dungeonId}`);
                        const dungeon = await getDungeonById(currentRun.dungeonId);
                        if (dungeon && dungeon.floors) {
                            setLearningState(prev => {
                                if (prev.activeChronicleRun) {
                                    return {
                                        ...prev,
                                        activeChronicleRun: {
                                            ...prev.activeChronicleRun,
                                            currentDungeon: dungeon
                                        }
                                    };
                                }
                                return prev;
                            });
                        } else {
                            console.error("Failed to rehydrate dungeon:", currentRun.dungeonId);
                            setLearningState(prev => ({...prev, activeChronicleRun: null}));
                            setActiveInteraction('initial');
                            return;
                        }
                    }
                    setActiveInteraction('chronicle');
                };
                loadDungeonsData();
            }
        }
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


  const {
    modules: userModules, 
    activeSession, 
    playerCharacterBase, 
    activeReadingSession, 
    currentUserProfile, 
    isThoughtAnalyzerEnabled 
  } = learningState;
  const currentActiveChronicleRun = learningState.activeChronicleRun;
  const currentActiveReviewSession = learningState.activeReviewSession;
  
  const activeModuleId = useMemo(() => {
    if (activeSession?.currentModuleId) return activeSession.currentModuleId;
    if (activeReadingSession?.moduleId) return activeReadingSession.moduleId;
    if (currentActiveReviewSession &&
        currentActiveReviewSession.nodesToReview.length > 0 &&
        currentActiveReviewSession.currentNodeIndex < currentActiveReviewSession.nodesToReview.length &&
        currentActiveReviewSession.nodesToReview[currentActiveReviewSession.currentNodeIndex]) { 
      return currentActiveReviewSession.nodesToReview[currentActiveReviewSession.currentNodeIndex].moduleId;
    }
    return null;
  }, [activeSession, activeReadingSession, currentActiveReviewSession]);
  
  const currentActiveModule = useMemo(() => {
    return activeModuleId ? userModules[activeModuleId] : null;
  }, [activeModuleId, userModules]);


  const hasAnyInstalledModules = useMemo(() => { 
    if (!userModules) return false;
    return Object.values(userModules).some(m => (m as Module).status === 'installed');
  }, [userModules]);

const currentDomainIndex = useMemo(() => {
    if (activeSession) return activeSession.currentDomainIndex;
    if (activeReadingSession?.moduleId && userModules[activeReadingSession.moduleId]) {
        const module = userModules[activeReadingSession.moduleId] as Module; 
        if (module && Array.isArray(module.domains) && activeReadingSession.domainIndex >= 0 && activeReadingSession.domainIndex < module.domains.length) {
            if (module.domains[activeReadingSession.domainIndex]?.nodes?.length > 0) {
                return activeReadingSession.domainIndex;
            }
        }
        const firstValidDomainIdx = module?.domains?.findIndex(d => Array.isArray(d.nodes) && d.nodes.length > 0);
        return firstValidDomainIdx !== undefined && firstValidDomainIdx > -1 ? firstValidDomainIdx : 0; 
    }
    if (currentActiveReviewSession?.nodesToReview?.length > 0 &&
        currentActiveReviewSession.currentNodeIndex < currentActiveReviewSession.nodesToReview.length && 
        currentActiveModule && (currentActiveModule as Module).domains) { 
        const reviewNodeId = currentActiveReviewSession.nodesToReview[currentActiveReviewSession.currentNodeIndex].nodeId;
        const domainIdx = (currentActiveModule as Module).domains.findIndex(d => d.nodes.some(n => n.id === reviewNodeId)); 
        return domainIdx !== -1 ? domainIdx : 0; 
    }
    return 0; 
}, [activeSession, activeReadingSession, currentActiveReviewSession, currentActiveModule, userModules]);

const currentNodeIndex = useMemo(() => {
    if (activeSession) return activeSession.currentNodeIndex;
    if (activeReadingSession?.moduleId && typeof currentDomainIndex === 'number' && currentDomainIndex !== -1) { 
        const module = userModules[activeReadingSession.moduleId] as Module; 
        const domain = module?.domains?.[currentDomainIndex];
        if (domain && Array.isArray(domain.nodes) && activeReadingSession.nodeIndex >= 0 && activeReadingSession.nodeIndex < domain.nodes.length) {
            return activeReadingSession.nodeIndex;
        }
        return domain?.nodes?.length > 0 ? 0 : 0; 
    }
    if (currentActiveReviewSession?.nodesToReview?.length > 0 &&
        currentActiveReviewSession.currentNodeIndex < currentActiveReviewSession.nodesToReview.length && 
        currentActiveModule && (currentActiveModule as Module).domains && 
        typeof currentDomainIndex === 'number' && currentDomainIndex !== -1) { 
         const domain = (currentActiveModule as Module).domains[currentDomainIndex]; 
         if(domain?.nodes){
            const reviewNodeId = currentActiveReviewSession.nodesToReview[currentActiveReviewSession.currentNodeIndex].nodeId;
            const nodeIdx = domain.nodes.findIndex(n => n.id === reviewNodeId);
            return nodeIdx !== -1 ? nodeIdx : 0; 
         }
    }
    return 0; 
}, [activeSession, activeReadingSession, currentActiveReviewSession, currentActiveModule, currentDomainIndex, userModules]);


  const currentDomain = useMemo(() => {
    if (!currentActiveModule || typeof currentDomainIndex !== 'number' || currentDomainIndex === -1 || !(currentActiveModule as Module).domains ||currentDomainIndex >= (currentActiveModule as Module).domains.length) return null;
    return (currentActiveModule as Module).domains[currentDomainIndex];
  }, [currentActiveModule, currentDomainIndex]);

  const currentNode = useMemo(() => {
    if (!currentDomain || !currentDomain.nodes || typeof currentNodeIndex !== 'number' || currentNodeIndex === -1 || currentNodeIndex >= currentDomain.nodes.length) return null;
    return currentDomain.nodes[currentNodeIndex];
  }, [currentDomain, currentNodeIndex]);

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
    if (sessionToStart?.currentPhase === 'download') {
      setTimeout(() => {
        generateKnowledgeChecksCallback();
      }, 500);
    }
    
  }, [learningState.modules, learningState.activeReadingSession, learningState.currentLearningFlow, activeSession, queueToast, updateModuleStatusCallback, updateNodeStatusCallback, setLearningState, setActiveInteraction, setProbeQuestions, setEvaluationResult, setCurrentEpicStep, startReadingModeCallback, generateKnowledgeChecksCallback]);

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
      // Original install phase logic
      let nextStep = currentEpicStep;
      let shouldAdvanceNode = false;

      const epicStepsOrder: EpicStep[] = ['explain', 'probe', 'implement', 'connect'];
      const currentStepIndex = epicStepsOrder.indexOf(currentEpicStep);

      if (currentStepIndex < epicStepsOrder.length - 1) {
        nextStep = epicStepsOrder[currentStepIndex + 1];
        if (nextStep === 'probe') fetchProbeQuestionsInternalCallback(); 
      } else { 
        shouldAdvanceNode = true; 
      }
      
      if (shouldAdvanceNode) {
        _markNodeUnderstoodInternalCallback(); 
        
        nextNodeIndex++;
        if (currentDomainNodes && nextNodeIndex < currentDomainNodes.length) {
          // Just move to next node in install
          setCurrentEpicStep('explain');
        } else {
          // Move to next domain or complete module
          nextDomainIndex++;
          nextNodeIndex = 0;
          
          if (nextDomainIndex < currentModule.domains.length) {
            let foundDomainWithNodes = false;
            while(nextDomainIndex < currentModule.domains.length){
              if(currentModule.domains[nextDomainIndex]?.nodes?.length > 0){
                foundDomainWithNodes = true;
                break;
              }
              nextDomainIndex++; 
            }
            
            if(!foundDomainWithNodes){ 
              // No more domains, complete module
              updateModuleStatusCallback(currentModuleId!, 'installed');
              setLearningState(prev => ({ ...prev, activeSession: null }));
              setActiveInteraction('finished');
              queueToast({ title: "Module Installation Complete!", description: `Completed ${currentModule.title}.` });
              return;
            }
          } else {
            // No more domains, complete module
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
        setProbeQuestions(nextStep === 'probe' ? probeQuestions : []); 
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
    
    // Pre-generate knowledge checks if moving to a new node in download phase
    if (nextPhase === 'download') {
      setTimeout(() => {
        generateKnowledgeChecksCallback();
      }, 500);
    }
  }, [activeSession, currentActiveModule, currentEpicStep, queueToast, updateModuleStatusCallback, clearEvaluationResultCallback, probeQuestions, _markNodeUnderstoodInternalCallback, setLearningState, setActiveInteraction, setProbeQuestions, setCurrentEpicStep, generateKnowledgeChecksCallback]);

  const _markNodeFamiliarInternalCallback = useCallback(() => {
    if (!currentActiveModule || !activeSession || !currentNode) return;
     updateNodeStatusCallback((currentActiveModule as Module).id, activeSession.currentDomainIndex, activeSession.currentNodeIndex, 'familiar', true, currentNode.understood, new Date(), (currentNode.memoryStrength || 0) + 10);
 }, [currentActiveModule, activeSession, currentNode, updateNodeStatusCallback]);

 const _markNodeUnderstoodInternalCallback = useCallback(() => {
     if (!currentActiveModule || !activeSession || !currentNode) return;
      updateNodeStatusCallback((currentActiveModule as Module).id, activeSession.currentDomainIndex, activeSession.currentNodeIndex, 'understood', true, true, new Date(), (currentNode.memoryStrength || 0) + 20);
 }, [currentActiveModule, activeSession, currentNode, updateNodeStatusCallback]);

  const fetchProbeQuestionsInternalCallback = useCallback(async () => {
    if (!currentNode || !currentActiveModule || isLoading) return;
    setIsLoading(true);
    const characterId = (currentActiveModule as Module).defaultCompanion || await selectAppropriateCharacterId('install');
    try {
      const contextContent = `Module: ${(currentActiveModule as Module).title}, Domain: ${currentDomain?.title}, Concept: ${currentNode.title}, Definition: ${currentNode.shortDefinition}, Clarification: ${currentNode.download.clarification}`;
      const result = await generateProbeQuestions({ concept: currentNode.title, moduleContent: contextContent, characterId });
      setProbeQuestions(result.questions);
    } catch (error) {
      console.error("Error generating probe questions:", error);
      queueToast({ title: "Error", description: "Could not generate probe questions.", variant: "destructive" });
      setProbeQuestions([]); 
    } finally { setIsLoading(false); }
  }, [currentNode, currentActiveModule, currentDomain, queueToast, isLoading, setIsLoading, setProbeQuestions]);

  const performFullEvaluationCallback = useCallback(async (
    userInputText: string,
    analysisContext: AnalysisContext,
    judgingCharacterId?: string 
  ): Promise<EvaluationResult> => {
    setIsLoading(true);
    clearEvaluationResultCallback();
    console.log('[performFullEvaluationCallback]: ENTERED with context:', analysisContext);

    try {
        const userInput: UserInput = { text: userInputText };
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
        };
        
        console.log('[performFullEvaluationCallback]: Calling evaluateResponseFlow with input:', JSON.stringify(evalInputForFlow, null, 2));
        const detailedEvalResult: DetailedEvaluateResponseOutput = await evaluateResponseFlow(evalInputForFlow);
        console.log('[performFullEvaluationCallback]: Received result from flow:', JSON.stringify(detailedEvalResult, null, 2));
        if (detailedEvalResult.debug_error) {
            console.error('[performFullEvaluationCallback]: Server-side error from flow:', detailedEvalResult.debug_error);
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
            analysisResultData = await analyzeThoughtProcess({ userInput, analysisContext });
            const shameEngineOutput = await processWithShameEngine({
                analysisResult: analysisResultData,
                userProfile: currentProfile!,
            });
            shameIndexResultData = shameEngineOutput.shameIndexResult;
            feedbackOutputData = { 
                ...detailedEvalResult.feedbackOutput, 
                ...shameEngineOutput.feedbackOutput,  
                mainFeedback: feedbackOutputData?.mainFeedback || shameEngineOutput.feedbackOutput.mainFeedback, 
            };
        } else {
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
      if (!currentNode || !currentActiveModule || !activeSession) return;
      
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
  }, [currentNode, currentActiveModule, activeSession, performFullEvaluationCallback, queueToast, _markNodeFamiliarInternalCallback]);

   const submitEpicResponseCallback = useCallback(async (response: string) => {
      if (!currentNode || !currentActiveModule || !activeSession) return;
            
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
   }, [currentNode, currentActiveModule, activeSession, currentEpicStep, performFullEvaluationCallback, queueToast, _markNodeUnderstoodInternalCallback]);


  const handleProceedAfterSuccessCallback = useCallback(() => {
    if (!activeSession || !currentActiveModule || !currentNode) return;
    const currentModule = currentActiveModule as Module; 

    clearEvaluationResultCallback(); 

    if (activeSession.currentPhase === 'download') {
        if (currentNode.familiar) { 
             advanceProgressCallback();
        } else {
            _markNodeFamiliarInternalCallback(); 
            advanceProgressCallback();
        }
    } else if (activeSession.currentPhase === 'install') {
        let nextStep = currentEpicStep;
        let shouldAdvanceNode = false;

        const epicStepsOrder: EpicStep[] = ['explain', 'probe', 'implement', 'connect'];
        const currentStepIndex = epicStepsOrder.indexOf(currentEpicStep);

        if (currentStepIndex < epicStepsOrder.length - 1) {
            nextStep = epicStepsOrder[currentStepIndex + 1];
            if (nextStep === 'probe') fetchProbeQuestionsInternalCallback(); 
        } else { 
            shouldAdvanceNode = true; 
        }
        
        if (shouldAdvanceNode) {
            _markNodeUnderstoodInternalCallback(); 
            advanceProgressCallback(); 
        } else {
            setCurrentEpicStep(nextStep);
            setProbeQuestions(nextStep === 'probe' ? probeQuestions : []); 
        }
    }
  }, [activeSession, currentActiveModule, currentNode, currentEpicStep, advanceProgressCallback, fetchProbeQuestionsInternalCallback, clearEvaluationResultCallback, probeQuestions, _markNodeFamiliarInternalCallback, _markNodeUnderstoodInternalCallback, setCurrentEpicStep, setProbeQuestions]);


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

    const result = await chronicleHandleTileInteraction(currentActiveChronicleRun); 
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
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(CHRONICLE_RUN_KEY); 
        localStorage.removeItem(PLAYER_BASE_KEY); 
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
    queueToast({ title: "User Data Cleared", description: "All progress and settings have been reset. Application will reload.", variant: "destructive" });
    if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 1500);
    }
  }, [queueToast, setLearningState, setActiveInteraction, setProbeQuestions, setEvaluationResult, setCurrentEpicStep, setAvailableDungeons, setIsChronicleSystemReady]);


  const startReadingModeCallback = useCallback((moduleId: string) => {
    const moduleToRead = userModules[moduleId] as Module; 
    if (!moduleToRead) {
        queueToast({ title: "Error", description: "Module not found.", variant: "destructive" }); return;
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
    
    setLearningState(prev => ({ ...prev, activeReadingSession: null }));
    setActiveInteraction('initial');
    
    if (transitionToDownload && moduleId) {
      // Transition to download phase
      queueToast({ description: "Exited Reading Mode. Starting Download phase." });
      setTimeout(() => {
        startModuleCallback(moduleId);
      }, 500);
    } else {
      queueToast({ description: "Exited Reading Mode." });
    }
  }, [learningState.activeReadingSession, queueToast, setLearningState, setActiveInteraction, startModuleCallback]);

  const getNodesForReviewCallback = useCallback((): ReviewSessionNode[] => {
    const reviewableNodes: ReviewSessionNode[] = [];
    Object.values(learningState.modules).forEach(module => {
        const fullModule = module as Module; 
        if (!fullModule.domains) return; 
        if (fullModule.status === 'installed' || fullModule.status === 'understood' || fullModule.status === 'needs_review') {
            fullModule.domains.forEach(domain => {
                (domain.nodes || []).forEach(node => {
                    const memoryStrength = node.memoryStrength || 0;
                    const daysSinceLastReview = node.lastReviewed
                        ? (new Date().getTime() - new Date(node.lastReviewed).getTime()) / (1000 * 3600 * 24)
                        : Infinity; 

                    const needsReviewBasedOnStrength = memoryStrength < 50; 
                    const needsReviewBasedOnTime =
                        (memoryStrength < 80 && daysSinceLastReview > 7) || 
                        (memoryStrength >= 80 && daysSinceLastReview > 30) || 
                        daysSinceLastReview === Infinity; 

                    if ((node.status === 'needs_review' || needsReviewBasedOnStrength || needsReviewBasedOnTime) && node.understood) {
                        const epicComponents: EpicStep[] = ['explain', 'probe', 'implement', 'connect'];
                        const randomEpicComponent = epicComponents[Math.floor(Math.random() * epicComponents.length)];
                        
                        reviewableNodes.push({
                            nodeId: node.id,
                            moduleId: fullModule.id, 
                            priorityScore: (node.status === 'needs_review' ? 200 : 100) - memoryStrength + (daysSinceLastReview > 7 ? Math.min(daysSinceLastReview, 90) : 0),
                            epicComponentToReview: randomEpicComponent,
                            lastReviewed: node.lastReviewed,
                            currentMemoryStrength: memoryStrength,
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
        console.log(`[toggleThoughtAnalyzerCallback] Current: ${prev.isThoughtAnalyzerEnabled}, Toggling to: ${newStateValue}`);
        queueToast({ title: "Thought Analyzer", description: newStateValue ? "Enabled" : "Disabled" });
        return { ...prev, isThoughtAnalyzerEnabled: newStateValue };
    });
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
  }, [learningState.activeReadingSession, activeSession, startReadingModeCallback, startModuleCallback, queueToast]);

  // Generate knowledge checks for the current node
  const generateKnowledgeChecksCallback = useCallback(async () => {
    if (!currentNode || !currentActiveModule || !activeSession) return;
    
    setIsLoading(true);
    try {
      // Check if we already have knowledge checks for this node
      const nodeKnowledgeChecks = activeSession.knowledgeChecks?.[currentNode.id];
      if (nodeKnowledgeChecks && nodeKnowledgeChecks.questions.length > 0) {
        setKnowledgeCheckQuestions(nodeKnowledgeChecks.questions);
        setCurrentKnowledgeCheckIndex(0);
        setSelectedKnowledgeCheckAnswer(null);
        return;
      }
      
      // Generate new knowledge checks
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
              score: 0
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
              score
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
    isThoughtAnalyzerEnabled, 
    toggleThoughtAnalyzer: toggleThoughtAnalyzerCallback, 
    knowledgeCheckQuestions,
    currentKnowledgeCheckIndex,
    selectedKnowledgeCheckAnswer,
    generateKnowledgeChecks: generateKnowledgeChecksCallback,
    submitKnowledgeCheckAnswer: submitKnowledgeCheckAnswerCallback,
    exitReadingMode: exitReadingModeCallback,
    ensureProperLearningFlow: ensureProperLearningFlowCallback,
  };
}
