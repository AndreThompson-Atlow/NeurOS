'use server';
/**
 * @fileOverview Thought Analyzer Flow - A system for analyzing user cognitive patterns.
 * 
 * This module provides functionality for analyzing a user's thought process based on
 * their textual input. It makes real AI calls to detect cognitive patterns, biases, 
 * logical violations, and emotional interferences, then produces a structured analysis result.
 * 
 * @module ThoughtAnalyzerFlow
 */

// Using consistent relative paths due to persistent resolution issues with aliases
import { callAIProvider } from '../../../src/utils/ai-providers';
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
  console.log('🧠 [THOUGHT-ANALYZER] Starting real AI analysis...');
  
  const { userInput, analysisContext } = input;
  
  // Get user's provider preference (this should come from context or config)
  const userProvider = 'claude4'; // Could be passed from the evaluation flow
  const userModelKey = 'claude4';
  
  console.log(`🧠 [THOUGHT-ANALYZER] Using AI provider: ${userProvider}`);
  
  try {
    // Prepare comprehensive thought analysis prompt
    const thoughtAnalysisPrompt = `
You are an expert cognitive analyst specializing in thought pattern recognition and metacognitive assessment.

ANALYSIS CONTEXT:
- Learning Domain: ${analysisContext.domain || 'General'}
- Node/Concept: ${analysisContext.nodeTitle || 'N/A'}
- Interaction Type: ${analysisContext.interactionType}
- Learning Objective: ${analysisContext.learningObjective || 'N/A'}

USER'S RESPONSE TO ANALYZE:
"${userInput.text}"

TASK: Provide a comprehensive cognitive analysis of this response. Return ONLY a JSON object with the following structure:

{
  "logicalViolations": [
    {
      "type": "string (e.g., 'Circular Reasoning', 'False Dichotomy', 'Ad Hominem')",
      "segment": "exact text segment where violation occurs",
      "explanation": "detailed explanation of the logical issue",
      "severity": number (1-5, where 5 is most severe)
    }
  ],
  "cognitiveBiases": [
    {
      "type": "string (e.g., 'Confirmation Bias', 'Anchoring Bias', 'Availability Heuristic')",
      "segment": "text segment showing the bias",
      "explanation": "explanation of how this bias manifests",
      "severity": number (1-5)
    }
  ],
  "epistemicDistortions": [
    {
      "type": "string (e.g., 'Overgeneralization', 'All-or-Nothing Thinking', 'Mental Filter')",
      "segment": "relevant text segment",
      "explanation": "how this distorts understanding",
      "severity": number (1-5)
    }
  ],
  "emotionalInterference": [
    {
      "type": "string (e.g., 'Emotional Reasoning', 'Catastrophizing', 'Personalization')",
      "detectedEmotion": "primary emotion detected",
      "segment": "relevant text",
      "explanation": "how emotion interferes with reasoning",
      "severity": number (1-5)
    }
  ],
  "languageIssues": [
    {
      "type": "string (e.g., 'Vagueness', 'Ambiguity', 'Lack of Elaboration')",
      "segment": "problematic text segment",
      "suggestion": "specific improvement suggestion",
      "severity": number (1-5)
    }
  ],
  "thoughtQuality": {
    "logicalIntegrity": number (0-100, coherence and logical structure),
    "epistemicCalibration": number (0-100, accuracy of confidence levels),
    "cognitiveFlexibility": number (0-100, ability to consider alternatives),
    "emotionalIntegration": number (0-100, appropriate emotional awareness),
    "metacognitiveAwareness": number (0-100, awareness of own thinking),
    "expressiveClarity": number (0-100, clarity of communication)
  },
  "detectedPatterns": [
    {
      "patternId": "unique identifier",
      "name": "human-readable pattern name",
      "description": "detailed description of the pattern",
      "frequency": number (optional),
      "implications": "what this pattern suggests"
    }
  ],
  "overallScore": number (0-100, overall thought quality),
  "feedbackSummary": "comprehensive 2-3 sentence summary of the analysis"
}

Focus on providing constructive, specific analysis. Empty arrays are acceptable if no issues are detected in a category.
`;

    console.log(`🧠 [THOUGHT-ANALYZER] Calling AI with prompt length: ${thoughtAnalysisPrompt.length}`);
    
    // Make the AI call
    const response = await callAIProvider(thoughtAnalysisPrompt, userProvider, userModelKey);
    
    if (response.error) {
      console.error(`❌ [THOUGHT-ANALYZER] AI provider error:`, response.error);
      throw new Error(`AI analysis failed: ${response.error}`);
    }
    
    const rawOutput = response.text || '';
    console.log(`🧠 [THOUGHT-ANALYZER] Raw AI response length: ${rawOutput.length}`);
    
    if (!rawOutput) {
      throw new Error('No response from AI provider');
    }
    
    // Parse the JSON response
    let analysisData: any;
    try {
      // Extract JSON if embedded in other text
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawOutput;
      analysisData = JSON.parse(jsonString);
      console.log(`🧠 [THOUGHT-ANALYZER] Successfully parsed AI response`);
    } catch (parseError) {
      console.error(`❌ [THOUGHT-ANALYZER] JSON parse error:`, parseError);
      console.error(`Raw output: ${rawOutput.substring(0, 500)}...`);
      
      // Fallback to basic analysis if parsing fails
      return createFallbackAnalysis(userInput.text);
    }
    
    // Validate and ensure all required fields are present
    const validatedResult: AnalyzeThoughtProcessOutput = {
      logicalViolations: Array.isArray(analysisData.logicalViolations) ? analysisData.logicalViolations : [],
      cognitiveBiases: Array.isArray(analysisData.cognitiveBiases) ? analysisData.cognitiveBiases : [],
      epistemicDistortions: Array.isArray(analysisData.epistemicDistortions) ? analysisData.epistemicDistortions : [],
      emotionalInterference: Array.isArray(analysisData.emotionalInterference) ? analysisData.emotionalInterference : [],
      languageIssues: Array.isArray(analysisData.languageIssues) ? analysisData.languageIssues : [],
      thoughtQuality: {
        logicalIntegrity: Math.max(0, Math.min(100, analysisData.thoughtQuality?.logicalIntegrity || 70)),
        epistemicCalibration: Math.max(0, Math.min(100, analysisData.thoughtQuality?.epistemicCalibration || 70)),
        cognitiveFlexibility: Math.max(0, Math.min(100, analysisData.thoughtQuality?.cognitiveFlexibility || 70)),
        emotionalIntegration: Math.max(0, Math.min(100, analysisData.thoughtQuality?.emotionalIntegration || 70)),
        metacognitiveAwareness: Math.max(0, Math.min(100, analysisData.thoughtQuality?.metacognitiveAwareness || 70)),
        expressiveClarity: Math.max(0, Math.min(100, analysisData.thoughtQuality?.expressiveClarity || 70)),
      },
      detectedPatterns: Array.isArray(analysisData.detectedPatterns) ? analysisData.detectedPatterns : [],
      recursiveStructures: [], // Placeholder for future enhancement
      domainSpecificIssues: {}, // Placeholder for future enhancement
      overallScore: Math.max(0, Math.min(100, analysisData.overallScore || 70)),
      feedbackSummary: analysisData.feedbackSummary || 'Analysis completed successfully.',
    };
    
    console.log(`🧠 [THOUGHT-ANALYZER] Analysis complete. Overall score: ${validatedResult.overallScore}`);
    return validatedResult;
    
  } catch (error) {
    console.error(`❌ [THOUGHT-ANALYZER] Error during analysis:`, error);
    
    // Return fallback analysis
    return createFallbackAnalysis(userInput.text);
  }
}

/**
 * Creates a fallback analysis when AI analysis fails
 */
function createFallbackAnalysis(userText: string): AnalyzeThoughtProcessOutput {
  console.log('🧠 [THOUGHT-ANALYZER] Using fallback analysis');
  
  const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;
  
  // Basic heuristic analysis
  const hasPersonalOpinions = /\b(i think|i feel|i believe|in my opinion)\b/i.test(userText);
  const hasAbsoluteLanguage = /\b(always|never|all|none|everyone|nobody)\b/i.test(userText);
  const isVague = wordCount < 20 || /\b(thing|stuff|kind of|sort of)\b/i.test(userText);
  
  return {
    logicalViolations: [],
    cognitiveBiases: hasAbsoluteLanguage ? [{
      type: "Overgeneralization",
      segment: userText.substring(0, 100),
      explanation: "Response contains absolute language that may indicate overgeneralization.",
      severity: 2
    }] : [],
    epistemicDistortions: [],
    emotionalInterference: hasPersonalOpinions ? [{
      type: "Emotional Reasoning",
      detectedEmotion: "Personal preference",
      segment: userText.substring(0, 100),
      explanation: "Response relies heavily on personal opinions rather than objective analysis.",
      severity: 2
    }] : [],
    languageIssues: isVague ? [{
      type: "Lack of Specificity",
      segment: userText.substring(0, 100),
      suggestion: "Consider providing more specific details and concrete examples.",
      severity: wordCount < 10 ? 3 : 2
    }] : [],
    thoughtQuality: {
      logicalIntegrity: hasAbsoluteLanguage ? 60 : 75,
      epistemicCalibration: hasPersonalOpinions ? 65 : 75,
      cognitiveFlexibility: 70,
      emotionalIntegration: hasPersonalOpinions ? 80 : 70,
      metacognitiveAwareness: 65,
      expressiveClarity: isVague ? 50 : 75,
    },
    detectedPatterns: [],
    recursiveStructures: [],
    domainSpecificIssues: {},
    overallScore: Math.round((75 + (hasAbsoluteLanguage ? -10 : 0) + (isVague ? -15 : 0) + (hasPersonalOpinions ? -5 : 0))),
    feedbackSummary: "Basic analysis completed. For more detailed insights, please ensure AI services are available.",
  };
}



