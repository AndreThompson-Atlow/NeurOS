'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, CheckCircle2, Lightbulb, BrainCircuit, Puzzle, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Node, EvaluationResult, EpicStep } from '@/types/neuro';

interface EPICPhaseProps {
  currentNode: Node | null;
  currentEpicStep: EpicStep;
  isLoading: boolean;
  probeQuestions: string[];
  evaluationResult: EvaluationResult | null;
  onSubmit: (response: string) => void;
  onProceed: () => void;
  clearEvaluation: () => void;
}

export default function EPICPhase({
  currentNode,
  currentEpicStep,
  isLoading,
  probeQuestions,
  evaluationResult,
  onSubmit,
  onProceed,
  clearEvaluation
}: EPICPhaseProps) {
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
  
  const getEpicStepIcon = () => {
    switch (currentEpicStep) {
      case 'explain':
        return <Lightbulb className="h-5 w-5 mr-2 text-primary" />;
      case 'probe':
        return <BrainCircuit className="h-5 w-5 mr-2 text-primary" />;
      case 'implement':
        return <Puzzle className="h-5 w-5 mr-2 text-primary" />;
      case 'connect':
        return <Network className="h-5 w-5 mr-2 text-primary" />;
      default:
        return <Upload className="h-5 w-5 mr-2 text-primary" />;
    }
  };
  
  const getEpicStepPrompt = () => {
    if (!currentNode.epic) return "No prompt available for this step.";
    
    switch (currentEpicStep) {
      case 'explain':
        return currentNode.epic.explainPrompt || `Explain the concept of ${currentNode.title} in detail.`;
      case 'probe':
        return probeQuestions.length > 0 
          ? probeQuestions[0] 
          : (currentNode.epic.probePrompt || `Answer probing questions about ${currentNode.title}.`);
      case 'implement':
        return currentNode.epic.implementPrompt || `Apply ${currentNode.title} to solve a problem.`;
      case 'connect':
        return currentNode.epic.connectPrompt || `Connect ${currentNode.title} to other concepts you've learned.`;
      default:
        return "Complete this step in the EPIC learning process.";
    }
  };
  
  const getEpicStepDescription = () => {
    switch (currentEpicStep) {
      case 'explain':
        return "Articulate your understanding of the concept";
      case 'probe':
        return "Answer targeted questions to deepen understanding";
      case 'implement':
        return "Apply the concept to solve practical problems";
      case 'connect':
        return "Relate this concept to your existing knowledge network";
      default:
        return "Complete this step in the learning process";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              {getEpicStepIcon()}
              <span>Install Phase: {currentEpicStep.toUpperCase()} - {currentNode.title}</span>
            </CardTitle>
            <CardDescription>
              {getEpicStepDescription()}
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">{currentEpicStep}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!evaluationResult ? (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Your Task:</h3>
              <p>{getEpicStepPrompt()}</p>
            </div>
            
            <Textarea
              placeholder="Type your response here..."
              className="min-h-40"
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
                  {evaluationResult.isPass ? "Excellent work!" : "Needs improvement"}
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
            
            {evaluationResult.rubricScores && Object.keys(evaluationResult.rubricScores).length > 0 && (
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Detailed Evaluation:</h4>
                <ul className="space-y-2">
                  {Object.entries(evaluationResult.rubricScores).map(([key, score]) => (
                    <li key={key} className="flex justify-between text-sm">
                      <span>{score?.label || key}</span>
                      <span className="font-medium">{score?.score}/100</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        {!evaluationResult ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!hasStartedTyping || isLoading || response.trim().length < 20}
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
              Continue to {currentEpicStep === 'connect' ? 'Next Node' : 'Next Step'}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 