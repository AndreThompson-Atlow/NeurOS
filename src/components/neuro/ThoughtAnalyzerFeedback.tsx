'use client';

import React from 'react';
import type { AnalysisResult, ShameIndexResult, FeedbackOutput, RubricScores, QualityFlags } from '@/types/neuro';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Info, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend as RechartsLegend, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface ThoughtAnalyzerFeedbackProps {
  evaluationResult: {
    overallScore: number;
    overallFeedback: string;
    isPass: boolean;
    rubricScores?: RubricScores;
    qualityFlags?: QualityFlags;
    analysisResult?: AnalysisResult; // For future deeper integration if needed
    shameIndexResult?: ShameIndexResult; // For future deeper integration if needed
    feedbackOutput?: FeedbackOutput; // For future growth suggestions etc.
  };
}

const RubricDimensionDisplay: React.FC<{ label: string; score: number; narrative: string; }> = ({ label, score, narrative }) => {
  let scoreColorClass = "text-muted-foreground";
  if (score >= 0.8) scoreColorClass = "text-status-understood";
  else if (score >= 0.5) scoreColorClass = "text-status-familiar";
  else scoreColorClass = "text-status-needs-review";

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-spacing-xs py-spacing-xs border-b border-border/20 last:border-b-0">
      <p className="text-sm text-foreground/90">{label}</p>
      <Badge variant="outline" className={cn("text-xs", scoreColorClass, scoreColorClass.replace('text-','border-'))}>{narrative}</Badge>
      <p className={cn("text-sm font-semibold w-10 text-right", scoreColorClass)}>{(score * 100).toFixed(0)}%</p>
    </div>
  );
};


export const ThoughtAnalyzerFeedback: React.FC<ThoughtAnalyzerFeedbackProps> = ({ evaluationResult }) => {
  const {
    overallScore,
    overallFeedback,
    isPass,
    rubricScores,
    qualityFlags,
    feedbackOutput, // For growth suggestions, etc.
  } = evaluationResult;

  const radarData = rubricScores ? [
    { subject: 'Clarity', score: rubricScores.clarity.score * 100, fullMark: 100 },
    { subject: 'Relevance', score: rubricScores.relevance.score * 100, fullMark: 100 },
    { subject: 'Depth', score: rubricScores.depthOfThought.score * 100, fullMark: 100 },
    { subject: 'Alignment', score: rubricScores.domainAlignment.score * 100, fullMark: 100 },
    { subject: 'Integrity', score: rubricScores.logicalIntegrity.score * 100, fullMark: 100 },
    { subject: 'Specificity', score: rubricScores.specificity.score * 100, fullMark: 100 },
    { subject: 'Voice', score: rubricScores.voiceAppropriateness.score * 100, fullMark: 100 },
    { subject: 'Originality', score: rubricScores.originality.score * 100, fullMark: 100 },
  ] : [];

  const passOrFailColor = isPass ? 'text-status-understood' : 'text-status-needs-review';
  const passOrFailBorder = isPass ? 'border-status-understood' : 'border-status-needs-review';
  const passOrFailBg = isPass ? 'bg-status-understood-bg' : 'bg-status-needs-review-bg';

  return (
    <Card className={cn("mt-spacing-md p-spacing-md shadow-cyan-md border-t-4", passOrFailBorder, passOrFailBg)}>
      <CardHeader className="p-0 mb-spacing-sm">
        <div className="flex justify-between items-center">
          <CardTitle className={cn("text-xl font-display flex items-center gap-spacing-xs", passOrFailColor)}>
            {isPass ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            Evaluation Result
          </CardTitle>
          <Badge variant={isPass ? "default" : "destructive"} className={cn("text-lg px-spacing-sm py-spacing-xs", isPass ? `bg-primary text-primary-foreground` : `bg-destructive text-destructive-foreground`)}>
            {overallScore}% - {isPass ? "Passed" : "Needs Improvement"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-spacing-md">
        <div className="p-spacing-sm bg-card/50 rounded-md border border-border/30">
          <p className="text-base text-foreground/95 leading-relaxed">{overallFeedback}</p>
        </div>

        {rubricScores && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="rubric-breakdown" className="border-border/30">
              <AccordionTrigger className="text-md font-semibold text-glow-cyan hover:no-underline py-spacing-sm">
                <BarChart3 size={20} className="mr-spacing-xs text-secondary" />Detailed Rubric Scores
              </AccordionTrigger>
              <AccordionContent className="pt-spacing-sm space-y-spacing-md">
                <div className="grid md:grid-cols-2 gap-spacing-md">
                  <div className="h-64 md:h-80"> {/* Ensure container has height for ResponsiveContainer */}
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
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
                  <div className="space-y-spacing-xs">
                    <RubricDimensionDisplay label="Clarity" score={rubricScores.clarity.score} narrative={rubricScores.clarity.label} />
                    <RubricDimensionDisplay label="Relevance" score={rubricScores.relevance.score} narrative={rubricScores.relevance.label} />
                    <RubricDimensionDisplay label="Depth of Thought" score={rubricScores.depthOfThought.score} narrative={rubricScores.depthOfThought.label} />
                    <RubricDimensionDisplay label="Domain Alignment" score={rubricScores.domainAlignment.score} narrative={rubricScores.domainAlignment.label} />
                    <RubricDimensionDisplay label="Logical Integrity" score={rubricScores.logicalIntegrity.score} narrative={rubricScores.logicalIntegrity.label} />
                    <RubricDimensionDisplay label="Specificity" score={rubricScores.specificity.score} narrative={rubricScores.specificity.label} />
                    <RubricDimensionDisplay label="Voice Appropriateness" score={rubricScores.voiceAppropriateness.score} narrative={rubricScores.voiceAppropriateness.label} />
                    <RubricDimensionDisplay label="Originality" score={rubricScores.originality.score} narrative={rubricScores.originality.label} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {qualityFlags && Object.values(qualityFlags).some(flag => flag) && (
          <div className="p-spacing-sm bg-destructive/10 border border-destructive/30 rounded-md space-y-spacing-xs">
            <h4 className="text-md font-semibold text-destructive flex items-center gap-spacing-xs"><AlertCircle size={18}/>Quality Concerns</h4>
            {qualityFlags.mimicry && <p className="text-sm text-destructive-foreground/90">- Response shows high similarity to source material. Try to synthesize in your own words.</p>}
            {qualityFlags.insufficientLength && <p className="text-sm text-destructive-foreground/90">- Response may be too brief to fully address the prompt.</p>}
            {qualityFlags.lowCoherence && <p className="text-sm text-destructive-foreground/90">- Response lacks clarity or logical structure, making it difficult to understand.</p>}
          </div>
        )}

        {feedbackOutput?.growthSuggestions && feedbackOutput.growthSuggestions.length > 0 && (
          <div className="mt-spacing-sm p-spacing-sm bg-primary/10 border border-primary/30 rounded-md">
            <h5 className="text-md font-semibold text-glow-gold mb-spacing-xs flex items-center gap-spacing-xs"><TrendingUp size={18}/>Growth Suggestions:</h5>
            <ul className="list-disc list-inside pl-spacing-sm space-y-spacing-xs text-sm text-primary-foreground/90">
              {feedbackOutput.growthSuggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)}
            </ul>
          </div>
        )}
         {feedbackOutput?.metacognitivePrompts && feedbackOutput.metacognitivePrompts.length > 0 && (
          <div className="mt-spacing-sm p-spacing-sm bg-secondary/10 border border-secondary/30 rounded-md">
            <h5 className="text-md font-semibold text-glow-cyan mb-spacing-xs flex items-center gap-spacing-xs"><FileText size={18}/>For Reflection:</h5>
            <ul className="list-disc list-inside pl-spacing-sm space-y-spacing-xs text-sm text-secondary-foreground/90">
              {feedbackOutput.metacognitivePrompts.map((prompt, index) => <li key={index}>{prompt}</li>)}
            </ul>
          </div>
        )}

      </CardContent>
    </Card>
  );
};