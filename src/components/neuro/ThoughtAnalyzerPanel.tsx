'use client';

import React, { useEffect, useState } from 'react';
import type { EvaluationResult, RubricDimensionScore as RubricDimensionScoreType, RubricScores, QualityFlags, ShameIndexResult, FeedbackOutput, AnalysisResult } from '@/types/neuro';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart3, Edit3, HelpCircle, Eye, AlertCircle, CheckCircle, MessageSquare, TrendingUp, FileText, Zap } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { cn } from '@/lib/utils';
import { getCharacterById } from '@/lib/server/characters';

interface ThoughtAnalyzerPanelProps {
  userInput: string;
  evaluationResult: EvaluationResult;
  judgingCharacterId?: string;
  onResubmit?: () => void;
  onRequestHint?: () => void;
  onViewPast?: () => void;
}

const RubricDimensionDisplay: React.FC<{ label: string; scoreData: RubricDimensionScoreType | undefined }> = ({ label, scoreData }) => {
  if (!scoreData) {
    return (
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-spacing-sm py-spacing-sm border-b border-border/20 last:border-b-0">
        <p className="text-sm text-foreground/70">{label}</p>
        <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">N/A</Badge>
        <p className="text-sm font-semibold w-12 text-right text-muted-foreground">--%</p>
      </div>
    );
  }
  const { score, label: narrativeLabel } = scoreData;
  let scoreColorClass = "text-muted-foreground";
  if (score >= 0.8) scoreColorClass = "text-status-understood";
  else if (score >= 0.5) scoreColorClass = "text-status-familiar";
  else scoreColorClass = "text-status-needs-review";

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-spacing-sm py-spacing-sm border-b border-border/20 last:border-b-0">
      <p className="text-sm text-foreground/90">{label}</p>
      <Badge variant="outline" className={cn("text-xs text-nowrap", scoreColorClass, scoreColorClass.replace('text-','border-'))} title={narrativeLabel}>{narrativeLabel.length > 20 ? narrativeLabel.substring(0,18) + "..." : narrativeLabel}</Badge>
      <p className={cn("text-sm font-semibold w-12 text-right", scoreColorClass)}>{(score * 100).toFixed(0)}%</p>
    </div>
  );
};

export const ThoughtAnalyzerPanel: React.FC<ThoughtAnalyzerPanelProps> = ({
  userInput,
  evaluationResult,
  judgingCharacterId,
  onResubmit,
  onRequestHint,
  onViewPast,
}) => {
  const {
    score: overallScore, // Renamed for clarity within this component
    overallFeedback,
    isPass,
    rubricScores,
    qualityFlags,
    personalityFeedback,
    analysisResult, // Will be undefined if analyzer is off
    shameIndexResult, // Will be undefined if analyzer is off
    feedbackOutput    // Will contain only main/personality if analyzer is off
  } = evaluationResult;

  const [judgingCharacterName, setJudgingCharacterName] = useState('AI');

  useEffect(() => {
    if (judgingCharacterId) {
      getCharacterById(judgingCharacterId).then(char => {
        if (char) setJudgingCharacterName(char.name);
      }).catch(err => console.error("Failed to fetch judging character name:", err));
    } else {
        setJudgingCharacterName("The System");
    }
  }, [judgingCharacterId]);

  // Determine if detailed analysis was performed.
  // If rubricScores are undefined or only contain N/A labels, assume it was not.
  const detailedAnalysisPerformed = !!rubricScores && Object.values(rubricScores).some(dim => dim && dim.label && !dim.label.endsWith("N/A"));

  const radarData = detailedAnalysisPerformed && rubricScores ? Object.entries(rubricScores).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), // Format key for display
    score: (value?.score || 0) * 100,
    fullMark: 100,
  })) : [];


  const passOrFailColor = isPass ? 'text-status-understood' : 'text-status-needs-review';
  const passOrFailBorder = isPass ? 'border-status-understood' : 'border-status-needs-review';
  const passOrFailBg = isPass ? 'bg-status-understood-bg' : 'bg-status-needs-review-bg';
  
  const displayShameEngineWarning = (feedbackOutput?.warningFlags && feedbackOutput.warningFlags.length > 0) || (shameIndexResult && shameIndexResult.score < 60);
  
  let shameEngineMessage = feedbackOutput?.warningFlags?.join(' ') || "Consider revising your approach for better clarity and depth.";
   if (!feedbackOutput?.warningFlags?.length && shameIndexResult && shameIndexResult.score < 60) {
     shameEngineMessage = shameIndexResult.vulnerabilities && shameIndexResult.vulnerabilities.length > 0 
        ? `This response might be influenced by cognitive vulnerabilities such as: ${shameIndexResult.vulnerabilities.join(', ')}. Reflect on this as you revise.`
        : "This response indicates a potential cognitive load or miscalibration. Take a moment to re-center before revising.";
   }


  return (
    <Card className={cn("mt-spacing-lg p-spacing-lg shadow-cyan-md border-t-4 w-full", passOrFailBorder, passOrFailBg)}>
      <CardHeader className="p-0 mb-spacing-lg">
        <div className="flex justify-between items-center mb-spacing-md">
            <CardTitle className={cn("text-2xl font-display flex items-center gap-spacing-md", passOrFailColor)}>
                {isPass ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                Thought Analyzer Report
            </CardTitle>
            <Badge variant={isPass ? "default" : "destructive"} className={cn("text-xl px-spacing-md py-spacing-sm", isPass ? `bg-primary text-primary-foreground` : `bg-destructive text-destructive-foreground`)}>
                {(overallScore || 0).toFixed(0)}%
            </Badge>
        </div>
         {overallFeedback && (
            <CardDescription className="text-base text-foreground/80 pt-spacing-md leading-relaxed">
              <strong>Overall Assessment:</strong> {overallFeedback}
            </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0 space-y-spacing-lg">
        {personalityFeedback && (
          <div className="p-spacing-md bg-card/70 rounded-md border border-border/50 shadow-sm">
            <h4 className="text-md font-semibold text-glow-cyan flex items-center gap-spacing-sm mb-spacing-sm">
                <MessageSquare size={18}/> {judgingCharacterName} Says:
            </h4>
            <p className="text-sm text-foreground/90 italic leading-relaxed">{personalityFeedback}</p>
          </div>
        )}

        {displayShameEngineWarning && detailedAnalysisPerformed && ( // Only show if detailed analysis happened
          <div className="mt-spacing-lg p-spacing-lg bg-destructive/10 border border-destructive/50 rounded-md flex items-start gap-spacing-md animate-pulse-destructive">
            <Zap size={32} className="text-destructive flex-shrink-0 mt-1" />
            <div>
              <p className="text-lg font-semibold text-destructive mb-spacing-sm">{judgingCharacterName} notes a concern:</p>
              <p className="text-destructive-foreground/90 mb-spacing-md">{shameEngineMessage}</p>
              {onResubmit && (
                <Button onClick={onResubmit} variant="destructive" size="sm" className="mt-spacing-md text-xs btn-destructive">
                    <Edit3 size={16} className="mr-spacing-xs"/> Retry with Integrity
                </Button>
              )}
            </div>
          </div>
        )}

        {detailedAnalysisPerformed && rubricScores && (
            <Accordion type="single" collapsible className="w-full" defaultValue="summary">
            <AccordionItem value="summary" className="border-border/30">
              <AccordionTrigger className="text-lg font-semibold text-glow-cyan hover:no-underline py-spacing-md">
                <BarChart3 size={22} className="mr-spacing-sm text-secondary" />Detailed Rubric Scores
              </AccordionTrigger>
              <AccordionContent className="pt-spacing-lg space-y-spacing-lg">
                <div className="grid md:grid-cols-2 gap-spacing-lg items-center">
                  <div className="h-72 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <Radar name={judgingCharacterName || "Evaluation"} dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.7} />
                        <RechartsLegend wrapperStyle={{fontSize: '12px'}}/>
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
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-spacing-sm">
                    <RubricDimensionDisplay label="Clarity" scoreData={rubricScores.clarity} />
                    <RubricDimensionDisplay label="Relevance" scoreData={rubricScores.relevance} />
                    <RubricDimensionDisplay label="Depth of Thought" scoreData={rubricScores.depthOfThought} />
                    <RubricDimensionDisplay label="Domain Alignment" scoreData={rubricScores.domainAlignment} />
                    <RubricDimensionDisplay label="Logical Integrity" scoreData={rubricScores.logicalIntegrity} />
                    <RubricDimensionDisplay label="Specificity" scoreData={rubricScores.specificity} />
                    <RubricDimensionDisplay label="Voice Appropriateness" scoreData={rubricScores.voiceAppropriateness} />
                    <RubricDimensionDisplay label="Originality" scoreData={rubricScores.originality} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {detailedAnalysisPerformed && feedbackOutput?.growthSuggestions && feedbackOutput.growthSuggestions.length > 0 && (
          <div className="mt-spacing-lg p-spacing-md bg-primary/10 border border-primary/30 rounded-md">
            <h5 className="text-md font-semibold text-glow-gold mb-spacing-md flex items-center gap-spacing-sm"><TrendingUp size={18}/>Growth Suggestions:</h5>
            <ul className="list-disc list-inside pl-spacing-sm space-y-spacing-sm text-sm text-primary-foreground/90">
              {feedbackOutput.growthSuggestions.map((suggestion: string, index: number) => <li key={`growth-${index}`}>{suggestion}</li>)}
            </ul>
          </div>
        )}
         {detailedAnalysisPerformed && feedbackOutput?.metacognitivePrompts && feedbackOutput.metacognitivePrompts.length > 0 && (
          <div className="mt-spacing-lg p-spacing-md bg-secondary/10 border border-secondary/30 rounded-md">
            <h5 className="text-md font-semibold text-glow-cyan mb-spacing-md flex items-center gap-spacing-sm"><FileText size={18}/>For Reflection:</h5>
            <ul className="list-disc list-inside pl-spacing-sm space-y-spacing-sm text-sm text-secondary-foreground/90">
              {feedbackOutput.metacognitivePrompts.map((prompt: string, index: number) => <li key={`reflect-${index}`}>{prompt}</li>)}
            </ul>
          </div>
        )}

      </CardContent>
      {/* Only show "Revise Answer" if detailed analysis was NOT displayed (meaning analyzer was off) AND it's not a pass */}
      {/* OR if it's not a pass and it's NOT a shame engine warning case (which has its own retry) */}
      {onResubmit && !isPass && (!detailedAnalysisPerformed || !displayShameEngineWarning) && (
      <CardFooter className="p-0 mt-spacing-lg pt-spacing-lg border-t border-border/30 flex justify-end gap-spacing-sm">
          <Button onClick={onResubmit} variant="secondary" size="sm" className="text-xs btn-neutral">
            <Edit3 size={16} className="mr-spacing-xs"/> Revise Answer
          </Button>
      </CardFooter>
      )}
    </Card>
  );
};
