'use client';

import type { Module, Domain, Node as NeuroNode } from '@/types/neuro'; 
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { SidebarPanelLeft } from './SidebarPanelLeft';
import { ReadingContentPanel } from './ReadingContentPanel';
import { SidebarPanelRight } from './SidebarPanelRight';
import { getAlignmentStyling } from './utils';
import type { Character } from '@/types/characterTypes'; 
import type { GenerateReadingDialogueOutput } from '@/ai/flows/types/generateReadingDialogueTypes';
import { cn } from '@/lib/utils';
import { Card, CardFooter } from '@/components/ui/card';
// Removed Separator import as it's no longer used here

interface ReadingModeDisplayProps {
  module: Module;
  currentDomain: Domain;
  currentNode: NeuroNode;
  currentDomainIndex: number;
  currentNodeIndex: number;
  onNavigate: (direction: 'next_node' | 'prev_node' | 'next_domain' | 'prev_domain' | 'domain_start' | `jump_to_node:${number}`) => void;
  onExit: () => void;
  onStartModule: (moduleId: string) => void; 
  speakText: (text: string) => Promise<void>;
  generateNodeDialogue: (node: NeuroNode, module: Module, domain: Domain, personalities: string[], previousDialogue?: any[]) => Promise<GenerateReadingDialogueOutput>;
  isSpeaking: boolean;
  isLoadingTTS: boolean;
  isLoadingDialogue: boolean; 
  stopSpeaking: () => void;
  isVoiceModeActive: boolean;
  allAiCharacters: Character[]; 
  guideCharacter: Character | null; 
}

export function ReadingModeDisplay({
  module,
  currentDomain,
  currentNode,
  currentDomainIndex,
  currentNodeIndex,
  onNavigate,
  onExit,
  onStartModule,
  speakText,
  generateNodeDialogue, 
  isSpeaking,
  isLoadingTTS,
  isLoadingDialogue, 
  stopSpeaking,
  isVoiceModeActive,
  allAiCharacters,
  guideCharacter
}: ReadingModeDisplayProps) {

  if (!module || !currentDomain || !currentNode) {
    return (
      <div className="neuro-container neuro-fade-in flex flex-col justify-center items-center min-h-screen">
        <p className="text-destructive text-xl">Error: Could not load reading content.</p>
        <Button onClick={onExit} variant="outline" className="mt-spacing-lg neuro-button">
          <ArrowLeft className="mr-spacing-sm" /> Back to Library
        </Button>
      </div>
    );
  }
  
  const alignmentProps = getAlignmentStyling(module.alignmentBias);

  const getStartButtonLabel = (status: Module['status'] | undefined): string | null => {
    switch (status) {
      case "new":
      case "in_library": return "Start Download";
      case "downloaded": return "Start Install";
      case "installing": return "Continue Install";
      case "downloading": return "Continue Download";
      case "installed": return null; 
      default: return null;
    }
  };

  const startButtonLabel = getStartButtonLabel(module.status);

  return (
    <div className="neuro-layout-sidebar gap-spacing-md p-spacing-md min-h-screen bg-background neuro-fade-in">
      <div className={cn(
        "neuro-sidebar flex-shrink-0 flex flex-col overflow-hidden rounded-lg shadow-sm neuro-card",
        "lg:max-h-[calc(100vh-var(--spacing-lg)*2)]", 
        alignmentProps.borderColorClass, "border-l-4"
        )}
        data-alignment={alignmentProps.dataAlignment}
      > 
        <SidebarPanelLeft 
          module={module}
          currentDomain={currentDomain}
          currentNode={currentNode}
          onNavigate={onNavigate}
          alignmentProps={alignmentProps}
        />
      </div>

      <div className={cn(
        "neuro-main-content min-w-0 flex flex-col overflow-hidden rounded-lg shadow-md neuro-card",
        "lg:max-h-[calc(100vh-var(--spacing-lg)*2)]" 
        )}
      > 
        <ReadingContentPanel
          module={module}
          currentDomain={currentDomain}
          currentNode={currentNode}
          currentDomainIndex={currentDomainIndex}
          currentNodeIndex={currentNodeIndex}
          alignmentProps={alignmentProps}
          onExit={onExit}
          onStartModule={onStartModule}
          startButtonLabel={startButtonLabel}
          speakText={speakText}
          isSpeaking={isSpeaking}
          isLoadingTTS={isLoadingTTS}
          stopSpeaking={stopSpeaking}
          isVoiceModeActive={isVoiceModeActive}
          allAiCharacters={allAiCharacters}
          guideCharacter={guideCharacter}
          generateNodeDialogue={generateNodeDialogue}
          isLoadingDialogue={isLoadingDialogue}
        />
        <CardFooter className="p-spacing-sm border-t border-divider-neuro mt-auto flex-shrink-0 bg-card">
          <div className="grid grid-cols-2 gap-spacing-sm w-full">
            <Button variant="outline" size="sm" onClick={() => onNavigate('prev_node')} disabled={currentNodeIndex === 0 && currentDomainIndex === 0} className={cn("text-sm py-spacing-xs neuro-button", alignmentProps.borderColorClass, alignmentProps.titleColor)}>
              <ArrowLeftCircle className="mr-1.5" /> Prev Node
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('next_node')} disabled={currentNodeIndex >= currentDomain.nodes.length - 1 && currentDomainIndex >= module.domains.length - 1} className={cn("text-sm py-spacing-xs neuro-button", alignmentProps.borderColorClass, alignmentProps.titleColor)}>
              Next Node <ArrowRightCircle className="ml-1.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('prev_domain')} disabled={currentDomainIndex === 0} className={cn("text-sm py-spacing-xs neuro-button", alignmentProps.borderColorClass, alignmentProps.titleColor)}>
              <ArrowUpCircle className="mr-1.5 rotate-[270deg]" /> Prev Domain
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('next_domain')} disabled={currentDomainIndex >= module.domains.length - 1} className={cn("text-sm py-spacing-xs neuro-button", alignmentProps.borderColorClass, alignmentProps.titleColor)}>
              Next Domain <ArrowDownCircle className="ml-1.5 rotate-[270deg]" />
            </Button>
          </div>
        </CardFooter>
      </div>

       <div className={cn(
         "neuro-sidebar flex-shrink-0 flex flex-col overflow-hidden rounded-lg shadow-sm neuro-card",
         "lg:max-h-[calc(100vh-var(--spacing-lg)*2)]", 
         alignmentProps.borderColorClass, "border-r-4"
         )}
         data-alignment={alignmentProps.dataAlignment}
        >  
        <SidebarPanelRight
          keyTerms={currentNode.keyTerms}
          moduleTags={module.tags || []}
          alignmentProps={alignmentProps}
          currentNodeTitle={currentNode.title}
          currentDomainTitle={currentDomain.title}
          moduleTitle={module.title}
        />
      </div>
    </div>
  );
}
