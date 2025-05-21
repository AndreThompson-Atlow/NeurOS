'use client';

import type { Module, Node, NodeStatus, EvaluationResult as NeuroEvaluationResult, AnalysisContext, UserProfile } from '@/types/neuro';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Activity, Loader2, CheckCircle, AlertCircle, Info, PlayCircle, ListTree, FileText, Cpu, Settings2, Brain, Microscope, TestTube, PackageSearch } from 'lucide-react';
import { useLearningSession } from '@/hooks/useLearningSession';
import { Separator } from '../ui/separator';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { getDefinition } from '@/data/glossary';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThoughtAnalyzerFeedback } from './ThoughtAnalyzerFeedback';
import { Progress } from '@/components/ui/progress';

interface DiagnosticsScreenProps {
  modules: Record<string, Module>;
  onExit: () => void;
}

type DiagnosticLevel = 'node' | 'domain' | 'module' | 'system';
type DiagnosticTestStatus = 'pending' | 'running' | 'completed' | 'error';

interface DiagnosticTest {
  id: string;
  name: string;
  level: DiagnosticLevel;
  targetId: string; 
  targetName: string; // Display name for the target
  status: DiagnosticTestStatus;
  prompt?: string;
  userInput?: string; // Added to store user's input for this test
  result?: NeuroEvaluationResult; 
  nodeContext?: Node; // Store the specific node used for context, if applicable
}

export function DiagnosticsScreen({ modules, onExit }: DiagnosticsScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState<DiagnosticLevel | ''>('');
  const [selectedTargetId, setSelectedTargetId] = useState<string | ''>('');
  
  const [diagnosticQueue, setDiagnosticQueue] = useState<DiagnosticTest[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState<number | null>(null);
  const [currentTestInput, setCurrentTestInput] = useState('');

  const [activeTermDefinition, setActiveTermDefinition] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const { 
    submitDiagnosticResponse,
    evaluationResult, 
    isLoading: isLoadingEvaluation, 
    clearEvaluationResult,
    updateNodeStatus,
    currentUserProfile,
  } = useLearningSession();

  const currentTest = currentTestIndex !== null && currentTestIndex >= 0 && currentTestIndex < diagnosticQueue.length ? diagnosticQueue[currentTestIndex] : null;
  
  useEffect(() => {
    if (evaluationResult && currentTest && currentTest.status === 'running') {
      setDiagnosticQueue(prev => prev.map(test => 
        test.id === currentTest.id ? { ...test, status: 'completed', result: evaluationResult } : test
      ));
      // Update node status if a node-level diagnostic passes
      if (evaluationResult.isPass && currentTest.level === 'node' && currentTest.nodeContext) {
        const nodeToUpdate = currentTest.nodeContext;
        const module = modules[nodeToUpdate.moduleId];
        if (module && module.domains) {
            const domainIndex = module.domains.findIndex(d => d.id === nodeToUpdate.domainId);
            if (domainIndex !== -1 && module.domains[domainIndex].nodes) {
                const nodeIndex = module.domains[domainIndex].nodes.findIndex(n => n.id === nodeToUpdate.id);
                if (nodeIndex !== -1) {
                    updateNodeStatus(nodeToUpdate.moduleId, domainIndex, nodeIndex, 'understood', true, true, new Date(), evaluationResult.score);
                }
            }
        }
      }
      // Do not automatically clear evaluationResult here, let the user view it.
    }
  }, [evaluationResult, currentTest, modules, updateNodeStatus]);


  const addTestToQueue = useCallback(() => {
    if (!selectedLevel || (selectedLevel !== 'system' && !selectedTargetId)) return;

    let testName = '';
    let targetNodeForPrompt: Node | undefined;
    let targetDisplayName = '';
    
    if (selectedLevel === 'node') {
      const node = Object.values(modules).flatMap(m => m.domains.flatMap(d => d.nodes)).find(n => n.id === selectedTargetId);
      if (node) { testName = `Node: ${node.title}`; targetNodeForPrompt = node; targetDisplayName = node.title; }
      else return;
    } else if (selectedLevel === 'domain') {
      const domain = Object.values(modules).flatMap(m => m.domains).find(d => d.id === selectedTargetId);
      if (domain) { testName = `Domain: ${domain.title}`; targetNodeForPrompt = domain.nodes[0]; targetDisplayName = domain.title; } // Use first node for context
      else return;
    } else if (selectedLevel === 'module') {
      const module = modules[selectedTargetId];
      if (module) { testName = `Module: ${module.title}`; targetNodeForPrompt = module.domains[0]?.nodes[0]; targetDisplayName = module.title; } // Use first node for context
      else return;
    } else if (selectedLevel === 'system') {
      testName = 'Full System Diagnostic';
      targetDisplayName = 'System-Wide';
      // For system, maybe pick a core node or have a generic system prompt
      const coreModule = Object.values(modules).find(m => m.type === 'core');
      targetNodeForPrompt = coreModule?.domains[0]?.nodes[0];
    }
    
    const newTest: DiagnosticTest = {
      id: `diag-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: testName,
      level: selectedLevel,
      targetId: selectedTargetId || 'system',
      targetName: targetDisplayName,
      status: 'pending',
      prompt: targetNodeForPrompt?.epic.explainPrompt || "Explain a core concept related to this diagnostic target.",
      nodeContext: targetNodeForPrompt,
    };
    setDiagnosticQueue(prev => [...prev, newTest]);
    setSelectedLevel('');
    setSelectedTargetId('');
  }, [selectedLevel, selectedTargetId, modules]);

  const handleRunAllTests = useCallback(async () => {
    if (diagnosticQueue.some(test => test.status === 'running')) return;
    
    const firstPendingIndex = diagnosticQueue.findIndex(test => test.status === 'pending');
    if (firstPendingIndex !== -1) {
        setCurrentTestIndex(firstPendingIndex);
        setCurrentTestInput(diagnosticQueue[firstPendingIndex].userInput || ''); 
        setDiagnosticQueue(prev => prev.map((test, idx) => idx === firstPendingIndex ? { ...test, status: 'running' } : test));
        clearEvaluationResult();
    } else {
        setCurrentTestIndex(null); 
    }
  }, [diagnosticQueue, clearEvaluationResult]);
  
  const handleTestSubmit = async () => {
    if (!currentTest || !currentTest.prompt || !currentTestInput.trim() || isLoadingEvaluation) return;
    
    const nodeForContext = currentTest.nodeContext;

    // The check for nodeForContext for non-system level tests is crucial.
    if (!nodeForContext && currentTest.level !== 'system') {
        console.error("Node context is missing for diagnostic test:", currentTest);
        setDiagnosticQueue(prev => prev.map(t => t.id === currentTest.id ? {...t, status: 'error', result: {score:0, feedback:"Context error for diagnostic evaluation. Node context not found.", isPass:false}} : t));
        return;
    }
    
    setDiagnosticQueue(prev => prev.map(test => 
      test.id === currentTest.id ? { ...test, userInput: currentTestInput, status: 'running' } : test
    ));

    await submitDiagnosticResponse(
        nodeForContext || {} as Node, // Pass empty Node object if no context (e.g. system level, if allowed by submitDiagnosticResponse)
        currentTest.prompt, 
        currentTestInput,
        currentTest.level 
    );
  };

  const handleNextTest = () => {
    if (currentTestIndex === null || currentTestIndex === undefined) return;
    // Mark current test as completed if it was running but not yet scored
    if(currentTest && currentTest.status === 'running' && !currentTest.result) {
         setDiagnosticQueue(prev => prev.map((test, idx) => idx === currentTestIndex ? { ...test, status: 'completed', result: { score:0, feedback: "Skipped by user or timed out without submission.", isPass:false}} : test));
    }

    const nextPendingIndex = diagnosticQueue.findIndex((test, idx) => idx > currentTestIndex && test.status === 'pending');
    if (nextPendingIndex !== -1) {
        setCurrentTestIndex(nextPendingIndex);
        setCurrentTestInput(diagnosticQueue[nextPendingIndex].userInput || '');
        setDiagnosticQueue(prev => prev.map((test, idx) => idx === nextPendingIndex ? { ...test, status: 'running' } : test));
        clearEvaluationResult();
    } else {
        setCurrentTestIndex(null); 
        clearEvaluationResult();
        // Optionally, show a "All tests in queue processed" message
    }
  };
  
  const getSelectOptions = () => {
    if (!selectedLevel) return [];
    switch (selectedLevel) {
      case 'node':
        return Object.values(modules)
          .flatMap(m => m.domains?.flatMap(d => d.nodes?.map(n => ({ 
            value: n.id, 
            label: `${m.title.substring(0,15)}... > ${d.title.substring(0,15)}... > ${n.title}` 
          })) || []) || [])
          .filter(Boolean); // Filter out undefined nodes if any domain has no nodes
      case 'domain':
        return Object.values(modules)
          .flatMap(m => m.domains?.map(d => ({ 
            value: d.id, 
            label: `${m.title.substring(0,20)}... > ${d.title}` 
          })) || [])
          .filter(Boolean);
      case 'module':
        return Object.values(modules).map(m => ({ value: m.id, label: m.title }));
      case 'system':
        return [{ value: 'system_wide_diagnostic', label: 'Full System Diagnostic' }]; 
      default:
        return [];
    }
  };

  const handleTermClick = (term: string) => {
    if (isMobile) {
      const definition = getDefinition(term);
      setActiveTermDefinition(activeTermDefinition === term ? null : (definition ? `${term}: ${definition}` : null));
    }
  };

  const renderTermsWithDefinitions = (terms: string[], title: string) => (
    <div>
        <h4 className="font-semibold text-sm mb-1 text-glow-cyan">{title}</h4>
        <TooltipProvider delayDuration={100}>
            <div className="flex flex-wrap gap-1 mt-1">
                {terms.map(term => {
                    const definition = getDefinition(term);
                    return (
                        <Tooltip key={term}>
                            <TooltipTrigger asChild>
                                <Badge 
                                    variant="secondary" 
                                    className="cursor-pointer bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs px-1.5 py-0.5"
                                    onClick={() => handleTermClick(term)}
                                >
                                    {term}
                                </Badge>
                            </TooltipTrigger>
                            {!isMobile && definition && (
                                <TooltipContent side="top" className="max-w-xs text-xs bg-popover text-popover-foreground border-border p-1.5 rounded-md shadow-cyan-sm">
                                    <p className="font-semibold text-secondary">{term.charAt(0).toUpperCase() + term.slice(1)}</p>
                                    <p>{definition}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
        {isMobile && activeTermDefinition && (
            <div className="mt-2 p-2 bg-muted/50 border border-border/30 rounded-md text-xs text-foreground/90">
                {activeTermDefinition}
            </div>
        )}
    </div>
);

const getLevelIcon = (level: DiagnosticLevel) => {
    switch(level) {
        case 'node': return <FileText size={16} className="mr-2 text-secondary"/>;
        case 'domain': return <ListTree size={16} className="mr-2 text-primary"/>;
        case 'module': return <PackageSearch size={16} className="mr-2 text-yellow-400"/>; // Changed from Cpu
        case 'system': return <Settings2 size={16} className="mr-2 text-destructive"/>;
        default: return <Brain size={16} className="mr-2 text-muted-foreground"/>;
    }
};

const completedTestsCount = diagnosticQueue.filter(t => t.status === 'completed' || t.status === 'error').length;
const totalTestsCount = diagnosticQueue.length;
const overallProgress = totalTestsCount > 0 ? (completedTestsCount / totalTestsCount) * 100 : 0;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="shadow-cyan-md" data-alignment="neutral">
        <CardHeader className="bg-muted/30 p-4 rounded-t-lg border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-display text-glow-cyan flex items-center gap-2">
              <Microscope size={24} className="text-secondary" /> Cognitive Diagnostics Suite {/* Changed icon */}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => { clearEvaluationResult(); onExit();}}>
              <ArrowLeft size={16} className="mr-1" /> Dashboard
            </Button>
          </div>
          <CardDescription className="text-muted-foreground/80">
            Configure and run diagnostic tests to assess cognitive integration and identify growth areas. Use this system to unit test your understanding.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <Card className="border-border/50 bg-card/90">
            <CardHeader><CardTitle className="text-lg text-glow-cyan">Test Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                  <Label htmlFor="diag-level" className="text-sm font-medium text-muted-foreground">Diagnostic Level:</Label>
                  <Select value={selectedLevel} onValueChange={(val) => { setSelectedLevel(val as DiagnosticLevel); setSelectedTargetId(''); }}>
                    <SelectTrigger id="diag-level" className="ui-select-trigger"><SelectValue placeholder="Select Level" /></SelectTrigger>
                    <SelectContent className="ui-select-content">
                      <SelectItem value="node" className="ui-select-item flex items-center gap-2"><FileText size={14} className="text-secondary"/>Node</SelectItem>
                      <SelectItem value="domain" className="ui-select-item flex items-center gap-2"><ListTree size={14} className="text-primary"/>Domain</SelectItem>
                      <SelectItem value="module" className="ui-select-item flex items-center gap-2"><PackageSearch size={14} className="text-yellow-400"/>Module</SelectItem>
                      <SelectItem value="system" className="ui-select-item flex items-center gap-2"><Settings2 size={14} className="text-destructive"/>System-Wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedLevel && selectedLevel !== 'system' && (
                  <div className="space-y-1">
                    <Label htmlFor="diag-target" className="text-sm font-medium text-muted-foreground">Target:</Label>
                    <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                      <SelectTrigger id="diag-target" className="ui-select-trigger"><SelectValue placeholder={`Select ${selectedLevel || 'Target'}`} /></SelectTrigger>
                      <SelectContent className="ui-select-content max-h-60">
                        <ScrollArea>
                            {getSelectOptions().map(opt => <SelectItem key={opt.value} value={opt.value} className="ui-select-item truncate">{opt.label}</SelectItem>)}
                        </ScrollArea>
                        </SelectContent>
                    </Select>
                  </div>
                )}
                 {selectedLevel === 'system' && (
                     <div className="space-y-1 md:col-span-1 flex items-end">
                        <p className="text-sm text-muted-foreground italic">System-wide diagnostics assess overall integration.</p>
                    </div>
                 )}
              </div>
              <Button onClick={addTestToQueue} disabled={!selectedLevel || (selectedLevel !== 'system' && !selectedTargetId)} variant="secondary" className="w-full md:w-auto">
                <TestTube size={16} className="mr-2"/>Add Test to Queue
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/90">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-glow-cyan">Diagnostic Test Queue ({diagnosticQueue.filter(t=>t.status==='pending').length} Pending / {diagnosticQueue.length} Total)</CardTitle>
                    <Button onClick={handleRunAllTests} disabled={diagnosticQueue.length === 0 || diagnosticQueue.every(t => t.status !== 'pending')} variant="primary" size="sm">
                        <PlayCircle size={16} className="mr-2"/> Run Pending Tests
                    </Button>
                </div>
                 {totalTestsCount > 0 && (
                    <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Overall Progress:</Label>
                        <Progress value={overallProgress} className="h-2 mt-1" variant={overallProgress === 100 ? "law" : "default"} />
                    </div>
                )}
            </CardHeader>
            <CardContent>
              {diagnosticQueue.length === 0 && <p className="text-muted-foreground italic text-center py-4">No tests queued. Configure tests above.</p>}
              <ScrollArea className="h-[calc(100vh-550px)] pr-2 space-y-3"> {/* Adjusted height */}
                {diagnosticQueue.map((test, index) => (
                  <Card key={test.id} className={`mb-3 ${test.id === currentTest?.id && currentTest?.status === 'running' ? 'ring-2 ring-primary shadow-cyan-md' : 'border-border/30 opacity-80 hover:opacity-100'}`}>
                    <CardHeader className="p-3 flex flex-row justify-between items-center bg-muted/20 rounded-t-md border-b border-border/20">
                      <div className="flex items-center">
                        {getLevelIcon(test.level)}
                        <CardTitle className="text-md">{test.targetName}</CardTitle>
                      </div>
                      <Badge variant={test.status === 'completed' ? (test.result?.isPass ? 'default' : 'destructive') : test.status === 'running' ? 'secondary' : 'outline'} className={`text-xs ${test.status === 'completed' && test.result?.isPass ? 'bg-primary text-primary-foreground' : ''}`}>
                        {test.status}
                        {test.status === 'completed' && test.result && ` (${test.result.score}%)`}
                      </Badge>
                    </CardHeader>
                    
                    {/* Active Test UI */}
                    {currentTest && test.id === currentTest.id && test.status === 'running' && test.prompt && !test.result && (
                      <CardContent className="p-3 border-t border-border/20">
                        {currentTest.nodeContext && (
                           <Card className="p-3 mb-3 bg-muted/20 border border-border/30 rounded-md text-xs">
                             <CardHeader className='p-0 pb-1'>
                                <CardTitle className="text-sm mb-0.5 text-glow-cyan">Context: {currentTest.nodeContext.title}</CardTitle>
                             </CardHeader>
                             <CardContent className='p-0'>
                                <p className="text-muted-foreground/80 text-xxs mb-1">{currentTest.nodeContext.shortDefinition}</p>
                                {currentTest.nodeContext.keyTerms && currentTest.nodeContext.keyTerms.length > 0 && renderTermsWithDefinitions(currentTest.nodeContext.keyTerms, "Key Terms")}
                             </CardContent>
                           </Card>
                        )}
                        <Label htmlFor={`test-input-${test.id}`} className="font-semibold text-md text-glow-gold block mb-1">{test.prompt}</Label>
                        <Textarea
                          id={`test-input-${test.id}`}
                          value={currentTestInput}
                          onChange={(e) => setCurrentTestInput(e.target.value)}
                          placeholder="Your comprehensive response..."
                          rows={4}
                          className="ui-textarea mb-2 text-sm"
                          disabled={isLoadingEvaluation}
                        />
                        <Button onClick={handleTestSubmit} disabled={isLoadingEvaluation || !currentTestInput.trim()} size="sm" variant="secondary">
                          {isLoadingEvaluation ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Diagnostic Response'}
                        </Button>
                      </CardContent>
                    )}

                    {/* Test Result UI */}
                    {test.status === 'completed' && test.result && (
                        <CardContent className="p-3 border-t border-border/20">
                           {test.result.analysisResult && test.result.shameIndexResult ? (
                             <ThoughtAnalyzerFeedback analysis={test.result.analysisResult} shameIndex={test.result.shameIndexResult} />
                           ) : (
                             <Alert variant={test.result.isPass ? "default" : "destructive"} className={`${test.result.isPass ? 'border-primary bg-primary/10' : 'border-destructive bg-destructive/10'}`}>
                                <Info className={`h-4 w-4 ${test.result.isPass ? 'text-primary' : 'text-destructive'}`} />
                                <AlertTitle className={`${test.result.isPass ? 'text-glow-gold' : 'text-glow-crimson'}`}>Result (Score: {test.result.score}%)</AlertTitle>
                                <AlertDescription>{test.result.feedback}</AlertDescription>
                             </Alert>
                           )}
                        </CardContent>
                    )}
                     {test.status === 'error' && test.result && (
                        <CardContent className="p-3 border-t border-border/20">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Test Error</AlertTitle>
                                <AlertDescription>{test.result.feedback || "An unexpected error occurred during this test."}</AlertDescription>
                            </Alert>
                        </CardContent>
                    )}
                    {/* Next Test Button (appears if this test is the current one AND completed/errored AND there are more pending tests) */}
                    {currentTest && test.id === currentTest.id && (test.status === 'completed' || test.status === 'error') && diagnosticQueue.some((t, i) => i > currentTestIndex! && t.status === 'pending') && (
                         <CardFooter className="p-3 border-t border-border/20">
                            <Button onClick={handleNextTest} variant="outline" size="sm" className="w-full">Next Pending Test <ArrowLeft className="ml-1 rotate-180" size={16}/></Button>
                         </CardFooter>
                    )}
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
