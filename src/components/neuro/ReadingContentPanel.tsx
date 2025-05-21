
/**
 * @file ReadingContentPanel.tsx
 * @description Main content display area for the Reading Mode, showing module and node details.
 */
'use client';

import type { Module, Domain, Node as NeuroNode } from '@/types/neuro';
import React, { useState, useEffect, useRef } from 'react'; 
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Play, Volume2, MessageSquare, Loader2, VolumeX, FileText as FileTextIcon, BookOpen, Tag, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { AlignmentStyling } from './utils'; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'; 
import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getDefinition } from '@/data/glossary';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MultiPersonaChatPanel } from './MultiPersonaChatPanel';
import type { Character } from '@/types/characterTypes';
import type { GenerateReadingDialogueOutput, DialogueTurn as GenkitDialogueTurn } from '@/ai/flows/types/generateReadingDialogueTypes';


interface ReadingContentPanelProps {
  module: Module;
  currentDomain: Domain;
  currentNode: NeuroNode;
  alignmentProps: AlignmentStyling;
  onExit: () => void;
  onStartModule: (moduleId: string) => void;
  startButtonLabel: string | null;
  speakText: (text: string) => Promise<void>;
  isSpeaking: boolean;
  isLoadingTTS: boolean;
  stopSpeaking: () => void;
  isVoiceModeActive: boolean;
  allAiCharacters: Character[];
  guideCharacter: Character | null;
  generateNodeDialogue: (
    node: NeuroNode,
    module: Module,
    domain: Domain, 
    personalities: string[],
    previousDialogue?: GenkitDialogueTurn[] 
  ) => Promise<GenerateReadingDialogueOutput>;
  isLoadingDialogue: boolean;
  currentDomainIndex: number; // Added for context in header
  currentNodeIndex: number; // Added for context in header
}

export function ReadingContentPanel({
  module,
  currentDomain,
  currentNode,
  alignmentProps,
  onExit,
  onStartModule,
  startButtonLabel,
  speakText,
  isSpeaking,
  isLoadingTTS,
  stopSpeaking,
  isVoiceModeActive,
  allAiCharacters,
  guideCharacter,
  generateNodeDialogue,
  isLoadingDialogue,
  currentDomainIndex, // Destructure for use
  currentNodeIndex, // Destructure for use
}: ReadingContentPanelProps) {
  const isMobile = useIsMobile();
  const [activeTermDefinition, setActiveTermDefinition] = useState<{term: string, definition: string, type: 'keyTerm' | 'moduleTag'} | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveTermDefinition(null); // Reset active term when node changes
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = 0;
    }
  }, [currentNode.id, currentDomain.id]);


  const handleSpeakPage = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const contentToSpeak = `
        Title: ${currentNode.title}.
        Learning Objective: ${currentNode.learningObjective}.
        Short Definition: ${currentNode.shortDefinition}.
        Clarification: ${currentNode.download.clarification}.
        Example: ${currentNode.download.example}.
        Scenario: ${currentNode.download.scenario}.
      `;
      speakText(contentToSpeak);
    }
  };
  
  const handleTermClick = (term: string, type: 'keyTerm' | 'moduleTag') => {
    const definition = getDefinition(term);
    if (definition) {
        setActiveTermDefinition(activeTermDefinition?.term === term && activeTermDefinition?.type === type ? null : { term, definition, type });
    }
  }; 

  const renderKeyTermsWithDefinitions = (terms: string[], title: string, termType: 'keyTerm' | 'moduleTag') => {
    if (!terms || terms.length === 0) return <p className="text-sm text-muted-foreground italic">No {title.toLowerCase()} specified.</p>;
    return (
    <div className="py-spacing-md my-spacing-lg">
        <h4 className={`font-semibold text-xl ${alignmentProps.titleColor} mb-spacing-md flex items-center gap-spacing-xs`}>
          {termType === 'keyTerm' ? <Info size={20} /> : <Tag size={20} />}
          {title}
        </h4>
        <TooltipProvider delayDuration={100}>
             <Accordion type="single" collapsible className="w-full md:hidden space-y-spacing-sm">
                {terms.map(term => {
                    const definition = getDefinition(term);
                    if (!definition) return (
                        <Badge key={`${term}-badge-mobile-${currentNode.id}-${termType}`} variant="secondary" className="mr-spacing-xs mb-spacing-xs cursor-default bg-muted/70 text-muted-foreground text-base px-spacing-sm py-1">{term}</Badge>
                    );
                    return (
                        <AccordionItem value={term} key={`${term}-accordion-${currentNode.id}-${termType}`} className="border-b-0 mb-spacing-xs">
                            <AccordionTrigger className="text-base px-spacing-sm py-spacing-sm bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors rounded-md w-full justify-start hover:no-underline">
                               {term.charAt(0).toUpperCase() + term.slice(1)}
                            </AccordionTrigger>
                            <AccordionContent className="p-spacing-sm mt-spacing-xs bg-popover text-popover-foreground border border-border rounded-md text-base leading-relaxed">
                                <p className={`font-semibold ${alignmentProps.titleColor} mb-spacing-xs text-lg`}>{term.charAt(0).toUpperCase() + term.slice(1)}</p>
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
                        <Tooltip key={`${term}-tooltip-desktop-${currentNode.id}-${termType}`}>
                            <TooltipTrigger asChild>
                                 <Badge
                                    variant="outline"
                                    className={cn(
                                        `cursor-default bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors text-base px-spacing-sm py-1 mb-spacing-xs`,
                                        activeTermDefinition?.term === term && activeTermDefinition?.type === termType && 'bg-muted/70 text-foreground ring-1 ring-accent'
                                        )}
                                    onClick={() => !isMobile && definition && handleTermClick(term, termType)}
                                >
                                    {term.charAt(0).toUpperCase() + term.slice(1)}
                                </Badge>
                            </TooltipTrigger>
                            {!isMobile && definition && (
                                <TooltipContent side="top" className="max-w-md text-base ui-tooltip-content p-spacing-sm rounded-md"> 
                                    <p className={`font-semibold ${alignmentProps.titleColor} mb-spacing-xs text-lg`}>{term.charAt(0).toUpperCase() + term.slice(1)}</p>
                                    <p className="text-sm leading-relaxed">{definition}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
        {isMobile && activeTermDefinition?.type === termType && activeTermDefinition?.definition && (
            <Card className="mt-spacing-md p-spacing-md bg-muted/50 border border-border/30 rounded-md text-base text-foreground/90" data-no-hover="true"> 
                <CardTitle className={`font-semibold text-lg ${alignmentProps.titleColor} mb-spacing-xs`}>{activeTermDefinition.term.charAt(0).toUpperCase() + activeTermDefinition.term.slice(1)}</CardTitle>
                <CardContent className="p-0"><p>{activeTermDefinition.definition}</p></CardContent>
            </Card>
        )}
    </div>
    );
  };

  return (
    <Card 
      className={cn(
        "w-full flex flex-col flex-grow border-t-0 bg-transparent shadow-none p-0 overflow-hidden h-full"
      )} 
    > 
      <CardHeader className="pb-spacing-xs pt-spacing-sm px-spacing-md mb-spacing-sm flex-shrink-0 border-b border-border/20"> 
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-spacing-xs mb-spacing-sm">  
          <div className="flex-grow min-w-0"> 
            <CardTitle className={cn("text-2xl sm:text-3xl font-display whitespace-normal mb-spacing-xs", alignmentProps.titleColor, alignmentProps.fontClass)} title={currentNode.title}>  
              {currentNode.title}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground/90 leading-relaxed line-clamp-3" title={module.description}>  
              {module.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-spacing-sm items-center pt-spacing-sm border-t border-divider-neuro mt-spacing-md"> 
          {startButtonLabel && module.status !== 'installed' && (
            <Button onClick={() => onStartModule(module.id)} variant={alignmentProps.dataAlignment} size="sm" className={cn("h-9 text-xs px-3 py-2", alignmentProps.buttonClass)}> 
              {module.status === 'downloading' || module.status === 'installing' ? <Loader2 className="mr-spacing-xs h-4 w-4 animate-spin" /> : (module.status === 'downloaded' ? <Play className="mr-spacing-xs h-4 w-4"/> : <Download className="mr-spacing-xs h-4 w-4" />)} 
              {startButtonLabel}
            </Button>
          )}
          {isVoiceModeActive && (
            <Button onClick={handleSpeakPage} variant="outline" size="sm" disabled={isLoadingTTS} className={cn("h-9 text-xs px-3 py-2 bg-opacity-20 border-opacity-50 hover:bg-opacity-30", alignmentProps.buttonClass)}> 
              {isLoadingTTS ? <Loader2 className="mr-spacing-xs h-4 w-4 animate-spin" /> : (isSpeaking ? <VolumeX className="mr-spacing-xs h-4 w-4" /> : <Volume2 className="mr-spacing-xs h-4 w-4" />)} 
              {isSpeaking ? "Stop Reading" : "Read Page"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-grow overflow-hidden"> 
        <ScrollArea viewportRef={scrollViewportRef} className="h-full px-spacing-md scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"> 
          <div className="space-y-spacing-lg pb-spacing-lg pt-spacing-sm"> 
            
            <div className="text-sm text-muted-foreground pb-spacing-sm border-b border-border/20 mb-spacing-md flex-shrink-0">
             Domain: {currentDomain.title} ({currentDomainIndex + 1}/{module.domains.length}) - Node: {currentNode.title} ({currentNodeIndex + 1}/{currentDomain.nodes.length})
           </div>
            
            <div className="flex flex-wrap gap-spacing-xs items-center my-spacing-sm">  
              <Badge variant={currentNode.nodeType === 'concept' ? 'default' : currentNode.nodeType === 'principle' ? 'secondary' : 'outline'} className={cn("capitalize text-base px-3 py-1 bg-opacity-70", alignmentProps.buttonClass)}> 
                {currentNode.nodeType}
              </Badge>
               {module.tags && module.tags.length > 0 && (
                 <div className="flex flex-wrap gap-spacing-xs items-center">
                    <span className="text-sm text-muted-foreground/80 ml-spacing-md">Module Tags:</span>
                    {renderKeyTermsWithDefinitions(module.tags, "", 'moduleTag')}
                 </div>
               )}
            </div>
            
            <section className="my-spacing-md space-y-spacing-sm"> 
              <h3 className={`font-semibold text-xl ${alignmentProps.titleColor} mb-spacing-md`}>Learning Objective</h3> 
              <p className="text-foreground/90 body-text leading-relaxed text-base">{currentNode.learningObjective}</p> 
            </section>
            
            <Separator className={cn(`my-spacing-lg ${alignmentProps.borderColorClass} bg-opacity-30`)} />  
            
            <section className="my-spacing-md space-y-spacing-sm"> 
              <h3 className={`font-semibold text-xl ${alignmentProps.titleColor} mb-spacing-md`}>Short Definition</h3> 
              <p className="text-foreground/90 body-text leading-relaxed text-base">{currentNode.shortDefinition}</p> 
            </section>

            <Separator className={cn(`my-spacing-lg ${alignmentProps.borderColorClass} bg-opacity-30`)} />  
            
            <section className="my-spacing-md space-y-spacing-sm"> 
              <h3 className={`font-semibold text-xl ${alignmentProps.titleColor} mb-spacing-md`}>Detailed Clarification</h3> 
              <div className="text-foreground/90 leading-relaxed whitespace-pre-line body-text text-base p-spacing-sm bg-card rounded-md border border-border/20 shadow-sm">{currentNode.download.clarification}</div> 
            </section>

            <Separator className={cn(`my-spacing-lg ${alignmentProps.borderColorClass} bg-opacity-30`)} /> 
            
            <section className="my-spacing-md space-y-spacing-sm"> 
              <h3 className={`font-semibold text-xl ${alignmentProps.titleColor} mb-spacing-md`}>Example</h3> 
              <p className="italic text-muted-foreground bg-muted/20 p-spacing-sm rounded-md border border-border/20 whitespace-pre-line body-text leading-relaxed text-base">{currentNode.download.example}</p>  
            </section>

            <Separator className={cn(`my-spacing-lg ${alignmentProps.borderColorClass} bg-opacity-30`)} /> 
            
            <section className="my-spacing-md space-y-spacing-sm">  
              <h3 className={`font-semibold text-xl ${alignmentProps.titleColor} mb-spacing-md`}>Real-World Scenario</h3> 
              <div className="text-foreground/90 leading-relaxed whitespace-pre-line body-text text-base p-spacing-sm bg-card rounded-md border border-border/20 shadow-sm">{currentNode.download.scenario}</div>  
            </section>
            
            {currentNode.keyTerms && currentNode.keyTerms.length > 0 && (
                <>
                  <Separator className={cn(`my-spacing-md ${alignmentProps.borderColorClass} bg-opacity-30`)} /> 
                  <section className="my-spacing-md"> 
                    {renderKeyTermsWithDefinitions(currentNode.keyTerms, "Node Key Terms", 'keyTerm')}
                  </section>
                </>
              )}
            
            <Separator className={cn(`my-spacing-xl ${alignmentProps.borderColorClass} bg-opacity-50`)} />
             <div className="mt-auto pt-spacing-lg flex-shrink-0 min-h-[300px] max-h-[40vh] flex flex-col">
                <MultiPersonaChatPanel
                    currentNode={currentNode}
                    module={module}
                    currentDomain={currentDomain}
                    allAiCharacters={allAiCharacters}
                    guideCharacter={guideCharacter}
                    generateNodeDialogue={generateNodeDialogue}
                    isLoadingDialogue={isLoadingDialogue}
                />
            </div>

          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

