# Probe Questions Migration Guide

## Overview

We're upgrading the NeuroOS learning system from single `probePrompt` strings to arrays of 3 specific `probeQuestions` per node. This provides more comprehensive learning assessment during the EPIC install phase.

## Changes Made

### 1. Updated Interface
```typescript
// OLD FORMAT
interface NodeEPIC {
  explainPrompt: string;
  probePrompt: string;  // Single question/prompt
  implementPrompt: string;
  connectPrompt: string;
}

// NEW FORMAT
interface NodeEPIC {
  explainPrompt: string;
  probeQuestions: [string, string, string];  // Exactly 3 questions
  implementPrompt: string;
  connectPrompt: string;
}
```

### 2. Updated Logic
- `fetchProbeQuestionsInternalCallback` now prioritizes the new `probeQuestions` array
- Falls back to legacy `probePrompt` conversion during transition
- AI generation still works as backup
- Probe question flow now always presents 3 questions sequentially

### 3. Backward Compatibility
During migration, the system supports both formats:
- **Preferred**: `probeQuestions: ["Question 1?", "Question 2?", "Question 3?"]`
- **Legacy**: `probePrompt: "Single prompt or multiple questions?"`

## Migration Process

### For Each Node:

1. **Identify the current probePrompt**
2. **Generate 3 specific questions** using one of these approaches:
   - Split existing prompt if it contains multiple questions
   - Create 3 focused questions covering different aspects
   - Use the generator utility (see below)

3. **Replace the format**:
```typescript
// BEFORE
epic: {
  explainPrompt: "...",
  probePrompt: "What are the challenges with this concept? How does it apply in practice?",
  implementPrompt: "...",
  connectPrompt: "..."
}

// AFTER  
epic: {
  explainPrompt: "...",
  probeQuestions: [
    "What are the main challenges or limitations of this concept?",
    "How does this concept apply in real-world situations?", 
    "What are some specific examples where this concept is most relevant?"
  ],
  implementPrompt: "...",
  connectPrompt: "..."
}
```

## Question Design Guidelines

### Good Probe Questions:
- **Specific and focused** - each question targets a different aspect
- **Open-ended** - require explanation, not just yes/no
- **Progressive depth** - build from basic to more complex
- **Practical relevance** - connect to real-world application

### Question Categories:
1. **Conceptual**: Components, definitions, mechanisms
2. **Applied**: Real-world usage, examples, contexts  
3. **Critical**: Limitations, challenges, comparisons
4. **Connections**: Relationships to other concepts
5. **Implications**: Consequences, broader impact

### Example Templates:
- `"What are the key components that make up [concept]?"`
- `"How does [concept] apply in [relevant context] situations?"`
- `"What are the potential challenges or limitations of [concept]?"`
- `"How does [concept] relate to or differ from [related concept]?"`
- `"What are some specific examples where [concept] is particularly important?"`

## Using the Generator Utility

The `src/scripts/generateProbeQuestions.ts` utility can help convert existing prompts:

```typescript
import { generateProbeQuestionsFromPrompt, formatProbeQuestionsForModule } from './generateProbeQuestions';

const questions = generateProbeQuestionsFromPrompt("Semantic Precision", "Original probe prompt here");
console.log(formatProbeQuestionsForModule("Semantic Precision", questions));
```

## Priority Modules to Update

1. **Communication** - Core learning module
2. **Thinking** - Frequently used concepts  
3. **Sovereign Core** - Foundation concepts
4. **Custom modules** - User-generated content

## Testing

After updating modules:
1. Start a learning session with the updated module
2. Progress to the probe step of any node
3. Verify 3 questions are presented sequentially
4. Confirm questions are specific and relevant to the concept

## Benefits

- **More comprehensive assessment** - 3 focused questions vs 1 broad prompt
- **Better learning progression** - specific aspects explored systematically  
- **Clearer difficulty progression** - each question can target different complexity levels
- **Improved user experience** - clear progress (Question 1 of 3, etc.)
- **Better analytics** - track performance on specific question types

## Status

- ✅ Core system updated to support new format
- ✅ Backward compatibility maintained
- ✅ Sample nodes converted (Semantic Precision, Syntactic Mastery, Pragmatic Context)
- ⏳ Remaining modules need conversion
- ⏳ Consider making `probeQuestions` required after migration complete 