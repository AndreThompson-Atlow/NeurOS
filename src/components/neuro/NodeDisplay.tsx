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

    if (nodeChanged) {
        if (!evaluationResult) { 
          clearEvaluationResultCallback();
        }
        setActiveTermDefinition(null);
        setRecallInput('');
        setEpicInput('');
    }
    
    if (node) {
        const currentNodeFamiliar = node.familiar || node.status === 'familiar' || node.status === 'understood';
        const currentNodeUnderstood = node.understood || node.status === 'understood'; 
        const isNodeNewAndNotReviewed = !currentNodeFamiliar && node.status === 'new' && currentInteraction !== 'reviewing';

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
            } else { 
                setShowAttentionCheck(true);
                setShowRecall(false);
                setHideContentForRecall(false);
            }
        } else if (phase === 'install' && (currentInteraction === 'learning' && (node.status === 'familiar' || node.status === 'downloaded') || (node.status === 'installing' && !currentNodeUnderstood))) {
            setShowAttentionCheck(false);
            setShowRecall(false);
            setHideContentForRecall(false);
             if (probeQuestions.length === 0 && !isLoadingProbe && currentEpicStep === 'probe' && (!evaluationResult || evaluationResult.isPass)) {
                 onFetchProbe();
             }
        } else { 
            setShowAttentionCheck(false);
            setShowRecall(false);
            setHideContentForRecall(false);
        }
    } else { 
        setShowAttentionCheck(true);
        setShowRecall(false);
        setHideContentForRecall(false);
        setRecallInput('');
        setEpicInput('');
    }
  }, [node?.id, phase, currentEpicStep, evaluationResult, clearEvaluationResultCallback, onFetchProbe, isLoadingProbe, probeQuestions.length, currentInteraction, showRecall, node, isNodeUnderstood]);


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
        onSubmitRecall(recallInput);
    };

   const handleEpicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoadingEvaluation) return;
        onSubmitEpic(epicInput);
    };
  
  const handleVoiceInputToggle = async (targetSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!startRecording || !stopRecording || !setVoiceTranscriptTarget) {
        toast({ description: "Voice input system not available.", variant: "destructive" });
        return;
    }
    setVoiceTranscriptTarget(() => targetSetter); 
    if (isListening) {
      const transcript = await stopRecording();
      if (transcript && typeof transcript === 'string') { 
        targetSetter(prev => prev + (prev ? " " : "") + transcript); 
      }
    } else {
      targetSetter(''); 
      startRecording();
    }
  };

  const handleReviseAnswer = () => {
    clearEvaluationResultCallback();
    if (phase === 'download') {
        setHideContentForRecall(true); 
    }
    toast({ description: "Revise your answer and resubmit.", className: "bg-card border-secondary text-foreground" });
  }

  const renderEvaluationFeedbackPanel = () => {
      if (!evaluationResult || isLoadingEvaluation) return null;
      
      return (
        <ThoughtAnalyzerPanel
          userInput={phase === 'download' ? recallInput : epicInput}
          evaluationResult={evaluationResult}
          judgingCharacterId={activeModule?.defaultCompanion || "neuros"}
          onResubmit={!evaluationResult.isPass ? handleReviseAnswer : undefined}
        />
      );
  };

   const renderTermsWithDefinitions = (terms: string[], title: string, termType: 'keyTerm' | 'moduleTag' = 'keyTerm') => {
    if (!terms || terms.length === 0) return <p className="text-xs text-muted-foreground italic">No {title.toLowerCase()} specified.</p>;
    return (
        <div className="py-spacing-md px-spacing-md"> 
            <h4 className="font-semibold text-xl mb-spacing-sm text-glow-cyan flex items-center gap-2"><FileTextIcon size={20}/>{title}</h4>
            <TooltipProvider delayDuration={100}>
                 <Accordion type="single" collapsible className="w-full md:hidden space-y-spacing-xs">
                    {terms.map(term => {
                        const definition = getDefinition(term);
                        if (!definition) return (
                            <Badge key={`${term}-badge-mobile-${node.id}-${termType}`} variant="secondary" className="mr-spacing-xs mb-spacing-xs cursor-default bg-muted/70 text-muted-foreground text-sm px-spacing-xs py-0.5">{term}</Badge>
                        );
                        return (
                            <AccordionItem value={term} key={`${term}-accordion-${node.id}-${termType}`} className="border-b-0 mb-spacing-xs">
                                <AccordionTrigger className="text-sm px-spacing-sm py-2 bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors rounded-md w-full justify-start hover:no-underline">
                                   {term.charAt(0).toUpperCase() + term.slice(1)}
                                </AccordionTrigger>
                                <AccordionContent className="p-spacing-sm mt-spacing-xs bg-popover text-popover-foreground border border-border rounded-md text-sm leading-relaxed">
                                    <p className={`font-semibold ${alignmentPropsForModule?.titleColor || 'text-foreground'} mb-spacing-xs text-base`}>{term.charAt(0).toUpperCase() + term.slice(1)}</p>
                                    <p>{definition}</p>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                 </Accordion>
                <div className="hidden md:flex flex-wrap gap-spacing-sm mt-spacing-xs">  
                    {terms.map(term => { 
                        const definition = getDefinition(term);
                        return (
                            <Tooltip key={`${term}-tooltip-desktop-${node.id}-${termType}`}>
                                <TooltipTrigger asChild>
                                     <Badge
                                        variant="outline"
                                        className={cn(
                                            `cursor-default bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors text-base px-spacing-sm py-1 mb-spacing-xs`,
                                            activeTermDefinition?.term === term && activeTermDefinition?.type === termType && 'bg-muted/70 text-foreground ring-1 ring-accent'
                                            )}
                                        onClick={() => !isMobile && definition && setActiveTermDefinition({term, definition, type: termType})}
                                    >
                                        {term.charAt(0).toUpperCase() + term.slice(1)}
                                    </Badge>
                                </TooltipTrigger>
                                {!isMobile && definition && (
                                    <TooltipContent side="top" className="max-w-md text-base ui-tooltip-content p-spacing-sm rounded-md"> 
                                        <p className={`font-semibold ${alignmentPropsForModule?.titleColor || 'text-foreground'} mb-spacing-xs text-lg`}>{term.charAt(0).toUpperCase() + term.slice(1)}</p>
                                        <p className="text-sm leading-relaxed">{definition}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
            {isMobile && activeTermDefinition?.type === termType && activeTermDefinition?.definition && (
                <Card className="mt-spacing-md p-spacing-md bg-muted/50 border border-border/30 rounded-md text-sm text-foreground/90" data-no-hover="true"> 
                    <CardTitle className={`font-semibold text-base ${alignmentPropsForModule?.titleColor || 'text-foreground'} mb-spacing-xs`}>{activeTermDefinition.term.charAt(0).toUpperCase() + activeTermDefinition.term.slice(1)}</CardTitle>
                    <CardContent className="p-0"><p>{activeTermDefinition.definition}</p></CardContent>
                </Card>
            )}
        </div>
    );
  };

  const renderDownloadPhase = () => {
    if (!activeModule || !currentDomainDetails || !node) {
        return <div className="p-spacing-lg text-muted-foreground text-center">Loading module, domain, or node details...</div>;
    }

    return (
        <div 
            className={cn(
                "lg:grid lg:grid-cols-12 gap-spacing-md p-spacing-md min-h-[calc(100vh-var(--navbar-height,64px)-var(--progressbar-height,160px))]",
                alignmentPropsForModule.borderColorClass, 
                "border-t-4"
            )} 
            data-alignment={activeModule.alignmentBias || 'neutral'}
        >
            {/* Left Sidebar */}
            <div className="lg:col-span-3 space-y-spacing-md h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hidden lg:block bg-card rounded-lg shadow-md p-4">
                 <SidebarPanelLeft
                    module={activeModule as NeuroModule}
                    currentDomain={currentDomainDetails}
                    currentNode={node}
                    onNavigate={() => {}} 
                    alignmentProps={alignmentPropsForModule}
                />
            </div>

            {/* Center Content Panel */}
            <div className="lg:col-span-6 h-full flex flex-col bg-card rounded-lg shadow-md p-4">
                <ScrollArea className="flex-grow pr-spacing-sm">
                    <div className="space-y-spacing-lg">
                        <Card className="bg-card/80" data-no-hover="true">
                            <CardHeader className="p-spacing-md">
                                <CardTitle className={cn("text-3xl flex items-center gap-spacing-sm", alignmentPropsForModule.titleColor, alignmentPropsForModule.fontClass)}>
                                    <Download size={28} className={alignmentPropsForModule.titleColor.replace('text-glow-','')} /> {node.title}
                                </CardTitle>
                                <CardDescription className="text-base text-muted-foreground/80 pt-spacing-xs leading-relaxed">{node.shortDefinition}</CardDescription>
                            </CardHeader>
                        </Card>
                         {/* Main download content - conditionally rendered */}
                        {!(hideContentForRecall && (!evaluationResult || !evaluationResult.isPass)) && (
                            <Card className="space-y-spacing-lg" data-no-hover="true">
                                <CardContent className="p-spacing-md space-y-spacing-md">
                                    {renderTermsWithDefinitions(moduleTags, "Module Tags", "moduleTag")}
                                    {moduleTags.length > 0 && <Separator className="my-spacing-md bg-border/30"/>}
                                    {renderTermsWithDefinitions(node.keyTerms, "Node Key Terms", "keyTerm")}
                                    <Separator className="my-spacing-md bg-border/30"/>
                                    <div className="space-y-spacing-xs">
                                        <h4 className="font-semibold text-xl mb-spacing-sm text-glow-cyan flex items-center gap-2"><MessageSquare size={20}/>Clarification</h4>
                                        <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-base p-spacing-md bg-background/30 rounded-md border border-border/20 shadow-sm">{node.download.clarification}</p>
                                    </div>
                                    <Separator className="my-spacing-md bg-border/30"/>
                                    <div className="space-y-spacing-xs">
                                        <h4 className="font-semibold text-xl mb-spacing-sm text-glow-cyan flex items-center gap-2"><HelpCircle size={20}/>Example</h4>
                                        <p className="italic text-muted-foreground bg-muted/20 p-spacing-md rounded-md border border-border/20 whitespace-pre-line text-base leading-relaxed">{node.download.example}</p>
                                    </div>
                                    <Separator className="my-spacing-md bg-border/30"/>
                                    <div className="space-y-spacing-xs">
                                        <h4 className="font-semibold text-xl mb-spacing-sm text-glow-cyan flex items-center gap-2"><ExternalLink size={20}/>Real-World Scenario</h4>
                                        <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-base p-spacing-md bg-background/30 rounded-md border border-border/20 shadow-sm">{node.download.scenario}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                         {/* Button to trigger recall - moved after content */}
                        {phase === 'download' && !isNodeFamiliar && showAttentionCheck && !showRecall && (!evaluationResult || !evaluationResult.isPass) && (
                            <Button onClick={handleAttentionCheckComplete} size="sm" variant="secondary" className="btn-neural text-sm mt-spacing-md">
                                <EyeOff size={16} className="mr-1.5" /> Hide Content &amp; Start Recall
                            </Button>
                        )}
                        
                        <Separator className={cn("my-spacing-lg bg-border/50", (hideContentForRecall && !evaluationResult?.isPass) ? 'mt-spacing-xs' : '')} />

                        {phase === 'download' && showRecall && (!evaluationResult || !evaluationResult.isPass) && !isNodeFamiliar && (
                            <Card className="bg-primary/5 border border-primary/20 shadow-cyan-md" data-no-hover="true">
                            <CardHeader className="p-spacing-md">
                                <Label htmlFor="recall-input" className="font-semibold text-2xl text-glow-gold flex items-center gap-spacing-sm"><Search size={24} /> Recall Challenge</Label>
                                <CardDescription className="text-base text-muted-foreground/80 mt-spacing-xs leading-relaxed">{node.download.recallPrompt}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-spacing-md">
                                <form onSubmit={handleRecallSubmit} className="space-y-spacing-md">
                                <div className="flex gap-spacing-sm items-end">
                                    <Textarea
                                        id="recall-input"
                                        value={recallInput}
                                        onChange={(e) => { setRecallInput(e.target.value); if(evaluationResult) clearEvaluationResultCallback(); }}
                                        placeholder="Explain the core concepts in your own words..."
                                        rows={6}
                                        required
                                        className="ui-textarea text-base flex-grow"
                                        disabled={isLoadingEvaluation || (isVoiceModeActive && isListening)}
                                    />
                                    {isVoiceModeActive && (
                                        <Button type="button" variant={isListening ? "destructive" : "secondary"} size="lg" className="p-3" onClick={() => handleVoiceInputToggle(setRecallInput)} disabled={isLoadingEvaluation || isLoadingSTT} title={isListening ? "Stop Recording" : "Record Answer"}>
                                            {isLoadingSTT ? <Loader2 className="animate-spin h-5 w-5" /> : (isListening ? <MicOff className="h-5 w-5"/> : <Mic className="h-5 w-5"/>)}
                                        </Button>
                                    )}
                                </div>
                                <Button type="submit" size="lg" variant="primary" className="btn-neural-primary text-base px-6 py-3" disabled={isLoadingEvaluation || recallInput.trim().length < 5 || isListening}>
                                    {isLoadingEvaluation ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Evaluating...</> : 'Submit Recall'}
                                </Button>
                                </form>
                            </CardContent>
                            </Card>
                        )}
                        
                        {renderEvaluationFeedbackPanel()}

                        {evaluationResult && evaluationResult.isPass && phase === 'download' && (
                            <Button onClick={() => { onProceedAfterSuccess(); setHideContentForRecall(false); setShowRecall(false); }} size="lg" variant="primary" className="btn-neural-primary text-base px-6 py-3 mt-spacing-md">
                                Proceed to Next Node <ArrowRight className="ml-2 h-5 w-5"/>
                            </Button>
                        )}
                        {evaluationResult && !evaluationResult.isPass && (phase === 'download' && showRecall) && (
                            <Button onClick={handleReviseAnswer} variant="outline" size="lg" className="text-base px-6 py-3 mt-spacing-md border-accent text-accent hover:bg-accent/10">
                                <Edit3 size={18} className="mr-1.5" /> Revise Answer
                            </Button>
                        )}

                        {(isNodeFamiliar && phase === 'download' && !showRecall && !showAttentionCheck && !evaluationResult) && (
                            <CardFooter className="p-spacing-md bg-primary/10 border-t border-primary/30 rounded-b-lg mt-auto">
                                <p className="text-base text-primary flex items-center gap-1.5 text-glow-gold"><CheckCircle size={18} /> Download complete (Recall successful).</p>
                            </CardFooter>
                        )}

                        {activeModule && currentDomainDetails && node && generateNodeDialogue && (
                            <div className="mt-auto pt-spacing-lg flex-shrink-0 min-h-[300px] max-h-[50vh] flex flex-col">
                            <MultiPersonaChatPanel
                                currentNode={node}
                                module={activeModule as NeuroModule}
                                currentDomain={currentDomainDetails}
                                allAiCharacters={allAiCharacters}
                                guideCharacter={guideCharacter}
                                generateNodeDialogue={generateNodeDialogue}
                                isLoadingDialogue={isLoadingDialogue}
                            />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Sidebar */}
             <div className="lg:col-span-3 space-y-spacing-md h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hidden lg:block bg-card rounded-lg shadow-md p-4">
                <SidebarPanelRight
                    keyTerms={node.keyTerms}
                    moduleTags={activeModule.tags || []}
                    alignmentProps={alignmentPropsForModule}
                    currentNodeTitle={node.title}
                    currentDomainTitle={currentDomainDetails.title}
                    moduleTitle={activeModule.title}
                />
            </div>
        </div>
    );
  };

 const renderInstallPhase = () => {
    if (!activeModule || !node || !currentDomainDetails) { 
        return <div className="p-spacing-lg text-muted-foreground text-center">Loading install phase details...</div>;
    }
     let promptText = ''; 
     let icon = <Lightbulb size={20} />; 
     
     const currentAlignmentProps = getAlignmentStyling(activeModule?.alignmentBias); 
     let stepColorClass = currentAlignmentProps.titleColor; 
     let stepBadgeVariant: "default" | "secondary" | "destructive" | "outline" | "law" | "chaos" | "neutralProgress" = currentAlignmentProps.dataAlignment as any; 
     let stepBadgeBgClass = cn("bg-opacity-20 border-opacity-50", currentAlignmentProps.borderColorClass, stepColorClass.replace('text-glow-','text-'));


     switch(currentEpicStep) {
         case 'explain': 
            promptText = node.epic.explainPrompt; 
            icon = <Lightbulb size={24} className={currentAlignmentProps.titleColor.replace('text-glow-','')}/>; 
            break;
         case 'probe': 
            promptText = node.epic.probePrompt; 
            icon = <Search size={24} className="text-destructive" />; 
            stepColorClass = "text-glow-crimson"; 
            stepBadgeVariant="destructive"; 
            stepBadgeBgClass = "bg-destructive/20 text-destructive border-destructive/50";
            break;
         case 'implement': 
            promptText = node.epic.implementPrompt; 
            icon = <Wrench size={24} className="text-primary" />; 
            stepColorClass = "text-glow-gold"; 
            stepBadgeVariant="primary"; 
            stepBadgeBgClass = "bg-primary/20 text-primary border-primary/50";
            break;
         case 'connect': 
            promptText = node.epic.connectPrompt; 
            icon = <LinkIcon size={24} className="text-secondary" />; 
            stepColorClass = "text-glow-cyan"; 
            stepBadgeVariant="secondary"; 
            stepBadgeBgClass = "bg-secondary/20 text-secondary border-secondary/50";
            break;
     }

     const showEpicForm = (currentInteraction === 'reviewing' || (node && !node.understood)) && (!evaluationResult || !evaluationResult.isPass);
     const nextButtonLabel = currentEpicStep === 'connect' ? 'Complete Node' : `Next Step: ${currentEpicStep === 'explain' ? 'Probe' : currentEpicStep === 'probe' ? 'Implement' : 'Connect'}`;
     
     return (
         <Card data-alignment={currentAlignmentProps.dataAlignment} className="shadow-cyan-lg"> 
             <CardHeader className="bg-muted/30 p-spacing-lg rounded-t-lg border-b border-border/50"> 
                 <div className="flex items-center justify-between mb-spacing-sm"> 
                     <CardTitle className={cn("text-3xl flex items-center gap-spacing-sm", currentAlignmentProps.titleColor, currentAlignmentProps.fontClass)}> 
                          <BrainCircuit size={28} /> {node.title} 
                     </CardTitle>
                     <Badge variant={currentAlignmentProps.dataAlignment as any} className={cn("text-base px-4 py-1.5 bg-opacity-70", currentAlignmentProps.buttonClass)}> 
                        {currentInteraction === 'reviewing' ? 'Review Session' : 'Install Phase'}
                     </Badge>
                 </div>
                  <div className="flex items-center space-x-spacing-sm mt-spacing-xs"> 
                     <CardDescription className="text-muted-foreground/80 text-base">EPIC Integration Step:</CardDescription> 
                      <Badge variant={stepBadgeVariant} className={cn("capitalize text-base px-3 py-1", stepBadgeBgClass)}> 
                        {React.cloneElement(icon, { className: cn("mr-1.5 h-5 w-5", icon.props.className?.replace(/text-(glow-)?\w+(-\w+)?/g, '')) })}
                        {currentEpicStep}
                      </Badge>
                 </div>
             </CardHeader>
             <CardContent className="p-spacing-lg space-y-spacing-lg"> 
                 <Card data-no-hover="true" className="p-spacing-md bg-muted/20 border border-border/30 rounded-md mb-spacing-lg">
                    <CardContent className="space-y-spacing-sm p-0">
                         <h4 className="font-semibold text-lg mb-spacing-xs text-glow-cyan flex items-center gap-2"><FileTextIcon size={20}/>Definition Reminder</h4> 
                         <p className="text-base text-muted-foreground/80 leading-relaxed">{node.shortDefinition}</p> 
                         <Separator className="bg-border/30 my-spacing-md"/> 
                         {renderTermsWithDefinitions(node.keyTerms, "Node Key Terms", "keyTerm")}
                    </CardContent>
                </Card>
                
                {renderEvaluationFeedbackPanel()}

                 {showEpicForm ? (
                     <Card data-no-hover="true" className="bg-card/80 shadow-cyan-md p-spacing-lg">
                       <form onSubmit={handleEpicSubmit} className="space-y-spacing-lg">  
                           <Label htmlFor="epic-input" className={cn("font-semibold text-2xl flex items-center gap-spacing-sm", stepColorClass)}>{React.cloneElement(icon, {size: 26})} {promptText}</Label> 

                           {currentEpicStep === 'probe' && (
                               <div className="p-spacing-md bg-muted/40 rounded-md border border-border/20 space-y-spacing-sm"> 
                                    <h5 className="text-base font-medium text-muted-foreground/90 flex items-center gap-1.5"><HelpCircle size={18} className="text-yellow-400"/>Consider these AI-generated questions:</h5> 
                                   {isLoadingProbe ? (
                                        <div className="flex items-center space-x-spacing-sm text-muted-foreground py-spacing-sm"> 
                                            <Loader2 className="h-5 w-5 animate-spin text-secondary" /> 
                                            <span className="text-glow-cyan text-base">Generating probing questions...</span> 
                                        </div>
                                    ) : probeQuestions.length > 0 ? (
                                       <ul className="list-disc list-inside text-base space-y-1.5 text-foreground/90 pl-spacing-md py-spacing-xs"> 
                                           {probeQuestions.map((q, index) => <li key={index}>{q}</li>)}
                                       </ul>
                                    ) : (
                                       <p className="text-base text-destructive text-glow-crimson py-spacing-sm">Could not load probing questions. Proceed with your own.</p> 
                                    )}
                               </div>
                           )}
                          <div className="flex gap-spacing-sm items-end"> 
                               <Textarea
                                   id="epic-input"
                                   value={epicInput}
                                   onChange={(e) => { setEpicInput(e.target.value); if(evaluationResult) clearEvaluationResultCallback();}}
                                   placeholder={`Your response for the ${currentEpicStep} step...`}
                                   rows={currentEpicStep === 'probe' ? 7 : 5} 
                                   required
                                   className="ui-textarea text-base flex-grow" 
                                   disabled={isLoadingEvaluation || (isLoadingProbe && currentEpicStep === 'probe') || (isVoiceModeActive && isListening)}
                               />
                              {isVoiceModeActive && (
                                  <Button type="button" variant={isListening ? "destructive" : "secondary"} size="lg" className="p-3" onClick={() => handleVoiceInputToggle(setEpicInput)} disabled={isLoadingEvaluation || isLoadingSTT || (isLoadingProbe && currentEpicStep === 'probe')} title={isListening ? "Stop Recording" : "Record Answer"}> 
                                      {isLoadingSTT ? <Loader2 className="animate-spin h-5 w-5" /> : (isListening ? <MicOff className="h-5 w-5"/> : <Mic className="h-5 w-5"/>)} 
                                  </Button>
                              )}
                          </div>
                           <Button type="submit" size="lg" variant={currentAlignmentProps.dataAlignment as any} className={cn(currentAlignmentProps.buttonClass, "text-base px-6 py-3")} 
                                   disabled={isLoadingEvaluation || (isLoadingProbe && currentEpicStep === 'probe') || epicInput.trim().length < 5 || isListening}>
                              {isLoadingEvaluation ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Evaluating...</> : 
                               (currentInteraction === 'reviewing' ? `Submit Review (${currentEpicStep})` :
                               (currentEpicStep === 'connect' ? 'Complete EPIC &amp; Node' : `Submit ${currentEpicStep.charAt(0).toUpperCase() + currentEpicStep.slice(1)}`))}
                           </Button>
                       </form>
                     </Card>
                 ) : ( 
                    (currentInteraction !== 'reviewing' || (evaluationResult && evaluationResult.isPass)) && isNodeUnderstood && (
                     <div className="p-spacing-lg bg-primary/10 border-t-4 border-primary rounded-md mb-spacing-xl text-center"> 
                        <CheckCircle className="h-12 w-12 text-primary mx-auto mb-spacing-sm" /> 
                        <p className="text-xl font-semibold text-glow-gold">EPIC Integration Complete!</p> 
                        <p className="text-base text-primary-foreground/80 mt-spacing-xs"> 
                            You have successfully installed this concept.
                        </p>
                    </div>
                    )
                 )}
                 {evaluationResult && evaluationResult.isPass && (
                     <Button onClick={() => {onProceedAfterSuccess(); setEpicInput('');}} size="lg" variant="primary" className="btn-neural-primary text-base px-6 py-3 mt-spacing-md">
                         {nextButtonLabel} <ArrowRight className="ml-2 h-5 w-5"/>
                     </Button>
                 )}
                 {evaluationResult && !evaluationResult.isPass && showEpicForm && (
                    <Button onClick={handleReviseAnswer} variant="outline" size="lg" className="text-base px-6 py-3 mt-spacing-md border-accent text-accent hover:bg-accent/10">
                        <Edit3 size={18} className="mr-1.5" /> Revise Answer
                    </Button>
                 )}
             </CardContent>
              {(isNodeUnderstood && (currentInteraction !== 'reviewing' || (evaluationResult && evaluationResult.isPass))) && ( 
                 <CardFooter className="p-spacing-md bg-primary/10 border-t border-primary/30 rounded-b-lg"> 
                     <p className="text-base text-primary flex items-center gap-1.5 text-glow-gold"><CheckCircle size={18} /> Concept marked as understood.</p> 
                 </CardFooter>
             )}
         </Card>
     );
 };

  if (phase === 'download' && currentInteraction !== 'reviewing') {
      return renderDownloadPhase();
  }
  return renderInstallPhase();
}

