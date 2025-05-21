'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Node, EvaluationResult } from '@/types/neuro';

interface DownloadPhaseProps {
  currentNode: Node | null;
  isLoading: boolean;
  onSubmit: (response: string) => void;
  evaluationResult: EvaluationResult | null;
  onProceed: () => void;
  clearEvaluation: () => void;
}

export default function DownloadPhase({
  currentNode,
  isLoading,
  onSubmit,
  evaluationResult,
  onProceed,
  clearEvaluation
}: DownloadPhaseProps) {
  const [response, setResponse] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  
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
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2 text-primary" />
              <span>Download Phase: {currentNode.title}</span>
            </CardTitle>
            <CardDescription>
              Build foundational knowledge by recalling key concepts
            </CardDescription>
          </div>
          <Badge variant="outline">Node {currentNode.id}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose max-w-none">
          <h3>Definition</h3>
          <p>{currentNode.shortDefinition}</p>
          
          <h3>Key Context</h3>
          <p>{currentNode.download.clarification}</p>
          
          <h3>Example</h3>
          <p>{currentNode.download.example}</p>
        </div>
        
        {!evaluationResult ? (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Active Recall</h3>
            <p className="text-sm text-muted-foreground">
              {currentNode.download.recallPrompt || `Explain the concept of ${currentNode.title} in your own words.`}
            </p>
            <Textarea
              placeholder="Type your response here..."
              className="min-h-32"
              value={response}
              onChange={handleTextChange}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant={evaluationResult.isPass ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {evaluationResult.isPass ? <CheckCircle2 className="h-4 w-4" /> : null}
                <AlertTitle>
                  {evaluationResult.isPass ? "Well done!" : "Needs improvement"}
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
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        {!evaluationResult ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!hasStartedTyping || isLoading || response.trim().length < 10}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Response
          </Button>
        ) : (
          <div className="flex w-full justify-between">
            <Button variant="outline" onClick={handleTryAgain}>
              Try Again
            </Button>
            <Button onClick={onProceed} disabled={!evaluationResult.isPass}>
              Continue
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 