/**
 * Utility script to help convert existing probePrompt strings into 3 specific probe questions
 * Run this to get suggested probe questions for each node that still uses the old format
 */

export interface LegacyNodeData {
  id: string;
  title: string;
  probePrompt: string;
}

export function generateProbeQuestionsFromPrompt(nodeTitle: string, probePrompt: string): [string, string, string] {
  // Split existing prompt by question marks to see if it already contains multiple questions
  const existingQuestions = probePrompt.split('?').filter(q => q.trim()).map(q => q.trim() + '?');
  
  // Base template questions that can be customized per node
  const templates = {
    conceptual: `What are the key components or elements that make up ${nodeTitle}?`,
    application: `How does ${nodeTitle} apply in real-world situations or contexts?`,
    challenges: `What are the potential challenges, limitations, or common misconceptions about ${nodeTitle}?`,
    comparison: `How does ${nodeTitle} compare to or contrast with related concepts?`,
    examples: `What are some specific examples where ${nodeTitle} is particularly important or evident?`,
    connections: `How does ${nodeTitle} connect to or influence other concepts in this domain?`,
    problems: `What problems or issues does ${nodeTitle} help solve?`,
    variations: `What are different types, levels, or variations of ${nodeTitle}?`,
    conditions: `Under what conditions is ${nodeTitle} most effective or relevant?`,
    implications: `What are the broader implications or consequences of ${nodeTitle}?`
  };

  // If we already have good questions, use them
  if (existingQuestions.length >= 3) {
    return [existingQuestions[0], existingQuestions[1], existingQuestions[2]];
  }
  
  // If we have 2 questions, add a third
  if (existingQuestions.length === 2) {
    return [existingQuestions[0], existingQuestions[1], templates.connections];
  }
  
  // If we have 1 question, add two more
  if (existingQuestions.length === 1) {
    return [existingQuestions[0], templates.application, templates.challenges];
  }
  
  // If no good questions, generate from templates
  return [templates.conceptual, templates.application, templates.challenges];
}

// Sample nodes to demonstrate the conversion
export const sampleConversions: Record<string, { original: string; generated: [string, string, string] }> = {
  "Semantic Precision": {
    original: "What happens when semantic precision is lacking in professional, personal, or academic settings? Can excessive semantic precision become counterproductive?",
    generated: [
      "How do denotation and connotation work together to create precise meaning in specific contexts?",
      "What are some examples where slight word choice differences dramatically change the message's impact?",
      "How can cultural or professional contexts affect what constitutes 'precise' word choice?"
    ]
  },
  
  "Theory of Mind": {
    original: "How does theory of mind develop, and what conditions can impair it? What are some advanced applications beyond basic false belief understanding?",
    generated: [
      "What are some examples of false belief scenarios and how do they test theory of mind?",
      "How does theory of mind develop in children and what factors can enhance or impair it?",
      "What are some advanced applications of theory of mind in professional or social contexts?"
    ]
  },
  
  "Active Listening": {
    original: "What internal barriers (judgments, preparing responses, emotional reactions) interfere with active listening? How can these be managed?",
    generated: [
      "What internal barriers (judgments, preparing responses, emotional reactions) interfere with active listening?",
      "How can these barriers be managed or overcome in practice?",
      "What are the differences between surface-level hearing and deep active listening?"
    ]
  }
};

// Helper function to format the output for easy copy-paste into module files
export function formatProbeQuestionsForModule(nodeTitle: string, questions: [string, string, string]): string {
  return `probeQuestions: [
  "${questions[0]}",
  "${questions[1]}",
  "${questions[2]}"
],`;
}

// Example usage:
console.log("=== Probe Questions Generator ===");
console.log("\nSample conversions:");

Object.entries(sampleConversions).forEach(([title, data]) => {
  console.log(`\n${title}:`);
  console.log(`Original: ${data.original}`);
  console.log(`Generated:`);
  console.log(formatProbeQuestionsForModule(title, data.generated));
}); 