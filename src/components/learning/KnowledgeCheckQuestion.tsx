'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  const [showExplanation, setShowExplanation] = useState(false);
  
  const handleOptionClick = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer after selection
    onSelectAnswer(index);
    // Auto-show explanation when an answer is selected
    setShowExplanation(true);
  };
  
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;
  
  // Calculate if the selected answer is correct
  const isCorrect = selectedAnswer === question.correctOptionIndex;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Knowledge Check</CardTitle>
            <CardDescription>
              Test your understanding of key concepts
            </CardDescription>
          </div>
          <Badge variant="outline">Question {currentIndex + 1} of {totalQuestions}</Badge>
        </div>
        <Progress className="mt-2" value={progressPercentage} />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="prose max-w-none">
          <h3 className="text-lg font-medium">{question.question}</h3>
        </div>
        
        <div className="space-y-2">
          {question.options.map((option, index) => {
            let variantClass = "border hover:bg-muted/50 transition-colors";
            
            // Styling based on selection and correctness
            if (selectedAnswer !== null) {
              if (index === question.correctOptionIndex) {
                variantClass = "bg-success/20 border-success text-success";
              } else if (index === selectedAnswer) {
                variantClass = "bg-destructive/20 border-destructive text-destructive";
              }
            }
            
            return (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-md cursor-pointer ${variantClass}`}
                onClick={() => handleOptionClick(index)}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-semibold ${
                  selectedAnswer !== null && index === question.correctOptionIndex 
                    ? 'bg-success text-white border-success' 
                    : 'bg-background border-input'
                }`}>
                  {selectedAnswer !== null && index === question.correctOptionIndex ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span>{String.fromCharCode(65 + index)}</span> // A, B, C, etc.
                  )}
                </div>
                <p className={`${
                  selectedAnswer !== null && index === question.correctOptionIndex 
                    ? 'font-medium' 
                    : ''
                }`}>{option}</p>
              </div>
            );
          })}
        </div>
        
        {showExplanation && selectedAnswer !== null && (
          <div className={`p-4 rounded-md ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-medium mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                <p className="text-sm">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-6">
        <div className="flex justify-between w-full">
          {selectedAnswer !== null && !showExplanation ? (
            <Button 
              variant="outline"
              onClick={() => setShowExplanation(true)}
            >
              Show Explanation
            </Button>
          ) : (
            <div /> // Empty div for spacing
          )}
          
          <Button 
            onClick={onNext} 
            disabled={selectedAnswer === null}
          >
            {isLastQuestion ? 'Complete Knowledge Check' : 'Next Question'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 