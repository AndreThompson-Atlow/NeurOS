
'use client';

import React, { useState } from 'react';
import { getDefinition } from '@/data/glossary';
import type { AlignmentStyling } from './utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Tag, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';


interface SidebarPanelRightProps {
  keyTerms: string[];
  moduleTags: string[];
  alignmentProps: AlignmentStyling;
  currentNodeTitle: string;
  currentDomainTitle: string; 
  moduleTitle: string; 
}

export function SidebarPanelRight({ keyTerms, moduleTags, alignmentProps, currentNodeTitle, currentDomainTitle, moduleTitle }: SidebarPanelRightProps) {
  const isMobile = useIsMobile(); 
  const [activeTermDefinition, setActiveTermDefinition] = useState<{ term: string, definition: string, type: 'keyTerm' | 'moduleTag' } | null>(null);

  const handleTermClick = (term: string, type: 'keyTerm' | 'moduleTag') => {
    const definition = getDefinition(term);
    if (isMobile && definition) { 
      setActiveTermDefinition(activeTermDefinition?.term === term && activeTermDefinition?.type === type ? null : { term, definition, type });
    }
  };

  return (
    <Card 
      className={cn(
        `p-spacing-md border-r-4 ${alignmentProps.borderColorClass} bg-card/95 flex flex-col h-full shadow-cyan-sm overflow-hidden`
      )}
      data-alignment={alignmentProps.dataAlignment}
    >
      <CardHeader className="pb-spacing-sm pt-0 px-0 mb-spacing-sm flex-shrink-0"> 
        <CardTitle className={`text-xl font-display ${alignmentProps.titleColor} mb-spacing-xs`}>Context</CardTitle>
        <p className="text-xs text-muted-foreground truncate" title={moduleTitle}>Module: {moduleTitle}</p>
        <p className="text-xs text-muted-foreground truncate" title={currentDomainTitle}>Domain: {currentDomainTitle}</p>
        <p className="text-xs text-muted-foreground truncate" title={currentNodeTitle}>Node: {currentNodeTitle}</p>
      </CardHeader>
      <CardContent className="pt-0 px-0 flex-grow overflow-hidden"> 
        <ScrollArea className="h-full w-full scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <div className="p-spacing-xs space-y-spacing-md"> {/* Use smaller padding for internal content if needed */}
                <div className="mb-spacing-md pt-spacing-xs">
                    <h3 className={`font-semibold text-lg mb-spacing-sm flex items-center gap-spacing-xs ${alignmentProps.titleColor}`}>
                        <Tag size={18} /> Module Tags
                    </h3>
                    <div className="flex flex-wrap gap-spacing-xs">
                        {moduleTags.map(term => { 
                            const definition = getDefinition(term);
                            return (
                                <TooltipProvider key={`${term}-module-tag-sidebar-${moduleTitle}`} delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    `text-xs px-2 py-0.5 cursor-default mb-spacing-xs`, 
                                                    `bg-opacity-20 border-opacity-50 hover:bg-opacity-30`,
                                                    alignmentProps.borderColorClass,
                                                    alignmentProps.titleColor,
                                                )}
                                                onClick={() => handleTermClick(term, 'moduleTag')}
                                            >
                                                {term.charAt(0).toUpperCase() + term.slice(1)}
                                            </Badge>
                                        </TooltipTrigger>
                                        {!isMobile && definition && (
                                            <TooltipContent side="top" className="max-w-xs text-xs ui-tooltip-content p-spacing-xs rounded-md">
                                                <p className={`font-semibold ${alignmentProps.titleColor}`}>{term.charAt(0).toUpperCase() + term.slice(1)}</p>
                                                <p>{definition}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                        {moduleTags.length === 0 && <p className="text-xs text-muted-foreground italic">No module tags.</p>}
                    </div>
                    {isMobile && activeTermDefinition?.type === 'moduleTag' && activeTermDefinition?.definition && (
                        <Card className="mt-spacing-sm p-spacing-xs bg-muted/50 border border-border/30 rounded-md text-xs text-foreground/90">
                            <CardTitle className={`font-semibold text-sm ${alignmentProps.titleColor} mb-spacing-xs`}>{activeTermDefinition.term.charAt(0).toUpperCase() + activeTermDefinition.term.slice(1)}</CardTitle>
                            <CardContent className="p-0"><p>{activeTermDefinition.definition}</p></CardContent>
                        </Card>
                    )}
                </div>

                <Separator className={cn(`my-spacing-md ${alignmentProps.borderColorClass} bg-opacity-30`)} />

                <div className="pb-spacing-md">
                    <h3 className={`font-semibold text-lg mb-spacing-sm flex items-center gap-spacing-xs ${alignmentProps.titleColor}`}>
                        <Info size={18} /> Node Key Terms
                    </h3>
                    <div className="space-y-spacing-sm"> 
                        {keyTerms.map(term => {
                            const definition = getDefinition(term);
                            return (
                                <div key={`${term}-key-term-sidebar-${currentNodeTitle}`} className="p-spacing-sm rounded-md bg-muted/30 border border-border/20"> 
                                    <h4 className="font-semibold text-sm text-foreground/95">{term.charAt(0).toUpperCase() + term.slice(1)}</h4>
                                    {definition ? (
                                        <p className="text-xs text-muted-foreground/90 leading-relaxed mt-spacing-xs">{definition}</p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground/70 italic mt-spacing-xs">No definition available for this term.</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {keyTerms.length === 0 && <p className="text-sm text-muted-foreground italic">No key terms for this node.</p>}
                </div>
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
