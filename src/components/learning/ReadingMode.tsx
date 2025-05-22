'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Maximize2, Minimize2, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Node } from '@/types/neuro';

interface ReadingModeProps {
  currentNode: Node | null;
  onExit: (continueToDownload: boolean) => void;
  glossary?: Record<string, string>;
}

export default function ReadingMode({
  currentNode,
  onExit,
  glossary = {}
}: ReadingModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [showDefinitions, setShowDefinitions] = useState(true);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  
  if (!currentNode) return null;
  
  // Find key terms in the text that exist in the glossary
  const processTextForGlossary = (text: string) => {
    if (!text) return { text: '', terms: [] };
    
    const terms = Object.keys(glossary).filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
    
    return { text, terms };
  };
  
  const definitionContent = processTextForGlossary(currentNode.shortDefinition || '');
  const explanationContent = processTextForGlossary(currentNode.download?.clarification || '');
  const exampleContent = processTextForGlossary(currentNode.download?.example || '');
  const applicationContent = processTextForGlossary(currentNode.download?.scenario || '');
  
  // Highlight term in text
  const highlightTerm = (text: string, term: string): React.ReactNode => {
    if (!text || !term) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() ? (
            <span 
              key={i} 
              className={`cursor-pointer ${
                highlightedWords.includes(term.toLowerCase()) ? 'bg-primary/20 text-primary' : 'bg-muted/30'
              }`}
              onClick={() => {
                if (highlightedWords.includes(term.toLowerCase())) {
                  setHighlightedWords(prev => prev.filter(w => w !== term.toLowerCase()));
                } else {
                  setHighlightedWords(prev => [...prev, term.toLowerCase()]);
                }
              }}
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };
  
  // Render text with all glossary terms highlighted
  const renderTextWithHighlights = (content: { text: string, terms: string[] }) => {
    let result = content.text;
    
    if (showDefinitions && content.terms.length > 0) {
      // Sort terms by length (descending) to handle overlapping terms
      const sortedTerms = [...content.terms].sort((a, b) => b.length - a.length);
      
      for (const term of sortedTerms) {
        result = highlightTerm(result as string, term) as string;
      }
    }
    
    return result;
  };
  
  return (
    <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
      <Card className={`${isFullscreen ? 'h-full flex flex-col' : ''}`}>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center text-xl">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              <span className="mr-2">Reading Mode:</span> 
              <span className="font-normal">{currentNode.title}</span>
            </CardTitle>
            <CardDescription>
              Build familiarity with the concept before active learning
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{currentNode.nodeType || 'Concept'}</Badge>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        <div className="px-6 py-2 border-b flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="show-definitions" className="text-sm">Highlight Terms</Label>
              <Switch 
                id="show-definitions" 
                checked={showDefinitions}
                onCheckedChange={setShowDefinitions}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
              >
                <span className="text-sm">A-</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
              >
                <span className="text-sm">A+</span>
              </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className={`${isFullscreen ? 'flex-1' : ''} px-1`}>
          <CardContent className="space-y-6 pt-6" style={{ fontSize: `${fontSize}px` }}>
            <div className="prose max-w-none space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Definition</h3>
                <p className="leading-relaxed">
                  {renderTextWithHighlights(definitionContent)}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Detailed Explanation</h3>
                <p className="leading-relaxed">
                  {renderTextWithHighlights(explanationContent)}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Example</h3>
                <p className="leading-relaxed">
                  {renderTextWithHighlights(exampleContent)}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Real-world Application</h3>
                <p className="leading-relaxed">
                  {renderTextWithHighlights(applicationContent)}
                </p>
              </div>
            </div>
            
            {highlightedWords.length > 0 && (
              <Alert className="mt-4">
                <AlertDescription>
                  <h4 className="font-medium mb-2">Definitions:</h4>
                  <ul className="space-y-2">
                    {highlightedWords.map(word => (
                      <li key={word} className="flex">
                        <span className="font-medium mr-2">{word}:</span>
                        <span>{glossary[word]}</span>
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => onExit(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Reading Mode
          </Button>
          <Button onClick={() => onExit(true)}>
            Continue to Download Phase
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 