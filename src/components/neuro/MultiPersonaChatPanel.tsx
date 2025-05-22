'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Module, Domain, Node as NeuroNode } from '@/types/neuro';
import type { Character } from '@/types/characterTypes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, MessageSquare, Send, CornerDownLeft, AlertCircle } from 'lucide-react';
import { getAlignmentStyling } from './utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { GenerateReadingDialogueInput, GenerateReadingDialogueOutput } from '@/ai/flows/types/generateReadingDialogueTypes'; 
import { cn } from '@/lib/utils';

/**
 * Interface for a dialogue turn in the chat
 */
interface DialogueTurn { 
  characterId: string;
  characterName: string;
  characterAvatar?: string;
  characterAlignment?: 'law' | 'chaos' | 'neutral';
  message: string;
  timestamp?: number; // Add timestamp for sorting
}

/**
 * Interface for the component props
 */
interface MultiPersonaChatPanelProps {
  currentNode: NeuroNode;
  module: Module;
  currentDomain: Domain;
  allAiCharacters: Character[];
  guideCharacter: Character | null;
  generateNodeDialogue: (
    node: NeuroNode,
    module: Module,
    domain: Domain, 
    personalities: string[],
    previousDialogue?: {characterId: string, message: string}[] 
  ) => Promise<GenerateReadingDialogueOutput>;
  isLoadingDialogue: boolean;
}

// Storage key for the chat history
const CHAT_HISTORY_STORAGE_KEY = 'neuroOS_chat_history';

/**
 * Creates dynamic conversation starters based on the current node and characters
 */
const getInitialDialogueStarters = (
    node: NeuroNode,
    guide: Character | null,
    domain: Domain,
    allChars: Character[], 
    moduleId: string
): DialogueTurn[] => {
    const starters: DialogueTurn[] = [];
    const involvedCharacterIds = new Set<string>();
    const now = Date.now();

    // Add guide character message
    if (guide) {
        starters.push({
            characterId: guide.id,
            characterName: guide.name,
            characterAvatar: guide.avatarUrl,
            characterAlignment: guide.alignment,
            message: `Welcome to the discussion about "${node.title}". This is where we can explore this concept in depth. What aspects are you most curious about?`,
            timestamp: now
        });
        involvedCharacterIds.add(guide.id);
    }
    
    // Add domain-affinity character message
    const domainChars = domain.characterAffinities || [];
    const availableDomainChars = allChars && allChars.length > 0 
        ? domainChars.filter(id => !involvedCharacterIds.has(id) && allChars.some(c=>c.id === id))
        : [];
    if (availableDomainChars.length > 0 && starters.length < 2) { 
        const charId = availableDomainChars[Math.floor(Math.random() * availableDomainChars.length)];
        const charDetails = allChars.find(c => c.id === charId);
        if (charDetails) {
            starters.push({
                characterId: charDetails.id,
                characterName: charDetails.name,
                characterAvatar: charDetails.avatarUrl,
                characterAlignment: charDetails.alignment,
                message: `I find "${node.title}" particularly interesting when we consider its relation to ${domain.title}. The concept of "${node.keyTerms.length > 0 ? node.keyTerms[0] : 'its core idea'}" is especially important here.`,
                timestamp: now + 100
            });
            involvedCharacterIds.add(charDetails.id);
        }
    }
    
    // Add specter/antagonist character message
    const specterTypes = domain.specterAffinities || [];
    const potentialDialogueSpecters = allChars && allChars.length > 0
        ? allChars.filter(c => 
            specterTypes.includes(c.id) && 
            !involvedCharacterIds.has(c.id) && 
            (c.type === 'antagonist' || c.alignment === 'chaos') 
          )
        : [];

    if (potentialDialogueSpecters.length > 0 && starters.length < 3) {
        const specter = potentialDialogueSpecters[Math.floor(Math.random() * potentialDialogueSpecters.length)];
        starters.push({
            characterId: specter.id,
            characterName: specter.name,
            characterAvatar: specter.avatarUrl,
            characterAlignment: specter.alignment,
            message: `I must challenge your thinking on "${node.title}". Many learners fall into the trap of ${specterTypes.includes('certainty-specter') ? 'false certainty' : 'oversimplification'}. What assumptions have you already made about this concept?`,
            timestamp: now + 200
        });
        involvedCharacterIds.add(specter.id);
    }

    // Fallback if no characters are available
    if (starters.length === 0 && allChars && allChars.length > 0) { 
        const fallbackChar = allChars.find(c=> c.id === 'neuros') || allChars[0];
        starters.push({
            characterId: fallbackChar.id,
            characterName: fallbackChar.name,
            characterAvatar: fallbackChar.avatarUrl,
            characterAlignment: fallbackChar.alignment,
            message: `Welcome to our exploration of "${node.title}". This concept focuses on ${node.shortDefinition.toLowerCase()}. What questions or thoughts do you have?`,
            timestamp: now
        });
    } else if (starters.length === 0) {
         starters.push({
            characterId: 'system_narrator',
            characterName: 'Narrator',
            characterAlignment: 'neutral',
            message: `Begin your exploration of "${node.title}".`,
            timestamp: now
        });
    }

    return starters;
};

/**
 * MultiPersonaChatPanel component - Provides an interactive chat interface for discussing concepts
 */
export function MultiPersonaChatPanel({
  currentNode,
  module,
  currentDomain,
  allAiCharacters,
  guideCharacter,
  generateNodeDialogue,
  isLoadingDialogue: initialIsLoadingDialogue
}: MultiPersonaChatPanelProps) {
  const [chatHistory, setChatHistory] = useState<DialogueTurn[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(initialIsLoadingDialogue);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Retrieves character details from the available characters
  const getCharacterDetails = (characterId: string): Character | undefined => {
    return allAiCharacters.find(c => c.id === characterId) || (guideCharacter?.id === characterId ? guideCharacter : undefined);
  };

  // Load chat history from localStorage on initial render
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const storageKey = `${CHAT_HISTORY_STORAGE_KEY}_${module.id}`;
      const savedChatHistoryString = localStorage.getItem(storageKey);
      
      if (savedChatHistoryString) {
        // Parse the saved chat history
        const savedChatHistory = JSON.parse(savedChatHistoryString) as {
          moduleId: string;
          domainId: string;
          nodeId: string;
          history: DialogueTurn[];
        };
        
        // If chat history exists for this module
        if (savedChatHistory.moduleId === module.id) {
          if (savedChatHistory.nodeId === currentNode.id) {
            // Use the existing chat history for this node
            setChatHistory(savedChatHistory.history);
            setIsInitialized(true);
          } else {
            // Different node in the same module - add a transition message
            const transitionMessage: DialogueTurn = {
              characterId: guideCharacter?.id || 'system_narrator',
              characterName: guideCharacter?.name || 'Narrator',
              characterAvatar: guideCharacter?.avatarUrl,
              characterAlignment: guideCharacter?.alignment || 'neutral',
              message: `Let's shift our focus to "${currentNode.title}" now. This concept explores ${currentNode.shortDefinition.toLowerCase()}`,
              timestamp: Date.now()
            };
            
            // Add the transition message to the existing chat history
            const newHistory = [...savedChatHistory.history, transitionMessage];
            setChatHistory(newHistory);
            setIsInitialized(true);
            
            // Update localStorage with the new history
            localStorage.setItem(storageKey, JSON.stringify({
              moduleId: module.id,
              domainId: currentDomain.id,
              nodeId: currentNode.id,
              history: newHistory
            }));
          }
        } else {
          // Different module - create fresh starters
          const initialStarters = getInitialDialogueStarters(currentNode, guideCharacter, currentDomain, allAiCharacters, module.id);
          setChatHistory(initialStarters);
          setIsInitialized(true);
          
          // Save to localStorage
          localStorage.setItem(storageKey, JSON.stringify({
            moduleId: module.id,
            domainId: currentDomain.id,
            nodeId: currentNode.id,
            history: initialStarters
          }));
        }
      } else {
        // No saved chat history - create fresh starters
        const initialStarters = getInitialDialogueStarters(currentNode, guideCharacter, currentDomain, allAiCharacters, module.id);
        setChatHistory(initialStarters);
        setIsInitialized(true);
        
        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify({
          moduleId: module.id,
          domainId: currentDomain.id,
          nodeId: currentNode.id,
          history: initialStarters
        }));
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
      
      // Fallback to fresh starters if there's an error
      const initialStarters = getInitialDialogueStarters(currentNode, guideCharacter, currentDomain, allAiCharacters, module.id);
      setChatHistory(initialStarters);
      setIsInitialized(true);
    }
    
    setIsLoading(false);
  }, [currentNode.id, module.id, currentDomain.id]); 

  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (scrollAreaRef.current && isInitialized) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory, isInitialized]);

  // Handle user message submission
  const handleUserSubmit = async () => {
    if (!userInput.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    // Create user turn object
    const userTurn: DialogueTurn = {
      characterId: 'user_sovereign',
      characterName: 'Sovereign (You)',
      characterAlignment: 'neutral',
      message: userInput,
      timestamp: Date.now()
    };
    
    // Map chat history to format expected by the dialogue generator
    const currentChatHistoryForGenkit = [...chatHistory, userTurn].map(turn => ({characterId: turn.characterId, message: turn.message})); 
    
    // Update chat history with user message
    const newHistory = [...chatHistory, userTurn];
    setChatHistory(newHistory);
    setUserInput('');
    
    // Save to localStorage
    const storageKey = `${CHAT_HISTORY_STORAGE_KEY}_${module.id}`;
    localStorage.setItem(storageKey, JSON.stringify({
      moduleId: module.id,
      domainId: currentDomain.id,
      nodeId: currentNode.id,
      history: newHistory
    }));

    try {
      // Select personalities for the response
      const personalities = new Set<string>();
      if (guideCharacter) personalities.add(guideCharacter.id);
      
      // Add a specter character
      const activeSpecterId = currentDomain.specterAffinities && currentDomain.specterAffinities.length > 0 
                            ? currentDomain.specterAffinities[Math.floor(Math.random() * currentDomain.specterAffinities.length)] 
                            : 'neurosis'; 
      const activeSpecter = allAiCharacters.find(char => char.id === activeSpecterId && char.type === 'antagonist');
      if (activeSpecter && (!guideCharacter || guideCharacter.id !== activeSpecter.id)) {
        personalities.add(activeSpecter.id);
      }
      
      // Add domain-affinity characters
      const domainAffinityChars = (currentDomain.characterAffinities || []).filter(id => !personalities.has(id) && allAiCharacters.some(c=>c.id === id));
      for (const charId of domainAffinityChars) {
        if (personalities.size >= 3) break;
        personalities.add(charId);
      }

      // Fill in with other available characters if needed
      const availableChars = allAiCharacters.filter(c => !personalities.has(c.id) && c.type !== 'user' && c.type !== 'antagonist');
      while(personalities.size < 3 && availableChars.length > 0){ 
        const randomIndex = Math.floor(Math.random() * availableChars.length);
        personalities.add(availableChars[randomIndex].id);
        availableChars.splice(randomIndex, 1); 
      }
      if (personalities.size === 0 && allAiCharacters.length > 0) personalities.add(allAiCharacters[0].id);

      const personalityArray = Array.from(personalities);
      if (personalityArray.length === 0) {
        setError("No AI characters available to respond at this moment.");
        toast({ title: "Dialogue Error", description: "No AI characters available to respond.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      // Try to generate dialogue response with timeout
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<GenerateReadingDialogueOutput>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Response timeout - the AI is taking too long to respond"));
        }, 15000); // 15 second timeout
      });
      
      // Create a race between the actual API call and the timeout
      const result = await Promise.race([
        generateNodeDialogue(
          currentNode, 
          module, 
          currentDomain, 
          personalityArray,
          currentChatHistoryForGenkit.slice(-8) // Include more context from previous messages
        ),
        timeoutPromise
      ]).finally(() => {
        clearTimeout(timeoutId);
      });

      // If we got an error message in the response but still got dialogue,
      // we'll show the dialogue but also show the error message
      if (result.error && result.dialogue && result.dialogue.length > 0) {
        console.warn("Dialogue generated with error:", result.error);
        
        // Enrich dialogue with character details and timestamps
        const enrichedDialogue = result.dialogue.map((turn, index) => {
          const charDetails = getCharacterDetails(turn.characterId);
          return {
            ...turn,
            characterName: charDetails?.name || turn.characterId,
            characterAvatar: charDetails?.avatarUrl,
            characterAlignment: charDetails?.alignment,
            timestamp: Date.now() + (index * 100) // Space out timestamps
          };
        });
        
        // Update chat history with AI responses
        const updatedHistory = [...newHistory, ...enrichedDialogue];
        setChatHistory(updatedHistory);
        
        // Save updated history to localStorage
        localStorage.setItem(storageKey, JSON.stringify({
          moduleId: module.id,
          domainId: currentDomain.id,
          nodeId: currentNode.id,
          history: updatedHistory
        }));
        
        // Show a toast with the error, but allow the conversation to continue
        if (!result.error.includes("fallback")) { // Don't show toast for normal fallback messages
          toast({ 
            title: "AI Response Note", 
            description: "Using backup dialogue system. API response may be limited.", 
            variant: "default" 
          });
        }
      } else if (result.error) {
        // We got an error with no usable dialogue
        setError(result.error);
        toast({ title: "Dialogue Error", description: result.error, variant: "destructive" });
        
        // Add a system message about the error
        const errorMessage: DialogueTurn = {
          characterId: 'system_narrator',
          characterName: 'System',
          characterAlignment: 'neutral',
          message: "I apologize, but I'm having trouble generating a response right now. Please try again in a moment.",
          timestamp: Date.now()
        };
        
        const updatedHistory = [...newHistory, errorMessage];
        setChatHistory(updatedHistory);
        
        // Save updated history to localStorage
        localStorage.setItem(storageKey, JSON.stringify({
          moduleId: module.id,
          domainId: currentDomain.id,
          nodeId: currentNode.id,
          history: updatedHistory
        }));
      } else if (result.dialogue && result.dialogue.length > 0) {
        // Successful response with dialogue
        // Enrich dialogue with character details and timestamps
        const enrichedDialogue = result.dialogue.map((turn, index) => {
          const charDetails = getCharacterDetails(turn.characterId);
          return {
            ...turn,
            characterName: charDetails?.name || turn.characterId,
            characterAvatar: charDetails?.avatarUrl,
            characterAlignment: charDetails?.alignment,
            timestamp: Date.now() + (index * 100) // Space out timestamps
          };
        });
        
        // Update chat history with AI responses
        const updatedHistory = [...newHistory, ...enrichedDialogue];
        setChatHistory(updatedHistory);
        
        // Save updated history to localStorage
        localStorage.setItem(storageKey, JSON.stringify({
          moduleId: module.id,
          domainId: currentDomain.id,
          nodeId: currentNode.id,
          history: updatedHistory
        }));
      } else {
        // Empty dialogue without explicit error
        setError("Received empty response from the AI. Please try again.");
        toast({ title: "Dialogue Error", description: "Received empty response from the AI.", variant: "destructive" });
      }
    } catch (e) {
      console.error("Chat response error:", e);
      const errorMsg = e instanceof Error ? e.message : "Failed to get AI response.";
      setError(errorMsg);
      
      // Add a system message about the error
      const errorMessage: DialogueTurn = {
        characterId: 'system_narrator',
        characterName: 'System',
        characterAlignment: 'neutral',
        message: "I apologize, but I'm having trouble connecting to the AI. Let me try a more reliable approach.",
        timestamp: Date.now()
      };
      
      const updatedHistory = [...newHistory, errorMessage];
      setChatHistory(updatedHistory);
      
      // Save updated history to localStorage
      localStorage.setItem(storageKey, JSON.stringify({
        moduleId: module.id,
        domainId: currentDomain.id,
        nodeId: currentNode.id,
        history: updatedHistory
      }));
      
      // Show error toast
      toast({ 
        title: "Connection Issue", 
        description: "There was a problem connecting to the AI service. Using fallback dialogue.", 
        variant: "destructive" 
      });
      
      // Try again with the fallback method after a short delay
      setTimeout(() => {
        try {
          const fallbackCharacter = guideCharacter || allAiCharacters.find(c => c.id === 'neuros') || allAiCharacters[0];
          
          if (fallbackCharacter) {
            const fallbackResponse: DialogueTurn = {
              characterId: fallbackCharacter.id,
              characterName: fallbackCharacter.name,
              characterAvatar: fallbackCharacter.avatarUrl,
              characterAlignment: fallbackCharacter.alignment || 'neutral',
              message: `Regarding your question about ${currentNode.title}, ${currentNode.shortDefinition}. This is a core concept in ${currentDomain.title} worth exploring further.`,
              timestamp: Date.now() + 100
            };
            
            const finalHistory = [...updatedHistory, fallbackResponse];
            setChatHistory(finalHistory);
            
            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify({
              moduleId: module.id,
              domainId: currentDomain.id,
              nodeId: currentNode.id,
              history: finalHistory
            }));
          }
        } catch (fallbackError) {
          console.error("Even fallback response failed:", fallbackError);
        }
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const moduleAlignmentProps = getAlignmentStyling(module.alignmentBias);

  // Render the chat panel
  return (
    <div className={cn("bg-card/80 flex flex-col h-full p-spacing-sm", moduleAlignmentProps.borderColorClass, "border shadow-lg rounded-lg")}>
      <CardHeader className="pb-spacing-xs px-spacing-sm flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-spacing-xs">
            <MessageSquare size={18} className={moduleAlignmentProps.titleColor} />
            <span className={moduleAlignmentProps.titleColor}>Discussion Room</span>
          </CardTitle>
          {!isInitialized && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-spacing-xs px-spacing-sm flex-grow overflow-hidden relative">
        <ScrollArea ref={scrollAreaRef} className="h-full pr-spacing-sm">
          <div className="space-y-spacing-sm pb-spacing-sm">
            {chatHistory.length === 0 && !isLoading ? (
              <div className="p-spacing-md text-center text-muted-foreground">
                <AlertCircle className="mx-auto mb-spacing-sm" />
                <p>No dialogue yet. Start the conversation!</p>
              </div>
            ) : (
              chatHistory.map((turn, idx) => (
                <div 
                  key={`turn-${idx}-${turn.characterId}`} 
                  className={cn(
                    "p-spacing-xs rounded-lg",
                    turn.characterId === 'user_sovereign' 
                      ? "bg-primary/10 ml-spacing-md" 
                      : turn.characterAlignment === 'law' 
                        ? "bg-blue-900/10 mr-spacing-md" 
                        : turn.characterAlignment === 'chaos' 
                          ? "bg-red-900/10 mr-spacing-md" 
                          : "bg-muted/50 mr-spacing-md"
                  )}
                >
                  <div className="flex items-start gap-spacing-xs">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                      {turn.characterAvatar ? (
                        <Image 
                          src={turn.characterAvatar} 
                          alt={turn.characterName} 
                          width={32} 
                          height={32} 
                          className="object-cover" 
                        />
                      ) : (
                        <div className={cn(
                          "w-full h-full flex items-center justify-center text-xs font-bold",
                          turn.characterId === 'user_sovereign' 
                            ? "bg-primary text-primary-foreground" 
                            : turn.characterAlignment === 'law' 
                              ? "bg-blue-600 text-white" 
                              : turn.characterAlignment === 'chaos' 
                                ? "bg-red-600 text-white" 
                                : "bg-muted-foreground text-background"
                        )}>
                          {turn.characterName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-semibold">
                        {turn.characterName}
                      </div>
                      <div className="text-sm whitespace-pre-line">{turn.message}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="p-spacing-md text-center text-muted-foreground">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-spacing-sm">Thinking...</p>
              </div>
            )}
            {error && (
              <div className="p-spacing-md text-center text-destructive bg-destructive/10 rounded-lg">
                <AlertCircle className="mx-auto mb-spacing-sm" />
                <p className="text-sm">{error}</p>
                {error.includes("API connection") && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mx-auto"
                      onClick={() => {
                        // Clear the error message
                        setError(null);
                        
                        // Generate fallback response
                        try {
                          const fallbackCharacter = guideCharacter || allAiCharacters.find(c => c.id === 'neuros') || allAiCharacters[0];
                          
                          if (fallbackCharacter) {
                            const fallbackResponse: DialogueTurn = {
                              characterId: fallbackCharacter.id,
                              characterName: fallbackCharacter.name,
                              characterAvatar: fallbackCharacter.avatarUrl,
                              characterAlignment: fallbackCharacter.alignment || 'neutral',
                              message: `Let's continue our discussion about ${currentNode.title}. Even though we're in offline mode, I can still help you understand ${currentNode.shortDefinition}.`,
                              timestamp: Date.now()
                            };
                            
                            // Add to chat history
                            const updatedHistory = [...chatHistory, fallbackResponse];
                            setChatHistory(updatedHistory);
                            
                            // Save to localStorage
                            const storageKey = `${CHAT_HISTORY_STORAGE_KEY}_${module.id}`;
                            localStorage.setItem(storageKey, JSON.stringify({
                              moduleId: module.id,
                              domainId: currentDomain.id,
                              nodeId: currentNode.id,
                              history: updatedHistory
                            }));
                          }
                        } catch (fallbackError) {
                          console.error("Error generating fallback response:", fallbackError);
                        }
                      }}
                    >
                      Use Offline Mode
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-spacing-xs px-spacing-sm flex-shrink-0 border-t border-border/40">
        <form onSubmit={(e) => { e.preventDefault(); handleUserSubmit(); }} className="w-full flex gap-spacing-xs">
          <Textarea 
            placeholder="Ask a question about this concept..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-10 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserSubmit();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="outline"
            className={cn("flex-shrink-0", moduleAlignmentProps.buttonClass)} 
            disabled={isLoading || !userInput.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </div>
  );
}
