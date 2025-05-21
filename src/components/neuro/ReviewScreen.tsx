'use client';

import type { Module, ActiveReviewSession, ReviewSessionNode, EpicStep, EvaluationResult as NeuroEvaluationResult } from '@/types/neuro';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, BookCheck, Loader2, ChevronRight, RefreshCw, Edit3 } from 'lucide-react';
import { NodeDisplay } from '@/components/neuro/NodeDisplay';
import { useLearningSession } from '@/hooks/useLearningSession';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ThoughtAnalyzerPanel } from './ThoughtAnalyzerPanel'; 

interface ReviewScreenProps {
  onExit: () => void;
}

export function ReviewScreen({ onExit }: ReviewScreenProps) {
  const { 
    activeReviewSession,
    startReviewSession,
    startManualReviewSession, 
    hasStandardReviewNodes, 
    hasManualReviewNodes, 
    evaluationResult, 
    submitEpicResponse,
    clearEvaluationResult,
    isLoading: isLoadingEvaluation, 
    probeQuestions,
    fetchProbeQuestions,
    currentModule, 
    currentNode, 
    currentInteraction,
    setCurrentInteraction, 
    currentEpicStep, 
    advanceReviewSession, 
    isListening,
    isLoadingSTT,
    startRecording,
    stopRecording,
    setVoiceTranscriptTarget,
    isVoiceModeActive,
    updateNodeStatus, 
    handleProceedAfterSuccess,
  } = useLearningSession(); 

  const { toast } = useToast();
  const [localEvaluationResult, setLocalEvaluationResult] = useState<NeuroEvaluationResult | null>(evaluationResult);
  const [epicInput, setEpicInput] = useState(''); // To hold input for NodeDisplay

  useEffect(() => {
    setLocalEvaluationResult(evaluationResult);
  }, [evaluationResult]);

  const handleReviewSubmit = async (response: string) => {
    if (!currentNode || !currentModule || !activeReviewSession) return;
    clearEvaluationResult(); 
    await submitEpicResponse(response); 
  };

  useEffect(() => {
    if (localEvaluationResult && activeReviewSession && currentInteraction === 'reviewing' && currentNode && currentModule) {
      const nodeToUpdate = currentNode;
      const currentDomain = currentModule.domains.find(d => d.id === nodeToUpdate.domainId);
      const currentDomainIndex = currentModule.domains.findIndex(d => d.id === nodeToUpdate.domainId);
      const currentNodeIndex = currentDomain?.nodes.findIndex(n => n.id === nodeToUpdate.id) ?? -1;

      if (currentDomainIndex !== -1 && currentNodeIndex !== -1) {
        const { score, isPass } = localEvaluationResult;
        const oldMemoryStrength = nodeToUpdate.memoryStrength || 50;
        
        let strengthChange = 0;
        if (isPass) {
            strengthChange = score >= 95 ? 30 : (score >= 90 ? 25 : 20);
        } else {
            strengthChange = score >= 60 ? -5 : (score >= 40 ? -10 : -15);
        }
        const newMemoryStrength = Math.max(0, Math.min(100, oldMemoryStrength + strengthChange));
        
        updateNodeStatus(
          nodeToUpdate.moduleId,
          currentDomainIndex, 
          currentNodeIndex,
          isPass ? 'understood' : 'needs_review', 
          nodeToUpdate.familiar, 
          isPass ? true : nodeToUpdate.understood, 
          new Date(),
          newMemoryStrength
        );
      }
    }
  }, [localEvaluationResult, activeReviewSession, currentInteraction, currentNode, currentModule, updateNodeStatus]);

  const handleRevise = () => {
    clearEvaluationResult();
    setLocalEvaluationResult(null);
    // Keep epicInput for revision
  };


  if (!activeReviewSession) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <Card className="shadow-cyan-md" data-alignment="neutral">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-glow-cyan flex items-center justify-center gap-2">
              <BookCheck size={24} className="text-secondary" /> Node Review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground">Ready to reinforce your knowledge?</p>
            <div className="space-y-3">
                <Button 
                    onClick={startReviewSession} 
                    variant="primary" 
                    size="lg" 
                    className="w-full btn-primary-neuro"
                    disabled={!hasStandardReviewNodes}
                >
                    <BookCheck size={18} className="mr-1.5" /> Start Standard Review ({hasStandardReviewNodes ? 'Nodes Due' : 'None Due'})
                </Button>
                <Button 
                    onClick={startManualReviewSession} 
                    variant="secondary" 
                    size="lg" 
                    className="w-full btn-secondary-neuro"
                    disabled={!hasManualReviewNodes}
                >
                   <RefreshCw size={18} className="mr-1.5" /> Start Manual Study Session
                </Button>
            </div>
            <Button variant="outline" size="sm" onClick={onExit} className="mt-6 border-destructive text-destructive hover:bg-destructive/10">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const progressPercentage = activeReviewSession.nodesToReview.length > 0 
    ? ((activeReviewSession.currentNodeIndex) / activeReviewSession.nodesToReview.length) * 100 
    : 0;
  
  const totalNodesInSession = activeReviewSession.nodesToReview.length;
  const reviewingNodeNumber = activeReviewSession.currentNodeIndex + 1;

  return (
    <div className="container mx-auto px-spacing-sm md:px-spacing-lg max-w-4xl">
      <Card className="shadow-cyan-md" data-alignment="neutral">
        <CardHeader className="bg-muted/30 p-spacing-sm rounded-t-lg border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-display text-glow-cyan flex items-center gap-spacing-xs">
              <BookCheck size={24} className="text-secondary" /> Node Review Session
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExit} className="border-destructive text-destructive hover:bg-destructive/10 text-xs h-8 px-2">
              <ArrowLeft size={16} className="mr-1" /> Exit Review
            </Button>
          </div>
          {totalNodesInSession > 0 && (
            <>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground/80 mt-spacing-xs">
                Reviewing node {reviewingNodeNumber} of {totalNodesInSession}. Current Node: {currentNode?.title || 'Loading...'} ({currentEpicStep})
              </CardDescription>
              <Progress value={progressPercentage} className="mt-spacing-xs h-2 ui-progress" variant="neutralProgress" />
            </>
          )}
        </CardHeader>
        <CardContent className="p-spacing-sm md:p-spacing-md">
          {currentNode && currentModule ? (
             <NodeDisplay
                node={currentNode}
                phase={'install'} 
                probeQuestions={probeQuestions} 
                isLoadingProbe={isLoadingEvaluation && currentEpicStep === 'probe'} 
                isLoadingEvaluation={isLoadingEvaluation}
                evaluationResult={localEvaluationResult} 
                currentEpicStep={currentEpicStep} 
                currentInteraction="reviewing"
                onFetchProbe={fetchProbeQuestions} 
                onSubmitRecall={() => {}} 
                onSubmitEpic={handleReviewSubmit} 
                onProceedAfterSuccess={() => { 
                    if (reviewingNodeNumber < totalNodesInSession) {
                        clearEvaluationResult();
                        setLocalEvaluationResult(null);
                        setEpicInput(''); // Clear input for next node
                        advanceReviewSession();
                    } else {
                        onExit(); 
                    }
                }}
                clearEvaluationResult={() => {
                  clearEvaluationResult();
                  setLocalEvaluationResult(null);
                }}
                moduleTags={currentModule.tags}
                activeModule={currentModule}
                isListening={isListening}
                isLoadingSTT={isLoadingSTT}
                startRecording={startRecording}
                stopRecording={stopRecording}
                setVoiceTranscriptTarget={setVoiceTranscriptTarget} // Assuming NodeDisplay accepts setEpicInput for voice
                isVoiceModeActive={isVoiceModeActive}
            />
          ) : (
             <div className="text-muted-foreground text-center py-8 italic flex flex-col items-center justify-center min-h-[200px]">
                {totalNodesInSession > 0 ? 
                    <>
                        <Loader2 className="animate-spin h-8 w-8 text-secondary mb-spacing-sm"/>
                        <span>Loading next node for review...</span>
                    </>
                    : 
                    <span>No nodes currently need review. Great job!</span>
                }
             </div>
          )}

          {/* This part is now handled within NodeDisplay's renderInstallPhase logic */}
          {/* {localEvaluationResult && (
            <div className="mt-spacing-md">
              <ThoughtAnalyzerPanel
                userInput={epicInput} // Or however you get the input from NodeDisplay
                evaluationResult={localEvaluationResult}
                judgingCharacterId={currentModule?.defaultCompanion || 'neuros'}
                onResubmit={!localEvaluationResult.isPass ? handleRevise : undefined}
              />
            </div>
          )} */}

        </CardContent>
         {/* This footer is now also conditionally rendered or actions integrated into NodeDisplay */}
         {/* {totalNodesInSession > 0 && currentNode && localEvaluationResult && localEvaluationResult.isPass && (
            <CardFooter className="p-spacing-sm border-t border-border/30 flex justify-end">
                 {reviewingNodeNumber < totalNodesInSession ? (
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => {
                           clearEvaluationResult(); 
                           setLocalEvaluationResult(null);
                           setEpicInput('');
                           advanceReviewSession();
                        }}
                        className="btn-secondary-neuro"
                    >
                        Next Node <ChevronRight/>
                    </Button>
                 ) : (
                     <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => {
                            clearEvaluationResult();
                            setLocalEvaluationResult(null);
                            onExit();
                        }}
                        className="btn-primary-neuro"
                    >
                        Finish Review Session
                    </Button>
                 )}
            </CardFooter>
        )} */}
      </Card>
    </div>
  );
}
