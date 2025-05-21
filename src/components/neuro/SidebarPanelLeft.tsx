
'use client';

import type { Module, Domain, Node as NeuroNode } from '@/types/neuro';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronRight, FolderOpen, FileText as FileTextIcon, Users } from 'lucide-react'; 
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { getCharacterById } from '@/lib/server/characters'; 
import { SPECTER_TYPES_DATA } from '@/ai/specter-data'; 
import type { AlignmentStyling } from './utils'; 
import React, {useState, useEffect} from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'; 
import { cn } from "@/lib/utils";
// Removed MultiPersonaChatPanel import
// import { MultiPersonaChatPanel } from './MultiPersonaChatPanel'; 
// import type { Character } from '@/types/characterTypes';
// import type { GenerateReadingDialogueOutput, DialogueTurn as GenkitDialogueTurn } from '@/ai/flows/types/generateReadingDialogueTypes';

interface SidebarPanelLeftProps {
  module: Module;
  currentDomain: Domain;
  currentNode: NeuroNode;
  onNavigate: (direction: 'next_node' | 'prev_node' | 'next_domain' | 'prev_domain' | 'domain_start' | `jump_to_node:${number}`) => void;
  alignmentProps: AlignmentStyling;
  // Removed chat-related props
  // allAiCharacters: Character[];
  // guideCharacter: Character | null;
  // generateNodeDialogue: (node: NeuroNode, module: Module, domain: Domain, personalities: string[], previousDialogue?: GenkitDialogueTurn[]) => Promise<GenerateReadingDialogueOutput>;
  // isLoadingDialogue: boolean;
}

const getSpecterName = (specterId: string): string => {
  const specterData = SPECTER_TYPES_DATA[specterId];
  return specterData?.name || specterId.replace(/-specter$/, '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
};


export function SidebarPanelLeft({ 
  module, 
  currentDomain, 
  currentNode, 
  onNavigate, 
  alignmentProps,
  // Removed chat-related props from destructuring
  // allAiCharacters,
  // guideCharacter,
  // generateNodeDialogue,
  // isLoadingDialogue
}: SidebarPanelLeftProps) {
  
  const [characterNames, setCharacterNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchNames = async () => {
      const namesToFetch: Record<string, string> = {};
      if (currentDomain.characterAffinities && currentDomain.characterAffinities.length > 0) {
        for (const charId of currentDomain.characterAffinities) {
          if (!characterNames[charId]) { 
            try {
              const char = await getCharacterById(charId); 
              if (char) {
                namesToFetch[charId] = char.name;
              } else {
                namesToFetch[charId] = charId; 
              }
            } catch (error) {
              console.error(`Error fetching character ${charId}:`, error);
              namesToFetch[charId] = charId; 
            }
          }
        }
      }
      if (Object.keys(namesToFetch).length > 0) {
        setCharacterNames(prev => ({ ...prev, ...namesToFetch }));
      }
    };
    fetchNames();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDomain.characterAffinities]); 


  const handleNodeNavigation = (nodeIndex: number) => {
    onNavigate(`jump_to_node:${nodeIndex}`);
  };

  return (
    <div className="p-spacing-md flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-spacing-sm pt-0 px-0 mb-spacing-md flex-shrink-0">
        <CardTitle className={`text-xl font-display ${alignmentProps.titleColor} truncate`} title={currentDomain.title}>
          Domain: {currentDomain.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-spacing-xs leading-relaxed line-clamp-3">
          {currentDomain.learningGoal}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-spacing-xs px-0 flex-grow overflow-hidden flex flex-col"> 
        <div className="mb-spacing-md pb-spacing-md border-b border-divider-neuro"> 
          <h3 className={`text-lg font-semibold ${alignmentProps.titleColor} truncate mb-spacing-xs flex items-center`} title={currentNode.title}>
            <FileTextIcon size={18} className="inline-block mr-spacing-xs flex-shrink-0" />
            <span className="truncate">Node: {currentNode.title}</span>
          </h3>
          <Badge variant="outline" className={cn(
            `mt-spacing-xs text-xs capitalize px-2 py-0.5`, 
            alignmentProps.borderColorClass, 
            alignmentProps.titleColor, 
            `${alignmentProps.buttonClass ? alignmentProps.buttonClass.split(' ')[0] : 'bg-muted'}/20`
            )}>
            Status: {currentNode.status.replace('_', ' ')}
          </Badge>
        </div>

        {(currentDomain.characterAffinities?.length > 0 || currentDomain.specterAffinities?.length > 0) && (
          <div className="mb-spacing-md pb-spacing-md border-b border-divider-neuro space-y-spacing-sm flex-shrink-0">  
            <TooltipProvider delayDuration={100}>
              {currentDomain.characterAffinities?.length > 0 && (
                <div className="mb-spacing-sm">
                  <p className="text-xs font-semibold text-muted-foreground mb-spacing-xs flex items-center gap-1"><Users size={14}/>Guides:</p>
                  <div className="flex flex-wrap gap-spacing-xs">
                    {currentDomain.characterAffinities.map(charId => (
                      <Tooltip key={charId}>
                        <TooltipTrigger asChild>
                           <div className="cursor-default"> 
                            <Badge variant="secondary" className={`text-xs bg-neutral-surface-color text-neutral-text-on-surface-color border-neutral-border-color px-2 py-0.5`}>{characterNames[charId] || 'Loading...'}</Badge>
                           </div>
                        </TooltipTrigger>
                        <TooltipContent className="ui-tooltip-content"><p>{characterNames[charId] || charId}</p></TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
              {currentDomain.specterAffinities?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-spacing-xs">Challenges:</p>
                  <div className="flex flex-wrap gap-spacing-xs">
                    {currentDomain.specterAffinities.map(specterId => (
                      <Tooltip key={specterId}>
                        <TooltipTrigger asChild>
                           <div className="cursor-default"> 
                           <Badge variant="destructive" className={`text-xs bg-chaos-surface-color text-chaos-text-on-surface-color border-chaos-border-color px-2 py-0.5`}>{getSpecterName(specterId)}</Badge>
                           </div>
                        </TooltipTrigger>
                        <TooltipContent className="ui-tooltip-content"><p>{getSpecterName(specterId)}</p></TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </TooltipProvider>
          </div>
        )}
        
        <h4 className="text-sm font-semibold text-muted-foreground mb-spacing-sm flex items-center gap-spacing-xs pt-spacing-sm flex-shrink-0"> 
            <FolderOpen size={16} />Nodes in Domain:
        </h4>
        <ScrollArea className="flex-grow pr-spacing-xs scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"> 
          <ul className="space-y-spacing-xs py-spacing-xs">
            {currentDomain.nodes.map((node, index) => (
              <li key={node.id} className="py-0.5 px-0"> 
                <Button
                  variant={node.id === currentNode.id ? alignmentProps.dataAlignment : "ghost"}
                  size="sm"
                  className={cn(
                    `w-full justify-start text-left text-xs h-auto py-1.5 px-2 truncate`,  
                    node.id === currentNode.id ? alignmentProps.buttonClass : `text-muted-foreground hover:bg-muted/50 hover:${alignmentProps.titleColor}`
                  )}
                  onClick={() => handleNodeNavigation(index)}
                  title={node.title}
                >
                  {node.id === currentNode.id && <ChevronRight size={14} className="mr-1 flex-shrink-0" />}
                  <span className="truncate">{node.title}</span>
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
       {/* Chat panel removed from here */}
    </div>
  );
}
