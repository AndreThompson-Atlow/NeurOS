'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { KnowledgeCheckQuestion as KnowledgeCheckQuestionType } from '@/types/neuro';

interface KnowledgeCheckQuestionProps {
  question: KnowledgeCheckQuestionType;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function KnowledgeCheckQuestion({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  isLastQuestion
}: KnowledgeCheckQuestionProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const isCorrect = selectedAnswer === question.correctOptionIndex;

  useEffect(() => {
    setShowFeedback(false);
  }, [question.id]);
  
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowFeedback(true);
  };
  
  const handleNext = () => {
    setShowFeedback(false);
    onNext();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Knowledge Check</span>
          <span className="text-sm font-normal">Question {currentIndex + 1} of {totalQuestions}</span>
        </CardTitle>
        <CardDescription>
          Test your understanding of this concept with multiple-choice questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium mb-6">{question.question}</div>
        
        <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => onSelectAnswer(parseInt(value))}>
          {question.options.map((option, index) => (
            <div key={index} className={`flex items-center space-x-2 p-3 rounded-md ${showFeedback && index === question.correctOptionIndex ? 'bg-green-50 border border-green-200' : ''} ${showFeedback && selectedAnswer === index && index !== question.correctOptionIndex ? 'bg-red-50 border border-red-200' : ''}`}>
              <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showFeedback} />
              <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                {option}
                {showFeedback && index === question.correctOptionIndex && (
                  <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-600" />
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {showFeedback && (
          <Alert variant={isCorrect ? "default" : "destructive"} className="mt-4">
            <div className="flex items-center gap-2">
              {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>{isCorrect ? "Correct!" : "Incorrect"}</AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {question.explanation}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showFeedback ? (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedAnswer === null}
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {isLastQuestion ? "Complete" : "Next Question"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 