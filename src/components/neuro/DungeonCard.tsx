
'use client';

import React from 'react';
import type { Dungeon } from '@/types/chronicle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getAlignmentStyling } from './utils';

interface DungeonCardProps {
  dungeon: Dungeon;
  onEnter: () => void;
  hasRequiredModules: boolean;
}

export function DungeonCard({ dungeon, onEnter, hasRequiredModules }: DungeonCardProps) {
  const alignmentProps = getAlignmentStyling(dungeon.alignment);

  let buttonVariant: "primary" | "secondary" | "destructive" | "law" | "chaos" | "neutral" = "secondary";
  if (alignmentProps.dataAlignment === "law") buttonVariant = "law";
  else if (alignmentProps.dataAlignment === "chaos") buttonVariant = "chaos";
  else if (alignmentProps.dataAlignment === "neutral") buttonVariant = "neutral";

  return (
    <Card 
        className="shadow-md hover:scale-[1.02] hover:shadow-cyan-md transition-shadow duration-300 flex flex-col p-spacing-sm" 
        data-alignment={alignmentProps.dataAlignment}
    >
      <CardHeader className="p-spacing-sm pb-spacing-xs">
        <div className="flex items-start justify-between mb-spacing-xs">
            <div className="flex-1 min-w-0">
                <CardTitle className={`text-xl font-display flex items-center ${alignmentProps.titleColor} ${alignmentProps.fontClass}`}>
                     {React.cloneElement(alignmentProps.icon, { size: 22, className: `mr-spacing-sm ${alignmentProps.titleColor.replace('text-glow-','')}`})}
                     {dungeon.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground/80 mt-spacing-xs line-clamp-3 leading-relaxed">{dungeon.description}</CardDescription>
            </div>
            {dungeon.thumbnailUrl && (
                 <Image src={dungeon.thumbnailUrl} alt={dungeon.name} width={56} height={56} className="rounded-md ml-spacing-sm object-cover" data-ai-hint="dungeon landscape" />
            )}
        </div>
         {dungeon.requiredModules && dungeon.requiredModules.length > 0 && (
            <p className="text-sm text-muted-foreground/70 pt-spacing-sm mt-spacing-xs border-t border-border/20">
              Requires knowledge from: {dungeon.requiredModules.join(', ').substring(0,50)}{dungeon.requiredModules.join(', ').length > 50 ? '...' : ''}
            </p>
        )}
      </CardHeader>
      <CardContent className="p-spacing-sm pt-spacing-xs text-sm text-muted-foreground flex-grow space-y-spacing-xs">
        <p>Type: <span className="font-semibold capitalize text-foreground/90">{dungeon.type}</span></p>
        <p>Difficulty: <span className="font-semibold text-foreground/90">{dungeon.difficulty || dungeon.difficultyLevel}/10</span></p>
        {dungeon.domainDungeonType && <p>Theme: <span className="font-semibold capitalize text-foreground/90">{dungeon.domainDungeonType.replace(/_/g, ' ')}</span></p>}
      </CardContent>
      <CardFooter className="p-spacing-sm pt-0 mt-auto">
        <Button
          onClick={onEnter}
          variant={buttonVariant}
          className="w-full py-2.5 text-base"
          disabled={!hasRequiredModules}
          size="default"
        >
          {!hasRequiredModules ? <Lock size={18} className="mr-1.5" /> : <ArrowRight size={18} className="mr-1.5" />}
          {hasRequiredModules ? 'Enter Dungeon' : 'Requirements Not Met'}
        </Button>
      </CardFooter>
    </Card>
  );
}

