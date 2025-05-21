
import type { Module, ModuleType } from '@/types/neuro';
import { addStatusToNodes } from './_common';

export const sovereignCoreModuleData: Omit<Module, 'status'> = {
    id: 'sovereign-core',
    type: 'core' as ModuleType,
    title: 'Sovereign Core: The Foundation of Personal Cognition',
    description: 'Forge your internal operating system. Master self-governance, build an unshakeable logical framework, author your unique life story, and anchor your beliefs in empirical reality. This is where your cognitive architecture begins.',
    moduleLearningGoal: 'To construct a deeply integrated and resilient cognitive architecture, enabling autonomous thought, principled action, and continuous self-evolution through mastery of core self-governance, logical reasoning, narrative authorship, and empirical validation.',
    tags: ['sovereignty', 'epistemology', 'identity', 'metacognition', 'narrative', 'empiricism'],
    dependencies: [],
    alignmentBias: 'neutral',
    defaultCompanion: 'neuros',
    associatedSpecters: ['certainty-specter', 'identity-specter', 'contradiction-specter', 'control-specter', 'recursion-specter'], // comforter was not defined, recursion is a specter
    recommendedChronicleDungeon: 'Vault of Alignment',
    moduleCategory: ['rationality', 'self-governance', 'identity'],
    reviewProfile: {
      decayModel: 'performance_adaptive',
      reviewClusters: [
        ['recursive_sovereignty', 'meta_integrity', 'sovereign_boundaries'],
        ['non_contradiction', 'axiomatic_frame', 'coherence_map'],
        ['personal_constitution', 'sovereign_narrative', 'inner_legislator'],
        ['falsifiability', 'confidence_calibration', 'evidence_evaluation']
      ],
      interleaveRatio: 0.3
    },
    domains: [
      {
        id: 'sovereign',
        title: 'Sovereign Domain',
        learningGoal: 'Architect internal systems of identity, attention, and action that maintain coherence under stress, enabling profound self-awareness and agency.',
        chronicleTheme: 'Identity trials and recursive rule testing, forging the core of the self.',
        domainDungeonType: 'identity_trial_nexus',
        characterAffinities: ['ekitty', 'mirror_tender', 'praxis', 'sovereign'],
        specterAffinities: ['identity-specter', 'control-specter', 'recursion-specter'],
        nodes: addStatusToNodes([
          {
            id: 'recursive_sovereignty',
            title: 'Recursive Sovereignty',
            nodeType: 'principle',
            shortDefinition: 'The capacity to create, enforce, and revise your own rules—including rules about how to make rules.',
            learningObjective: 'Apply recursive thinking to establish internal governance principles that can evolve while maintaining integrity.',
            keyTerms: ['recursion', 'self-governance', 'meta-rules', 'recursive oversight', 'sovereign loop'],
            download: {
              clarification: 'Recursive sovereignty means having governance systems that can improve themselves. Unlike external rule systems, this creates a self-correcting loop where you can adjust both your rules and how you make those rules. This is how you avoid both rigid dogma and endless instability.',
              example: 'A person with recursive sovereignty might have a rule like "I eat healthy 80% of the time," but also a meta-rule like "I review my health rules monthly to ensure they\'re evidence-based and sustainable." This allows them to maintain structure while enabling evolution.',
              scenario: 'You notice your productivity system isn\'t working. Rather than just creating new productivity rules, you examine how you create rules in the first place, discovering you tend to make overly complex systems. You create a meta-rule: "New systems must start with only three components."',
              recallPrompt: 'What distinguishes recursive sovereignty from simply following a fixed set of personal rules?'
            },
            epic: {
                explainPrompt: "Explain 'Recursive Sovereignty' in the context of personal development. Why is the ability to revise the 'rules about making rules' so powerful for long-term growth and adaptability?",
                probePrompt: "What are the potential dangers of a recursive system if not properly bounded (e.g., infinite loops of self-correction, analysis paralysis)? How can Sovereign Boundaries help mitigate this?",
                implementPrompt: "Identify one personal 'rule' or habit you currently follow. Now, define a 'meta-rule' for how you will review and potentially revise this rule. Specify the trigger for review (e.g., time-based, performance-based) and the criteria for change.",
                connectPrompt: "How does 'Constitutional Amendments' (Self-Authorship Domain) embody the principle of Recursive Sovereignty at the level of one's core identity framework?"
            }
          },
          {
            id: 'mirror_protocol',
            title: 'Mirror Protocol',
            nodeType: 'strategy',
            shortDefinition: 'A systematic approach to observing your own mental and emotional states without becoming lost in them.',
            learningObjective: 'Implement mirror techniques that allow objective self-observation without excessive self-identification or detachment.',
            keyTerms: ['self-reflection', 'metacognition', 'emotional mirroring', 'non-identification', 'cognitive distance'],
            download: {
              clarification: 'The Mirror Protocol establishes a relationship between your experiencing self and your observing self. It creates enough distance to see your thoughts and emotions clearly, but not so much distance that you dissociate from them. This balance allows precise self-knowledge without being consumed by emotional states.',
              example: 'When experiencing anger, applying the Mirror Protocol involves mentally stepping back and noting "There\'s anger arising" rather than "I am angry." This subtle shift creates space for observation while still acknowledging the emotion\'s reality.',
              scenario: 'During a difficult conversation, you notice your heart racing and defensive thoughts arising. Instead of being swept along, you activate the Mirror Protocol, mentally establishing an observer perspective that can track these reactions while remaining engaged in the dialogue.',
              recallPrompt: 'What distinguishes effective mirroring from both over-identification and dissociation?'
            },
            epic: {
                explainPrompt: "Describe the 'Mirror Protocol' as a metacognitive tool. How does it facilitate clearer self-understanding and emotional regulation?",
                probePrompt: "What are some common challenges in maintaining the 'observer self' during intense emotional experiences? What specific techniques can strengthen this capacity?",
                implementPrompt: "Next time you experience a strong emotion (positive or negative), practice the Mirror Protocol. Mentally narrate the experience as an observer: 'The body is feeling X sensation. The thought 'Y' is arising. The impulse to do Z is present.' Afterward, reflect on how this observation changed your relationship to the experience.",
                connectPrompt: "How does 'Somatic Awareness' (Emotional Alchemy or similar modules) provide crucial data for the Mirror Protocol to operate effectively?"
            }
          },
          {
            id: 'sovereign_boundaries',
            title: 'Sovereign Boundaries',
            nodeType: 'principle',
            shortDefinition: 'The defined limits of personal authority, responsibility, and influence that protect integrity and enable focused action.',
            learningObjective: 'Establish clear personal boundaries that distinguish between domains of control, influence, and acceptance.',
            keyTerms: ['psychological boundaries', 'sphere of control', 'differentiation', 'responsibility limits', 'cognitive domains'],
            download: {
              clarification: 'Sovereign boundaries separate what you can control (your responses, attention, and choices), what you can influence (some external events and others\' understanding), and what you must accept (fundamental constraints and others\' autonomy). This tripartite division prevents both overreach and abdication of responsibility.',
              example: 'A therapist maintains clear sovereign boundaries by taking responsibility for providing effective treatment methods, acknowledging influence over a client\'s insight development, and accepting that the client\'s choices remain their own sovereign territory.',
              scenario: 'Your friend makes a questionable financial decision. Sovereign boundaries help you recognize that while you can offer information (influence) and manage your own reaction (control), their decision remains within their domain of sovereignty (acceptance).',
              recallPrompt: 'What are the three key domains distinguished by sovereign boundaries, and why is this differentiation important?'
            },
            epic: {
                explainPrompt: "Explain the concept of 'Sovereign Boundaries,' particularly the distinction between control, influence, and acceptance. Why is clarity on these boundaries vital for mental well-being and effective action?",
                probePrompt: "How might unclear or poorly maintained Sovereign Boundaries lead to problems like burnout, resentment, or codependency? Provide an example.",
                implementPrompt: "Choose a current situation where you feel stressed or conflicted. Analyze it through the lens of Sovereign Boundaries: What aspects can you directly control? What aspects can you only influence? What aspects must you accept? Formulate one action based on this analysis that respects these boundaries.",
                connectPrompt: "How does 'Releasing Illusory Control' (Specter Crucible - Trial of Control) directly relate to establishing and respecting Sovereign Boundaries?"
            }
          },
          {
            id: 'meta_integrity',
            title: 'Meta-Integrity',
            nodeType: 'principle',
            shortDefinition: 'Maintaining coherence between your stated principles, actual decision criteria, and higher-order values.',
            learningObjective: 'Develop systems to detect and resolve discrepancies between explicit values and implicit decision-making patterns.',
            keyTerms: ['value alignment', 'consistency audit', 'integrity loops', 'value hierarchy', 'execution fidelity'],
            download: {
              clarification: 'Meta-integrity goes beyond simple honesty to ensure your actual decision criteria (what really drives your choices) align with your claimed values. It requires systems that can detect when you\'re not living according to your stated principles, creating a multi-level consistency check.',
              example: 'Someone claims to value health but consistently prioritizes work over sleep. Meta-integrity would involve noticing this discrepancy, examining what\'s really driving decisions (perhaps fear of failure), and realigning either their stated values or actual choices.',
              scenario: 'You notice yourself procrastinating on an important project despite claiming it\'s your top priority. Meta-integrity prompts you to track decisions for a week, revealing that immediate social validation is your actual priority, allowing you to consciously realign actions with stated goals.',
              recallPrompt: 'How does meta-integrity differ from simple honesty or integrity?'
            },
            epic: {
                explainPrompt: "Define 'Meta-Integrity.' How does it operate as a 'multi-level consistency check' for one's internal cognitive architecture?",
                probePrompt: "What are some common reasons for discrepancies between stated values and actual decision criteria? How can 'Voice Authentication' (Self-Authorship Domain) help uncover these underlying drivers?",
                implementPrompt: "Identify one core value you hold. For one week, track your daily decisions and actions. At the end of the week, review: How many of your significant choices were directly aligned with this value? Where were the discrepancies? What might have been the 'actual' decision criteria in those cases?",
                connectPrompt: "How does the 'Coherence Map' (AXIOMOS Domain) serve as a practical tool for visualizing and assessing Meta-Integrity across various life domains?"
            }
          },
          {
            id: 'identity_integration',
            title: 'Identity Integration',
            nodeType: 'strategy',
            shortDefinition: 'The process of cohesively organizing seemingly contradictory aspects of self into a unified yet multifaceted identity.',
            learningObjective: 'Develop techniques to resolve or accommodate apparent contradictions in self-concept without sacrificing complexity or coherence.',
            keyTerms: ['self-complexity', 'identity coherence', 'subpersonality integration', 'self-schema', 'plurality management'],
            download: {
              clarification: 'Identity integration acknowledges that humans contain multitudes—different roles, aspects, and sometimes contradictory drives—while providing frameworks to organize this complexity. Rather than enforcing a simplistic unity or embracing chaotic fragmentation, it creates workable harmony among different self-aspects.',
              example: 'A person might be both analytically logical in their professional role and emotionally expressive in intimate relationships. Integration doesn\'t erase these differences but understands them as contextually appropriate expressions of a complex whole.',
              scenario: 'You realize you behave very differently with different friend groups—intellectual with some, playful with others, nurturing with family. Integration involves mapping these patterns, understanding their purposes, and ensuring they serve your overall values rather than compartmentalizing your life.',
              recallPrompt: 'How does healthy identity integration differ from both rigid consistency and disconnected fragmentation?'
            },
            epic: {
                explainPrompt: "Explain 'Identity Integration.' Why is it important to create a 'unified yet multifaceted' identity rather than striving for a monolithic or overly simplistic self-concept?",
                probePrompt: "How might societal pressures or past experiences lead to the fragmentation or suppression of certain self-aspects? How can 'Shadow Integration' (Emotional Alchemy) support Identity Integration?",
                implementPrompt: "Identify two aspects of yourself that sometimes feel in conflict or difficult to reconcile (e.g., your ambitious side vs. your need for rest; your analytical side vs. your intuitive side). Write a short paragraph from the perspective of each 'part,' allowing it to express its needs and values. Then, write a third paragraph from an 'integrating self' perspective, acknowledging both and suggesting how they might coexist or collaborate.",
                connectPrompt: "How does 'Sovereign Narrative' (Self-Authorship Domain) provide the storyline that weaves together different aspects of self into a coherent identity?"
            }
          },
          {
            id: 'sovereign_energy_management',
            title: 'Sovereign Energy Management',
            nodeType: 'strategy',
            shortDefinition: 'The deliberate allocation of mental, emotional, and physical resources based on core values and current capacity.',
            learningObjective: 'Implement systems to monitor and direct personal energy toward value-aligned priorities rather than reactive demands.',
            keyTerms: ['energy allocation', 'attention management', 'capacity awareness', 'priority alignment', 'strategic recovery'],
            download: {
              clarification: 'Sovereign energy management recognizes that attention, willpower, and emotional resources are finite and must be allocated intentionally. Rather than responding to whatever seems most urgent, it involves conscious direction of your limited energy toward what matters most, including strategic renewal.',
              example: 'Instead of checking email first thing every morning (depleting focus on others\' priorities), someone might reserve their first two hours for creative work aligned with their core projects, then batch-process communications after completing high-value work.',
              scenario: 'You notice feeling perpetually exhausted despite adequate sleep. By tracking energy levels throughout the day, you discover certain interactions and tasks consistently drain you while others energize you, allowing you to restructure your schedule around your energy patterns.',
              recallPrompt: 'What distinguishes sovereign energy management from simple time management or productivity systems?'
            },
            epic: {
                explainPrompt: "Describe 'Sovereign Energy Management.' How does it go beyond mere time management to encompass mental, emotional, and physical resources?",
                probePrompt: "What are common 'energy leaks' or reactive patterns that drain resources away from value-aligned priorities? How can 'Real-Time Cognitive Monitoring' (Thinking module) help identify these?",
                implementPrompt: "For one day, track your energy levels (e.g., on a 1-10 scale) before and after significant activities or interactions. Also, note whether each activity felt aligned with your core values. Identify one high-drain, low-value activity and one low-drain (or energizing), high-value activity. How could you shift allocation?",
                connectPrompt: "How does 'Strategic Recovery' as part of Sovereign Energy Management relate to 'Recovery Optimization' (Health Optimization module) or the concept of 'Cognitive Load' (Mechanics module)?"
            }
          },
          {
            id: 'values_embodiment',
            title: 'Values Embodiment',
            nodeType: 'strategy',
            shortDefinition: 'The practice of expressing abstract principles through concrete behaviors, physical states, and environmental design.',
            learningObjective: 'Translate core values from intellectual concepts into tangible actions, emotions, and environmental structures.',
            keyTerms: ['embodied cognition', 'values operationalization', 'environmental design', 'habit formation', 'somatic awareness'],
            download: {
              clarification: 'Values embodiment recognizes that principles mean little unless expressed through action, emotion, and environment. It involves translating abstract values into specific behaviors (what does "creativity" actually look like in practice?), somatic states (how does "courage" feel in your body?), and environmental cues (how does your space reflect "clarity"?).',
              example: 'Someone who values "learning" embodies this through specific reading routines, physical environments designed for focus, discussion groups that challenge thinking, and regular reflection practices—not just claiming to value knowledge.',
              scenario: 'You say you value "connection" but realize your home contains no gathering spaces, your calendar shows minimal social time, and you feel anxious during conversations. Embodiment would involve redesigning your space, schedule, and developing comfort with the physical sensations of engagement.',
              recallPrompt: 'What are the three key dimensions of values embodiment, and why is embodiment more powerful than intellectual understanding alone?'
            },
            epic: {
                explainPrompt: "Explain 'Values Embodiment.' Why is it insufficient to merely understand or state one's values without translating them into concrete actions and environmental structures?",
                probePrompt: "How can 'Somatic Awareness' (Emotional Alchemy) help in recognizing whether one is truly embodying a value versus just intellectually assenting to it? What physical cues might signal alignment or misalignment?",
                implementPrompt: "Choose one of your core values (identified in 'Meta-Integrity' or 'Personal Constitution' exercises). Brainstorm three concrete actions you can take this week to embody that value. Also, identify one small change you can make to your physical environment (home, workspace) to support that value.",
                connectPrompt: "How does 'Rule Creation' by the 'Inner Legislator' (Self-Authorship Domain) serve as a mechanism for operationalizing and embodying values through consistent behavioral policies?"
            }
          },
        ], 'sovereign', 'sov-1'),
      },
      {
        id: 'axiomos',
        title: 'AXIOMOS Domain',
        learningGoal: 'Architect a rigorous belief framework grounded in internal coherence, evidentiary reasoning, and systematic cognitive hygiene.',
        chronicleTheme: 'Contradiction mazes and logical collapse traps, purifying the foundations of thought.',
        domainDungeonType: 'axiom_verification_chamber',
        characterAffinities: ['neuros', 'veritas', 'veridex'],
        specterAffinities: ['certainty-specter', 'contradiction-specter', 'rigidity-specter', 'complexity-specter'],
        nodes: addStatusToNodes([
          {
            id: 'non_contradiction',
            title: 'Non-Contradiction',
            nodeType: 'principle',
            shortDefinition: 'The principle that a statement cannot be both true and false in the same sense and context.',
            learningObjective: 'Apply the principle of non-contradiction to identify and resolve logical inconsistencies in belief systems.',
            keyTerms: ['logical consistency', 'contradiction', 'paradox', 'contextual qualification', 'logical operators'],
            download: {
              clarification: 'Non-contradiction forms the bedrock of coherent thought, stating that contradictory statements cannot both be true in the same sense and context. This principle doesn\'t eliminate paradox or complexity, but requires precise qualification—apparent contradictions often result from imprecise language or shifting contexts.',
              example: 'The statements "I am an introvert" and "I am an extrovert" appear contradictory. However, by adding context—"I am introverted in large groups" and "I am extroverted with close friends"—the contradiction dissolves through qualification.',
              scenario: 'You find yourself both believing "people are fundamentally good" and "people cannot be trusted." By applying non-contradiction, you identify the missing context: you believe people have good intentions but can be influenced by circumstances to act against those intentions.',
              recallPrompt: 'What does the principle of non-contradiction state, and how can apparent contradictions often be resolved?'
            },
            epic: {
                explainPrompt: "Explain the Principle of Non-Contradiction. Why is it considered a fundamental axiom of classical logic and rational thought?",
                probePrompt: "Are there any philosophical systems or specific contexts (e.g., quantum mechanics, some Eastern philosophies) where the Principle of Non-Contradiction is challenged or appears not to hold strictly? How are these apparent exceptions handled?",
                implementPrompt: "Find a statement or belief (personal, societal, or from a text) that seems to contain an internal contradiction. Apply 'Contextual Qualification': can you rephrase or add context to resolve the apparent contradiction without abandoning the core meaning? If not, what does this imply?",
                connectPrompt: "How does 'Identifying Hidden & Implicit Contradictions' (Paradox Resolution module) rely on the Principle of Non-Contradiction as its operational basis?"
            }
          },
          {
            id: 'axiomatic_frame',
            title: 'Axiomatic Frame',
            nodeType: 'concept',
            shortDefinition: 'A set of foundational assumptions from which a system of thought or belief is constructed.',
            learningObjective: 'Identify and articulate the core axioms that form the foundation of your worldview.',
            keyTerms: ['axiom', 'first principles', 'foundational beliefs', 'unprovable assumptions', 'belief architecture'],
            download: {
              clarification: 'An axiomatic frame consists of the foundational assumptions you cannot prove but must accept to build further knowledge. These "first principles" are often invisible until questioned—yet every belief system rests on them. Recognizing your axioms allows you to examine their coherence and utility rather than treating them as objective truths.',
              example: 'Scientific reasoning rests on axioms like "observable evidence provides reliable information about reality" and "logical inference is valid"—assumptions that cannot be proven within the system but enable the scientific method to function.',
              scenario: 'In a debate about ethical responsibilities, you reach an impasse until you realize you\'re operating from different axiomatic frames—your colleague values individual autonomy as axiomatic, while you prioritize collective wellbeing as foundational.',
              recallPrompt: 'What is an axiomatic frame, and why is it important to identify your own axioms?'
            },
            epic: {
                explainPrompt: "Describe an 'Axiomatic Frame.' Why is it impossible for any system of thought to be entirely free of unprovable foundational assumptions (axioms)?",
                probePrompt: "What happens when two individuals or systems operate from fundamentally different and incompatible axiomatic frames? How can communication or resolution occur, if at all?",
                implementPrompt: "Choose a field of knowledge you are familiar with (e.g., a science, a philosophy, a political ideology, a hobby). Attempt to identify at least two core axioms or foundational assumptions that underpin that field. Are these axioms explicitly stated or usually implicit?",
                connectPrompt: "How does the concept of 'Ethical Axioms' (Ethical Architecture module) represent a specialized application of building an Axiomatic Frame for moral reasoning?"
            }
          },
          {
            id: 'belief_architecture',
            title: 'Belief Architecture',
            nodeType: 'concept',
            shortDefinition: 'The structural organization of beliefs into hierarchical systems with supporting evidence, inferential connections, and contingent relationships.',
            learningObjective: 'Map belief structures to visualize dependencies, identify load-bearing beliefs, and detect structural vulnerabilities.',
            keyTerms: ['belief hierarchy', 'epistemic dependence', 'inferential structure', 'load-bearing beliefs', 'belief networks'],
            download: {
              clarification: 'Belief architecture views knowledge as structures rather than isolated facts, recognizing that beliefs form dependent hierarchies. Some beliefs are foundational, supporting many others above them; some connect horizontally, reinforcing each other; others sit at the periphery, with few dependencies. Understanding this architecture helps identify which beliefs, if changed, would cause cascading revisions.',
              example: 'The belief "humans have moral worth" might be foundational, supporting higher-level beliefs about rights, responsibilities, and ethical systems. Changing this load-bearing belief would require restructuring entire domains of thought above it.',
              scenario: 'You\'re reconsidering your career path and realize that many decisions rest on the belief "financial security is necessary for happiness." By examining this architectural node, you can assess whether it\'s well-supported or a vulnerability in your belief structure.',
              recallPrompt: 'What makes belief architecture different from just having a collection of beliefs? Why does the structure matter?'
            },
            epic: {
                explainPrompt: "Explain 'Belief Architecture.' How does understanding the structure and dependencies within one's belief system enhance cognitive clarity and resilience?",
                probePrompt: "What are 'load-bearing beliefs,' and why is it particularly important to ensure they are well-supported by evidence and sound reasoning? What happens if a load-bearing belief collapses?",
                implementPrompt: "Choose a significant belief you hold. Map out its 'architecture': 1. What core axioms or foundational beliefs does it rest upon? 2. What other beliefs are directly supported by this belief? 3. What evidence supports this belief? 4. What counter-evidence or challenges exist? Is it a 'load-bearing' belief in your overall worldview?",
                connectPrompt: "How can 'Argument Mapping' (Thinking module) be used as a tool to visualize and analyze specific pathways within a larger Belief Architecture?"
            }
          },
          {
            id: 'epistemic_hygiene',
            title: 'Epistemic Hygiene',
            nodeType: 'strategy',
            shortDefinition: 'Practices that maintain the cleanliness of your knowledge acquisition process, preventing contamination from cognitive biases, logical fallacies, and information disorders.',
            learningObjective: 'Implement epistemic hygiene routines that systematically reduce bias and improve the quality of belief formation.',
            keyTerms: ['information filtering', 'source evaluation', 'cognitive decontamination', 'belief formation protocols', 'reasoning checkpoints'],
            download: {
              clarification: 'Epistemic hygiene treats knowledge formation like a health regimen—requiring preventative practices, regular screening, and occasional deep cleaning. It involves systematically filtering information sources, checking reasoning for fallacies, verifying claims before integration, and periodically reviewing beliefs for contamination.',
              example: 'Just as washing hands prevents disease spread, checking multiple sources before accepting a claim prevents misinformation spread. Someone with good epistemic hygiene might have a personal rule: "Never share information I haven\'t verified from at least two reliable sources."',
              scenario: 'You encounter a compelling article supporting your political views. Instead of immediately sharing it, you apply epistemic hygiene: checking the source\'s credibility, looking for primary data, considering alternative explanations, and identifying emotional manipulation techniques.',
              recallPrompt: 'What practices constitute good epistemic hygiene, and why is it important to apply them systematically rather than occasionally?'
            },
            epic: {
                explainPrompt: "Describe 'Epistemic Hygiene.' Why is it analogous to physical hygiene in maintaining the health of one's belief system?",
                probePrompt: "What are some of the most common 'epistemic pollutants' in the modern information environment? How can one develop effective 'filters' against them?",
                implementPrompt: "Develop a personal 'Epistemic Hygiene Checklist' with at least 5 practices you will try to implement when encountering new, significant information (e.g., check source, identify assumptions, consider alternative interpretations, look for disconfirming evidence, assess emotional reaction). Apply it to one piece of news or an online claim this week.",
                connectPrompt: "How does 'Advanced Source Analysis & Credibility Assessment' (Thinking module) form a core component of good Epistemic Hygiene practices?"
            }
          },
          {
            id: 'meta_reasoning',
            title: 'Meta-Reasoning',
            nodeType: 'strategy',
            shortDefinition: 'The process of reasoning about your own reasoning—evaluating the quality of your cognitive processes rather than just their conclusions.',
            learningObjective: 'Apply meta-reasoning techniques to identify reasoning flaws, enhance thinking strategies, and determine appropriate levels of cognitive investment.',
            keyTerms: ['metacognition', 'reasoning about reasoning', 'cognitive resource allocation', 'process evaluation', 'thinking strategies'],
            download: {
              clarification: 'Meta-reasoning involves stepping back from your thinking to evaluate how you\'re thinking. Rather than just asking "What\'s the answer?" it asks "Am I approaching this question effectively?" This includes judging when to think more versus when further reasoning would be inefficient, and selecting appropriate cognitive tools for different problems.',
              example: 'While trying to decide between job offers, you might pause to consider: "Am I overweighting salary because it\'s an easy metric to compare? Should I spend more time considering culture fit, which is harder to quantify but potentially more important?"',
              scenario: 'Stuck on a difficult problem, you apply meta-reasoning by asking: "Is my current approach likely to yield results? Have I considered sufficiently diverse alternatives? Am I allocating appropriate time given the importance of this decision?"',
              recallPrompt: 'What distinguishes meta-reasoning from regular reasoning, and what kinds of questions does it address?'
            },
            epic: {
                explainPrompt: "Explain 'Meta-Reasoning.' How does evaluating the *process* of your thinking, rather than just its output, lead to better cognitive outcomes?",
                probePrompt: "What are some key questions one might ask during meta-reasoning to evaluate the effectiveness of their current thinking strategy? (e.g., 'Is this the right level of detail?' 'Am I using the most appropriate mental model?').",
                implementPrompt: "The next time you find yourself stuck on a problem or decision for more than 15 minutes, pause and engage in meta-reasoning. Ask yourself: 1. What strategy am I currently using? 2. Is it working effectively? 3. What alternative strategies could I employ? 4. Is this problem worth the current level of cognitive investment? Document your reflections.",
                connectPrompt: "How does 'Strategic Cognitive Mode Selection' (Thinking module) represent a core application of Meta-Reasoning, where one consciously chooses the optimal thinking approach for a given task?"
            }
          },
          {
            id: 'coherence_map',
            title: 'Coherence Map',
            nodeType: 'strategy',
            shortDefinition: 'A visual or conceptual representation of how beliefs, values, and actions align or conflict within your cognitive system.',
            learningObjective: 'Create coherence maps to identify tensions, resolve contradictions, and strengthen alignment between values, beliefs, and actions.',
            keyTerms: ['cognitive consistency', 'value alignment', 'belief-behavior gap', 'system visualization', 'coherence metrics'],
            download: {
              clarification: 'A coherence map reveals connections and contradictions between what you believe, value, and do. Unlike linear logic, it shows multiple relationships simultaneously—how your environmental views relate to your consumption habits, how your relationship values align with time allocation, how your career goals connect to daily actions. This multi-dimensional view exposes hidden tensions and reinforcing patterns.',
              example: 'A coherence map might reveal that someone values family connection but consistently works late, believes in environmental protection but drives unnecessarily, and prioritizes health but maintains habits that undermine it—exposing areas for realignment.',
              scenario: 'Feeling general dissatisfaction, you create a coherence map connecting your stated values (creativity, connection, health) with time allocation, spending patterns, and emotional responses. The visualization reveals your life is structured primarily around security and status—values you never consciously prioritized.',
              recallPrompt: 'What is a coherence map, and how does it differ from a simple list of beliefs or values?'
            },
            epic: {
                explainPrompt: "Describe a 'Coherence Map.' How can visualizing the relationships between one's beliefs, values, and actions help identify areas of internal conflict or misalignment?",
                probePrompt: "What are some practical methods for creating a personal coherence map (e.g., mind mapping software, journaling prompts, physical card sorting)? Which method appeals most to you and why?",
                implementPrompt: "Choose three core values from your 'Personal Constitution' (Self-Authorship Domain). For each value, list two corresponding beliefs and two typical actions/behaviors in your life. Now, try to map these out visually (even a simple sketch). Do you see strong coherence, or are there tensions/contradictions between any of these elements? Identify one area for potential realignment.",
                connectPrompt: "How does the 'Coherence Map' serve as a diagnostic tool for 'Meta-Integrity' (Sovereign Domain) by making internal consistencies and inconsistencies explicit?"
            }
          },
          {
            id: 'system_boundaries',
            title: 'System Boundaries',
            nodeType: 'concept',
            shortDefinition: 'The defined edges of a conceptual system that determine what elements belong within it and how it interacts with external systems.',
            learningObjective: 'Identify and establish appropriate boundaries for belief systems, allowing productive interaction without compromising core principles.',
            keyTerms: ['conceptual borders', 'system definition', 'interdependence', 'boundary conditions', 'context setting'],
            download: {
              clarification: 'System boundaries define where one conceptual framework ends and another begins—like the membrane of a cell, allowing selective exchange with other systems. Well-defined boundaries prevent category errors (applying principles from one domain inappropriately to another) while enabling productive cross-domain insights when deliberately crossed.',
              example: 'Science establishes boundaries around what questions it can address (empirically testable phenomena) versus those it cannot (subjective meaning, moral imperatives). These boundaries don\'t diminish science but clarify its proper domain of application.',
              scenario: 'In a debate about an organizational decision, confusion persists until someone clarifies the system boundaries: "Are we evaluating this based on financial metrics, cultural impact, or alignment with our mission? These are different systems with different criteria."',
              recallPrompt: 'What function do system boundaries serve, and why is it important to define them explicitly?'
            },
            epic: {
                explainPrompt: "Explain the concept of 'System Boundaries' in the context of conceptual systems or belief frameworks. Why is defining these boundaries crucial for clarity and effective reasoning?",
                probePrompt: "What happens when system boundaries are too rigid, preventing useful interaction with other systems? Conversely, what happens when boundaries are too permeable or ill-defined, leading to conceptual conflation?",
                implementPrompt: "Consider two distinct domains of your life (e.g., 'Work' and 'Personal Relationships,' or 'Scientific Thinking' and 'Artistic Expression'). Define the system boundary for each. What are the key elements *inside* each system? What interactions or information flows occur *across* the boundary between them? Are these boundaries clear and effective?",
                connectPrompt: "How does 'Conceptual Interface Design' (Synthetic Systems module) focus on managing the interactions *across* system boundaries, once those boundaries have been well-defined?"
            }
          },
        ], 'sovereign', 'sov-2'),
      },
      {
        id: 'self_authorship',
        title: 'Self-Authorship Domain',
        learningGoal: 'Architect and authentically embody a coherent, evolving self-narrative and personal governance system that withstands external pressures and guides principled action.',
        chronicleTheme: 'Dialogue mazes with NPCs trying to overwrite your story, forging your personal codex.',
        domainDungeonType: 'narrative_construction_foundry',
        characterAffinities: ['sovereign', 'chronicle_keeper', 'veriscribe', 'verivox', 'mirror_tender'],
        specterAffinities: ['narrative-specter', 'identity-specter', 'externalization-specter'],
        nodes: addStatusToNodes([
          {
            id: 'personal_constitution',
            title: 'Personal Constitution',
            nodeType: 'strategy',
            shortDefinition: 'A deliberately authored document defining your core principles, rights, responsibilities, and amendment procedures.',
            learningObjective: 'Create and maintain a personal constitution that provides stable governance while enabling principled evolution.',
            keyTerms: ['foundational document', 'core principles', 'personal governance', 'values codification', 'amendment process'],
            download: {
              clarification: 'A personal constitution serves as your highest internal governance document—establishing foundational principles, rights you guarantee yourself, responsibilities you commit to uphold, and mechanisms for amending these principles over time. Like a national constitution, it creates stability without rigidity, offering a principled reference point for decisions and conflicts.',
              example: 'A personal constitution might include principles like "I have the right to revise my beliefs in light of new evidence" and "I have the responsibility to verify information before sharing it," along with amendment procedures requiring reflection periods before major changes.',
              scenario: 'Facing pressure to take sides in a family conflict, you reference your personal constitution\'s principle of "maintaining neutrality in disputes where both parties have valid perspectives" to guide your response while explaining your position to those involved.',
              recallPrompt: 'What are the core components of a personal constitution, and how does it differ from a simple list of values?'
            },
            epic: {
                explainPrompt: "Describe the purpose and key components of a 'Personal Constitution.' How can such a document contribute to self-governance and principled decision-making?",
                probePrompt: "What makes a Personal Constitution a 'living document'? Why is an 'amendment process' crucial for its long-term effectiveness and authenticity?",
                implementPrompt: "Draft a section of your own Personal Constitution. Include: 1. One core principle you wish to live by. 2. One personal 'right' you will guarantee yourself. 3. One key 'responsibility' you commit to. 4. A brief idea for how you might 'amend' these in the future if needed.",
                connectPrompt: "How does 'Values Embodiment' (Sovereign Domain) translate the abstract principles of a Personal Constitution into concrete actions and environmental structures?"
            }
          },
          {
            id: 'sovereign_narrative',
            title: 'Sovereign Narrative',
            nodeType: 'concept',
            shortDefinition: 'The authoritative story you construct about your identity, experiences, and meaning—written by you rather than imposed by others.',
            learningObjective: 'Reclaim and construct your life narrative with agency, integrating experiences into a coherent story that serves your growth.',
            keyTerms: ['narrative identity', 'life story authorship', 'meaning-making', 'biographical sovereignty', 'coherent self-story'],
            download: {
              clarification: 'Your sovereign narrative is the story you tell about yourself—not as immutable truth, but as an evolving creation that integrates experiences into meaningful patterns. While external forces constantly offer narratives about who you are and what events mean, sovereignty means consciously choosing which interpretations to accept, which to rewrite, and how to structure your ongoing story.',
              example: 'A person might reframe early career setbacks from a narrative of "I\'m a failure" to "I was developing resilience and clarifying my path"—not denying events but reauthoring their meaning and connection to identity.',
              scenario: 'After a relationship ends, you notice yourself adopting a victim narrative from cultural scripts. Sovereign narrative involves consciously examining this story, considering alternative interpretations, and authoring an account that neither diminishes your pain nor surrenders your agency.',
              recallPrompt: 'What makes a narrative "sovereign," and how does it differ from simply recalling autobiographical facts?'
            },
            epic: {
                explainPrompt: "Explain the concept of a 'Sovereign Narrative.' How does consciously authoring one's life story differ from passively accepting narratives imposed by culture or circumstance?",
                probePrompt: "What are some common 'external narratives' or 'cultural scripts' that people often internalize without critical examination? How can one identify and challenge these?",
                implementPrompt: "Reflect on a significant past experience. Write two brief narratives about it: 1. The story you initially told yourself or that was suggested by others. 2. A 'Sovereign Narrative' version where you consciously reframe its meaning and your role in a way that empowers you or highlights growth. What changed?",
                connectPrompt: "How does 'Identity Integration' (Sovereign Domain) rely on a Sovereign Narrative to weave together diverse self-aspects into a cohesive and evolving whole?"
            }
          },
          {
            id: 'inner_legislator',
            title: 'Inner Legislator',
            nodeType: 'concept',
            shortDefinition: 'The executive function that creates, reviews, and revises your internal rules based on experience and values.',
            learningObjective: 'Activate and strengthen your inner legislator to create effective personal policies that align with core values.',
            keyTerms: ['rule creation', 'policy design', 'values implementation', 'behavioral governance', 'procedural thinking'],
            download: {
              clarification: 'The inner legislator transforms abstract values and insights into concrete operating procedures—the "laws" that govern your decisions and habits. Unlike rigid rules or impulsive reactions, legislative thinking creates principled policies adaptable to context. This function asks: "What general rules would consistently produce good outcomes across similar situations?"',
              example: 'Rather than deciding each morning whether to exercise (willpower-depleting), the inner legislator creates a policy: "On weekdays, I begin the day with 20 minutes of movement before checking messages." This converts a recurring decision into a stable procedure.',
              scenario: 'After repeatedly overspending, your inner legislator drafts a personal finance policy requiring a 48-hour consideration period for any purchase over $100, creating a systemic solution rather than relying on in-the-moment restraint.',
              recallPrompt: 'What distinguishes the inner legislator from other decision-making approaches, and what types of rules does it create?'
            },
            epic: {
                explainPrompt: "Describe the 'Inner Legislator.' How does it function to translate abstract values (from your Personal Constitution or Sovereign Narrative) into practical, everyday rules for living?",
                probePrompt: "What is the relationship between the 'Inner Legislator' and 'Recursive Sovereignty'? How does the Inner Legislator participate in the process of revising rules about rule-making?",
                implementPrompt: "Identify one area of your life where you often rely on willpower or make inconsistent decisions. Activate your 'Inner Legislator': Draft one clear, actionable 'personal policy' for this area that, if followed, would better align your behavior with a core value. (e.g., Policy for managing social media time, for responding to emails, for daily learning).",
                connectPrompt: "How can 'Algorithmic Thinking' (Algorithmic Rationality module) provide the structured thinking tools needed by the Inner Legislator to design effective and unambiguous personal policies?"
            }
          },
          {
            id: 'narrative_resilience',
            title: 'Narrative Resilience',
            nodeType: 'strategy',
            shortDefinition: 'The capacity to maintain a coherent and empowering life story in the face of contradiction, trauma, or disruptive information.',
            learningObjective: 'Develop narrative resilience techniques that allow integration of challenging experiences without compromising identity coherence.',
            keyTerms: ['meaning preservation', 'identity continuity', 'story integration', 'narrative repair', 'redemptive sequencing'],
            download: {
              clarification: 'Narrative resilience is your story\'s ability to absorb shocks without shattering. It doesn\'t deny difficulties but develops flexible frames to incorporate them—like a spine that bends without breaking. This capacity allows you to acknowledge painful truths or unexpected reversals while maintaining a sense of meaning and coherent identity.',
              example: 'When a carefully planned career path becomes impossible due to external changes, narrative resilience enables reframing this as a meaningful pivot rather than a devastating failure—preserving a sense of agency and continuity while acknowledging the real loss.',
              scenario: 'Learning information that contradicts a core belief, you experience temporary disorientation but activate narrative resilience—neither rejecting the information nor abandoning your entire belief system, but revising your story to accommodate this new understanding while preserving essential meaning.',
              recallPrompt: 'What makes a narrative "resilient," and why is this capacity important for psychological well-being?'
            },
            epic: {
                explainPrompt: "Explain 'Narrative Resilience.' How does it enable individuals to integrate difficult experiences into their life story in a way that maintains coherence and promotes growth?",
                probePrompt: "What is 'redemptive sequencing' in narrative therapy, and how can it contribute to narrative resilience after a challenging event?",
                implementPrompt: "Think of a past challenging experience or setback. How is it currently framed in your life story? Now, attempt to reframe it using a 'redemptive sequence' – focus on what was learned, what strengths were developed, or how it led to unexpected positive outcomes, even if the event itself was painful. How does this change the story's impact?",
                connectPrompt: "How does 'Embracing Ambiguity & Uncertainty' (Liminal Fluidity module) support Narrative Resilience by allowing one to tolerate the discomfort of a temporarily disrupted or incoherent story while a new integration is formed?"
            }
          },
          {
            id: 'constitutional_amendments',
            title: 'Constitutional Amendments',
            nodeType: 'strategy',
            shortDefinition: 'The structured process for revising foundational principles in response to growth, error correction, or changing conditions.',
            learningObjective: 'Design and implement a principled amendment process that balances stability with necessary evolution of core beliefs.',
            keyTerms: ['principled revision', 'value evolution', 'belief updating', 'foundational changes', 'identity development'],
            download: {
              clarification: 'Constitutional amendments are the formal procedures by which you revise your most fundamental principles. Unlike casual opinion changes, amendments require meeting a higher threshold of evidence, reflection, and integration. This process respects both the value of stability (preventing impulsive changes) and the necessity of evolution (preventing outdated rigidity).',
              example: 'Someone raised with a core value of "achievement above all" might, through considered amendment, revise this to "balanced achievement within a flourishing life"—not abandoning the importance of accomplishment but embedding it within a broader framework.',
              scenario: 'After multiple relationships end similarly, you realize your core belief "vulnerability shows weakness" has created consistent patterns of emotional distance. A constitutional amendment process would involve deep examination of this belief\'s origins, effects, and alternatives before formally revising it.',
              recallPrompt: 'What distinguishes constitutional amendments from ordinary belief changes, and why is a formal amendment process valuable?'
            },
            epic: {
                explainPrompt: "Describe the concept of 'Constitutional Amendments' as applied to a Personal Constitution. Why is it important to have a formal process for revising core principles rather than changing them haphazardly?",
                probePrompt: "What criteria might one establish for triggering or ratifying a 'constitutional amendment' to their personal principles (e.g., sustained reflection, external feedback, significant life event)?",
                implementPrompt: "Imagine you have a 'Personal Constitution' and a core principle within it is challenged by new experiences or learning. Outline the steps of a hypothetical 'amendment process' you would follow to consider revising this principle. What would this process involve?",
                connectPrompt: "How does 'Recursive Sovereignty' (Sovereign Domain) provide the meta-level authority to establish and execute a process for Constitutional Amendments?"
            }
          },
          {
            id: 'voice_authentication',
            title: 'Voice Authentication',
            nodeType: 'strategy',
            shortDefinition: 'The ability to recognize and verify your authentic voice amid external influences, social pressure, and internalized expectations.',
            learningObjective: 'Develop reliable methods to distinguish your authentic voice from mimicked, borrowed, or imposed perspectives.',
            keyTerms: ['authenticity detection', 'voice signature', 'somatic markers', 'false voice recognition', 'thought attribution'],
            download: {
              clarification: 'Voice authentication is your internal security system for distinguishing thoughts that truly originate from your values versus those imported from others. Like biometric systems that verify identity through unique patterns, this capacity recognizes the "signature" of your authentic voice through subtle cues, often including emotional and somatic markers that accompany alignment with true values.',
              example: 'When considering a career change, someone might notice that one option produces confident resonance (authentic voice) while another creates anxious urgency (borrowed voice reflecting parental expectations), helping them distinguish their genuine preference from internalized pressure.',
              scenario: 'During a political discussion, you find yourself repeating phrases that sound sophisticated but don\'t fully align with your actual understanding. Voice authentication notices this discrepancy, flagging these as borrowed rather than authentic expressions of your perspective.',
              recallPrompt: 'What is voice authentication, and what signals might help distinguish authentic from inauthentic internal voices?'
            },
            epic: {
                explainPrompt: "Explain 'Voice Authentication.' What are some tell-tale signs or 'signatures' of one's authentic inner voice versus an internalized external voice (e.g., a critical parent, societal pressure)?",
                probePrompt: "How can practices like mindfulness or 'Somatic Resonance' (Emotional Alchemy) help in developing the sensitivity needed for Voice Authentication?",
                implementPrompt: "Pay attention to your internal monologue for one day. Try to identify at least one instance where you 'heard' an internal voice offering an opinion or directive. Reflect: Did this voice feel genuinely your own, or did it sound like someone else (e.g., a parent, a teacher, a cultural message)? What cues helped you make this distinction?",
                connectPrompt: "How does 'Sovereign Narrative' rely on Voice Authentication to ensure that the story being authored is genuinely one's own, rather than a script written by external influences?"
            }
          },
          {
            id: 'sovereign_revision',
            title: 'Sovereign Revision',
            nodeType: 'strategy',
            shortDefinition: 'The empowered practice of consciously updating beliefs, narratives, and systems based on new information and evolving understanding.',
            learningObjective: 'Implement structured revision practices that maintain coherence while embracing growth and necessary change.',
            keyTerms: ['belief updating', 'narrative evolution', 'identity continuity', 'principled change', 'cognitive flexibility'],
            download: {
              clarification: 'Sovereign revision involves intentionally updating your beliefs, narratives, and systems—not as surrender to external pressure, but as an expression of your authority over your own cognitive domain. Unlike passive absorption of new ideas or resistant denial, it acknowledges that the highest sovereignty includes the right to change yourself deliberately.',
              example: 'A scientist who built her career on a particular theory might practice sovereign revision by acknowledging new evidence against it, systematically updating her understanding, and integrating this change into her identity narrative—viewing it as intellectual growth rather than failure.',
              scenario: 'After reading research contradicting your long-held views on a health practice, sovereign revision would involve neither defensive rejection nor immediate abandonment of your position, but a systematic process of evaluating evidence, considering implications, and consciously deciding how to update your understanding.',
              recallPrompt: 'What distinguishes sovereign revision from both stubborn resistance to change and uncritical acceptance of new information?'
            },
            epic: {
                explainPrompt: "Describe 'Sovereign Revision.' How does this practice balance the need for stable, coherent belief systems with the necessity of adapting to new information and experiences?",
                probePrompt: "What role does 'Epistemic Humility' (Skeptical Empiricism domain) play in enabling Sovereign Revision? Why might a lack of it lead to either dogmatism or chaotic belief instability?",
                implementPrompt: "Identify one belief or perspective you've held for a long time that has recently been challenged by new information or experiences. Outline a 'Sovereign Revision' process you could undertake: 1. Acknowledge the challenge. 2. Gather and evaluate evidence for both old and new perspectives. 3. Consider implications for related beliefs. 4. Make a conscious decision about how to integrate/update. 5. Revise your narrative.",
                connectPrompt: "How is 'Sovereign Revision' a practical application of the 'Constitutional Amendments' process, applied more broadly to the ongoing evolution of one's entire cognitive architecture?"
            }
          },
        ], 'sovereign', 'sov-3'),
      },
      {
        id: 'skeptical_empiricism',
        title: 'Skeptical Empiricism Domain',
        learningGoal: 'Develop rigorous, evidence-based thinking by mastering principles of falsifiability, confidence calibration, and disciplined pattern recognition, guarding against cognitive biases and logical fallacies.',
        chronicleTheme: 'Illusion labyrinths and data ambiguity dungeons, where truth is forged through rigorous testing.',
        domainDungeonType: 'empirical_validation_crucible',
        characterAffinities: ['praxis', 'neuros', 'veritas', 'veridex'],
        specterAffinities: ['certainty-specter', 'complexity-specter', 'misinterpretation-specter', 'control-specter'],
        nodes: addStatusToNodes([
          {
            id: 'falsifiability',
            title: 'Falsifiability',
            nodeType: 'principle',
            shortDefinition: 'The quality of claims that can be tested and potentially proven false, a key criterion for scientific and empirical evaluation.',
            learningObjective: 'Apply falsifiability principles to distinguish testable claims from unfalsifiable ones and design appropriate verification methods.',
            keyTerms: ['testability', 'verification', 'disconfirmation', 'empirical claims', 'hypothesis testing', 'demarcation criteria'],
            download: {
              clarification: 'Falsifiability determines whether a claim can be empirically evaluated. For a statement to be falsifiable, there must be some possible observation that would prove it false. Claims that cannot be disproven through any conceivable evidence remain outside scientific evaluation. Falsifiability doesn\'t mean a claim is false, but that it\'s structured in a way that allows testing against reality.',
              example: '"All swans are white" is falsifiable—finding a single black swan would disprove it. In contrast, "Everything happens for a reason" isn\'t falsifiable, as no possible observation could conclusively disprove this claim, making it unfalsifiable.',
              scenario: 'Someone claims their meditation technique improves memory. To apply falsifiability, you help them reformulate this into a testable claim: "People who practice this technique for 8 weeks will show statistically significant improvement on standardized memory tests compared to a control group." This creates specific conditions under which the claim could be proven false.',
              recallPrompt: 'What makes a claim falsifiable, and why is falsifiability important for empirical reasoning?'
            },
            epic: {
                explainPrompt: "Define 'Falsifiability' as a criterion for scientific or empirical claims. Why did Karl Popper emphasize falsifiability over verifiability as the key demarcation criterion for science?",
                probePrompt: "Are all meaningful or useful statements falsifiable? Consider ethical statements, mathematical axioms, or personal preferences. If not, what is the domain of applicability for the falsifiability criterion?",
                implementPrompt: "Take a common belief or a claim you've heard recently. Evaluate its falsifiability: 1. State the claim clearly. 2. Describe a hypothetical observation or experiment that, if it occurred, would prove the claim false. 3. If you cannot conceive of such an observation, explain why the claim might be unfalsifiable.",
                connectPrompt: "How does the principle of 'Falsifiability' inform the design of good 'Experiments' (Natural Science Lab or other science modules) by requiring hypotheses to be testable and potentially refutable?"
            }
          },
          {
            id: 'confidence_calibration',
            title: 'Confidence Calibration',
            nodeType: 'strategy',
            shortDefinition: 'The alignment of subjective certainty with objective probability or the actual frequency of being correct.',
            learningObjective: 'Develop calibrated confidence assessments that match subjective certainty levels with actual reliability across different domains.',
            keyTerms: ['overconfidence bias', 'uncertainty quantification', 'probability estimation', 'calibration curves', 'epistemic humility', 'confidence intervals'],
            download: {
              clarification: 'Confidence calibration means your subjective confidence level matches your objective accuracy rate. Well-calibrated individuals who say they\'re 70% confident are right approximately 70% of the time—not 90% (overconfidence) or 50% (underconfidence). Most people exhibit systematic miscalibration, typically overconfidence in their knowledge and predictions.',
              example: 'A weather forecaster predicting "30% chance of rain" is well-calibrated if, across all days when they make this prediction, it actually rains approximately 30% of the time. Each individual prediction isn\'t "right" or "wrong"—calibration is about long-term alignment between stated confidence and actual outcomes.',
              scenario: 'When estimating project completion times, you notice you\'re consistently overconfident—projects you\'re "90% sure" will finish on time actually complete on schedule only 60% of the time. Recognizing this calibration error, you adjust by adding buffer time or reducing stated confidence levels to more accurately reflect actual uncertainty.',
              recallPrompt: 'What does it mean to have well-calibrated confidence, and why might this be more valuable than simply being highly confident?'
            },
            epic: {
                explainPrompt: "Explain 'Confidence Calibration.' Why are humans often poorly calibrated, typically exhibiting overconfidence? What are the negative consequences of miscalibrated confidence?",
                probePrompt: "What are some practical methods for improving confidence calibration (e.g., keeping a prediction journal, seeking feedback on confidence judgments, considering ranges instead of point estimates)?",
                implementPrompt: "For the next five predictions you make this week (even small ones, like 'I'm 80% sure this meeting will end on time'), assign a confidence percentage. Record your prediction, your confidence, and the actual outcome. At the end of the week, review. How well did your subjective confidence align with your actual accuracy? What adjustments might you make?",
                connectPrompt: "How does 'Meta-Level Understanding Evaluation' (Thinking module) contribute to better Confidence Calibration by helping one accurately assess the limits of their own knowledge?"
            }
          },
          {
            id: 'evidence_evaluation',
            title: 'Evidence Evaluation',
            nodeType: 'strategy',
            shortDefinition: 'The systematic assessment of information quality, reliability, and relevance using structured criteria.',
            learningObjective: 'Apply evidence evaluation frameworks to assess information quality across domains and calibrate confidence based on evidence strength.',
            keyTerms: ['source credibility', 'methodology assessment', 'sample quality', 'evidence hierarchies', 'relevance determination', 'bias detection'],
            download: {
              clarification: 'Evidence evaluation systematically assesses information quality to determine appropriate confidence levels. Unlike accepting claims based on authority or popularity, it examines specific attributes: source credibility, methodological rigor, sample representativeness, logical consistency, and convergence across multiple sources. Different domains have appropriate evidence hierarchies—experimental studies may be prioritized in science, while firsthand accounts may be valuable for understanding personal experiences.',
              example: 'When evaluating health claims, evidence evaluation distinguishes between anecdotes, correlational studies, and randomized controlled trials. Each is assessed for sample size, methodology, controls for confounding variables, replication status, and consistency with established knowledge.',
              scenario: 'Researching a major purchase, you apply evidence evaluation by examining reviewer expertise, distinguishing firsthand experiences from speculation, checking for patterns across multiple independent sources, and weighing the relevance of specific use cases to your own needs.',
              recallPrompt: 'What key criteria should be applied when systematically evaluating evidence quality, and why might appropriate evidence standards differ across domains?'
            },
            epic: {
                explainPrompt: "Describe a systematic approach to 'Evidence Evaluation.' What key questions should you ask when assessing the quality and relevance of a piece of evidence?",
                probePrompt: "What is the 'hierarchy of evidence' concept often used in scientific fields like medicine? Why are some types of evidence (e.g., randomized controlled trials) generally considered stronger than others (e.g., anecdotal reports)?",
                implementPrompt: "Find an online article or social media post that makes a claim and provides some form of evidence. Apply an evidence evaluation framework: 1. Source: Who is making the claim? Are they credible/biased? 2. Evidence Type: What kind of evidence is offered (data, anecdote, expert opinion)? 3. Strength: How strong is this evidence? Are there methodological flaws? 4. Relevance: How directly does the evidence support the specific claim being made?",
                connectPrompt: "How does 'Advanced Source Analysis & Credibility Assessment' (Thinking module) serve as a specific application of broader Evidence Evaluation principles?"
            }
          },
          {
            id: 'error_tolerance',
            title: 'Error Tolerance',
            nodeType: 'principle',
            shortDefinition: 'The capacity to acknowledge, integrate, and learn from mistakes without undermining self-worth or cognitive progress.',
            learningObjective: 'Develop error tolerance practices that facilitate learning from mistakes, reduce defensive responses, and improve future performance.',
            keyTerms: ['productive failure', 'error-based learning', 'psychological safety', 'growth mindset', 'mistake integration', 'failure analysis'],
            download: {
              clarification: 'Error tolerance creates a productive relationship with mistakes—not dismissing them but also not being derailed by them. It treats errors as valuable data points rather than moral failures or indictments of ability. This capacity involves separating performance from identity, maintaining curiosity about mistakes rather than defensiveness, and systematically extracting learning rather than hiding or ruminating on failures.',
              example: 'A research team with high error tolerance conducts regular "failure analyses" where members openly discuss unsuccessful experiments, examining what went wrong without blame or shame. They systematically document lessons learned, creating an organizational knowledge base that improves future work.',
              scenario: 'After making a significant error in a presentation, you practice error tolerance by: 1) acknowledging the mistake directly, 2) separating the error from your professional identity, 3) analyzing specifically what went wrong and why, and 4) designing targeted improvement strategies rather than generalizing to "I\'m bad at presenting."',
              recallPrompt: 'How does productive error tolerance differ from either dismissing mistakes or being overly self-critical about them?'
            },
            epic: {
                explainPrompt: "Explain 'Error Tolerance.' Why is the ability to learn from mistakes, rather than simply avoid them or be devastated by them, crucial for long-term growth and innovation?",
                probePrompt: "What cultural or personal factors might inhibit error tolerance (e.g., fear of judgment, perfectionism, high-stakes environments with severe penalties for mistakes)? How can these be navigated?",
                implementPrompt: "Reflect on a recent mistake you made (small or large). Instead of focusing on regret, conduct a 'productive failure analysis': 1. What was the intended outcome? 2. What was the actual outcome? 3. What were the key contributing factors to the error (internal and external)? 4. What is the most valuable lesson learned from this error? 5. What specific action can you take to apply this lesson in the future?",
                connectPrompt: "How does 'Narrative Resilience' (Self-Authorship Domain) support Error Tolerance by helping to integrate mistakes into one's life story in a constructive way, rather than as purely negative events?"
            }
          },
          {
            id: 'pattern_skepticism',
            title: 'Pattern Skepticism',
            nodeType: 'strategy',
            shortDefinition: 'The disciplined questioning of perceived patterns to distinguish meaningful signals from random noise or cognitive impositions.',
            learningObjective: 'Apply pattern skepticism to identify genuine vs. illusory patterns, evaluate statistical significance, and avoid false pattern recognition.',
            keyTerms: ['apophenia', 'randomness recognition', 'statistical significance', 'correlation analysis', 'cognitive biases', 'signal detection'],
            download: {
              clarification: 'Pattern skepticism counterbalances our natural tendency to find patterns everywhere—even in random data. It involves questioning whether perceived patterns represent genuine relationships or are products of coincidence, selection bias, or our pattern-seeking cognitive machinery. This capacity helps distinguish signal from noise, applying appropriate statistical thinking, considering alternative explanations, and requiring stronger evidence for extraordinary pattern claims.',
              example: 'An investor notices that stocks have risen the past three Mondays and is tempted to see a pattern. Pattern skepticism prompts statistical evaluation: with 52 Mondays per year, finding 3 consecutive increases is likely by chance alone. This prevents overinterpreting random fluctuations as meaningful trends.',
              scenario: 'When analyzing customer feedback, you notice several complaints about a specific feature. Before concluding there\'s a widespread problem, pattern skepticism leads you to check whether these represent a statistically significant portion of users, whether the complaints emerged after a particular trigger, and whether selection effects might be creating an illusory pattern.',
              recallPrompt: 'Why is pattern skepticism necessary given our natural pattern-recognition tendencies, and what techniques help distinguish genuine patterns from illusory ones?'
            },
            epic: {
                explainPrompt: "Describe 'Pattern Skepticism.' How does it act as a critical filter for our innate pattern-seeking abilities? What are the dangers of insufficient pattern skepticism?",
                probePrompt: "What is 'apophenia' (seeing patterns in random data)? How does it relate to pattern skepticism? Can pattern skepticism be taken too far, leading to an inability to recognize genuine emerging patterns?",
                implementPrompt: "Look for a 'pattern' in everyday life this week (e.g., a series of coincidences, a perceived trend in events, a 'lucky' item). Apply pattern skepticism: 1. Describe the perceived pattern. 2. How many data points support it? 3. Could it be due to chance or selection bias (e.g., you only notice confirming instances)? 4. What would constitute stronger evidence for this pattern being real?",
                connectPrompt: "How does 'Weak Signal Amplification' (Chaossynthesis or Intuitive Synthesis modules) need to be balanced with Pattern Skepticism to ensure that one is amplifying genuine signals rather than noise?"
            }
          },
          {
            id: 'logical_fallacies',
            title: 'Logical Fallacies',
            nodeType: 'concept',
            shortDefinition: 'Common patterns of reasoning that appear valid but contain structural flaws that undermine logical soundness.',
            learningObjective: 'Identify common logical fallacies in arguments, understand their structural flaws, and develop resistance to their persuasive but invalid influences.',
            keyTerms: ['formal fallacies', 'informal fallacies', 'reasoning errors', 'fallacy identification', 'argument assessment', 'logical structure'],
            download: {
              clarification: 'Logical fallacies are errors in reasoning that undermine an argument\'s validity despite often appearing persuasive. They divide into formal fallacies (structural errors in deductive reasoning like affirming the consequent) and informal fallacies (broader patterns of unsound reasoning like appealing to inappropriate authority). Recognizing fallacies requires understanding their defining structures rather than merely memorizing labels.',
              example: 'The ad hominem fallacy attacks the person rather than addressing their argument: "We shouldn\'t listen to her environmental proposal because she once flew on a private jet." This structure diverts attention from the proposal\'s actual merits to irrelevant personal characteristics.',
              scenario: 'During a policy debate, someone argues: "This healthcare approach has never been tried before in our country, so it won\'t work here." This appeal to tradition fallacy assumes that newness indicates ineffectiveness without addressing the proposal\'s specific merits or evidence from other contexts.',
              recallPrompt: 'What distinguishes formal from informal fallacies, and why might fallacious arguments often feel more persuasive than valid but complex reasoning?'
            },
            epic: {
                explainPrompt: "Explain what a 'logical fallacy' is. Choose one common informal fallacy (e.g., straw man, ad hominem, appeal to emotion) and describe how it works and why it's fallacious.",
                probePrompt: "Why are logical fallacies often so persuasive despite being logically flawed? What psychological or rhetorical factors contribute to their effectiveness?",
                implementPrompt: "Find an example of an argument in a recent news article, social media discussion, or advertisement. Analyze it for logical fallacies. Identify at least one specific fallacy, name it, and explain how the argument commits that fallacy.",
                connectPrompt: "How does 'Argument Deconstruction & Fallacy Analysis' (Thinking module) provide a systematic approach to identifying and understanding the impact of logical fallacies in complex arguments?"
            }
          },
          {
            id: 'bayesian_reasoning',
            title: 'Bayesian Reasoning',
            nodeType: 'strategy',
            shortDefinition: 'A probabilistic approach to belief revision that updates confidence levels based on prior probabilities and the strength of new evidence.',
            learningObjective: 'Apply Bayesian principles to update beliefs proportionally to evidence strength, distinguishing between base rates and specific evidence.',
            keyTerms: ['prior probability', 'posterior probability', 'likelihood ratio', 'base rate', 'conditional probability', 'bayesian updating', 'probability revision'],
            download: {
              clarification: 'Bayesian reasoning provides a structured approach to updating beliefs based on new evidence. It combines three key elements: 1) Prior probability—initial confidence before new evidence; 2) Likelihood ratio—how strongly the evidence supports one hypothesis over alternatives; and 3) Posterior probability—updated confidence after incorporating evidence. This approach prevents both under-updating (maintaining beliefs despite contradicting evidence) and over-updating (excessive revision based on limited evidence).',
              example: 'A medical test for a rare disease (1% prevalence) has 95% accuracy. Without Bayesian reasoning, a positive test seems to almost guarantee having the disease. Applying Bayes\' theorem shows that despite the positive result, there\'s only about 16% probability of having the disease—because the calculation properly incorporates the low base rate.',
              scenario: 'When evaluating employee performance, you start with the base rate that about 15% of employees in this role exceed expectations. An employee shows impressive results on one project, which is moderate evidence of exceptional ability. Bayesian reasoning helps calibrate your updated assessment, preventing over-updating based on limited evidence while still acknowledging the positive indicator.',
              recallPrompt: 'What three key elements does Bayesian reasoning combine when updating beliefs, and why is considering base rates essential for accurate probability judgments?'
            },
            epic: {
                explainPrompt: "Describe Bayesian Reasoning in simple terms. How does it provide a formal way to update our beliefs in light of new evidence?",
                probePrompt: "What is 'base rate neglect,' and how does Bayesian reasoning help to counteract this common cognitive error? Provide an example.",
                implementPrompt: "Imagine you are testing a hypothesis. Your initial belief (prior probability) that the hypothesis is true is 30%. You receive a piece of evidence that is 3 times more likely if the hypothesis is true than if it's false (likelihood ratio = 3). Without doing complex math, intuitively explain how your belief in the hypothesis should change (increase, decrease, stay same) and roughly by how much. (Optional: if comfortable, use Bayes' Theorem odds form to calculate the posterior probability).",
                connectPrompt: "How does 'Belief Updating' as a general principle (part of many modules like Self-Authorship or Ethical Architecture) find a more rigorous and quantifiable method in Bayesian Reasoning?"
            }
          },
        ], 'sovereign', 'sov-4'),
      },
    ],
};
