'use server';
/**
 * @fileOverview Evaluate Response Flow - Cognitive Assessment System
 * 
 * This module provides functionality for evaluating a user's response during learning sessions.
 * It supports two evaluation paths:
 * 1. Simplified Path: Used when the Thought Analyzer is disabled, providing basic scoring and feedback
 * 2. Detailed Path: Used when the Thought Analyzer is enabled, providing in-depth analysis across multiple dimensions
 * 
 * The evaluation process includes:
 * - Scoring across multiple cognitive dimensions (clarity, relevance, depth, etc.)
 * - Detecting quality issues (mimicry, insufficient length, low coherence)
 * - Generating constructive feedback (overall and personalized)
 * - Optionally integrating with the Thought Analyzer for deeper analysis
 * 
 * @module EvaluateResponseFlow
 */

// Using consistent relative paths due to persistent resolution issues with aliases
import {ai as baseAi, generateWithCharacter} from '../../../lib/server/genkit'; 
import {z} from 'genkit';
import type { RubricScores as NeuroRubricScores, QualityFlags as NeuroQualityFlags, FeedbackOutput as NeuroFeedbackOutput, AnalysisResult, ShameIndexResult } from '@/types/neuro'; 
import { getCharacterById as fetchCharacterDetails } from '../../../lib/server/characters';
import { 
    EvaluateResponseInputSchema, 
    type EvaluateResponseInput,
    DetailedEvaluationResultSchema, 
    type EvaluateResponseOutput,
    simplifiedLlmOutputSchema,
    RubricDimensionScoreSchema,
} from './types/evaluateResponseTypes'; 


const DUMMY_SIMPLIFIED_RESPONSE: EvaluateResponseOutput = {
    overallScore: 0, // Changed to 0 for clearer failure indication
    overallFeedback: "AI evaluation (simplified) failed to generate a response. This is a fallback message.",
    isPass: false,
    rubricScores: { 
        clarity: { score: 0.0, label: "Clarity N/A" },
        relevance: { score: 0.0, label: "Relevance N/A" },
        depthOfThought: { score: 0.0, label: "Depth Of Thought N/A" },
        domainAlignment: { score: 0.0, label: "Domain Alignment N/A" },
        logicalIntegrity: { score: 0.0, label: "Logical Integrity N/A" },
        specificity: { score: 0.0, label: "Specificity N/A" },
        voiceAppropriateness: { score: 0.0, label: "Voice Appropriateness N/A" },
        originality: { score: 0.0, label: "Originality N/A" }
    },
    qualityFlags: { 
        mimicry: false,
        insufficientLength: false,
        lowCoherence: false
    },
    personalityFeedback: "Neuros is currently processing... this dummy response.",
    feedbackOutput: {
        mainFeedback: "AI evaluation (simplified) failed to generate a response. This is a fallback message.",
        growthSuggestions: [],
        metacognitivePrompts: ["Consider this dummy prompt."],
    },
    debug_error: "Simplified dummy response returned.",
    debug_rawAiOutput: null,
};

/**
 * Evaluates a user's response to a learning prompt and provides detailed feedback.
 * 
 * This function takes a user's response, the learning context, and evaluation parameters,
 * then produces a structured evaluation result with scores, feedback, and quality assessments.
 * It supports two modes of operation:
 * - Simplified evaluation (when Thought Analyzer is disabled)
 * - Detailed evaluation (when Thought Analyzer is enabled)
 * 
 * @param {EvaluateResponseInput} input - The input containing the user's response and evaluation context
 * @returns {Promise<EvaluateResponseOutput>} A structured evaluation result with scores and feedback
 */
export async function evaluateResponse(input: EvaluateResponseInput): Promise<EvaluateResponseOutput> {
  console.log('[evaluateResponseFlow]: ENTERED with input:', JSON.stringify(input, null, 2));
  
  let rawAiOutputString: string | null = null;
  let rawSimplifiedText: string | null = null;
  let debugErrorForSimplifiedPath: string | null = null;
  let overallFeedbackToUse: string;
  let personalityFeedbackText: string = "(Character feedback pending...)";

  // Initialize required rubric dimensions with default values
  const requiredDimensions = ['clarity', 'relevance', 'depthOfThought', 'domainAlignment', 'logicalIntegrity', 'specificity', 'voiceAppropriateness', 'originality'] as const;
  let ensuredRubricScores: NeuroRubricScores = {} as NeuroRubricScores; // Initialize to satisfy type
  for (const dim of requiredDimensions) {
    ensuredRubricScores[dim] = { score: 0.0, label: `${dim.charAt(0).toUpperCase() + dim.slice(1).replace(/([A-Z])/g, ' $1')} N/A` };
  }
  let finalQualityFlags: NeuroQualityFlags = { mimicry: false, insufficientLength: false, lowCoherence: false };

  // SIMPLIFIED EVALUATION PATH (when Thought Analyzer is disabled)
  if (input.isThoughtAnalyzerEnabled === false) {
    console.log('[evaluateResponseFlow]: Using SIMPLIFIED evaluation path.');
    let simplifiedParsedOutput: { overallScore: number; overallFeedback: string } = {
        overallScore: 70, // Default to passing score
        overallFeedback: "Your response demonstrates understanding of the core concepts."
    };

    try {
      console.log('[evaluateResponseFlow]: Calling AI for simplified eval...');
      
      // Use a more robust simplified evaluation that doesn't rely on thought analyzer features
      const simplifiedPrompt = `
        You are evaluating a user's response to a learning prompt. 
        Provide a straightforward evaluation with an overall score (0-100) and brief feedback.
        
        LEARNING TOPIC: "${input.nodeTitle || 'General knowledge'}"
        PROMPT: "${input.stepPrompt}"
        USER RESPONSE: "${input.userResponse}"
        
        Return ONLY a JSON object with these two fields:
        - overallScore: number from 0-100
        - overallFeedback: brief constructive feedback (1-2 sentences)
        
        Example:
        {"overallScore": 85, "overallFeedback": "Your response shows good understanding of the concept. Consider adding more specific examples to strengthen your explanation."}
      `;
      
      let responseReceived = false;
      
      try {
        // Try with the specified character first
        const llmSimplifiedResponse = await generateWithCharacter({
            prompt: simplifiedPrompt,
            characterId: input.judgingCharacterId || 'neuros',
            config: { temperature: 0.5, maxOutputTokens: 400 },
        });

        rawSimplifiedText = (llmSimplifiedResponse as any)?.response?.candidates()?.[0]?.content?.parts?.[0]?.text || null;
        responseReceived = !!rawSimplifiedText;
        console.log('[SIMPLIFIED AI RAW STRING OUTPUT - PRE-PARSE]:', rawSimplifiedText);
      } catch (apiError) {
        console.error('[SIMPLIFIED AI FIRST ATTEMPT ERROR]:', apiError);
        
        // If the first attempt fails, try again with a different character
        try {
          console.log('[evaluateResponseFlow]: Retrying with fallback character...');
          const fallbackResponse = await generateWithCharacter({
              prompt: simplifiedPrompt,
              characterId: 'neuros', // Always use neuros as fallback
              config: { temperature: 0.5, maxOutputTokens: 400 },
          });
          
          rawSimplifiedText = (fallbackResponse as any)?.response?.candidates()?.[0]?.content?.parts?.[0]?.text || null;
          responseReceived = !!rawSimplifiedText;
          console.log('[SIMPLIFIED AI FALLBACK OUTPUT]:', rawSimplifiedText);
        } catch (fallbackError) {
          console.error('[SIMPLIFIED AI FALLBACK ATTEMPT ERROR]:', fallbackError);
        }
      }

      // Process the AI response if we got one
      if (rawSimplifiedText) {
          try {
            // Extract JSON if embedded in other text
            const jsonMatch = rawSimplifiedText.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : rawSimplifiedText;
            
            const parsedAttempt = JSON.parse(jsonString);
            if (typeof parsedAttempt.overallScore === 'number' && typeof parsedAttempt.overallFeedback === 'string' && parsedAttempt.overallFeedback.trim()) {
                simplifiedParsedOutput = parsedAttempt;
                console.log('[SIMPLIFIED AI PARSED RAW OBJECT]:', JSON.stringify(simplifiedParsedOutput, null, 2));
            } else {
                 debugErrorForSimplifiedPath = "Simplified AI output parsing failed: missing or invalid overallScore/overallFeedback.";
                 console.error(debugErrorForSimplifiedPath, parsedAttempt);
                 
                 // Apply fallbacks if partial data is available
                 if (typeof parsedAttempt.overallScore === 'number') {
                   simplifiedParsedOutput.overallScore = parsedAttempt.overallScore;
                 }
                 if (typeof parsedAttempt.overallFeedback === 'string' && parsedAttempt.overallFeedback.trim()) {
                   simplifiedParsedOutput.overallFeedback = parsedAttempt.overallFeedback;
                 }
            }
          } catch (parseErr: any) {
            debugErrorForSimplifiedPath = `Simplified AI JSON parse error: ${parseErr.message || String(parseErr)}. Raw: ${rawSimplifiedText}`;
            console.error('[SIMPLIFIED AI JSON PARSE ERROR]:', parseErr);
            
            // Attempt to extract a score manually if JSON parsing failed
            const scoreMatch = rawSimplifiedText.match(/overallScore["\s:]+(\d+)/);
            if (scoreMatch && scoreMatch[1]) {
              simplifiedParsedOutput.overallScore = parseInt(scoreMatch[1], 10);
            }
            
            // Attempt to extract feedback manually if JSON parsing failed
            const feedbackMatch = rawSimplifiedText.match(/overallFeedback["\s:]+["'](.+?)["']/);
            if (feedbackMatch && feedbackMatch[1]) {
              simplifiedParsedOutput.overallFeedback = feedbackMatch[1];
            } else {
              // Use the raw text as feedback if it doesn't look like JSON
              if (!rawSimplifiedText.includes('{') && rawSimplifiedText.trim().length > 0) {
                simplifiedParsedOutput.overallFeedback = rawSimplifiedText.trim();
              }
            }
          }
      } else {
          debugErrorForSimplifiedPath = "Simplified AI returned no text output. Using fallback evaluation.";
          console.error(debugErrorForSimplifiedPath);
          
          // Implement simple heuristic-based evaluation as fallback
          const wordCount = input.userResponse.trim().split(/\s+/).filter(Boolean).length;
          
          // Check if response has keywords from the question/prompt
          const keywordsFromDefinition = input.nodeDefinition
            .toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 3);
          
          // Count matching keywords
          const matchingKeywords = keywordsFromDefinition.filter(keyword => 
            input.userResponse.toLowerCase().includes(keyword)
          );
          
          // Set score based on word count and keyword matching
          if (wordCount < 10) {
            simplifiedParsedOutput.overallScore = 40;
            simplifiedParsedOutput.overallFeedback = "Your answer is too brief. Please provide a more detailed explanation.";
          } else if (wordCount >= 50 && matchingKeywords.length >= Math.min(3, keywordsFromDefinition.length)) {
            simplifiedParsedOutput.overallScore = 85;
            simplifiedParsedOutput.overallFeedback = "Your detailed response demonstrates good understanding of the concept.";
          } else if (wordCount >= 25) {
            simplifiedParsedOutput.overallScore = 70;
            simplifiedParsedOutput.overallFeedback = "Your response covers the basics well. Consider adding more specific details.";
          } else {
            simplifiedParsedOutput.overallScore = 60;
            simplifiedParsedOutput.overallFeedback = "Your response addresses the question but could be more detailed.";
          }
          
          // Check for direct copying from node content
          if (input.nodeContent && 
              input.userResponse.length > 50 && 
              calculateSimilarity(input.userResponse, input.nodeContent) > 0.8) {
            simplifiedParsedOutput.overallScore = Math.max(30, simplifiedParsedOutput.overallScore - 40);
            simplifiedParsedOutput.overallFeedback = "Your answer appears to copy directly from the source material. Try explaining in your own words.";
          }
      }
    } catch (e: any) {
        debugErrorForSimplifiedPath = `Simplified AI call error: ${e.message || String(e)}`;
        console.error('[SIMPLIFIED AI CALL ERROR]:', e);
        
        // Apply fallback evaluation
        simplifiedParsedOutput.overallScore = 70;
        simplifiedParsedOutput.overallFeedback = "Your response demonstrates understanding of the key concepts.";
    }
    
    // Ensure we have at least a reasonable default score if everything failed
    if (simplifiedParsedOutput.overallScore === 0 && !debugErrorForSimplifiedPath) {
      simplifiedParsedOutput.overallScore = 70; // Default to passing score if we can't determine otherwise
    }
    
    overallFeedbackToUse = simplifiedParsedOutput.overallFeedback;

    // Generate personality-based feedback if a character ID is provided
    if(input.judgingCharacterId) {
        const character = await fetchCharacterDetails(input.judgingCharacterId);
        if(character) {
             const personalityPromptForFeedback = `
                You are ${character.name}. Personality: ${character.personalityProfile}.
                The user was asked: "${input.stepPrompt}"
                They responded: "${input.userResponse}"
                The overall score was: ${simplifiedParsedOutput.overallScore}%.
                Generic Feedback based on this score: "${overallFeedbackToUse}"
                Provide a concise, in-character tip, suggestion, or critique (1-2 sentences) based on these details.
                If they did well (score > 75), offer praise. If they struggled (score < 60), offer a constructive pointer.
             `;
            try {
                const personalityFeedbackResult = await generateWithCharacter({
                    prompt: personalityPromptForFeedback,
                    characterId: input.judgingCharacterId, 
                    config: { temperature: 0.6, maxOutputTokens: 200 }
                });
                const rawPersonalityFeedbackText = (personalityFeedbackResult as any)?.response?.candidates()?.[0]?.content?.parts?.[0]?.text;
                personalityFeedbackText = (rawPersonalityFeedbackText && rawPersonalityFeedbackText.trim()) ? rawPersonalityFeedbackText.trim() : `(${character.name} nods thoughtfully at your response.)`;
            } catch (e) {
                console.error(`Error generating personality feedback for ${character.name}:`, e);
                personalityFeedbackText = `(${character.name} seems impressed with your effort.)`;
            }
        } else {
            personalityFeedbackText = "(Your response has been noted.)";
        }
    } else {
        personalityFeedbackText = "Your response has been recorded.";
    }

    // Initialize quality flags with definite boolean values for simplified path
    finalQualityFlags = {
        mimicry: false,
        insufficientLength: input.userResponse.trim().split(/\s+/).filter(Boolean).length < 15,
        lowCoherence: false
    };
    
    // Create feedback outputs
    const feedbackOutput: NeuroFeedbackOutput = { 
        mainFeedback: overallFeedbackToUse,
        growthSuggestions: input.userResponse.trim().split(/\s+/).filter(Boolean).length < 15 ? 
            ["Consider providing a more detailed response next time."] : [],
        metacognitivePrompts: ["What did you learn from this concept?"],
        warningFlags: finalQualityFlags.insufficientLength ? ["Response may be too brief."] : undefined,
    };

    return { // Direct object construction, no Zod parse here for simplified path
        overallScore: simplifiedParsedOutput.overallScore,
        overallFeedback: overallFeedbackToUse,
        isPass: simplifiedParsedOutput.overallScore >= 70, // Lower threshold for simplified path
        rubricScores: ensuredRubricScores, 
        qualityFlags: finalQualityFlags,  
        personalityFeedback: personalityFeedbackText,
        analysisResult: undefined, 
        shameIndexResult: undefined,
        feedbackOutput: feedbackOutput,
        debug_rawAiOutput: rawSimplifiedText || null,
        debug_error: debugErrorForSimplifiedPath || null,
    };
  }
  
  // DETAILED EVALUATION PATH (when Thought Analyzer is enabled)
  console.log('[evaluateResponseFlow]: Using DETAILED evaluation path.');
  let llmRawOutput: any = {}; // Initialize as an empty object
  let debugError: string | null = null;
  let rawAiOutputStringForError: string | null = null; // To store raw output if parsing fails

  try {
    console.log('[evaluateResponseFlow]: Calling AI for detailed eval...');
    
    // Prepare prompt by manually replacing variables
    let processedPrompt = evaluateResponsePromptString;
    
    // Replace conditionals
    if (input.judgingCharacterId) {
      processedPrompt = processedPrompt.replace('{{#if judgingCharacterId}}', '')
                                       .replace('{{/if}}', '')
                                       .replace('{{judgingCharacterId}}', input.judgingCharacterId);
    } else {
      // Remove conditional block if no judgingCharacterId
      processedPrompt = processedPrompt.replace(/\{\{#if judgingCharacterId\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }
    
    // Replace node content conditional
    if (input.nodeContent) {
      processedPrompt = processedPrompt.replace('{{#if nodeContent}}', '')
                                       .replace('{{/if}}', '')
                                       .replace('{{{nodeContent}}}', input.nodeContent);
    } else {
      // Remove conditional block if no nodeContent
      processedPrompt = processedPrompt.replace(/\{\{#if nodeContent\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }
    
    // Replace triple-braced variables
    const variables = ['nodeTitle', 'nodeDefinition', 'nodeExplanation', 'stepType', 'stepPrompt', 'userResponse'];
    for (const variable of variables) {
      const value = input[variable as keyof EvaluateResponseInput];
      if (typeof value === 'string') {
        processedPrompt = processedPrompt.replace(new RegExp(`\\{\\{\\{${variable}\\}\\}\\}`, 'g'), value);
      }
    }
    
    const llmResponse = await generateWithCharacter({ 
      prompt: processedPrompt,
      characterId: input.judgingCharacterId || 'neuros',
      config: { temperature: 0.4 }
      // No output schema enforcement here for detailed path debugging
    });

    rawAiOutputString = (llmResponse as any)?.response?.candidates()?.[0]?.content?.parts?.[0]?.text || null;
    rawAiOutputStringForError = rawAiOutputString; // Capture for potential error return
    console.log('[AI RAW STRING OUTPUT - PRE-PARSE]:', rawAiOutputString);
    
    if (rawAiOutputString) {
        llmRawOutput = JSON.parse(rawAiOutputString);
        console.log('[AI PARSED RAW OBJECT - PRE-DEFAULTING]:', JSON.stringify(llmRawOutput, null, 2));
    } else {
        debugError = "Detailed AI returned no text output.";
        llmRawOutput.rubricScores = {}; 
        llmRawOutput.qualityFlags = {};
    }
  } catch(e: any) {
    debugError = `Detailed AI call or JSON parse error: ${e.message || String(e)}. Raw output: ${rawAiOutputStringForError || 'N/A'}`;
    console.error('[DETAILED AI CALL OR PARSE ERROR]:', e);
    llmRawOutput.rubricScores = {}; 
    llmRawOutput.qualityFlags = {}; 
  }
  
  // Ensure rubricScores object exists with default values if needed
  if (typeof llmRawOutput.rubricScores !== 'object' || llmRawOutput.rubricScores === null) {
    llmRawOutput.rubricScores = {};
    if (!debugError) { 
        debugError = (debugError ? debugError + " " : "") + "AI did not return the 'rubricScores' object or it was malformed; defaulted.";
    }
  }
  
  // Process each rubric dimension, applying defaults where needed
  for (const dim of requiredDimensions) {
      const aiDimData = llmRawOutput.rubricScores![dim]; 
      const score = (aiDimData && typeof aiDimData.score === 'number') ? Math.max(0, Math.min(1, aiDimData.score)) : 0.0;
      const label = (aiDimData && typeof aiDimData.label === 'string' && aiDimData.label.trim() !== "") ? aiDimData.label.trim() : `${dim.charAt(0).toUpperCase() + dim.slice(1).replace(/([A-Z])/g, ' $1')} N/A`;
      ensuredRubricScores[dim] = { score, label };
  }
  console.log('[DEFAULTED RUBRIC SCORES]:', JSON.stringify(ensuredRubricScores, null, 2));

  // Ensure qualityFlags object exists with default values if needed
  if (typeof llmRawOutput.qualityFlags !== 'object' || llmRawOutput.qualityFlags === null) {
    llmRawOutput.qualityFlags = {};
     if (!debugError) { 
        debugError = (debugError ? debugError + " " : "") + "AI did not return the 'qualityFlags' object or it was malformed; defaulted.";
    }
  }

  // Process quality flags, applying defaults where needed
  const wordCount = input.userResponse.trim().split(/\s+/).filter(Boolean).length;
  finalQualityFlags.mimicry = typeof llmRawOutput.qualityFlags!.mimicry === 'boolean' ? llmRawOutput.qualityFlags!.mimicry : false;
  finalQualityFlags.insufficientLength = typeof llmRawOutput.qualityFlags!.insufficientLength === 'boolean' 
      ? llmRawOutput.qualityFlags!.insufficientLength 
      : (wordCount < 15 && ((ensuredRubricScores.depthOfThought?.score || 0) < 0.5 || (ensuredRubricScores.specificity?.score || 0) < 0.5));
  finalQualityFlags.lowCoherence = typeof llmRawOutput.qualityFlags!.lowCoherence === 'boolean' 
      ? llmRawOutput.qualityFlags!.lowCoherence 
      : ((ensuredRubricScores.clarity?.score || 0) < 0.3 && (ensuredRubricScores.logicalIntegrity?.score || 0) < 0.3);
  console.log('[DEFAULTED QUALITY FLAGS]:', JSON.stringify(finalQualityFlags, null, 2));
  
  // Get overall feedback text, using default if missing
  overallFeedbackToUse = (llmRawOutput && typeof llmRawOutput.overallFeedback === 'string' && llmRawOutput.overallFeedback.trim()) 
      ? llmRawOutput.overallFeedback.trim() 
      : "Detailed evaluation feedback could not be fully generated by the AI at this time."; 
  if (!debugError && (!llmRawOutput || !llmRawOutput.overallFeedback?.trim())) {
      debugError = (debugError ? debugError + " " : "") + "AI did not return 'overallFeedback' or it was empty.";
  }
  
  // Check for content mimicry if originality score is low
  if (input.nodeContent && (ensuredRubricScores.originality?.score || 0) < 0.3) { 
      const similarityScore = calculateSimilarity(input.userResponse, input.nodeContent);
      if (similarityScore > 0.80) { 
          finalQualityFlags.mimicry = true;
          if(ensuredRubricScores.originality) ensuredRubricScores.originality = { score: Math.min(ensuredRubricScores.originality.score, 0.1), label: "High Similarity" };
      }
  }
  
  // Calculate overall score from rubric dimensions
  const rubricScoreValues = Object.values(ensuredRubricScores).map(rs => rs!.score);
  const averageRubricScore = rubricScoreValues.length > 0 ? rubricScoreValues.reduce((sum, val) => sum + val, 0) / rubricScoreValues.length : 0;
  
  // Apply penalties for quality issues
  let finalOverallScore = Math.round(averageRubricScore * 100);
  if (finalQualityFlags.mimicry) finalOverallScore = Math.max(0, finalOverallScore - 40);
  if (finalQualityFlags.insufficientLength && finalOverallScore > 30) finalOverallScore = Math.max(0, finalOverallScore - 20);
  if (finalQualityFlags.lowCoherence) finalOverallScore = Math.max(0, finalOverallScore - 50);
  finalOverallScore = Math.max(0, Math.min(100, finalOverallScore));

  // Determine passing status based on score thresholds
  let isPass = finalOverallScore >= 80;
  for (const dim of requiredDimensions) {
      if ((ensuredRubricScores[dim]?.score || 0) < 0.50) {
          isPass = false;
          break;
      }
  }
  
  // Generate personality-based feedback if a character ID is provided
  if (input.judgingCharacterId) {
      const character = await fetchCharacterDetails(input.judgingCharacterId); 
      if (character) {
           const personalityPromptForFeedback = `
              You are ${character.name}. Personality: ${character.personalityProfile}.
              The user was asked: "${input.stepPrompt}"
              They responded: "${input.userResponse}"
              Generic Feedback from prior evaluation: "${overallFeedbackToUse}" 
              Key areas of their response scored (0.0-1.0):
              Clarity: ${(ensuredRubricScores.clarity?.score || 0).toFixed(2)} (${ensuredRubricScores.clarity?.label || 'N/A'})
              Relevance: ${(ensuredRubricScores.relevance?.score || 0).toFixed(2)} (${ensuredRubricScores.relevance?.label || 'N/A'})
              Depth: ${(ensuredRubricScores.depthOfThought?.score || 0).toFixed(2)} (${ensuredRubricScores.depthOfThought?.label || 'N/A'})
              Originality: ${(ensuredRubricScores.originality?.score || 0).toFixed(2)} (${ensuredRubricScores.originality?.label || 'N/A'})
              Overall score: ${finalOverallScore}%
              Provide a concise, in-character tip, suggestion, or critique (1-3 sentences) based on these details.
              If they did well overall (score > 75), offer praise and a minor point for deeper consideration.
              If they struggled (score < 60), offer a specific, constructive pointer related to a low-scoring rubric dimension.
           `;
          try {
              const personalityFeedbackResult = await generateWithCharacter({
                  prompt: personalityPromptForFeedback,
                  characterId: input.judgingCharacterId, 
                  config: { temperature: 0.6 }
              });
              const rawPersonalityFeedbackText = (personalityFeedbackResult as any)?.response?.candidates()?.[0]?.content?.parts?.[0]?.text;
              personalityFeedbackText = (rawPersonalityFeedbackText && rawPersonalityFeedbackText.trim()) ? rawPersonalityFeedbackText.trim() : `(${character.name} ponders your response...)`;
          } catch (e) {
               console.error(`Error generating personality feedback for ${character.name}:`, e);
               personalityFeedbackText = `(${character.name} seems to be having trouble forming a thought right now.)`;
          }
      } else {
           personalityFeedbackText = "(Could not load judging character details for feedback.)";
      }
  } else {
      personalityFeedbackText = "No specific guide assigned for personalized feedback.";
  }
  
  // Generate feedback output with growth suggestions and metacognitive prompts
  const feedbackOutputData: NeuroFeedbackOutput = {
      mainFeedback: overallFeedbackToUse,
      growthSuggestions: Object.values(ensuredRubricScores).filter(rs => rs!.score < 0.6).map(rs_1 => `Focus on improving ${rs_1!.label.toLowerCase().replace(' n/a','')} by providing more detailed examples or exploring counter-arguments.`),
      metacognitivePrompts: [
          "What part of this concept felt most challenging and why?",
          "If you were to explain this to someone else, what analogy would you use?",
          "What assumptions did you make when formulating your response?",
      ],
      warningFlags: finalQualityFlags.mimicry ? ["High similarity to source material detected. Try rephrasing in your own words."] : 
                    finalQualityFlags.insufficientLength ? ["Response may be too brief."] : 
                    finalQualityFlags.lowCoherence ? ["Response lacks clear structure or coherence."] : undefined,
  };
  
  // Prepare final result for schema validation
  const resultForZodParse = {
      overallScore: finalOverallScore,
      overallFeedback: overallFeedbackToUse,
      isPass: isPass,
      rubricScores: ensuredRubricScores, 
      qualityFlags: finalQualityFlags, 
      personalityFeedback: personalityFeedbackText,
      feedbackOutput: feedbackOutputData, 
      debug_rawAiOutput: rawAiOutputStringForError || null, // ensure it's null if nothing captured
      debug_error: debugError || null, // ensure it's null if no error
  };
  console.log('[evaluateResponseFlow]: RETURNING evaluation output for detailed path:', JSON.stringify(resultForZodParse, null, 2));

  return DetailedEvaluationResultSchema.parse(resultForZodParse);
}
    
const simplifiedEvaluateResponsePromptString = `You are an expert learning evaluator.
Evaluate the user's response to the following:
Concept: "{{{nodeTitle}}}"
Prompt: "{{{stepPrompt}}}"
User Response: "{{{userResponse}}}"

Provide an overall score (0-100) and brief overall feedback (1-2 sentences). **The overallFeedback field is mandatory and must not be empty.**
Output Format:
{
  "overallScore": <integer>,
  "overallFeedback": "<string>"
}`;

const evaluateResponsePromptString = `You are an expert learning evaluator for the NeuroOS system.
Your task is to assess a user's response during a learning session based on the provided concept details and the user's submission.

{{#if judgingCharacterId}}
(You are evaluating as {{judgingCharacterId}}. Ensure your 'overallFeedback' reflects this character's style if possible, while still being constructive. Specific personality-driven feedback will be generated separately.)
{{/if}}

Context:
Concept Title: "{{{nodeTitle}}}"
Concept Definition (provided to user): "{{{nodeDefinition}}}"
Concept Clarification/Explanation (provided to user): "{{{nodeExplanation}}}"
{{#if nodeContent}}
Full Node Content (for mimicry check): "{{{nodeContent}}}"
{{/if}}

Learning Step Details:
Step Type: "{{{stepType}}}"
User was asked: "{{{stepPrompt}}}"

User's Response:
"{{{userResponse}}}"

Evaluation Task:
1.  **Rubric Scores**: Provide a score (float from 0.0 for very poor to 1.0 for excellent) AND a brief narrative label (2-5 words, e.g., "Very Clear", "Lacks Depth") for EACH of the following 8 dimensions. **ALL 8 dimensions MUST be included and scored with their 'score' and 'label' fields in your JSON output**:
    *   **clarity**: Is the language unambiguous, structured, and understandable?
    *   **relevance**: Does the response directly answer the prompt or scenario?
    *   **depthOfThought**: Does it show nuance, complexity, or layered reasoning?
    *   **domainAlignment**: Is it grounded in accurate module/domain knowledge (based on provided definition & clarification)?
    *   **logicalIntegrity**: Does it avoid fallacies, contradictions, or unfounded claims?
    *   **specificity**: Are vague phrases avoided in favor of precise reasoning and examples?
    *   **voiceAppropriateness**: Does the tone match the requested persona (if any) or prompt type?
    *   **originality**: Was the answer creatively/originally constructed, or does it appear to be rote mimicry of the provided "Concept Clarification/Explanation" or "Full Node Content"?

2.  **Quality Flags**: Determine if the following flags apply (true/false). **ALL flags must be explicitly set in your JSON output**:
    *   **mimicry**: (True if Originality score is very low, e.g., < 0.3, or response is highly similar to provided content.)
    *   **insufficientLength**: (True if the response is very short, e.g., < 15 words AND fails to adequately address the prompt.)
    *   **lowCoherence**: (True if Clarity and Logical Integrity scores are both very low, e.g., < 0.3, making it very hard to understand.)

3.  **Overall Feedback**: Provide a generic, constructive summary (2-4 sentences) explaining the main strengths and weaknesses of the user's response based on your rubric assessment. **This field is mandatory and must not be empty.**

Output Format:
Return your evaluation as a SINGLE JSON object with the following structure. **Ensure all fields are present and all 8 rubric dimensions are scored with their 'score' and 'label' fields, and all 3 quality flags are set**:
{
  "rubricScores": {
    "clarity": { "score": <float>, "label": "<string>" },
    "relevance": { "score": <float>, "label": "<string>" },
    "depthOfThought": { "score": <float>, "label": "<string>" },
    "domainAlignment": { "score": <float>, "label": "<string>" },
    "logicalIntegrity": { "score": <float>, "label": "<string>" },
    "specificity": { "score": <float>, "label": "<string>" },
    "voiceAppropriateness": { "score": <float>, "label": "<string>" },
    "originality": { "score": <float>, "label": "<string>" }
  },
  "qualityFlags": {
    "mimicry": <boolean>,
    "insufficientLength": <boolean>,
    "lowCoherence": <boolean>
  },
  "overallFeedback": "<string>"
}
Ensure all scores are between 0.0 and 1.0. Ensure all labels are short (2-5 words, max 30 chars). Ensure overallFeedback is not empty.
`;
    
/**
 * Calculates the textual similarity between two strings.
 * 
 * This function computes a Jaccard similarity coefficient between two texts
 * by comparing the sets of words they contain. It's used to detect potential
 * mimicry/plagiarism in user responses.
 * 
 * @param {string} text1 - The first text to compare (typically the user response)
 * @param {string} text2 - The second text to compare (typically the source material)
 * @returns {number} A similarity score between 0 (no similarity) and 1 (identical)
 */
function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2 || text1.length < 10 || text2.length < 10) return 0; 
  const normalize = (txt: string) => txt.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  const set1 = new Set(normalize(text1));
  const set2 = new Set(normalize(text2));
  if (set1.size === 0 || set2.size === 0) return 0;
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}
