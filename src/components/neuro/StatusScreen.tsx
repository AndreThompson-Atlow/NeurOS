
'use client';

import type { Module, PlayerCharacterBase as NeuroPlayerCharacterBase } from '@/types/neuro'; // Renamed to avoid conflict
import type { ChronicleRunState } from '@/types/chronicle'; 
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User, Shield, Brain, Star, TrendingUp, Swords, BookOpen, Target, Activity, ZapIcon, Sigma, Layers, Users } from 'lucide-react'; // Added Users
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';

interface StatusScreenProps {
  modules: Record<string, Module>;
  playerCharacter: NeuroPlayerCharacterBase; 
  chronicleRuns: Partial<ChronicleRunState>[]; 
  onExit: () => void;
}

const calculateOverallLevel = (modules: Record<string, Module>, chronicleRuns: Partial<ChronicleRunState>[]): { level: number, rank: string } => {
    let moduleSum = 0;
    let completedModules = 0;
    
    Object.values(modules).forEach(m => {
        if (m.status === 'installed') {
            completedModules++;
            // Ensure type exists before accessing it
            const moduleType = m.type || 'auxiliary'; // Default to auxiliary if type is undefined
            if (moduleType === 'core') moduleSum += 50;
            else if (moduleType === 'pillar') moduleSum += 30;
            else moduleSum += 10; 
        }
    });

    const specterVictories = chronicleRuns.filter(run => run.activeBattle?.status === 'victory').length * 5; 
    const dungeonCompletions = chronicleRuns.filter(run => run.status === 'completed' && run.activeBattle?.status === 'victory').length;


    const level = Math.floor(1 + (moduleSum * 0.05) + (completedModules * 1) + (specterVictories * 0.1) + (dungeonCompletions*0.5));

    let rank = "Novice";
    if (level >= 51) rank = "Sovereign Architect";
    else if (level >= 41) rank = "Master Integrator";
    else if (level >= 31) rank = "Adept Synthesist";
    else if (level >= 21) rank = "Practitioner";
    else if (level >= 11) rank = "Apprentice";
    
    return { level, rank };
};

const getAlignmentAttributes = (modules: Record<string, Module>): { name: string, value: number, icon: React.ReactNode, color: string }[] => {
    let clarity = 0, adaptability = 0, insight = 0, integration = 0, resilience = 0;
    const installedModules = Object.values(modules).filter(m => m.status === 'installed');

    installedModules.forEach(m => {
        integration++; 
        const alignmentBias = m.alignmentBias?.toLowerCase();
        if (alignmentBias?.includes('law')) clarity += 10;
        else if (alignmentBias?.includes('chaos')) insight += 10;
        else if (alignmentBias?.includes('neutral') || alignmentBias?.includes('balanced')) adaptability += 10;
        
    });
    
    resilience = installedModules.length * 2; 
    
    clarity = Math.min(100, clarity);
    adaptability = Math.min(100, adaptability);
    insight = Math.min(100, insight);
    integration = Math.min(100, integration * 5);
    resilience = Math.min(100, resilience);

    return [
        { name: "Clarity (Law)", value: clarity, icon: <Shield size={18} className="text-primary"/>, color: "hsl(var(--primary))"},
        { name: "Insight (Chaos)", value: insight, icon: <ZapIcon size={18} className="text-destructive"/>, color: "hsl(var(--destructive))"},
        { name: "Adaptability (Neutral)", value: adaptability, icon: <Activity size={18} className="text-secondary"/>, color: "hsl(var(--secondary))"},
        { name: "Integration", value: integration, icon: <Sigma size={18} className="text-chart-2"/>, color: "hsl(var(--chart-2))"}, 
        { name: "Resilience", value: resilience, icon: <Layers size={18} className="text-chart-5"/>, color: "hsl(var(--chart-5))"}, 
    ];
};


export function StatusScreen({ modules, playerCharacter, chronicleRuns, onExit }: StatusScreenProps) {
  const { level, rank } = calculateOverallLevel(modules, chronicleRuns);
  const attributesData = getAlignmentAttributes(modules);
  
  const chartConfig = attributesData.reduce((acc, attr) => {
    acc[attr.name] = { label: attr.name, color: attr.color };
    return acc;
  }, {} as Record<string, {label: string, color: string}>);


  const installedModulesList = Object.values(modules).filter(m => m.status === 'installed');

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="shadow-cyan-md" data-alignment="neutral">
        <CardHeader className="bg-muted/30 p-4 rounded-t-lg border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-display text-glow-cyan flex items-center gap-2">
              <User size={24} className="text-secondary" /> {playerCharacter.name}'s Cognitive Status
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExit}>
              <ArrowLeft size={16} className="mr-1" /> Dashboard
            </Button>
          </div>
          <CardDescription className="text-muted-foreground/80">
            Level: <span className="font-bold text-primary text-lg">{level}</span> - Rank: <span className="font-bold text-primary text-lg">{rank}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="md:col-span-2 border-secondary bg-secondary/5" data-alignment="neutral">
            <CardHeader className="pb-3"><CardTitle className="text-xl font-display text-glow-cyan">Core Attributes</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ChartContainer config={chartConfig} className="aspect-square h-[250px] w-full mx-auto">
                <RadarChart data={attributesData}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <PolarGrid className="fill-border/30 stroke-border/50" />
                  <PolarAngleAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{fontSize: 10}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs fill-muted-foreground stroke-border/50" tick={{fontSize: 8}}/>
                  <Radar
                    name={playerCharacter.name}
                    dataKey="value"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ChartContainer>
              {attributesData.map(attr => (
                <div key={attr.name} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                  <span className="flex items-center gap-2">{attr.icon}{attr.name}:</span> 
                  <span className="font-semibold" style={{color: attr.color}}>{attr.value} / 100</span>
                  <Progress value={attr.value} className="h-1.5 w-1/3" 
                   style={{ '--progress-fill': attr.color } as React.CSSProperties} 
                   variant={
                     attr.name.includes("(Law)") ? "law" : 
                     attr.name.includes("(Chaos)") ? "chaos" : 
                     attr.name.includes("(Neutral)") ? "neutralProgress" : "default"
                  }/>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-primary bg-primary/5" data-alignment="law">
              <CardHeader className="pb-2"><CardTitle className="text-lg text-glow-gold">Installed Modules ({installedModulesList.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  {installedModulesList.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {installedModulesList.map(m => (
                        <li key={m.id} className="text-foreground/90 flex items-center gap-2">
                          <BookOpen size={14} className={`mr-1 ${
                              m.alignmentBias?.toLowerCase().includes('law') ? 'text-primary' :
                              m.alignmentBias?.toLowerCase().includes('chaos') ? 'text-destructive' :
                              'text-secondary'
                          }`} />
                          {m.title} <span className="text-xs text-muted-foreground">({m.type || 'auxiliary'})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">No modules fully installed yet.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-destructive bg-destructive/5" data-alignment="chaos">
               <CardHeader className="pb-2"><CardTitle className="text-lg text-glow-crimson">Chronicle Highlights</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><Swords className="inline mr-2"/>Dungeons Completed: {chronicleRuns.filter(r => r.status === 'completed' && r.activeBattle?.status === 'victory').length}</p>
                <p><Users className="inline mr-2"/>Companions Recruited: {playerCharacter.party?.length || 0}</p> 
                <p><BookOpen className="inline mr-2"/>Spellbooks Acquired: {playerCharacter.spellbooks.length}</p>
                <p className="text-xs text-muted-foreground italic">(More detailed Chronicle history coming soon)</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
