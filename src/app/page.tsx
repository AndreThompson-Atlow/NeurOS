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
import { InfiniteKnowledgeExplorer } from '@/components/neuro/InfiniteKnowledgeExplorer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertTriangle, Loader2, Swords, Settings, CheckCircle, CornerRightUp, User as UserIconLucide, BookCheck, Activity, BarChart3, Compass, Library, Voicemail, Mic, MicOff, Volume2, VolumeX, MessageSquare, Map as MapIconLucide, Zap, Shield, Brain, Lightbulb, Link as LinkIconLucide, Search, Orbit, HelpCircle, FileText, ListTree, PackageSearch, Microscope, TestTube, Rocket, TrendingUp, Layers, Users as UsersIcon, FileTextIcon } from 'lucide-react';
import type { Character } from '@/types/characterTypes';
import { getAllCharacters, getCharacterById } from '@/lib/server/characters';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ReadingModeDisplay } from '@/components/neuro/ReadingModeDisplay';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateReadingDialogue as generateReadingDialogueFlow } from '@/ai/flows/generateReadingDialogueFlow';
import type { GenerateReadingDialogueOutput, GenerateReadingDialogueInput, DialogueTurn as GenkitDialogueTurn } from '@/ai/flows/types/generateReadingDialogueTypes';
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
    hasInstalledModules,
    currentModule,
    currentNode,
    currentDomain,
    currentDomainIndex, 
    currentNodeIndex, 
    progress,
    isLoading,
    isLoadingCustom,
    isLoadingChronicle,
    detailedLoadingProgress,
    probeQuestions,
    currentInteraction,
    evaluationResult,
    currentEpicStep,
    activeChronicleRun,
    addModuleToLibrary,
    startModule,
    createCustomModule,
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
  const [selectedGuideId, setSelectedGuideId] = useState<string>('neuros');
  const [guideCharacter, setGuideCharacter] = useState<Character | null>(null);
  const [isLoadingDialogue, setIsLoadingDialogue] = useState(false);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);


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
    previousDialogueTurns?: GenkitDialogueTurn[]
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


  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim() && !isLoadingCustom) {
      createCustomModule(customTopic.trim());
      setCustomTopic('');
      setShowCustomInput(false);
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
      <div className="mb-spacing-xl">
        <h3 className={`module-title ${titleColorClass || alignmentProps.titleColor} ${titleFontClass || alignmentProps.fontClass} border-b border-divider-neuro pb-spacing-sm mb-spacing-lg flex items-center`}>
          {icon && <span className="mr-spacing-sm">{icon}</span>}
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-spacing-lg">
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
    if (isLoadingCustom && currentInteraction === 'initial') {
        return (
           <div className="container mx-auto px-spacing-md md:px-spacing-lg text-center flex items-center justify-center min-h-[calc(100vh-10rem)] py-spacing-lg">
             <Card className="max-w-md mx-auto shadow-lg p-spacing-md" data-alignment="law">
                <CardHeader>
                  <CardTitle className="text-2xl font-theme-law text-law-primary-color flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-law-accent-color" /> Generating Custom Module...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary-neuro mb-spacing-sm">Please wait while the AI structures your learning content. This may take a moment.</p>
                   <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-law-primary-color animate-pulse" style={{ width: '100%', animationDuration: '2s' }}></div>
                    </div>
                </CardContent>
             </Card>
           </div>
        );
    }


    switch (currentInteraction) {
      case 'initial':
        const guideAlignment = guideCharacter?.alignment || 'neutral';
        const guideStyling = getAlignmentStyling(guideAlignment);

        return (
          <div className="container mx-auto px-spacing-sm md:px-spacing-lg py-spacing-md md:py-spacing-lg space-y-spacing-lg max-w-full">
             <Card data-alignment="neutral" className="w-full mb-spacing-lg md:mb-spacing-xl p-spacing-md sm:p-spacing-lg">
              <CardHeader className="pb-spacing-sm sm:pb-spacing-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-spacing-sm">
                  <CardTitle className="module-title text-glow-cyan font-theme-neutral">NeuroOS Dashboard</CardTitle>
                  <div className="flex flex-wrap gap-spacing-sm items-center self-start sm:self-center">
                    <Button onClick={toggleVoiceMode} variant={isVoiceModeActive ? "default" : "outline"} size="sm" className={`self-end h-9 text-sm ${isVoiceModeActive ? 'btn-neutral' : 'border-neutral-border-color text-neutral-primary-color hover:bg-neutral-surface-color'}`}>
                        <Voicemail className="mr-2 h-4 w-4"/> {isVoiceModeActive ? "Voice ON" : "Voice OFF"}
                    </Button>
                     <Select value={selectedGuideId} onValueChange={setSelectedGuideId}>
                        <SelectTrigger id="guide-select" className="w-[180px] h-9 text-sm ui-select-trigger">
                            <SelectValue placeholder="Select Guide" />
                        </SelectTrigger>
                        <SelectContent className="ui-select-content">
                            {allAiCharacters.map(char => (
                                <SelectItem key={char.id} value={char.id} className="text-sm ui-select-item">
                                    {char.name} ({char.alignment})
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <CardDescription className="secondary-text text-text-secondary-neuro pt-spacing-xs sm:pt-spacing-sm text-base">
                  Your cognitive command center. Manage modules, track progress, and explore new knowledge.
                </CardDescription>
              </CardHeader>
               {isVoiceModeActive && voiceTranscript && (
                <CardContent className="pt-spacing-xs pb-spacing-xs border-t border-divider-neuro">
                    <p className="text-sm text-text-tertiary-neuro">Last transcript: <span className="italic text-foreground/80">{voiceTranscript}</span></p>
                </CardContent>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-spacing-lg md:gap-spacing-xl">
                <div className="lg:col-span-3 space-y-spacing-lg md:space-y-spacing-xl">
                     <Card data-alignment={guideStyling.dataAlignment} className={cn("dashboard-widget p-spacing-md", guideStyling.borderColorClass, "border-l-4")}>
                      <CardHeader className="p-0 pb-spacing-xs">
                        <CardTitle className={cn("domain-header flex items-center", guideStyling.titleColor, guideStyling.fontClass)}>
                          {guideCharacter?.avatarUrl && <Image src={guideCharacter.avatarUrl} alt={guideCharacter.name} width={32} height={32} className="rounded-full mr-spacing-xs border-2 border-current" data-ai-hint={`${guideCharacter.name} character`}/>}
                          Your Guide: {guideCharacter?.name || "Selected Guide"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0"><p className="secondary-text italic leading-relaxed text-sm">{guideCharacter?.description || "Select a guide to assist your journey."}</p></CardContent> 
                    </Card>
                    {/* Moved Core Activities here, above other nav buttons */}
                    <Card data-alignment="neutral" className="dashboard-widget p-spacing-md">
                         <CardHeader className="p-0 pb-spacing-xs">
                            <CardTitle className="domain-header text-glow-cyan font-theme-neutral flex items-center">
                             <Activity className="mr-spacing-sm text-neutral-accent-color"/> Core Activities
                            </CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-spacing-sm p-0 pt-spacing-sm">
                            <Button 
                                variant="secondary" 
                                onClick={() => setCurrentInteraction('reviewing')} 
                                className={cn("w-full justify-start text-left text-sm py-2.5 px-3", getAlignmentStyling('neutral').buttonClass, "hover:bg-neutral-primary-color/80 whitespace-normal h-auto")}
                                disabled={!hasStandardReviewNodes && !hasManualReviewNodes}
                            >
                                <BookCheck className="mr-spacing-xs flex-shrink-0"/> Review Due Nodes
                            </Button>
                            <Button variant="secondary" onClick={() => setCurrentInteraction('chronicle')} className={cn("w-full justify-start text-left text-sm py-2.5 px-3", getAlignmentStyling('chaos').buttonClass, "hover:bg-chaos-primary-color/80 whitespace-normal h-auto")}>
                                <Swords className="mr-spacing-xs flex-shrink-0"/> Explore Neuroverse
                            </Button>
                         </CardContent>
                    </Card>

                    <div className="space-y-spacing-sm md:space-y-spacing-md pt-spacing-md border-t border-divider-neuro">
                        <Link href="/cognitive-map" passHref>
                          <Button variant="outline" className={cn("w-full justify-start text-left text-sm py-3 px-3", getAlignmentStyling('law').borderColorClass, "text-law-primary-color hover:bg-law-surface-color hover:text-law-primary-color/80 border-2 hover:scale-[1.01] whitespace-normal h-auto")}>
                            <MapIconLucide className="mr-spacing-xs flex-shrink-0"/>Cognitive Map
                          </Button>
                        </Link>
                        <Link href="/learning-journey" passHref>
                           <Button variant="outline" className={cn("w-full justify-start text-left text-sm py-3 px-3", getAlignmentStyling('chaos').borderColorClass, "text-chaos-primary-color hover:bg-chaos-surface-color hover:text-chaos-primary-color/80 border-2 hover:scale-[1.01] whitespace-normal h-auto")}>
                            <TrendingUp className="mr-spacing-xs flex-shrink-0"/>Learning Journey
                          </Button>
                        </Link>
                        <Link href="/memory-strength" passHref>
                           <Button variant="outline" className={cn("w-full justify-start text-left text-sm py-3 px-3", getAlignmentStyling('neutral').borderColorClass, "text-neutral-primary-color hover:bg-neutral-surface-color hover:text-neutral-primary-color/80 border-2 hover:scale-[1.01] whitespace-normal h-auto")}>
                            <Layers className="mr-spacing-xs flex-shrink-0"/>Memory Strength
                          </Button>
                        </Link>
                    </div>
                </div>
                
                <div className="lg:col-span-6 space-y-spacing-lg md:space-y-spacing-xl">
                    <Tabs defaultValue="library" className="w-full">
                         <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-spacing-lg md:mb-spacing-xl ui-tabs-list p-1.5">
                           <TabsTrigger value="library" className="ui-tabs-trigger py-2.5 text-sm">My Library</TabsTrigger>
                           <TabsTrigger value="explore" className="ui-tabs-trigger py-2.5 text-sm">Explore Modules</TabsTrigger>
                           <TabsTrigger value="custom" className="ui-tabs-trigger py-2.5 text-sm">Create Custom</TabsTrigger>
                         </TabsList>

                        <TabsContent value="library" className="space-y-spacing-lg md:space-y-spacing-xl">
                             <h3 className="module-title text-neutral-primary-color font-theme-neutral border-b border-divider-neuro pb-spacing-sm mb-spacing-md">Active & Ready</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg md:gap-spacing-xl">
                                {activeOrReadyModules.length > 0 ? (
                                    activeOrReadyModules.map(renderModuleCard)
                                ) : (
                                     <Card className="md:col-span-full p-spacing-lg md:p-spacing-xl text-center bg-card/50 border-border/30">
                                        <p className="secondary-text italic">No modules currently active or ready. Add some from 'Explore'!</p>
                                    </Card>
                                )}
                            </div>
                              <h3 className="module-title text-law-primary-color font-theme-law border-b border-divider-neuro pb-spacing-sm mt-spacing-xl mb-spacing-md">Completed Modules</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg md:gap-spacing-xl">
                                 {installedModules.length > 0 ? (
                                    installedModules.map(renderModuleCard)
                                 ) : (
                                     <Card className="md:col-span-full p-spacing-lg md:p-spacing-xl text-center bg-card/50 border-border/30">
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
                                 <Card className="md:col-span-full p-spacing-lg md:p-spacing-xl text-center bg-card/50 border-border/30">
                                    <p className="secondary-text italic">All available modules are in your library or completed!</p>
                                 </Card>
                             )}
                        </TabsContent>

                        <TabsContent value="custom">
                           <Card className="max-w-lg mx-auto shadow-cyan-md p-spacing-lg md:p-spacing-xl" data-alignment="law">
                             <CardHeader className="pb-spacing-md md:pb-spacing-lg">
                               <CardTitle className="module-title text-law-primary-color font-theme-law">Create a Custom Module</CardTitle>
                               <CardDescription className="secondary-text">Enter a topic, and NeuroOS will forge a personalized learning module.</CardDescription>
                             </CardHeader>
                             <CardContent>
                               {showCustomInput ? (
                                 <form onSubmit={handleCustomSubmit} className="space-y-spacing-md md:space-y-spacing-lg">
                                   <div className="space-y-spacing-sm">
                                     <Label htmlFor="custom-topic" className="text-text-secondary-neuro">Learning Topic</Label>
                                     <Input
                                       id="custom-topic"
                                       type="text"
                                       value={customTopic}
                                       onChange={(e) => setCustomTopic(e.target.value)}
                                       placeholder="e.g., Quantum Entanglement, Stoic Philosophy"
                                       required
                                       className="ui-input"
                                       disabled={isLoadingCustom}
                                     />
                                   </div>
                                   <div className="flex gap-spacing-md">
                                     <Button type="submit" variant="law" className="flex-1 btn-law" disabled={isLoadingCustom || !customTopic.trim()}>
                                       {isLoadingCustom ? (
                                         <>
                                           <Loader2 className="mr-spacing-xs h-4 w-4 animate-spin" /> Generating...
                                         </>
                                       ) : (
                                         <><Rocket className="mr-spacing-xs"/>Generate Module</>
                                       )}
                                     </Button>
                                     <Button variant="outline" onClick={() => setShowCustomInput(false)} disabled={isLoadingCustom} className="border-law-border-color text-law-primary-color hover:bg-law-surface-color">
                                       Cancel
                                     </Button>
                                   </div>
                                 </form>
                               ) : (
                                 <Button onClick={() => setShowCustomInput(true)} variant="law" className="w-full btn-law" disabled={isLoadingCustom}>
                                  <Rocket className="mr-2"/> Enter Topic to Generate
                                 </Button>
                               )}
                               <p className="text-xs text-text-tertiary-neuro mt-5 text-center">Note: AI generation may take a moment. Be specific with your topic for best results.</p>
                             </CardContent>
                           </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                 <div className="lg:col-span-3 space-y-spacing-lg md:space-y-spacing-xl">
                     <Card data-alignment="neutral" className="dashboard-widget p-spacing-md"> 
                        <CardHeader className="p-0 pb-spacing-xs">
                            <CardTitle className="domain-header text-glow-cyan font-theme-neutral flex items-center">
                            <Orbit className="mr-spacing-sm text-neutral-accent-color"/> Action Center
                            </CardTitle>
                             <CardDescription className="secondary-text text-text-secondary-neuro pt-spacing-xs text-sm">Expand your cognitive horizons.</CardDescription> 
                        </CardHeader>
                        <CardContent className="space-y-spacing-sm p-0 pt-spacing-sm">
                             <Button variant="secondary" onClick={() => setCurrentInteraction('explore_infinite')} className={cn("w-full justify-start text-left text-sm py-2.5 px-3 whitespace-normal h-auto", getAlignmentStyling('neutral').buttonClass, "hover:bg-neutral-primary-color/80")}>
                                <Compass className="mr-spacing-xs flex-shrink-0"/> Infinite Knowledge Explorer
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="dashboard-widget p-spacing-md" data-alignment="neutral">
                        <CardHeader className="p-0 pb-spacing-xs">
                            <CardTitle className="domain-header text-glow-cyan flex items-center">
                                <UsersIcon size={20} className="mr-spacing-xs text-neutral-accent-color"/>
                                Community Hub (Placeholder)
                            </CardTitle>
                            <CardDescription className="secondary-text text-sm">Connect with other NeuroOS users.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pt-spacing-sm text-sm text-muted-foreground italic">
                            <p>Share learning paths, discuss insights, and collaborate on Chronicle challenges. Coming soon!</p>
                        </CardContent>
                    </Card>
                     <Card className="dashboard-widget p-spacing-md" data-alignment="law">
                        <CardHeader className="p-0 pb-spacing-xs">
                            <CardTitle className="domain-header text-glow-gold flex items-center">
                                <FileTextIcon size={20} className="mr-spacing-xs text-law-accent-color"/>
                                Personal Codex (Placeholder)
                            </CardTitle>
                             <CardDescription className="secondary-text text-sm">Your evolving knowledge architecture.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pt-spacing-sm text-sm text-muted-foreground italic">
                            <p>Review your Sovereign Core principles, track Meta-Integrity, and refine your Personal Constitution. Coming soon!</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="flex flex-wrap gap-spacing-md items-center justify-end pt-spacing-lg md:pt-spacing-xl border-t border-divider-neuro mt-spacing-lg md:mt-spacing-xl">
                <Button variant="outline" onClick={() => setCurrentInteraction('diagnosing')} className="border-neutral-border-color text-neutral-primary-color hover:bg-neutral-surface-color text-sm py-2.5 px-4">
                    <Activity className="mr-spacing-sm" /> Diagnostics
                </Button>
                 <Button variant="outline" onClick={() => setCurrentInteraction('status_viewing')} className="border-neutral-border-color text-neutral-primary-color hover:bg-neutral-surface-color text-sm py-2.5 px-4">
                    <BarChart3 className="mr-spacing-sm" /> View Status
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentInteraction('admin')} title="Admin Panel" className="border-neutral-border-color text-neutral-primary-color hover:bg-neutral-surface-color h-10 w-10">
                    <Settings />
                </Button>
            </div>
          </div>
        );
      case 'learning':
        if (!currentModule || !currentNode) {
          return (
             <div className="container mx-auto px-spacing-md md:px-spacing-lg text-center flex items-center justify-center min-h-[calc(100vh-10rem)] py-spacing-lg">
               <Card className="max-w-md mx-auto shadow-lg p-spacing-md" data-alignment="chaos">
                 <CardHeader>
                   <CardTitle className="phase-header text-chaos-primary-color font-theme-chaos flex items-center justify-center gap-spacing-sm">
                      <AlertTriangle/> Loading Session...
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="secondary-text text-chaos-text-on-surface-color mb-spacing-sm text-base">Preparing the learning environment. If this persists, try resetting.</p>
                   <Button variant="destructive" onClick={resetSession} className="btn-chaos text-sm py-2.5">Cancel & Reset</Button>
                 </CardContent>
               </Card>
             </div>
          );
        }
        return (
          <div className="container mx-auto px-spacing-md md:px-spacing-lg py-spacing-lg space-y-spacing-lg">
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
                 <Button variant="outline" onClick={resetSession} className="border-destructive text-destructive hover:bg-destructive/10 text-sm py-2.5">End Learning Session</Button>
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
                hasInstalledModules={hasInstalledModules}
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
          <div className="container mx-auto px-spacing-md md:px-spacing-lg py-spacing-lg">
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
            <div className="container mx-auto px-spacing-md md:px-spacing-lg py-spacing-lg">
                <ReviewScreen
                    currentInteraction={currentInteraction}
                    onExit={() => setCurrentInteraction('initial')}
                />
            </div>
        );
      case 'diagnosing':
        return (
            <div className="container mx-auto px-spacing-md md:px-spacing-lg py-spacing-lg">
                <DiagnosticsScreen
                    modules={userModules}
                    onExit={() => setCurrentInteraction('initial')}
                />
            </div>
        );
      case 'status_viewing':
        return (
             <div className="container mx-auto px-spacing-md md:px-spacing-lg py-spacing-lg">
                <StatusScreen
                    modules={userModules}
                    playerCharacter={playerCharacterBase}
                    chronicleRuns={[]} 
                    onExit={() => setCurrentInteraction('initial')}
                />
            </div>
        );
      case 'explore_infinite':
        return (
          <div className="container mx-auto px-spacing-md md:px-spacing-lg py-spacing-lg">
            <InfiniteKnowledgeExplorer
                onAddModuleToLibrary={addModuleToLibrary}
                onExit={() => setCurrentInteraction('initial')}
            />
          </div>
        );
      case 'reading':
        if (!activeReadingSession || !currentModule || !currentNode || !currentDomain ) {
            return (
                <div className="container mx-auto px-spacing-md md:px-spacing-lg text-center text-destructive py-spacing-lg">Error: Could not load reading content.</div>
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
           <div className="container mx-auto px-spacing-md md:px-spacing-lg text-center flex items-center justify-center min-h-[calc(100vh-10rem)] py-spacing-lg">
            <Card className="max-w-lg mx-auto shadow-lg p-spacing-md" data-alignment="law">
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
             <div className="container mx-auto px-spacing-md md:px-spacing-lg text-center flex items-center justify-center min-h-[calc(100vh-10rem)] py-spacing-lg">
               <Card className="max-w-md mx-auto shadow-lg p-spacing-md" data-alignment="chaos">
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
