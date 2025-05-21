
'use client';

import React, { useState } from 'react';
import type { ScrollEncounterData, Encounter } from '@/types/chronicle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollText, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '../ui/scroll-area'; // Added ScrollArea

interface ScrollInterfaceProps {
  encounter: Encounter; 
  onComplete: (success: boolean, unlockedSpellbookId?: string, unlockedSpellId?: string) => void;
}

export function ScrollInterface({ encounter, onComplete }: ScrollInterfaceProps) {
  const scrollData = encounter.scrollData;
  const [comprehensionAnswers, setComprehensionAnswers] = useState<Record<number, number | undefined>>({});
  const [essayAnswer, setEssayAnswer] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'info' | 'error', message: string} | null>(null);
  const [stage, setStage] = useState<'reading' | 'comprehension' | 'essay' | 'completed'>('reading');

  if (!scrollData) {
    return <div className="p-4 text-muted-foreground text-center italic">Error: Scroll data not found for this encounter.</div>;
  }

  const handleComprehensionChange = (questionIndex: number, optionIndex: number) => {
    setComprehensionAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const evaluateComprehension = (): boolean => {
    if (!scrollData.comprehensionQuestions) return true; 
    return scrollData.comprehensionQuestions.every(
      (q, i) => comprehensionAnswers[i] === q.correctAnswerIndex // Changed from correctAnswer
    );
  };
  
  const evaluateEssay = (): boolean => {
    if (!scrollData.essayPrompt) return true; 
    const keywords = scrollData.relatedNodeId.split('-').pop()?.toLowerCase().split('_') || ['concept'];
    return essayAnswer.trim().length > 30 && keywords.some(kw => essayAnswer.toLowerCase().includes(kw)); 
  };

  const handleSubmitComprehension = () => {
    const success = evaluateComprehension();
    if (success) {
      if (scrollData.essayPrompt) {
        setStage('essay');
        setFeedback({type: 'info', message: 'Comprehension check passed! Now, please write a short essay.'});
      } else {
        setFeedback({type: 'success', message: 'Comprehension check passed! Scroll deciphered.'});
        setStage('completed');
        setTimeout(() => onComplete(true, scrollData.unlockableSpellbookId, scrollData.unlockableSpellId), 1500);
      }
    } else {
      setFeedback({type: 'error', message: 'Some comprehension answers were incorrect. Please review and try again.'});
    }
  };

  const handleSubmitEssay = () => {
    const comprehensionSuccess = evaluateComprehension(); 
    const essaySuccess = evaluateEssay();
    
    if (comprehensionSuccess && essaySuccess) {
      setFeedback({type: 'success', message: 'Excellent! Scroll fully deciphered and insights integrated.'});
      setStage('completed');
      setTimeout(() => onComplete(true, scrollData.unlockableSpellbookId, scrollData.unlockableSpellId), 1500);
    } else if (!comprehensionSuccess) {
       setFeedback({type: 'error', message: 'Please ensure your comprehension answers are correct before submitting the essay.'});
       setStage('comprehension'); 
    } else {
      setFeedback({type: 'error', message: 'Your essay needs more depth or clearer connection to the scroll\'s content. Please revise.'});
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 flex flex-col h-full"> {/* Standardized outer div and flex for footer */}
      {/* <CardHeader className="bg-muted/30">
        <CardTitle className="text-xl font-display text-glow-cyan flex items-center gap-2">
            <ScrollText /> Scroll: {scrollData.scrollTitle}
        </CardTitle>
      </CardHeader> */}
      <CardContent className="p-1 space-y-3 flex-grow overflow-hidden"> {/* Reduced padding, added flex-grow and overflow-hidden */}
        {stage === 'reading' && (
          <>
            <ScrollArea className="p-3 bg-background/50 border border-border/50 rounded-md max-h-[250px] sm:max-h-[300px] scrollbar-thin">
              <p className="text-foreground whitespace-pre-line text-sm">{scrollData.content}</p>
            </ScrollArea>
            <Button onClick={() => setStage('comprehension')} variant="secondary" size="sm">Proceed to Comprehension Check</Button>
          </>
        )}

        {stage === 'comprehension' && scrollData.comprehensionQuestions && (
          <ScrollArea className="space-y-3 max-h-[300px] sm:max-h-[350px] pr-2 scrollbar-thin">
            <h3 className="text-md font-semibold text-glow-cyan mb-2">Comprehension Questions:</h3>
            {scrollData.comprehensionQuestions.map((q, qIndex) => (
              <div key={qIndex} className="p-2 border border-border/30 rounded-md mb-2 bg-muted/20">
                <p className="text-sm mb-1.5 text-foreground/90">{q.question}</p>
                <RadioGroup onValueChange={(value) => handleComprehensionChange(qIndex, parseInt(value))} className="pl-1">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(oIndex)} id={`q${qIndex}-opt${oIndex}`} className="border-primary/70 text-primary"/>
                      <Label htmlFor={`q${qIndex}-opt${oIndex}`} className="text-xs sm:text-sm font-normal text-muted-foreground hover:text-foreground">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <Button onClick={handleSubmitComprehension} variant="secondary" size="sm" className="mt-2">Submit Comprehension</Button>
          </ScrollArea>
        )}

        {stage === 'essay' && scrollData.essayPrompt && (
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-glow-cyan">Essay Prompt:</h3>
            <p className="text-sm italic text-muted-foreground">{scrollData.essayPrompt}</p>
            <Textarea
              value={essayAnswer}
              onChange={(e) => setEssayAnswer(e.target.value)}
              placeholder="Write your essay here..."
              rows={6} // Increased rows for better essay writing experience
              className="ui-textarea text-sm"
            />
            <Button onClick={handleSubmitEssay} variant="secondary" size="sm">Submit Essay</Button>
          </div>
        )}
        
        {feedback && (
          <div className={`mt-2 p-2 rounded-md text-sm flex items-center gap-1.5 ${feedback.type === 'error' ? 'bg-destructive/10 text-destructive border-destructive/50' : feedback.type === 'success' ? 'bg-primary/10 text-primary border-primary/50' : 'bg-muted/30 text-muted-foreground border-border/30'}`}>
            {feedback.type === 'error' ? <AlertCircle size={16} /> : feedback.type === 'success' ? <CheckCircle size={16}/> : <MessageSquare size={16}/>}
            {feedback.message}
          </div>
        )}
      </CardContent>
      {/* <CardFooter className="p-3 border-t border-border/20 mt-auto">
        <p className="text-xs text-muted-foreground italic">
          Thoroughly understanding ancient scrolls can unlock new knowledge and abilities.
        </p>
      </CardFooter> */}
    </div>
  );
}
