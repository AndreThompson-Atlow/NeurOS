
'use server';
/**
 * @fileOverview Flow for simulating the NeuralShameEngine.
 * This provides a basic structure for calculating a shame index and generating shame-aware feedback.
 *
 * - processWithShameEngine - A function that simulates shame index calculation and feedback generation.
 * - ProcessWithShameEngineInput - The input type.
 * - ProcessWithShameEngineOutput - The return type.
 */

// Using consistent relative paths due to persistent resolution issues with aliases
import { ai as baseAi } from '../../../lib/server/genkit'; 
import type { AnalysisResult, UserProfile as NeuroUserProfileType, ShameIndexResult as NeuroShameIndexResult, FeedbackOutput as NeuroFeedbackOutput, ShameCategory, GrowthEdge, ShameTrigger } from '@/types/neuro';
import { z } from 'genkit';
import { 
    ProcessWithShameEngineInputSchema, 
    ProcessWithShameEngineOutputSchema,
} from '@/ai/schemas'; // Ensure this path is correct and schemas are exported


export type ProcessWithShameEngineInput = z.infer<typeof ProcessWithShameEngineInputSchema>;
export type ProcessWithShameEngineOutput = z.infer<typeof ProcessWithShameEngineOutputSchema>;


export async function processWithShameEngine(input: ProcessWithShameEngineInput): Promise<ProcessWithShameEngineOutput> {
  return processWithShameEngineFlow(input);
}

const determineShameCategory = (score: number): ShameCategory => {
  if (score <= 39) return "Compromised";
  if (score <= 59) return "Shaky";
  if (score <= 79) return "Stable";
  if (score <= 89) return "Strong";
  return "Architect";
};

const processWithShameEngineFlow = baseAi.defineFlow(
  {
    name: 'processWithShameEngineFlow',
    inputSchema: ProcessWithShameEngineInputSchema,
    outputSchema: ProcessWithShameEngineOutputSchema,
  },
  async (input): Promise<ProcessWithShameEngineOutput> => {
    const { analysisResult, userProfile } = input;

    const resilienceFactor = (userProfile.shameProfile?.overallResilience || 70) / 100;
    const thoughtQualityValues = Object.values(analysisResult.thoughtQuality);
    const thoughtQualityAverage = thoughtQualityValues.length > 0 
        ? thoughtQualityValues.reduce((sum, val) => sum + (val || 0), 0) / thoughtQualityValues.length
        : 70; 

    let shameScore = (thoughtQualityAverage * 0.6) + (resilienceFactor * 40);
    const totalNegativeFindings = analysisResult.logicalViolations.length +
                                  analysisResult.cognitiveBiases.length +
                                  analysisResult.epistemicDistortions.length +
                                  analysisResult.emotionalInterference.length +
                                  analysisResult.languageIssues.length;
    shameScore -= totalNegativeFindings * 2; 
    
    shameScore = Math.max(0, Math.min(100, Math.round(shameScore)));

    const category = determineShameCategory(shameScore);
    let warningFlags: string[] = [];

    if (analysisResult.cognitiveBiases.some(b => b.type === "Confirmation Bias" && b.severity > 3)) {
        warningFlags.push("Strong confirmation bias detected. Actively seek disconfirming evidence.");
    }
    if (analysisResult.logicalViolations.some(v => v.severity > 3)) {
        const significantViolation = analysisResult.logicalViolations.find(v=>v.severity > 3);
        warningFlags.push(`Significant logical violation: ${significantViolation?.type || 'Unknown type'}. Review logical structure.`);
    }
     if (analysisResult.languageIssues.some(i => i.type === "Vagueness" && i.severity > 2)) {
        warningFlags.push("Response lacks specificity. Provide concrete examples or details.");
    }
    if (userProfile.knownTriggers && userProfile.knownTriggers.length > 0 && shameScore < 50) {
        warningFlags.push(`Potential trigger activation: ${userProfile.knownTriggers[0].description}. Be mindful of your emotional state.`);
    }
    if (shameScore < 40) {
        warningFlags.push("Cognitive load appears high. Consider taking a break or simplifying your approach.");
    }


    const mockGrowthEdges: GrowthEdge[] = [];
    if (analysisResult.thoughtQuality.logicalIntegrity < 70) {
        mockGrowthEdges.push({ edgeId: 'ge_logic', domain: 'logicalIntegrity', description: 'Strengthen logical structuring in arguments.', recommendedAction: 'Practice identifying formal fallacies in provided texts. Review argument mapping techniques.'});
    }
    if (analysisResult.thoughtQuality.epistemicCalibration < 65) {
        mockGrowthEdges.push({ edgeId: 'ge_epistemic', domain: 'epistemicCalibration', description: 'Improve alignment of confidence with evidence.', recommendedAction: 'Engage in calibration exercises for probability estimation. Track your predictions and their outcomes.'});
    }
     if (analysisResult.cognitiveBiases.length > 0) {
        mockGrowthEdges.push({ edgeId: 'ge_bias', domain: 'cognitiveBiases', description: `Address tendency towards ${analysisResult.cognitiveBiases[0].type}.`, recommendedAction: `Review materials on ${analysisResult.cognitiveBiases[0].type}. Practice "considering the opposite" for important judgments.`});
    }
    if (analysisResult.thoughtQuality.expressiveClarity < 70) {
        mockGrowthEdges.push({ edgeId: 'ge_clarity', domain: 'expressiveClarity', description: 'Enhance clarity and precision in explanations.', recommendedAction: 'Practice the Feynman technique: explain complex topics in simple terms. Refine word choices to remove ambiguity.'});
    }


    const shameIndexResult: NeuroShameIndexResult = {
      score: shameScore,
      category: category,
      strengths: analysisResult.thoughtQuality.expressiveClarity > 80 ? ["Clear Expression"] : (analysisResult.thoughtQuality.logicalIntegrity > 80 ? ["Strong Logic"] : ["Analytical Approach"]),
      vulnerabilities: (userProfile.knownTriggers && userProfile.knownTriggers.length > 0) ? userProfile.knownTriggers.slice(0,1).map(t => t.description) : (shameScore < 50 ? ["Sensitivity to critique on logical structure"] : []),
      growthEdges: mockGrowthEdges.slice(0,2), 
      recommendedChallengeIntensity: Math.max(userProfile.thresholds?.optimalChallengeZone?.min || 60, Math.min(userProfile.thresholds?.optimalChallengeZone?.max || 85, Math.round(shameScore + 10))),
    };

    let mainFeedback = analysisResult.feedbackSummary ? `${analysisResult.feedbackSummary}\n` : `Your analysis shows a thought quality score around ${Math.round(thoughtQualityAverage)}%.\n`;
    let metacognitivePrompts = ["What part of this task felt most intuitive to you?", "If you were to explain this to someone else, what key points would you emphasize?"];
    

    switch (category) {
      case "Compromised":
        mainFeedback += "It's completely okay to find this challenging. Let's focus on building one small understanding. Your effort is noted and valued.";
        metacognitivePrompts.unshift("What's one small thing you learned or noticed? What felt most difficult, and why do you think that was?");
        if (userProfile.knownTriggers && userProfile.knownTriggers.length > 0 && !warningFlags.some(w => w.includes(userProfile.knownTriggers![0].description))) warningFlags.push(`Potential trigger activation: ${userProfile.knownTriggers[0].description}`);
        break;
      case "Shaky":
        mainFeedback += `This is a good starting point. There are opportunities to strengthen your reasoning, particularly around ${mockGrowthEdges[0]?.domain || 'key areas'}. Let's focus on building more confidence here.`;
        metacognitivePrompts.unshift("What's one aspect you'd like to understand better? How did your approach to this problem make you feel?");
        break;
      case "Stable":
        mainFeedback += `Solid work. Your primary areas for growth might be related to ${mockGrowthEdges[0]?.domain || 'refining your approach'}. Considering these could refine your understanding further.`;
        metacognitivePrompts.unshift("How did your initial approach compare to your final understanding? What assumptions did you make, and were they valid?");
        break;
      case "Strong":
        mainFeedback += `Excellent! Your reasoning is robust. To push further, consider challenging your assumptions in ${shameIndexResult.strengths[0] || 'your strongest area'} or exploring how this connects to ${mockGrowthEdges[0]?.domain || 'an advanced concept'}.`;
        metacognitivePrompts.unshift("How might this concept apply in a completely different domain? What are the subtlest nuances you've grasped?");
        break;
      case "Architect":
        mainFeedback += "Exceptional integration of concepts. Your cognitive architecture demonstrates sophisticated understanding. How might you use this insight to generate novel solutions or frameworks? What new questions does this understanding open up for you?";
        metacognitivePrompts.unshift("What new questions or insights does this understanding open up for you? How could this insight be generalized into a broader principle?");
        break;
    }


    const feedbackOutput: NeuroFeedbackOutput = {
      mainFeedback: mainFeedback.trim(),
      growthSuggestions: shameIndexResult.growthEdges.map(ge => ge.recommendedAction),
      metacognitivePrompts: metacognitivePrompts.slice(0,3), // Limit to 3 prompts
      warningFlags: warningFlags.length > 0 ? warningFlags : undefined,
    };

    return {
      shameIndexResult,
      feedbackOutput,
    };
  }
);

