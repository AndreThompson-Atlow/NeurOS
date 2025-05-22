'use client';

import type { Module, ActiveReviewSession, ReviewSessionNode, EpicStep, EvaluationResult as NeuroEvaluationResult, Node as NeuroNode } from '@/types/neuro';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, BookCheck, Loader2, ChevronRight, RefreshCw, Edit3, Clock, BrainCircuit } from 'lucide-react';
import { NodeDisplay } from '@/components/neuro/NodeDisplay';
import { useLearningSession } from '@/hooks/useLearningSession';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ThoughtAnalyzerPanel } from './ThoughtAnalyzerPanel'; 
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ReviewScreenProps {
  onExit: () => void;
}

interface ScheduledReview {
  nodeId: string;
  moduleId: string;
  nodeTitle: string;
  moduleTitle: string;
  memoryStrength: number;
  dueDate: Date;
  epicComponent: string;
  isDue: boolean;
  isDueToday: boolean;
  isDueThisWeek: boolean;
  completedToday: boolean;
  lastReviewed: Date | null;
  priorityScore: number;
  node: NeuroNode;
}

// Helper function for the UI
function getMemoryStrengthVariant(strength: number) {
  if (strength < 40) return 'destructive';
  if (strength < 75) return 'secondary';
  return 'default';
}

// Get weighted EPIC component based on our spaced repetition design
function getWeightedEpicComponent(): EpicStep {
  const rand = Math.random();
  if (rand < 0.4) return 'probe';         // 40% chance - most effective for recall
  if (rand < 0.7) return 'explain';       // 30% chance - good for reinforcement
  if (rand < 0.9) return 'implement';     // 20% chance - practical application
  return 'connect';                       // 10% chance - connecting concepts
} 

export function ReviewScreen({ onExit }: ReviewScreenProps) {
  const { 
    userModules,
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
    setVoiceTranscriptTarget,
    isVoiceModeActive,
    updateNodeStatus, 
    handleProceedAfterSuccess,
  } = useLearningSession(); 

  const { toast } = useToast();
  const [localEvaluationResult, setLocalEvaluationResult] = useState<NeuroEvaluationResult | null>(evaluationResult);
  const [epicInput, setEpicInput] = useState(''); // To hold input for NodeDisplay
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'overdue'>('upcoming');
  
  // Get scheduled reviews using our spaced repetition system
  const { reviews, totalCount } = useGetScheduledReviews(viewMode);

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

  // This hook implements our spaced repetition system to get scheduled reviews
  function useGetScheduledReviews(viewMode: string): { reviews: ScheduledReview[], totalCount: number } {
    const [reviews, setReviews] = useState<ScheduledReview[]>([]);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    
    useEffect(() => {
      const allNodes: ScheduledReview[] = [];
      const allReviewableNodes: ScheduledReview[] = [];
      
      // Calculate memory decay based on time since last review
      const calculateMemoryDecay = (node: NeuroNode): number => {
        if (!node.lastReviewed) return 0; // No decay for nodes never reviewed
        
        const now = new Date();
        const lastReviewed = new Date(node.lastReviewed);
        const hoursSinceReview = (now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60);
        const currentStrength = node.memoryStrength || 0;
        
        // Calculate decay rate based on memory strength
        let decayRate = 0;
        if (currentStrength < 20) decayRate = 5;        // Fast decay for weak memories
        else if (currentStrength < 40) decayRate = 2;   // Significant decay
        else if (currentStrength < 60) decayRate = 1;   // Moderate decay
        else if (currentStrength < 75) decayRate = 0.5; // Slow decay
        else if (currentStrength < 90) decayRate = 0.2; // Very slow decay
        else decayRate = 0.1;                           // Minimal decay for strong memories
        
        // Calculate decay amount based on time and rate
        const decayAmount = Math.min(currentStrength, decayRate * (hoursSinceReview / 24)); // Daily decay
        return Math.max(0, decayAmount);
      };
      
      // Calculate when a node is due for review based on memory strength
      const calculateReviewDueDate = (node: NeuroNode): Date => {
        const lastReviewed = node.lastReviewed ? new Date(node.lastReviewed) : new Date(0);
        const currentStrength = node.memoryStrength || 0;
        
        // Define intervals in hours based on memory strength
        let intervalHours = 1; // Default to 1 hour
        if (currentStrength < 20) intervalHours = 1;      // 1 hour
        else if (currentStrength < 40) intervalHours = 24;     // 1 day 
        else if (currentStrength < 60) intervalHours = 48;     // 2 days
        else if (currentStrength < 75) intervalHours = 96;     // 4 days
        else if (currentStrength < 90) intervalHours = 168;    // 1 week
        else intervalHours = 336;                              // 2 weeks
        
        const dueDate = new Date(lastReviewed);
        dueDate.setHours(dueDate.getHours() + intervalHours);
        return dueDate;
      };
      
      Object.values(userModules).forEach(module => {
        if ((module as Module).status !== 'installed') return;
        
        if (!(module as Module).domains) return;
        (module as Module).domains.forEach(domain => {
          domain.nodes.forEach(node => {
            if (!node.understood && node.status !== 'needs_review') return;
            
            // Apply memory decay to get current memory strength
            const memoryDecay = calculateMemoryDecay(node);
            const currentMemoryStrength = Math.max(0, (node.memoryStrength || 0) - memoryDecay);
            
            // Calculate when this node is due for review
            const reviewDueDate = calculateReviewDueDate(node);
            const now = new Date();
            const isDue = reviewDueDate <= now;
            
            // Check if due today
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const isDueToday = reviewDueDate <= tomorrow;
            
            // Check if due this week
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            const isDueThisWeek = reviewDueDate <= nextWeek;
            
            // Calculate priority score based on multiple factors
            const hoursOverdue = isDue 
              ? Math.max(0, (now.getTime() - reviewDueDate.getTime()) / (1000 * 3600)) 
              : 0;
            
            const priorityScore = 
              (node.status === 'needs_review' ? 200 : 0) +   // Explicitly marked gets highest priority
              Math.min(hoursOverdue, 200) +                  // More overdue = higher priority (capped)
              (100 - currentMemoryStrength);                 // Weaker memory = higher priority
            
            // Get a weighted EPIC component for better reviews
            const epicComponent = getWeightedEpicComponent();
            
            const reviewNode = {
              nodeId: node.id,
              moduleId: module.id,
              nodeTitle: node.title,
              moduleTitle: (module as Module).title,
              memoryStrength: currentMemoryStrength,
              dueDate: reviewDueDate,
              epicComponent,
              isDue,
              isDueToday,
              isDueThisWeek,
              completedToday: false,
              lastReviewed: node.lastReviewed ? new Date(node.lastReviewed) : null,
              priorityScore,
              node: node
            };
            
            // Add to all reviewable nodes (for total count)
            allReviewableNodes.push(reviewNode);
            
            // Add to filtered list based on view mode
            if (
              (viewMode === 'all') ||
              (viewMode === 'upcoming' && isDueThisWeek) ||
              (viewMode === 'overdue' && isDue)
            ) {
              allNodes.push(reviewNode);
            }
          });
        });
      });
      
      // Sort by priority score
      allNodes.sort((a, b) => b.priorityScore - a.priorityScore);
      allReviewableNodes.sort((a, b) => b.priorityScore - a.priorityScore);
      
      setReviews(allNodes);
      setTotalReviews(allReviewableNodes.length);
    }, [userModules, viewMode]);
    
    // Return both the filtered reviews and total count
    return { reviews, totalCount: totalReviews };
  }

  function ReviewCard({ review }: { review: ScheduledReview }) {
    const isDue = review.isDue;
    
    return (
      <Card className={`p-spacing-sm border-l-4 ${isDue ? 'border-l-destructive' : 'border-l-secondary'}`}>
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium text-sm">{review.nodeTitle}</h4>
            <p className="text-xs text-muted-foreground">{review.moduleTitle} • {review.epicComponent}</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-xs">
              <Clock className="h-3 w-3 mr-spacing-xs" />
              <span className={isDue ? 'text-destructive font-medium' : ''}>
                {isDue ? 'Overdue: ' : 'Due: '}
                {formatDistanceToNow(review.dueDate, { addSuffix: true })}
              </span>
            </div>
            <div className="mt-spacing-xs">
              <Badge variant={getMemoryStrengthVariant(review.memoryStrength)}>
                Memory: {review.memoryStrength}%
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="mt-spacing-xs">
          <div className="flex justify-between text-xs mb-spacing-xs">
            <span>Memory Strength</span>
            <span>{review.memoryStrength}%</span>
          </div>
          <Progress value={review.memoryStrength} className="h-1" />
        </div>
      </Card>
    );
  }

  if (!activeReviewSession) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col gap-spacing-md">
          {/* Review Start Panel */}
          <div className="w-full">
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
                        variant="default" 
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

          {/* Memory Dashboard */}
          <div className="w-full">
            <Card className="shadow-cyan-md border-t-4 border-t-cyan-500">
              <CardHeader className="p-spacing-sm border-b bg-cyan-900/10">
                <CardTitle className="text-md flex items-center justify-between text-cyan-500">
                  <div className="flex items-center">
                    <BrainCircuit className="mr-spacing-sm text-cyan-500" /> Memory Dashboard
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-spacing-sm">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-1 mb-spacing-md">
                  <div className="p-2 bg-muted/30 rounded-md border border-border/20 text-center">
                    <div className="text-xs text-muted-foreground">Due Today</div>
                    <div className="text-lg font-bold text-destructive">{reviews.filter(r => r.isDueToday).length}</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md border border-border/20 text-center">
                    <div className="text-xs text-muted-foreground">This Week</div>
                    <div className="text-lg font-bold text-amber-500">{reviews.filter(r => r.isDueThisWeek).length}</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md border border-border/20 text-center">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-lg font-bold text-primary">{totalCount}</div>
                  </div>
                </div>

                {/* Tabs for different views */}
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="mb-spacing-sm grid grid-cols-3 h-8">
                    <TabsTrigger value="upcoming" onClick={() => setViewMode('upcoming')} className="text-xs">Upcoming</TabsTrigger>
                    <TabsTrigger value="overdue" onClick={() => setViewMode('overdue')} className="text-xs">Overdue</TabsTrigger>
                    <TabsTrigger value="all" onClick={() => setViewMode('all')} className="text-xs">All</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="max-h-[40vh] overflow-y-auto">
                    <div className="space-y-spacing-sm">
                      {reviews.length === 0 ? (
                        <div className="text-center text-muted-foreground p-2 text-sm">
                          No upcoming reviews
                        </div>
                      ) : (
                        reviews.map(review => (
                          <ReviewCard key={review.nodeId} review={review} />
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="overdue" className="max-h-[40vh] overflow-y-auto">
                    <div className="space-y-spacing-sm">
                      {reviews.filter(r => r.isDue).length === 0 ? (
                        <div className="text-center text-muted-foreground p-2 text-sm">
                          No overdue reviews
                        </div>
                      ) : (
                        reviews.filter(r => r.isDue).map(review => (
                          <ReviewCard key={review.nodeId} review={review} />
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all" className="max-h-[40vh] overflow-y-auto">
                    <div className="space-y-spacing-sm">
                      {reviews.length === 0 ? (
                        <div className="text-center text-muted-foreground p-2 text-sm">
                          No nodes to review
                        </div>
                      ) : (
                        reviews.map(review => (
                          <ReviewCard key={review.nodeId} review={review} />
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  const progressPercentage = activeReviewSession.nodesToReview.length > 0 
    ? ((activeReviewSession.currentNodeIndex) / activeReviewSession.nodesToReview.length) * 100 
    : 0;
  
  const totalNodesInSession = activeReviewSession.nodesToReview.length;
  const reviewingNodeNumber = activeReviewSession.currentNodeIndex + 1;

  return (
    <div className="container mx-auto px-spacing-sm md:px-spacing-lg max-w-6xl">
      <div className="flex flex-col md:flex-row gap-spacing-md">
        {/* Main Review Panel */}
        <div className="flex-1">
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
                  startRecording={() => {}}
                  stopRecording={async () => null}
                  setVoiceTranscriptTarget={setVoiceTranscriptTarget}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
