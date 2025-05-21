
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, Zap, BookOpen, Shield, Brain, Lightbulb, MapPin, Award, TrendingUp as TimelineIcon } from 'lucide-react'; // Replaced Timeline with TrendingUp and aliased
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Mock data
const mockUserSummary = {
  name: 'Sovereign Learner',
  avatarUrl: 'https://picsum.photos/seed/sovereign_avatar/100/100',
  level: 27,
  rank: 'Adept Synthesist',
  xp: 1250,
  xpToNextLevel: 2000,
  achievements: [
    { id: 'ach1', title: 'Sovereign Core Integrated', icon: <Shield size={18} className="text-law-primary-color" /> },
    { id: 'ach2', title: 'Thinking Pillar Mastered', icon: <Brain size={18} className="text-neutral-primary-color" /> },
    { id: 'ach3', title: 'Specter of Certainty Defeated', icon: <Zap size={18} className="text-chaos-primary-color" /> },
  ],
};

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'module_started' | 'node_mastered' | 'specter_encounter' | 'chronicle_milestone' | 'review_session';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const mockTimelineEvents: TimelineEvent[] = [
  { id: 'evt1', timestamp: '2 days ago', type: 'module_started', title: 'Started "Thinking" Pillar', description: 'Began foundational cognitive clarity training.', icon: <BookOpen size={16}/>, color: 'hsl(var(--neutral-accent-color))' },
  { id: 'evt2', timestamp: 'Yesterday', type: 'node_mastered', title: 'Mastered: Deductive Reasoning', description: 'Achieved 92% on EPIC challenge.', icon: <CheckCircle size={16}/>, color: 'hsl(var(--status-understood))' },
  { id: 'evt3', timestamp: '10 hours ago', type: 'specter_encounter', title: 'Encountered: Specter of Rigidity', description: 'Successfully navigated initial challenge.', icon: <AlertTriangle size={16}/>, color: 'hsl(var(--chaos-secondary-color))' },
  { id: 'evt4', timestamp: '2 hours ago', type: 'chronicle_milestone', title: 'Chronicle: Vault of Alignment - Floor 3 Cleared', description: 'Overcame Law Wing initial trials.', icon: <MapPin size={16}/>, color: 'hsl(var(--law-primary-color))' },
];

const mockRecommendations = {
  nextModule: { id: 'communication', title: 'Communication Pillar', reason: 'Builds on logical reasoning for effective expression.'},
  decayWarnings: [
    { nodeId: 'sc-d1-n1', nodeTitle: 'Recursive Sovereignty', currentStrength: 65, reviewIn: '1 day' },
    { nodeId: 'think-d1-n2', nodeTitle: 'Inductive Reasoning', currentStrength: 72, reviewIn: '3 days' },
  ]
};

export default function LearningJourneyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-spacing-md md:p-spacing-lg">
      <div className="container mx-auto space-y-spacing-lg">
        <Card className="shadow-cyan-md" data-alignment="neutral">
          <CardHeader className="p-spacing-md">
            <CardTitle className="module-title text-glow-cyan flex items-center">
              <TimelineIcon size={28} className="mr-spacing-sm text-neutral-primary-color" />
              Learning Journey
            </CardTitle>
            <CardDescription className="secondary-text pt-spacing-xs">
              Track your milestone history, projected growth, and system recommendations within NeuroOS.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Top Section: User Summary */}
        <Card className="p-spacing-md" data-alignment="neutral">
          <CardHeader className="flex flex-row items-center gap-spacing-md pb-spacing-sm border-b border-divider-neuro">
            <Avatar className="h-20 w-20 border-2 border-neutral-primary-color">
              <AvatarImage src={mockUserSummary.avatarUrl} alt={mockUserSummary.name} data-ai-hint="learner avatar" />
              <AvatarFallback>{mockUserSummary.name.substring(0,1)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="node-title text-glow-cyan">{mockUserSummary.name}</CardTitle>
              <p className="secondary-text text-base">Level {mockUserSummary.level} - <span className="font-semibold text-neutral-accent-color">{mockUserSummary.rank}</span></p>
            </div>
          </CardHeader>
          <CardContent className="pt-spacing-md space-y-spacing-sm">
            <div>
              <div className="flex justify-between items-center text-sm mb-spacing-xs">
                <span className="text-muted-foreground">XP Progress:</span>
                <span className="font-semibold text-foreground">{mockUserSummary.xp} / {mockUserSummary.xpToNextLevel} XP</span>
              </div>
              <Progress value={(mockUserSummary.xp / mockUserSummary.xpToNextLevel) * 100} className="h-2.5 ui-progress" variant="neutralProgress" />
            </div>
            <div>
              <h4 className="font-semibold text-text-secondary-neuro mb-spacing-xs text-sm">Achievements:</h4>
              <div className="flex flex-wrap gap-spacing-sm">
                {mockUserSummary.achievements.map(ach => (
                  <TooltipProvider key={ach.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs p-spacing-xs border-neutral-border-color text-neutral-primary-color bg-neutral-surface-color/30">
                          {ach.icon} <span className="ml-1">{ach.title}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="ui-tooltip-content"><p>{ach.title}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle: Horizontal Scroll Timeline */}
        <Card data-alignment="neutral" className="p-spacing-md">
          <CardHeader className="p-0 pb-spacing-md">
            <CardTitle className="domain-header text-glow-cyan">Cognitive Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border bg-muted/20">
              <div className="flex w-max space-x-spacing-xl p-spacing-md min-h-[150px] items-center">
                {mockTimelineEvents.map((event) => (
                  <Card key={event.id} className="w-[250px] h-[120px] flex-shrink-0 shadow-sm hover:shadow-md" style={{borderColor: event.color}}>
                    <CardHeader className="p-spacing-xs pb-0">
                      <CardTitle className="text-xs font-semibold flex items-center gap-1" style={{color: event.color}}>
                        {event.icon} {event.title}
                      </CardTitle>
                      <p className="text-xxs text-muted-foreground">{event.timestamp}</p>
                    </CardHeader>
                    <CardContent className="p-spacing-xs text-xxs text-text-secondary-neuro">
                      <p className="line-clamp-2">{event.description}</p>
                    </CardContent>
                  </Card>
                ))}
                 <div className="text-muted-foreground italic p-spacing-md">... more events</div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Bottom: System Recommendations */}
        <Card data-alignment="neutral" className="p-spacing-md">
          <CardHeader className="p-0 pb-spacing-md">
            <CardTitle className="domain-header text-glow-cyan flex items-center">
                <Lightbulb size={20} className="mr-spacing-xs text-neutral-accent-color"/>System Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-spacing-md p-0">
            <Card className="p-spacing-sm border-neutral-border-color bg-neutral-surface-color/20">
              <CardTitle className="text-base font-semibold text-neutral-primary-color mb-spacing-xs">Next Module to Begin</CardTitle>
              <p className="text-sm text-text-secondary-neuro">
                <strong className="text-foreground">{mockRecommendations.nextModule.title}</strong>: {mockRecommendations.nextModule.reason}
              </p>
              <Button variant="neutral" size="sm" className="mt-spacing-sm text-xs">Explore Module</Button>
            </Card>
            <Card className="p-spacing-sm border-chaos-border-color bg-chaos-surface-color/10">
              <CardTitle className="text-base font-semibold text-chaos-primary-color mb-spacing-xs">Decay Warnings</CardTitle>
              <ul className="space-y-spacing-xs">
                {mockRecommendations.decayWarnings.map(warning => (
                  <li key={warning.nodeId} className="text-sm text-text-secondary-neuro">
                    <span className="text-destructive font-medium">{warning.nodeTitle}</span> (Strength: {warning.currentStrength}%) - Review due in {warning.reviewIn}.
                     <Button variant="link" size="sm" className="p-0 h-auto text-xs text-accent hover:text-accent/80 ml-spacing-xs">Review Now</Button>
                  </li>
                ))}
              </ul>
            </Card>
          </CardContent>
           <CardFooter className="p-spacing-md pt-spacing-md border-t border-divider-neuro mt-spacing-md">
                <p className="text-xs text-muted-foreground italic">Recommendations are dynamically updated based on your learning progress and memory decay patterns.</p>
           </CardFooter>
        </Card>
      </div>
    </main>
  );
}
