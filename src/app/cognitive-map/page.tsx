
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress'; 
import { Map as MapIconLucidePage, TrendingUp as TimelineIcon, Filter, Search, Eye, BarChart3, Zap, Link as LinkIconLucide, Brain, AlertTriangle, CheckCircle } from 'lucide-react'; // Renamed Map to avoid conflict, replaced Timeline with TrendingUp and aliased
import { cn } from '@/lib/utils';
import { useLearningSession } from '@/hooks/useLearningSession'; 
import type { Module, Node } from '@/types/neuro';
import { Badge } from '@/components/ui/badge'; 


// Mock data types and functions
interface MockNode {
  id: string;
  title: string;
  mastery: number; // 0-100
  type: 'module' | 'domain' | 'node';
  status: 'mastered' | 'in_progress' | 'locked';
  color: string; // Based on status or alignment
  moduleLineage?: string;
  learningGoal?: string;
  epicProgress?: { explain: number; probe: number; implement: number; connect: number };
  relatedSpecters?: string[];
  connectToLinks?: string[];
}

const mockNodes: MockNode[] = [
  { id: 'sovereign-core', title: 'Sovereign Core', mastery: 90, type: 'module', status: 'mastered', color: 'hsl(var(--law-primary-color))' },
  { id: 'thinking', title: 'Thinking Pillar', mastery: 75, type: 'module', status: 'in_progress', color: 'hsl(var(--neutral-primary-color))' },
  { id: 'communication', title: 'Communication Pillar', mastery: 30, type: 'module', status: 'in_progress', color: 'hsl(var(--neutral-primary-color))' },
  { id: 'emotional-alchemy', title: 'Emotional Alchemy', mastery: 0, type: 'module', status: 'locked', color: 'hsl(var(--chaos-primary-color))' },
  { id: 'sc-domain1', title: 'Sovereign Domain', mastery: 95, type: 'domain', status: 'mastered', color: 'hsl(var(--law-accent-color))', moduleLineage: 'Sovereign Core' },
  { id: 'sc-d1-n1', title: 'Recursive Sovereignty', mastery: 100, type: 'node', status: 'mastered', color: 'hsl(var(--status-understood))', moduleLineage: 'Sovereign Core > Sovereign Domain', learningGoal: 'Understand recursive self-governance.', epicProgress: { explain: 100, probe: 100, implement: 100, connect: 90}, relatedSpecters: ['Control'], connectToLinks: ['Meta-Integrity'] },
  { id: 'think-domain1', title: 'Logical Reasoning', mastery: 80, type: 'domain', status: 'in_progress', color: 'hsl(var(--neutral-accent-color))', moduleLineage: 'Thinking Pillar' },
  { id: 'think-d1-n1', title: 'Deductive Reasoning', mastery: 60, type: 'node', status: 'in_progress', color: 'hsl(var(--status-familiar))', moduleLineage: 'Thinking Pillar > Logical Reasoning', learningGoal: 'Master deductive logic.', epicProgress: { explain: 80, probe: 60, implement: 40, connect: 0}, relatedSpecters: ['Certainty'], connectToLinks: ['Inductive Reasoning'] },
];


export default function CognitiveMapPage() {
  const [activeView, setActiveView] = useState<'graph' | 'timeline' | 'map'>('graph');
  const [filter, setFilter] = useState<'all' | 'mastered' | 'in_progress' | 'locked'>('all');
  const [selectedNode, setSelectedNode] = useState<MockNode | null>(null);
  const { userModules } = useLearningSession(); 

  const renderKnowledgeGraph = () => (
    <div className="w-full h-[500px] bg-muted/20 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground italic text-center p-spacing-md">
      Interactive Knowledge Graph Area
      <br />
      (Nodes would be dynamically positioned and connected based on learningState.modules)
      <div className="mt-spacing-md flex flex-wrap gap-spacing-sm justify-center">
        {mockNodes.filter(n => filter === 'all' || n.status === filter).map(node => (
            <TooltipProvider key={node.id}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            className="p-spacing-xs text-xs shadow-sm hover:shadow-md"
                            style={{ borderColor: node.color, color: node.color }}
                            onClick={() => setSelectedNode(node)}
                        >
                           {node.type === 'module' && <MapIconLucidePage size={14} className="mr-1"/>}
                           {node.type === 'domain' && <Brain size={14} className="mr-1"/>}
                           {node.type === 'node' && <Zap size={14} className="mr-1"/>}
                            {node.title} ({node.mastery}%)
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="ui-tooltip-content">
                        <p>{node.title} - {node.status}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground p-spacing-md md:p-spacing-lg">
      <div className="container mx-auto space-y-spacing-lg">
        <Card className="shadow-cyan-md" data-alignment="neutral">
          <CardHeader className="p-spacing-md">
            <CardTitle className="module-title text-glow-cyan flex items-center">
              <MapIconLucidePage size={28} className="mr-spacing-sm text-neutral-primary-color" />
              Cognitive Map
            </CardTitle>
            <CardDescription className="secondary-text pt-spacing-xs">
              Visualize module interconnections, node mastery, and your progression across the NeuroOS knowledge graph.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="lg:grid lg:grid-cols-[3fr_1fr] lg:gap-spacing-lg space-y-spacing-lg lg:space-y-0">
          <div className="space-y-spacing-md">
            <Card className="p-spacing-md">
              <CardContent className="p-0">
                <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-spacing-sm mb-spacing-md">
                    <TabsList className="ui-tabs-list">
                      <TabsTrigger value="graph" className="ui-tabs-trigger text-sm px-3 py-1.5"><MapIconLucidePage size={16} className="mr-1" />Graph View</TabsTrigger>
                      <TabsTrigger value="timeline" className="ui-tabs-trigger text-sm px-3 py-1.5"><TimelineIcon size={16} className="mr-1" />Timeline View</TabsTrigger>
                      <TabsTrigger value="map" className="ui-tabs-trigger text-sm px-3 py-1.5"><Search size={16} className="mr-1" />Focus View</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-spacing-sm self-start sm:self-center">
                        <Filter size={16} className="text-muted-foreground"/>
                        <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                            <SelectTrigger className="w-[180px] h-9 text-xs ui-select-trigger">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent className="ui-select-content">
                                <SelectItem value="all" className="ui-select-item text-xs">Show All</SelectItem>
                                <SelectItem value="mastered" className="ui-select-item text-xs">Mastered</SelectItem>
                                <SelectItem value="in_progress" className="ui-select-item text-xs">In Progress</SelectItem>
                                <SelectItem value="locked" className="ui-select-item text-xs">Locked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                  <TabsContent value="graph">{renderKnowledgeGraph()}</TabsContent>
                  <TabsContent value="timeline"><div className="italic text-center p-10">Timeline View (Placeholder)</div></TabsContent>
                  <TabsContent value="map"><div className="italic text-center p-10">Focus Map View (Placeholder)</div></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-spacing-md">
            <Card className={cn(selectedNode ? 'border-primary shadow-cyan-md' : '', 'min-h-[300px] p-spacing-md')}>
              <CardHeader className="p-0 pb-spacing-md">
                <CardTitle className="domain-header text-glow-cyan flex items-center">
                    <Eye size={20} className="mr-spacing-xs text-neutral-accent-color"/>
                    Node Inspector
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-spacing-md p-0">
                {selectedNode ? (
                  <>
                    <h3 className="node-title" style={{color: selectedNode.color}}>{selectedNode.title}</h3>
                    <Badge variant="outline" className="text-xs" style={{borderColor: selectedNode.color, color: selectedNode.color}}>{selectedNode.type}</Badge>
                    <Badge variant="outline" className="text-xs ml-spacing-xs" style={{borderColor: selectedNode.color, color: selectedNode.color}}>{selectedNode.status}</Badge>
                    {selectedNode.moduleLineage && <p className="secondary-text text-xs">Path: {selectedNode.moduleLineage}</p>}
                    {selectedNode.learningGoal && <p className="secondary-text text-xs">Goal: {selectedNode.learningGoal}</p>}
                    
                    {selectedNode.epicProgress && (
                        <div>
                            <p className="secondary-text text-xs font-semibold mt-spacing-sm mb-spacing-xs">EPIC Progress:</p>
                            {Object.entries(selectedNode.epicProgress).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between text-xs mb-0.5">
                                    <span className="capitalize text-muted-foreground">{key}:</span>
                                    <Progress value={value} className="w-2/3 h-1.5 ui-progress" variant={value >= 80 ? 'law' : value >=50 ? 'default' : 'destructive'} />
                                    <span className="font-semibold w-8 text-right" style={{color: value >= 80 ? 'hsl(var(--status-understood))' : value >= 50 ? 'hsl(var(--status-familiar))' : 'hsl(var(--status-new))'}}>{value}%</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedNode.relatedSpecters && selectedNode.relatedSpecters.length > 0 && (
                        <div>
                            <p className="secondary-text text-xs font-semibold mt-spacing-sm mb-spacing-xs">Related Specters:</p>
                            <div className="flex flex-wrap gap-spacing-xs">
                                {selectedNode.relatedSpecters.map(specter => <Badge key={specter} variant="destructive" className="text-xxs">{specter}</Badge>)}
                            </div>
                        </div>
                    )}
                     {selectedNode.connectToLinks && selectedNode.connectToLinks.length > 0 && (
                        <div>
                            <p className="secondary-text text-xs font-semibold mt-spacing-sm mb-spacing-xs">Connects To:</p>
                            <div className="flex flex-wrap gap-spacing-xs">
                                {selectedNode.connectToLinks.map(link => <Button key={link} variant="link" size="sm" className="p-0 h-auto text-xs text-accent hover:text-accent/80">{link}</Button>)}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-spacing-sm mt-spacing-lg">
                        <Button variant="secondary" size="sm" className="flex-1 text-xs btn-neutral">Review Node</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs border-law-border-color text-law-primary-color hover:bg-law-surface-color">Visit Chronicle</Button>
                    </div>
                  </>
                ) : (
                  <p className="secondary-text text-center italic p-spacing-md">Select a node on the graph to see details.</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

