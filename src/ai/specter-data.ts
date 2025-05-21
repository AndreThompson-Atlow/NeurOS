
import type { Specter } from '@/types/chronicle';

export const SPECTER_TYPES_DATA: Record<string, Partial<Specter>> = {
  "certainty-specter": {
    id: "certainty-specter",
    name: "Certainty Specter",
    description: "Questions knowledge foundations; collapses when limitations are acknowledged.",
    abilities: [ ], // Populate with specific Ability objects or IDs
    recruitCondition: "Demonstrate comfort with uncertainty while maintaining practical confidence."
  },
  "emotion-specter": {
    id: "emotion-specter",
    name: "Emotion Specter",
    description: "Challenges emotional reasoning; requires integration of emotion with logic.",
    abilities: [ ],
    recruitCondition: "Demonstrate integration of emotional insight with logical analysis."
  },
   "control-specter": {
    id: "control-specter",
    name: "Control Specter",
    description: "Tests boundaries of influence; requires acceptance of limited control.",
    abilities: [],
    recruitCondition: "Demonstrate effective agency within actual sphere of control."
  },
  "identity-specter": {
    id: "identity-specter",
    name: "Identity Specter",
    description: "Probes belief consistency; requires reconciliation of contradictory beliefs.",
    abilities: [],
    recruitCondition: "Articulate a coherent, multifaceted self-narrative."
  },
  "contradiction-specter": {
    id: "contradiction-specter",
    name: "Contradiction Specter",
    description: "Highlights inconsistencies; requires resolution of paradox.",
    abilities: [],
    recruitCondition: "Successfully resolve a presented logical or practical paradox."
  },
  "complexity-specter": {
    id: "complexity-specter",
    name: "Complexity Specter",
    description: "Introduces unexpected variables; requires adaptation to changing conditions.",
    abilities: [],
    recruitCondition: "Demonstrate ability to find simple, elegant solutions in complex environments."
  },
  "rigidity-specter": {
    id: "rigidity-specter",
    name: "Rigidity Specter",
    description: "Represents resistance to new ideas or changing mental models.",
    abilities: [],
    recruitCondition: "Demonstrate cognitive flexibility by successfully applying a new framework."
  },
  "fragmentation-specter": {
    id: "fragmentation-specter",
    name: "Fragmentation Specter",
    description: "Embodies siloed thinking and the inability to see connections between disparate concepts.",
    abilities: [],
    recruitCondition: "Successfully synthesize knowledge from multiple, seemingly unrelated domains."
  },
  "performance-specter": {
    id: "performance-specter",
    name: "Performance Specter",
    description: "Creates anxiety around outcomes and efficiency, often leading to suboptimal strategies or burnout.",
    abilities: [],
    recruitCondition: "Demonstrate effective process focus over pure outcome fixation."
  },
   "narrative-specter": {
    id: "narrative-specter",
    name: "Narrative Specter",
    description: "Represents being trapped by limiting or false self-stories; collapses when a new, empowering narrative is authored and embodied.",
    abilities: [ ],
    recruitCondition: "Successfully re-author a significant personal narrative and demonstrate behavioral change aligned with it."
  },
  "externalization-specter": {
    id: "externalization-specter",
    name: "Externalization Specter",
    description: "Manifests as blaming external factors for internal states or issues; collapses with radical ownership.",
    abilities: [ ],
    recruitCondition: "Demonstrate consistent internal locus of control and responsibility for one's responses."
  },
   "recursion-specter": {
    id: "recursion-specter",
    name: "Recursion Specter",
    description: "Represents unproductive infinite loops in thought or behavior; collapses when a clear exit condition or higher-order perspective is established.",
    abilities: [],
    recruitCondition: "Successfully identify and break a significant recursive pattern by defining a meta-rule or achieving a new level of abstraction."
  },
};

Object.freeze(SPECTER_TYPES_DATA);

    