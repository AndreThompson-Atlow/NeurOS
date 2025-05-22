// This is a placeholder comment to remind you to copy the fixed version of useLearningSession.ts
// to the actual useLearningSession.ts file. The key fix is to ensure that the generateKnowledgeChecksCallback 
// function is defined AFTER the state variables it depends on (like currentNode, activeSession, etc.).

// Here's how the beginning of the hook should be structured:
// 1. State initialization (useState calls)
// 2. Extract state from learningState (using destructuring)
// 3. Derived state using useMemo
// 4. Define state-independent callbacks
// 5. Define callbacks that depend on derived state
// 6. Define the generateKnowledgeChecksCallback after all its dependencies 