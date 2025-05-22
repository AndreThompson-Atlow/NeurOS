'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLearningSession, DetailedLoadingState } from '@/hooks/useLearningSession';
import { ModuleSelectorCard } from '@/components/neuro/ModuleSelectorCard';
import { ProgressBar } from '@/components/neuro/ProgressBar';
import { NodeDisplay } from '@/components/neuro/NodeDisplay';
import { ChronicleDisplay, DungeonLoadingScreen } from '@/components/neuro/ChronicleDisplay';
import { AdminPanel } from '@/components/neuro/AdminPanel';
import { ReviewScreen } from '@/components/neuro/ReviewScreen';
import { DiagnosticsScreen } from '@/components/neuro/DiagnosticsScreen';
import { StatusScreen } from '@/components/neuro/StatusScreen';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertTriangle, Loader2, Swords, Settings, CheckCircle, CornerRightUp, User, BookCheck, Activity, BarChart3, Compass, Library, Voicemail, Mic, MicOff, Volume2, VolumeX, MessageSquare, Map as MapIconLucide, Zap, Shield, Brain, Lightbulb, Link as LinkIconLucide, Search, Orbit, HelpCircle, FileText, ListTree, PackageSearch, Microscope, TestTube, Rocket, TrendingUp, Layers, Users as UsersIcon, FileTextIcon, RotateCcw } from 'lucide-react';
import type { Character } from '@/types/characterTypes';
import { getAllCharacters, getCharacterById } from '@/lib/server/characters';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ReadingModeDisplay } from '@/components/neuro/ReadingModeDisplay';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateReadingDialogue as generateReadingDialogueFlow } from '@/ai/flows/generateReadingDialogueFlow';
import type { GenerateReadingDialogueOutput, GenerateReadingDialogueInput } from '@/ai/flows/types/generateReadingDialogueTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { getAlignmentStyling, getModuleTypeIcon } from '@/components/neuro/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { Module, ModuleStatus, WikiModule } from '@/types/neuro';
import Link from 'next/link';
import { cn } from '@/lib/utils';


export default function Home() {
  const {
    userModules,
    availableDungeons,
    hasAnyInstalledModules,
    currentModule,
    currentNode,
    currentDomain,
    currentDomainIndex, 
    currentNodeIndex, 
    progress,
    isLoading,
    isLoadingChronicle,
    detailedLoadingProgress,
    probeQuestions,
    currentInteraction,
    evaluationResult,
    currentEpicStep,
    activeChronicleRun,
    addModuleToLibrary,
    startModule,
    submitRecallResponse,
    submitEpicResponse,
    fetchProbeQuestions,
    resetSession,
    clearEvaluationResult,
    handleProceedAfterSuccess, 
    startChronicleRun,
    submitChronicleEncounterResponse,
    onPlayerCombatAction,
    endChronicleRun,
    movePlayer,
    interactWithTile,
    retryDungeonLoad,
    admin_removeModuleFromLibrary,
    admin_setModuleStatus,
    admin_markAllInstalledNodesForReview,
    setCurrentInteraction,
    playerCharacterBase,
    activeReadingSession,
    startReadingMode,
    navigateReadingMode,
    exitReadingMode,
    activeReviewSession,
    currentUserProfile,
    toggleVoiceMode,
    isVoiceModeActive,
    voiceTranscript,
    isListening,
    capturedAudio,
    submitVoiceInput: hookSubmitVoiceInput,
    speakText,
    stopSpeaking,
    isSpeaking,
    isLoadingTTS,
    isLoadingSTT,
    setIsListening,
    setCapturedAudio,
    setVoiceTranscriptTarget,
    startReviewSession,
    startManualReviewSession,
    hasStandardReviewNodes,
    hasManualReviewNodes
  } = useLearningSession();

  const [allAiCharacters, setAllAiCharacters] = useState<Character[]>([]);
  const [selectedGuideId] = useState<string>('neuros');
  const [guideCharacter, setGuideCharacter] = useState<Character | null>(null);
  const [isLoadingDialogue, setIsLoadingDialogue] = useState(false);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function fetchChars() {
      try {
        const chars = await getAllCharacters();
        setAllAiCharacters(chars.filter(c => c.type !== 'user' && c.type !== 'antagonist'));
      } catch (error) {
        console.error("Error fetching all characters:", error);
        // toast({ title: "Character Load Error", description: "Could not load AI character data.", variant: "destructive" });
      }
    }
    fetchChars();
  }, []);

  useEffect(() => {
    if (selectedGuideId) {
      async function fetchGuide() {
        try {
          const char = await getCharacterById(selectedGuideId);
          setGuideCharacter(char ?? null);
        } catch (error) {
          console.error("Error fetching guide character:", error);
          setGuideCharacter(null);
        //   toast({ title: "Character Load Error", description: `Could not load guide: ${selectedGuideId}.`, variant: "destructive" });
        }
      }
      fetchGuide();
    }
  }, [selectedGuideId]);


  const startLocalRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setCapturedAudio(audioBlob);
          audioChunksRef.current = [];
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({ description: "Microphone access denied or unavailable.", variant: "destructive" });
      }
    } else {
      toast({ description: "Microphone not supported by this browser.", variant: "destructive" });
    }
  };

  const stopLocalRecording = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setCapturedAudio(audioBlob);
          setIsListening(false);
          audioChunksRef.current = [];
          resolve(null); 
        };
        mediaRecorderRef.current.stop();
      } else {
        setIsListening(false);
        resolve(null);
      }
    });
  };

  const generateNodeDialogueInternal = async (
    targetNode: typeof currentNode, 
    targetModule: typeof currentModule, 
    targetDomain: typeof currentDomain,
    personalitiesForDialogue: string[],
    previousDialogueTurns?: { characterId: string; message: string }[]
    ) => {
    if (!targetNode || !targetModule || !targetDomain) { 
      toast({ description: "No active node context for dialogue generation.", variant: "destructive" });
      return { dialogue: [], error: "Missing node context." };
    }
    setIsLoadingDialogue(true);
    try {
      const dialogueInput: GenerateReadingDialogueInput = {
        nodeTitle: targetNode.title,
        nodeShortDefinition: targetNode.shortDefinition,
        nodeClarification: targetNode.download.clarification,
        moduleTitle: targetModule.title,
        moduleAlignmentBias: targetModule.alignmentBias,
        domainTitle: targetDomain.title,
        domainSpecters: targetDomain.specterAffinities || [],
        domainCharacterAffinities: targetDomain.characterAffinities || [],
        personalities: personalitiesForDialogue,
        previousDialogue: previousDialogueTurns, 
      };
      const result = await generateReadingDialogueFlow(dialogueInput);
      if (result.dialogue && result.dialogue.length > 0) {
        // Toasting dialogue here might be too much for the UI.
        // The component using this function should handle displaying the dialogue.
      } else if (result.error) {
        toast({ title: "Dialogue Error", description: result.error, variant: "destructive" });
      } else {
        // toast({ description: "No dialogue generated."});
      }
      return result;
    } catch (error) {
      console.error("Error generating dialogue:", error);
      toast({ title: "Dialogue Error", description: "Failed to generate character dialogue.", variant: "destructive" });
      return { dialogue: [], error: "Failed to generate dialogue." };
    } finally {
      setIsLoadingDialogue(false);
    }
  };

  const renderModuleCard = (module: Module | WikiModule) => (
    <ModuleSelectorCard
        key={module.id}
        module={module as Module} 
        onStartModule={startModule}
        onAddModuleToLibrary={() => addModuleToLibrary(module.id, module as Partial<WikiModule>)}
        onStartReadingMode={startReadingMode}
    />
  );

  const renderModuleSection = (title: string, modulesToRender: (Module | WikiModule)[], icon?: React.ReactNode, titleColorClass?: string, titleFontClass?: string) => {
    if (modulesToRender.length === 0) return null;
    const firstModule = modulesToRender[0] as Module; // Cast for alignment
    const alignmentProps = getAlignmentStyling(firstModule.alignmentBias);
    return (
      <div className="mb-spacing-xl pb-spacing-lg">
        <h3 className={`neuro-section-title ${titleColorClass || alignmentProps.titleColor} ${titleFontClass || alignmentProps.fontClass} border-b border-divider-neuro pb-spacing-sm mb-spacing-lg flex items-center`}>
          {icon && <span className="mr-spacing-sm">{icon}</span>}
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {modulesToRender.map(renderModuleCard)}
        </div>
      </div>
    );
  };

  const modulesArray = Object.values(userModules);
  const modulesByStatus = (statuses: ModuleStatus[]) =>
    modulesArray.filter(module => statuses.includes(module.status) && module.domains && module.domains.length > 0);

  const modulesByTypeAndStatus = (type: Module['type'], statuses: ModuleStatus[]) =>
    modulesArray.filter(module => module.type === type && statuses.includes(module.status) && module.domains && module.domains.length > 0);
  
  const auxiliaryModulesByAlignmentAndStatus = (alignment: string, statuses: ModuleStatus[]) =>
    modulesArray.filter(module => module.type === 'auxiliary' && module.alignmentBias?.toLowerCase() === alignment && statuses.includes(module.status) && module.domains && module.domains.length > 0);


  const activeOrReadyModules = modulesByStatus(['downloading', 'installing', 'in_library', 'downloaded']);
  const installedModules = modulesByStatus(['installed']);
  
  const exploreCoreModules = modulesByTypeAndStatus('core', ['new', 'in_library']);
  const explorePillarModules = modulesByTypeAndStatus('pillar', ['new', 'in_library']);
  const exploreAuxLaw = auxiliaryModulesByAlignmentAndStatus('law', ['new', 'in_library']);
  const exploreAuxNeutral = auxiliaryModulesByAlignmentAndStatus('neutral', ['new', 'in_library']);
  const exploreAuxChaos = auxiliaryModulesByAlignmentAndStatus('chaos', ['new', 'in_library']);
  const exploreChallengeModules = modulesByTypeAndStatus('challenge', ['new', 'in_library']);
  const allExploreModulesEmpty = !exploreCoreModules.length && !explorePillarModules.length && !exploreAuxLaw.length && !exploreAuxNeutral.length && !exploreAuxChaos.length && !exploreChallengeModules.length;


  const renderContent = () => {
    switch (currentInteraction) {
      case 'initial':
        const guideAlignment = guideCharacter?.alignment || 'neutral';
        const guideStyling = getAlignmentStyling(guideAlignment);

        return (
          <div className="neuro-container neuro-fade-in">
             <Card data-alignment="neutral" className="neuro-card w-full mb-spacing-lg md:mb-spacing-xl p-spacing-md sm:p-spacing-lg">
              <CardHeader className="pb-spacing-sm sm:pb-spacing-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-spacing-sm">
                  <CardTitle className="module-title text-glow-cyan font-theme-neutral">NeuroOS Dashboard</CardTitle>
                </div>
                <CardDescription className="secondary-text text-text-secondary-neuro pt-spacing-xs sm:pt-spacing-sm text-base">
                  Your cognitive command center. Manage modules, track progress, and explore new knowledge.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="neuro-layout-sidebar">
                <div className="neuro-sidebar space-y-spacing-lg md:space-y-spacing-xl">
                     <Card data-alignment={guideStyling.dataAlignment} className={cn("neuro-card p-spacing-md", guideStyling.borderColorClass, "border-l-4")}>
                      <CardHeader className="p-0 pb-spacing-xs">
                        <CardTitle className={cn("domain-header flex items-center", guideStyling.titleColor, guideStyling.fontClass)}>
                          {guideCharacter?.avatarUrl && <Image src={guideCharacter.avatarUrl} alt={guideCharacter.name} width={32} height={32} className="rounded-full mr-spacing-xs border-2 border-current" data-ai-hint={`${guideCharacter.name} character`}/>}
                          Your Guide: {guideCharacter?.name || "Neuros"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0"><p className="secondary-text italic leading-relaxed text-sm">{guideCharacter?.description || "Your personal AI guide through the NeuroOS learning experience."}</p></CardContent> 
                    </Card>
                    
                    <Card className="neuro-card neuro-card-law p-spacing-md" data-alignment="law">
                        <CardHeader className="p-0 pb-spacing-xs">
                            <CardTitle className="domain-header text-glow-gold flex items-center">
                                <FileTextIcon size={20} className="mr-spacing-xs text-law-accent-color"/>
                                Personal Codex
                            </CardTitle>
                            <CardDescription className="secondary-text text-sm">Your evolving knowledge architecture.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pt-spacing-sm text-sm text-muted-foreground italic">
                            <p>Review your Sovereign Core principles, track Meta-Integrity, and refine your Personal Constitution. Coming soon!</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="neuro-main-content space-y-spacing-lg md:space-y-spacing-xl">
                    <Tabs defaultValue="library" className="w-full">
                         <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-spacing-lg md:mb-spacing-xl ui-tabs-list p-1.5">
                           <TabsTrigger value="library" className="ui-tabs-trigger py-2.5 text-sm">My Library</TabsTrigger>
                           <TabsTrigger value="explore" className="ui-tabs-trigger py-2.5 text-sm">Explore Modules</TabsTrigger>
                         </TabsList>

                        <TabsContent value="library" className="space-y-spacing-lg md:space-y-spacing-xl">
                             <h3 className="neuro-section-title text-neutral-primary-color font-theme-neutral">Active & Ready</h3>
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                                {activeOrReadyModules.length > 0 ? (
                                    activeOrReadyModules.map(renderModuleCard)
                                ) : (
                                     <Card className="md:col-span-full neuro-card p-spacing-lg md:p-spacing-xl text-center bg-card/50 border-border/30">
                                        <p className="secondary-text italic">No modules currently active or ready. Add some from 'Explore'!</p>
                                    </Card>
                                )}
                            </div>
                              <h3 className="neuro-section-title text-law-primary-color font-theme-law">Completed Modules</h3>
                             <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                                 {installedModules.length > 0 ? (
                                    installedModules.map(renderModuleCard)
                                 ) : (
                                     <Card className="md:col-span-full neuro-card p-spacing-lg md:p-spacing-xl text-center bg-card/50 border-border/30">
                                        <p className="secondary-text italic">No modules completed yet. Keep learning!</p>
                                    </Card>
                                 )}
                             </div>
                        </TabsContent>

                        <TabsContent value="explore" className="space-y-spacing-xl">
                            {renderModuleSection("Core Foundation", exploreCoreModules, getModuleTypeIcon('core'), getAlignmentStyling(exploreCoreModules[0]?.alignmentBias || 'neutral').titleColor, getAlignmentStyling(exploreCoreModules[0]?.alignmentBias || 'neutral').fontClass)}
                            {renderModuleSection("Pillar Modules", explorePillarModules, getModuleTypeIcon('pillar'), getAlignmentStyling(explorePillarModules[0]?.alignmentBias || 'neutral').titleColor || 'text-neutral-primary-color', getAlignmentStyling(explorePillarModules[0]?.alignmentBias || 'neutral').fontClass || 'font-theme-neutral')}
                            {renderModuleSection("Auxiliary: Law Alignment", exploreAuxLaw, getAlignmentStyling('law').icon, getAlignmentStyling('law').titleColor, getAlignmentStyling('law').fontClass)}
                            {renderModuleSection("Auxiliary: Neutral Alignment", exploreAuxNeutral, getAlignmentStyling('neutral').icon, getAlignmentStyling('neutral').titleColor, getAlignmentStyling('neutral').fontClass)}
                            {renderModuleSection("Auxiliary: Chaos Alignment", exploreAuxChaos, getAlignmentStyling('chaos').icon, getAlignmentStyling('chaos').titleColor, getAlignmentStyling('chaos').fontClass)}
                            {renderModuleSection("Challenge Modules", exploreChallengeModules, getModuleTypeIcon('challenge'), getAlignmentStyling(exploreChallengeModules[0]?.alignmentBias || 'neutral').titleColor || 'text-chaos-primary-color', getAlignmentStyling(exploreChallengeModules[0]?.alignmentBias || 'neutral').fontClass || 'font-theme-chaos')}

                            {allExploreModulesEmpty && (
                                 <Card className="md:col-span-full neuro-card p-spacing-lg md:p-spacing-xl text-center bg-card/50 border-border/30">
                                    <p className="secondary-text italic">All available modules are in your library or completed!</p>
                                 </Card>
                             )}
                        </TabsContent>
                    </Tabs>
                </div>

                 <div className="neuro-sidebar space-y-spacing-lg md:space-y-spacing-xl">
                     <Card data-alignment="neutral" className="neuro-card neuro-card-neutral p-spacing-md"> 
                        <CardHeader className="p-0 pb-spacing-xs">
                            <CardTitle className="domain-header text-glow-cyan font-theme-neutral flex items-center">
                            <Orbit className="mr-spacing-sm text-neutral-accent-color"/> Action Center
                            </CardTitle>
                             <CardDescription className="secondary-text text-text-secondary-neuro pt-spacing-xs text-sm">Expand your cognitive horizons.</CardDescription> 
                        </CardHeader>
                        <CardContent className="space-y-spacing-sm p-0 pt-spacing-sm">
                            <Button 
                                variant="default" 
                                onClick={() => setCurrentInteraction('status_viewing')} 
                                className="w-full justify-start text-left font-medium text-sm py-2.5 px-3 whitespace-normal h-auto bg-neutral-surface-color hover:bg-neutral-primary-color/20 text-white"
                            >
                                <Activity size={16} className="mr-spacing-sm flex-shrink-0 text-neutral-accent-color" />
                                <div>
                                    <span className="font-semibold text-white text-glow-cyan">Profile & Progress</span>
                                    <p className="text-xs text-white/80 mt-0.5">View your detailed profile and learning progress</p>
                                </div>
                            </Button>
                            
                            <Button 
                                variant="default" 
                                onClick={() => setCurrentInteraction('reviewing')} 
                                className="w-full justify-start text-left font-medium text-sm py-2.5 px-3 whitespace-normal h-auto bg-neutral-surface-color hover:bg-neutral-primary-color/20 text-white"
                                disabled={!hasStandardReviewNodes && !hasManualReviewNodes}
                            >
                                <BookCheck size={16} className="mr-spacing-sm flex-shrink-0 text-law-accent-color" />
                                <div>
                                    <span className="font-semibold text-white text-glow-gold">Knowledge Review</span>
                                    <p className="text-xs text-white/80 mt-0.5">Strengthen memories with spaced repetition</p>
                                </div>
                            </Button>
                            
                            <Button 
                                variant="default" 
                                onClick={() => setCurrentInteraction('chronicle')} 
                                className="w-full justify-start text-left font-medium text-sm py-2.5 px-3 whitespace-normal h-auto bg-neutral-surface-color hover:bg-neutral-primary-color/20 text-white"
                                disabled={!hasAnyInstalledModules}
                            >
                                <Swords size={16} className="mr-spacing-sm flex-shrink-0 text-chaos-accent-color" />
                                <div>
                                    <span className="font-semibold text-white text-glow-red">Neuroverse Adventures</span>
                                    <p className="text-xs text-white/80 mt-0.5">Test your knowledge in interactive scenarios</p>
                                </div>
                            </Button>
                            
                            <Button 
                                variant="default" 
                                onClick={() => setCurrentInteraction('diagnosing')} 
                                className="w-full justify-start text-left font-medium text-sm py-2.5 px-3 whitespace-normal h-auto bg-neutral-surface-color hover:bg-neutral-primary-color/20 text-white"
                            >
                                <TestTube size={16} className="mr-spacing-sm flex-shrink-0 text-primary" />
                                <div>
                                    <span className="font-semibold text-white text-glow-purple">Diagnostics</span>
                                    <p className="text-xs text-white/80 mt-0.5">Analyze your cognitive patterns</p>
                                </div>
                            </Button>
                            
                            <Button 
                                variant="default" 
                                onClick={() => setCurrentInteraction('admin')} 
                                className="w-full justify-start text-left font-medium text-sm py-2.5 px-3 whitespace-normal h-auto bg-neutral-surface-color hover:bg-neutral-primary-color/20 text-white"
                            >
                                <Settings size={16} className="mr-spacing-sm flex-shrink-0 text-neutral-accent-color" />
                                <div>
                                    <span className="font-semibold text-white text-glow-cyan">System Admin</span>
                                    <p className="text-xs text-white/80 mt-0.5">Manage modules and system settings</p>
                                </div>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </div>
        );
      case 'learning':
        if (!currentModule || !currentNode) {
          return (
             <div className="neuro-container neuro-fade-in flex items-center justify-center min-h-[calc(100vh-10rem)]">
               <Card className="neuro-card neuro-card-chaos max-w-md mx-auto shadow-lg p-spacing-md" data-alignment="chaos">
                 <CardHeader>
                   <CardTitle className="phase-header text-chaos-primary-color font-theme-chaos flex items-center justify-center gap-spacing-sm">
                      <AlertTriangle/> Loading Session...
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="secondary-text text-chaos-text-on-surface-color mb-spacing-sm text-base">Preparing the learning environment. If this persists, try resetting.</p>
                   <Button variant="destructive" onClick={resetSession} className="btn-chaos neuro-button text-sm">Cancel & Reset</Button>
                 </CardContent>
               </Card>
             </div>
          );
        }
        return (
          <div className="neuro-container neuro-fade-in space-y-spacing-lg">
            <ProgressBar module={currentModule} progress={progress} />
            <NodeDisplay
              node={currentNode}
              phase={progress.currentPhase}
              probeQuestions={probeQuestions}
              isLoadingProbe={isLoading && currentEpicStep === 'probe'}
              isLoadingEvaluation={isLoading}
              evaluationResult={evaluationResult}
              currentEpicStep={currentEpicStep}
              currentInteraction={currentInteraction}
              onFetchProbe={fetchProbeQuestions}
              onSubmitRecall={submitRecallResponse}
              onSubmitEpic={submitEpicResponse}
              onProceedAfterSuccess={handleProceedAfterSuccess}
              clearEvaluationResult={clearEvaluationResult}
              moduleTags={currentModule.tags}
              activeModule={currentModule}
              isListening={isListening}
              isLoadingSTT={isLoadingSTT}
              startRecording={startLocalRecording}
              stopRecording={stopLocalRecording}
              setVoiceTranscriptTarget={setVoiceTranscriptTarget}
              isVoiceModeActive={isVoiceModeActive}
            />
             <div className="flex justify-end mt-spacing-lg">
                 <Button variant="outline" onClick={resetSession} className="neuro-button border-destructive text-destructive hover:bg-destructive/10 text-sm">End Learning Session</Button>
             </div>
          </div>
        );
       case 'chronicle':
         if (isLoadingChronicle && (!activeChronicleRun || !activeChronicleRun.currentDungeon || detailedLoadingProgress.dungeonData.status !== 'success')) {
            return (
                <DungeonLoadingScreen
                    loadingState={detailedLoadingProgress}
                    onRetry={() => retryDungeonLoad(activeChronicleRun?.dungeonId)}
                    onExit={() => {endChronicleRun(); setCurrentInteraction('initial');}}
                    dungeonName={activeChronicleRun?.currentDungeon?.name || "Selected Dungeon"}
                />
            );
         }
         return (
           <ChronicleDisplay
                availableDungeons={availableDungeons}
                activeRun={activeChronicleRun}
                isLoading={isLoadingChronicle}
                detailedLoadingProgress={detailedLoadingProgress}
                onRetryLoad={retryDungeonLoad}
                evaluationResult={evaluationResult}
                hasInstalledModules={hasAnyInstalledModules}
                guideCharacterId={selectedGuideId}
                guideCharacter={guideCharacter}
                onStartRun={startChronicleRun}
                onSubmitEncounterResponse={submitChronicleEncounterResponse}
                onPlayerCombatAction={onPlayerCombatAction}
                onEndRun={() => {endChronicleRun(); setCurrentInteraction('initial');}}
                onExit={() => setCurrentInteraction('initial')}
                clearEvaluationResult={clearEvaluationResult}
                onMovePlayer={movePlayer}
                onInteractWithTile={interactWithTile}
                playerCharacterBase={playerCharacterBase}
                allModules={userModules}
           />
         );
      case 'admin':
        return (
          <div className="neuro-container neuro-fade-in py-spacing-lg">
            <AdminPanel
                modules={userModules}
                onSetModuleStatus={admin_setModuleStatus}
                onRemoveModule={admin_removeModuleFromLibrary}
                onMarkAllInstalledNodesForReview={admin_markAllInstalledNodesForReview}
                onExit={() => setCurrentInteraction('initial')}
            />
          </div>
        );
      case 'reviewing':
        return (
            <div className="neuro-container neuro-fade-in py-spacing-lg">
                <ReviewScreen
                    onExit={() => setCurrentInteraction('initial')}
                />
            </div>
        );
      case 'diagnosing':
        return (
            <div className="neuro-container neuro-fade-in py-spacing-lg">
                <DiagnosticsScreen
                    modules={userModules}
                    onExit={() => setCurrentInteraction('initial')}
                />
            </div>
        );
      case 'status_viewing':
        return (
             <div className="neuro-container neuro-fade-in py-spacing-lg">
                <StatusScreen
                    modules={userModules}
                    playerCharacter={playerCharacterBase}
                    chronicleRuns={[]} 
                    onExit={() => setCurrentInteraction('initial')}
                />
            </div>
        );
      case 'reading':
        if (!activeReadingSession || !currentModule || !currentNode || !currentDomain ) {
            return (
                <div className="neuro-container neuro-fade-in text-center text-destructive py-spacing-lg">Error: Could not load reading content.</div>
            );
        }
        return (
            // Ensure ReadingModeDisplay takes currentDomainIndex and currentNodeIndex as props
             <div className="max-w-full"> 
                <ReadingModeDisplay
                    module={currentModule}
                    currentDomain={currentDomain}
                    currentNode={currentNode}
                    currentDomainIndex={currentDomainIndex} // Pass the derived index
                    currentNodeIndex={currentNodeIndex}   // Pass the derived index
                    onNavigate={navigateReadingMode}
                    onExit={exitReadingMode}
                    onStartModule={startModule}
                    speakText={speakText}
                    generateNodeDialogue={generateNodeDialogueInternal}
                    isSpeaking={isSpeaking}
                    isLoadingTTS={isLoadingTTS}
                    isLoadingDialogue={isLoadingDialogue}
                    stopSpeaking={stopSpeaking}
                    isVoiceModeActive={isVoiceModeActive}
                    allAiCharacters={allAiCharacters}
                    guideCharacter={guideCharacter}
                />
            </div>
        );
      case 'finished':
        const finishedModuleId = progress?.currentModuleId;
        const finishedModule = finishedModuleId ? userModules[finishedModuleId] : null;
        return (
           <div className="neuro-container neuro-fade-in">
            <Card className="neuro-card max-w-lg mx-auto shadow-lg p-spacing-md" data-alignment="law">
               <CardHeader>
                 <CardTitle className="phase-header text-law-primary-color font-theme-law flex items-center justify-center gap-spacing-sm">
                    <CheckCircle className="text-law-accent-color" size={32}/>
                    {finishedModule ? 'Module Complete!' : 'Session Ended'}
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-spacing-md">
                  {finishedModule && (
                      <p className="text-lg text-text-primary-neuro">Congratulations on completing the module: <span className="font-semibold text-law-primary-color">{finishedModule.title}</span></p>
                  )}
                  <p className="secondary-text text-text-secondary-neuro text-base">You have returned to the Dashboard. What's next on your cognitive journey?</p>
                 <Button onClick={() => setCurrentInteraction('initial')} variant="law" size="lg" className="btn-law text-base py-3 px-6">
                    <CornerRightUp className="mr-spacing-xs"/> Back to Dashboard
                 </Button>
               </CardContent>
            </Card>
           </div>
        );
      default:
        console.error("Unexpected interaction state:", currentInteraction);
        setCurrentInteraction('initial');
        return (
             <div className="neuro-container neuro-fade-in">
               <Card className="neuro-card max-w-md mx-auto shadow-lg p-spacing-md" data-alignment="chaos">
                 <CardHeader>
                   <CardTitle className="phase-header text-chaos-primary-color font-theme-chaos flex items-center justify-center gap-spacing-sm">
                      <AlertTriangle/> System Error
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="secondary-text text-chaos-text-on-surface-color mb-spacing-md text-base">An unexpected error occurred. Returning to Dashboard.</p>
                   <Button variant="destructive" onClick={() => setCurrentInteraction('initial')} className="btn-chaos text-sm py-2.5">Go to Dashboard</Button>
                 </CardContent>
               </Card>
             </div>
          );
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <main className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
        {renderContent()}
      </main>
    </TooltipProvider>
  );
}
