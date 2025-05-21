
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Filter, RefreshCw, Brain, Layers, AlertTriangle, CheckSquare, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLearningSession } from '@/hooks/useLearningSession';
import type { Module, Node, NodeStatus } from '@/types/neuro';


interface NodeMemoryInfo {
  id: string;
  title: string;
  moduleTitle: string;
  domainTitle: string;
  memoryStrength: number; // 0-100
  lastReviewed: string;
  reviewDue: string;
  status: NodeStatus;
}

// Mock data - replace with actual data from useLearningSession
const mockNodeMemoryData: NodeMemoryInfo[] = [
  { id: 'sc-d1-n1', title: 'Recursive Sovereignty', moduleTitle: 'Sovereign Core', domainTitle: 'Sovereign Domain', memoryStrength: 85, lastReviewed: '3 days ago', reviewDue: 'In 12 days', status: 'understood' },
  { id: 'think-d1-n1', title: 'Deductive Reasoning', moduleTitle: 'Thinking Pillar', domainTitle: 'Logical Reasoning', memoryStrength: 45, lastReviewed: '10 days ago', reviewDue: 'Now!', status: 'needs_review' },
  { id: 'comm-d1-n1', title: 'Semantics', moduleTitle: 'Communication Pillar', domainTitle: 'Linguistic Architecture', memoryStrength: 92, lastReviewed: '1 day ago', reviewDue: 'In 25 days', status: 'understood' },
  { id: 'mech-d1-n1', title: 'Newton\'s Laws', moduleTitle: 'Mechanics Pillar', domainTitle: 'Classical Mechanics', memoryStrength: 60, lastReviewed: '5 days ago', reviewDue: 'In 2 days', status: 'familiar' },
  { id: 'sc-d2-n1', title: 'Non-Contradiction', moduleTitle: 'Sovereign Core', domainTitle: 'AXIOMOS Domain', memoryStrength: 30, lastReviewed: '15 days ago', reviewDue: 'Now!', status: 'needs_review'},
];

const mockStrengthOverTimeData = [
  { name: 'Jan', overallStrength: 60, sovereignCore: 70, thinking: 50 },
  { name: 'Feb', overallStrength: 65, sovereignCore: 75, thinking: 55 },
  { name: 'Mar', overallStrength: 72, sovereignCore: 80, thinking: 65 },
  { name: 'Apr', overallStrength: 70, sovereignCore: 78, thinking: 62 },
  { name: 'May', overallStrength: 78, sovereignCore: 85, thinking: 70 },
];


export default function MemoryStrengthPage() {
  const [filter, setFilter] = useState<'all' | 'weak' | 'stable' | 'forgotten'>('all');
  const { userModules } = useLearningSession(); // To get actual modules/nodes

  const getNodeColor = (strength: number): string => {
    if (strength < 40) return 'hsl(var(--status-needs-review))'; // Red
    if (strength < 75) return 'hsl(var(--status-familiar))';   // Yellow/Orange
    return 'hsl(var(--status-understood))'; // Green
  };
  
  const getProgressVariant = (strength: number): 'destructive' | 'default' | 'law' => {
    if (strength < 40) return 'destructive';
    if (strength < 75) return 'default';
    return 'law';
  }

  const filteredNodes = mockNodeMemoryData.filter(node => {
    if (filter === 'all') return true;
    if (filter === 'weak') return node.memoryStrength < 50 && node.status !== 'understood';
    if (filter === 'stable') return node.memoryStrength >= 75 && node.status === 'understood';
    if (filter === 'forgotten') return node.status === 'needs_review' && node.memoryStrength < 30;
    return true;
  });

  return (
    <main className="min-h-screen bg-background text-foreground p-spacing-md md:p-spacing-lg">
      <div className="container mx-auto space-y-spacing-lg">
        <Card className="shadow-cyan-md" data-alignment="neutral">
          <CardHeader className="p-spacing-md">
            <CardTitle className="module-title text-glow-cyan flex items-center">
              <Layers size={28} className="mr-spacing-sm text-neutral-primary-color" />
              Memory Strength
            </CardTitle>
            <CardDescription className="secondary-text pt-spacing-xs">
              Monitor node retention status, track memory decay patterns, and trigger active review sessions.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="lg:grid lg:grid-cols-[2fr_1fr] lg:gap-spacing-lg space-y-spacing-lg lg:space-y-0">
          {/* Main Content Area: Node Memory Grid */}
          <div className="space-y-spacing-md">
            <Card className="p-spacing-md">
                <CardHeader className="flex flex-row justify-between items-center p-0 pb-spacing-md">
                    <CardTitle className="domain-header text-glow-cyan">Node Memory Grid</CardTitle>
                    <div className="flex items-center gap-spacing-sm">
                        <Filter size={16} className="text-muted-foreground"/>
                        <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                            <SelectTrigger className="w-[180px] h-9 text-xs ui-select-trigger">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent className="ui-select-content">
                                <SelectItem value="all" className="ui-select-item text-xs">All Nodes</SelectItem>
                                <SelectItem value="weak" className="ui-select-item text-xs">Weak (&lt;50%)</SelectItem>
                                <SelectItem value="stable" className="ui-select-item text-xs">Stable (&gt;=75%)</SelectItem>
                                <SelectItem value="forgotten" className="ui-select-item text-xs">Needs Review</SelectItem>
                            </SelectContent>
                        </Select>
                         <Button variant="outline" size="sm" className="h-9 text-xs"><RefreshCw size={14} className="mr-1"/> Refresh</Button>
                    </div>
                </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] pr-spacing-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-md">
                    {filteredNodes.length > 0 ? filteredNodes.map(node => (
                      <Card key={node.id} className="p-spacing-sm shadow-sm hover:shadow-md" style={{borderColor: getNodeColor(node.memoryStrength)}}>
                        <CardTitle className="text-sm font-semibold truncate" style={{color: getNodeColor(node.memoryStrength)}}>{node.title}</CardTitle>
                        <p className="text-xxs text-muted-foreground">{node.moduleTitle} &gt; {node.domainTitle}</p>
                        <div className="my-spacing-xs">
                          <div className="flex justify-between items-center text-xxs mb-0.5">
                            <span className="text-muted-foreground">Memory Strength:</span>
                            <span className="font-semibold" style={{color: getNodeColor(node.memoryStrength)}}>{node.memoryStrength}%</span>
                          </div>
                           <Progress value={node.memoryStrength} className="h-1.5 ui-progress" variant={getProgressVariant(node.memoryStrength)} />
                        </div>
                        <p className="text-xxs text-muted-foreground">Last Reviewed: {node.lastReviewed}</p>
                        <p className="text-xxs text-muted-foreground">Review Due: <span className={node.reviewDue === 'Now!' ? 'text-destructive font-semibold' : ''}>{node.reviewDue}</span></p>
                        <Button variant="secondary" size="sm" className="mt-spacing-sm w-full text-xs btn-neutral">
                           {node.status === 'needs_review' || node.reviewDue === 'Now!' ? <AlertTriangle size={14} className="mr-1 text-destructive"/> : <CheckSquare size={14} className="mr-1"/>} Review Node
                        </Button>
                      </Card>
                    )) : (
                        <p className="col-span-full text-center italic text-muted-foreground p-spacing-lg">No nodes match the current filter.</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Charts & Global Stats */}
          <aside className="space-y-spacing-md">
            <Card className="p-spacing-md" data-alignment="law">
                <CardHeader className="p-0 pb-spacing-sm">
                    <CardTitle className="text-base font-semibold text-law-primary-color flex items-center">
                        <Activity size={18} className="mr-spacing-xs"/>Global Memory Health
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex items-center gap-spacing-sm">
                        <span className="text-3xl font-bold text-law-accent-color">78%</span>
                        {/* TODO: Figure out what to pass for module in progress bar for global stats */}
                        <Progress value={78} className="flex-1 h-2.5 ui-progress" variant="law" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-spacing-xs">Overall system memory coherence score.</p>
                </CardContent>
            </Card>
            <Card data-alignment="neutral" className="p-spacing-md">
              <CardHeader className="p-0 pb-spacing-md">
                <CardTitle className="domain-header text-glow-cyan">Memory Strength Over Time</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockStrengthOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                    <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} stroke="hsl(var(--border))" />
                    <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} stroke="hsl(var(--border))" domain={[0,100]}/>
                    <RechartsTooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '12px',
                            borderRadius: 'calc(var(--radius) - 0.5rem)'
                        }}
                        cursor={{fill: 'hsl(var(--accent)/0.1)'}}
                    />
                    <Legend wrapperStyle={{fontSize: '10px'}}/>
                    <Line type="monotone" dataKey="overallStrength" name="Overall" stroke="hsl(var(--accent))" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
                    <Line type="monotone" dataKey="sovereignCore" name="Sovereign Core" stroke="hsl(var(--law-primary-color))" strokeWidth={1.5} dot={{r:2}} activeDot={{r:4}} />
                    <Line type="monotone" dataKey="thinking" name="Thinking" stroke="hsl(var(--neutral-primary-color))" strokeWidth={1.5} dot={{r:2}} activeDot={{r:4}} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
             <Card data-alignment="chaos" className="p-spacing-md">
              <CardHeader className="p-0 pb-spacing-md">
                <CardTitle className="domain-header text-glow-crimson">Chronicle Impact Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="p-spacing-md text-center italic text-muted-foreground h-[150px] flex items-center justify-center bg-muted/20 border border-dashed border-border rounded-md">
                Chronicle Heatmap Visualization (Placeholder) <br/> (Shows which encounter types most impact memory decay/strength)
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
