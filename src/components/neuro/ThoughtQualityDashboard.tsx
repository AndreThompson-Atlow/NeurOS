'use client';

import React from 'react';
import type { ThoughtQuality, GrowthEdge } from '@/types/neuro';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Brain, Lightbulb, MessageSquare, Scale, BrainCog, SmilePlus, TrendingUp } from 'lucide-react'; // Added more icons

interface ThoughtQualityDashboardProps {
  currentQuality: ThoughtQuality;
  historicalQuality?: ThoughtQuality[]; 
  growthEdges?: GrowthEdge[]; 
}

// Mock chart component - in a real app, use a library like Recharts or Chart.js
const ThoughtQualityRadar: React.FC<{ data: { name: string, score: number }[] }> = ({ data }) => (
  <div className="p-2 border border-border/20 rounded bg-muted/30 text-center text-xxs text-muted-foreground/80 h-24 flex items-center justify-center">
    Mock Radar Chart ({data.length} dimensions)
    {/* Placeholder for a small radar chart */}
  </div>
);

const DimensionProgressCard: React.FC<{
    label: string;
    score: number;
    icon: React.ReactNode;
    isGrowthEdge?: boolean;
}> = ({ label, score, icon, isGrowthEdge }) => {
    let progressVariant: "law" | "default" | "chaos" = "default";
    if (score >= 80) progressVariant = "law"; // Gold for high scores
    else if (score < 50) progressVariant = "chaos"; // Crimson for low scores
    // Default (secondary/cyan) for mid-range

    return (
    <div className="p-1.5 border border-border/30 rounded-md bg-muted/50 shadow-sm">
        <div className="flex justify-between items-center mb-0.5">
            <span className="text-xxs font-medium text-foreground/90 flex items-center gap-1">{icon}{label}</span>
            {isGrowthEdge && <Badge variant="outline" className="text-xxs text-yellow-400 border-yellow-500/50 px-1 py-0">Growth Edge</Badge>}
        </div>
        <Progress value={score} className="h-1" variant={progressVariant} />
        <p className={`text-right text-xxs font-semibold mt-0.5 ${
            score >= 80 ? 'text-primary' : score < 50 ? 'text-destructive' : 'text-secondary'
        }`}>{score.toFixed(0)}%</p>
    </div>
)};

export const ThoughtQualityDashboard: React.FC<ThoughtQualityDashboardProps> = ({ currentQuality, historicalQuality, growthEdges }) => {
  
  const qualityDimensions = [
    { key: 'logicalIntegrity', label: 'Logical Integrity', icon: <Scale size={12}/> },
    { key: 'epistemicCalibration', label: 'Epistemic Calibration', icon: <Lightbulb size={12}/> },
    { key: 'cognitiveFlexibility', label: 'Cognitive Flexibility', icon: <BrainCog size={12}/> },
    { key: 'emotionalIntegration', label: 'Emotional Integration', icon: <SmilePlus size={12}/> },
    { key: 'metacognitiveAwareness', label: 'Metacognitive Awareness', icon: <Brain size={12}/> },
    { key: 'expressiveClarity', label: 'Expressive Clarity', icon: <MessageSquare size={12}/> },
  ];

  const radarChartData = qualityDimensions.map(dim => ({
    name: dim.label,
    score: currentQuality[dim.key as keyof ThoughtQuality] || 0,
  }));


  return (
    <Card className="thought-quality-dashboard my-3 bg-card/90 border-primary/30 shadow-cyan-sm" data-alignment="law">
      <CardHeader className="p-2.5 border-b border-border/20">
        <CardTitle className="text-sm font-display text-glow-gold flex items-center gap-1.5">
            <BarChart3 size={16}/>Thought Quality Dashboard
        </CardTitle>
         <CardDescription className="text-xxs text-muted-foreground/80 pt-0.5">
            Overview of cognitive processing dimensions.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2">
        {/* <div className="quality-radar mb-2">
          <ThoughtQualityRadar data={radarChartData} />
        </div> */}
        
        <div className="dimension-details grid grid-cols-2 gap-1.5">
          {qualityDimensions.map((dim) => (
            <DimensionProgressCard 
              key={dim.key}
              label={dim.label}
              icon={dim.icon}
              score={currentQuality[dim.key as keyof ThoughtQuality] || 0}
              // historicalScores={historicalQuality?.map(q => q[dim.key as keyof ThoughtQuality])}
              isGrowthEdge={growthEdges?.some(e => e.domain === dim.key)}
            />
          ))}
        </div>

        {growthEdges && growthEdges.length > 0 && (
             <div className="mt-2 p-2 bg-muted/40 border border-yellow-500/30 rounded-md">
              <h5 className="text-xs font-semibold text-yellow-400 mb-1 flex items-center gap-1"><TrendingUp size={14}/>Key Growth Edges:</h5>
              <ul className="list-disc list-inside pl-3 text-xxs text-muted-foreground/85 space-y-0.5">
                {growthEdges.slice(0,2).map(edge => ( // Show top 2 for brevity
                  <li key={edge.edgeId}>
                    <strong className="capitalize">{edge.domain.replace(/([A-Z])/g, ' $1').trim()}:</strong> {edge.description}
                  </li>
                ))}
              </ul>
            </div>
        )}
        <p className="text-xxs text-muted-foreground/50 mt-1 italic text-right">(ThoughtQualityDashboard)</p>
      </CardContent>
    </Card>
  );
};
