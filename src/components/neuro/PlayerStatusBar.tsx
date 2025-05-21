
'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Heart, Sparkles } from 'lucide-react';

interface PlayerStatusBarProps {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

export function PlayerStatusBar({ hp, maxHp, mp, maxMp }: PlayerStatusBarProps) {
  const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const mpPercentage = maxMp > 0 ? (mp / maxMp) * 100 : 0;

  return (
    <div className="player-status-bar space-y-1 p-2 bg-card/80 rounded-md border border-border/50"> {/* Reduced padding and spacing */}
      <div className="status-section flex items-center gap-1.5"> {/* Reduced gap */}
        <Heart size={14} className="text-destructive flex-shrink-0" /> {/* Smaller icon */}
        <span className="status-label text-xs font-medium text-muted-foreground w-7">HP:</span> {/* Smaller font, width */}
        <Progress value={hpPercentage} className="flex-1 h-2" variant={hpPercentage < 30 ? 'chaos' : 'default'} /> {/* Smaller height */}
        <span className="status-value text-xs font-semibold text-foreground w-14 text-right">{hp}/{maxHp}</span> {/* Smaller font, width */}
      </div>
      
      <div className="status-section flex items-center gap-1.5"> {/* Reduced gap */}
        <Sparkles size={14} className="text-primary flex-shrink-0" /> {/* Smaller icon */}
        <span className="status-label text-xs font-medium text-muted-foreground w-7">MP:</span> {/* Smaller font, width */}
        <Progress value={mpPercentage} className="flex-1 h-2" variant="law" /> {/* Smaller height */}
        <span className="status-value text-xs font-semibold text-foreground w-14 text-right">{mp}/{maxMp}</span> {/* Smaller font, width */}
      </div>
    </div>
  );
}
