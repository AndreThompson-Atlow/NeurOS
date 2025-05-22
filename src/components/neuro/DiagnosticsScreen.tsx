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

  const renderTermsWithDefinitions = (terms: string[], title: string) => {
    if (!terms || terms.length === 0) return null;
    return (
      <div className="neuro-section">
        <h4 className="neuro-text-subheading mb-spacing-xs">{title}</h4>
        <div className="flex flex-wrap gap-spacing-xs">
          {terms.map(term => {
            const definition = getDefinition(term);
            const isActive = activeTermDefinition === term;
            
            return (
              <Badge 
                key={term} 
                variant={isActive ? "outline" : "secondary"}
                className={`cursor-pointer text-xs px-spacing-xs py-[1px] transition-colors 
                  ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
                onClick={() => definition && setActiveTermDefinition(isActive ? null : term)}
              >
                {term}
              </Badge>
            );
          })}
        </div>
        {activeTermDefinition && (
          <div className="mt-spacing-sm p-spacing-sm text-sm bg-muted/30 rounded-md">
            <p className="font-semibold">{activeTermDefinition}</p>
            <p>{getDefinition(activeTermDefinition)}</p>
          </div>
        )}
      </div>
    );
  };

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
    <div className="neuro-fade-in">
      <div className="flex items-center justify-between mb-spacing-lg">
        <h2 className="neuro-page-title">Diagnostic Tests</h2>
        <Button onClick={onExit} variant="outline" className="neuro-button">
          <ArrowLeft className="mr-spacing-sm" /> Back to Dashboard
        </Button>
      </div>

      <div className="neuro-layout-sidebar gap-spacing-lg mb-spacing-xl">
        <div className="neuro-sidebar space-y-spacing-lg">
          <Card className="neuro-card neuro-card-neutral shadow-sm">
            <CardHeader className="pb-spacing-sm">
              <CardTitle className="neuro-text-heading flex items-center gap-spacing-sm">
                <TestTube className="text-neutral-accent-color" />
                Create Diagnostic
              </CardTitle>
              <CardDescription>
                Configure a new diagnostic test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-spacing-md">
              <div className="neuro-input-group">
                <Label htmlFor="diagnostic-level" className="neuro-label">Test Level</Label>
                <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as DiagnosticLevel)}>
                  <SelectTrigger id="diagnostic-level" className="neuro-input">
                    <SelectValue placeholder="Select level..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="node">Node</SelectItem>
                    <SelectItem value="domain">Domain</SelectItem>
                    <SelectItem value="module">Module</SelectItem>
                    <SelectItem value="system">System-Wide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedLevel && selectedLevel !== 'system' && (
                <div className="neuro-input-group">
                  <Label htmlFor="diagnostic-target" className="neuro-label">Target {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}</Label>
                  <Select 
                    value={selectedTargetId} 
                    onValueChange={setSelectedTargetId} 
                    disabled={!selectedLevel || selectedLevel === 'system'}
                  >
                    <SelectTrigger id="diagnostic-target" className="neuro-input">
                      <SelectValue placeholder="Select target..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                onClick={addTestToQueue} 
                disabled={!selectedLevel || (selectedLevel !== 'system' && !selectedTargetId)}
                className="neuro-button w-full"
              >
                <PlayCircle className="mr-spacing-sm" /> Add to Queue
              </Button>
            </CardContent>
          </Card>

          <Card className="neuro-card shadow-sm">
            <CardHeader className="pb-spacing-sm">
              <CardTitle className="neuro-text-heading flex items-center gap-spacing-sm">
                <Activity className="text-primary" />
                Queue Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-spacing-sm">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Pending tests:</span>
                  <span className="font-semibold">{diagnosticQueue.filter(t => t.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Running tests:</span>
                  <span className="font-semibold">{diagnosticQueue.filter(t => t.status === 'running').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed tests:</span>
                  <span className="font-semibold">{diagnosticQueue.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed tests:</span>
                  <span className="font-semibold">{diagnosticQueue.filter(t => t.status === 'error').length}</span>
                </div>
              </div>

              <Separator className="my-spacing-sm" />
              
              <Button 
                onClick={handleRunAllTests} 
                disabled={!diagnosticQueue.some(t => t.status === 'pending') || diagnosticQueue.some(t => t.status === 'running')}
                variant="default"
                className="neuro-button w-full"
              >
                <Cpu className="mr-spacing-sm" /> Run Next Test
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="neuro-main-content space-y-spacing-lg">
          {currentTest ? (
            <Card className="neuro-card">
              <CardHeader>
                <CardTitle className="neuro-text-heading flex items-center gap-spacing-sm">
                  {getLevelIcon(currentTest.level)}
                  Active Test: {currentTest.name}
                </CardTitle>
                <CardDescription>Target: {currentTest.targetName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-spacing-md">
                <div className="p-spacing-md bg-muted/20 rounded-lg border border-border/50">
                  <h4 className="neuro-text-subheading mb-spacing-sm">Test Prompt:</h4>
                  <p className="neuro-text-body">{currentTest.prompt}</p>
                </div>

                {currentTest.nodeContext?.keyTerms && currentTest.nodeContext.keyTerms.length > 0 && (
                  renderTermsWithDefinitions(currentTest.nodeContext.keyTerms, "Key Terms")
                )}

                <div className="neuro-input-group">
                  <Label htmlFor="diagnostic-response" className="neuro-label">Your Response</Label>
                  <Textarea
                    id="diagnostic-response"
                    value={currentTestInput}
                    onChange={(e) => setCurrentTestInput(e.target.value)}
                    className="neuro-input min-h-[150px] resize-none"
                    placeholder="Enter your response to the diagnostic prompt..."
                    disabled={isLoadingEvaluation || currentTest.status === 'completed'}
                  />
                </div>

                {evaluationResult && currentTest.status === 'completed' && (
                  <Alert variant={evaluationResult.isPass ? "default" : "destructive"} className="mb-spacing-md">
                    <div className="flex gap-spacing-sm items-start">
                      {evaluationResult.isPass ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      )}
                      <div>
                        <AlertTitle className="mb-1 font-semibold">
                          {evaluationResult.isPass ? "Test Passed" : "Needs Improvement"}
                        </AlertTitle>
                        <AlertDescription className="neuro-text-small">
                          {evaluationResult.feedback}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}

                <div className="flex justify-between">
                  <Button 
                    onClick={() => { setCurrentTestIndex(null); clearEvaluationResult(); }}
                    variant="outline"
                    className="neuro-button"
                  >
                    Cancel Test
                  </Button>
                  
                  {currentTest.status === 'running' && (
                    <Button 
                      onClick={handleTestSubmit}
                      disabled={!currentTestInput.trim() || isLoadingEvaluation}
                      className="neuro-button"
                    >
                      {isLoadingEvaluation ? (
                        <>
                          <Loader2 className="mr-spacing-sm h-4 w-4 animate-spin" /> Evaluating...
                        </>
                      ) : (
                        <>
                          <PackageSearch className="mr-spacing-sm" /> Submit for Evaluation
                        </>
                      )}
                    </Button>
                  )}
                  
                  {currentTest.status === 'completed' && (
                    <Button 
                      onClick={handleNextTest} 
                      className="neuro-button"
                    >
                      <PlayCircle className="mr-spacing-sm" /> Next Test
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="neuro-card">
              <CardHeader>
                <CardTitle className="neuro-text-heading">Diagnostic Results</CardTitle>
                <CardDescription>Overview of completed tests</CardDescription>
              </CardHeader>
              <CardContent>
                {diagnosticQueue.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No diagnostics in queue</AlertTitle>
                    <AlertDescription>
                      Create a new diagnostic test using the panel on the left.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-[500px] pr-spacing-sm">
                    <div className="space-y-spacing-md">
                      {diagnosticQueue.map((test, index) => (
                        <Card key={test.id} className={`neuro-card ${test.status === 'completed' && test.result?.isPass ? 'border-green-500/50' : test.status === 'error' ? 'border-destructive/50' : ''}`}>
                          <CardHeader className="p-spacing-sm pb-0">
                            <div className="flex justify-between">
                              <CardTitle className="neuro-text-subheading flex items-center gap-spacing-sm">
                                {getLevelIcon(test.level)}
                                {test.name}
                              </CardTitle>
                              <Badge variant={
                                test.status === 'pending' ? 'outline' : 
                                test.status === 'running' ? 'secondary' :
                                (test.status === 'completed' && test.result?.isPass) ? 'default' : 
                                'destructive'
                              }>
                                {test.status === 'pending' ? 'Pending' : 
                                 test.status === 'running' ? 'Running' :
                                 (test.status === 'completed' && test.result?.isPass) ? 'Passed' : 
                                 'Failed'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-spacing-sm">
                            <p className="neuro-text-small mb-spacing-xs">Target: {test.targetName}</p>
                            {test.status === 'completed' && test.result && (
                              <div className="mt-spacing-xs">
                                <Progress value={test.result.isPass ? 100 : (test.result.score || 0) * 100} className="h-2 mb-spacing-xs" />
                                <p className="neuro-text-small text-muted-foreground">{test.result.feedback}</p>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="p-spacing-sm pt-0 justify-end">
                            {test.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => { 
                                  setCurrentTestIndex(index); 
                                  setCurrentTestInput(test.userInput || '');
                                  setDiagnosticQueue(prev => prev.map((t, i) => i === index ? {...t, status: 'running'} : t));
                                  clearEvaluationResult();
                                }}
                                className="neuro-button text-xs h-8"
                              >
                                <PlayCircle className="mr-spacing-xs h-4 w-4" /> Run
                              </Button>
                            )}
                            {test.status === 'completed' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => { 
                                  setCurrentTestIndex(index); 
                                  setCurrentTestInput(test.userInput || '');
                                  clearEvaluationResult();
                                }}
                                className="neuro-button text-xs h-8"
                              >
                                <FileText className="mr-spacing-xs h-4 w-4" /> View
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
