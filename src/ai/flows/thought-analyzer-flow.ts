'use server';
/**
 * @fileOverview Thought Analyzer Flow - A system for analyzing user cognitive patterns.
 * 
 * This module provides functionality for analyzing a user's thought process based on
 * their textual input. It detects various cognitive patterns, biases, logical violations,
 * and emotional interferences, then produces a structured analysis result.
 * 
 * Currently implemented as a mock/simplified version that returns structured but
 * partially randomized data for demonstration and testing purposes.
 * 
 * @module ThoughtAnalyzerFlow
 */

import { ai as baseAi } from '../../../lib/server/genkit'; 
import type { LogicalViolation, CognitiveBias, EpistemicDistortion, EmotionalInterference, LanguageIssue, CognitivePattern, RecursiveStructure, Issue, ThoughtQuality as NeuroThoughtQuality, AnalysisResult as NeuroAnalysisResult } from '@/types/neuro';
import { z } from 'genkit';
import { 
    AnalyzeThoughtProcessInputSchema, 
    AnalyzeThoughtProcessOutputSchema,
} from '@/ai/schemas';

export type AnalyzeThoughtProcessInput = z.infer<typeof AnalyzeThoughtProcessInputSchema>;
export type AnalyzeThoughtProcessOutput = z.infer<typeof AnalyzeThoughtProcessOutputSchema>;

/**
 * Analyzes a user's thought process based on their input text and context.
 * 
 * @param {AnalyzeThoughtProcessInput} input - The input containing user text and analysis context
 * @returns {Promise<AnalyzeThoughtProcessOutput>} A structured analysis of the user's thought process
 */
export async function analyzeThoughtProcess(input: AnalyzeThoughtProcessInput): Promise<AnalyzeThoughtProcessOutput> {
  return analyzeThoughtProcessFlow(input);
}

/**
 * The main flow definition for thought analysis.
 * 
 * This function defines a flow that takes user input and context, then produces
 * a detailed analysis of the user's cognitive patterns, biases, and potential issues.
 * In the current implementation, it generates semi-randomized mock data for demonstration.
 * 
 * @param {AnalyzeThoughtProcessInput} input - User text and context for analysis
 * @returns {Promise<AnalyzeThoughtProcessOutput>} Structured analysis results
 */
const analyzeThoughtProcessFlow = baseAi.defineFlow(
  {
    name: 'analyzeThoughtProcessFlow',
    inputSchema: AnalyzeThoughtProcessInputSchema,
    outputSchema: AnalyzeThoughtProcessOutputSchema,
  },
  async (input: AnalyzeThoughtProcessInput): Promise<AnalyzeThoughtProcessOutput> => {
    const { userInput, analysisContext } = input;

    // Initialize analysis components
    let logicalViolations: LogicalViolation[] = [];
    let cognitiveBiases: CognitiveBias[] = [];
    let epistemicDistortions: EpistemicDistortion[] = [];
    let emotionalInterference: EmotionalInterference[] = [];
    let languageIssues: LanguageIssue[] = [];
    let detectedPatterns: CognitivePattern[] = [];
    let feedbackSummary = "Analysis complete. ";

    // Detect potential cognitive biases and issues based on simple text patterns
    // Note: This is a simplified mock implementation for demonstration purposes
    if (userInput.text.toLowerCase().includes("always true") || userInput.text.toLowerCase().includes("never happens")) {
      cognitiveBiases.push({ type: "Overgeneralization", segment: userInput.text, explanation: "The user's statement seems to overgeneralize without sufficient evidence.", severity: 2 });
      epistemicDistortions.push({ type: "Jumping to Conclusions", segment: userInput.text, explanation: "Making broad claims based on limited perspective.", severity: 3 });
      feedbackSummary += "Consider if there are exceptions to your statements. ";
    }
    if (userInput.text.length < 20 && analysisContext.interactionType !== 'chronicle_interaction') { 
      languageIssues.push({type: "Lack of Elaboration", segment: userInput.text, suggestion: "Consider providing more detail or examples.", severity: 1});
      feedbackSummary += "Your response is quite short; elaborating further could strengthen your points. ";
    }
    if (userInput.text.toLowerCase().includes("i feel that") && analysisContext.interactionType === 'epic_explain') {
        emotionalInterference.push({type: "Emotional Reasoning", detectedEmotion: "Unspecified", segment: "i feel that...", explanation: "Response relies on feelings rather than objective explanation for an 'explain' task.", severity: 2});
        feedbackSummary += "Try to base explanations on the provided material rather than feelings alone. "
    }
     if (analysisContext.interactionType === 'epic_probe' && !userInput.text.includes("?")) {
        detectedPatterns.push({patternId: "probe_no_question", name: "No Question in Probe", description: "User did not ask a question during the probe phase."});
        languageIssues.push({type: "Missed Prompt Requirement", segment: userInput.text, suggestion: "The probe step asks you to pose questions. Try to formulate some critical questions.", severity: 2});
    }

    // Generate semi-randomized thought quality metrics for demonstration
    const mockQuality: NeuroThoughtQuality = {
      logicalIntegrity: Math.floor(Math.random() * 30) + 65, 
      epistemicCalibration: Math.floor(Math.random() * 30) + 60,
      cognitiveFlexibility: Math.floor(Math.random() * 30) + 55,
      emotionalIntegration: userInput.text.toLowerCase().includes("i feel") ? Math.floor(Math.random() * 20) + 70 : Math.floor(Math.random() * 30) + 50,
      metacognitiveAwareness: Math.floor(Math.random() * 30) + 50,
      expressiveClarity: userInput.text.length < 20 ? Math.floor(Math.random() * 20) + 40 : Math.floor(Math.random() * 25) + 70,
    };

    // Calculate overall score as the average of all quality dimensions
    const overallScore = Math.round(
        Object.values(mockQuality).reduce((sum, val) => sum + val, 0) / Object.keys(mockQuality).length
    );
    
    feedbackSummary += `Overall thought quality estimated around ${overallScore}%.`;

    // Return the complete analysis result
    return {
      logicalViolations,
      cognitiveBiases,
      epistemicDistortions,
      emotionalInterference,
      languageIssues,
      thoughtQuality: mockQuality,
      detectedPatterns,
      recursiveStructures: [] as RecursiveStructure[], 
      domainSpecificIssues: {} as Record<string, Issue[]>, 
      overallScore: overallScore,
      feedbackSummary: feedbackSummary,
    };
  }
);



