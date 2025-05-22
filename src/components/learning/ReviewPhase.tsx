'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RotateCcw, CheckCircle2, AlarmClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Node, EvaluationResult } from '@/types/neuro';

// Extend Node type for review properties
interface ReviewNode extends Node {
  review?: {
    reviewPrompt?: string;
    lastReviewedDate?: Date;
    memoryStrength?: number;
  };
}

interface ReviewPhaseProps {
  currentNode: ReviewNode | null;
  isLoading: boolean;
  lastReviewedDate?: Date;
  memoryStrength?: number;
  onSubmit: (response: string) => void;
  evaluationResult: EvaluationResult | null;
  onComplete: () => void;
  clearEvaluation: () => void;
}

export default function ReviewPhase({
  currentNode,
  isLoading,
  lastReviewedDate,
  memoryStrength = 0,
  onSubmit,
  evaluationResult,
  onComplete,
  clearEvaluation
}: ReviewPhaseProps) {
  const [response, setResponse] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('review');
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value);
    if (!hasStartedTyping && e.target.value.length > 0) {
      setHasStartedTyping(true);
    }
  };
  
  const handleSubmit = () => {
    if (!response.trim()) return;
    onSubmit(response);
  };
  
  const handleTryAgain = () => {
    clearEvaluation();
    setResponse('');
    setHasStartedTyping(false);
  };
  
  if (!currentNode) return null;
  
  const formatLastReviewed = () => {
    if (!lastReviewedDate) return 'Never';
    
    // Format date as relative time (e.g., "2 days ago")
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastReviewedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };
  
  const getReviewPrompt = () => {
    if (currentNode.review?.reviewPrompt) {
      return currentNode.review.reviewPrompt;
    }
    // Fallback to generating a review prompt based on node data
    return `Explain the concept of ${currentNode.title} in your own words, covering the key aspects and its significance.`;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <RotateCcw className="h-5 w-5 mr-2 text-primary" />
              <span>Review Phase: {currentNode.title}</span>
            </CardTitle>
            <CardDescription>
              Strengthen your memory of previously learned concepts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <AlarmClock className="h-3 w-3 mr-1" />
              Last reviewed: {formatLastReviewed()}
            </Badge>
            <Badge variant={memoryStrength > 75 ? "default" : memoryStrength > 40 ? "secondary" : "outline"}>
              Memory strength: {memoryStrength}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="review" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="reference">Reference Material</TabsTrigger>
          </TabsList>
          
          <TabsContent value="review" className="space-y-4">
            {!evaluationResult ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Review Task:</h3>
                  <p>{getReviewPrompt()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Answer without looking at your notes to strengthen recall
                  </p>
                  <Textarea
                    placeholder="Type your response here..."
                    className="min-h-32"
                    value={response}
                    onChange={handleTextChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant={evaluationResult.isPass ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {evaluationResult.isPass ? <CheckCircle2 className="h-4 w-4" /> : null}
                    <AlertTitle>
                      {evaluationResult.isPass ? "Good recall!" : "Memory needs strengthening"}
                    </AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    {evaluationResult.overallFeedback}
                  </AlertDescription>
                </Alert>
                
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Your Response:</h4>
                  <p className="text-sm">{response}</p>
                </div>
                
                {evaluationResult.isPass && (
                  <Progress value={Math.min(100, memoryStrength + 10)} className="mt-2" />
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reference" className="space-y-4">
            <div className="prose max-w-none">
              <h3>Definition</h3>
              <p>{currentNode.shortDefinition}</p>
              
              <h3>Key Points</h3>
              <p>{currentNode.download?.clarification}</p>
              
              <h3>Example</h3>
              <p>{currentNode.download?.example}</p>
            </div>
            <Alert>
              <AlertDescription>
                Using the reference material during review is fine, but trying to recall without it first will strengthen your memory more effectively.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        {!evaluationResult ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!hasStartedTyping || isLoading || response.trim().length < 10 || activeTab !== 'review'}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Response
          </Button>
        ) : (
          <div className="flex w-full justify-between">
            <Button variant="outline" onClick={handleTryAgain}>
              Try Again
            </Button>
            <Button onClick={onComplete} disabled={!evaluationResult.isPass}>
              Complete Review
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 