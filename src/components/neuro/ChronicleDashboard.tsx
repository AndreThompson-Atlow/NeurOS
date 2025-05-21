
'use client';

import React from 'react';
import type { Dungeon } from '@/types/chronicle';
import { DungeonCard } from './DungeonCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Swords } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { UserLearningState } from '@/types/neuro';

const LOCAL_STORAGE_KEY = 'neuroosV2LearningState';

interface ChronicleDashboardProps {
  availableDungeons: Dungeon[];
  onStartRun: (dungeonId: string) => void;
  onExit: () => void;
  hasInstalledModules: boolean;
}

export function ChronicleDashboard({
  availableDungeons,
  onStartRun,
  onExit,
  hasInstalledModules,
}: ChronicleDashboardProps) {

  const challengeDungeons = availableDungeons.filter(d => d.type === 'challenge');
  const infiniteDungeon = availableDungeons.find(d => d.type === 'infinite');

  const checkRequiredModulesInstalled = (dungeon: Dungeon): boolean => {
    if (dungeon.requiredModules.length === 0) return true;
    if (typeof window === 'undefined') return false;

    const stateString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stateString) return false;

    try {
      const learningState: UserLearningState = JSON.parse(stateString);
      if (!learningState.modules || typeof learningState.modules !== 'object') {
          console.error("Learning state modules are not correctly defined.");
          return false;
      }
      return dungeon.requiredModules.every(modId =>
        learningState.modules[modId]?.status === 'installed'
      );
    } catch (e) {
      console.error("Error parsing learning state from localStorage:", e);
      return false;
    }
  }; 

  return (
    <div className="container mx-auto p-spacing-md md:p-spacing-lg max-w-5xl space-y-spacing-lg"> {/* Increased padding and max-width */}
      <Card className="shadow-cyan-md" data-alignment="neutral">
        <CardHeader className="bg-muted/30 p-spacing-lg rounded-t-lg border-b"> {/* Increased padding */}
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-display flex items-center gap-spacing-sm text-glow-cyan">
              <Swords size={32} className="text-secondary" /> Neuroverse Chronicles
            </CardTitle>
            <Button variant="outline" size="default" onClick={onExit} className="px-4 py-2 text-sm">
              <ArrowLeft size={18} className="mr-1.5" /> Dashboard
            </Button>
          </div>
          <CardDescription className="text-muted-foreground/80 text-base mt-spacing-xs">Select a dungeon to begin your cognitive adventure.</CardDescription>
        </CardHeader>
        <CardContent className="p-spacing-lg space-y-spacing-xl"> {/* Increased padding and vertical spacing */}
          <div>
            <h3 className="text-2xl font-display text-glow-cyan mb-spacing-md border-b border-border/30 pb-spacing-sm">Challenge Dungeons</h3>
            {challengeDungeons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg"> {/* Increased gap */}
                {challengeDungeons.map((dungeon) => (
                  <DungeonCard
                    key={dungeon.id}
                    dungeon={dungeon}
                    onEnter={() => onStartRun(dungeon.id)}
                    hasRequiredModules={checkRequiredModulesInstalled(dungeon)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center italic py-spacing-lg text-base">No challenge dungeons currently available. Install more modules!</p>
            )}
          </div>

          {infiniteDungeon && (
            <div className="mt-spacing-xl"> {/* Increased top margin */}
              <h3 className="text-2xl font-display text-glow-cyan mb-spacing-md border-b border-border/30 pb-spacing-sm">Infinite Dungeon</h3>
              <DungeonCard
                dungeon={infiniteDungeon}
                onEnter={() => onStartRun(infiniteDungeon.id)}
                hasRequiredModules={hasInstalledModules}
              />
            </div>
          )}

          {availableDungeons.length === 0 && !infiniteDungeon && challengeDungeons.length === 0 && (
            <p className="text-muted-foreground text-center py-spacing-xl italic text-base">No dungeons manifest in the Neuroverse yet. Install modules to unlock challenges.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

