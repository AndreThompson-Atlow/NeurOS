
'use client';

import React, { useState, useEffect } from 'react';
import type { DiscussionEncounterData, DialogueNode, Encounter } from '@/types/chronicle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MessageSquare, User, CheckCircle, AlertCircle } from 'lucide-react';
import { getCharacterById as getCharacterDetails } from '@/lib/server/characters'; // Updated import path
import { ScrollArea } from '../ui/scroll-area';


interface DiscussionInterfaceProps {
  encounter: Encounter; 
  onComplete: (success: boolean, recruitedCompanionId?: string) => void;
}

export function DiscussionInterface({ encounter, onComplete }: DiscussionInterfaceProps) {
  const discussionData = encounter.discussionData;
  const [currentDialogueNodeId, setCurrentDialogueNodeId] = useState<string | null>(null);
  const [currentDialogueNode, setCurrentDialogueNode] = useState<DialogueNode | null>(null);
  const [speakerName, setSpeakerName] = useState('System');
  const [dialogueHistory, setDialogueHistory] = useState<{speaker: string, text: string}[]>([]);
  const [feedback, setFeedback] = useState<{type: 'success' | 'info' | 'error', message: string} | null>(null);


  useEffect(() => {
    if (discussionData) {
      const initialNodeId = discussionData.initialPrompt ? '_initial' : discussionData.dialogueTree[0]?.id;
      setCurrentDialogueNodeId(initialNodeId);
      if (initialNodeId === '_initial' && discussionData.initialPrompt) {
        setDialogueHistory([{ speaker: discussionData.npcId, text: discussionData.initialPrompt }]);
      }
    }
  }, [discussionData]);

  useEffect(() => {
    if (discussionData && currentDialogueNodeId) {
      let node;
      if (currentDialogueNodeId === '_initial' && discussionData.initialPrompt) {
        node = {
          id: '_initial',
          text: discussionData.initialPrompt,
          speakerId: discussionData.npcId,
          responses: discussionData.dialogueTree
            .filter(n => n.conditions === undefined || n.conditions?.initial === true) // Simplified condition check
            .map(n => ({ 
              id: `resp_to_${n.id}`,
              text: n.responses?.[0]?.text || `Discuss: ${n.text.substring(0, 30)}...`, // Try to get actual response text
              nextNodeId: n.id,
            }))
        };
        if (dialogueHistory.length === 0 || dialogueHistory[dialogueHistory.length-1].text !== node.text) {
             // Handled in initial useEffect
        }
      } else {
        node = discussionData.dialogueTree.find(n => n.id === currentDialogueNodeId);
      }
      
      setCurrentDialogueNode(node || null);

      if (node?.speakerId && node.speakerId !== 'player') {
        getCharacterDetails(node.speakerId).then(char => {
          const name = char?.name || 'Narrator';
          setSpeakerName(name);
          if (node && (dialogueHistory.length === 0 || dialogueHistory[dialogueHistory.length-1].text !== node.text)) {
            setDialogueHistory(prev => [...prev, {speaker: name, text: node.text}]);
          }
        });
      } else if (node?.speakerId === 'player') {
        setSpeakerName('You');
        // Player's "text" is their chosen response, handled in handleResponseClick
      } else if (node) {
        setSpeakerName('Narrator');
         if (dialogueHistory.length === 0 || dialogueHistory[dialogueHistory.length-1].text !== node.text) {
            setDialogueHistory(prev => [...prev, {speaker: 'Narrator', text: node.text}]);
          }
      }

    }
  }, [currentDialogueNodeId, discussionData, dialogueHistory]);


  if (!discussionData || !currentDialogueNode) {
    return <div className="p-4 text-muted-foreground text-center italic">Loading discussion... If this persists, the encounter might be misconfigured.</div>;
  }

  const handleResponseClick = (responseNodeId: string, responseText: string) => {
    // Add player's chosen response to history
    setDialogueHistory(prev => [...prev, {speaker: "You", text: responseText}]);
    setFeedback(null); // Clear previous feedback

    const nextNode = discussionData.dialogueTree.find(n => n.id === responseNodeId);
    
    if (nextNode?.triggersBattleId) {
        setFeedback({type: 'error', message: `Discussion failed! ${nextNode.speakerId || 'Opponent'} initiates battle!`});
        setTimeout(() => onComplete(false), 2000); 
        return;
    }
    if (nextNode?.triggersRecruitmentId) {
        setFeedback({type: 'success', message: `${nextNode.speakerId || 'Character'} agrees to join you!`});
        setTimeout(() => onComplete(true, nextNode.triggersRecruitmentId), 2000);
        return;
    }
    if (nextNode?.endsDiscussion || !nextNode) {
        setFeedback({type: 'info', message: 'The discussion concludes.'});
        setTimeout(() => onComplete(true), 2000); 
        return;
    }
    setCurrentDialogueNodeId(responseNodeId);
  };


  return (
    <div className="w-full max-w-2xl mx-auto my-4 flex flex-col h-full"> {/* Standardized outer div */}
      {/* <CardHeader className="bg-muted/30">
        <CardTitle className="text-xl font-display text-glow-cyan flex items-center gap-2">
            <MessageSquare /> Discussion: {encounter.title}
        </CardTitle>
      </CardHeader> */}
      <ScrollArea className="flex-grow p-1 mb-2 pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent max-h-[250px] sm:max-h-[300px]">
        <div className="space-y-2.5 text-sm">
            {dialogueHistory.map((entry, index) => (
                <div key={index} className={`flex ${entry.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2 rounded-lg max-w-[80%] ${entry.speaker === 'You' ? 'bg-secondary/20 text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                       <p className={`text-xs font-semibold mb-0.5 ${entry.speaker === 'You' ? 'text-secondary' : 'text-foreground/90'}`}>{entry.speaker}:</p>
                       <p className="whitespace-pre-line text-xs sm:text-sm">{entry.text}</p>
                    </div>
                </div>
            ))}
        </div>
      </ScrollArea>
      
      {currentDialogueNode.responses && currentDialogueNode.responses.length > 0 && !feedback && (
        <div className="mt-auto pt-2 border-t border-border/30">
          <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Your possible responses:</h4>
          <div className="space-y-1.5">
            {currentDialogueNode.responses.map((response) => (
              <Button
                key={response.id}
                variant="outline"
                size="sm" 
                className="w-full justify-start text-left text-xs h-auto py-1.5 px-2 border-secondary/50 text-secondary hover:bg-secondary/10 hover:text-secondary"
                onClick={() => handleResponseClick(response.nextNodeId, response.text)}
              >
                {response.text}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {!currentDialogueNode.responses && !feedback && (
           <div className="mt-auto pt-2 border-t border-border/30">
             <Button onClick={() => onComplete(true)} variant="secondary" size="sm">Continue</Button>
           </div>
      )}

      {feedback && (
        <div className={`mt-auto pt-2 p-2 rounded-md text-sm flex items-center gap-1.5 ${feedback.type === 'error' ? 'bg-destructive/10 text-destructive border-destructive/50' : feedback.type === 'success' ? 'bg-primary/10 text-primary border-primary/50' : 'bg-muted/30 text-muted-foreground border-border/30'}`}>
          {feedback.type === 'error' ? <AlertCircle size={16} /> : feedback.type === 'success' ? <CheckCircle size={16}/> : <MessageSquare size={16}/>}
          {feedback.message}
        </div>
      )}

      {/* <CardFooter className="p-3 border-t border-border/20 mt-auto">
        <p className="text-xs text-muted-foreground italic">
            Engage in dialogue to progress. Your choices may have consequences.
        </p>
      </CardFooter> */}
    </div>
  );
}

