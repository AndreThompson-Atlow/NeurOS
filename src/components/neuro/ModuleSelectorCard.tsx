'use client';

import type { Module, ModuleStatus } from '@/types/neuro';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Library, Download, BrainCircuit, Check, PlusCircle, Rocket, Search, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDefinition } from '@/data/glossary';
import { getAlignmentStyling, getModuleTypeIcon } from './utils';

interface ModuleSelectorCardProps {
  module: Module;
  onStartModule: (moduleId: string) => void;
  onAddModuleToLibrary: (moduleId: string) => void;
  onStartReadingMode: (moduleId: string) => void;
}

const getStatusProps = (status: ModuleStatus | undefined) => {
    switch (status) {
        case 'new': return { text: 'Available', icon: <Search size={16} />, badgeVariant: "outline" as const, badgeClass: "bg-status-new-bg text-status-new border-status-new" };
        case 'in_library': return { text: 'In Library', icon: <Library size={16} />, badgeVariant: "secondary" as const, badgeClass: "bg-status-familiar-bg text-status-familiar border-status-familiar" };
        case 'downloading': return { text: 'Downloading...', icon: <Download size={16} className="animate-pulse"/>, badgeVariant: "default" as const, badgeClass: "bg-law-surface-color text-law-accent-color border-law-border-color" };
        case 'downloaded': return { text: 'Ready to Install', icon: <BrainCircuit size={16} />, badgeVariant: "default" as const, badgeClass: "bg-law-surface-color text-law-accent-color border-law-border-color" };
        case 'installing': return { text: 'Installing...', icon: <BrainCircuit size={16} className="animate-pulse"/>, badgeVariant: "default" as const, badgeClass: "bg-chaos-surface-color text-chaos-primary-color border-chaos-border-color" };
        case 'installed': return { text: 'Installed', icon: <Check size={16} />, badgeVariant: "default" as const, badgeClass: "bg-status-understood-bg text-status-understood border-status-understood" };
        default: return { text: 'Unknown', icon: null, badgeVariant: "outline" as const, badgeClass: "bg-muted text-muted-foreground border-border" };
    }
}

export function ModuleSelectorCard({ module, onStartModule, onAddModuleToLibrary, onStartReadingMode }: ModuleSelectorCardProps) {
    const statusProps = getStatusProps(module.status);
    const alignmentProps = getAlignmentStyling(module.alignmentBias);
    const typeIcon = getModuleTypeIcon(module.type);

    const canStartDownload = module.status === 'in_library';
    const canContinueDownload = module.status === 'downloading';
    const canStartInstall = module.status === 'downloaded';
    const canContinueInstall = module.status === 'installing';

    let actionButton = null;
    
    if (canStartDownload) {
        actionButton = <Button onClick={() => onStartModule(module.id)} variant={alignmentProps.dataAlignment} className={`w-full ${alignmentProps.buttonClass} py-3 text-sm font-medium hover:scale-[1.02] hover:shadow-cyan-md`}><Download className="mr-spacing-sm h-5 w-5" /> Learn This Module</Button>;
    } else if (canContinueDownload) {
        actionButton = <Button onClick={() => onStartModule(module.id)} variant={alignmentProps.dataAlignment} className={`w-full ${alignmentProps.buttonClass} py-3 text-sm font-medium hover:scale-[1.02] hover:shadow-cyan-md`}><Download className="mr-spacing-sm h-5 w-5 animate-pulse" /> Continue Learning</Button>;
    } else if (canStartInstall) {
        actionButton = <Button onClick={() => onStartModule(module.id)} variant={alignmentProps.dataAlignment} className={`w-full ${alignmentProps.buttonClass} py-3 text-sm font-medium hover:scale-[1.02] hover:shadow-cyan-md`}><BrainCircuit className="mr-spacing-sm h-5 w-5" /> Start Installing</Button>;
    } else if (canContinueInstall) {
         actionButton = <Button onClick={() => onStartModule(module.id)} variant={alignmentProps.dataAlignment} className={`w-full ${alignmentProps.buttonClass} py-3 text-sm font-medium hover:scale-[1.02] hover:shadow-cyan-md`}><BrainCircuit className="mr-spacing-sm h-5 w-5 animate-pulse" /> Continue Installing</Button>;
    } else if (module.status === 'new') {
        actionButton = <Button variant="outline" onClick={() => onAddModuleToLibrary(module.id)} className={`w-full border-${alignmentProps.dataAlignment}-border-color text-${alignmentProps.dataAlignment}-primary-color hover:bg-${alignmentProps.dataAlignment}-surface-color py-3 text-sm font-medium hover:scale-[1.02] hover:shadow-cyan-md`}><PlusCircle className="mr-spacing-sm h-5 w-5" /> Add to Library</Button>;
    } else if (module.status === 'installed') {
        actionButton = <Button variant="default" className={`w-full opacity-70 cursor-default ${alignmentProps.buttonClass} bg-opacity-70 py-3 text-sm`} disabled><Check className="mr-spacing-sm h-5 w-5" /> Installed</Button>;
    }

    return (
      <Card 
        key={module.id} 
        className="flex flex-col justify-between shadow-cyan-sm hover:scale-[1.02] hover:shadow-cyan-md min-h-[380px] p-8" 
        data-alignment={alignmentProps.dataAlignment}
        data-hover="true"
      >
        <CardHeader className="pb-5 pt-1 px-1">
           <div className="flex justify-between items-center mb-5"> 
                <div className="flex items-center gap-4 flex-shrink-0"> 
                    {React.cloneElement(alignmentProps.icon, {className: `flex-shrink-0 h-7 w-7 ${alignmentProps.icon.props.className}`})} 
                    {React.cloneElement(typeIcon, {className: `flex-shrink-0 h-7 w-7 ${typeIcon.props.className}`})}
                </div>
              <div className="flex items-center gap-3 flex-shrink-0"> 
                <Badge variant={statusProps.badgeVariant} className={`text-sm px-3 py-1 ${statusProps.badgeClass}`}>
                  {statusProps.icon && React.cloneElement(statusProps.icon as React.ReactElement, { className: "mr-2 h-5 w-5"})}
                  {statusProps.text}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" onClick={() => onStartReadingMode(module.id)} aria-label={`Read module: ${module.title}`}>
                        <BookOpen size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="ui-tooltip-content">
                      <p>Enter Reading Mode</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
           </div>

           <CardTitle className={`text-3xl leading-tight ${alignmentProps.titleColor} ${alignmentProps.fontClass} whitespace-normal mt-2 mb-5 pb-2 border-b border-${alignmentProps.dataAlignment}-border-color/30`} title={module.title}>
               {module.title}
           </CardTitle>
           
          <p className="min-h-[5.5rem] overflow-y-auto text-base text-text-secondary-neuro leading-relaxed pr-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent line-clamp-4">{module.description}</p>
        </CardHeader>
        <CardContent className="pt-4 pb-5 px-1">
            <TooltipProvider>
                <div className="flex flex-wrap gap-3 mb-5">
                    {module.tags?.slice(0, 4).map(tag => {
                        const definition = getDefinition(tag);
                        return (
                            <Tooltip key={tag}>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className={`text-sm bg-muted/70 border-border text-text-tertiary-neuro cursor-default hover:bg-muted hover:text-text-primary-neuro transition-colors px-3 py-1.5`}>{tag}</Badge>
                                </TooltipTrigger>
                                {definition && (
                                    <TooltipContent side="top" className="max-w-xs text-sm ui-tooltip-content p-2 rounded-md">
                                        <p className={`font-semibold ${alignmentProps.titleColor}`}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</p>
                                        <p className="text-xs leading-relaxed">{definition}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
             <p className="text-sm text-text-tertiary-neuro mb-3">Category: <span className="font-semibold capitalize text-text-secondary-neuro">{Array.isArray(module.moduleCategory) ? module.moduleCategory.join(', ') : module.moduleCategory}</span></p>
        </CardContent>
        <CardFooter className="pt-4 px-1 pb-1 mt-auto">
          {actionButton}
        </CardFooter>
      </Card>
    );
  }

