
'use client';

import type { Dungeon, EncounterDefinition, ChronicleRunState, MapTile, PlayerState, Spellbook, Item as ChronicleItemType, Quest, BattleState, BattleParticipant, Ability, Enemy, TileType, Floor, Coordinates, CoreEntityType, EncounterType as ChronicleEncounterType, EPICChallenge as EPICPromptType, Position, BaseEntity } from '@/types/chronicle'; // Added EncounterType from chronicle
import type { EvaluationResult, DetailedLoadingState, PlayerCharacterBase as NeuroPlayerCharacterBase, Module } from '@/hooks/useLearningSession';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Swords, Skull, Shield, ArrowRight, ArrowLeft, Info, AlertCircle, Lock, MapIcon, UserSquare2, BookOpen, ShieldQuestion, Wand2, Archive, ShoppingBag, HelpCircle, Diamond, Axe, Route, Square, MoveUp, MoveDown, Eye, History, MessageSquare, Puzzle, ServerCog, WifiOff, CheckCircle, Users, Package, ScrollText } from 'lucide-react'; 
import type { Character } from '@/types/characterTypes'; // Updated import
import Image from 'next/image';
import { DungeonMinimap } from './DungeonMinimap';
import { PlayerStatusBar } from './PlayerStatusBar';
import { BattleInterface } from './BattleInterface';
import { PuzzleInterface } from './PuzzleInterface';
import { DiscussionInterface } from './DiscussionInterface';
import { ScrollInterface } from './ScrollInterface';
import { ChronicleDashboard } from './ChronicleDashboard';
import { SACRED_CIRCUIT_STRUCTURE_EXPORT, ENTITY_DEFINITIONS_EXPORT } from '@/data/chronicle-data'; 
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface ChronicleDisplayProps {
  availableDungeons: Dungeon[];
  activeRun: ChronicleRunState | null;
  isLoading: boolean;
  detailedLoadingProgress: DetailedLoadingState;
  onRetryLoad: (dungeonId?: string) => void;
  evaluationResult: EvaluationResult | null;
  hasInstalledModules: boolean;
  guideCharacterId?: string;
  guideCharacter?: Character | null;
  onStartRun: (dungeonId: string) => void;
  onSubmitEncounterResponse: (response: string, battleAction?: BattleActionRequest) => void;
  onPlayerCombatAction: (action: BattleActionRequest) => void;
  onEndRun: (didWin?: boolean) => void;
  onExit: () => void;
  clearEvaluationResult: () => void;
  onMovePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onInteractWithTile: () => void;
  playerCharacterBase: NeuroPlayerCharacterBase;
  allModules: Record<string, Module>;
}

const getEntityIcon = (entityType: CoreEntityType | undefined, encounterType?: ChronicleEncounterType) => {
    const finalType = entityType || 'unknown_entity';
    let definition = ENTITY_DEFINITIONS_EXPORT[finalType] || ENTITY_DEFINITIONS_EXPORT.unknown_entity;

    if (encounterType === 'puzzle') return <Puzzle size={20} className="text-glow-gold" />;
    if (encounterType === 'discussion' || encounterType === 'debate') return <MessageSquare size={20} className="text-glow-cyan" />;
    if (encounterType === 'scroll') return <ScrollText size={20} className="text-yellow-400" />;
    if (encounterType === 'boss') return <Skull size={20} className="text-glow-crimson" />;


    switch(definition.manifestation) {
        case 'Demons': return <Skull size={20} className="text-glow-crimson" />;
        case 'Angels': return <Shield size={20} className="text-glow-gold" />;  
        case 'Neutral Agents': return <HelpCircle size={20} className="text-glow-cyan" />;
        case 'Recruitable Allies': return <Users size={20} className="text-green-400" />;
        default: return <ShieldQuestion size={20} />;
    }
};

const getEntityBorderColor = (entityType: CoreEntityType | undefined, encounterType?: ChronicleEncounterType) => {
    if (encounterType === 'puzzle') return 'border-primary/30 bg-primary/10';
    if (encounterType === 'discussion' || encounterType === 'debate') return 'border-secondary/30 bg-secondary/10';
    if (encounterType === 'scroll') return 'border-yellow-500/30 bg-yellow-500/10';
    if (encounterType === 'boss') return 'border-destructive/50 bg-destructive/20';

    const finalType = entityType || 'unknown_entity';
    const definition = ENTITY_DEFINITIONS_EXPORT[finalType] || ENTITY_DEFINITIONS_EXPORT.unknown_entity;
    switch(definition.alignment) {
        case 'chaos': return 'border-destructive/30 bg-destructive/10';
        case 'law': return 'border-primary/30 bg-primary/10';
        case 'neutral': return 'border-secondary/30 bg-secondary/10';
        case 'varies': return 'border-green-500/30 bg-green-500/10';
        default: return 'border-border/30 bg-muted/20';
    }
}

const LoadingStepDisplay: React.FC<{ label: string; stepState: DetailedLoadingState[keyof DetailedLoadingState] }> = ({ label, stepState }) => {
    let Icon = Loader2;
    let iconClass = 'animate-spin text-secondary';
    if (stepState.status === 'success') {
        Icon = CheckCircle;
        iconClass = 'text-primary';
    } else if (stepState.status === 'error') {
        Icon = AlertCircle;
        iconClass = 'text-destructive';
    }

    return (
        <div className={`flex items-center space-x-spacing-xs p-spacing-xs rounded-md ${stepState.status === 'error' ? 'bg-destructive/10' : 'bg-muted/30'}`}>
            <Icon size={18} className={iconClass} />
            <span className={`text-sm ${stepState.status === 'error' ? 'text-destructive-foreground' : 'text-muted-foreground'}`}>{label}</span>
            {stepState.error && <p className="text-xxs text-destructive ml-auto" title={stepState.error}>Error</p>}
        </div>
    );
};

export const DungeonLoadingScreen: React.FC<{
    loadingState: DetailedLoadingState;
    onRetry: () => void;
    onExit: () => void;
    dungeonName: string;
}> = ({ loadingState, onRetry, onExit, dungeonName }) => {
    const anyError = loadingState.dungeonData.status === 'error' ||
                     loadingState.characterData.status === 'error' ||
                     loadingState.aiConnection.status === 'error';

    const loreQuotes = [
        "The mindscape shifts, revealing pathways unseen...",
        "Cognitive echoes resonate within the digital sanctum.",
        "Reality reconfigures; prepare for the trial ahead.",
        "Knowledge crystallizes, forming the walls of this new challenge.",
        "The Neuroverse awaits your imprint. Tread carefully, Sovereign."
    ];
    const [randomQuote, setRandomQuote] = useState('');
    useEffect(() => {
        setRandomQuote(loreQuotes[Math.floor(Math.random() * loreQuotes.length)]);
    }, []);


    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn p-spacing-md">
            <Card className="max-w-lg mx-auto shadow-cyan-md border-border" data-alignment="neutral">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-display text-glow-cyan flex items-center justify-center gap-spacing-xs">
                        <Loader2 className="animate-spin text-secondary" /> Loading Chronicle: {dungeonName}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground/80 mt-spacing-xs italic">
                        &ldquo;{randomQuote}&rdquo;
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-spacing-sm">
                    <LoadingStepDisplay label="Initializing Sacred Circuit" stepState={loadingState.dungeonData} />
                    <LoadingStepDisplay label="Preparing Companions & Abilities" stepState={loadingState.characterData} />
                    <LoadingStepDisplay label="Establishing Neural Connection" stepState={loadingState.aiConnection} />

                    {anyError && (
                        <Alert variant="destructive" className="mt-spacing-md">
                            <WifiOff className="h-4 w-4" />
                            <AlertTitle>Connection Disrupted</AlertTitle>
                            <AlertDescription>
                                An error occurred while preparing the Chronicle. Please check your connection or try again.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-spacing-sm">
                    <Button variant="outline" onClick={onExit}>Return to Dashboard</Button>
                    {anyError && <Button variant="primary" onClick={onRetry}>Retry Connection</Button>}
                </CardFooter>
            </Card>
        </div>
    );
};


export function ChronicleDisplay({
  availableDungeons,
  activeRun,
  isLoading: isLoadingChronicle,
  detailedLoadingProgress,
  onRetryLoad,
  evaluationResult,
  hasInstalledModules,
  guideCharacterId,
  guideCharacter,
  onStartRun,
  onSubmitEncounterResponse,
  onPlayerCombatAction,
  onEndRun,
  onExit,
  clearEvaluationResult,
  onMovePlayer,
  onInteractWithTile,
  playerCharacterBase,
  allModules,
}: ChronicleDisplayProps) {
  const [showDungeonEntryCinematic, setShowDungeonEntryCinematic] = useState(false);
  const prevDungeonIdRef = useRef<string | null | undefined>(null);
  const justEnteredDungeonRef = useRef(false);
  const [availableSpellbooks, setAvailableSpellbooks] = useState<Spellbook[]>([]);
  const [selectedSpellbookId, setSelectedSpellbookId] = useState<string | null>(playerCharacterBase.equippedSpellbookId);


  useEffect(() => {
    const currentDungeonId = activeRun?.dungeonId || null;
    if (currentDungeonId && justEnteredDungeonRef.current && activeRun?.status === 'active' && !isLoadingChronicle) {
        const dungeon = activeRun?.currentDungeon || availableDungeons.find(d => d.id === currentDungeonId);
        if (dungeon) {
            setShowDungeonEntryCinematic(true);
            const timer = setTimeout(() => {
                setShowDungeonEntryCinematic(false);
            }, 3000); 
            justEnteredDungeonRef.current = false; 
            prevDungeonIdRef.current = currentDungeonId;
            return () => clearTimeout(timer);
        }
    } else if (!currentDungeonId && prevDungeonIdRef.current) { 
        prevDungeonIdRef.current = null; 
        setShowDungeonEntryCinematic(false); 
    }
  }, [activeRun?.dungeonId, activeRun?.status, availableDungeons, isLoadingChronicle]);

  useEffect(() => {
    if (activeRun?.dungeonId && activeRun.dungeonId !== prevDungeonIdRef.current && !activeRun.activeBattle && !activeRun.currentEncounter) {
        justEnteredDungeonRef.current = true; 
    }
  }, [activeRun?.dungeonId, activeRun?.activeBattle, activeRun?.currentEncounter]);

  useEffect(() => {
    if (activeRun && activeRun.playerState) {
        setAvailableSpellbooks(activeRun.playerState.spellbooks);
        setSelectedSpellbookId(activeRun.playerState.equippedSpellbookId);
    } else {
        setAvailableSpellbooks(playerCharacterBase.spellbooks);
        setSelectedSpellbookId(playerCharacterBase.equippedSpellbookId);
    }
  }, [playerCharacterBase, activeRun]);

  const handleSpellbookChange = (spellbookId: string) => {
    if (isLoadingChronicle || activeRun?.activeBattle) return; 
    onPlayerCombatAction({ type: 'switch_spellbook', newSpellbookId: spellbookId });
    setSelectedSpellbookId(spellbookId);
  };


  const handleNonBattleEncounterSubmit = (response: string, encounterType?: ChronicleEncounterType) => {
    if (isLoadingChronicle || !activeRun?.currentEncounter || activeRun.activeBattle) return;
    onSubmitEncounterResponse(response);
  };

  const handleBattleComplete = useCallback((didWin: boolean) => {
    if (activeRun) {
      if (!didWin && activeRun.playerState.stats.health <= 0) {
         onEndRun(false);
      }
    }
  }, [activeRun, onEndRun]);

  if (isLoadingChronicle && activeRun?.dungeonId && !showDungeonEntryCinematic && detailedLoadingProgress.dungeonData.status !== 'success') {
    return <DungeonLoadingScreen
                loadingState={detailedLoadingProgress}
                onRetry={() => onRetryLoad(activeRun.dungeonId)}
                onExit={onExit}
                dungeonName={activeRun?.currentDungeon?.name || "Selected Dungeon"}
            />;
  }


  if (showDungeonEntryCinematic && !isLoadingChronicle) {
    const dungeon = activeRun?.currentDungeon || availableDungeons.find(d => d.id === activeRun?.dungeonId);
    const quote = dungeon?.guardian?.dialogue.greeting || dungeon?.description || "The Neuroverse awaits...";
    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn p-spacing-md">
            <Card className="glitch-flicker p-spacing-lg sm:p-spacing-xl rounded-lg text-center space-y-spacing-md max-w-xl border-accent shadow-cyan-md" data-alignment="neutral">
                <Route size={64} className="text-secondary mx-auto animate-pulse" />
                <h2 className="text-3xl sm:text-4xl font-display text-glow-cyan">Entering {dungeon?.name || 'the Chronicle'}...</h2>
                <p className="text-lg sm:text-xl text-muted-foreground italic">&ldquo;{quote}&rdquo;</p>
                {dungeon?.environment && (
                    <p className="text-xs text-muted-foreground/70">{dungeon.environment.description}</p>
                )}
                 <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            </Card>
        </div>
    );
  }

  if (!activeRun && !isLoadingChronicle) {
    return (
      <ChronicleDashboard
        availableDungeons={availableDungeons}
        onStartRun={onStartRun}
        onExit={onExit}
        hasInstalledModules={hasInstalledModules}
      />
    );
  }

  if (!activeRun && isLoadingChronicle) {
     return (
          <div className="container mx-auto p-spacing-md text-center flex items-center justify-center min-h-[calc(100vh-10rem)]">
               <Card className="max-w-md mx-auto shadow-cyan-md" data-alignment="neutral">
                  <CardHeader>
                    <CardTitle className="text-2xl font-display flex items-center justify-center gap-spacing-xs text-glow-cyan">
                      <Loader2 className="animate-spin text-secondary" /> Loading Chronicle Data...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground/80 mb-spacing-md">Preparing the Neuroverse. This may take a moment.</p>
                     <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary animate-pulse" style={{ width: '100%', animationDuration: '2s' }}></div>
                      </div>
                  </CardContent>
               </Card>
           </div>
      );
  }

  if (!activeRun) return null;


  const dungeon = activeRun.currentDungeon;
  const currentMapFloor = dungeon?.floors.find(f => f.level === activeRun.currentFloor);

  if (!dungeon || !currentMapFloor) {
    return (
      <div className="container mx-auto p-spacing-md text-center flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="max-w-md mx-auto border-destructive bg-destructive/10 shadow-lg" data-alignment="chaos">
          <CardHeader><CardTitle className="text-destructive flex items-center justify-center gap-spacing-xs text-2xl font-display text-glow-crimson"><AlertCircle /> Chronicle Error</CardTitle></CardHeader>
          <CardContent><p className="text-destructive-foreground/80 mb-spacing-md">Dungeon or floor data corrupted. Retreating...</p><Button variant="destructive" onClick={()=>onEndRun(false)}>End Run</Button></CardContent>
        </Card>
      </div>
    );
  }

  const renderCurrentEncounter = () => {
    if (activeRun.activeBattle) {
      return <BattleInterface
                initialBattleState={activeRun.activeBattle}
                onProcessAction={onPlayerCombatAction}
                onBattleComplete={handleBattleComplete}
                onSubmitDefense={(answer, battleAction) => onSubmitEncounterResponse(answer, battleAction)}
             />;
    }
    if (activeRun.currentEncounter) {
      const encounter = activeRun.currentEncounter;
      const encounterEntityInfo = ENTITY_DEFINITIONS_EXPORT[encounter.entityType || 'unknown_entity'] || ENTITY_DEFINITIONS_EXPORT.unknown_entity;
      const borderColorClass = getEntityBorderColor(encounter.entityType, encounter.type);

      return (
        <Card className={`encounter-card ${borderColorClass} shadow-md flex-grow overflow-hidden flex flex-col min-h-[350px] md:min-h-[400px]`}>
            <CardHeader className="pb-spacing-xs pt-spacing-sm px-spacing-sm">
                <CardTitle className="text-lg font-display flex items-center gap-spacing-xs">
                    {getEntityIcon(encounter.entityType, encounter.type)}
                    <span className={encounterEntityInfo.alignment === "law" ? "text-glow-gold" : encounterEntityInfo.alignment === "chaos" ? "text-glow-crimson" : "text-glow-cyan"}>
                        {encounter.title || "Mysterious Encounter"}
                    </span>
                </CardTitle>
                {encounter.description && <CardDescription className="text-xs text-muted-foreground/80 pt-spacing-xs">{encounter.description}</CardDescription>}
            </CardHeader>
            <CardContent className="px-spacing-sm pb-spacing-sm flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {(() => {
                    switch (encounter.type) {
                        case 'puzzle': return encounter.puzzleData ? <PuzzleInterface encounter={encounter} onComplete={(success) => { handleNonBattleEncounterSubmit(success ? "solved" : "failed_puzzle", 'puzzle'); }} /> : <div>Puzzle data missing.</div>;
                        case 'discussion':
                        case 'debate': return encounter.discussionData ? <DiscussionInterface encounter={encounter} onComplete={(success, companionId) => { handleNonBattleEncounterSubmit(success ? `discussion_success${companionId ? `_recruit_${companionId}` : ''}` : "discussion_failed", encounter.type); }} /> : <div>Discussion data missing.</div>;
                        case 'scroll': return encounter.scrollData ? <ScrollInterface encounter={encounter} onComplete={(success, spellbookId, spellId) => { handleNonBattleEncounterSubmit(success ? `scroll_deciphered${spellbookId? `_sb_${spellbookId}` : ''}${spellId? `_sp_${spellId}` : ''}`: "scroll_failed", 'scroll'); }} /> : <div>Scroll data missing.</div>;
                        default: return <div className="text-muted-foreground p-spacing-sm text-center text-sm">Awaiting interaction... (Encounter type: {encounter.type})</div>;
                    }
                })()}
            </CardContent>
        </Card>
      );
    }
    return (
        <Card className="border-border/30 bg-card/70 p-spacing-md text-center min-h-[350px] md:min-h-[400px] flex flex-col justify-center items-center flex-grow">
            <MapIcon size={48} className="text-muted-foreground/50 mb-spacing-sm"/>
            <p className="text-muted-foreground italic">The path is clear. Explore the Neuroverse.</p>
            <p className="text-xs text-muted-foreground/70 mt-spacing-xs">Use movement controls to navigate.</p>
        </Card>
    );
  };

  const currentPhaseInfo = dungeon.sacredCircuitPhases?.find(p => p.phase === currentMapFloor.phaseName) ||
                           SACRED_CIRCUIT_STRUCTURE_EXPORT[(currentMapFloor.level -1) % SACRED_CIRCUIT_STRUCTURE_EXPORT.length];

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-7xl space-y-3 sm:space-y-4">
      <Card className="shadow-cyan-md flex-shrink-0" data-alignment="neutral">
        <CardHeader className="bg-muted/30 p-3 rounded-t-lg border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-md sm:text-xl font-display flex items-center gap-2 text-glow-cyan">
              <MapIcon size={20} className="text-secondary" />
              <span className="truncate" title={dungeon.name}>{dungeon.name}</span>
            </CardTitle>
             <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center">
                 <Badge variant="outline" className="text-xxs sm:text-xs py-0.5 px-1.5">F{activeRun.currentFloor} ({currentPhaseInfo?.phase || 'Exploration'})</Badge>
                 <Badge variant="secondary" className="text-xxs sm:text-xs py-0.5 px-1.5">Pos: {String.fromCharCode(65 + activeRun.playerPosition.x)}{activeRun.playerPosition.y + 1}</Badge>
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 text-xxs sm:text-xs h-7 sm:h-8 px-2" size="sm" onClick={()=>onEndRun(false)}>End Run</Button>
             </div>
          </div>
           {currentPhaseInfo && <CardDescription className="text-xxs sm:text-xs text-muted-foreground/70 pt-1 sm:pt-1">{currentPhaseInfo.description}</CardDescription>}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
          <div className="md:col-span-4 lg:col-span-3 space-y-2 flex flex-col h-full max-h-full overflow-hidden">
            <PlayerStatusBar hp={activeRun.playerState.stats.health} maxHp={activeRun.playerState.stats.maxHealth} mp={activeRun.playerState.stats.mana} maxMp={activeRun.playerState.stats.maxMana} />
            <Card className="border-border/50 bg-card/80 p-1.5 text-xs flex-shrink-0">
                <CardTitle className="text-sm font-display mb-1 text-glow-cyan ml-1">Controls</CardTitle>
                <div className="grid grid-cols-3 gap-1.5 items-center justify-center max-w-[160px] mx-auto">
                    <div></div> <Button variant="secondary" size="sm" className="text-xs h-7 w-full" onClick={() => onMovePlayer('up')} disabled={isLoadingChronicle || !!activeRun.activeBattle || !!activeRun.currentEncounter}><MoveUp size={12}/>N</Button> <div></div>
                    <Button variant="secondary" size="sm" className="text-xs h-7 w-full" onClick={() => onMovePlayer('left')} disabled={isLoadingChronicle || !!activeRun.activeBattle || !!activeRun.currentEncounter}><ArrowLeft size={12}/>W</Button>
                    <Button variant="primary" size="sm" className="text-xs h-7 w-full" onClick={onInteractWithTile} disabled={isLoadingChronicle || !!activeRun.activeBattle || !!activeRun.currentEncounter}><Eye size={12}/>Interact</Button>
                    <Button variant="secondary" size="sm" className="text-xs h-7 w-full" onClick={() => onMovePlayer('right')} disabled={isLoadingChronicle || !!activeRun.activeBattle || !!activeRun.currentEncounter}><ArrowRight size={12}/>E</Button> 
                    <div></div> <Button variant="secondary" size="sm" className="text-xs h-7 w-full" onClick={() => onMovePlayer('down')} disabled={isLoadingChronicle || !!activeRun.activeBattle || !!activeRun.currentEncounter}><MoveDown size={12}/>S</Button> <div></div>
                </div>
            </Card>
            <Card className="border-border/50 bg-card/80 p-1.5 text-xxs space-y-0.5 flex-grow overflow-hidden">
                 <ScrollArea className="h-full pr-1.5"> 
                    <div className="mb-1">
                      <Label htmlFor="spellbook-select" className="text-xs text-glow-cyan font-semibold">Spellbook:</Label>
                      <Select 
                        value={selectedSpellbookId || ''} 
                        onValueChange={handleSpellbookChange}
                        disabled={isLoadingChronicle || !!activeRun.activeBattle}
                      >
                        <SelectTrigger id="spellbook-select" className="w-full h-7 text-xxs ui-select-trigger mt-0.5">
                            <SelectValue placeholder="Select Spellbook" />
                        </SelectTrigger>
                        <SelectContent className="ui-select-content">
                            {availableSpellbooks.map(sb => (
                                <SelectItem key={sb.id} value={sb.id} className="text-xxs ui-select-item">
                                    {sb.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator className="my-0.5 bg-border/30"/>
                    <p className="font-semibold text-glow-cyan text-xs">Inv. ({activeRun.inventory.length}):</p>
                    {activeRun.inventory.length > 0 ? activeRun.inventory.slice(0,2).map(item => <p key={item.id} className="truncate" title={item.description}>{item.name}</p>) : <p className="italic text-muted-foreground/70">Empty</p>}
                    {activeRun.inventory.length > 2 && <p className="italic text-muted-foreground/70">...and {activeRun.inventory.length - 2} more</p>}
                    <Separator className="my-0.5 bg-border/30"/>
                    <p className="font-semibold text-glow-cyan text-xs">Party ({activeRun.companions.length}):</p>
                    {activeRun.companions.length > 0 ? activeRun.companions.map(ally => (
                        <div key={ally.id} className="text-xxs border-b border-border/20 last:border-b-0 py-0.5">
                            <p className="truncate font-medium text-foreground/90">{ally.name} <span className="text-muted-foreground/70">({ally.type})</span></p>
                            <div className="flex items-center justify-between text-xxs">
                                <Heart size={10} className="text-destructive/80 mr-0.5"/>
                                <Progress value={(ally.stats.health / ((ally.stats as ChronicleEntityStats).maxHealth || 50)) * 100} className="w-1/2 h-1" variant={(ally.stats.health / ((ally.stats as ChronicleEntityStats).maxHealth || 50)) < 0.3 ? 'chaos' : 'default'} />
                                <span className="ml-1 w-8 text-right text-muted-foreground">{ally.stats.health}/{(ally.stats as ChronicleEntityStats).maxHealth || 50}</span>
                                <Sparkles size={10} className="text-primary/80 mr-0.5 ml-1"/>
                                <Progress value={(ally.stats.mana / ((ally.stats as ChronicleEntityStats).maxMana || 20)) * 100} className="w-1/2 h-1" variant="law" />
                                <span className="ml-1 w-8 text-right text-muted-foreground">{ally.stats.mana}/{(ally.stats as ChronicleEntityStats).maxMana || 20}</span>
                            </div>
                        </div>
                    )) : <p className="italic text-muted-foreground/70">Solo</p>}
                </ScrollArea>
            </Card>
          </div>

          <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full max-h-full overflow-hidden">
             <DungeonMinimap floorData={currentMapFloor} playerPosition={activeRun.playerPosition} discoveredMap={activeRun.discoveredMap[activeRun.currentFloor] || []} />
             <div className="flex-grow overflow-y-auto pr-1.5 sm:pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent flex flex-col mt-2">
                {renderCurrentEncounter()}
             </div>
          </div>
      </div>

      {evaluationResult && !activeRun.activeBattle && (
         <Alert variant={evaluationResult.isPass ? "default" : "destructive"} className={`mt-2 md:mt-4 ${evaluationResult.isPass ? 'border-primary bg-primary/10' : 'border-destructive bg-destructive/10'}`}>
            <Info className={`h-4 w-4 sm:h-5 sm:w-5 ${evaluationResult.isPass ? 'text-primary' : 'text-destructive'}`} />
            <AlertTitle className={`text-sm sm:text-base ${evaluationResult.isPass ? 'text-glow-gold' : 'text-glow-crimson'}`}>Encounter Outcome (Score: {evaluationResult.score}%)</AlertTitle>
            <AlertDescription className={`text-xxs sm:text-xs ${evaluationResult.isPass ? 'text-primary-foreground/80' : 'text-destructive-foreground/80'}`}>
                {evaluationResult.feedbackOutput?.mainFeedback || evaluationResult.feedback}
                {evaluationResult.feedbackOutput?.growthSuggestions && evaluationResult.feedbackOutput.growthSuggestions.length > 0 && (
                    <div className="mt-1 sm:mt-1.5">
                        <p className="font-semibold">Suggestions:</p>
                        <ul className="list-disc list-inside pl-1 sm:pl-2">
                            {evaluationResult.feedbackOutput.growthSuggestions.map((s,i)=><li key={i}>{s}</li>)}
                        </ul>
                    </div>
                )}
            </AlertDescription>
         </Alert>
      )}
    </div>
  );
}
