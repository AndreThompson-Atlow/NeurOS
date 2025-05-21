
import type { Module, Node as NeuroNode } from '@/types/neuro'; // For moduleReference.nodeIds
import type {
    Dungeon, EncounterDefinition, Floor, MapCell as ChronicleMapCell, Coordinates, Item, Spellbook, Ability, Enemy, MapCellType, Guardian, EnvironmentDescription, EPICChallenge as ChronicleEPICChallenge, BattleRewards, EntityStats, ItemCategory, ItemRarity, ItemUsageType, Effect, CoreEntityType, EntityTypeTaxonomy, SacredCircuitPhase, Companion, Specter, Construct, Archetype, Quest, QuestObjective, QuestReward, AbilityTarget, ChronicleRunState, PlayerState, EffectType, Position, EPICResponseQuality, EPICChallengeType 
} from '@/types/chronicle';

import { getAllModules, getModuleById as getNeuroOsModuleById } from './predefined-modules'; 
import { getCharacterById } from '@/lib/server/characters'; 
import { SPECTER_TYPES_DATA } from '@/ai/specter-data'; 

// Define ENTITY_DEFINITIONS directly in this file
export const ENTITY_DEFINITIONS_EXPORT: Record<CoreEntityType, EntityTypeTaxonomy> = {
  specter: {
    name: "Specters",
    manifestation: "Demons",
    description: "Manifestations of cognitive challenges, paradoxes, and resistance patterns.",
    alignment: "chaos",
    encounterTypes: ["battle", "debate"],
    possibleOutcomes: ["defeat", "recruitment", "integration"]
  },
  construct: {
    name: "Constructs",
    manifestation: "Angels",
    description: "Order-aligned entities representing structured knowledge frameworks.",
    alignment: "law",
    encounterTypes: ["battle", "discussion"],
    possibleOutcomes: ["defeat", "recruitment"]
  },
  archetype: {
    name: "Archetypes",
    manifestation: "Neutral Agents",
    description: "Conceptual embodiments that represent fundamental patterns.",
    alignment: "neutral",
    encounterTypes: ["discussion", "debate"],
    possibleOutcomes: ["alliance", "insight"]
  },
  companion: {
    name: "Companions",
    manifestation: "Recruitable Allies",
    description: "Module-based entities that join your party and provide support.",
    alignment: "varies",
    encounterTypes: ["discussion", "quest"],
    possibleOutcomes: ["recruitment"]
  },
  unknown_entity: {
    name: "Unknown Entity",
    manifestation: "Mysterious Figure",
    description: "An entity of unknown origin or nature.",
    alignment: "neutral",
    encounterTypes: ["battle", "discussion"],
    possibleOutcomes: ["defeat", "insight"]
  }
};
Object.freeze(ENTITY_DEFINITIONS_EXPORT);


export const SACRED_CIRCUIT_STRUCTURE_EXPORT: SacredCircuitPhase[] = [
  {
    phase: "Entrance",
    internalName: "gateway",
    description: "The threshold where exposure to new concepts begins",
    encounterTypes: ["discussion", "scroll"],
    difficulty: 1
  },
  {
    phase: "Puzzle",
    internalName: "tower",
    description: "Chambers of comprehension where understanding is tested",
    encounterTypes: ["puzzle", "battle"],
    difficulty: 2
  },
  {
    phase: "Dialogue",
    internalName: "library",
    description: "Halls of articulation where concepts must be expressed",
    encounterTypes: ["discussion", "debate"],
    difficulty: 3
  },
  {
    phase: "Challenge",
    internalName: "rift",
    description: "Zones of contradiction where paradoxes must be resolved",
    encounterTypes: ["battle", "puzzle"],
    difficulty: 4
  },
  {
    phase: "Application",
    internalName: "praxis",
    description: "Fields of implementation where knowledge becomes action",
    encounterTypes: ["puzzle", "scroll"],
    difficulty: 5
  },
  {
    phase: "Integration",
    internalName: "hearth",
    description: "Chambers of connection where concepts link to broader understanding",
    encounterTypes: ["discussion", "battle"],
    difficulty: 6
  },
  {
    phase: "Verification",
    internalName: "gate",
    description: "The final trial where mastery is tested by the Guardian",
    encounterTypes: ["boss"],
    difficulty: 7
  }
];
Object.freeze(SACRED_CIRCUIT_STRUCTURE_EXPORT);


export const RESPONSE_QUALITY_EFFECTS_EXPORT: Record<EPICResponseQuality, { name: string, description: string, damageMultiplier: number, bonusEffect: boolean, message: string }> = {
  PERFECT: {
    name: "Perfect Response",
    description: "Critical hit + bonus effect",
    damageMultiplier: 2.0,
    bonusEffect: true,
    message: "Your profound understanding creates a devastating effect!"
  },
   STRONG: {
    name: "Strong Response",
    description: "Full damage/effect",
    damageMultiplier: 1.0,
    bonusEffect: false,
    message: "Your clear understanding delivers the full power of your ability."
  },
  ADEQUATE: {
    name: "Adequate Response",
    description: "Partial effect",
    damageMultiplier: 0.5,
    bonusEffect: false,
    message: "Your basic understanding delivers a weakened effect."
  },
  POOR: {
    name: "Poor Response",
    description: "Spell fizzles, mana still consumed",
    damageMultiplier: 0.0,
    bonusEffect: false,
    message: "Your insufficient understanding causes the ability to fizzle out."
  },
  FAILED: {
    name: "Failed Response",
    description: "Backfire (possible self-damage)",
    damageMultiplier: -0.3, 
    bonusEffect: false,
    message: "Your misunderstanding causes the ability to backfire!"
  }
};
Object.freeze(RESPONSE_QUALITY_EFFECTS_EXPORT);

export const createMapCell = (type: MapCellType, isWalkable: boolean, details: Partial<ChronicleMapCell> = {}): ChronicleMapCell => ({
    type,
    isWalkable,
    isExplored: false, 
    visited: false,
    ...details,
});

export const allSpells: Record<string, Ability> = {};
export const spellbooksData: Record<string, Spellbook> = {};
let spellbooksInitialized = false;
let spellbooksInitializedPromise: Promise<void> | null = null;

export const initializeSpellbookAndSpellData = async (): Promise<void> => {
    if (spellbooksInitialized) return;
    if (spellbooksInitializedPromise) return spellbooksInitializedPromise;

    spellbooksInitializedPromise = (async () => {
        try {
            const modulesForSpellbooks = getAllModules();

            for (const module of modulesForSpellbooks) {
                if (!module || !module.id || !module.domains) {
                    console.warn(`Skipping spellbook generation for module due to missing id or domains: ${module?.title || 'Unknown Module'}`);
                    continue;
                }
                const spellbookId = `spellbook-${module.id}`;
                const abilities: Ability[] = [];

                const epicTypes: EPICChallengeType[] = ['explain', 'probe', 'implement', 'connect'];
                
                const nodesForAbilities = module.domains.flatMap(d => d.nodes || []);

                for (let i = 0; i < Math.min(epicTypes.length, nodesForAbilities.length || 0, 3) ; i++) { 
                    const epicType = epicTypes[i % epicTypes.length];
                    const nodeForAbility = nodesForAbilities[i % (nodesForAbilities.length || 1)]; 
                    if (!nodeForAbility) continue;

                    const abilityId = `spell-${module.id}-${nodeForAbility.id.split('-').pop()}-${epicType.toLowerCase()}`;
                    const abilityName = `${nodeForAbility.title.substring(0,12)}... ${epicType.charAt(0).toUpperCase() + epicType.slice(1)}`;
                    
                    let effectType: EffectType = 'damage';
                    let effectValue: number | string = 20 + i * 5; // Default to number
                    let effectDescription = 'Cognitive damage';
                    let target: AbilityTarget = 'single_enemy';

                    if (epicType === 'explain' || epicType === 'connect') {
                        if (Math.random() < 0.4) { 
                            effectType = 'buff';
                            effectValue = 10 + i * 2;
                            effectDescription = `${epicType} based cognitive boost.`;
                            target = 'self';
                        }
                    } else if (epicType === 'implement') {
                         if (Math.random() < 0.3) {
                            effectType = 'heal';
                            effectValue = 15 + i * 5;
                            effectDescription = `${epicType} based restoration.`;
                            target = 'single_ally';
                         }
                    } else if (epicType === 'probe') {
                        if(Math.random() < 0.2) {
                            effectType = 'debuff';
                            effectValue = 10 + i * 2;
                            effectDescription = `${epicType} based cognitive disruption.`;
                            target = 'single_enemy';
                        } else if (Math.random() < 0.1) {
                            effectType = 'status';
                            effectValue = Math.random() < 0.5 ? 'sleep' : 'paralysis'; // Example statuses
                            effectDescription = `Inflicts ${effectValue}.`;
                            target = 'single_enemy';
                        }
                    }


                    const newAbility: Ability = {
                        id: abilityId,
                        name: abilityName,
                        description: `Channel the ${epicType} power of ${module.title}, drawing on insights from ${nodeForAbility.title}.`,
                        manaCost: 10 + i * 2,
                        target: target,
                        epicType: epicType,
                        effectPower: typeof effectValue === 'number' ? (20 + i * 5) : 20, // Default if effectValue became string
                        effects: [{ type: effectType, value: effectValue, description: effectDescription, duration: (effectType === 'buff' || effectType === 'debuff' || effectType === 'status') ? 3: undefined }],
                        moduleReference: { moduleId: module.id, nodeId: nodeForAbility.id },
                        iconUrl: `https://placehold.co/32x32.png`,
                        element: module.alignmentBias || 'neutral'
                    };
                    abilities.push(newAbility);
                    allSpells[abilityId] = newAbility;
                }
                
                spellbooksData[spellbookId] = {
                    id: spellbookId,
                    moduleId: module.id,
                    name: `Tome of ${module.title}`,
                    description: `Contains abilities derived from the ${module.title} module.`,
                    abilities: abilities, 
                    unlockCondition: `Install the ${module.title} module.`
                };
            }
            spellbooksInitialized = true;
        } catch (error) {
            console.error("Error during spellbook initialization:", error);
            spellbooksInitialized = false; 
            spellbooksInitializedPromise = null; 
            throw error; 
        }
    })();
    await spellbooksInitializedPromise;
};


export let availableDungeonsData: Dungeon[] = [];
let dungeonsDataInitializedPromise: Promise<void> | null = null;


export const initializeDungeonsData = async (): Promise<void> => {
    if (dungeonsDataInitializedPromise) return dungeonsDataInitializedPromise;

    dungeonsDataInitializedPromise = (async () => {
       try {
        const allSystemModules = getAllModules(); 
        
        const challengeModules = allSystemModules.filter(m => m.type === 'challenge' || m.type === 'pillar' || m.type === 'core');
        const challengeDungeonsPromises = challengeModules.map(async module => {
                if (!module || !module.id) { 
                  console.warn("Skipping dungeon generation for module with missing ID or data:", module);
                  return null; 
                }
                return enhanceDungeonWithLore({
                    id: module.recommendedChronicleDungeon?.toLowerCase().replace(/\s+/g, '-') || `dungeon-${module.id}`,
                    name: module.recommendedChronicleDungeon || `Challenge: ${module.title}`,
                    type: 'challenge',
                    difficulty: 5 + (module.dependencies?.length || 0) * 2,
                    description: module.description,
                    domainDungeonType: module.domains[0]?.domainDungeonType || 'generic_trial',
                    entranceCoordinate: { x: 1, y: 1 },
                    thumbnailUrl: `https://placehold.co/100x100.png`,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    scalingMode: 'static',
                    guardian: {
                        characterId: module.defaultCompanion, 
                        name: `${module.title} Guardian`,
                        description: `Guardian of the ${module.title} challenge.`,
                        alignment: module.alignmentBias as 'law' | 'neutral' | 'chaos',
                        abilities: (spellbooksData[`spellbook-${module.id}`]?.abilities || []).slice(0, 3).map(ab => ab as Ability),
                        entityId: `${module.defaultCompanion || 'defaultGuardian'}-prime-${module.id}`,
                        stats: defaultStats,
                    },
                    environment: { description: `Thematic environment reflecting the core concepts of the ${module.title} module.`, visualTheme: `${module.alignmentBias}_theme`, ambientSound: "themed_sound", colorPalette: `${module.alignmentBias}_palette` },
                    alignment: module.alignmentBias as 'law' | 'neutral' | 'chaos',
                    reward: {
                        artifact: Object.values(chronicleItems)[Math.floor(Math.random() * Object.values(chronicleItems).length)] as Item,
                        memoryStrengthBonus: 10,
                        companion: undefined,
                    },
                    requiredModules: [module.id],
                }, module as Module);
            });
        
        const challengeDungeonsResults = await Promise.all(challengeDungeonsPromises);
        const definedChallengeDungeons = challengeDungeonsResults.filter(Boolean) as Dungeon[]; 
        
        const infiniteDungeonFloor = await createProceduralFloor(1, 15, 15, 'dungeon-infinite-echoes');
        const cognitiveProvingGroundsFloor = await createProceduralFloor(1, 10, 10, 'dungeon-cognitive-proving-grounds');


        availableDungeonsData = [
            {
                id: 'dungeon-cognitive-proving-grounds',
                name: 'Cognitive Proving Grounds',
                description: 'A basic training dungeon to test fundamental EPIC skills. No module prerequisites. Starts with Sovereign Core spellbook.',
                type: 'challenge',
                difficultyLevel: 1,
                requiredModules: [], 
                domainDungeonType: 'tutorial_arena',
                entranceCoordinate: { x: 1, y: 1 },
                thumbnailUrl: 'https://placehold.co/100x100.png',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                floors: [cognitiveProvingGroundsFloor],
                sacredCircuitPhases: SACRED_CIRCUIT_STRUCTURE_EXPORT as SacredCircuitPhase[],
                scalingMode: 'static',
                alignment: 'neutral',
                reward: { memoryStrengthBonus: 5, artifact: chronicleItems['key-common'] as Item },
                guardian: { 
                    name: "Praxis, The Guide",
                    description: "Guardian of the Proving Grounds, ensures fair challenge.",
                    alignment: "neutral",
                    dialogue: { greeting: "Welcome, Sovereign. Test your foundational skills here.", victory: "Well done. You grasp the basics.", defeat: "Fundamentals require further refinement." },
                    abilities: [], 
                    moduleReference: { moduleId: 'sovereign-core' },
                    stats: defaultStats,
                },
                environment: { description: "A clean, well-lit arena for focused cognitive trials.", visualTheme: "neutral_minimalist", ambientSound: "focus_ambience", colorPalette: "neutral_palette" },
            } as Dungeon,
            ...definedChallengeDungeons,
            {
                id: 'dungeon-infinite-echoes',
                name: 'Infinite Echoes',
                description: 'Ever-shifting dungeon reflecting all installed knowledge. Requires at least one installed module.',
                type: 'infinite',
                difficultyLevel: 1,
                requiredModules: [], 
                domainDungeonType: 'procedural_synthesis',
                entranceCoordinate: { x: 1, y: 1 },
                thumbnailUrl: 'https://placehold.co/100x100.png',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                floors: [infiniteDungeonFloor],
                sacredCircuitPhases: SACRED_CIRCUIT_STRUCTURE_EXPORT as SacredCircuitPhase[],
                scalingMode: 'dynamic',
                alignment: 'neutral',
                reward: {
                    memoryStrengthBonus: 5,
                    artifact: chronicleItems['key-common'] as Item,
                },
                guardian: { 
                    name: "Echo of the Neuroverse",
                    description: "A manifestation of the player's total integrated knowledge.",
                    alignment: "neutral",
                    dialogue: { greeting: "The echoes of your mind await. How deep will you explore?", victory: "Another layer understood.", defeat: "The depths remain elusive." },
                    abilities: [], 
                    moduleReference: { moduleId: 'system' }, 
                    stats: defaultStats,
                },
                environment: {
                    description: "A constantly shifting environment that reflects themes from the player's installed modules.",
                    visualTheme: "Kaleidoscopic, procedural, morphing",
                    ambientSound: "evolving_soundscapes",
                    colorPalette: "dynamic_spectrum_of_module_colors",
                },
            } as Dungeon, 
        ];
       } catch (error) {
           console.error("Error initializing dungeons data:", error);
           availableDungeonsData = []; 
           dungeonsDataInitializedPromise = null; 
           throw error; 
       }
    })();
    await dungeonsDataInitializedPromise;
};

// Combined initialization function
export const initializeChronicleData = async (): Promise<void> => {
    console.log("ChronicleData: Initializing Spellbooks...");
    await initializeSpellbookAndSpellData();
    console.log("ChronicleData: Spellbooks initialized. Initializing Dungeons...");
    await initializeDungeonsData();
    console.log("ChronicleData: Dungeons initialized.");
};


const createProceduralFloor = async ( 
    floorLevel: number,
    width: number,
    height: number,
    dungeonId: string,
    dungeonGuardianData?: Partial<Guardian>
): Promise<Floor> => { 
    const mapGrid: ChronicleMapCell[][] = Array.from({ length: height }, () => 
        Array.from({ length: width }, () => createMapCell('wall', false))
    );

    const sacredCircuitPhase = SACRED_CIRCUIT_STRUCTURE_EXPORT[(floorLevel - 1) % SACRED_CIRCUIT_STRUCTURE_EXPORT.length];

    let currentX = 0;
    let currentY = 0;
    if (width > 2 && height > 2) {
        currentX = Math.floor(Math.random() * (width - 2)) + 1;
        currentY = Math.floor(Math.random() * (height - 2)) + 1;
    } else if (width > 0 && height > 0) {
        currentX = Math.floor(Math.random() * width);
        currentY = Math.floor(Math.random() * height);
    } else {
        console.error(`Invalid dimensions for floor: ${width}x${height}`);
        return { id: `${dungeonId}-f${floorLevel}-error`, level: floorLevel, phaseType: sacredCircuitPhase, map: [], encounters: [], entryPosition: {x:0,y:0}, exitPosition:{x:0,y:0}, dimensions: {width, height}, description: "Error: Invalid dimensions", visualTheme: "error-theme", dungeonId };
    }
    
    if (mapGrid[currentY]?.[currentX]) { 
        mapGrid[currentY][currentX] = createMapCell('entrance', true);
    } else {
       if (mapGrid[0]?.[0]) {  
           mapGrid[0][0] = createMapCell('entrance', true);
           currentX = 0; currentY = 0;
       } else {
           console.error("Cannot place entrance on extremely small or invalid map grid for floor " + floorLevel);
            return { id: `${dungeonId}-f${floorLevel}-error`, level: floorLevel, phaseType: sacredCircuitPhase, map: mapGrid, encounters: [], entryPosition: {x:0,y:0}, exitPosition:{x:0,y:0}, dimensions: {width, height}, description: "Error: Map too small to place entrance", visualTheme: "error-theme", dungeonId };
       }
    }
    const entryPosition = { x: currentX, y: currentY };

    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    let pathLength = Math.floor(width * height * 0.3);

    const encountersOnFloor: EncounterDefinition[] = [];

    for (let i = 0; i < pathLength; i++) {
        if(!mapGrid[currentY] || !mapGrid[currentY][currentX]) {
             console.warn(`Path generation out of bounds at ${currentX},${currentY} on floor ${floorLevel}`);
             break; 
        }
        mapGrid[currentY][currentX] = createMapCell('floor', true);

        if (Math.random() < 0.15) {
            const encounterType = sacredCircuitPhase.encounterTypes[Math.floor(Math.random() * sacredCircuitPhase.encounterTypes.length)];
            const entityTypeKeys = Object.keys(ENTITY_DEFINITIONS_EXPORT) as CoreEntityType[];
            const randomEntityTypeKey = entityTypeKeys[Math.floor(Math.random() * entityTypeKeys.length)];
            let entityType: CoreEntityType = randomEntityTypeKey;

            if (encounterType === 'battle' || encounterType === 'debate' || encounterType === 'boss') {
                entityType = randomEntityTypeKey !== 'companion' ? randomEntityTypeKey : 'specter';
            } else if (encounterType === 'discussion') {
                entityType = Math.random() < 0.7 ? 'archetype' : 'companion';
            }

            const encounterId = `enc-${dungeonId}-f${floorLevel}-${i}`;
            const newEncounter: EncounterDefinition = {
                id: encounterId, type: encounterType, position: { x: currentX, y: currentY },
                difficulty: sacredCircuitPhase.difficulty,
                entityType: entityType,
                entityId: `${entityType}-${i}`, 
                moduleReference: {moduleId: dungeonId.replace('dungeon-','').replace('challenge-',''), nodeIds:[]}, 
                completed: false,
                title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Encounter`,
                description: `A standard ${encounterType} encounter with a ${entityType}.`
            };
            
            if (encounterType === 'scroll') {
                const pillarSpellbookIds = Object.keys(spellbooksData).filter(id => 
                    getAllModules().find(m => m.id === spellbooksData[id].moduleId && m.type === 'pillar')
                );
                const randomPillarSpellbookId = pillarSpellbookIds.length > 0 ? pillarSpellbookIds[Math.floor(Math.random() * pillarSpellbookIds.length)] : 'spellbook-sovereign-core';
                const spellbookToUnlock = spellbooksData[randomPillarSpellbookId] || spellbooksData['spellbook-sovereign-core'];
                newEncounter.scrollData = {
                    scrollTitle: `Ancient Scroll of ${spellbookToUnlock.name.replace('Tome of ', '')}`,
                    content: `This ancient scroll contains fragmented knowledge related to the principles of ${spellbookToUnlock.name.replace('Tome of ', '')}. Deciphering it requires deep comprehension and an ability to synthesize its core tenets.`,
                    relatedNodeId: spellbookToUnlock.abilities[0]?.moduleReference?.nodeId || `${spellbookToUnlock.moduleId}-d1-n1`,
                     comprehensionQuestions: [
                        { question: `What is a core principle of ${spellbookToUnlock.name.replace('Tome of ', '')}?`, options: ["Option A", "Option B", "Option C - Often related to a key term from the module"], correctAnswerIndex: 2 },
                        { question: `How might one apply concepts from ${spellbookToUnlock.name.replace('Tome of ', '')} in a practical scenario?`, options: ["Vague application", "Specific, relevant application", "Irrelevant application"], correctAnswerIndex: 1 }
                    ],
                    essayPrompt: `Write a short essay (2-3 paragraphs) explaining how the core ideas of ${spellbookToUnlock.name.replace('Tome of ', '')} connect to a broader understanding of cognitive architecture or problem-solving.`
                };
            } else if (encounterType === 'discussion') {
                 const charAffinities = getAllModules().find(m => m.id === newEncounter.moduleReference.moduleId)?.domains[0]?.characterAffinities || ['neuros'];
                 const randomCharId = charAffinities[Math.floor(Math.random() * charAffinities.length)];
                 const charDetails = await getCharacterById(randomCharId);
                 newEncounter.discussionData = {
                    npcId: randomCharId,
                    initialPrompt: `Greetings, Sovereign. I am ${charDetails?.name || randomCharId}. Let us discuss the nuances of ${newEncounter.moduleReference.moduleId.replace(/-/g, ' ')}.`,
                    dialogueTree: [
                        {id: 'start_discussion', text: `What are your initial thoughts on its core principles?`, speakerId: randomCharId, responses: [{id: 'player_insight', text: "I believe...", nextNodeId: 'npc_response_1'}]},
                        {id: 'npc_response_1', text: `Interesting. And how does that relate to its practical application?`, speakerId: randomCharId, responses: [{id: 'player_application', text: "In practice...", nextNodeId: 'final_assessment'}], conditions: {previousNode: 'player_insight'}},
                        {id: 'final_assessment', text: `Your understanding is insightful. Perhaps we can learn more together.`, speakerId: randomCharId, endsDiscussion: false, triggersRecruitmentId: randomCharId}
                    ],
                    keyTopics: (getAllModules().find(m => m.id === newEncounter.moduleReference.moduleId)?.tags || [])
                 };
            } else if (encounterType === 'debate') {
                 const charAffinities = getAllModules().find(m => m.id === newEncounter.moduleReference.moduleId)?.domains[0]?.characterAffinities || ['veridex'];
                 const randomCharId = charAffinities[Math.floor(Math.random() * charAffinities.length)];
                 const charDetails = await getCharacterById(randomCharId);
                 newEncounter.debateData = {
                     opponentId: randomCharId,
                     topic: `The true nature of ${newEncounter.moduleReference.moduleId.replace(/-/g, ' ')}`,
                     opponentArguments: [`The principles of ${newEncounter.moduleReference.moduleId.replace(/-/g, ' ')} are often misunderstood.`, `Many fail to grasp its deeper implications.`],
                     resolutionLogic: "Player must provide 2 valid counter-arguments and a superior synthesis.",
                     keyConcepts: (getAllModules().find(m => m.id === newEncounter.moduleReference.moduleId)?.tags || [])
                 };
            }


            encountersOnFloor.push(newEncounter);
            mapGrid[currentY][currentX] = createMapCell('encounter', true, { encounterId: encounterId });
        } else if (Math.random() < 0.05) {
            const itemId = `item-${dungeonId}-f${floorLevel}-${i}`;
            mapGrid[currentY][currentX] = createMapCell('item_cache', true, { itemId: itemId });
        } else if (Math.random() < 0.03 && sacredCircuitPhase.encounterTypes.includes('puzzle')) {
            const puzzleId = `puzzle-${dungeonId}-f${floorLevel}-${i}`;
             const relatedModule = getAllModules().find(m => m.id === dungeonId.replace('dungeon-','').replace('challenge-',''));
             const relatedNode = relatedModule?.domains[0]?.nodes[0]; 
             encountersOnFloor.push({
                id: puzzleId, type: 'puzzle', position: { x: currentX, y: currentY },
                difficulty: sacredCircuitPhase.difficulty,
                entityType: 'archetype', entityId: 'puzzle-master',
                moduleReference: {moduleId: relatedModule?.id || 'sovereign-core', nodeIds:[relatedNode?.id || 'default-node']},
                completed: false,
                title: "Riddle of the Ancients",
                description: "A cryptic puzzle blocks your path.",
                puzzleData: {
                    puzzleType: "logic_deduction",
                    description: "Solve this riddle based on the principles of " + (relatedNode?.title || "this domain") + ".",
                    content: relatedNode?.epic.implementPrompt || "Implement a solution based on the core concepts.",
                    solution: "A plausible solution involving key terms from the node like " + (relatedNode?.keyTerms[0] || "key term"),
                    hints: ["Consider the primary learning objective.", "Think about practical application."]
                }
            });
            mapGrid[currentY][currentX] = createMapCell('artifact_puzzle', true, { encounterId: puzzleId });
        }

        let validMoves = [];
        for (const [dx, dy] of directions) {
            const nextCellX = currentX + dx * 2; 
            const nextCellY = currentY + dy * 2;
            if (nextCellX > 0 && nextCellX < width - 1 && nextCellY > 0 && nextCellY < height - 1 && mapGrid[nextCellY]?.[nextCellX]?.type === 'wall') {
                 validMoves.push({dx, dy});
            }
        }

        if (validMoves.length === 0) break;

        const {dx, dy} = validMoves[Math.floor(Math.random() * validMoves.length)];
        if (mapGrid[currentY + dy]?.[currentX + dx]) mapGrid[currentY + dy][currentX + dx] = createMapCell('floor', true); 
        currentX += dx * 2;
        currentY += dy * 2;
        if (mapGrid[currentY]?.[currentX]) mapGrid[currentY][currentX] = createMapCell('floor', true); 
        else { break; }
    }
    
    let exitX = 0, exitY = 0;
    if (width > 2 && height > 2) {
      exitX = Math.floor(Math.random() * (width - 2)) + 1;
      exitY = Math.floor(Math.random() * (height - 2)) + 1;
    } else if (width > 0 && height > 0) {
      exitX = Math.floor(Math.random() * width);
      exitY = Math.floor(Math.random() * height);
    }


    let exitPlacementAttempts = 0;
    const MAX_EXIT_ATTEMPTS = 50;

    do {
      if (width > 2 && height > 2) {
        exitX = Math.floor(Math.random() * (width - 2)) + 1;
        exitY = Math.floor(Math.random() * (height - 2)) + 1;
      } else if (width > 0 && height > 0){
        exitX = Math.floor(Math.random() * width);
        exitY = Math.floor(Math.random() * height);
      } else {
          break; 
      }
      exitPlacementAttempts++;
    } while (
        exitPlacementAttempts < MAX_EXIT_ATTEMPTS &&
        (mapGrid[exitY]?.[exitX]?.type !== 'floor' || (exitX === entryPosition.x && exitY === entryPosition.y))
    );
    
    if(exitPlacementAttempts >= MAX_EXIT_ATTEMPTS && mapGrid[exitY]?.[exitX]?.type !== 'floor') {
        let foundFallback = false;
        for(let fy = 1; fy < height -1; fy++) {
            for(let fx = 1; fx < width -1; fx++) {
                if(mapGrid[fy]?.[fx]?.type === 'floor' && !(fx === entryPosition.x && fy === entryPosition.y)) {
                    exitX = fx; exitY = fy; foundFallback = true; break;
                }
            }
            if(foundFallback) break;
        }
        if(!foundFallback && mapGrid.length > 0 && mapGrid[0].length > 0) { 
            if(entryPosition.x + 1 < mapGrid[0].length) {
                exitX = entryPosition.x + 1;
            } else if (entryPosition.x - 1 >= 0) {
                exitX = entryPosition.x - 1;
            } else {
                exitX = entryPosition.x;
            }
            exitY = entryPosition.y;
            if (mapGrid[exitY]?.[exitX]) mapGrid[exitY][exitX] = createMapCell('floor', true);
        }
    }

    const isBossFloor = floorLevel === SACRED_CIRCUIT_STRUCTURE_EXPORT.length && dungeonId !== 'dungeon-infinite-echoes';
    const exitTileType: MapCellType = isBossFloor ? 'floor_boss' : 'exit';
    
    if(mapGrid[exitY]?.[exitX]) {
        mapGrid[exitY][exitX] = createMapCell(exitTileType, true, { bossId: isBossFloor ? `${dungeonId}-guardian-boss` : undefined });
    }

    if(isBossFloor && dungeonGuardianData){
        const bossEncounterId = `${dungeonId}-guardian-boss-encounter`;
        const guardianEntityType = dungeonGuardianData.alignment === "law" ? 'construct' : dungeonGuardianData.alignment === "chaos" ? 'specter' : 'archetype';
        encountersOnFloor.push({
            id: bossEncounterId, type: 'boss', position: {x:exitX, y:exitY},
            difficulty: sacredCircuitPhase.difficulty + 2,
            entityType: guardianEntityType as CoreEntityType, 
            entityId: dungeonGuardianData.entityId || `${dungeonId}-guardian-enemy-form`, 
            moduleReference: {moduleId: dungeonId.replace('dungeon-','').replace('challenge-',''), nodeIds:[]},
            completed: false,
            title: dungeonGuardianData.name || `${dungeonId.replace('dungeon-','').replace('challenge-','')} Guardian`,
            description: dungeonGuardianData.description || `The final guardian of ${dungeonId.replace('dungeon-','').replace('challenge-','')}.`
        });
        if(mapGrid[exitY]?.[exitX]) {
            mapGrid[exitY][exitX] = createMapCell('floor_boss', true, { encounterId: bossEncounterId, bossId: `${dungeonId}-guardian-boss` });
        }
    }

    return {
        id: `${dungeonId}-f${floorLevel}`,
        dungeonId,
        level: floorLevel,
        map: mapGrid,
        encounters: encountersOnFloor,
        entryPosition,
        exitPosition: {x: exitX, y: exitY},
        dimensions: { width, height },
        phaseType: sacredCircuitPhase,
        description: `Floor ${floorLevel}: ${sacredCircuitPhase.phase} - ${sacredCircuitPhase.description}`,
        visualTheme: `${dungeonId.split('-')[1]}-${sacredCircuitPhase.internalName}`, 
    };
};


export let allEncounterDefinitions: Record<string, EncounterDefinition> = {
    'encounter-cognitive-mite-battle': {
        id: 'encounter-cognitive-mite-battle',
        type: 'battle',
        entityType: 'specter',
        entityId: 'cognitive-mite',
        difficulty: 1,
        moduleReference: { moduleId: 'sovereign-core', nodeIds: ['recursive_sovereignty'] },
        title: "Cognitive Mite Skirmish",
        description: "A tiny but persistent Specter challenges your foundational understanding."
    },
    'encounter-logic-imp-battle': {
        id: 'encounter-logic-imp-battle',
        type: 'battle',
        entityType: 'specter',
        entityId: 'logic-imp',
        difficulty: 2,
        moduleReference: { moduleId: 'thinking', nodeIds: ['think-d1-n1'] },
        title: "Logic Imp Confrontation",
        description: "An impish Specter attempts to twist your deductive reasoning."
    },
    'scroll-thinking-basics': {
        id: 'scroll-thinking-basics', type: 'scroll', title: 'Scroll of Basic Logic',
        description: 'A tattered scroll hinting at deductive principles.',
        entityType: 'archetype', entityId: 'scroll-guardian-thinking',
        difficulty: 2, moduleReference: { moduleId: 'thinking', nodeIds: ['think-d1-n1'] },
        scrollData: {
            scrollTitle: "Scroll of Deductive Basics",
            content: "To deduce is to infer from general principles. All A are B. C is A. Therefore, C is B. This form holds true regardless of content, if premises are sound.",
            relatedNodeId: "think-d1-n1",
             comprehensionQuestions: [
                { question: "What is the key characteristic of a valid deductive argument?", options: ["True premises", "True conclusion", "Conclusion logically follows premises"], correctAnswerIndex: 2 },
                { question: "If 'All X are Y' and 'Z is Y', can we deduce 'Z is X'?", options: ["Yes, always", "No, this is a fallacy", "Sometimes"], correctAnswerIndex: 1 }
            ],
            essayPrompt: "Explain in 50-100 words how understanding deductive validity can prevent common reasoning errors. Provide an example.",
            unlockableSpellbookId: "spellbook-thinking"
        }
    },
    'discussion-neuros-sovereignty': {
        id: 'discussion-neuros-sovereignty', type: 'discussion', title: 'Dialogue with Neuros on Sovereignty',
        description: 'Neuros wishes to discuss the finer points of self-governance.',
        entityType: 'construct', entityId: 'neuros-chronicle-aspect',
        difficulty: 3, moduleReference: { moduleId: 'sovereign-core', nodeIds: ['recursive_sovereignty', 'meta_integrity'] },
        discussionData: {
            npcId: 'neuros',
            initialPrompt: "Sovereign, we have established the principles of Recursive Sovereignty and Meta-Integrity. How do you see these two concepts interrelating to form a robust system of self-governance? Explain their synergy.",
            dialogueTree: [
                { id: 'player_response_synergy', text: 'I believe Recursive Sovereignty provides the mechanism to update the very rules Meta-Integrity checks against, ensuring the system remains both coherent and adaptable. Meta-Integrity detects drift, and Recursive Sovereignty allows principled course correction.', speakerId: 'player'},
                { id: 'neuros_ack_good', text: 'A precise and insightful synthesis. Your understanding of this dynamic is foundational. You may find my core logic patterns useful in your endeavors.', speakerId: 'neuros', conditions: {previousNode: 'player_response_synergy', keywordMatch: ['adaptable', 'coherent', 'mechanism', 'update']}, triggersRecruitmentId: 'neuros-companion-version', endsDiscussion: true },
                { id: 'neuros_clarify_needed', text: 'Your explanation lacks clarity on how these distinct principles would actually interact. Could you elaborate on a specific scenario where this synergy would be crucial?', speakerId: 'neuros', conditions: {previousNode: 'player_response_synergy'}, responses: [{id: 'player_response_scenario', text: 'Consider a scenario where a core value is challenged by new life experience...', nextNodeId: 'neuros_final_eval'}] },
                { id: 'neuros_final_eval', text: 'Better. This demonstrates a functional, if nascent, grasp. Continue to refine this.', speakerId: 'neuros', endsDiscussion: true, conditions: {previousNode: 'player_response_scenario'}}
            ],
            keyTopics: ['recursive sovereignty', 'meta-integrity', 'self-governance', 'adaptability', 'coherence']
        }
    },
    'battle-construct-dogma': {
        id: 'battle-construct-dogma', type: 'battle', title: 'Confronting the Construct of Dogma',
        description: 'A rigid Construct challenges your ability to adapt your foundational beliefs.',
        entityType: 'construct', entityId: 'dogma-golem',
        difficulty: 4, moduleReference: { moduleId: 'sovereign-core', nodeIds: ['axiomatic_frame', 'constitutional_amendments'] },
        rewards: { experience: 200, memoryStrengthBonus: 15, items: [{id: "key-common", name: "Key of Axiomatic Clarity", type: 'key', rarity: 'uncommon', description: "Unlocks deeper understanding of foundational beliefs.", effects: [], usageType: 'passive'}]}
    }
};

export const chronicleItems: Record<string, Item> = {
    'scroll-chrono-basics': { id: 'scroll-chrono-basics', name: 'Scroll of Temporal Basics', type: 'scroll' as ItemCategory, rarity: 'common' as ItemRarity, description: 'A dusty scroll hinting at the nature of time.', effects: [], usageType: 'consumable' as ItemUsageType, iconUrl: 'https://placehold.co/32x32.png', originDungeonId: 'archive-time-loops' },
    'key-common': { id: 'key-common', name: 'Common Key', type: 'key' as ItemCategory, rarity: 'common' as ItemRarity, description: 'Opens simple locks.', effects: [], usageType: 'passive' as ItemUsageType, iconUrl: 'https://placehold.co/32x32.png'},
    'potion-minor-heal': { id: 'potion-minor-heal', name: 'Minor Healing Potion', type: 'potion' as ItemCategory, rarity: 'common' as ItemRarity, description: 'Restores a small amount of health.', effects: [{ type: 'heal', value: 25, description:"Heals target." }], usageType: 'consumable' as ItemUsageType, iconUrl: 'https://placehold.co/32x32.png'},
    'accessory-focus-charm': {id: 'accessory-focus-charm', name: 'Charm of Focus', type: 'equipment' as ItemCategory, rarity: 'uncommon' as ItemRarity, description: 'Slightly improves concentration.', effects: [{ type: 'stat_boost_int', value: 5, description:"Boosts INT." }], usageType: 'passive' as ItemUsageType, iconUrl: 'https://placehold.co/32x32.png'},
    'mark_of_sovereignty': {id: 'mark_of_sovereignty', name: 'Mark of Sovereignty', type: 'artifact' as ItemCategory, rarity: 'legendary' as ItemRarity, description: 'A symbol of self-mastery.', effects: [{type: 'all_stats_boost', value: 5, description:"Boosts all stats."}], usageType: 'passive' as ItemUsageType, iconUrl: 'https://placehold.co/32x32.png'}
};
Object.freeze(chronicleItems);

const defaultStats: EntityStats = { health: 50, maxHealth: 50, mana: 20, maxMana: 20, speed: 10, strength: 10, intelligence: 15, wisdom: 10, adaptability: 5, elementalResistances: [], elementalWeaknesses: [] };

export const allEnemies: Record<string, Enemy> = {
    ...(Object.values(SPECTER_TYPES_DATA).reduce((acc, specterDef: any) => {
        const specterId = specterDef.id;
        const abilities: Ability[] = (specterDef.abilities || []).map((abDef: any) => {
            const abilityId = `specter-${specterId}-${abDef.name?.toLowerCase().replace(/\s+/g, '-') || 'ability'}`;
            const newAbility : Ability = {
                id: abilityId,
                name: abDef.name || "Shadow Bolt",
                description: abDef.description || "A standard chaotic attack.",
                manaCost: abDef.manaCost || 10,
                target: abDef.target || 'single_enemy',
                epicType: abDef.epicType || 'probe',
                effectPower: abDef.effectPower || 20,
                effects: abDef.effects || [{type: 'damage', value: 20, description: 'Chaotic damage'}],
                iconUrl: `https://placehold.co/32x32.png`,
                element: 'chaos'
            };
            allSpells[abilityId] = newAbility; 
            return newAbility;
        });

        acc[specterId] = {
            id: specterId, entityId: `${specterId}-base`, name: specterDef.name, type: 'specter', description: specterDef.description,
            alignment: 'chaos',
            stats: { ...defaultStats, health: 75, maxHealth: 75, mana: 50, maxMana: 50, speed: 12, strength: 15, intelligence: 20, wisdom: 10, adaptability: 25, elementalResistances: [(specterDef.strength || 'law') as string], elementalWeaknesses: [(specterDef.weakness || 'neutral') as string]},
            abilities: abilities, 
            avatarUrl: `https://placehold.co/48x48.png`,
            specterType: specterDef.id.replace('-specter',''),
            collapseCondition: specterDef.collapseCondition,
            recruitCondition: specterDef.recruitCondition
        };
        return acc;
    }, {} as Record<string, Enemy>)),
     'construct-logic-sentry': { 
        id: 'construct-logic-sentry', 
        entityId: 'construct-logic-sentry-base', 
        name: 'Logic Sentry', type: 'construct', 
        description: 'A vigilant construct guarding logical purity.', 
        alignment: 'law', 
        stats: {...defaultStats, elementalResistances: ['thinking'], elementalWeaknesses: ['chronology']}, 
        abilities: Object.values(allSpells).filter(s => s.moduleReference?.moduleId === 'thinking').slice(0,2), 
        avatarUrl: 'https://placehold.co/48x48.png', 
        constructType: 'sentinel', primaryFunction: 'Guard logical purity' 
    },
    'cognitive-mite': {
        id: 'cognitive-mite', entityId: 'cognitive-mite-base', name: 'Cognitive Mite', type: 'specter',
        description: 'A tiny, annoying specter that causes minor confusion.', alignment: 'chaos',
        stats: { ...defaultStats, health: 30, maxHealth: 30, strength: 5, intelligence: 5, speed: 15, elementalWeaknesses: ['law'] },
        abilities: [allSpells['spell-sovereign-core-recursive_sovereignty-explain'] || allSpells[Object.keys(allSpells)[0]] ], 
        avatarUrl: 'https://placehold.co/48x48.png',
        specterType: 'confusion_mite', collapseCondition: 'Answering a simple logic question.',
    },
    'logic-imp': {
        id: 'logic-imp', entityId: 'logic-imp-base', name: 'Logic Imp', type: 'specter',
        description: 'A mischievous creature that tries to trip up your reasoning.', alignment: 'chaos',
        stats: { ...defaultStats, health: 50, maxHealth: 50, intelligence: 20, speed: 12, elementalWeaknesses: ['neutral'] },
        abilities: Object.values(allSpells).filter(s => s.moduleReference?.moduleId === 'thinking').slice(0,1), 
        avatarUrl: 'https://placehold.co/48x48.png',
        specterType: 'fallacy_peddler', collapseCondition: 'Identifying its logical fallacy.',
    },
    'dogma-golem': {
        id: 'dogma-golem', entityId: 'dogma-golem-base', name: 'Dogma Golem', type: 'construct',
        description: 'A heavily armored construct that rigidly adheres to its programmed doctrines.', alignment: 'law',
        stats: { ...defaultStats, health: 120, maxHealth: 120, strength: 25, intelligence: 5, speed: 5, elementalResistances: ['law', 'neutral'], elementalWeaknesses: ['chaos'] },
        abilities: [
            allSpells['spell-sovereign-core-axiomatic_frame-explain'] || allSpells[Object.keys(allSpells)[0]],
            allSpells['spell-thinking-think-d1-n1-explain'] || allSpells[Object.keys(allSpells)[1]]
        ],
        avatarUrl: 'https://placehold.co/64x64.png',
        constructType: 'enforcer', primaryFunction: 'Uphold established axioms without question.'
    }
};

const moduleGuardianDialogues: Record<string, {dialogue: Guardian['dialogue']}> = {
    'sovereign-core': { dialogue: { greeting: "The Sovereign must first master their own domain. Enter, and discover which principles truly govern your mind.", victory: "You have demonstrated sovereignty not through perfect choices, but through conscious governance of your own domain.", defeat: "Until you can govern yourself according to coherent principles, you cannot claim true sovereignty." }},
    'chronology': { dialogue: { greeting: "Time is not a line but a tapestry. Those who cannot perceive patterns across moments remain trapped within them.", victory: "You have navigated the currents of time. The sequence is clear.", defeat: "The echoes of the past still cloud your future sight." }},
    'thinking': { dialogue: { greeting: "Logic is not merely a tool, but the very architecture of reliable thought. Show me how you build your paths.", victory: "Your reasoning is sound. The structure holds.", defeat: "Your inferences falter. Re-examine your premises." }},
    'mechanics': { dialogue: { greeting: "The universe writes its rules clearly, for those who know how to observe. Demonstrate your understanding.", victory: "You have grasped the fundamental forces. The mechanics are clear.", defeat: "The machinery of the cosmos eludes your understanding. Observe more closely." }},
    'communication': { dialogue: { greeting: "In the realm of minds, connection is built through signals that bridge the gap between separate realities. Can you make yourself understood?", victory: "Your message resonates. The connection is forged.", defeat: "Your signals are lost in noise. Refine your expression." }},
    'synthetic-systems': { dialogue: { greeting: "Systems speak their own language, telling stories of emergence that only systems thinkers can read. Show me you can read it.", victory: "You see the whole and its parts. The design is elegant.", defeat: "The complexity of the whole eludes your grasp. Seek the connections." }},
};


const enhanceDungeonWithLore = async ( 
    dungeonData: Omit<Dungeon, 'floors' | 'sacredCircuitPhases' | 'environment' | 'guardian' | 'difficultyLevel' | 'affinityTags' | 'moduleId'> & {
        difficulty: number;
        affinityTags?: string[];
        environment?: Partial<EnvironmentDescription>;
        guardian?: Partial<Guardian>; 
    },
    moduleData: Module
): Promise<Dungeon> => { 
    const guardianCharacter = dungeonData.guardian?.characterId ? await getCharacterById(dungeonData.guardian.characterId) : null;

    const guardianAbilitiesPromises = (dungeonData.guardian?.abilities || []).map(async ab => {
        if (typeof ab === 'string') return await getSpellById(ab);
        if (ab && typeof ab === 'object' && 'id' in ab) {
            const spellDetails = await getSpellById(ab.id);
            return spellDetails ? { ...ab, ...spellDetails } : ab;
        }
        return null;
    });
    const resolvedGuardianAbilities = (await Promise.all(guardianAbilitiesPromises)).filter(Boolean) as Ability[];


    const guardianDetails: Guardian | undefined = dungeonData.guardian ? {
        name: guardianCharacter?.name || dungeonData.guardian.name || "Mysterious Guardian",
        description: guardianCharacter?.description || dungeonData.guardian.description || "A powerful entity.",
        alignment: guardianCharacter?.alignment || (dungeonData.guardian.alignment as 'law' | 'neutral' | 'chaos') || "neutral",
        dialogue: moduleGuardianDialogues[moduleData.id]?.dialogue || { greeting: "...", victory: "...", defeat: "..." },
        abilities: resolvedGuardianAbilities, 
        moduleReference: dungeonData.guardian.moduleReference || { moduleId: moduleData.id },
        entityId: dungeonData.guardian.entityId || `${dungeonData.id}-guardian-enemy-form`,
        stats: dungeonData.guardian.stats || defaultStats,
        characterId: guardianCharacter?.id, 
    } : undefined;

    const floorsPromises = (SACRED_CIRCUIT_STRUCTURE_EXPORT as SacredCircuitPhase[]).map(async (phaseInfo, index) => {
        const floorLevel = index + 1;
        return await createProceduralFloor(floorLevel, 10 + floorLevel, 10 + floorLevel, dungeonData.id, guardianDetails);
    });
    const floors: Floor[] = await Promise.all(floorsPromises).then(results => results.filter(f => f.map.length > 0));


    if (guardianDetails && dungeonData.id !== 'dungeon-infinite-echoes') {
        const finalFloor = floors.find(f => f.level === SACRED_CIRCUIT_STRUCTURE_EXPORT.length);
        const bossEncounterDef = finalFloor?.encounters.find(encDef => encDef.type === 'boss' && encDef.entityId === guardianDetails.entityId);

        if (bossEncounterDef) {
            if (!allEncounterDefinitions[bossEncounterDef.id]) { 
                allEncounterDefinitions[bossEncounterDef.id] = { 
                    ...bossEncounterDef,
                    title: guardianDetails.name,
                    description: guardianDetails.description,
                    rewards: dungeonData.reward ? {
                        items: dungeonData.reward.artifact ? [dungeonData.reward.artifact] : [],
                        companion: dungeonData.reward.companion,
                        experience: 1000, 
                        memoryStrengthBonus: dungeonData.reward.memoryStrengthBonus
                    } : undefined,
                };
            }

            const guardianEnemyId = guardianDetails.entityId!;
            if (!allEnemies[guardianEnemyId]) {
                const enemyStats: EntityStats = {
                    health: guardianDetails.stats?.health ?? (150 + (finalFloor?.level || 1) * 10),
                    maxHealth: guardianDetails.stats?.maxHealth ?? (150 + (finalFloor?.level || 1) * 10),
                    mana: guardianDetails.stats?.mana ?? (75 + (finalFloor?.level || 1) * 5),
                    maxMana: guardianDetails.stats?.maxMana ?? (75 + (finalFloor?.level || 1) * 5),
                    speed: guardianDetails.stats?.speed ?? (10 + (finalFloor?.level || 1)),
                    strength: guardianDetails.stats?.strength ?? 20,
                    intelligence: guardianDetails.stats?.intelligence ?? 25,
                    wisdom: guardianDetails.stats?.wisdom ?? 20,
                    adaptability: guardianDetails.stats?.adaptability ?? 15,
                    elementalWeaknesses: guardianDetails.stats?.elementalWeaknesses ?? [],
                    elementalResistances: guardianDetails.stats?.elementalResistances ?? [moduleData.id],
                };
                const guardianEntityType = guardianDetails.alignment === "law" ? 'construct' : guardianDetails.alignment === "chaos" ? 'specter' : 'archetype';
                allEnemies[guardianEnemyId] = {
                    id: guardianEnemyId, entityId: guardianDetails.entityId || `${dungeonData.id}-guardian-base`, name: guardianDetails.name, type: guardianEntityType as CoreEntityType,
                    description: guardianDetails.description,
                    alignment: guardianDetails.alignment,
                    stats: enemyStats,
                    abilities: guardianDetails.abilities, 
                    avatarUrl: `https://placehold.co/64x64.png`,
                    ...(guardianEntityType === 'construct' && { constructType: 'guardian', primaryFunction: 'Guard' } as Partial<Construct>),
                    ...(guardianEntityType === 'specter' && { specterType: 'guardian_specter', collapseCondition: 'Defeat' } as Partial<Specter>),
                    ...(guardianEntityType === 'archetype' && { archetypePattern: 'guardian_archetype', domainInfluence: [] } as Partial<Archetype>),
                };
            }
        }
    }

    const fullEnvironment: EnvironmentDescription = {
        description: dungeonData.environment?.description || "A mysterious and challenging place.",
        visualTheme: dungeonData.environment?.visualTheme || "default_theme",
        ambientSound: dungeonData.environment?.ambientSound || "default_sound",
        colorPalette: dungeonData.environment?.colorPalette || "default_palette",
    };

    return {
        ...dungeonData,
        difficultyLevel: dungeonData.difficulty,
        affinityTags: dungeonData.affinityTags || moduleData.tags || [],
        environment: fullEnvironment,
        guardian: guardianDetails,
        moduleId: moduleData.id,
        name: dungeonData.name || `Challenge: ${moduleData.recommendedChronicleDungeon || moduleData.title}`,
        description: dungeonData.description || `A trial reflecting principles from the ${moduleData.title} module.`,
        requiredModules: dungeonData.requiredModules || [moduleData.id],
        floors,
        sacredCircuitPhases: SACRED_CIRCUIT_STRUCTURE_EXPORT as SacredCircuitPhase[],
    };
};


export const getAvailableDungeons = async (): Promise<Dungeon[]> => {
    if (!dungeonsDataInitializedPromise) {
        await initializeDungeonsData(); // Ensure data is loaded if not already
    }
    return JSON.parse(JSON.stringify(availableDungeonsData || []));
};

export const getDungeonById = async (id: string): Promise<Dungeon | undefined> => {
    if (!dungeonsDataInitializedPromise) {
        await initializeDungeonsData(); // Ensure data is loaded
    }
    const foundModule = (availableDungeonsData || []).find(d => d.id === id);
    return foundModule ? JSON.parse(JSON.stringify(foundModule)) : undefined;
};

export const getItemById = async (id: string): Promise<Item | undefined> => { 
    return chronicleItems[id] ? JSON.parse(JSON.stringify(chronicleItems[id])) : undefined;
}

export const getSpellbookById = async (id: string): Promise<Spellbook | undefined> => {
    await initializeSpellbookAndSpellData();
    return spellbooksData[id] ? JSON.parse(JSON.stringify(spellbooksData[id])) : undefined;
}

export const getSpellById = async (id: string): Promise<Ability | undefined> => {
    await initializeSpellbookAndSpellData();
    return allSpells[id] ? JSON.parse(JSON.stringify(allSpells[id])) : undefined;
};

export const getEnemyById = async (id: string): Promise<Enemy | undefined> => {
    await initializeSpellbookAndSpellData(); 
    const enemy = allEnemies[id];
    if (!enemy) return undefined;
    const enemyStats: EntityStats = enemy.stats ? 
        { ...defaultStats, ...enemy.stats, health: (enemy.stats as ChronicleEntityStats).maxHealth || defaultStats.maxHealth, mana: (enemy.stats as ChronicleEntityStats).maxMana || defaultStats.maxMana } 
        : { ...defaultStats };

    const resolvedAbilitiesPromises = (Array.isArray(enemy.abilities) ? enemy.abilities : []).map(async abIdOrObj => {
        const abilityId = typeof abIdOrObj === 'string' ? abIdOrObj : (abIdOrObj as Ability)?.id;
        if (!abilityId) return null;
        const spellDetails = await getSpellById(abilityId); 
        return spellDetails ? { ...(typeof abIdOrObj === 'object' ? abIdOrObj : {}), ...spellDetails } : (typeof abIdOrObj === 'object' ? abIdOrObj : null);
    });
    const abilities = (await Promise.all(resolvedAbilitiesPromises)).filter(Boolean) as Ability[];
    return JSON.parse(JSON.stringify({...enemy, stats: enemyStats, abilities}));
};


export const getEncounterById = async (id: string): Promise<EncounterDefinition | undefined> => {
    await initializeSpellbookAndSpellData(); 
    const encounter = allEncounterDefinitions[id]; 
    if (!encounter) {
        const randomTypeKeys = Object.keys(ENTITY_DEFINITIONS_EXPORT) as CoreEntityType[];
        const randomEntityType = randomTypeKeys[Math.floor(Math.random() * randomTypeKeys.length)];
        
        const mockEncounter: EncounterDefinition = {
            id: id,
            type: 'battle', 
            entityType: randomEntityType,
            entityId: `${randomEntityType}-mock-${Date.now()}`,
            difficulty: 3, 
            moduleReference: { moduleId: 'sovereign-core', nodeIds:[]}, 
            completed: false,
            title: `Missing Encounter: ${id}`,
            description: "This encounter definition was not found and has been mocked."
        };
        console.warn(`Encounter with ID ${id} not found. Using mocked encounter.`);
        allEncounterDefinitions[id] = mockEncounter; 
        return JSON.parse(JSON.stringify(mockEncounter));
    }
    return JSON.parse(JSON.stringify({ ...encounter, entityType: encounter.entityType as CoreEntityType }));
};


export const generateNextInfiniteFloorInternal = async (currentFloorNumber: number, dungeonId: string): Promise<Floor> => { 
    const newWidth = 15 + Math.floor(currentFloorNumber / 2);
    const newHeight = 15 + Math.floor(currentFloorNumber / 2);
    return await createProceduralFloor(currentFloorNumber + 1, newWidth, newHeight, dungeonId); 
};

// Re-exporting with the alias used elsewhere, if original function is not exported directly
export const chronicleGenerateEPICChallenge = (
  epicType: 'explain' | 'probe' | 'implement' | 'connect',
  nodeId: string,
  difficulty: number,
  nodeContext?: Partial<NeuroNode>
): ChronicleEPICChallenge => {
  const prompts = {
    explain: {
      easy: `Explain the basic concept of ${nodeContext?.title || `node ${nodeId}`}.`,
      medium: `Explain how ${nodeContext?.title || `node ${nodeId}`} works in practice, with an example.`,
      hard: `Explain the underlying principles of ${nodeContext?.title || `node ${nodeId}`} and its relationship to broader frameworks.`
    },
    probe: {
      easy: `What might be a limitation of ${nodeContext?.title || `node ${nodeId}`}?`,
      medium: `How might ${nodeContext?.title || `node ${nodeId}`} be challenged or contradicted in certain contexts?`,
      hard: `What foundational assumptions does ${nodeContext?.title || `node ${nodeId}`} rest upon, and how might questioning them affect its validity?`
    },
    implement: {
      easy: `Describe a simple application of ${nodeContext?.title || `node ${nodeId}`}.`,
      medium: `Design a specific implementation of ${nodeContext?.title || `node ${nodeId}`} that addresses ${nodeContext?.learningObjective || 'a relevant challenge'}.`,
      hard: `Create a comprehensive strategy that applies ${nodeContext?.title || `node ${nodeId}`} to solve a complex problem with multiple constraints.`
    },
    connect: {
      easy: `How does ${nodeContext?.title || `node ${nodeId}`} relate to [another concept from its domain]?`,
      medium: `Compare and contrast ${nodeContext?.title || `node ${nodeId}`} with [related concept from another module], identifying similarities and differences.`,
      hard: `Synthesize ${nodeContext?.title || `node ${nodeId}`} with concepts from different NeuroOS pillars to create an integrated framework.`
    }
  };
  
  let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
  if (difficulty < 3) difficultyLevel = 'easy';
  if (difficulty > 5) difficultyLevel = 'hard';
  
  return {
    type: epicType,
    prompt: prompts[epicType][difficultyLevel].replace(`[node concept: ${nodeId}]`, `the concept related to node ${nodeId}`),
    referenceNodeId: nodeId,
    keywords: nodeContext?.keyTerms || ['example', 'keywords', 'for', 'evaluation', nodeId],
    difficulty: difficulty,
  };
};
export { chronicleGenerateEPICChallenge as generateEPICChallenge };

    