'use client';

import type { Node, LearningPhase, EvaluationResult, EpicStep, Module as NeuroModule, NodeEPIC, UserProfile } from '@/types/neuro';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Check, BrainCircuit, Lightbulb, Search, Wrench, Link as LinkIcon, Loader2, CheckCircle, AlertTriangle, Info, FileText as FileTextIcon, HelpCircle, ExternalLink, MessageSquare, Mic, MicOff, ArrowRight, EyeOff, Eye, Edit3, Volume2, VolumeX } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDefinition } from '@/data/glossary';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThoughtAnalyzerPanel } from './ThoughtAnalyzerPanel'; 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getAlignmentStyling } from './utils'; 
import { cn } from "@/lib/utils";
import { SidebarPanelLeft } from './SidebarPanelLeft';
import { SidebarPanelRight } from './SidebarPanelRight';
import { MultiPersonaChatPanel } from './MultiPersonaChatPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Character } from '@/types/characterTypes';
import type { GenerateReadingDialogueOutput, DialogueTurn as GenkitDialogueTurn } from '@/ai/flows/types/generateReadingDialogueTypes';


interface NodeDisplayProps {
  node: Node | null;
  phase: LearningPhase;
  probeQuestions: string[];
  isLoadingProbe: boolean;
  isLoadingEvaluation: boolean;
  evaluationResult: EvaluationResult | null;
  currentEpicStep: EpicStep;
  currentInteraction: string;
  onFetchProbe: () => void;
  onSubmitRecall: (response: string) => void;
  onSubmitEpic: (response: string) => void;
  onProceedAfterSuccess: () => void;
  clearEvaluationResult: () => void;
  moduleTags?: string[];
  activeModule?: NeuroModule | null;
  isListening: boolean;
  isLoadingSTT: boolean;
  startRecording: () => void;
  stopRecording: () => Promise<string | null>;
  setVoiceTranscriptTarget: (setter: React.Dispatch<React.SetStateAction<string>>) => void;
  isVoiceModeActive: boolean;
  allAiCharacters?: Character[]; 
  guideCharacter?: Character | null; 
  generateNodeDialogue?: (
    node: Node, 
    module: NeuroModule, 
    domain: NeuroModule['domains'][0], 
    personalities: string[], 
    previousDialogue?: GenkitDialogueTurn[]
  ) => Promise<GenerateReadingDialogueOutput>;
  isLoadingDialogue?: boolean;
  currentUserProfile?: NeuroUserProfile;
  speakText?: (text: string) => Promise<void>;
  stopSpeaking?: () => void;
  isSpeaking?: boolean;
}

export function NodeDisplay({
  node,
  phase,
  probeQuestions,
  isLoadingProbe,
  isLoadingEvaluation,
  evaluationResult,
  currentEpicStep,
  currentInteraction,
  onFetchProbe,
  onSubmitRecall,
  onSubmitEpic,
  onProceedAfterSuccess,
  clearEvaluationResult: clearEvaluationResultCallback,
  moduleTags = [],
  activeModule,
  isListening,
  isLoadingSTT,
  startRecording,
  stopRecording,
  setVoiceTranscriptTarget,
  isVoiceModeActive,
  allAiCharacters = [],
  guideCharacter,
  generateNodeDialogue,
  isLoadingDialogue = false,
  currentUserProfile,
  speakText,
  stopSpeaking,
  isSpeaking = false,
  isLoadingTTS = false,
}: NodeDisplayProps) {
  const [recallInput, setRecallInput] = useState('');
  const [epicInput, setEpicInput] = useState('');
  const [showAttentionCheck, setShowAttentionCheck] = useState(true);
  const [showRecall, setShowRecall] = useState(false);
  const [hideContentForRecall, setHideContentForRecall] = useState(false);
  const [activeTermDefinition, setActiveTermDefinition] = useState<{ term: string, definition: string, type: 'keyTerm' | 'moduleTag' } | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const prevNodeId = useRef<string | null | undefined>(null);
  
  const alignmentPropsForModule = getAlignmentStyling(activeModule?.alignmentBias);
  const currentDomainDetails = useMemo(() => {
    if (!node || !activeModule || !(activeModule as NeuroModule).domains) return null;
    return (activeModule as NeuroModule).domains.find(d => d.id === node.domainId) || null;
  }, [node, activeModule]);

  const isNodeFamiliar = useMemo(() => node?.familiar || node?.status === 'familiar' || node?.status === 'understood', [node]);
  const isNodeUnderstood = useMemo(() => node?.understood || node?.status === 'understood', [node]);

  useEffect(() => {
    const nodeChanged = node?.id !== prevNodeId.current;
    prevNodeId.current = node?.id;

    // Reset states when node changes
    if (nodeChanged) {
        if (!evaluationResult) { 
          clearEvaluationResultCallback();
        }
        setActiveTermDefinition(null);
        setRecallInput('');
        setEpicInput('');
        setShowAttentionCheck(true);
        setShowRecall(false);
        setHideContentForRecall(false);
    }
  }, [node?.id, evaluationResult, clearEvaluationResultCallback]);

  useEffect(() => {
    if (!node) {
        return;
    }

    const currentNodeFamiliar = node.familiar || node.status === 'familiar' || node.status === 'understood';
    const currentNodeUnderstood = node.understood || node.status === 'understood'; 
    const isNodeNewAndNotReviewed = !currentNodeFamiliar && node.status === 'new' && currentInteraction !== 'reviewing';

    // Only update these states if we're not in the middle of a node transition
    // This prevents triggering state updates during render
    if (prevNodeId.current === node.id) {
        if (currentInteraction === 'reviewing') {
            setShowAttentionCheck(false);
            setShowRecall(false); 
            setHideContentForRecall(false); 
        } else if (phase === 'download' && isNodeNewAndNotReviewed) {
            if (evaluationResult && !evaluationResult.isPass && showRecall) {
                setShowAttentionCheck(false);
                setHideContentForRecall(true);
            } else if (showRecall && (!evaluationResult || !evaluationResult.isPass)) { 
                setShowAttentionCheck(false);
                setHideContentForRecall(true); 
            } else if (evaluationResult && evaluationResult.isPass && showRecall) { 
                setShowAttentionCheck(false);
                setShowRecall(true); 
                setHideContentForRecall(false); 
            } 
            // Don't override showAttentionCheck here, let the node change effect handle it
        } else if (phase === 'install' && (currentInteraction === 'learning' && (node.status === 'familiar' || node.status === 'downloaded') || (node.status === 'installing' && !currentNodeUnderstood))) {
            setShowAttentionCheck(false);
            setShowRecall(false);
            setHideContentForRecall(false);
        } else { 
            setShowAttentionCheck(false);
            setShowRecall(false);
            setHideContentForRecall(false);
        }
    }
  }, [node, phase, currentEpicStep, evaluationResult, currentInteraction, showRecall, isNodeUnderstood]);
  
  // Separate effect for probe fetching to avoid nested state updates during render
  useEffect(() => {
    if (node && phase === 'install' && currentInteraction === 'learning' && 
        (node.status === 'familiar' || node.status === 'downloaded' || (node.status === 'installing' && !isNodeUnderstood)) && 
        probeQuestions.length === 0 && !isLoadingProbe && currentEpicStep === 'probe' && 
        (!evaluationResult || evaluationResult.isPass)) {
        onFetchProbe();
    }
  }, [node, phase, currentEpicStep, evaluationResult, currentInteraction, isLoadingProbe, probeQuestions.length, onFetchProbe, isNodeUnderstood]);


  const showEPIC = phase === 'install' && (currentInteraction === 'reviewing' || (node && (node.status === 'familiar' || node.status === 'downloaded' || (node.status === 'installing' && !isNodeUnderstood) || node.status === 'needs_review')));


  if (!node || !activeModule) {
    return <div className="p-spacing-lg text-muted-foreground text-center">Loading node details...</div>;
  }

  const handleAttentionCheckComplete = () => {
    if (currentInteraction === 'reviewing') {
        setShowAttentionCheck(false);
        setShowRecall(false); 
        setHideContentForRecall(false);
    } else {
        clearEvaluationResultCallback();
        setShowAttentionCheck(false);
        setShowRecall(true);
        setHideContentForRecall(true); 
        toast({ description: "Content now hidden. Explain the concept in your own words.", className: "bg-card border-secondary text-foreground" });
    }
  };

   const handleRecallSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoadingEvaluation) return;
        setVoiceTranscriptTarget(setRecallInput);
        onSubmitRecall(recallInput);
   };

   const handleEpicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showEPIC || isLoadingEvaluation) return;
        setVoiceTranscriptTarget(setEpicInput);
        onSubmitEpic(epicInput);
   };

  const handleVoiceInputToggle = async (targetSetter: React.Dispatch<React.SetStateAction<string>>) => {
      if (isVoiceModeActive) {
          try {
              setVoiceTranscriptTarget(targetSetter);
              if (isListening) {
                  const transcript = await stopRecording();
                  if (transcript) {
                      targetSetter(prev => prev + ' ' + transcript);
                  }
              } else {
                  startRecording();
              }
          } catch (error) {
              console.error("Error with voice recording:", error);
              toast({ variant: "destructive", description: "Failed to process voice input." });
          }
      }
  };

  const handleReviseAnswer = () => {
      clearEvaluationResultCallback();
      if (phase === 'download') {
          setHideContentForRecall(false);
      }
  };

  const renderEvaluationFeedbackPanel = () => {
      if (!evaluationResult) return null;

      const isPassed = evaluationResult.isPass;
      return (
          <div className={cn("p-spacing-md mb-spacing-md border rounded-lg", isPassed ? "bg-green-500/10 border-green-500/40" : "bg-amber-500/10 border-amber-500/40", "neuro-fade-in")}>
              <div className="flex items-center gap-spacing-sm mb-spacing-sm">
                  {isPassed ? <CheckCircle className="text-green-500" size={20} /> : <AlertTriangle className="text-amber-500" size={20} />}
                  <h4 className="font-semibold">{isPassed ? "Understanding Verified" : "Needs Refinement"}</h4>
              </div>
              <p className="text-sm mb-spacing-md opacity-90">{evaluationResult.feedback}</p>
              <div className="flex flex-wrap gap-spacing-sm">
                  {!isPassed && (
                      <Button variant="outline" size="sm" onClick={handleReviseAnswer} className="text-xs h-8 neuro-button">
                          <Edit3 size={14} className="mr-spacing-xs" /> Revise Answer
                      </Button>
                  )}
                  {isPassed && (
                      <Button variant="outline" size="sm" onClick={onProceedAfterSuccess} className="text-xs h-8 neuro-button">
                          <ArrowRight size={14} className="mr-spacing-xs" /> Continue
                      </Button>
                  )}
              </div>
          </div>
      );
  };

  const renderTermsWithDefinitions = (terms: string[], title: string, termType: 'keyTerm' | 'moduleTag' = 'keyTerm') => {
      if (!terms || terms.length === 0) return null;
      
      return (
          <div className="mb-spacing-lg">
              <h4 className="text-sm font-semibold mb-spacing-xs">{title}</h4>
              <div className="flex flex-wrap gap-spacing-xs">
                  {terms.map(term => {
                      const definition = termType === 'keyTerm' 
                          ? getDefinition(term) 
                          : `Module tag: ${term}`; // Simplified for module tags, expand as needed
                      
                      const isActive = activeTermDefinition?.term === term && activeTermDefinition?.type === termType;
                      
                      return (
                          <Badge 
                              key={term} 
                              variant={isActive ? "outline" : "secondary"}
                              className={cn(
                                  "cursor-pointer text-xs px-spacing-xs py-[1px] transition-colors", 
                                  isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                              )}
                              onClick={() => definition && setActiveTermDefinition(isActive ? null : { term, definition, type: termType })}
                          >
                              {term}
                          </Badge>
                      );
                  })}
              </div>
              {activeTermDefinition && (
                  <div className="mt-spacing-sm p-spacing-sm text-xs bg-muted/30 rounded-md">
                      <p className="font-semibold">{activeTermDefinition.term}</p>
                      <p>{activeTermDefinition.definition}</p>
                  </div>
              )}
          </div>
      );
  };

  const renderDownloadPhase = () => {
    const renderContent = () => (
      <div className="space-y-spacing-md neuro-fade-in">
        <div>
          <h2 className="neuro-text-heading text-neutral-accent-color font-theme-neutral mb-spacing-xs">{node.title}</h2>
          {!hideContentForRecall && <p className="neuro-text-body text-sm opacity-90 mb-spacing-md">{node.shortDefinition}</p>}

          {!hideContentForRecall && (
            <>
              <div className="space-y-spacing-lg">
                <section className="neuro-section"> 
                  <h3 className={cn("neuro-section-title text-neutral-primary-color")}>Detailed Clarification</h3> 
                  <div className="neuro-text-body p-spacing-sm bg-card/50 rounded-md border border-border/20 shadow-sm">{node.download.clarification}</div> 
                </section>

                <section className="neuro-section"> 
                  <h3 className={cn("neuro-section-title text-neutral-primary-color")}>Example</h3> 
                  <p className="italic text-muted-foreground bg-muted/20 p-spacing-sm rounded-md border border-border/20 neuro-text-body">{node.download.example}</p>  
                </section>

                <section className="neuro-section">  
                  <h3 className={cn("neuro-section-title text-neutral-primary-color")}>Real-World Scenario</h3> 
                  <div className="neuro-text-body p-spacing-sm bg-card/50 rounded-md border border-border/20 shadow-sm">{node.download.scenario}</div>  
                </section>
                
                {node.content && (
                  <section className="neuro-section">
                    <h3 className={cn("neuro-section-title text-neutral-primary-color")}>Additional Content</h3>
                    <div className="prose prose-invert max-w-none prose-sm prose-headings:font-semibold prose-headings:mt-spacing-md prose-headings:mb-spacing-xs prose-p:my-spacing-sm prose-li:my-0.5">
                      <div dangerouslySetInnerHTML={{ __html: node.content }} />
                    </div>
                  </section>
                )}
              </div>
              
              {showAttentionCheck && !evaluationResult && (
                <Card className="mt-spacing-xl neuro-card">
                  <CardHeader className="pb-spacing-sm">
                    <CardTitle className="text-md flex items-center text-primary font-medium">
                      <Info size={18} className="mr-spacing-sm text-primary" />
                      Attention Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-spacing-md">You've been introduced to this concept. Are you ready to test your understanding?</p>
                    <Button 
                      onClick={handleAttentionCheckComplete} 
                      variant="default" 
                      className="neuro-button"
                    >
                      <Check size={16} className="mr-spacing-xs" /> I've Read This
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
          
          {showRecall && (
            <Card className="mt-spacing-xl neuro-card border-secondary/30">
              <CardHeader className="pb-spacing-xs">
                <CardTitle className="text-md flex items-center">
                  <BrainCircuit size={18} className="mr-spacing-sm text-secondary" />
                  Knowledge Recall
                </CardTitle>
                <CardDescription>
                  Explain the concept in your own words
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecallSubmit} className="space-y-spacing-md">
                  {hideContentForRecall && !evaluationResult && (
                    <div className="mb-spacing-md border border-secondary/20 rounded-md p-spacing-sm flex items-center justify-between">
                      <p className="text-sm opacity-80">Content is hidden to test recall. Use your memory to answer.</p>
                    </div>
                  )}
                  
                  <div className="neuro-input-group">
                    <Label htmlFor="recall-input" className="neuro-label sr-only">Your explanation</Label>
                    <div className="relative">
                      <Textarea
                        id="recall-input"
                        value={recallInput || ''} 
                        onChange={(e) => setRecallInput(e.target.value)}
                        placeholder="Explain this concept in your own words..."
                        className="neuro-input min-h-[150px] resize-none pr-spacing-lg"
                        disabled={isLoadingEvaluation}
                      />
                      
                      {isVoiceModeActive && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-8 w-8 p-0"
                          onClick={() => handleVoiceInputToggle(setRecallInput)}
                          disabled={isLoadingEvaluation || isLoadingSTT}
                        >
                          {isListening ? (
                            <Mic className="h-4 w-4 text-destructive animate-pulse" />
                          ) : (
                            <MicOff className="h-4 w-4 opacity-70" />
                          )}
                          <span className="sr-only">Toggle voice input</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowRecall(false);
                        setHideContentForRecall(false);
                      }}
                      className="neuro-button"
                      disabled={isLoadingEvaluation}
                    >
                      Back to Content
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={!recallInput || recallInput.trim() === '' || isLoadingEvaluation}
                      className="neuro-button"
                    >
                      {isLoadingEvaluation ? (
                        <>
                          <Loader2 className="mr-spacing-xs h-4 w-4 animate-spin" /> Evaluating...
                        </>
                      ) : (
                        <>
                          <Check className="mr-spacing-xs h-4 w-4" /> Submit Explanation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                {evaluationResult && renderEvaluationFeedbackPanel()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );

    return renderContent();
  };

  const renderInstallPhase = () => {
    const epicData = node.epic as NodeEPIC;
    
    const renderEpicExplain = () => (
      <div className="neuro-fade-in space-y-spacing-md">
        <div className="border-l-4 border-l-neutral-accent-color pl-spacing-md py-spacing-xs">
          <h4 className="text-neutral-accent-color font-semibold mb-spacing-xs">Explain</h4>
          <p className="text-sm opacity-90">{epicData.explainPrompt}</p>
        </div>
      </div>
    );
    
    const renderEpicProbe = () => (
      <div className="neuro-fade-in space-y-spacing-md">
        <div className="border-l-4 border-l-chaos-accent-color pl-spacing-md py-spacing-xs">
          <h4 className="text-chaos-accent-color font-semibold mb-spacing-xs">Probe</h4>
          {isLoadingProbe ? (
            <div className="flex items-center gap-spacing-sm text-sm opacity-80">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Generating thoughtful questions...</span>
            </div>
          ) : (
            <div className="space-y-spacing-sm">
              {probeQuestions.map((question, i) => (
                <p key={i} className="text-sm">{question}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
    
    const renderEpicImplement = () => (
      <div className="neuro-fade-in space-y-spacing-md">
        <div className="border-l-4 border-l-law-accent-color pl-spacing-md py-spacing-xs">
          <h4 className="text-law-accent-color font-semibold mb-spacing-xs">Implement</h4>
          <p className="text-sm opacity-90">{epicData.implementPrompt}</p>
        </div>
      </div>
    );
    
    const renderEpicConnect = () => (
      <div className="neuro-fade-in space-y-spacing-md">
        <div className="border-l-4 border-l-primary pl-spacing-md py-spacing-xs">
          <h4 className="text-primary font-semibold mb-spacing-xs">Connect</h4>
          <p className="text-sm opacity-90">{epicData.connectPrompt}</p>
        </div>
      </div>
    );
    
    const renderActiveEpicStep = () => {
      switch (currentEpicStep) {
        case 'explain':
          return renderEpicExplain();
        case 'probe':
          return renderEpicProbe();
        case 'implement':
          return renderEpicImplement();
        case 'connect':
          return renderEpicConnect();
        default:
          return renderEpicExplain();
      }
    };
    
    return (
      <div className="space-y-spacing-lg neuro-fade-in">
        <div>
          <h2 className="neuro-text-heading text-neutral-accent-color font-theme-neutral mb-spacing-xs">{node.title}</h2>
          {currentEpicStep !== 'explain' && (
            <p className="neuro-text-body text-sm opacity-90 mb-spacing-md">{node.shortDefinition}</p>
          )}
          
          {showEPIC && (
            <Card className="neuro-card mt-spacing-md">
              <CardHeader className="pb-spacing-sm">
                <CardTitle className="text-md flex items-center">
                  <BrainCircuit size={18} className="mr-spacing-sm text-primary" />
                  EPIC Learning Framework
                </CardTitle>
                <CardDescription>
                  Complete the steps below to strengthen your understanding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-spacing-md">
                {renderActiveEpicStep()}
                
                <form onSubmit={handleEpicSubmit} className="space-y-spacing-md">
                  <div className="neuro-input-group">
                    <Label htmlFor="epic-input" className="neuro-label">Your Response</Label>
                    <div className="relative">
                      <Textarea
                        id="epic-input"
                        value={epicInput || ''}
                        onChange={(e) => setEpicInput(e.target.value)}
                        placeholder="Enter your response..."
                        className="neuro-input min-h-[150px] resize-none pr-spacing-lg"
                        disabled={isLoadingEvaluation}
                      />
                      
                      {isVoiceModeActive && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-8 w-8 p-0"
                          onClick={() => handleVoiceInputToggle(setEpicInput)}
                          disabled={isLoadingEvaluation || isLoadingSTT}
                        >
                          {isListening ? (
                            <Mic className="h-4 w-4 text-destructive animate-pulse" />
                          ) : (
                            <MicOff className="h-4 w-4 opacity-70" />
                          )}
                          <span className="sr-only">Toggle voice input</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <Button 
                      type="submit" 
                      disabled={!epicInput || !epicInput.trim() || isLoadingEvaluation}
                      className="neuro-button"
                    >
                      {isLoadingEvaluation ? (
                        <>
                          <Loader2 className="mr-spacing-xs h-4 w-4 animate-spin" /> Evaluating...
                        </>
                      ) : (
                        <>
                          <Check className="mr-spacing-xs h-4 w-4" /> Submit Response
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                {evaluationResult && renderEvaluationFeedbackPanel()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="neuro-layout-sidebar gap-spacing-lg">
      <div className="neuro-sidebar">
        {phase === 'install' && (
          <div className="space-y-spacing-md">
            <Card className="neuro-card shadow-sm" data-alignment="neutral">
              <CardHeader className="p-spacing-md pb-spacing-xs">
                <CardTitle className="text-sm font-medium">EPIC Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-spacing-md pt-spacing-xs">
                <div className="space-y-2">
                  {['explain', 'probe', 'implement', 'connect'].map((step) => (
                    <div key={step} className="flex items-center">
                      <div 
                        className={cn(
                          "w-2 h-2 rounded-full mr-spacing-sm", 
                          currentEpicStep === step ? "bg-primary" : "bg-muted"
                        )} 
                      />
                      <span 
                        className={cn(
                          "text-xs capitalize", 
                          currentEpicStep === step ? "font-medium" : "opacity-70"
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {phase === 'download' && (
          <div className="space-y-spacing-md">
            <Card className="neuro-card shadow-sm" data-alignment="neutral">
              <CardHeader className="p-spacing-md pb-spacing-xs">
                <CardTitle className="text-sm font-medium">Learning Objective</CardTitle>
              </CardHeader>
              <CardContent className="p-spacing-md pt-spacing-xs">
                <p className="text-xs opacity-90">{node.learningObjective}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <div className="neuro-main-content">
        {phase === 'download' && renderDownloadPhase()}
        {phase === 'install' && renderInstallPhase()}
      </div>
      
      {phase === 'download' && (
        <div className="neuro-sidebar">
          <div className="space-y-spacing-md">
            {node.keyTerms && node.keyTerms.length > 0 && (
              <Card className="neuro-card shadow-sm" data-alignment="neutral">
                <CardHeader className="p-spacing-md pb-spacing-xs">
                  <CardTitle className="text-sm font-medium">Key Terms</CardTitle>
                </CardHeader>
                <CardContent className="p-spacing-md pt-spacing-xs">
                  <div className="flex flex-wrap gap-spacing-xs">
                    {node.keyTerms.map(term => {
                      const definition = getDefinition(term);
                      const isActive = activeTermDefinition?.term === term && activeTermDefinition?.type === 'keyTerm';
                      
                      if (!definition) return null; // Skip terms without definitions
                      
                      return (
                        <Badge 
                          key={term} 
                          variant={isActive ? "outline" : "secondary"}
                          className={cn(
                            "cursor-pointer text-xs px-spacing-xs py-[1px] transition-colors", 
                            isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                          )}
                          onClick={() => setActiveTermDefinition(isActive ? null : { term, definition, type: 'keyTerm' })}
                        >
                          {term}
                        </Badge>
                      );
                    })}
                  </div>
                  {activeTermDefinition && activeTermDefinition.type === 'keyTerm' && (
                    <div className="mt-spacing-sm p-spacing-sm text-xs bg-muted/30 rounded-md">
                      <p className="font-semibold">{activeTermDefinition.term}</p>
                      <p>{activeTermDefinition.definition}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {moduleTags && moduleTags.length > 0 && (
              <Card className="neuro-card shadow-sm" data-alignment="neutral">
                <CardHeader className="p-spacing-md pb-spacing-xs">
                  <CardTitle className="text-sm font-medium">Module Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-spacing-md pt-spacing-xs">
                  <div className="flex flex-wrap gap-spacing-xs">
                    {moduleTags.map(tag => {
                      const isActive = activeTermDefinition?.term === tag && activeTermDefinition?.type === 'moduleTag';
                      const tagDefinition = `Module tag: ${tag}`;
                      
                      return (
                        <Badge 
                          key={tag} 
                          variant={isActive ? "outline" : "secondary"}
                          className={cn(
                            "cursor-pointer text-xs px-spacing-xs py-[1px] transition-colors", 
                            isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                          )}
                          onClick={() => setActiveTermDefinition(isActive ? null : { term: tag, definition: tagDefinition, type: 'moduleTag' })}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                  {activeTermDefinition && activeTermDefinition.type === 'moduleTag' && (
                    <div className="mt-spacing-sm p-spacing-sm text-xs bg-muted/30 rounded-md">
                      <p className="font-semibold">{activeTermDefinition.term}</p>
                      <p>{activeTermDefinition.definition}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
      
      {phase === 'install' && (
        <div className="neuro-sidebar">
          <div className="space-y-spacing-md">
            <Card className="neuro-card shadow-sm" data-alignment="neutral">
              <CardHeader className="p-spacing-md pb-spacing-xs">
                <CardTitle className="text-sm font-medium">Learning Objective</CardTitle>
              </CardHeader>
              <CardContent className="p-spacing-md pt-spacing-xs">
                <p className="text-xs opacity-90">{node.learningObjective}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

