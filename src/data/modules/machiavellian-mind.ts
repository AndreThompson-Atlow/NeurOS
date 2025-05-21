
import type { Module, ModuleType } from '@/types/neuro';
import { placeholderEPIC, addStatusToNodes } from './_common';

export const machiavellianMindModuleData: Omit<Module, 'status'> = {
    id: 'machiavellian-mind',
    type: 'auxiliary' as ModuleType,
    title: 'The Machiavellian Mind: Strategic Power in NeuroOS',
    description: "This module explores Niccolò Machiavelli's 'The Prince' as more than historical text—it serves as a practical guide to understanding power dynamics across contexts from politics to organizational leadership. By analyzing Machiavelli's insights through the NeuroOS framework, learners develop sophisticated strategic thinking capabilities applicable to modern challenges.",
    moduleLearningGoal: "To transform classical political philosophy from Machiavelli's 'The Prince' into a practical framework for strategic thinking, historical pattern recognition, and power dynamics analysis.",
    tags: ["machiavelli", "the-prince", "strategy", "power-dynamics", "political-philosophy", "leadership"],
    dependencies: ["sovereign-core", "thinking", "communication", "chronology", "mechanics", "synthetic-systems"],
    alignmentBias: "neutral",
    defaultCompanion: "praxis",
    associatedSpecters: ["control-specter", "complexity-specter", "certainty-specter", "narrative-specter"],
    recommendedChronicleDungeon: "The Prince's Labyrinth",
    moduleCategory: ["strategic-thinking", "political-science", "leadership"],
    reviewProfile: {
      decayModel: "performance_adaptive",
      reviewClusters: [
        ["machiavelli-d1-n1", "machiavelli-d1-n2"],
        ["machiavelli-d2-n1", "machiavelli-d2-n2", "machiavelli-d2-n3"],
        ["machiavelli-d3-n1", "machiavelli-d3-n2", "machiavelli-d3-n3"]
      ],
      interleaveRatio: 0.3
    },
    domains: [
      {
        id: 'machiavelli-d1',
        title: 'Historical Foundations of The Prince',
        learningGoal: "Understand the Renaissance Italian context that shaped Machiavelli's political philosophy and his relationship with classical thought.",
        chronicleTheme: "Navigating the political intrigues of Renaissance Florence.",
        domainDungeonType: "historical_archive",
        characterAffinities: ["chronicler", "neuros", "veritas"],
        specterAffinities: ["certainty-specter", "narrative-specter"],
        nodes: addStatusToNodes([
          {
            id: 'machiavelli-d1-n1',
            title: 'Machiavelli and His World',
            nodeType: 'concept',
            shortDefinition: "Examines the historical context of Renaissance Italy that shaped Machiavelli's perspectives.",
            learningObjective: "Students will understand how political instability, warfare, and the rise of city-states influenced his pragmatic approach to politics.",
            keyTerms: ["Renaissance Italy", "Medici Family", "Florentine Republic", "Italian Wars", "Diplomatic Missions"],
            download: {
              clarification: "Machiavelli wrote 'The Prince' in 1513 after being exiled from Florence following the return of the Medici family to power. The text reflects both his diplomatic experiences and his study of classical history.",
              example: "Machiavelli served as a diplomat to Cesare Borgia, whose strategic brilliance and ruthlessness became a model for 'The Prince'.",
              scenario: "You're a diplomat in Renaissance Florence tasked with observing and reporting on the military strategies of neighboring city-states. What patterns would you look for to understand their strengths and vulnerabilities?",
              recallPrompt: "Explain how Machiavelli's diplomatic career influenced the practical advice presented in 'The Prince'."
            },
            epic: placeholderEPIC,
            reviewHint: "Focus on how specific historical events (e.g., Italian Wars, Medici rule) shaped Machiavelli's perspective on power and stability.",
            chronicleEncounter: { emotionalTheme: "Disillusionment", signatureEncounter: "The Diplomat's Dispatch" }
          },
          {
            id: 'machiavelli-d1-n2',
            title: 'Classical Influences and Innovations',
            nodeType: 'concept',
            shortDefinition: "Explores how Machiavelli drew from and departed from classical political thought.",
            learningObjective: "Students will understand his relationship to ancient thinkers while recognizing his innovative approaches to political analysis.",
            keyTerms: ["Classical Republicanism", "Virtù", "Fortuna", "Realpolitik", "Exempla"],
            download: {
              clarification: "Machiavelli drew extensively from Roman historians like Livy and Tacitus but departed from classical thinkers by separating politics from traditional ethics.",
              example: "While Cicero emphasized moral virtue in leadership, Machiavelli focused on effective action, even if it required morally questionable decisions.",
              scenario: "You're advising a leader who must choose between upholding a moral principle that might weaken the state or taking an expedient action that strengthens the state but violates traditional ethics. How would Machiavelli frame this decision?",
              recallPrompt: "Explain the difference between classical virtue and Machiavellian virtù."
            },
            epic: placeholderEPIC,
            reviewHint: "Contrast Machiavelli's concept of virtù with classical virtue ethics (e.g., Aristotle, Cicero) and identify his key departures in political analysis.",
            chronicleEncounter: { emotionalTheme: "Intellectual Independence", signatureEncounter: "The Classical Debate" }
          }
        ], 'machiavellian-mind', 'machiavelli-d1'),
      },
      {
        id: 'machiavelli-d2',
        title: 'Individuals and States in Strategic Analysis',
        learningGoal: "Analyze Machiavelli's insights into leadership psychology and strategic power dynamics.",
        chronicleTheme: "Observing and influencing power struggles in simulated principalities.",
        domainDungeonType: "strategic_simulation_chamber",
        characterAffinities: ["praxis", "neurosis", "architect"],
        specterAffinities: ["control-specter", "identity-specter", "complexity-specter"],
        nodes: addStatusToNodes([
          {
            id: 'machiavelli-d2-n1',
            title: 'The Psychology of Leadership',
            nodeType: 'concept',
            shortDefinition: "Examines Machiavelli's psychological insights into leadership, focusing on qualities that maintain power.",
            learningObjective: "Students will analyze Machiavellian principles of leadership psychology and apply them to contemporary challenges.",
            keyTerms: ["Appearance Management", "Fear vs. Love", "Decisive Action", "Calculated Cruelty", "Adaptability"],
            download: {
              clarification: "Machiavelli argued that a leader should be concerned with how they are perceived, not just their internal character. The appearance of certain virtues can be more important than actually possessing them.",
              example: "Cesare Borgia used calculated displays of ruthlessness followed by shows of mercy to establish psychological control over newly conquered territories.",
              scenario: "You're a leader who has just taken control of an organization with low morale and discipline. How would you apply Machiavellian principles to establish your authority while building long-term loyalty?",
              recallPrompt: "Explain why Machiavelli believes it is better for a leader to be feared than loved, and the psychological reasoning behind this claim."
            },
            epic: placeholderEPIC,
            reviewHint: "Focus on Machiavelli's balance between inspiring respect and instilling fear, and the importance of managing public perception.",
            chronicleEncounter: { emotionalTheme: "Strategic Detachment", signatureEncounter: "The Prince's Mirror" }
          },
          {
            id: 'machiavelli-d2-n2',
            title: 'Strategic Analysis of Power',
            nodeType: 'strategy',
            shortDefinition: "Explores Machiavelli's framework for analyzing power dynamics within and between states.",
            learningObjective: "Students will learn to apply systematic strategic thinking to political situations and recognize patterns in power struggles.",
            keyTerms: ["Virtù", "Fortuna", "Necessità", "Realpolitik", "Strategic Flexibility"],
            download: {
              clarification: "Machiavelli's approach to power revolutionized political thinking by separating politics from traditional moral philosophy. In 'The Prince,' he presents a systematic analysis of political power based on observation of actual political practice rather than idealized theories.",
              example: "Cesare Borgia's governance of Romagna: appointing Remirro de Orco for harsh order, then executing him to shift public hatred while retaining the benefits of the earlier harsh governance.",
              scenario: "Advising a new CEO of a failing tech company on identifying power centers, understanding motivations, and sequencing actions for a turnaround.",
              recallPrompt: "Using Machiavelli's framework, how does one balance virtù and fortuna in strategic power analysis?"
            },
            epic: placeholderEPIC,
            reviewHint: "Practice applying the virtù-fortuna-necessità framework to current political or business scenarios to identify power dynamics.",
            chronicleEncounter: { emotionalTheme: "The Burden of Consequence", signatureEncounter: "The Counselor's Dilemma" }
          },
          {
            id: 'machiavelli-d2-n3',
            title: 'Virtù vs. Fortuna',
            nodeType: 'concept',
            shortDefinition: "Examines the core dynamic in Machiavelli's thought: the relationship between human skill/agency (virtù) and fortune/chance (fortuna).",
            learningObjective: "Students will understand how this framework applies to strategic thinking and decision-making under uncertainty.",
            keyTerms: ["Virtù", "Fortuna", "Agency", "Preparedness", "Adaptability"],
            download: {
              clarification: "Machiavelli believed that while fortuna (fortune) controls approximately half of human affairs, virtù (skill and ability) allows leaders to influence or control the other half through preparation and strategic action.",
              example: "Cesare Borgia demonstrated virtù by anticipating threats after his father's death, but was undone by the fortuna of his own illness coinciding.",
              scenario: "Leading an organization facing unexpected market disruption. How would you apply the virtù-fortuna framework to respond effectively and plan for future uncertainty?",
              recallPrompt: "Explain Machiavelli's metaphor of fortuna as a river and how leaders with virtù can build 'dams and dikes'."
            },
            epic: placeholderEPIC,
            reviewHint: "Focus on the interplay between proactive preparation (virtù) and reactive adaptation (also virtù) in the face of unpredictable events (fortuna).",
            chronicleEncounter: { emotionalTheme: "Strategic Resilience", signatureEncounter: "Fortune's Test" }
          }
        ], 'machiavellian-mind', 'machiavelli-d2'),
      },
      {
        id: 'machiavelli-d3',
        title: 'Princedoms & Principalities',
        learningGoal: "Master Machiavelli's classification of states and the strategic implications for governance, security, and power maintenance.",
        chronicleTheme: "Governing simulated states and responding to internal and external threats.",
        domainDungeonType: "governance_simulation",
        characterAffinities: ["architect", "sentinel", "veridex"],
        specterAffinities: ["control-specter", "rigidity-specter", "externalization-specter"],
        nodes: addStatusToNodes([
          {
            id: 'machiavelli-d3-n1',
            title: 'Types of States and Governance',
            nodeType: 'concept',
            shortDefinition: "Examines Machiavelli's classification of different types of states and governance structures.",
            learningObjective: "Students will understand the strategic implications of various political arrangements and how they affect stability, security, and power.",
            keyTerms: ["Principalities", "Republics", "Hereditary States", "New Acquisitions", "Mixed Principalities"],
            download: {
              clarification: "Machiavelli categorizes states primarily by how power is acquired and maintained, distinguishing between hereditary principalities, new principalities, mixed principalities, and republics, each with unique strategic challenges.",
              example: "Machiavelli analyzes the Ottoman Empire as a centralized hereditary principality (difficult to conquer, easy to maintain) versus the French monarchy.",
              scenario: "You're advising the leader of a newly formed coalition government with diverse territories. What Machiavellian principles guide establishing stable governance?",
              recallPrompt: "Explain why Machiavelli believes newly acquired states present different challenges depending on their prior governance."
            },
            epic: placeholderEPIC,
            reviewHint: "Analyze how Machiavelli links the method of acquiring a state to the best methods for maintaining control over it.",
            chronicleEncounter: { emotionalTheme: "Structural Insight", signatureEncounter: "The State Architect" }
          },
          {
            id: 'machiavelli-d3-n2',
            title: 'Military Foundations of Power',
            nodeType: 'principle',
            shortDefinition: "Explores Machiavelli's emphasis on military power as the foundation of state security and political authority.",
            learningObjective: "Students will understand the relationship between military capacity, types of forces (native, mercenary, auxiliary), and political stability.",
            keyTerms: ["Native Forces", "Mercenaries", "Auxiliary Forces", "Civic Militias", "Military Necessity"],
            download: {
              clarification: "Machiavelli argues that 'good laws and good arms' are principal foundations, but good laws cannot exist without good arms, making military power ultimate. He distrusts mercenaries and auxiliaries, advocating for native forces.",
              example: "Machiavelli criticizes Italian states for relying on mercenaries, leading to weakness, contrasting this with Rome's citizen armies.",
              scenario: "Advising a small nation with limited resources facing security threats. How would Machiavellian principles guide maximizing security?",
              recallPrompt: "Explain Machiavelli's critique of mercenary and auxiliary forces and why he advocates for native troops."
            },
            epic: placeholderEPIC,
            reviewHint: "Focus on why self-reliant military power (native forces) is crucial for a prince's long-term security and authority according to Machiavelli.",
            chronicleEncounter: { emotionalTheme: "Security Realism", signatureEncounter: "The Military Reformer" }
          },
          {
            id: 'machiavelli-d3-n3',
            title: 'Ethical Pragmatism in Governance',
            nodeType: 'concept',
            shortDefinition: "Examines Machiavelli's approach to ethics in governance, where traditional morality may be set aside for effective rule.",
            learningObjective: "Students will understand the ethical complexities of political leadership and when pragmatic concerns might override conventional morality for state welfare.",
            keyTerms: ["Ethical Pragmatism", "Necessity", "Appearance vs. Reality", "Common Good", "Moral Flexibility"],
            download: {
              clarification: "Machiavelli argues a leader must 'learn how not to be good,' setting aside conventional morality when necessary for state security, while maintaining the appearance of virtue.",
              example: "Cesare Borgia's execution of Remirro de Orco: effective governance and ethical pragmatism (controlled cruelty for order, then distancing for public approval).",
              scenario: "A leader facing a crisis where conventional ethics would harm the organization. How does Machiavellian ethical pragmatism guide resolution?",
              recallPrompt: "Explain Machiavelli's statement that a prince should 'appear' virtuous but be prepared to act contrary to these qualities when necessary."
            },
            epic: placeholderEPIC,
            reviewHint: "Analyze the tension between personal morality and political necessity in 'The Prince', and how 'the common good' is used as justification.",
            chronicleEncounter: { emotionalTheme: "Moral Courage", signatureEncounter: "The Ethical Dilemma" }
          }
        ], 'machiavellian-mind', 'machiavelli-d3'),
      }
    ]
};
