
import type { Module, ModuleStatus, Node, NodeType } from '@/types/neuro';
import { sovereignCoreModuleData } from './modules/sovereign-core';
import { thinkingModuleData } from './modules/thinking';
import { mechanicsModuleData } from './modules/mechanics';
import { communicationModuleData } from './modules/communication';
import { syntheticSystemsModuleData } from './modules/synthetic-systems';
import { chronologyModuleData } from './modules/chronology';
import { machiavelliStateModuleData } from './modules/statecraft';
import { pythonProgrammingData } from './modules/python-programming-module';

import { initialNodeStatus, placeholderEPIC } from './modules/_common';

const initialModuleStatus: ModuleStatus = 'new';

const predefinedModulesData: Omit<Module, 'status'>[] = [
  // Core
  sovereignCoreModuleData,

  // Pillars (Original 5 + WGU Pillars that were previously marked as Pillar)
  thinkingModuleData, 
  communicationModuleData, 
  chronologyModuleData,
  mechanicsModuleData,
  syntheticSystemsModuleData,
  
  // Auxiliary Modules
  machiavelliStateModuleData,
  pythonProgrammingData
];

const ensureCompleteNode = (nodeInput: Partial<Node> & { definition?: string, explanation?: string, example?: string, realWorldScenario?: string }, moduleId: string, domainId: string): Node => {
    const epicContent = nodeInput.epic || placeholderEPIC;
    const connectToArray = Array.isArray(epicContent.connectTo) ? epicContent.connectTo : [];

    return {
        id: nodeInput.id || `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        moduleId: moduleId,
        domainId: domainId,
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
        epic: { 
            explainPrompt: epicContent.explainPrompt || placeholderEPIC.explainPrompt,
            probePrompt: epicContent.probePrompt || placeholderEPIC.probePrompt,
            implementPrompt: epicContent.implementPrompt || placeholderEPIC.implementPrompt,
            connectPrompt: epicContent.connectPrompt || placeholderEPIC.connectPrompt,
            connectTo: connectToArray, 
        },
        status: nodeInput.status || initialNodeStatus,
        familiar: nodeInput.familiar ?? false,
        understood: nodeInput.understood ?? false,
        memoryStrength: nodeInput.memoryStrength,
        lastReviewed: nodeInput.lastReviewed,
        reviewHint: nodeInput.reviewHint || `Review ${nodeInput.title}`,
        chronicleEncounter: nodeInput.chronicleEncounter || { emotionalTheme: 'neutral', signatureEncounter: 'standard_challenge'},
    };
};


export const predefinedModules: Module[] = predefinedModulesData.map(moduleData => {
  const moduleId = moduleData.id || `module-${Date.now()}-${Math.random()}`;
  const domainsWithNodes = (moduleData.domains || []).map((domain, dIdx) => {
    const domainId = domain.id || `${moduleId}-d${dIdx + 1}-${Date.now()}`;
    return {
      ...domain,
      id: domainId,
      title: domain.title || `Domain ${dIdx + 1}`,
      learningGoal: domain.learningGoal || `Master concepts in ${domain.title || `Domain ${dIdx+1}`}`,
      chronicleTheme: domain.chronicleTheme || 'Standard challenges',
      domainDungeonType: domain.domainDungeonType || 'generic_trial',
      characterAffinities: domain.characterAffinities || [],
      specterAffinities: domain.specterAffinities || [],
      nodes: (domain.nodes || []).map((node, nIdx) => ensureCompleteNode(node as Partial<Node> & { definition?: string, explanation?: string, example?: string, realWorldScenario?: string }, moduleId, domainId))
    };
  });

  return {
    ...moduleData,
    id: moduleId,
    type: moduleData.type || 'auxiliary',
    title: moduleData.title || 'Untitled Module',
    description: moduleData.description || 'No description provided.',
    moduleLearningGoal: moduleData.moduleLearningGoal || 'Learn the concepts within this module.',
    domains: domainsWithNodes,
    status: initialModuleStatus,
    alignmentBias: moduleData.alignmentBias || 'neutral',
    defaultCompanion: moduleData.defaultCompanion || 'neuros',
    associatedSpecters: moduleData.associatedSpecters || [],
    recommendedChronicleDungeon: moduleData.recommendedChronicleDungeon || 'Generic Dungeon',
    moduleCategory: moduleData.moduleCategory || ['general'],
    reviewProfile: moduleData.reviewProfile || {
        decayModel: 'performance_adaptive',
        reviewClusters: [],
        interleaveRatio: 0.2,
    },
    dependencies: moduleData.dependencies || [],
    tags: moduleData.tags || [],
  };
});

export const getModuleById = (id?: string): Module | undefined => {
  if (!id) return undefined;
  const foundModule = predefinedModules.find(module => module.id === id);
  return foundModule ? JSON.parse(JSON.stringify(foundModule)) : undefined;
};

export const getAllModules = (): Module[] => {
    return JSON.parse(JSON.stringify(predefinedModules));
};
