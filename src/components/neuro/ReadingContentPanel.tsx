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
import type { GenerateReadingDialogueOutput } from '@/ai/flows/types/generateReadingDialogueTypes';


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
    previousDialogue?: any[] 
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
    <div className="neuro-section">
        <h4 className={cn(`neuro-text-subheading ${alignmentProps.titleColor} mb-spacing-xs flex items-center gap-spacing-xs`)}>
          {termType === 'keyTerm' ? <Info size={18} /> : <Tag size={18} />}
          {title}
        </h4>
        <div className="flex flex-wrap gap-spacing-xs mt-spacing-xs">
          {terms.map(term => {
            const definition = getDefinition(term);
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
        {activeTermDefinition && activeTermDefinition.type === termType && (
          <div className="mt-spacing-sm p-spacing-sm text-sm bg-muted/30 rounded-md">
            <p className="font-semibold">{activeTermDefinition.term}</p>
            <p>{activeTermDefinition.definition}</p>
          </div>
        )}
    </div>
    );
  };

  return (
    <Card 
      className={cn(
        "w-full flex flex-col flex-grow border-t-0 bg-transparent shadow-none p-0 overflow-hidden h-full neuro-fade-in"
      )} 
      data-hover="false"
    > 
      <CardHeader className="pb-spacing-xs pt-spacing-sm px-spacing-md mb-spacing-sm flex-shrink-0 border-b border-border/20"> 
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-spacing-xs mb-spacing-sm">  
          <div className="flex-grow min-w-0"> 
            <CardTitle className={cn("neuro-text-heading whitespace-normal mb-spacing-xs", alignmentProps.titleColor, alignmentProps.fontClass)} title={currentNode.title}>  
              {currentNode.title}
            </CardTitle>
            <CardDescription className="neuro-text-small text-muted-foreground/90 leading-relaxed line-clamp-3" title={module.description}>  
              {module.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-spacing-sm items-center pt-spacing-sm border-t border-divider-neuro mt-spacing-md"> 
          <Button 
            onClick={onExit} 
            variant="default" 
            size="sm" 
            className={cn(
              "neuro-button h-9 text-xs px-3 py-2 bg-primary/90 text-primary-foreground font-medium shadow-md",
              "hover:bg-primary hover:shadow-lg border border-primary/50"
            )}
          >
            <ArrowLeft className="mr-spacing-xs h-4 w-4" /> Return to Library
          </Button>
          {startButtonLabel && module.status !== 'installed' && (
            <Button onClick={() => onStartModule(module.id)} variant={alignmentProps.dataAlignment} size="sm" className={cn("neuro-button h-9 text-xs px-3 py-2", alignmentProps.buttonClass)}> 
              {module.status === 'downloading' || module.status === 'installing' ? <Loader2 className="mr-spacing-xs h-4 w-4 animate-spin" /> : <BookOpen className="mr-spacing-xs h-4 w-4" />} 
              {startButtonLabel}
            </Button>
          )}
          {isVoiceModeActive && (
            <Button onClick={handleSpeakPage} variant="outline" size="sm" disabled={isLoadingTTS} className={cn("neuro-button h-9 text-xs px-3 py-2 bg-opacity-20 border-opacity-50 hover:bg-opacity-30", alignmentProps.buttonClass)}> 
              {isLoadingTTS ? <Loader2 className="mr-spacing-xs h-4 w-4 animate-spin" /> : (isSpeaking ? <VolumeX className="mr-spacing-xs h-4 w-4" /> : <Volume2 className="mr-spacing-xs h-4 w-4" />)} 
              {isSpeaking ? "Stop Reading" : "Read Page"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-grow overflow-hidden"> 
        <ScrollArea viewportRef={scrollViewportRef} className="h-full px-spacing-md scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"> 
          <div className="space-y-spacing-lg pb-spacing-lg pt-spacing-sm"> 
            
            <section className="neuro-section"> 
              <h3 className={cn(`neuro-section-title ${alignmentProps.titleColor}`)}>Short Definition</h3> 
              <p className="neuro-text-body">{currentNode.shortDefinition}</p> 
            </section>

            <Separator className={cn(`my-spacing-md ${alignmentProps.borderColorClass} bg-opacity-30`)} />  
            
            <section className="neuro-section"> 
              <h3 className={cn(`neuro-section-title ${alignmentProps.titleColor}`)}>Learning Objective</h3> 
              <p className="neuro-text-body">{currentNode.learningObjective}</p> 
            </section>
            
            <Separator className={cn(`my-spacing-md ${alignmentProps.borderColorClass} bg-opacity-30`)} />  
            
            <section className="neuro-section"> 
              <h3 className={cn(`neuro-section-title ${alignmentProps.titleColor}`)}>Detailed Clarification</h3> 
              <div className="neuro-text-body p-spacing-sm bg-card/50 rounded-md border border-border/20 shadow-sm">{currentNode.download.clarification}</div> 
            </section>

            <Separator className={cn(`my-spacing-md ${alignmentProps.borderColorClass} bg-opacity-30`)} /> 
            
            <section className="neuro-section"> 
              <h3 className={cn(`neuro-section-title ${alignmentProps.titleColor}`)}>Example</h3> 
              <p className="italic text-muted-foreground bg-muted/20 p-spacing-sm rounded-md border border-border/20 neuro-text-body">{currentNode.download.example}</p>  
            </section>

            <Separator className={cn(`my-spacing-md ${alignmentProps.borderColorClass} bg-opacity-30`)} /> 
            
            <section className="neuro-section">  
              <h3 className={cn(`neuro-section-title ${alignmentProps.titleColor}`)}>Real-World Scenario</h3> 
              <div className="neuro-text-body p-spacing-sm bg-card/50 rounded-md border border-border/20 shadow-sm">{currentNode.download.scenario}</div>  
            </section>
            
            {currentNode.keyTerms && currentNode.keyTerms.length > 0 && (
                <>
                  <Separator className={cn(`my-spacing-md ${alignmentProps.borderColorClass} bg-opacity-30`)} /> 
                  <section className="neuro-section"> 
                    {renderKeyTermsWithDefinitions(currentNode.keyTerms, "Key Terms", 'keyTerm')}
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