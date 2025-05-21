
'use client';

import React, { useState, useEffect } from 'react';
import type { BattleState, BattleParticipant, Ability, BattleActionRequest, EPICChallenge as EPICPromptType, Enemy, CoreEntityTypeManifestation, CoreEntityType } from '@/types/chronicle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EpicChallengeChronicle } from './EpicChallengeChronicle';
import { PlayerStatusBar } from './PlayerStatusBar';
import { Target, Swords, Shield, Wand2, Heart, Sparkles, Ghost, Bot, User as UserIcon, ShieldQuestion, Users, Skull, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '../ui/separator';
import { ENTITY_DEFINITIONS_EXPORT } from '@/data/chronicle-data'; // Updated import

interface BattleInterfaceProps {
  initialBattleState: BattleState;
  onProcessAction: (action: BattleActionRequest) => void;
  onBattleComplete: (didWin: boolean) => void;
  onSubmitDefense: (answer: string, battleAction: BattleActionRequest) => void; 
}

const getParticipantIcon = (participant: BattleParticipant) => {
    const entityType = participant.type || (participant as Enemy).type || 'unknown_entity'; 
    const definition = ENTITY_DEFINITIONS_EXPORT[entityType as CoreEntityType] || ENTITY_DEFINITIONS_EXPORT.unknown_entity;
    
    switch(definition.manifestation) {
        case 'Demons': return <Ghost size={14} className="mr-1 text-destructive"/>; 
        case 'Angels': return <Bot size={14} className="mr-1 text-primary"/>;     
        case 'Neutral Agents': return <UserIcon size={14} className="mr-1 text-yellow-400"/>; 
        case 'Recruitable Allies': return <Users size={14} className="mr-1 text-green-400"/>; 
        default: 
            if (participant.isPlayer) return <UserIcon size={14} className="mr-1 text-secondary"/>;
            return <ShieldQuestion size={14} className="mr-1 text-muted-foreground"/>;
    }
};

const ParticipantCard: React.FC<{ participant: BattleParticipant, isPlayerTurn?: boolean, onSelectTarget?: (id: string) => void, selectedTargetId?: string | null, isActor: boolean }> = ({ participant, isPlayerTurn, onSelectTarget, selectedTargetId, isActor }) => {
    const entityType = participant.type || (participant as Enemy).type || 'unknown_entity';
    const definition = ENTITY_DEFINITIONS_EXPORT[entityType as CoreEntityType] || ENTITY_DEFINITIONS_EXPORT.unknown_entity;
    const alignment = definition.alignment;
    
    let borderColorClass = 'border-border/50 hover:border-border';
    if (alignment === 'law') borderColorClass = 'border-primary/50 hover:border-primary';
    else if (alignment === 'chaos') borderColorClass = 'border-destructive/50 hover:border-destructive';
    else if (alignment === 'neutral') borderColorClass = 'border-secondary/50 hover:border-secondary';
    else if (alignment === 'varies' && participant.isAlly) borderColorClass = 'border-green-500/50 hover:border-green-500';


    const isTargetable = onSelectTarget && participant.stats.health > 0 && 
                        ((participant.isPlayer || participant.isAlly) ? !isPlayerTurn : isPlayerTurn); 

    return (
        <Card 
            className={`p-2 text-xs transition-all duration-200 relative overflow-hidden
                ${borderColorClass}
                ${selectedTargetId === participant.id && isTargetable ? 'ring-2 ring-offset-1 ring-accent shadow-accent/30 shadow-md' : ''}
                ${isActor ? 'ring-2 ring-accent shadow-accent/30 shadow-lg scale-105 z-10' : 'hover:scale-[1.02]'}
                ${participant.stats.health <=0 ? 'opacity-50 grayscale filter contrast-50' : ''}
                ${isTargetable ? 'cursor-pointer' : 'cursor-default'}
                bg-card/70 backdrop-blur-sm
                `} 
            onClick={() => isTargetable && onSelectTarget ? onSelectTarget(participant.id) : null}
        >
            <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold flex items-center ${participant.isPlayer || participant.isAlly ? 'text-glow-cyan' : 'text-glow-crimson'}`}>{getParticipantIcon(participant)}{participant.name}</span>
            </div>
            <div className="space-y-0.5">
                <div className="flex items-center justify-between text-xxs">
                    <Heart size={10} className="text-destructive/80 mr-1"/>
                    <Progress value={(participant.stats.health / participant.stats.maxHealth) * 100} className="w-2/3 h-1.5" variant={participant.stats.health < participant.stats.maxHealth * 0.3 ? 'chaos' : (participant.isPlayer || participant.isAlly ? 'default' : 'law')} />
                    <span className="ml-1 w-10 text-right">{participant.stats.health}/{participant.stats.maxHealth}</span>
                </div>
                <div className="flex items-center justify-between text-xxs">
                    <Sparkles size={10} className="text-primary/80 mr-1"/>
                    <Progress value={(participant.stats.mana / participant.stats.maxMana) * 100} className="w-2/3 h-1.5" variant="law" />
                    <span className="ml-1 w-10 text-right">{participant.stats.mana}/{participant.stats.maxMana}</span>
                </div>
                <div className="flex flex-wrap gap-0.5 mt-1 text-xxs">
                  {participant.stats.elementalWeaknesses && participant.stats.elementalWeaknesses.length > 0 && <Badge variant="destructive" className="px-1 py-0 text-xxs">Weak: {participant.stats.elementalWeaknesses.join(', ').substring(0,15)}</Badge>}
                  {participant.stats.elementalResistances && participant.stats.elementalResistances.length > 0 && <Badge variant="secondary" className="px-1 py-0 text-xxs bg-green-500/20 border-green-500/50 text-green-300">Resist: {participant.stats.elementalResistances.join(', ').substring(0,15)}</Badge>}
                </div>
            </div>
             {isActor && <div className="absolute top-0 right-0 px-1 py-0.5 bg-accent text-accent-foreground text-xxs rounded-bl-md">ACTIVE</div>}
        </Card>
    );
};


export function BattleInterface({ initialBattleState, onProcessAction, onBattleComplete, onSubmitDefense }: BattleInterfaceProps) {
  const [battleState, setBattleState] = useState<BattleState>(initialBattleState);
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [cognitiveChallengeAnswer, setCognitiveChallengeAnswer] = useState('');
  const [showCognitiveChallenge, setShowCognitiveChallenge] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<'spell' | 'defend' | null>(null);


  const playerActor = battleState.participants.find(p => p.id === battleState.currentTurnActorId && (p.isPlayer || p.isAlly));
  const isDefendingPlayerAction = battleState.isPlayerTurn && battleState.defendingPlayerId === playerActor?.id && battleState.currentPrompt?.type === 'implement';

  useEffect(() => {
    setBattleState(initialBattleState);
    setSelectedSpellId(null);
    setSelectedTargetId(null);
    setCognitiveChallengeAnswer('');
    setShowCognitiveChallenge(false);
    setCurrentActionType(null);
  }, [initialBattleState]);

  useEffect(() => {
    if (battleState.status === 'playerVictory' || battleState.status === 'playerDefeat') { // Updated status values
      const timer = setTimeout(() => {
        onBattleComplete(battleState.status === 'playerVictory');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [battleState.status, onBattleComplete]);

  const handleSpellSelect = (spell: Ability) => { 
    if (playerActor && playerActor.stats.mana >= spell.manaCost && spell.epicType) {
      setSelectedSpellId(spell.id);
      setCurrentActionType('spell');
      if (spell.target === 'self' || spell.target === 'all_allies' || spell.target === 'all_enemies') {
         setSelectedTargetId(playerActor.id); 
         // setShowCognitiveChallenge(true); // Challenge shown when target is confirmed or if target selection is not needed
      } else {
        // User needs to select a target
      }
    } else if (playerActor && playerActor.stats.mana < spell.manaCost) {
      // TODO: Show "Not enough mana" toast
    } else if (!spell.epicType && playerActor) { 
         onProcessAction({type: 'spell', spellId: spell.id, targetId: selectedTargetId || playerActor?.id}); 
    }
  };
  
  useEffect(() => {
    if (currentActionType === 'spell' && selectedSpellId && selectedTargetId && playerActor) {
        const spell = playerActor.abilities.find(s => s.id === selectedSpellId);
        if (spell?.epicType) { 
            setShowCognitiveChallenge(true);
        }
    } else if (isDefendingPlayerAction) {
        setCurrentActionType('defend');
        setShowCognitiveChallenge(true);
    }
  }, [selectedSpellId, selectedTargetId, currentActionType, playerActor, isDefendingPlayerAction, battleState.currentPrompt]);


  const handleCognitiveChallengeSubmit = (answer: string) => {
    if (!currentActionType || !battleState.currentPrompt) return;

    let action: BattleActionRequest;

    if (currentActionType === 'spell') {
        if (!selectedSpellId || !selectedTargetId) return;
        action = {
          type: 'spell',
          spellId: selectedSpellId,
          targetId: selectedTargetId,
          cognitiveResponse: {
            promptId: battleState.currentPrompt.referenceNodeId, 
            answer: answer,
          },
        };
        onProcessAction(action);
    } else if (currentActionType === 'defend') {
        action = {
          type: 'defend', 
          cognitiveResponse: {
            promptId: battleState.currentPrompt.referenceNodeId,
            answer: answer,
          },
        };
        onSubmitDefense(answer, action); 
    }
    
    setShowCognitiveChallenge(false);
    setSelectedSpellId(null);
    setSelectedTargetId(null);
    setCognitiveChallengeAnswer('');
    setCurrentActionType(null);
  };

  if (!battleState) return <div className="p-4 text-center text-muted-foreground">Loading Battle...</div>;
  
  const currentActorName = battleState.participants.find(p => p.id === battleState.currentTurnActorId)?.name || 'Unknown';
  const currentSpellForChallenge = playerActor?.abilities.find(s => s.id === selectedSpellId);
  const currentTargetForChallenge = battleState.participants.find(p => p.id === selectedTargetId);

  const promptForDisplay = showCognitiveChallenge 
    ? (currentActionType === 'defend' 
        ? battleState.currentPrompt 
        : (currentSpellForChallenge ? { 
            type: currentSpellForChallenge.epicType, 
            prompt: `To effectively use ${currentSpellForChallenge.name}, ${currentSpellForChallenge.description}`, 
            referenceNodeId: currentSpellForChallenge.moduleReference?.nodeId || 'general_knowledge_node',
            difficulty: currentSpellForChallenge.effectPower > 20 ? 3 : 2, 
            keywords: [], 
          } as EPICPromptType : null)
      )
    : null;

  return (
    <Card className="shadow-cyan-md w-full max-w-4xl mx-auto" data-alignment="neutral"> 
      <CardHeader className="bg-muted/30 p-3 rounded-t-lg border-b">
        <CardTitle className="text-xl font-display flex items-center justify-between text-glow-cyan">
          <span><Swords size={20} className="mr-2 text-secondary"/>Battle In Progress!</span>
          <Badge variant={battleState.isPlayerTurn ? "secondary" : "destructive"} className="text-sm">
            Turn: {currentActorName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
                <h4 className="text-md font-semibold mb-1.5 text-glow-cyan">Player Party</h4>
                <div className="space-y-1.5">
                    {battleState.playerParty.map(p => <ParticipantCard key={p.id} participant={p} isPlayerTurn={battleState.isPlayerTurn} onSelectTarget={setSelectedTargetId} selectedTargetId={selectedTargetId} isActor={p.id === battleState.currentTurnActorId}/>)}
                </div>
            </div>
            <div>
                <h4 className="text-md font-semibold mb-1.5 text-glow-crimson">Enemy Party</h4>
                <div className="space-y-1.5">
                     {battleState.enemyParty.map(e => <ParticipantCard key={e.id} participant={e as BattleParticipant} isPlayerTurn={battleState.isPlayerTurn} onSelectTarget={setSelectedTargetId} selectedTargetId={selectedTargetId} isActor={e.id === battleState.currentTurnActorId} />)} {/* Cast to BattleParticipant */}
                     {isDefendingPlayerAction && battleState.currentPrompt && <p className="text-xs text-muted-foreground italic">Defensive Challenge: {battleState.currentPrompt.prompt}</p>}
                </div>
            </div>
        </div>
        
        <Separator className="my-3 bg-border/50"/>

        {battleState.status === 'ongoing' && battleState.isPlayerTurn && playerActor && (
          <div className="space-y-2">
            <h4 className="text-md font-semibold text-glow-cyan">Your Turn: {playerActor.name}</h4>
            {!showCognitiveChallenge ? (
              <>
                <p className="text-xs text-muted-foreground">Select a spell and then a target.</p>
                <ScrollArea className="h-24 border rounded-md p-2 bg-background/30">
                  <div className="flex flex-wrap gap-1.5">
                    {playerActor.abilities.map(spell => (
                      <Button
                        key={spell.id}
                        variant={selectedSpellId === spell.id ? "primary" : "outline"}
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => handleSpellSelect(spell)}
                        disabled={(playerActor.stats.mana < spell.manaCost) || (!spell.epicType && (!selectedTargetId && spell.target !== 'self' && spell.target !== 'all_allies'))}
                      >
                        {spell.name} (MP: {spell.manaCost})
                        {!spell.epicType && <span className="text-yellow-400/70 ml-1 text-xxs">(No Challenge)</span>}
                        {playerActor.stats.mana < spell.manaCost && <span className="text-destructive/70 ml-1 text-xxs">(Low MP)</span>}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
                {selectedSpellId && !selectedTargetId && currentSpellForChallenge && currentSpellForChallenge.target !== 'self' && currentSpellForChallenge.target !== 'all_allies' && currentSpellForChallenge.target !== 'all_enemies' && (
                  <p className="text-xs text-yellow-400 animate-pulse">Please select a target for '{currentSpellForChallenge.name}'.</p>
                )}
              </>
            ) : promptForDisplay && (
              <EpicChallengeChronicle
                prompt={promptForDisplay}
                onSubmit={handleCognitiveChallengeSubmit}
                spellName={currentActionType === 'spell' ? currentSpellForChallenge?.name || 'Action' : 'Defensive Maneuver'}
                targetName={currentActionType === 'spell' ? currentTargetForChallenge?.name || 'Target' : 'Incoming Attack'}
                initialAnswer={cognitiveChallengeAnswer}
                onAnswerChange={setCognitiveChallengeAnswer}
                isDefensePrompt={currentActionType === 'defend'}
              />
            )}
          </div>
        )}

        {battleState.status === 'playerVictory' && ( 
            <div className="p-3 bg-primary/10 border border-primary/50 rounded-md text-center">
                <CheckCircle size={32} className="text-primary mx-auto mb-2"/>
                <p className="font-semibold text-lg text-glow-gold">VICTORY!</p>
                <p className="text-xs text-primary-foreground/80">All enemies defeated.</p>
                {battleState.rewards?.items && battleState.rewards.items.length > 0 && (
                    <p className="text-xs mt-1">Rewards: {battleState.rewards.items.map(i => i.name).join(', ')}</p>
                )}
            </div>
        )}
        {battleState.status === 'playerDefeat' && ( 
             <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md text-center">
                <Skull size={32} className="text-destructive mx-auto mb-2"/>
                <p className="font-semibold text-lg text-glow-crimson">DEFEAT!</p>
                <p className="text-xs text-destructive-foreground/80">Your party has fallen.</p>
            </div>
        )}
         {!battleState.isPlayerTurn && battleState.status === 'ongoing' && (
            <div className="text-center p-3 text-muted-foreground italic">
                {currentActorName} is contemplating their move...
            </div>
        )}

        <Card className="mt-2 max-h-32 bg-muted/30 border-border/50">
          <CardHeader className="p-1.5 border-b border-border/30"><CardTitle className="text-xs text-glow-cyan ml-1">Battle Log</CardTitle></CardHeader>
          <CardContent className="p-1.5 text-xxs">
            <ScrollArea className="h-24 pr-1">
              {battleState.battleLog.slice().reverse().map((log, index) => (
                <p key={index} className={`mb-0.5 ${index === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground/80'}`}>{log}</p>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
