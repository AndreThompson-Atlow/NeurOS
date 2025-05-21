
'use client';

import React, { useState, useEffect } from 'react';
import type { EPICChallenge as EPICPromptType } from '@/types/chronicle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, HelpCircle, AlertTriangle, Wand2, Link2, Brain, ShieldCheck } from 'lucide-react';

interface EpicChallengeChronicleProps {
  prompt: EPICPromptType;
  onSubmit: (answer: string) => void;
  spellName: string;
  targetName: string;
  initialAnswer?: string;
  onAnswerChange?: (answer: string) => void;
  isDefensePrompt?: boolean;
}

export function EpicChallengeChronicle({ prompt, onSubmit, spellName, targetName, initialAnswer = '', onAnswerChange, isDefensePrompt = false }: EpicChallengeChronicleProps) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [timeLeft, setTimeLeft] = useState(prompt.timeLimit || null);

  useEffect(() => {
    setAnswer(initialAnswer);
  }, [initialAnswer]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft === 0 && prompt.timeLimit !== undefined) { // Check specifically for timeLimit presence
        onSubmit(""); // Submit empty if time ran out, implying failure or timeout
        return;
    }
    onSubmit(answer);
  };

  const handleLocalAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
    if (onAnswerChange) {
      onAnswerChange(e.target.value);
    }
  };

  const getPromptIcon = () => {
    if (isDefensePrompt) return <ShieldCheck className="text-blue-400"/>;
    switch(prompt.type) {
        case 'explain': return <Lightbulb className="text-secondary"/>;
        case 'probe': return <HelpCircle className="text-yellow-400"/>;
        case 'implement': return <Wand2 className="text-primary"/>;
        case 'connect': return <Link2 className="text-green-400"/>;
        default: return <Brain className="text-secondary"/>;
    }
  }

  const isSubmitDisabled = () => {
    // If time limit is defined and has run out, submission is allowed (as a timeout submission)
    if (prompt.timeLimit !== undefined && timeLeft === 0) return false;
    
    // If it's not an implement prompt OR if it is an implement prompt but time has run out,
    // an empty answer is only allowed if time has run out.
    // Otherwise, if it's an implement prompt, it can be submitted empty if time is NOT up (original behavior was it must not be empty)
    // Let's simplify: an empty answer is disabled unless time is up.
    if (answer.trim() === '' && !(prompt.timeLimit !== undefined && timeLeft === 0)) return true;
    
    return false;
  }

  const challengeTitle = isDefensePrompt ? `Defensive Challenge: ${prompt.type.toUpperCase()}` : `Cognitive Challenge: ${prompt.type.toUpperCase()}`;
  const challengeContextHTML = isDefensePrompt
    ? `To defend against ${targetName || 'the incoming attack'}, respond to the following based on your understanding of ${spellName || 'your defensive knowledge'}:`
    : `To use <span class="text-secondary font-medium">${spellName || 'this ability'}</span> on <span class="text-destructive font-medium">${targetName || 'the target'}</span>, answer the following:`;

  const placeholderNodeIdPart = prompt.referenceNodeId ? prompt.referenceNodeId.split('-').pop() : 'this concept';

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 border border-dashed border-accent rounded-md bg-card/50">
      <div className="flex justify-between items-center">
        <Label htmlFor={`epic-chronicle-input-${prompt.referenceNodeId}`} className="text-sm font-semibold text-glow-cyan flex items-center gap-2">
          {getPromptIcon()} {challengeTitle}
        </Label>
        {timeLeft !== null && (
          <span className={`text-xs font-mono p-1 rounded ${timeLeft <= 10 && timeLeft > 0 ? 'text-destructive animate-pulse' : timeLeft === 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
            Time: {timeLeft > 0 ? `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}` : "00:00"}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground italic" dangerouslySetInnerHTML={{ __html: challengeContextHTML }} />
      <p className="text-sm text-foreground/90 py-1">{prompt.prompt || "No prompt content provided."}</p>
      <Textarea
        id={`epic-chronicle-input-${prompt.referenceNodeId}`}
        value={answer}
        onChange={handleLocalAnswerChange}
        placeholder={`Your insight for node ${placeholderNodeIdPart}...`}
        rows={3}
        className="ui-textarea text-sm"
        required={prompt.type !== 'implement' && !(prompt.timeLimit !== undefined && timeLeft === 0)} // Not required if time is up
        disabled={(prompt.timeLimit !== undefined && timeLeft === 0 && answer.trim() !== "")} // Disable if time is up and they've already typed something (to prevent changing after timeout)
      />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        disabled={isSubmitDisabled()}
      >
        {prompt.timeLimit !== undefined && timeLeft === 0 ? "Submit (Time's Up)" :
         isDefensePrompt ? "Submit Defensive Response" : "Submit Cognitive Action"}
      </Button>
       {prompt.timeLimit !== undefined && timeLeft === 0 && <p className="text-xs text-destructive">Time's up! Your response will be evaluated as is.</p>}
    </form>
  );
}
