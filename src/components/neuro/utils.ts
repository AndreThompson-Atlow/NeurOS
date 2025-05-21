import type { ModuleType } from '@/types/neuro';
import { Shield, Zap, FlaskConical, Star, Award, BrainCog, Puzzle, Wand } from 'lucide-react';
import React from 'react';

export interface AlignmentStyling {
    icon: React.ReactElement;
    dataAlignment: "law" | "chaos" | "neutral";
    borderColorClass: string;
    titleColor: string;
    fontClass: string;
    buttonClass: string;
}


export const getAlignmentStyling = (alignment: string | undefined): AlignmentStyling => {
    switch(alignment?.toLowerCase()){
        case 'law': return { 
            icon: React.createElement(Shield, { size: 20, className: "text-law-primary-color"}), 
            dataAlignment: "law" as const, 
            borderColorClass: "border-law-border-color", 
            titleColor: "text-law-primary-color", 
            fontClass: "font-law", 
            buttonClass: "btn-law" 
        };
        case 'chaos': return { 
            icon: React.createElement(Zap, {size: 20, className: "text-chaos-primary-color"}), 
            dataAlignment: "chaos" as const, 
            borderColorClass: "border-chaos-border-color",
            titleColor: "text-chaos-primary-color",
            fontClass: "font-chaos",
            buttonClass: "btn-chaos"
        };
        case 'neutral': 
        case 'constructive':
        case 'holistic':
        case 'balanced':
        case 'mixed': 
        default: return { 
            icon: React.createElement(FlaskConical, {size: 20, className: "text-neutral-primary-color"}), 
            dataAlignment: "neutral" as const, 
            borderColorClass: "border-neutral-border-color",
            titleColor: "text-neutral-primary-color",
            fontClass: "font-neutral",
            buttonClass: "btn-neutral"
        };
    }
};

export const getModuleTypeIcon = (type: ModuleType | undefined) => {
    switch(type) {
        case 'core': return React.createElement(Star, { size: 20, className: "text-law-accent-color", title:"Core Module"}); 
        case 'pillar': return React.createElement(Award, { size: 20, className: "text-neutral-accent-color", title:"Pillar Module"}); 
        case 'auxiliary': return React.createElement(BrainCog, { size: 20, className: "text-primary", title:"Auxiliary Module"}); 
        case 'challenge': return React.createElement(Puzzle, { size: 20, className: "text-destructive", title:"Challenge Module"}); 
        default: return React.createElement(Wand, { size: 20, className: "text-muted-foreground", title:"Module"});
    }
};
