'use client';

import { useState, useEffect } from 'react';
import { useLearningSession } from '@/hooks/useLearningSession';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DownloadPhase from '@/components/learning/DownloadPhase';
import EPICPhase from '@/components/learning/EPICPhase';
import KnowledgeCheckContainer from '@/components/learning/KnowledgeCheckContainer';
import { KnowledgeCheckQuestion } from '@/components/learning/KnowledgeCheckQuestion';
import { LearningCompletion } from '@/components/learning/LearningCompletion';
import { Loader2, BookOpen, Download, Upload, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LearningPage() {
  const router = useRouter();
  const { moduleId } = useParams();
  const learningSession = useLearningSession();
  const [userInput, setUserInput] = useState('');
  
  const {
    currentModule,
    currentDomain,
    currentNode,
    progress,
    isLoading,
    knowledgeCheckQuestions,
    currentKnowledgeCheckIndex,
    selectedKnowledgeCheckAnswer,
    submitKnowledgeCheckAnswer,
    generateKnowledgeChecks,
    resetSession,
    exitReadingMode,
    ensureProperLearningFlow,
  } = learningSession;
  
  useEffect(() => {
    if (moduleId && typeof moduleId === 'string') {
      ensureProperLearningFlow(moduleId);
    }
  }, [moduleId, ensureProperLearningFlow]);
  
  if (!currentModule || !progress.currentModuleId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4">Loading module...</p>
      </div>
    );
  }
  
  const LearningHeader = () => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">{currentModule.title}</h1>
        <p className="text-muted-foreground">{currentModule.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={progress.currentPhase === 'reading' ? 'default' : 'outline'}>Reading</Badge>
        <ArrowRight className="h-4 w-4" />
        <Badge variant={progress.currentPhase === 'download' ? 'default' : 'outline'}>Download</Badge>
        <ArrowRight className="h-4 w-4" />
        <Badge variant={progress.currentPhase === 'install' ? 'default' : 'outline'}>Install</Badge>
      </div>
    </div>
  );
  
  const LearningPhaseDisplay = () => {
    if (progress.currentPhase === 'reading') {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reading Mode: {currentNode?.title || 'Introduction'}</span>
                <BookOpen className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>
                Read through the content to build familiarity before active learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3>Definition</h3>
                <p>{currentNode?.shortDefinition || 'No definition available'}</p>
                
                <h3>Detailed Explanation</h3>
                <p>{currentNode?.download?.clarification || 'No explanation available'}</p>
                
                <h3>Example</h3>
                <p>{currentNode?.download?.example || 'No example available'}</p>
                
                <h3>Real-world Application</h3>
                <p>{currentNode?.download?.scenario || 'No application scenario available'}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={() => exitReadingMode(false)}>
                Exit Reading Mode
              </Button>
              <Button onClick={() => exitReadingMode(true)}>
                Continue to Download Phase
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    
    if (progress.currentPhase === 'download') {
      // Check if we have knowledge checks to display
      if (knowledgeCheckQuestions.length > 0) {
        return (
          <KnowledgeCheckQuestion
            question={knowledgeCheckQuestions[currentKnowledgeCheckIndex]}
            currentIndex={currentKnowledgeCheckIndex}
            totalQuestions={knowledgeCheckQuestions.length}
            selectedAnswer={selectedKnowledgeCheckAnswer}
            onSelectAnswer={submitKnowledgeCheckAnswer}
            onNext={learningSession.handleProceedAfterSuccess}
            isLastQuestion={currentKnowledgeCheckIndex >= knowledgeCheckQuestions.length - 1}
          />
        );
      }
      
      return (
        <DownloadPhase
          currentNode={currentNode}
          isLoading={isLoading}
          onSubmit={learningSession.submitRecallResponse}
          evaluationResult={learningSession.evaluationResult}
          onProceed={learningSession.handleProceedAfterSuccess}
          clearEvaluation={learningSession.clearEvaluationResult}
        />
      );
    }
    
    if (progress.currentPhase === 'install') {
      return (
        <EPICPhase
          currentNode={currentNode}
          currentEpicStep={learningSession.currentEpicStep}
          isLoading={isLoading}
          probeQuestions={learningSession.probeQuestions}
          evaluationResult={learningSession.evaluationResult}
          onSubmit={learningSession.submitEpicResponse}
          onProceed={learningSession.handleProceedAfterSuccess}
          clearEvaluation={learningSession.clearEvaluationResult}
        />
      );
    }
    
    return <div>Unknown learning phase: {progress.currentPhase}</div>;
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <LearningHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with module/domain navigation */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Phase: {progress.currentPhase}</span>
                  <span>{progress.currentDomainIndex + 1}/{currentModule.domains?.length || 1}</span>
                </div>
                <Progress value={(progress.currentDomainIndex + 1) / (currentModule.domains?.length || 1) * 100} />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Domain</h4>
                <p className="text-sm text-muted-foreground">{currentDomain?.title || 'N/A'}</p>
                
                <h4 className="text-sm font-medium mt-2">Current Node</h4>
                <p className="text-sm text-muted-foreground">{currentNode?.title || 'N/A'}</p>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={resetSession}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Session
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main learning area */}
        <div className="md:col-span-3">
          <LearningPhaseDisplay />
        </div>
      </div>
    </div>
  );
} 