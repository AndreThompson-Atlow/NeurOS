'use client';

import React from 'react';
import type { UserProfile, GrowthEdge } from '@/types/neuro'; // Ensure GrowthEdge is imported
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'; // Assuming Card components are styled
import { Lightbulb } from 'lucide-react';

// Placeholder types if not fully defined elsewhere or for this specific component
interface ChallengeContent { // Renamed from Challenge to avoid conflict if Challenge is a general type
  id: string; 
  content: string; 
  difficulty?: number; // 0-100
}
interface ChallengeCalibration { 
  challengeIntensity: number; // 0-100
  framingStrategy?: 'supportive' | 'direct' | 'exploratory';
  adaptivePrompts?: string[];
}

interface CalibratedChallengeProps {
  challenge: ChallengeContent;
  calibration: ChallengeCalibration;
  userProfile: UserProfile; // UserProfile from types/neuro
  onSubmit?: (response: string) => void; // Optional submit handler
}

export const CalibratedChallenge: React.FC<CalibratedChallengeProps> = ({ challenge, calibration, userProfile, onSubmit }) => {
  // Mock logic for adapting presentation and framing
  const adaptChallengePresentation = (currentChallenge: ChallengeContent, currentCalibration: ChallengeCalibration) => {
    let adaptedContent = currentChallenge.content;
    let prefix = "";

    switch (currentCalibration.framingStrategy) {
        case 'supportive':
            prefix = "Let's gently explore this: ";
            break;
        case 'direct':
            prefix = "Consider this directly: ";
            break;
        case 'exploratory':
            prefix = "An interesting avenue to explore: ";
            break;
        default:
            if (currentCalibration.challengeIntensity < 40) {
                prefix = "Here's a thought to ponder gently: ";
            } else if (currentCalibration.challengeIntensity < 70) {
                prefix = "Consider this concept: ";
            } else {
                prefix = "Deep dive into this: ";
            }
            break;
    }
    return { ...currentChallenge, content: `${prefix}${adaptedContent}` };
  };

  const createChallengeFraming = (shameProfile: UserProfile['shameProfile'], currentCalibration: ChallengeCalibration) => {
    let framing = `This challenge is presented with an intensity level of ${currentCalibration.challengeIntensity}%. `;
    if (shameProfile?.overallResilience < 50 && currentCalibration.challengeIntensity > 60) {
      framing += "Remember, this is an exploration. Focus on the process, not just the outcome. Be kind to your cognitive self.";
    } else if (shameProfile?.overallResilience > 80 && currentCalibration.challengeIntensity < 50) {
        framing += "This may seem straightforward, but look for deeper nuances."
    }
    return framing;
  };

  const adaptedChallenge = adaptChallengePresentation(challenge, calibration);
  const challengeFraming = createChallengeFraming(userProfile.shameProfile, calibration);

  return (
    <Card className="calibrated-challenge my-4 bg-card/95 border-secondary/30 shadow-cyan-sm" data-alignment="neutral">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-md font-display text-glow-cyan flex items-center gap-2">
            <Lightbulb size={18}/> Calibrated Cognitive Challenge
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground/80 pt-1">{challengeFraming}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="challenge-content text-sm text-foreground/95 py-2 border-t border-border/20" data-intensity={calibration.challengeIntensity}>
          <p className="whitespace-pre-line">{adaptedChallenge.content}</p>
        </div>
        
        {calibration.adaptivePrompts && calibration.adaptivePrompts.length > 0 && (
            <div className="mt-2 text-xs space-y-1">
                <p className="font-semibold text-secondary">Consider these prompts:</p>
                <ul className="list-disc list-inside pl-3 text-muted-foreground/80">
                    {calibration.adaptivePrompts.map((prompt,idx) => <li key={idx}>{prompt}</li>)}
                </ul>
            </div>
        )}

        {onSubmit && (
            <div className="mt-3">
                {/* Placeholder for response input and submit button */}
                <p className="text-xs text-muted-foreground italic">(Response mechanism to be added if needed)</p>
            </div>
        )}

        {(calibration.challengeIntensity > 70 || userProfile.shameProfile.overallResilience < 50) && userProfile.shameProfile.knownTriggers && userProfile.shameProfile.knownTriggers.length > 0 && (
          <div className="mt-3 p-2 bg-muted/50 border border-border/30 rounded text-xxs">
            <p className="font-semibold text-secondary/80">Gentle Reminders (if relevant):</p>
            <ul className="list-disc list-inside pl-3 text-muted-foreground/70">
              {userProfile.shameProfile.knownTriggers.slice(0,1).map((trigger: ShameTrigger, index: number) => ( // Using ShameTrigger type
                <li key={trigger.triggerId || index}>If you notice feelings related to '{trigger.description}', remember your strategies for navigating these moments.</li>
              ))}
               <li>Focus on the process of exploration.</li>
            </ul>
          </div>
        )}
         <p className="text-xs text-muted-foreground/50 mt-2 italic text-right">(CalibratedChallenge component)</p>
      </CardContent>
    </Card>
  );
};
