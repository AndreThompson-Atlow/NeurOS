
'use client';

import React from 'react';
import type { Floor, Coordinates, MapCellType } from '@/types/chronicle';
import { HelpCircle, UserSquare2, Swords, Diamond, Archive, Lock, Skull, MoveUp, MoveDown, Eye } from 'lucide-react'; 
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface DungeonMinimapProps {
  floorData: Floor;
  playerPosition: Coordinates;
  discoveredMap: boolean[][]; 
}

const VISION_RANGE = 2; 

const getTileTypeString = (tileType: MapCellType): string => {
  switch (tileType) {
    case 'floor': return 'Walkable Floor';
    case 'wall': return 'Wall';
    case 'encounter': return 'Encounter';
    case 'artifact_puzzle': return 'Artifact/Puzzle';
    case 'npc': return 'NPC';
    case 'item_cache': return 'Item Cache';
    case 'vault': return 'Vault';
    case 'crypt': return 'Crypt';
    case 'stairs_up': return 'Stairs Up';
    case 'stairs_down': return 'Stairs Down';
    case 'floor_boss': return 'Floor Boss';
    case 'entrance': return 'Entrance';
    case 'exit': return 'Exit';
    default: return 'Unknown Tile';
  }
};

export function DungeonMinimap({ floorData, playerPosition, discoveredMap }: DungeonMinimapProps) {
  if (!floorData || !floorData.map) {
    return <div className="text-muted-foreground text-center p-spacing-md">Minimap data unavailable.</div>; {/* Increased padding */}
  }

  const renderTileIcon = (tileTypeNumeric: MapCellType, x: number, y: number, isInVision: boolean, isExplored: boolean) => {
    const iconSizeBase = Math.max(10, Math.min(18, (250 / Math.max(floorData.dimensions.width, floorData.dimensions.height)) - 1));
    const iconProps = { size: iconSizeBase, className: "drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" };
    
    if (playerPosition.x === x && playerPosition.y === y) {
      return <UserSquare2 {...iconProps} className="text-secondary animate-pulse" />;
    }
    
    if (!isExplored && !isInVision) { 
      return <HelpCircle {...iconProps} className="text-muted-foreground/30" />;
    }
    
    const tileIcon = () => {
        switch (tileTypeNumeric) {
            case 'floor': return <div className="w-full h-full bg-transparent"></div>; 
            case 'wall': return <div className="w-full h-full bg-muted/60 border border-border/30 rounded-sm"></div>; 
            case 'encounter': return <Swords {...iconProps} className="text-destructive text-glow-crimson" />;
            case 'artifact_puzzle': return <Diamond {...iconProps} className="text-primary text-glow-gold" />;
            case 'npc': return <UserSquare2 {...iconProps} className="text-green-400" />; 
            case 'item_cache': return <Archive {...iconProps} className="text-yellow-400" />;
            case 'vault': return <Lock {...iconProps} className="text-yellow-500" />;
            case 'crypt': return <Skull {...iconProps} className="text-orange-400" />;
            case 'stairs_up': return <MoveUp {...iconProps} className="text-blue-400" />; 
            case 'stairs_down': return <MoveDown {...iconProps} className="text-blue-400" />; 
            case 'floor_boss': return <Skull {...iconProps} className="text-red-500 text-glow-crimson animate-pulse" />; 
            case 'entrance': return <MoveDown {...iconProps} className="text-green-500" />; 
            case 'exit': return <MoveUp {...iconProps} className="text-blue-500" />;
            default: return <HelpCircle {...iconProps} className="text-muted-foreground" />;
        }
    };

    if (isInVision && !isExplored) {
        return tileIcon();
    }
    
    return tileIcon();
  };
  
  const getTileClasses = (tileTypeNumeric: MapCellType, x: number, y: number, isInVision: boolean, isExplored: boolean) => {
    let baseClasses = "flex items-center justify-center aspect-square transition-colors duration-150 cursor-default";
    let bgClass = "bg-background/10 hover:bg-background/20"; 
    let borderClass = "border border-border/10";

    if (playerPosition.x === x && playerPosition.y === y) {
        bgClass = "bg-secondary/30"; 
        borderClass = "ring-2 ring-offset-1 ring-offset-background ring-secondary";
    } else if (isInVision) {
        if (isExplored) { 
             bgClass = tileTypeNumeric === 'wall' ? 'bg-muted/40' : 'bg-background/50 hover:bg-secondary/20';
        } else { 
             bgClass = tileTypeNumeric === 'wall' ? 'bg-muted/30' : 'bg-background/30 hover:bg-secondary/10'; 
             borderClass = "border border-secondary/30"; 
        }
    } else if (isExplored) { 
        bgClass = tileTypeNumeric === 'wall' ? 'bg-muted/40' : 'bg-background/50';
    }

    return `${baseClasses} ${bgClass} ${borderClass}`;
  }


  return (
    <div className="dungeon-minimap bg-muted/10 border border-border/30 rounded-md shadow-inner p-spacing-sm sm:p-spacing-md overflow-hidden flex-shrink-0"> {/* Increased padding */}
      <div
        className="grid gap-px mx-auto" 
        style={{
          gridTemplateColumns: `repeat(${floorData.dimensions.width}, minmax(0, 1fr))`,
          width: '100%', 
          maxWidth: `${floorData.dimensions.width * 24}px`, 
          maxHeight: 'calc(100% - 1rem)', 
          aspectRatio: `${floorData.dimensions.width / floorData.dimensions.height}`, 
        }}
      >
        {floorData.map.map((row, y) =>
          row.map((tile, x) => {
            const tileTypeNumeric = tile.type;
            const isExplored = discoveredMap?.[y]?.[x] || tileTypeNumeric === 'wall'; 
            const distance = Math.max(Math.abs(playerPosition.x - x), Math.abs(playerPosition.y - y));
            const isInVision = distance <= VISION_RANGE;
            
            let tooltipText = `(${String.fromCharCode(65 + x)},${y + 1})`;
            if (isInVision) {
                tooltipText += ` - ${getTileTypeString(tileTypeNumeric)} (Visible)`;
            } else if (isExplored) {
                tooltipText += ` - ${getTileTypeString(tileTypeNumeric)} (Explored)`;
            } else {
                tooltipText += ` - (Unexplored)`;
            }

            return (
            <TooltipProvider key={`${x}-${y}`} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={getTileClasses(tileTypeNumeric, x, y, isInVision, isExplored)}>
                    {renderTileIcon(tileTypeNumeric, x, y, isInVision, isExplored)}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="ui-tooltip-content text-xs">
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )})
        )}
      </div>
    </div>
  );
}
