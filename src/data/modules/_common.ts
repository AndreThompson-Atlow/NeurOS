import type { Module, Node, NodeStatus, NodeType, NodeDownload, NodeEPIC, Domain } from '@/types/neuro';

// Define initial statuses used across modules
export const initialNodeStatus: NodeStatus = 'new';

// Placeholder EPIC prompts - More specific and varied
export const placeholderEPIC: NodeEPIC = {
  explainPrompt: "Explain this concept in your own words.",
  probeQuestions: [
    "What are the key components of this concept?",
    "How does this concept apply in real-world situations?",
    "What are the potential challenges or limitations of this concept?"
  ],
  implementPrompt: "Describe how you would apply this concept in practice.",
  connectPrompt: "How does this concept relate to other ideas you've learned?"
};

// Helper to ensure all node properties are present, providing defaults
// This function takes a node object that *might* be missing some required fields
// or might use the old structure, and returns a complete Node object.
const ensureCompleteNode = (nodeInput: Partial<Node> & { definition?: string, explanation?: string, example?: string, realWorldScenario?: string }, moduleId: string, domainId: string): Node => {
    const completeNode: Node = {
        id: nodeInput.id || `node-${moduleId}-${domainId}-${Date.now()}-${Math.random().toString(16).slice(2)}`, // More unique ID
        nodeType: nodeInput.nodeType || ('concept' as NodeType),
        title: nodeInput.title || 'Untitled Node',
        shortDefinition: nodeInput.shortDefinition || nodeInput.definition || 'No definition provided.',
        learningObjective: nodeInput.learningObjective || 'Understand this concept.',
        keyTerms: nodeInput.keyTerms || [],
        download: {
            clarification: nodeInput.download?.clarification || nodeInput.explanation || 'No clarification provided.',
            example: nodeInput.download?.example || nodeInput.example || 'No example provided.',
            scenario: nodeInput.download?.scenario || nodeInput.realWorldScenario || 'No scenario provided.',
            recallPrompt: nodeInput.download?.recallPrompt || `Explain "${nodeInput.title || 'this concept'}".`
        },
        epic: nodeInput.epic || placeholderEPIC, // Use provided epic or placeholder
        status: nodeInput.status || initialNodeStatus,
        familiar: nodeInput.familiar ?? false,
        understood: nodeInput.understood ?? false,
        moduleId: moduleId, 
        domainId: domainId, 
        memoryStrength: nodeInput.memoryStrength,
        lastReviewed: nodeInput.lastReviewed,
        reviewHint: nodeInput.reviewHint || `Recall the key aspects of ${nodeInput.title || 'this concept'}.`,
        chronicleEncounter: nodeInput.chronicleEncounter || { emotionalTheme: 'neutral', signatureEncounter: 'standard_challenge'},
    };
    return completeNode;
};


// Helper function to add status and ensure completeness of nodes, used by module definitions
// Takes an array of node objects that might be incomplete or use the old structure.
export const addStatusToNodes = (nodesInput: Array<Partial<Node> & { definition?: string, explanation?: string, example?: string, realWorldScenario?: string }>, moduleId: string, domainId: string): Node[] => {
  // If nodesInput is undefined or null, return an empty array to prevent errors.
  if (!nodesInput) {
    return [];
  }
  return nodesInput.map(nodeInput => ensureCompleteNode(nodeInput, moduleId, domainId));
};

// Helper to ensure domains have necessary fields for modules defined with only learningGoal
export const ensureCompleteDomains = (domainsInput: Array<Partial<Domain> & {nodes?: Array<Partial<Node> & { definition?: string, explanation?: string, example?: string, realWorldScenario?: string }>}>, moduleId: string): Domain[] => {
    if (!domainsInput) return [];
    return domainsInput.map((domainInput, index) => {
        const domainId = domainInput.id || `${moduleId}-d${index + 1}`;
        return {
            id: domainId,
            title: domainInput.title || `Domain ${index + 1}`,
            learningGoal: domainInput.learningGoal || `Master concepts in ${domainInput.title || `Domain ${index + 1}`}`,
            chronicleTheme: domainInput.chronicleTheme || "Standard Challenges",
            domainDungeonType: domainInput.domainDungeonType || "logic_maze",
            characterAffinities: domainInput.characterAffinities || [],
            specterAffinities: domainInput.specterAffinities || [],
            nodes: addStatusToNodes(domainInput.nodes || [], moduleId, domainId)
        };
    });
};
