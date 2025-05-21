
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Compass, PlusCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Module, Node, WikiModule } from '@/types/neuro'; // Assuming WikiModule type exists or can be created

// Mock Wikipedia API fetch function
async function fetchWikipediaModules(query: string, pageNum: number = 1, limit: number = 10): Promise<Partial<WikiModule>[]> {
  // In a real app, this would call the Wikipedia API
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  if (!query.trim()) return [];

  const mockResults: Partial<WikiModule>[] = Array.from({ length: limit }).map((_, i) => {
    const pageId = (pageNum - 1) * limit + i + 1;
    return {
      id: `wiki_${query.toLowerCase().replace(/\s+/g, '_')}_${pageId}`,
      title: `${query} - Topic ${pageId}`,
      shortDefinition: `A brief overview of ${query} topic ${pageId} from Wikipedia. This section would contain the introductory paragraph.`,
      nodeType: 'concept' as 'concept', // Ensure type matches NodeType
      tags: [query.toLowerCase(), `wiki_topic_${pageId}`, 'dynamic_content'],
      // These would be populated by a more sophisticated parsing/generation step
      domains: [{
        id: `wiki_${query}_d1`,
        title: "Main Concepts",
        learningGoal: `Understand main concepts of ${query} topic ${pageId}`,
        chronicleTheme: "Knowledge Assimilation",
        domainDungeonType: "library_archive",
        characterAffinities: ["veriscribe"],
        specterAffinities: ["complexity"],
        nodes: [{
          id: `wiki_${query}_d1_n1`,
          title: `Core Idea of ${query} Topic ${pageId}`,
          nodeType: 'concept',
          shortDefinition: `The central theme of ${query} topic ${pageId}.`,
          learningObjective: `Grasp the core idea of ${query} topic ${pageId}.`,
          keyTerms: ['wikipedia', query.toLowerCase()],
          download: {
            clarification: `Detailed clarification for the core idea of ${query} topic ${pageId} would go here, extracted or summarized from Wikipedia.`,
            example: `An example illustrating ${query} topic ${pageId}.`,
            scenario: `A real-world scenario involving ${query} topic ${pageId}.`,
            recallPrompt: `Explain the core idea of ${query} topic ${pageId}.`
          },
          epic: {
            explainPrompt: `Explain ${query} topic ${pageId} in detail.`,
            probePrompt: `What are critical questions about ${query} topic ${pageId}?`,
            implementPrompt: `How can ${query} topic ${pageId} be applied?`,
            connectPrompt: `How does ${query} topic ${pageId} connect to other knowledge?`
          },
          status: 'new',
          familiar: false,
          understood: false,
        } as Node],
      }],
      sourceUrl: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}_Topic_${pageId}`,
      extractionDate: new Date(),
      confidenceScore: 0.75, // Example confidence
      generatedContent: true,
      epicGenerationStatus: { status: 'pending' },
    };
  });
  return mockResults;
}


interface InfiniteKnowledgeExplorerProps {
  onAddModuleToLibrary: (moduleId: string, moduleData: Partial<WikiModule>) => void, // Pass full module data
  onExit: () => void;
}

export function InfiniteKnowledgeExplorer({ onAddModuleToLibrary, onExit }: InfiniteKnowledgeExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Partial<WikiModule>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMoreResults = useCallback(async (currentSearchTerm: string, currentPage: number) => {
    if (!currentSearchTerm.trim() || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const newResults = await fetchWikipediaModules(currentSearchTerm, currentPage);
      if (newResults.length === 0) {
        setHasMore(false);
      } else {
        setResults(prev => {
          const newIds = new Set(newResults.map(r => r.id));
          const filteredPrev = prev.filter(p => !newIds.has(p.id));
          return [...filteredPrev, ...newResults];
        });
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching Wikipedia modules:", error);
      toast({ title: "Error", description: "Could not fetch more results.", variant: "destructive" });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, toast]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasMore(true);
      setPage(1);
      return;
    }
    setIsLoading(true);
    setResults([]);
    setPage(1); // Reset page for new search
    setHasMore(true); // Assume there are more results for a new search
    try {
      const initialResults = await fetchWikipediaModules(searchTerm, 1);
      if (initialResults.length === 0) {
        setHasMore(false);
        toast({ description: "No results found for your query." });
      }
      setResults(initialResults);
      if (initialResults.length > 0) setPage(2); // Next page to load will be 2
    } catch (error) {
      console.error("Error searching Wikipedia:", error);
      toast({ title: "Search Error", description: "Could not perform search.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, toast]);

  const lastResultElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && searchTerm.trim() && results.length > 0) {
        loadMoreResults(searchTerm, page);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, loadMoreResults, searchTerm, page, results.length]);

  const handleAddModule = (module: Partial<WikiModule>) => {
    if (module.id) {
      onAddModuleToLibrary(module.id, module); // Pass the full module data
      toast({ title: "Module Added", description: `${module.title} added to your library for EPIC generation.` });
    }
  };
  
  useEffect(() => {
    // Optional: Initial load or featured topics when component mounts without a search
    // loadMoreResults("Artificial Intelligence", 1); // Example initial load
  }, []);


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="shadow-cyan-md" data-alignment="neutral">
        <CardHeader className="bg-muted/30 p-4 rounded-t-lg border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-display text-glow-cyan flex items-center gap-2">
              <Compass size={24} className="text-secondary" /> Infinite Knowledge Explorer
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExit}>
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Button>
          </div>
          <CardDescription className="text-muted-foreground/80">
            Discover and integrate knowledge from Wikipedia into your NeuroOS.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search Wikipedia topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="ui-input flex-grow"
            />
            <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()} variant="primary">
              {isLoading ? <Loader2 className="animate-spin" /> : "Search"}
            </Button>
          </div>

          {results.length === 0 && !isLoading && searchTerm && (
            <p className="text-muted-foreground text-center py-6 italic">No results found for "{searchTerm}". Try a different query.</p>
          )}
          {results.length === 0 && !isLoading && !searchTerm && (
             <p className="text-muted-foreground text-center py-6 italic">Enter a topic to begin exploring the Infinite Knowledge Stream.</p>
          )}

          <ScrollArea className="h-[calc(100vh-400px)] pr-3"> {/* Adjust height as needed */}
            <div className="space-y-4">
              {results.map((module, index) => (
                <Card 
                  key={module.id || index} 
                  ref={index === results.length - 1 ? lastResultElementRef : null}
                  className="border-border/50 bg-card/80 hover:shadow-cyan-sm"
                  data-alignment="neutral" // Wikipedia modules are neutral by default
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display text-glow-cyan">{module.title || 'Untitled Module'}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground/90 pb-2">
                    <p className="line-clamp-3">{module.shortDefinition || 'No definition available.'}</p>
                    {module.tags && module.tags.length > 0 && (
                      <div className="mt-2">
                        {module.tags.slice(0, 3).map(tag => <Badge key={tag} variant="secondary" className="mr-1 text-xs">{tag}</Badge>)}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => handleAddModule(module)}>
                      <PlusCircle className="mr-1" /> Add to Library
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {isLoadingMore && (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="animate-spin text-secondary" size={24} />
                  <span className="ml-2 text-muted-foreground">Loading more...</span>
                </div>
              )}
               {!hasMore && results.length > 0 && (
                <p className="text-muted-foreground text-center py-4 italic">End of results.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
