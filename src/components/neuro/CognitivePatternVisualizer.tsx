'use client';

import React from 'react';
import type { CognitivePattern, RecursiveStructure } from '@/types/neuro'; 
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Brain, Zap, PackageSearch } from 'lucide-react'; // Example icons

// Placeholder for more complex historical pattern data
interface HistoricalPatternDataPoint {
    timestamp: Date;
    frequency?: number;
    severity?: number; // If applicable
}
interface HistoricalPattern extends CognitivePattern {
    history: HistoricalPatternDataPoint[];
}


interface CognitivePatternVisualizerProps {
  detectedPatterns: CognitivePattern[];
  recursiveStructures?: RecursiveStructure[]; 
  historicalPatterns?: HistoricalPattern[]; // Made optional for simplicity
}

// Mock chart components - in a real app, use a library like Recharts or Chart.js
const PatternFrequencyChart: React.FC<{ data: { name: string; count: number }[] }> = ({ data }) => (
  <div className="p-2 border border-border/20 rounded bg-muted/30 text-center text-xxs text-muted-foreground/80 h-20 flex items-center justify-center">
    {data.length > 0 ? `Mock Freq. Chart: ${data.map(d=>d.name).join(', ')}` : "No frequency data to display."}
  </div>
);
const PatternNetworkGraph: React.FC<{ data: { nodes: {id: string; label:string}[]; links: any[] } }> = ({ data }) => (
  <div className="p-2 border border-border/20 rounded bg-muted/30 text-center text-xxs text-muted-foreground/80 h-20 flex items-center justify-center">
    {data.nodes.length > 0 ? `Mock Network Graph: ${data.nodes.length} patterns` : "No network data."}
  </div>
);
const PatternEvolutionTimeline: React.FC<{ data: { date: string; pattern: string; count: number }[] }> = ({ data }) => (
  <div className="p-2 border border-border/20 rounded bg-muted/30 text-center text-xxs text-muted-foreground/80 h-20 flex items-center justify-center">
    {data.length > 0 ? `Mock Timeline: ${data.length} historical points` : "No historical data for timeline."}
  </div>
);


export const CognitivePatternVisualizer: React.FC<CognitivePatternVisualizerProps> = ({ detectedPatterns, recursiveStructures, historicalPatterns }) => {
  
  const preparePatternVisualizationData = (currentPatterns: CognitivePattern[], histPatterns?: HistoricalPattern[]) => {
    const frequencyData = currentPatterns.map(p => ({ name: p.name, count: p.frequency || 1 }));
    const networkData = { nodes: currentPatterns.map(p => ({id: p.patternId, label: p.name})), links: [] }; // Mock links for now
    
    const timelineData = histPatterns?.flatMap(hp => 
        hp.history.map(hPoint => ({
            date: hPoint.timestamp.toISOString().split('T')[0],
            pattern: hp.name,
            count: hPoint.frequency || 1
        }))
    ) || [];
    
    return { frequencyData, networkData, timelineData };
  };

  const visualizationData = preparePatternVisualizationData(detectedPatterns, historicalPatterns);

  return (
    <Card className="pattern-visualizer my-3 bg-card/90 border-secondary/30 shadow-cyan-sm" data-alignment="neutral">
      <CardHeader className="p-2.5 border-b border-border/20">
        <CardTitle className="text-sm font-display text-glow-cyan flex items-center gap-1.5">
            <Zap size={16}/>Cognitive Pattern Insights
        </CardTitle>
        <CardDescription className="text-xxs text-muted-foreground/80 pt-0.5">
            Visualizing recurring thought structures and their dynamics.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2.5">
        {detectedPatterns.length === 0 && (!recursiveStructures || recursiveStructures.length === 0) ? (
            <p className="text-xs text-muted-foreground italic text-center py-3">No prominent cognitive patterns or recursive structures detected in this analysis.</p>
        ) : (
            <>
                {detectedPatterns.length > 0 && (
                    <div>
                        <h5 className="text-xs font-semibold mb-1 text-secondary flex items-center gap-1"><Brain size={14}/>Detected Patterns Frequency</h5>
                        <PatternFrequencyChart data={visualizationData.frequencyData} />
                    </div>
                )}
                
                {recursiveStructures && recursiveStructures.length > 0 && (
                     <div className="mt-2">
                        <h5 className="text-xs font-semibold mb-1 text-secondary flex items-center gap-1"><PackageSearch size={14}/>Recursive Structures</h5>
                        <ul className="list-disc list-inside pl-3 text-xxs text-muted-foreground/90 space-y-0.5">
                            {recursiveStructures.map((rs, idx) => <li key={idx}><strong>{rs.type}:</strong> {rs.description} (in {rs.detectedIn})</li>)}
                        </ul>
                    </div>
                )}
                
                {/*
                <div className="pattern-connections">
                    <h5 className="text-xs font-semibold mb-1 text-secondary">Pattern Connections (Conceptual)</h5>
                    <PatternNetworkGraph data={visualizationData.networkData} />
                </div>
                */}
                
                {/*
                {visualizationData.timelineData.length > 0 && (
                    <div className="pattern-timeline">
                        <h5 className="text-xs font-semibold mb-1 text-secondary">Pattern Evolution (Conceptual)</h5>
                        <PatternEvolutionTimeline data={visualizationData.timelineData} />
                    </div>
                )}
                */}
            </>
        )}
        <p className="text-xxs text-muted-foreground/50 mt-1 italic text-right">(CognitivePatternVisualizer is a basic stub)</p>
      </CardContent>
    </Card>
  );
};
