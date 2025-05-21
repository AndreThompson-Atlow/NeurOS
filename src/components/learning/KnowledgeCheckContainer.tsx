'use client';

import React from 'react';
import { KnowledgeCheckQuestion } from './KnowledgeCheckQuestion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { KnowledgeCheckQuestion as KnowledgeCheckQuestionType } from '@/types/neuro';

interface KnowledgeCheckContainerProps {
  questions: KnowledgeCheckQuestionType[];
  currentIndex: number;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  onCompleteKnowledgeChecks: () => void;
  isLoading: boolean;
}

export default function KnowledgeCheckContainer({
  questions,
  currentIndex,
  selectedAnswer,
  onSelectAnswer,
  onCompleteKnowledgeChecks,
  isLoading
}: KnowledgeCheckContainerProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4">Loading knowledge checks...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Knowledge Checks</CardTitle>
          <CardDescription>
            No knowledge checks available for this node.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Ready to proceed to active recall.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onCompleteKnowledgeChecks}>
            Continue to Active Recall
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      onSelectAnswer(-1);
    } else {
      onCompleteKnowledgeChecks();
    }
  };
  
  return (
    <KnowledgeCheckQuestion
      question={questions[currentIndex]}
      currentIndex={currentIndex}
      totalQuestions={questions.length}
      selectedAnswer={selectedAnswer}
      onSelectAnswer={onSelectAnswer}
      onNext={handleNext}
      isLastQuestion={currentIndex >= questions.length - 1}
    />
  );
} 