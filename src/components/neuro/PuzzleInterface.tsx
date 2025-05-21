
'use client';

import React, { useState } from 'react';
import type { PuzzleEncounterData, Encounter } from '@/types/chronicle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'; // Added HelpCircle

interface PuzzleInterfaceProps {
  encounter: Encounter; 
  onComplete: (success: boolean) => void;
}

export function PuzzleInterface({ encounter, onComplete }: PuzzleInterfaceProps) {
  const puzzleData = encounter.puzzleData;
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  if (!puzzleData) {
    return <div className="p-4 text-muted-foreground text-center italic">Error: Puzzle data not found for this encounter.</div>;
  }

  const handleSubmit = () => {
    setAttempts(prev => prev + 1);
    const isCorrect = answer.trim().toLowerCase() === String(puzzleData.solution).toLowerCase();

    if (isCorrect) {
      setFeedback('Correct! Puzzle solved.');
      setTimeout(() => onComplete(true), 1500);
    } else if (puzzleData.attemptsAllowed && attempts + 1 >= puzzleData.attemptsAllowed) {
      setFeedback('Incorrect. No more attempts remaining.');
      setTimeout(() => onComplete(false), 1500);
    } else {
      setFeedback('Incorrect. Try again.');
      if (puzzleData.hints && revealedHints.length < puzzleData.hints.length && puzzleData.hints[revealedHints.length]) {
        setRevealedHints(prev => [...prev, puzzleData.hints![prev.length]]);
      }
    }
  };

  const requestHint = () => {
    if (puzzleData.hints && revealedHints.length < puzzleData.hints.length && puzzleData.hints[revealedHints.length]) {
        setRevealedHints(prev => [...prev, puzzleData.hints![prev.length]]);
      }
  }

  return (
    <div className="w-full max-w-xl mx-auto my-4"> {/* Standardized outer div */}
      {/* Card removed as per ChronicleDisplay's structure, now part of it */}
      {/* <CardHeader className="bg-muted/30">
        <CardTitle className="text-xl font-display text-glow-cyan flex items-center gap-2">
            <Lightbulb /> Puzzle: {encounter.title || "Unnamed Puzzle"}
        </CardTitle>
      </CardHeader> */}
      <div className="p-1 space-y-3"> {/* Reduced padding from p-4 */}
        <p className="text-sm text-muted-foreground">{puzzleData.description}</p>
        <div className="p-3 bg-background/50 border border-border/50 rounded-md max-h-60 overflow-y-auto scrollbar-thin">
            <p className="text-foreground whitespace-pre-line">{typeof puzzleData.content === 'string' ? puzzleData.content : JSON.stringify(puzzleData.content)}</p>
        </div>
        
        {revealedHints.length > 0 && (
            <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-secondary">Hints Revealed:</h4>
                <ul className="list-disc list-inside pl-4 text-muted-foreground">
                    {revealedHints.map((hint, i) => <li key={i}>{hint}</li>)}
                </ul>
            </div>
        )}

        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your solution..."
          rows={3}
          className="ui-textarea text-sm"
        />

        {feedback && (
          <p className={`text-sm flex items-center gap-1.5 ${feedback.includes('Correct') ? 'text-primary' : 'text-destructive'}`}>
            {feedback.includes('Correct') ? <CheckCircle size={16} /> : <AlertCircle size={16}/>}
            {feedback}
          </p>
        )}
      </div>
      <CardFooter className="p-3 border-t border-border/20 flex justify-between items-center mt-3"> {/* Reduced padding */}
        <Button onClick={handleSubmit} 
                variant="secondary"
                size="sm"
                disabled={(puzzleData.attemptsAllowed !== undefined && attempts >= puzzleData.attemptsAllowed) || (feedback?.includes('Correct') ?? false)}>
          Submit Solution
        </Button>
        {puzzleData.hints && puzzleData.hints.length > 0 && revealedHints.length < puzzleData.hints.length && (
            <Button onClick={requestHint} variant="outline" size="sm">
                <HelpCircle size={14} className="mr-1"/> Request Hint ({puzzleData.hints.length - revealedHints.length} left)
            </Button>
        )}
         {puzzleData.attemptsAllowed !== undefined && (
            <p className="text-xs text-muted-foreground">
                Attempts: {attempts}/{puzzleData.attemptsAllowed}
            </p>
        )}
      </CardFooter>
    </div>
  );
}
