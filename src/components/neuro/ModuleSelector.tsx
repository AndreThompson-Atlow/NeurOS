'use client';

import type { Module, ModuleStatus, ModuleType } from '@/types/neuro';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Library, Download, BrainCircuit, Check, PlusCircle, Rocket, Search, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDefinition } from '@/data/glossary';
import { getAlignmentStyling, getModuleTypeIcon } from './utils'; 

interface ModuleSelectorProps {
  userModules: Record<string, Module>;
  onStartModule: (moduleId: string) => void;
  onAddModuleToLibrary: (moduleId: string) => void;
  onStartReadingMode: (moduleId: string) => void;
}

const getStatusProps = (status: ModuleStatus | undefined) => {
    switch (status) {
        case 'new': return { text: 'Available', icon: <Search size={14} />, badgeVariant: "outline" as const, badgeClass: "bg-status-new-bg text-status-new border-status-new" };
        case 'in_library': return { text: 'In Library', icon: <Library size={14} />, badgeVariant: "secondary" as const, badgeClass: "bg-status-familiar-bg text-status-familiar border-status-familiar" };
        case 'downloading': return { text: 'Learning', icon: <BookOpen size={14} className="animate-pulse"/>, badgeVariant: "default" as const, badgeClass: "bg-law-surface-color text-law-accent-color border-law-border-color" };
        case 'downloaded': return { text: 'Ready', icon: <BookOpen size={14} />, badgeVariant: "default" as const, badgeClass: "bg-law-surface-color text-law-accent-color border-law-border-color" };
        case 'installing': return { text: 'Learning', icon: <BookOpen size={14} className="animate-pulse"/>, badgeVariant: "default" as const, badgeClass: "bg-chaos-surface-color text-chaos-primary-color border-chaos-border-color" };
        case 'installed': return { text: 'Completed', icon: <Check size={14} />, badgeVariant: "default" as const, badgeClass: "bg-status-understood-bg text-status-understood border-status-understood" };
        default: return { text: 'Unknown', icon: null, badgeVariant: "outline" as const, badgeClass: "bg-muted text-muted-foreground border-border" };
    }
}

export function ModuleSelector({ userModules, onStartModule, onAddModuleToLibrary, onStartReadingMode }: ModuleSelectorProps) {
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      setCustomTopic('');
      setShowCustomInput(false);
    }
  };

  const modulesArray = Object.values(userModules);

  const modulesByStatus = (statuses: ModuleStatus[]) =>
    modulesArray.filter(module => statuses.includes(module.status) && module.domains && module.domains.length > 0);

  const modulesByTypeAndStatus = (type: Module['type'], statuses: ModuleStatus[]) =>
    modulesArray.filter(module => module.type === type && statuses.includes(module.status) && module.domains && module.domains.length > 0);
  
  const auxiliaryModulesByAlignmentAndStatus = (alignment: string, statuses: ModuleStatus[]) =>
    modulesArray.filter(module => module.type === 'auxiliary' && module.alignmentBias?.toLowerCase() === alignment && statuses.includes(module.status) && module.domains && module.domains.length > 0);


  const renderModuleCard = (module: Module) => {
    const statusProps = getStatusProps(module.status);
    const alignmentProps = getAlignmentStyling(module.alignmentBias);
    const typeIcon = getModuleTypeIcon(module.type);

    const canStartDownload = module.status === 'in_library';
    const canContinueDownload = module.status === 'downloading';
    const canStartInstall = module.status === 'downloaded';
    const canContinueInstall = module.status === 'installing';

    let actionButton = null;
    
    if (canStartDownload) {
        actionButton = <Button onClick={() => onStartModule(module.id)} variant={alignmentProps.dataAlignment} size="sm" className={`w-full ${alignmentProps.buttonClass}`}><BookOpen className="mr-spacing-xs" /> Learn This Module</Button>;
    } else if (canContinueDownload) {
        actionButton = <Button onClick={() => onStartModule(module.id)} variant={alignmentProps.dataAlignment} size="sm" className={`w-full ${alignmentProps.buttonClass}`}><BookOpen className="mr-spacing-xs animate-pulse" /> Continue Learning</Button>;
    } else if (canStartInstall) {
        actionButton = <Button onClick={() => onStartReadingMode(module.id)} variant={alignmentProps.dataAlignment} size="sm" className={`w-full ${alignmentProps.buttonClass}`}><BookOpen className="mr-spacing-xs" /> Learn This Module</Button>;
    } else if (canContinueInstall) {
         actionButton = <Button onClick={() => onStartReadingMode(module.id)} variant={alignmentProps.dataAlignment} size="sm" className={`w-full ${alignmentProps.buttonClass}`}><BookOpen className="mr-spacing-xs animate-pulse" /> Continue Learning</Button>;
    } else if (module.status === 'new') {
        actionButton = <Button variant="outline" size="sm" onClick={() => onAddModuleToLibrary(module.id)} className={`w-full border-${alignmentProps.dataAlignment}-border-color text-${alignmentProps.dataAlignment}-primary-color hover:bg-${alignmentProps.dataAlignment}-surface-color`}><PlusCircle className="mr-spacing-xs" /> Add to Library</Button>;
    } else if (module.status === 'installed') {
        actionButton = <Button onClick={() => onStartReadingMode(module.id)} variant={alignmentProps.dataAlignment} size="sm" className={`w-full ${alignmentProps.buttonClass}`}><BookOpen className="mr-spacing-xs" /> Review This Module</Button>;
    }

    return (
      <Card key={module.id} className="flex flex-col justify-between shadow-cyan-sm hover:shadow-cyan-md min-h-[320px] p-spacing-sm" data-alignment={alignmentProps.dataAlignment} data-hover="true"> {/* Increased min-h and added p-spacing-sm */}
        <CardHeader className="pb-spacing-sm">
           <div className="flex justify-between items-start mb-spacing-sm"> {/* Increased bottom margin */}
                <div className="flex items-start gap-spacing-sm flex-grow min-w-0"> {/* Increased gap */}
                    {React.cloneElement(alignmentProps.icon, {className: `flex-shrink-0 mt-1 ${alignmentProps.icon.props.className}`})} 
                    {React.cloneElement(typeIcon, {className: `flex-shrink-0 mt-1 ${typeIcon.props.className}`})}
                    <CardTitle className={`text-xl ${alignmentProps.titleColor} ${alignmentProps.fontClass} whitespace-normal`} title={module.title}>
                        {module.title}
                    </CardTitle>
                </div>
              <div className="flex items-center gap-spacing-xs flex-shrink-0">
                <Badge variant={statusProps.badgeVariant} className={`text-xs px-2 py-1 ${statusProps.badgeClass}`}>
                  {statusProps.icon && React.cloneElement(statusProps.icon as React.ReactElement, { className: "mr-1"})}
                  {statusProps.text}
                </Badge>
              </div>
           </div>
          <CardDescription className="min-h-[4.5rem] overflow-y-auto text-sm text-text-secondary-neuro leading-relaxed pr-spacing-xs scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">{module.description}</CardDescription> {/* Increased min-h */}
        </CardHeader>
        <CardContent className="pt-spacing-sm pb-spacing-sm"> {/* Increased pt & pb */}
            <TooltipProvider>
                <div className="flex flex-wrap gap-spacing-sm mb-spacing-md"> {/* Increased bottom margin */}
                    {module.tags?.slice(0, 3).map(tag => {
                        const definition = getDefinition(tag);
                        return (
                            <Tooltip key={tag}>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className={`text-xs bg-muted/70 border-border text-text-tertiary-neuro cursor-default hover:bg-muted hover:text-text-primary-neuro transition-colors`}>{tag}</Badge>
                                </TooltipTrigger>
                                {definition && (
                                    <TooltipContent side="top" className="max-w-xs text-sm ui-tooltip-content p-spacing-xs rounded-md">
                                        <p className={`font-semibold ${alignmentProps.titleColor}`}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</p>
                                        <p className="text-xs leading-relaxed">{definition}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
             <p className="text-xs text-text-tertiary-neuro">Category: <span className="font-semibold capitalize text-text-secondary-neuro">{Array.isArray(module.moduleCategory) ? module.moduleCategory.join(', ') : module.moduleCategory}</span></p>
        </CardContent>
        <CardFooter className="pt-spacing-sm"> {/* Increased top padding */}
          {actionButton}
        </CardFooter>
      </Card>
    );
  }

  const renderModuleSection = (title: string, modulesToRender: Module[], icon?: React.ReactNode, titleColorClass?: string, titleFontClass?: string) => {
    if (modulesToRender.length === 0) return null;
    return (
      <div className="mb-spacing-xl">
        <h3 className={`module-title ${titleColorClass || 'text-neutral-primary-color'} ${titleFontClass || 'font-theme-neutral'} border-b border-divider-neuro pb-spacing-sm mb-spacing-lg flex items-center`}> {/* Increased mb */}
          {icon && <span className="mr-spacing-sm">{icon}</span>} {/* Increased mr */}
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-spacing-lg"> {/* Added xl:grid-cols-3, increased gap */}
          {modulesToRender.map(renderModuleCard)}
        </div>
      </div>
    );
  };

  const activeOrReadyModules = modulesByStatus(['downloading', 'installing', 'in_library', 'downloaded']);
  const installedModules = modulesByStatus(['installed']);
  
  const exploreCoreModules = modulesByTypeAndStatus('core', ['new', 'in_library']);
  const explorePillarModules = modulesByTypeAndStatus('pillar', ['new', 'in_library']);
  const exploreAuxLaw = auxiliaryModulesByAlignmentAndStatus('law', ['new', 'in_library']);
  const exploreAuxNeutral = auxiliaryModulesByAlignmentAndStatus('neutral', ['new', 'in_library']);
  const exploreAuxChaos = auxiliaryModulesByAlignmentAndStatus('chaos', ['new', 'in_library']);
  const exploreChallengeModules = modulesByTypeAndStatus('challenge', ['new', 'in_library']);
  const allExploreModulesEmpty = !exploreCoreModules.length && !explorePillarModules.length && !exploreAuxLaw.length && !exploreAuxNeutral.length && !exploreAuxChaos.length && !exploreChallengeModules.length;


  return (
    <div className="container mx-auto px-spacing-sm md:px-spacing-md py-spacing-md max-w-full"> {/* Increased max-w */}
       <Tabs defaultValue="library" className="w-full">
         <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-spacing-lg ui-tabs-list p-1.5"> {/* Increased mb and p */}
           <TabsTrigger value="library" className="ui-tabs-trigger py-2.5">My Library</TabsTrigger> {/* Increased py */}
           <TabsTrigger value="explore" className="ui-tabs-trigger py-2.5">Explore Modules</TabsTrigger>
         </TabsList>

         <TabsContent value="library" className="space-y-spacing-xl"> {/* Increased space-y */}
           <h3 className="module-title text-neutral-primary-color font-theme-neutral border-b border-divider-neuro pb-spacing-sm">Active & Ready</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-spacing-lg"> {/* Added xl:grid-cols-3, increased gap */}
                {activeOrReadyModules.length > 0 ? (
                    activeOrReadyModules.map(renderModuleCard)
                ) : (
                    <Card className="md:col-span-full p-spacing-xl text-center bg-card/50 border-border/30"> {/* Increased p */}
                        <p className="secondary-text italic">No modules currently active or ready to start. Add some from 'Explore'!</p>
                    </Card>
                )}
            </div>
              <h3 className="module-title text-law-primary-color font-theme-law border-b border-divider-neuro pb-spacing-sm">Completed Modules</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-spacing-lg"> {/* Added xl:grid-cols-3, increased gap */}
                 {installedModules.length > 0 ? (
                    installedModules.map(renderModuleCard)
                 ) : (
                    <Card className="md:col-span-full p-spacing-xl text-center bg-card/50 border-border/30"> {/* Increased p */}
                        <p className="secondary-text italic">No modules completed yet. Keep learning!</p>
                    </Card>
                 )}
             </div>
         </TabsContent>

        <TabsContent value="explore" className="space-y-spacing-xl"> {/* Increased space-y */}
            {renderModuleSection("Core Foundation", exploreCoreModules, getModuleTypeIcon('core'), getAlignmentStyling(exploreCoreModules[0]?.alignmentBias).titleColor, getAlignmentStyling(exploreCoreModules[0]?.alignmentBias).fontClass)}
            {renderModuleSection("Pillar Modules", explorePillarModules, getModuleTypeIcon('pillar'), getAlignmentStyling(explorePillarModules[0]?.alignmentBias).titleColor || 'text-neutral-primary-color', getAlignmentStyling(explorePillarModules[0]?.alignmentBias).fontClass || 'font-theme-neutral')}
            {renderModuleSection("Auxiliary: Law Alignment", exploreAuxLaw, getAlignmentStyling('law').icon, getAlignmentStyling('law').titleColor, getAlignmentStyling('law').fontClass)}
            {renderModuleSection("Auxiliary: Neutral Alignment", exploreAuxNeutral, getAlignmentStyling('neutral').icon, getAlignmentStyling('neutral').titleColor, getAlignmentStyling('neutral').fontClass)}
            {renderModuleSection("Auxiliary: Chaos Alignment", exploreAuxChaos, getAlignmentStyling('chaos').icon, getAlignmentStyling('chaos').titleColor, getAlignmentStyling('chaos').fontClass)}
            {renderModuleSection("Challenge Modules", exploreChallengeModules, getModuleTypeIcon('challenge'), getAlignmentStyling(exploreChallengeModules[0]?.alignmentBias).titleColor || 'text-chaos-primary-color', getAlignmentStyling(exploreChallengeModules[0]?.alignmentBias).fontClass || 'font-theme-chaos')}

            {allExploreModulesEmpty &&
             (
                 <Card className="md:col-span-full p-spacing-xl text-center bg-card/50 border-border/30"> {/* Increased p */}
                    <p className="secondary-text italic">All available modules are in your library or completed!</p>
                 </Card>
             )
            }
        </TabsContent>
       </Tabs>
    </div>
  );
}
