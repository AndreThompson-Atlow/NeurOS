
export type CharacterAlignment = "law" | "chaos" | "neutral";
export type CharacterType = "guardian" | "specter" | "user" | "mentor" | "antagonist";
export type VoiceMode = "text" | "audio" | "hybrid";

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  role: string;
  alignment: CharacterAlignment;
  description: string;
  domains: string[];
  personalityProfile: string; // This will be used as the system prompt prefix
  phaseAffinity: {
    download: number;
    install: number;
    review: number;
    chronicle: number;
  };
  summonContexts: string[];
  preferredPhases: string[];
  avatarUrl?: string; // Optional
  voiceMode: VoiceMode;
  associatedSpecters?: string[];
  unlockConditions?: string[];
  faction?: "Architect's Dominion" | "Mirror Sanctuary" | "Greyline" | "Rift";
  shameEngineModes?: string[]; // For Neuros
  activationScript?: string;
  epicModifier?: {
    explainStyle: "structured" | "emotive" | "dialogical";
    probeStyle: "socratic" | "aggressive" | "subtle";
    implementStyle: "real-world" | "symbolic" | "absurd";
    connectStyle: "logical" | "emotional" | "cross-domain";
  };
}
