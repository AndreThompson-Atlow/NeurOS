'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, BookOpen } from "lucide-react";
import { useRouter } from 'next/navigation';
import type { Module } from '@/types/neuro';

interface LearningCompletionProps {
  module: Module;
  onReturnHome: () => void;
  onStartReview: () => void;
}

export function LearningCompletion({ module, onReturnHome, onStartReview }: LearningCompletionProps) {
  const router = useRouter();
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Module Completed!</CardTitle>
        <CardDescription>
          You've successfully installed {module.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="font-medium mb-3 text-lg">What you've learned:</h3>
          <ul className="space-y-2">
            {module.domains.map((domain) => (
              <li key={domain.id} className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">{domain.title}</span>
                  <p className="text-sm text-muted-foreground">{domain.learningGoal}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-primary/5 p-6 rounded-lg">
          <h3 className="font-medium mb-2 text-lg">What's next?</h3>
          <p>Knowledge needs reinforcement to become permanent. Consider:</p>
          <ul className="mt-3 space-y-1 list-disc list-inside text-sm">
            <li>Schedule regular reviews to maintain memory strength</li>
            <li>Apply this knowledge in the Neuroverse Chronicles</li>
            <li>Connect these concepts to other modules</li>
            <li>Explore related modules to expand your neural network</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={onReturnHome}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Library
        </Button>
        <Button onClick={onStartReview}>
          <BookOpen className="h-4 w-4 mr-2" />
          Start Review Session
        </Button>
      </CardFooter>
    </Card>
  );
} 