
'use client';
import type {
    Dungeon, EncounterDefinition, ChronicleRunState, PlayerState as ChroniclePlayerState, Coordinates, Spellbook, Item as ChronicleItemType, Quest, QuestObjective, BattleState, BattleParticipant, Ability as ChronicleAbility, Enemy, TileType, Floor, CoreEntityType, BattleRewards, BattleActionRequest, EPICChallenge as ChronicleEPICChallenge, EPICResponse as ChronicleEPICResponse, Item, Companion, Specter, Construct, Archetype, EntityStats as ChronicleEntityStats, Position, EffectType, EntityAlignment
} from '@/types/chronicle';
import type { Module, Node, UserLearningState } from '@/types/neuro'; // Removed PlayerCharacterBase as it's from chronicle
import { 
    getDungeonById, getItemById, getSpellbookById, getEncounterById, allEncounterDefinitions,
    chronicleItems as allChronicleItems, spellbooksData, getSpellById, getEnemyById,
    generateNextInfiniteFloorInternal, // Corrected: Import the actual exported name
    ENTITY_DEFINITIONS_EXPORT as ENTITY_DEFINITIONS, 
    SPECTER_TYPES_DATA_EXPORT as SPECTER_TYPES, 
    SACRED_CIRCUIT_STRUCTURE_EXPORT as SACRED_CIRCUIT_STRUCTURE, 
    RESPONSE_QUALITY_EFFECTS_EXPORT as RESPONSE_QUALITY_EFFECTS,
    generateEPICChallenge as chronicleGenerateEPICChallenge, 
    allSpells, 
    initializeSpellbookAndSpellData, 
    initializeDungeonsData, 
} from './chronicle-data';
import { getAllModules, getModuleById as getNeuroModuleById } from './predefined-modules';
import type { ToastProps } from '@/components/ui/toast';
import { getCharacterById } from '@/lib/server/characters';
import _ from 'lodash';
import type { PlayerCharacterBase } from '@/types/neuro';


const CHRONICLE_RUN_KEY = 'currentChronicleRun_NeuroOS_v2_INTERNAL_0_1_0';
const PLAYER_BASE_KEY = 'neuroPlayerCharacterBase_NeuroOS_v2_INTERNAL_0_1_0';
const LOCAL_STORAGE_KEY = 'neuroosV2LearningState_v0_1_3'; // Main app state


const generateId = (): string => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const getPlayerStateBaseInternal = async (): Promise<PlayerCharacterBase> => {
    // Ensure spellbooks are loaded if they haven't been. This can happen if this function is called
    // before the main chronicle data initialization.
    if (Object.keys(spellbooksData).length === 0) {
        await initializeSpellbookAndSpellData(); // Ensure spellbooks are loaded
    }
    const defaultSovereignSpellbookId = 'spellbook-sovereign-core';
    let defaultSpellbooks: Spellbook[] = [];
    
    const sovereignSb = spellbooksData[defaultSovereignSpellbookId];

    if (sovereignSb) {
        defaultSpellbooks.push(sovereignSb);
    } else if (Object.keys(spellbooksData).length > 0) {
        console.warn(`Default spellbook ${defaultSovereignSpellbookId} not found. Using first available.`);
        defaultSpellbooks.push(Object.values(spellbooksData)[0]);
    } else {
        console.warn("No spellbooks available in spellbooksData. Player will start with no spellbooks.");
    }

    const defaultPlayerBase: PlayerCharacterBase = {
        id: 'player', name: 'Sovereign',
        maxHealth: 100, maxMana: 50, speed: 10,
        strength: 10, intelligence: 15, wisdom: 10, adaptability: 10,
        elementalWeaknesses: [], elementalResistances: [],
        spellbooks: defaultSpellbooks, 
        equippedSpellbookId: defaultSpellbooks[0]?.id || null,
        inventory: [],
        party: [],
         stats: { 
            health: 100, maxHealth: 100,
            mana: 50, maxMana: 50,
            strength: 10, intelligence: 15, wisdom: 10, adaptability: 5, speed: 10,
            elementalWeaknesses: [], elementalResistances: []
        }
    };

    if (typeof window === 'undefined') {
         return defaultPlayerBase;
    }
    const saved = localStorage.getItem(PLAYER_BASE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved) as Partial<PlayerCharacterBase>;
            const finalPlayerBase = { ...defaultPlayerBase, ...parsed };

            const rehydratedSpellbooks = await Promise.all(
                (Array.isArray(parsed.spellbooks) ? parsed.spellbooks : defaultPlayerBase.spellbooks).map(async (sbStub: Partial<Spellbook>) => {
                    if (sbStub.id) {
                        const fullSbData = await getSpellbookById(sbStub.id); 
                        if (fullSbData) {
                            const fullSb = JSON.parse(JSON.stringify(fullSbData)) as Spellbook; 
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
                                        return spellDetails ? { ...baseAbilityObject, ...spellDetails } : null;
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
            
            finalPlayerBase.spellbooks = rehydratedSpellbooks.length > 0 ? rehydratedSpellbooks : defaultPlayerBase.spellbooks;
            if (!finalPlayerBase.spellbooks.some(sb => sb.id === finalPlayerBase.equippedSpellbookId)) {
                finalPlayerBase.equippedSpellbookId = finalPlayerBase.spellbooks[0]?.id || null;
            }
            finalPlayerBase.inventory = (Array.isArray(parsed.inventory) ? parsed.inventory : defaultPlayerBase.inventory) as Item[];
            finalPlayerBase.party = (Array.isArray(parsed.party) ? parsed.party : defaultPlayerBase.party) as Companion[];
            finalPlayerBase.stats = { ...defaultPlayerBase.stats, ...(parsed.stats || {}) } as ChronicleEntityStats;
            
            return finalPlayerBase;

        } catch (e) {
            console.error("Error parsing player base from localStorage:", e);
            localStorage.removeItem(PLAYER_BASE_KEY);
            return defaultPlayerBase;
        }
    }
    return defaultPlayerBase;
};

export const savePlayerStateBaseInternal = (playerState: PlayerCharacterBase) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(PLAYER_BASE_KEY, JSON.stringify(playerState));
    }
};

export const chronicleGetCurrentRun = (): ChronicleRunState | null => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(CHRONICLE_RUN_KEY);
    if (!saved) return null;
    try {
        const run = JSON.parse(saved) as ChronicleRunState;
         if (run && run.playerState && typeof run.playerState.stats === 'object' && run.currentDungeon && Array.isArray(run.currentDungeon.floors)) {
            // Ensure stats object is fully populated even if some fields were missing in storage
            const defaultStatsData = { health: 100, maxHealth: 100, mana: 50, maxMana: 50, strength: 10, intelligence: 15, wisdom: 10, adaptability: 5, speed: 10, elementalWeaknesses: [], elementalResistances: [] };
            run.playerState.stats = { ...defaultStatsData, ...(run.playerState.stats || {}) };
             if (!Array.isArray(run.playerState.abilities)) run.playerState.abilities = [];
             if (!Array.isArray(run.playerState.inventory)) run.playerState.inventory = [];
             if (!Array.isArray(run.playerState.spellbooks)) run.playerState.spellbooks = [];
             if (!Array.isArray(run.playerState.party)) run.playerState.party = [];

            if (run.activeBattle) {
                if (!Array.isArray(run.activeBattle.playerParty)) run.activeBattle.playerParty = [];
                if (!Array.isArray(run.activeBattle.enemyParty)) run.activeBattle.enemyParty = [];
                if (!Array.isArray(run.activeBattle.participants)) run.activeBattle.participants = [];
                 run.activeBattle.participants.forEach((p: BattleParticipant) => { 
                    if (!p.stats) p.stats = { ...defaultStatsData, health: (p as any).maxHealth || defaultStatsData.maxHealth, mana: (p as any).maxMana || defaultStatsData.maxMana }; 
                    if (!Array.isArray(p.abilities)) p.abilities = [];
                });
            }
            console.log("chronicleGetCurrentRun: Successfully loaded run from dedicated key:", run.id);
            return run;
        }
        console.warn("chronicleGetCurrentRun: Loaded chronicle run from dedicated key is missing critical data, discarding.");
        localStorage.removeItem(CHRONICLE_RUN_KEY);
        return null;

    } catch (error) {
        console.error("chronicleGetCurrentRun: Error parsing chronicle run from dedicated key:", error);
        localStorage.removeItem(CHRONICLE_RUN_KEY);
        return null;
    }
};


export const chronicleSaveCurrentRun = (runState: ChronicleRunState | null) => {
    if (typeof window !== 'undefined') {
        if (runState) {
            console.log("chronicleSaveCurrentRun: Saving run to dedicated key:", runState.id);
            localStorage.setItem(CHRONICLE_RUN_KEY, JSON.stringify(runState));
        } else {
            console.log("chronicleSaveCurrentRun: Active run is null, removing dedicated key.");
            localStorage.removeItem(CHRONICLE_RUN_KEY);
        }
    }
};

export const discoverMapAround = (runState: ChronicleRunState, position: Coordinates): ChronicleRunState => {
    const run = _.cloneDeep(runState);
    const { currentFloor, playerPosition, currentDungeon, discoveredMap } = run;

    if (!currentDungeon || !currentDungeon.floors) {
        console.error("discoverMapAround: Dungeon or floors not found in run state.");
        return run;
    }
    const floor = currentDungeon.floors.find(f => f.level === currentFloor);

    if (!floor || !floor.map || !floor.dimensions) {
        console.error(`discoverMapAround: Map data for floor ${currentFloor} is missing or malformed.`);
        return run;
    }
    
    if (!discoveredMap[currentFloor] || 
        discoveredMap[currentFloor].length !== floor.dimensions.height || 
        (floor.dimensions.width > 0 && discoveredMap[currentFloor][0]?.length !== floor.dimensions.width)) {
        // Initialize if malformed or missing for this floor
        console.log(`discoverMapAround: Initializing discoveredMap for floor ${currentFloor} with dimensions H:${floor.dimensions.height}, W:${floor.dimensions.width}`);
        run.discoveredMap[currentFloor] = Array(floor.dimensions.height).fill(null).map(() => Array(floor.dimensions.width).fill(false));
    }
    
    const { x, y } = position;
    const visionRange = 2; // Define vision range

    for (let i = Math.max(0, y - visionRange); i <= Math.min(floor.dimensions.height - 1, y + visionRange); i++) {
        for (let j = Math.max(0, x - visionRange); j <= Math.min(floor.dimensions.width - 1, x + visionRange); j++) {
            if (run.discoveredMap[currentFloor]?.[i]?.[j] !== undefined && Math.max(Math.abs(x - j), Math.abs(y - i)) <= visionRange) {
                run.discoveredMap[currentFloor][i][j] = true;
            }
        }
    }
    return run;
};


export const startDungeonRun = async (
    dungeonId: string, 
    allUserModules: Record<string, Module | UserLearningState['modules'][string]>,
    playerBaseInput: PlayerCharacterBase,
    hasAnyInstalledModules: boolean
): Promise<ChronicleRunState | string> => {
    console.log(`startDungeonRun: Attempting to start dungeon ${dungeonId}. Has installed modules: ${hasAnyInstalledModules}`);
    const dungeon = await getDungeonById(dungeonId); 
    
    if (!dungeon) return "Dungeon not found.";
    console.log(`startDungeonRun: Dungeon ${dungeon.name} found.`);

    if (dungeon.type === 'challenge' && dungeon.requiredModules.some(modId => {
        const module = allUserModules[modId] as Module;
        return !module || module.status !== 'installed';
    })) {
        const missingModules = dungeon.requiredModules.filter(modId => {
            const module = allUserModules[modId] as Module;
            return !module || module.status !== 'installed';
        });
        if (missingModules.length > 0) {
            return `Missing required modules: ${missingModules.map(id => (allUserModules[id] as Module)?.title || id).join(', ')}`;
        }
    }
    
    if (dungeon.id === 'dungeon-infinite-echoes' && !hasAnyInstalledModules) {
         return "Infinite Echoes requires at least one installed module.";
    }

    const firstFloor = dungeon.floors.find(f => f.level === 1);
    if (!firstFloor || !firstFloor.entryPosition) return "Dungeon has no starting floor or entry position.";

    const playerBase = {
        ...playerBaseInput,
        spellbooks: Array.isArray(playerBaseInput.spellbooks) ? playerBaseInput.spellbooks : [],
    };
    
    const equippedSpellbook = playerBase.spellbooks.find(sb => sb.id === playerBase.equippedSpellbookId);
    
    const abilities = equippedSpellbook && Array.isArray(equippedSpellbook.abilities)
        ? await Promise.all(equippedSpellbook.abilities.map(async ab => {
            if (typeof ab === 'string') return await getSpellById(ab);
            if (ab && typeof ab === 'object' && ab.id) {
                 const spellDetail = await getSpellById(ab.id);
                 return spellDetail ? { ...ab, ...spellDetail } : ab; 
            }
            return null;
          })).then(res => res.filter(Boolean) as ChronicleAbility[])
        : [];

    const initialPlayerState: ChroniclePlayerState = {
        ...(playerBase as PlayerCharacterBase),
        id: playerBase.id || 'player', 
        name: playerBase.name || 'Sovereign',
        type: 'companion', 
        isPlayer: true,
        alignment: 'neutral', 
        description: 'The Sovereign of this NeuroOS instance.',
        stats: {
            health: playerBase.maxHealth, maxHealth: playerBase.maxHealth,
            mana: playerBase.maxMana, maxMana: playerBase.maxMana,
            speed: playerBase.speed, 
            strength: playerBase.strength || 10, 
            intelligence: playerBase.intelligence || 15, 
            wisdom: playerBase.wisdom || 10, 
            adaptability: playerBase.adaptability || 5, 
            elementalWeaknesses: playerBase.elementalWeaknesses || [],
            elementalResistances: playerBase.elementalResistances || [],
        },
        abilities: abilities,
        currentHealth: playerBase.maxHealth, 
        currentMana: playerBase.maxMana,  
        coordinates: firstFloor.entryPosition, 
        currentFloor: 1,                   
        party: Array.isArray(playerBase.party) ? playerBase.party : [], 
        activeQuests: [],
        completedQuests: [],
        statusEffects: [],
    };

    let newRun: ChronicleRunState = {
        id: generateId(),
        userId: 'localUser',
        dungeonId,
        status: 'active',
        currentFloor: 1,
        playerPosition: initialPlayerState.coordinates, 
        discoveredMap: {}, 
        playerState: initialPlayerState,
        inventory: Array.isArray(playerBase.inventory) ? [...playerBase.inventory] : [],
        companions: [],
        party: Array.isArray(playerBase.party) ? [...playerBase.party] : [], 
        spellbooks: Array.isArray(playerBase.spellbooks) ? [...playerBase.spellbooks] : [], 
        completedEncounters: [],
        activeQuests: [],
        startedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        currentEncounter: null,
        activeBattle: null,
        currentDungeon: JSON.parse(JSON.stringify(dungeon)) 
    };
    
    if (newRun.currentDungeon) {
        newRun.currentDungeon.floors.forEach(floor => {
            if (floor.dimensions && floor.map && (!newRun.discoveredMap || !newRun.discoveredMap[floor.level])) { 
                newRun.discoveredMap[floor.level] = Array(floor.dimensions.height).fill(null).map(() => Array(floor.dimensions.width).fill(false));
            }
        });
    }

    newRun = discoverMapAround(newRun, newRun.playerPosition); 
    chronicleSaveCurrentRun(newRun);
    console.log(`startDungeonRun: Saved new run ${newRun.id} to dedicated key.`);
    return newRun;
};


export const movePlayer = async (activeRunState: ChronicleRunState, direction: 'up' | 'down' | 'left' | 'right'): Promise<{ updatedRunState: ChronicleRunState | null, toast?: ToastProps, endRun?: {didWin: boolean} }> => {
    let run = _.cloneDeep(activeRunState);
    if (!run) return { updatedRunState: null, toast: { title: "Error", description: "No active run.", variant: "destructive" } };

    const dungeon = run.currentDungeon; 
    if (!dungeon) return { updatedRunState: run, toast: { title: "Error", description: "Dungeon data not found in active run state.", variant: "destructive" } };

    const currentMapFloor = dungeon.floors.find(f => f.level === run.currentFloor);
    if (!currentMapFloor || !currentMapFloor.map || !currentMapFloor.dimensions) {
         return { updatedRunState: run, toast: { title: "Error", description: "Current floor data is corrupted or incomplete.", variant: "destructive" } };
    }

    let { x, y } = run.playerPosition;
    let prevX = x; let prevY = y;
    if (direction === 'up') y -= 1;
    else if (direction === 'down') y += 1;
    else if (direction === 'left') x -= 1;
    else if (direction === 'right') x += 1; 

    if (x < 0 || x >= currentMapFloor.dimensions.width || y < 0 || y >= currentMapFloor.dimensions.height || currentMapFloor.map[y]?.[x]?.type === 'wall' ) {
        return { updatedRunState: run, toast: { description: "Cannot move there: Wall or boundary.", variant: "default" } };
    }

    run.playerPosition = { x, y };
    run.playerState.coordinates = {x, y}; 
    run = discoverMapAround(run, run.playerPosition); 

    let triggeredEncounter: ChronicleEncounterDefinition | null = null;
    const currentTile = currentMapFloor.map[y]?.[x];
    const tileType = currentTile?.type;

    if (tileType === 'encounter' && currentTile.encounterId) {
        const placedEncounterDef = currentMapFloor.encounters.find(encDef => encDef.id === currentTile.encounterId);
        if (placedEncounterDef) {
            triggeredEncounter = await getEncounterById(placedEncounterDef.id) || null;
        }
    } else if (tileType === 'floor' && Math.random() < 0.1) { 
        const randomEncounterDef: ChronicleEncounterDefinition = {
            id: `random-battle-${generateId()}`,
            type: 'battle',
            entityType: 'specter', 
            entityId: 'RANDOM_ENCOUNTER_PLACEHOLDER', 
            difficulty: currentMapFloor.phaseType.difficulty,
            moduleReference: { moduleId: run.currentDungeon?.moduleId || 'sovereign-core', nodeIds: [] }, 
            completed: false,
            title: "Random Encounter",
            description: "An unexpected challenge emerges!"
        };
        triggeredEncounter = randomEncounterDef;
    } else if (tileType === 'exit' ) {
        const nextFloorLevel = run.currentFloor + 1;
        let nextFloorData = dungeon.floors.find(f => f.level === nextFloorLevel);

        if (!nextFloorData && dungeon.type === 'infinite') {
            nextFloorData = await generateNextInfiniteFloorInternal(nextFloorLevel -1, dungeon.id); 
            if (run.currentDungeon) run.currentDungeon.floors.push(nextFloorData);
        }

        if (nextFloorData && nextFloorData.entryPosition) { 
            run.currentFloor = nextFloorLevel;
            run.playerState.currentFloor = nextFloorLevel; 
            run.playerPosition = nextFloorData.entryPosition;
            run.playerState.coordinates = nextFloorData.entryPosition; 
             if (!run.discoveredMap[nextFloorLevel] && nextFloorData.dimensions) {
                 run.discoveredMap[nextFloorLevel] = Array(nextFloorData.dimensions.height).fill(null).map(() => Array(nextFloorData.dimensions.width).fill(false));
            }
            run = discoverMapAround(run, run.playerPosition); 
            chronicleSaveCurrentRun(run);
            return { updatedRunState: run, toast: { description: `Moved to Floor ${nextFloorLevel}.` } };
        } else {
            run.status = 'completed';
            run.completedAt = new Date().toISOString();
            chronicleSaveCurrentRun(run);
            return { updatedRunState: run, toast: {title: "Dungeon Cleared!", description: `You've conquered ${dungeon.name}!`}, endRun: {didWin: true} };
        }
    }  else if (tileType === 'floor_boss' && (currentTile as any).bossId) {
        const bossEncounterDef = currentMapFloor.encounters.find(encDef => encDef.id === (currentTile as any).encounterId && encDef.type === 'boss');
        if (bossEncounterDef) triggeredEncounter = await getEncounterById(bossEncounterDef.id) || null;
    }

    if (triggeredEncounter) {
        if (triggeredEncounter.type === 'battle' || triggeredEncounter.type === 'boss') {
            const battleResult = await initiateBattleInternal(triggeredEncounter, run.playerState);
            if (typeof battleResult === 'string') {
                 return { updatedRunState: run, toast: { title: "Battle Error", description: battleResult, variant: "destructive" } };
            }
            run.activeBattle = battleResult;
            run.currentEncounter = null;
        } else {
            run.currentEncounter = triggeredEncounter;
            run.activeBattle = null;
        }
    } else {
        run.currentEncounter = null;
        run.activeBattle = null;
    }

    run.lastActive = new Date().toISOString();
    chronicleSaveCurrentRun(run);
    return { updatedRunState: run };
};


export const handleTileInteraction = async (activeRunState: ChronicleRunState): Promise<{ updatedRunState: ChronicleRunState | null, updatedPlayerBase?: PlayerCharacterBase, toast?: ToastProps }> => {
    let run = _.cloneDeep(activeRunState);
    if (!run) return { updatedRunState: null, toast: { title: "Error", description: "No active run.", variant: "destructive" } };

    const dungeon = run.currentDungeon; 
    if (!dungeon) return { updatedRunState: run, toast: { title: "Error", description: "Dungeon data not found in run state.", variant: "destructive" } };

    const currentMapFloor = dungeon.floors.find(f => f.level === run.currentFloor);
    if (!currentMapFloor || !currentMapFloor.map) {
        return { updatedRunState: run, toast: { title: "Error", description: "Floor data or map not found.", variant: "destructive" } };
    }

    const { x, y } = run.playerPosition;
    const currentTile = currentMapFloor.map[y]?.[x];
    const tileType = currentTile?.type;
    let toastMessage: ToastProps | undefined;
    let updatedPlayerBaseData: PlayerCharacterBase | undefined;

    switch (tileType) {
        case 'item_cache':
            const specialRoomCache = currentMapFloor.specialRooms?.find(sr => sr.position.x === x && sr.position.y === y && sr.type === 'item_cache');
            const encounterDefCache = currentMapFloor.encounters.find(encDef => encDef.position?.x === x && encDef.position?.y === y);

            const itemIdFromCache = specialRoomCache?.id || (currentTile as any).itemId || encounterDefCache?.id?.replace('encounter-', 'item-') || encounterDefCache?.id?.replace('enc-', 'item-');

            if (itemIdFromCache) {
                const item = await chronicleGetItemByIdFromLogic(itemIdFromCache); 
                if (item) {
                    run.playerState.inventory.push(item);
                    run.inventory.push(item); 

                    const playerBase = await getPlayerStateBaseInternal(); 
                    playerBase.inventory.push(item);
                    savePlayerStateBaseInternal(playerBase);
                    updatedPlayerBaseData = playerBase;

                    if(currentMapFloor.map[y]?.[x]) {
                        (currentMapFloor.map[y][x] as ChronicleMapCell).type = 'floor'; 
                         (currentMapFloor.map[y][x] as ChronicleMapCell).encounterId = undefined; 
                         (currentMapFloor.map[y][x] as any).itemId = undefined; 
                    }
                    if (run.currentDungeon) {
                        const floorIdx = run.currentDungeon.floors.findIndex(f => f.level === run.currentFloor);
                        if (floorIdx !== -1 && run.currentDungeon.floors[floorIdx].map?.[y]?.[x]) {
                            (run.currentDungeon.floors[floorIdx].map[y][x] as ChronicleMapCell).type = 'floor';
                            (run.currentDungeon.floors[floorIdx].map[y][x] as ChronicleMapCell).encounterId = undefined;
                            (run.currentDungeon.floors[floorIdx].map[y][x] as any).itemId = undefined;
                        }
                    }
                    toastMessage = { title: "Item Found!", description: `You found a ${item.name}!` };
                } else {
                    toastMessage = { description: "The cache is empty or the item definition is missing.", variant: "default" };
                }
            } else {
                 toastMessage = { description: "An empty cache.", variant: "default" };
            }
            break;
        case 'artifact_puzzle':
            const puzzleEncounterDef = currentMapFloor.encounters.find(encDef => encDef.position?.x === x && encDef.position?.y === y && encDef.type === 'puzzle');
            if (puzzleEncounterDef) {
                run.currentEncounter = await getEncounterById(puzzleEncounterDef.id);
                toastMessage = { title: "Puzzle Found!", description: run.currentEncounter?.title || "An ancient puzzle..." };
            } else {
                toastMessage = { description: "A strange mechanism, but nothing happens."};
            }
            break;
        case 'scroll': 
             const scrollEncounterDef = currentMapFloor.encounters.find(encDef => encDef.position?.x === x && encDef.position?.y === y && encDef.type === 'scroll');
            if (scrollEncounterDef) {
                run.currentEncounter = await getEncounterById(scrollEncounterDef.id);
                toastMessage = { title: "Scroll Discovered!", description: run.currentEncounter?.title || "A mysterious scroll..." };
            } else {
                toastMessage = { description: "Faded markings, but nothing legible."};
            }
            break;
        default:
            toastMessage = { description: "Nothing to interact with here.", variant: "default" };
    }

    run.lastActive = new Date().toISOString();
    chronicleSaveCurrentRun(run);
    return { updatedRunState: run, updatedPlayerBase: updatedPlayerBaseData, toast: toastMessage };
};


export const initiateBattleInternal = async (encounterDef: ChronicleEncounterDefinition, playerRunState: ChroniclePlayerState): Promise<BattleState | string> => {
    let enemies: BattleParticipant[] = [];
    const enemyIdsToLoad = encounterDef.entityIds || (encounterDef.entityId ? [encounterDef.entityId] : []);

    if (enemyIdsToLoad.length > 0 && enemyIdsToLoad[0] !== 'RANDOM_ENCOUNTER_PLACEHOLDER') {
        enemies = (await Promise.all(enemyIdsToLoad.map(async id => {
            const baseEnemy = await getEnemyById(id);
            if (!baseEnemy) return null;
            const resolvedAbilities = await Promise.all(
                (Array.isArray(baseEnemy.abilities) ? baseEnemy.abilities : []).map(async (abIdOrObj: string | ChronicleAbility) => { 
                    if (typeof abIdOrObj === 'string') return await getSpellById(abIdOrObj);
                    if (abIdOrObj && typeof abIdOrObj === 'object' && abIdOrObj.id) {
                        const spellDetails = await getSpellById(abIdOrObj.id);
                        return spellDetails ? { ...abIdOrObj, ...spellDetails } : abIdOrObj;
                    }
                    return abIdOrObj; 
                })
            );
            return {
                ...JSON.parse(JSON.stringify(baseEnemy)), 
                id: `${baseEnemy.id}-battle-${generateId()}`, 
                entityId: baseEnemy.entityId || baseEnemy.id,
                stats: { ...(baseEnemy.stats || {}), health: (baseEnemy.stats?.maxHealth || 50) , mana: (baseEnemy.stats?.maxMana || 20) },
                abilities: resolvedAbilities.filter(Boolean) as ChronicleAbility[],
                isPlayer: false,
                isAlly: false,
                maxHealth: baseEnemy.stats?.maxHealth || 50,
                maxMana: baseEnemy.stats?.maxMana || 20,  
            } as BattleParticipant;
        }))).filter(Boolean) as BattleParticipant[];
    }

    if (enemies.length === 0) {
        // Correctly use the ENTITY_DEFINITIONS from chronicle-data
        const allEnemyObjects = await Promise.all(Object.keys(ENTITY_DEFINITIONS).map(key => getEnemyById(key as CoreEntityType)));
        const availableEnemyKeys = allEnemyObjects.filter(Boolean).map(e => e!.id);


        if (availableEnemyKeys.length > 0) {
            const numEnemies = Math.min(3, Math.max(1, encounterDef.difficulty || 1)); 
            for (let i = 0; i < numEnemies; i++) {
                const randomEnemyKey = availableEnemyKeys[Math.floor(Math.random() * availableEnemyKeys.length)];
                const baseEnemy = await getEnemyById(randomEnemyKey); 
                if (baseEnemy) {
                     const resolvedAbilities = await Promise.all(
                        (Array.isArray(baseEnemy.abilities) ? baseEnemy.abilities : []).map(async (abIdOrObj: string | ChronicleAbility) => { 
                             if (typeof abIdOrObj === 'string') return await getSpellById(abIdOrObj);
                             if (abIdOrObj && typeof abIdOrObj === 'object' && 'id' in abIdOrObj) {
                                const spellDetails = await getSpellById(abIdOrObj.id);
                                return spellDetails ? { ...abIdOrObj, ...spellDetails } : abIdOrObj;
                            }
                             return abIdOrObj;
                        })
                    );
                    enemies.push({
                        ...JSON.parse(JSON.stringify(baseEnemy)), 
                        id: `${baseEnemy.id}-battle-${generateId()}`,
                        entityId: baseEnemy.entityId || baseEnemy.id,
                        stats: { ...(baseEnemy.stats || {}), health: (baseEnemy.stats?.maxHealth || 50), mana: (baseEnemy.stats?.maxMana || 20) },
                        abilities: resolvedAbilities.filter(Boolean) as ChronicleAbility[],
                        isPlayer: false,
                        isAlly: false,
                        maxHealth: baseEnemy.stats?.maxHealth || 50,
                        maxMana: baseEnemy.stats?.maxMana || 20,
                    } as BattleParticipant);
                }
            }
        }
    }
    
    const defaultStatsData: ChronicleEntityStats = { health: 50, maxHealth: 50, mana: 20, maxMana: 20, speed: 10, strength: 10, intelligence: 15, wisdom: 10, adaptability: 5, elementalResistances: [], elementalWeaknesses: [] };
    if (enemies.length === 0) {
        console.warn("No enemies generated for battle:", encounterDef.id, "Ensure allEnemies is populated.");
        enemies.push({
            id: `fallback-specter-${generateId()}`,
            entityId: 'fallback-specter',
            name: "Weak Specter",
            type: 'specter',
            description: "A lingering shred of doubt.",
            alignment: 'chaos',
            abilities: [],
            stats: defaultStatsData,
            isPlayer: false,
            isAlly: false,
            statusEffects: [],
            maxHealth: defaultStatsData.maxHealth,
            maxMana: defaultStatsData.maxMana,
        } as BattleParticipant);
    }

    const playerParticipant: BattleParticipant = {
        ...playerRunState,
        id: playerRunState.id || 'player', 
        name: playerRunState.name || 'Sovereign',
        type: 'companion', 
        alignment: playerRunState.alignment || 'neutral', 
        isPlayer: true,
        isAlly: false, 
        stats: { ...playerRunState.stats, health: playerRunState.currentHealth, mana: playerRunState.currentMana }, 
        abilities: playerRunState.abilities || [], 
        statusEffects: playerRunState.statusEffects || [],
        maxHealth: playerRunState.maxHealth,
        maxMana: playerRunState.maxMana,
    };

    const partyParticipantsPromises = (playerRunState.party || []).map(async ally => {
        const resolvedAbilities = await Promise.all(
            (Array.isArray(ally.abilities) ? ally.abilities : []).map(async (abIdOrObj: string | ChronicleAbility) => { 
                if (typeof abIdOrObj === 'string') return await getSpellById(abIdOrObj);
                if (abIdOrObj && typeof abIdOrObj === 'object' && 'id' in abIdOrObj) {
                    const spellDetails = await getSpellById(abIdOrObj.id);
                    return spellDetails ? { ...abIdOrObj, ...spellDetails } : abIdOrObj;
                }
                return abIdOrObj;
            })
        );
        return { 
            ...ally,
            id: ally.id || `ally-${generateId()}`,
            entityId: ally.entityId || ally.id,
            type: 'companion',
            alignment: ally.alignment || 'neutral',
            isPlayer: false,
            isAlly: true,
            stats: { ...(ally.stats || defaultStatsData), health: (ally.stats?.maxHealth || defaultStatsData.maxHealth), mana: (ally.stats?.maxMana || defaultStatsData.maxMana) },
            abilities: resolvedAbilities.filter(Boolean) as ChronicleAbility[],
            statusEffects: ally.statusEffects || [],
            maxHealth: ally.stats?.maxHealth || defaultStatsData.maxHealth,
            maxMana: ally.stats?.maxMana || defaultStatsData.maxMana,
        } as BattleParticipant;
    });
    const partyParticipants = await Promise.all(partyParticipantsPromises);


    const allParticipants = [playerParticipant, ...partyParticipants, ...enemies];
    allParticipants.sort((a, b) => (b.stats?.speed || 0) - (a.stats?.speed || 0)); 

    const initialDefensivePrompt = enemies.length > 0 && (enemies[0] as Enemy).dialogue?.['battle_start']
                                 ? chronicleGenerateEPICChallenge( // Using imported alias
                                        'implement', 
                                        (enemies[0] as Enemy).moduleReference?.nodeIds?.[0] || 'general_defense', 
                                        encounterDef.difficulty, 
                                        { title: "Incoming Attack", shortDefinition: "Defend yourself!", clarification: (enemies[0] as Enemy).dialogue!['battle_start'] }
                                    )
                                 : undefined;

    return {
        id: generateId(),
        encounterId: encounterDef.id,
        participants: allParticipants, 
        playerParty: [playerParticipant, ...partyParticipants], 
        enemyParty: enemies,
        turnOrder: allParticipants.map(p => p.id),
        currentTurnIndex: 0,
        currentTurnActorId: allParticipants[0]?.id || "", 
        battleLog: [`Battle started against ${enemies.map(e => e.name).join(', ')}!`, `--- ${allParticipants[0]?.name || 'Unknown'}'s turn ---`],
        isPlayerTurn: !!(allParticipants[0]?.isPlayer || allParticipants[0]?.isAlly), 
        status: 'ongoing', 
        currentPrompt: initialDefensivePrompt,
        defendingPlayerId: undefined,
    } as BattleState; 
};


export const processBattleAction = async (
    activeRunState: ChronicleRunState, 
    action: BattleActionRequest, 
    cognitiveScore: number
): Promise<{updatedRunState: ChronicleRunState, battleEnded: boolean, playerWon: boolean, rewards?: BattleRewards, toast?: ToastProps}> => {
    let run = _.cloneDeep(activeRunState); 
    if (!run || !run.activeBattle) throw new Error("No active battle.");

    const battle = run.activeBattle;
    const actor = battle.participants.find(p => p.id === battle.currentTurnActorId); 
    if (!actor) throw new Error("Current actor not found.");

    let actionSuccess = true;
    let damageModifier = 1.0;
    let toast: ToastProps | undefined;

    const responseQualityEffect =
        cognitiveScore >= 95 ? RESPONSE_QUALITY_EFFECTS.PERFECT :
        cognitiveScore >= 80 ? RESPONSE_QUALITY_EFFECTS.STRONG :
        cognitiveScore >= 60 ? RESPONSE_QUALITY_EFFECTS.ADEQUATE :
        cognitiveScore >= 40 ? RESPONSE_QUALITY_EFFECTS.POOR :
        RESPONSE_QUALITY_EFFECTS.FAILED;

    if (actor.isPlayer || actor.isAlly) {
        damageModifier = responseQualityEffect.damageMultiplier;
        actionSuccess = damageModifier >= 0; 
        battle.battleLog.push(responseQualityEffect.message);
        toast = { title: responseQualityEffect.name, description: responseQualityEffect.message, variant: actionSuccess ? "default" : "destructive" };
    }
    
    actor.statusEffects = actor.statusEffects || [];
    const newStatusEffectsActor: Effect[] = [];
    let turnSkipped = false;

    for (const effect of actor.statusEffects) {
        let effectStillActive = true;
        switch (effect.type) {
            case 'poison':
            case 'burn':
                const dotDamage = Math.max(1, Math.floor(((actor as any).maxHealth || 50) * (effect.value / 100)));
                actor.stats.health = Math.max(0, actor.stats.health - dotDamage);
                battle.battleLog.push(`${actor.name} takes ${dotDamage} damage from ${effect.type}. HP: ${actor.stats.health}/${(actor as any).maxHealth}`);
                break;
            case 'sleep':
            case 'paralysis':
            case 'frozen':
                 if (Math.random() < (effect.value / 100)) { 
                    battle.battleLog.push(`${actor.name} is ${effect.value} and cannot act!`);
                    turnSkipped = true;
                } else {
                    battle.battleLog.push(`${actor.name} shakes off ${effect.value}!`);
                    effectStillActive = false; 
                }
                break;
            case 'charmed':
                 if (Math.random() < (effect.value / 100)) { 
                    const potentialTargets = (actor.isPlayer || actor.isAlly) 
                        ? battle.playerParty.filter(p => p.id !== actor.id && p.stats.health > 0)
                        : battle.enemyParty.filter(e => e.id !== actor.id && e.stats.health > 0);
                    
                    if (potentialTargets.length > 0) {
                        const targetAlly = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                        const charmDamage = Math.max(1, Math.floor((actor.stats.strength || 5) * 0.5));
                        targetAlly.stats.health = Math.max(0, targetAlly.stats.health - charmDamage);
                        battle.battleLog.push(`${actor.name} is charmed and attacks ${targetAlly.name} for ${charmDamage} damage!`);
                        turnSkipped = true;
                    } else {
                        battle.battleLog.push(`${actor.name} is charmed but has no allies to target, acts confused!`);
                        turnSkipped = true; 
                    }
                }
                break;
        }
        if (effectStillActive && effect.duration !== undefined && effect.duration > 1) {
            newStatusEffectsActor.push({ ...effect, duration: effect.duration - 1 });
        } else if (effectStillActive && effect.duration === undefined) { 
            newStatusEffectsActor.push(effect);
        } else if (!effectStillActive && effect.duration === 1){ 
             battle.battleLog.push(`${actor.name} is no longer affected by ${effect.description}.`);
        }
    }
    actor.statusEffects = newStatusEffectsActor;


    if (!turnSkipped && actionSuccess) { 
        if (action.type === 'spell' && action.spellId) {
            const spell = actor.abilities.find(ab => ab.id === action.spellId);
            if (!spell) { battle.battleLog.push("Unknown spell!"); actionSuccess = false; }
            else if (actor.stats.mana < spell.manaCost) { battle.battleLog.push(`${actor.name} lacks mana for ${spell.name}!`); actionSuccess = false; }
            else if (actionSuccess) { 
                actor.stats.mana -= spell.manaCost;
                battle.battleLog.push(`${actor.name} casts ${spell.name}! (Cognitive Score: ${cognitiveScore.toFixed(0)}%)`);

                const targets = action.targetId ? battle.participants.filter(p => p.id === action.targetId && p.stats.health > 0)
                                : (spell.target === 'all_enemies' ? battle.enemyParty.filter(e => e.stats.health > 0)
                                : (spell.target === 'all_allies' ? battle.playerParty.filter(p => p.stats.health > 0)
                                : (spell.target === 'self' ? [actor] : [])));

                targets.forEach(target => {
                    if (target.stats.health <= 0 && spell.effects.every(e => e.type !== 'revive')) return; 
                    
                    let actualPower = (spell.effectPower || 0) * damageModifier;
                    
                    if (target.stats?.elementalWeaknesses?.includes((spell as any).element || '')) {
                        actualPower *= 1.5;
                        battle.battleLog.push(`${target.name} is vulnerable to ${(spell as any).element}!`);
                    }
                    if (target.stats?.elementalResistances?.includes((spell as any).element || '')) {
                        actualPower *= 0.5;
                        battle.battleLog.push(`${target.name} resists ${(spell as any).element}!`);
                    }
                    actualPower = Math.round(actualPower);

                    spell.effects.forEach(effect => {
                        target.statusEffects = target.statusEffects || [];
                        const statToChangeOriginal = effect.type.startsWith('stat_boost_') ? effect.type.replace('stat_boost_', '').toLowerCase() : effect.type;
                        const statToChange = statToChangeOriginal as keyof ChronicleEntityStats; 


                        switch(effect.type) {
                            case 'damage':
                                const damageDealt = Math.max(0, actualPower); 
                                target.stats.health = Math.max(0, target.stats.health - damageDealt);
                                battle.battleLog.push(`${spell.name} hits ${target.name} for ${damageDealt} damage. (${target.name} HP: ${target.stats.health}/${(target as any).maxHealth})`);
                                break;
                            case 'heal':
                                target.stats.health = Math.min((target as any).maxHealth, target.stats.health + actualPower);
                                battle.battleLog.push(`${spell.name} heals ${target.name} for ${actualPower} HP. (${target.name} HP: ${target.stats.health}/${(target as any).maxHealth})`);
                                break;
                            case 'buff':
                            case 'debuff':
                                if (statToChange && typeof target.stats[statToChange] === 'number') {
                                    const changeAmount = effect.type === 'buff' ? actualPower : -actualPower;
                                    (target.stats[statToChange] as number) += changeAmount;
                                     battle.battleLog.push(`${target.name}'s ${statToChange} ${effect.type === 'buff' ? 'increased' : 'decreased'} by ${Math.abs(actualPower)} due to ${spell.name}.`);
                                     if(statToChange === 'maxHealth') target.stats.health = Math.min(target.stats.health, target.stats.maxHealth);
                                } else {
                                    battle.battleLog.push(`Cannot apply ${effect.type} to ${statToChange} on ${target.name}.`);
                                }
                                target.statusEffects.push({...effect, value: actualPower, duration: effect.duration || 3}); 
                                break;
                            case 'stat_boost_hp': case 'stat_boost_mp': case 'stat_boost_str': case 'stat_boost_int': case 'stat_boost_wis': case 'stat_boost_adp':
                                 if (statToChange && typeof target.stats[statToChange] === 'number') {
                                     (target.stats[statToChange] as number) += actualPower;
                                     battle.battleLog.push(`${target.name}'s ${statToChange} boosted by ${actualPower} due to ${spell.name}.`);
                                      if(statToChange === 'maxHealth') target.stats.health = Math.min(target.stats.health, (target as any).maxHealth);
                                 }
                                 target.statusEffects.push({...effect, value: actualPower, duration: effect.duration || 3});
                                break;
                            case 'all_stats_boost':
                                (Object.keys(target.stats) as Array<keyof ChronicleEntityStats>).forEach(statKey => {
                                     if (typeof target.stats[statKey] === 'number' && !['health', 'mana', 'maxHealth', 'maxMana', 'speed'].includes(statKey)) {
                                        (target.stats[statKey] as number) += actualPower;
                                    }
                                });
                                battle.battleLog.push(`${target.name}'s stats boosted by ${actualPower} due to ${spell.name}.`);
                                target.stats.health = Math.min(target.stats.health, (target as any).maxHealth); 
                                target.stats.mana = Math.min(target.stats.mana, (target as any).maxMana); 
                                target.statusEffects.push({...effect, value: actualPower, duration: effect.duration || 3});
                                break;
                            case 'status': 
                                const statusType = effect.value as string; 
                                if (target.stats.elementalResistances?.includes((effect as any).element || statusType)) {
                                     battle.battleLog.push(`${target.name} resisted the ${statusType} status effect from ${spell.name}!`);
                                } else {
                                    const existingEffectIndex = target.statusEffects.findIndex(se => se.type === 'status' && se.value === statusType);
                                    if (existingEffectIndex !== -1) { 
                                        target.statusEffects[existingEffectIndex].duration = Math.max(target.statusEffects[existingEffectIndex].duration || 0, effect.duration || 3);
                                    } else {
                                        target.statusEffects.push({...effect, value: statusType, duration: effect.duration || 3, description: `${statusType} status`});
                                    }
                                    battle.battleLog.push(`${target.name} is now ${statusType}ed by ${spell.name}.`);
                                }
                                break;
                             case 'cure': 
                                const statusToCure = effect.value; 
                                if (statusToCure === 'all_negative') {
                                    target.statusEffects = target.statusEffects.filter(se => se.type === 'buff'); 
                                    battle.battleLog.push(`${spell.name} cures all negative status effects on ${target.name}.`);
                                } else if (typeof statusToCure === 'string') {
                                    const initialLength = target.statusEffects.length;
                                    target.statusEffects = target.statusEffects.filter(se => !(se.type === 'status' && se.value === statusToCure) && !(se.type === 'debuff' && se.description.toLowerCase().includes(statusToCure)));
                                    if (target.statusEffects.length < initialLength) {
                                        battle.battleLog.push(`${spell.name} cures ${statusToCure} on ${target.name}.`);
                                    } else {
                                        battle.battleLog.push(`${target.name} was not affected by ${statusToCure}.`);
                                    }
                                }
                                break;
                            case 'revive':
                                if (target.stats.health <= 0) {
                                    target.stats.health = Math.min((target as any).maxHealth, Math.round((target as any).maxHealth * (effect.value/100))); 
                                    target.statusEffects = []; 
                                    battle.battleLog.push(`${target.name} is revived by ${spell.name} with ${target.stats.health} HP!`);
                                } else {
                                    battle.battleLog.push(`${spell.name} has no effect on ${target.name} (already alive).`);
                                }
                                break;
                        }
                    });
                     if (damageModifier < 0 && spell.effects.some(e => e.type === 'damage')) { 
                        const backfireDamage = Math.abs(Math.round((spell.effectPower || 0) * damageModifier));
                        actor.stats.health = Math.max(0, actor.stats.health - backfireDamage);
                         battle.battleLog.push(`${spell.name} backfires! ${actor.name} takes ${backfireDamage} damage.`);
                    }
                });
            }
        } else if (action.type === 'defend' && action.cognitiveResponse) {
            battle.battleLog.push(`${actor.name} attempts to defend with cognitive insight! (Score: ${cognitiveScore.toFixed(0)}%)`);
            actor.statusEffects = actor.statusEffects || [];
            if (cognitiveScore >= 80) {
                actor.statusEffects.push({type:'buff', value: 0.5, duration:1, description: 'Cognitive Shield (50% Dmg Reduction)'}); 
                 battle.battleLog.push(`${actor.name} erects a Cognitive Shield!`);
            } else if (cognitiveScore >= 50) {
                 actor.statusEffects.push({type:'buff', value: 0.25, duration:1, description: 'Minor Cognitive Ward (25% Dmg Reduction)'});
                 battle.battleLog.push(`${actor.name} braces with a Minor Cognitive Ward.`);
            } else {
                battle.battleLog.push(`${actor.name}'s defense falters.`);
            }
        } else if (action.type === 'switch_spellbook' && action.newSpellbookId && actor.isPlayer) {
            const player = actor as ChroniclePlayerState; 
            const newSpellbook = player.spellbooks.find(sb => sb.id === action.newSpellbookId);
            if (newSpellbook) {
                player.equippedSpellbookId = newSpellbook.id;
                player.abilities = newSpellbook.abilities || []; 
                battle.battleLog.push(`${player.name} equipped ${newSpellbook.name}.`);
                 const playerBase = await getPlayerStateBaseInternal(); 
                 playerBase.equippedSpellbookId = newSpellbook.id;
                 savePlayerStateBaseInternal(playerBase);

            } else {
                battle.battleLog.push(`Failed to switch spellbook.`);
            }
        } else if (actor.isPlayer && (action.type === 'attack' || (action.type === 'spell' && !actionSuccess) ) ) { 
            const target = battle.participants.find(p => p.id === action.targetId && !p.isPlayer && !p.isAlly && p.stats.health > 0);
            if (target) {
                const damage = Math.max(1, Math.round((actor.stats.strength || 10) * 0.5 * damageModifier)); 
                target.stats.health = Math.max(0, target.stats.health - damage);
                battle.battleLog.push(`${actor.name} ${action.type === 'attack' ? 'attacks' : 'struggles but attacks'} ${target.name} for ${damage} damage. (Cognitive Score: ${cognitiveScore.toFixed(0)}%)`);
            } else {
                battle.battleLog.push(`${actor.name} basic attack failed or no valid target.`);
            }
        }
    } 


    battle.playerParty = battle.participants.filter(p => p.isPlayer || p.isAlly) as BattleParticipant[]; 
    battle.enemyParty = battle.participants.filter(p => !p.isPlayer && !p.isAlly) as BattleParticipant[]; 

    const allEnemiesDefeated = battle.enemyParty.every(e => e.stats.health <= 0);
    const allPlayerPartyDefeated = battle.playerParty.every(p => p.stats.health <= 0);

    let battleEnded = false;
    let playerWon = false;
    let rewards: BattleRewards | undefined = undefined;

    if (allEnemiesDefeated) {
        battle.status = 'playerVictory'; battleEnded = true; playerWon = true;
        battle.battleLog.push("All enemies defeated! VICTORY!");
        const encounterDef = await getEncounterById(battle.encounterId || "");
        if (encounterDef?.rewards) {
            rewards = { items: [] , experience: encounterDef.rewards.experience || 0, memoryStrengthBonus: encounterDef.rewards.memoryStrengthBonus || 0};
            if(encounterDef.rewards.items) {
                for (const itemDef of encounterDef.rewards.items) {
                    const item = await chronicleGetItemByIdFromLogic(itemDef.id); 
                    if (item) rewards!.items!.push(item);
                }
            }
             if (encounterDef.rewards.companionRecruitedId) {
                rewards.companionRecruitedId = encounterDef.rewards.companionRecruitedId;
            }
        }
        battle.rewards = rewards;
    } else if (allPlayerPartyDefeated) {
        battle.status = 'playerDefeat'; battleEnded = true; playerWon = false;
        battle.battleLog.push("Your party has fallen. DEFEAT!");
    } else { 
        if(actionSuccess || (!actor.isPlayer && !actor.isAlly) || turnSkipped){ 
            const currentActorOriginalIndex = battle.turnOrder.findIndex(id => id === battle.currentTurnActorId);
            let nextTurnOriginalIndex = (currentActorOriginalIndex + 1) % battle.turnOrder.length;
            
            let nextTurnParticipant = battle.participants.find(p => p.id === battle.turnOrder[nextTurnOriginalIndex]);
            let livingParticipants = battle.participants.filter(p => p.stats.health > 0);
            
            let attempts = 0; 
            while(nextTurnParticipant && nextTurnParticipant.stats.health <= 0 && livingParticipants.length > 0 && attempts < battle.turnOrder.length) {
                nextTurnOriginalIndex = (nextTurnOriginalIndex + 1) % battle.turnOrder.length;
                nextTurnParticipant = battle.participants.find(p => p.id === battle.turnOrder[nextTurnOriginalIndex]);
                livingParticipants = battle.participants.filter(p => p.stats.health > 0); 
                attempts++;

                if (battle.turnOrder[nextTurnOriginalIndex] === battle.currentTurnActorId && (!nextTurnParticipant || nextTurnParticipant.stats.health <= 0)) {
                     console.error("Battle stuck with no valid next living actor.");
                     battle.status = allPlayerPartyDefeated ? 'playerDefeat' : allEnemiesDefeated ? 'playerVictory' : 'playerDefeat'; 
                     battleEnded = true;
                     playerWon = battle.status === 'playerVictory';
                     break; 
                }
            }

            if (nextTurnParticipant && battle.status === 'ongoing' && !battleEnded) { 
                battle.currentTurnActorId = nextTurnParticipant.id;
                battle.isPlayerTurn = !!(nextTurnParticipant.isPlayer || nextTurnParticipant.isAlly);
                battle.currentTurnIndex = nextTurnOriginalIndex; 
                battle.currentPrompt = null; 
                battle.defendingPlayerId = undefined;

                 battle.battleLog.push(`--- ${(nextTurnParticipant as BattleParticipant)?.name || 'Unknown'}'s turn ---`); 

                if (!battle.isPlayerTurn && nextTurnParticipant.stats.health > 0 && battle.status === 'ongoing') {
                    const aiActor = nextTurnParticipant as BattleParticipant; 
                    const livingPlayerTargets = battle.playerParty.filter(p => p.stats.health > 0);

                    if (aiActor.abilities?.length > 0 && livingPlayerTargets.length > 0) {
                        const spellToCast = aiActor.abilities[Math.floor(Math.random() * aiActor.abilities.length)];
                        if (aiActor.stats.mana >= spellToCast.manaCost) {
                            aiActor.stats.mana -= spellToCast.manaCost;
                            battle.battleLog.push(`${aiActor.name} casts ${spellToCast.name}!`);
                            const targetPlayer = livingPlayerTargets[Math.floor(Math.random() * livingPlayerTargets.length)];

                            let aiDamage = spellToCast.effectPower || 5;
                            if (targetPlayer.stats?.elementalWeaknesses?.includes((spellToCast as any).element || '')) {
                                aiDamage *= 1.5;
                                battle.battleLog.push(`${targetPlayer.name} is vulnerable to ${(spellToCast as any).element}!`);
                            }
                            if (targetPlayer.stats?.elementalResistances?.includes((spellToCast as any).element || '')) {
                                aiDamage *= 0.5;
                                battle.battleLog.push(`${targetPlayer.name} resists ${(spellToCast as any).element}!`);
                            }
                            aiDamage = Math.round(aiDamage);

                            spellToCast.effects.forEach(effect => {
                                if (effect.type === 'damage') {
                                    targetPlayer.stats.health = Math.max(0, targetPlayer.stats.health - aiDamage);
                                    battle.battleLog.push(`${targetPlayer.name} takes ${aiDamage} damage. HP: ${targetPlayer.stats.health}/${(targetPlayer as any).maxHealth}`);
                                } else if (effect.type === 'status') {
                                     if (!targetPlayer.stats.elementalResistances?.includes((effect as any).element || String(effect.value))) {
                                        targetPlayer.statusEffects = targetPlayer.statusEffects || [];
                                        const existingEffectIndex = targetPlayer.statusEffects.findIndex(se => se.value === effect.value);
                                        if (existingEffectIndex !== -1) {
                                            targetPlayer.statusEffects[existingEffectIndex].duration = Math.max(targetPlayer.statusEffects[existingEffectIndex].duration || 0, effect.duration || 3);
                                        } else {
                                            targetPlayer.statusEffects.push({...effect, duration: effect.duration || 3});
                                        }
                                        battle.battleLog.push(`${targetPlayer.name} is now affected by ${effect.description}.`);
                                     } else {
                                         battle.battleLog.push(`${targetPlayer.name} resisted the ${effect.description} status effect!`);
                                     }
                                }
                            });


                            if (battle.playerParty.every(p => p.stats.health <= 0)) {
                                battle.status = 'playerDefeat'; battleEnded = true; playerWon = false;
                                battle.battleLog.push("Your party has been wiped out. DEFEAT!");
                            } else if (targetPlayer.stats.health <= 0) {
                                battle.battleLog.push(`${targetPlayer.name} has been defeated!`);
                            }
                           
                            const playerToDefend = battle.participants.find(p => p.id === targetPlayer.id && p.isPlayer && p.stats.health > 0);
                            if (playerToDefend && battle.status === 'ongoing') { 
                                const playerTargetAsPlayerState = run.playerState; 
                                const moduleToDefendWith = playerTargetAsPlayerState.abilities?.[0]?.moduleReference?.moduleId || 'sovereign-core';
                                const neuroModuleForDefense = await getNeuroModuleById(moduleToDefendWith);
                                const defenseNode = neuroModuleForDefense?.domains?.[0]?.nodes?.[0];
                                if (defenseNode) { 
                                    battle.currentPrompt = chronicleGenerateEPICChallenge(
                                        'implement', 
                                        defenseNode.id, 
                                        (spellToCast.effectPower || 10) / 10, 
                                        { title: defenseNode.title, shortDefinition: defenseNode.shortDefinition, clarification: defenseNode.download.clarification }
                                    );
                                    battle.defendingPlayerId = playerToDefend.id; 
                                    battle.isPlayerTurn = true; 
                                    battle.currentTurnActorId = playerToDefend.id; 
                                    battle.battleLog.push(`--- ${playerToDefend.name} must defend! ---`);
                                }
                            }


                        } else { 
                            battle.battleLog.push(`${aiActor.name} considers its options but lacks mana for ${spellToCast.name}.`); 
                            if (livingPlayerTargets.length > 0) {
                                const targetPlayer = livingPlayerTargets[Math.floor(Math.random() * livingPlayerTargets.length)];
                                const baseDamage = aiActor.stats.strength ? Math.max(1, Math.round(aiActor.stats.strength / 2)) : 3;
                                targetPlayer.stats.health = Math.max(0, targetPlayer.stats.health - baseDamage);
                                battle.battleLog.push(`${aiActor.name} attacks ${targetPlayer.name} for ${baseDamage} damage. HP: ${targetPlayer.stats.health}/${(targetPlayer as any).maxHealth}`);
                               if (battle.playerParty.every(p => p.stats.health <= 0)) {
                                   battle.status = 'playerDefeat'; battleEnded = true; playerWon = false;
                                   battle.battleLog.push("Your party has been wiped out. DEFEAT!");
                               } else if (targetPlayer.stats.health <= 0) {
                                   battle.battleLog.push(`${targetPlayer.name} has been defeated!`);
                               }
                            }
                        }
                    } else { 
                        if (livingPlayerTargets.length > 0) {
                            const targetPlayer = livingPlayerTargets[Math.floor(Math.random() * livingPlayerTargets.length)];
                            const baseDamage = aiActor.stats.strength ? Math.max(1, Math.round(aiActor.stats.strength / 2)) : 5;
                            targetPlayer.stats.health = Math.max(0, targetPlayer.stats.health - baseDamage);
                            battle.battleLog.push(`${aiActor.name} attacks ${targetPlayer.name} for ${baseDamage} damage. HP: ${targetPlayer.stats.health}/${(targetPlayer as any).maxHealth}`);
                             if (battle.playerParty.every(p => p.stats.health <= 0)) {
                                battle.status = 'playerDefeat'; battleEnded = true; playerWon = false;
                                battle.battleLog.push("Your party has been wiped out. DEFEAT!");
                            } else if (targetPlayer.stats.health <= 0) {
                                battle.battleLog.push(`${targetPlayer.name} has been defeated!`);
                            }
                        } else { battle.battleLog.push(`${aiActor.name} has no targets.`); }
                        
                    }
                } else if (battle.status === 'ongoing' && livingParticipants.length === 0 && (!allEnemiesDefeated && !allPlayerPartyDefeated)) {
                     console.error("Battle stuck with no living participants but no conclusion after attempting to advance turn.");
                     battle.status = 'playerDefeat'; battleEnded = true; playerWon = false; 
                }
            } else if (battle.status === 'ongoing' && livingParticipants.length === 0) {
                console.error("Battle has no living participants but did not conclude correctly.");
                battle.status = allPlayerPartyDefeated ? 'playerDefeat' : (allEnemiesDefeated ? 'playerVictory' : 'playerDefeat'); 
                battleEnded = true;
                playerWon = battle.status === 'playerVictory';
            }
        } 
    } 

    run.activeBattle = battle;
    run.lastActive = new Date().toISOString();
    const playerInBattle = battle.participants.find(p => (p as BattleParticipant).isPlayer);
    if (playerInBattle && run.playerState) {
        run.playerState.currentHealth = playerInBattle.stats.health;
        run.playerState.currentMana = playerInBattle.stats.mana;
        run.playerState.statusEffects = playerInBattle.statusEffects || []; 
    }

    chronicleSaveCurrentRun(run);
    return { updatedRunState: run, battleEnded, playerWon, rewards, toast };
};


export const updateMemoryStrengthFromChronicle = (
    userLearningState: UserLearningState,
    nodeId: string, 
    performanceScore: number
): { userLearningState: UserLearningState, oldStrength: number, newStrength: number } => {
    
    let targetNode: Node | undefined;
    let moduleKey: string | undefined;
    let domainIdx: number = -1;
    let nodeIdx: number = -1;

    const updatedModules = _.cloneDeep(userLearningState.modules);

    Object.keys(updatedModules).forEach(mk => {
        const mod = updatedModules[mk] as Module; 
        if (!mod || !mod.domains) return;
        mod.domains.forEach((domain, dIdx) => {
            if (!domain || !domain.nodes) return;
            const nIdx = domain.nodes.findIndex(n => n.id === nodeId);
            if (nIdx !== -1) {
                targetNode = domain.nodes[nIdx];
                moduleKey = mk;
                domainIdx = dIdx;
                nodeIdx = nIdx;
            }
        });
    });

    if (!targetNode || !moduleKey || domainIdx === -1 || nodeIdx === -1) {
         console.warn(`Node ${nodeId} not found for memory update.`);
         return { userLearningState, oldStrength: 0, newStrength: 0 };
    }

    const oldStrength = targetNode.memoryStrength || 50;
    const adjustment = (performanceScore / 100) * 20 - 10; 
    const newStrength = Math.min(100, Math.max(0, oldStrength + adjustment));

    (updatedModules[moduleKey] as Module).domains[domainIdx].nodes[nodeIdx].memoryStrength = newStrength; 
    (updatedModules[moduleKey] as Module).domains[domainIdx].nodes[nodeIdx].lastReviewed = new Date(); 
    
    const updatedLearningState = { ...userLearningState, modules: updatedModules };
    return { userLearningState: updatedLearningState, oldStrength, newStrength };
};

export const distributeRewardsInternal = async (
    playerBaseInput: PlayerCharacterBase, 
    rewardsInput: QuestReward[] | BattleRewards
): Promise<{ updatedPlayerBase: PlayerCharacterBase, items: Item[], experience: number, other: any[], companionId?: string, spellbookId?: string }> => {
    const playerBase = _.cloneDeep(playerBaseInput);
    let newItems: Item[] = []; 
    let gainedXp = 0;
    let recruitedCompanionId: string | undefined;
    let acquiredSpellbookId: string | undefined;

    const rewardsArray = Array.isArray(rewardsInput) ? rewardsInput : (rewardsInput.items ? rewardsInput.items.map(item => ({ type: 'item', itemId: item.id, value: item.id, chance: 1 } as QuestReward)) : []);
    if(!Array.isArray(rewardsInput) && rewardsInput.experience) gainedXp += rewardsInput.experience;
    if(!Array.isArray(rewardsInput) && rewardsInput.companionRecruitedId) recruitedCompanionId = rewardsInput.companionRecruitedId;

    for (const reward of rewardsArray) {
        if (reward.type === 'item' && reward.itemId && (reward.chance === undefined || Math.random() < reward.chance) ) {
            const item = await chronicleGetItemByIdFromLogic(reward.itemId); 
            if (item) {
                playerBase.inventory.push(item);
                newItems.push(item);
            }
        } else if (reward.type === 'experience' && typeof reward.value === 'number') {
            gainedXp += reward.value;
        } else if (reward.type === 'companion' && reward.companionId) {
            recruitedCompanionId = reward.companionId;
        } else if (reward.type === 'spellbook' && reward.spellbookId) {
            const spellbook = await getSpellbookById(reward.spellbookId);
            if (spellbook && !playerBase.spellbooks.find(sb => sb.id === spellbook.id)) {
                playerBase.spellbooks.push(spellbook);
                acquiredSpellbookId = spellbook.id;
            }
        }
    }
    savePlayerStateBaseInternal(playerBase);
    return { updatedPlayerBase: playerBase, items: newItems, experience: gainedXp, other: [], companionId: recruitedCompanionId, spellbookId: acquiredSpellbookId };
};

const processRecruitmentInternal = async (
    runState: ChronicleRunState, 
    companionBase?: Partial<Companion>
): Promise<{ updatedRunState: ChronicleRunState, success: boolean, companion: Companion | null }> => { 
    let run = _.cloneDeep(runState);
    const defaultStatsData: ChronicleEntityStats = { health: 50, maxHealth: 50, mana: 20, maxMana: 20, speed: 10, strength: 10, intelligence: 15, wisdom: 10, adaptability: 5, elementalResistances: [], elementalWeaknesses: [] };
    
    if (companionBase && companionBase.id) { 
        const alreadyRecruited = run.playerState.party?.find(c => c.id === companionBase.id);
        if(alreadyRecruited){
             return { updatedRunState: run, success: false, companion: null }; 
        }
        if((run.playerState.party?.length || 0) < 3) { 
            const fullCompanionData = {
                ...defaultStatsData, 
                ...(companionBase.stats || {}), 
                ...companionBase, 
                id: companionBase.id, 
                name: companionBase.name || "Mysterious Ally",
                type: 'companion' as CoreEntityType, 
                alignment: companionBase.alignment || 'neutral',
                abilities: companionBase.abilities || [],
                description: companionBase.description || "An enigmatic ally.",
                dialogue: companionBase.dialogue || {},
                originModule: companionBase.originModule || 'unknown',
                unlockCondition: companionBase.unlockCondition || '',
                loyalty: companionBase.loyalty || 0,
                personalityProfile: companionBase.personalityProfile || '',
                isAlly: true,
                isPlayer: false, 
                stats: { ...defaultStatsData, ...(companionBase.stats || {}) }, 
                maxHealth: companionBase.stats?.maxHealth || defaultStatsData.maxHealth,
                maxMana: companionBase.stats?.maxMana || defaultStatsData.maxMana,
            } as Companion;


            run.playerState.party = [...(run.playerState.party || []), fullCompanionData];
            run.companions.push(fullCompanionData); 
            
            const playerBase = await getPlayerStateBaseInternal(); 
            playerBase.party = run.playerState.party; 
            savePlayerStateBaseInternal(playerBase);
            chronicleSaveCurrentRun(run);

            return { updatedRunState: run, success: true, companion: fullCompanionData };
        } else {
             return { updatedRunState: run, success: false, companion: null }; 
        }
    }
    return { updatedRunState: run, success: false, companion: null };
};

export const recruitCompanion = async (
    runState: ChronicleRunState, 
    companionId: string
): Promise<{ updatedRunState: ChronicleRunState, success: boolean, companion: Companion | null }> => { 
    console.log(`Attempting to recruit companion: ${companionId}`);
    const allSystemModules = getAllModules(); 
    let companionBase: Partial<Companion> | undefined;

    const charDetails = await getCharacterById(companionId);
    if (charDetails) {
        const spellbook = spellbooksData[`spellbook-${charDetails.id}`] || spellbooksData[`spellbook-${charDetails.domains?.[0]}`]; 
        const abilities = spellbook ? await Promise.all((spellbook.abilities || []).map(async ab => typeof ab === 'string' ? getSpellById(ab) : (ab.id ? await getSpellById(ab.id) : null))).then(res => res.filter(Boolean) as ChronicleAbility[]) : [];
        companionBase = {
            id: charDetails.id,
            name: charDetails.name,
            type: 'companion',
            description: charDetails.description,
            alignment: (charDetails.alignment as EntityAlignment) || 'neutral',
            abilities: abilities,
            stats: { health: 70, maxHealth: 70, mana: 30, maxMana: 30, strength: 12, intelligence: 18, wisdom: 15, adaptability: 8, speed: 11, elementalResistances:[], elementalWeaknesses:[] }, 
            originModule: charDetails.domains?.[0] || 'unknown', 
            entityId: charDetails.id,
            personalityProfile: charDetails.personalityProfile,
        };
    } else {
        const enemyData = await getEnemyById(companionId);
        if(enemyData){
             companionBase = { ...enemyData, id: enemyData.id, name: enemyData.name, type: 'companion', originModule: enemyData.moduleReference?.moduleId || 'unknown', entityId: enemyData.entityId || enemyData.id };
        }
    }
    
    return processRecruitmentInternal(runState, companionBase); 
};


export const checkPuzzleSolution = (puzzleData: any, solutionAttempt: any): boolean => {
    if(!puzzleData || puzzleData.solution === undefined) return false;
    return String(puzzleData.solution).toLowerCase() === String(solutionAttempt).toLowerCase().trim();
};

export const generateFloorInternal = async (floorNumber: number, dungeonId: string): Promise<Floor> => { 
    return await generateNextInfiniteFloorInternal(floorNumber, dungeonId);
};
