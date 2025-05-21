
import type { Module, ModuleType } from '@/types/neuro';
import { addStatusToNodes } from './_common'; // Using existing addStatusToNodes

export const thinkingModuleData: Omit<Module, 'status'> = {
    id: 'thinking',
    type: 'pillar' as ModuleType,
    title: 'Cognitive Clarity: The Architecture of Thought',
    description: 'Equip the user with structured cognitive tools for logic, abstraction, problem solving, and recursive evaluation.',
    moduleLearningGoal: 'To cultivate a versatile and rigorous cognitive toolkit, enabling effective logical reasoning, creative synthesis, critical analysis, and metacognitive control for enhanced problem-solving and decision-making.',
    tags: ['logic', 'reasoning', 'creativity', 'analysis', 'metacognition', 'problem-solving'],
    alignmentBias: 'neutral',
    defaultCompanion: 'neuros',
    associatedSpecters: ['certainty-specter', 'rigidity-specter', 'complexity-specter', 'fragmentation-specter'], // Performance maps to complexity or certainty.
    recommendedChronicleDungeon: 'The Labyrinth of Inference & Insight',
    moduleCategory: ['Rationality', 'Problem Solving', 'Critical Thinking', 'Cognitive Skills'],
     reviewProfile: {
      decayModel: 'performance_adaptive',
      reviewClusters: [
        ['think-d1-n1', 'think-d1-n2', 'think-d1-n6'],
        ['think-d2-n1', 'think-d2-n2', 'think-d2-n5'],
        ['think-d3-n1', 'think-d3-n4', 'think-d3-n6'],
        ['think-d4-n1', 'think-d4-n2', 'think-d4-n6'],
      ],
      interleaveRatio: 0.3
    },
    domains: [
      {
        id: 'think-d1',
        title: 'Logical Reasoning Foundations',
        learningGoal: 'Master formal and informal reasoning structures, ensuring conclusions are validly derived from premises and arguments are sound.',
        chronicleTheme: 'Navigating logic puzzles and argument validity tests within an axiomatic system where flawed reasoning leads to immediate dead ends.',
        domainDungeonType: 'logic_validation_maze',
        characterAffinities: ['neuros', 'veritas'],
        specterAffinities: ['certainty-specter', 'rigidity-specter', 'contradiction-specter'],
        nodes: addStatusToNodes([
          { 
            id: 'think-d1-n1', 
            title: 'Deductive Reasoning & Validity', 
            nodeType: 'concept', 
            shortDefinition: 'Reasoning from general premises to specific, logically certain conclusions. Validity refers to correct logical structure.', 
            learningObjective: 'Apply principles of deductive logic to construct valid arguments and evaluate the validity of given arguments, ensuring conclusions necessarily follow from premises.', 
            keyTerms: ['deduction', 'validity', 'syllogism', 'formal logic', 'premise', 'conclusion', 'inference rules (e.g., modus ponens)'], 
            download: { 
              clarification: 'In deductive reasoning, if the premises are true and the argument form is valid, the conclusion *must* be true. Validity is about the argument\'s structure, not the truth of its content.', 
              example: 'Valid: All men are mortal (Premise 1). Socrates is a man (Premise 2). Therefore, Socrates is mortal (Conclusion). Invalid: All men are mortal. Socrates is mortal. Therefore, Socrates is a man (Affirming the Consequent).', 
              scenario: 'Using established scientific laws (general premises) to predict specific experimental outcomes (conclusion). Mathematical proofs are largely deductive.', 
              recallPrompt: 'Define deductive reasoning. What makes a deductive argument "valid"?' 
            }, 
            epic: {
              explainPrompt: "Explain the concept of 'validity' in deductive reasoning. How can an argument be valid even if its premises are false? Provide an example.",
              probePrompt: "Why is deductive reasoning often considered the 'gold standard' for certainty in logic? What are its limitations when dealing with real-world complexity or incomplete information?",
              implementPrompt: "Construct a simple valid deductive argument (syllogism) with two premises and a conclusion on a topic of your choice. Then, create a structurally similar argument that is *invalid* and explain the flaw (e.g., by showing a counterexample where premises are true but conclusion is false).",
              connectPrompt: "How does the 'Non-Contradiction' principle (AXIOMOS) underpin the requirement for validity in deductive arguments? Can a valid argument lead to contradictory conclusions if the premises are contradictory?"
            }
          },
          { 
            id: 'think-d1-n2', 
            title: 'Inductive Reasoning & Strength', 
            nodeType: 'concept', 
            shortDefinition: 'Reasoning from specific observations or evidence to general principles or probable conclusions. Strength refers to the likelihood of the conclusion being true.', 
            learningObjective: 'Utilize inductive reasoning to generate plausible hypotheses from evidence, and evaluate the strength of inductive arguments based on sample size, representativeness, and analogy quality.', 
            keyTerms: ['induction', 'probability', 'generalization', 'hypothesis generation', 'evidence', 'argument strength', 'sample bias'], 
            download: { 
              clarification: 'Inductive conclusions are probable, not certain, based on the evidence provided. The strength of an inductive argument depends on factors like the quality and quantity of evidence.', 
              example: 'Observing many white swans and concluding "all swans are white" (strong induction, but ultimately falsified by black swans). Inferring that because the sun has risen every day so far, it will rise tomorrow (very strong induction).', 
              scenario: 'Scientists forming hypotheses based on experimental observations. Market researchers identifying consumer trends based on survey data and purchasing behavior.', 
              recallPrompt: 'Explain inductive reasoning and how it differs from deduction. What determines the "strength" of an inductive argument?' 
            }, 
            epic: {
              explainPrompt: "Describe 'inductive reasoning.' Why are its conclusions probabilistic rather than certain? What factors contribute to the strength or weakness of an inductive argument?",
              probePrompt: "What are common pitfalls or biases in inductive reasoning (e.g., hasty generalization, confirmation bias seeking supporting evidence)? How can these be mitigated?",
              implementPrompt: "Observe a recurring pattern in your daily life or a specific domain (e.g., traffic patterns, a friend's behavior, market trends). Formulate an inductive generalization based on your observations. Then, identify at least one piece of evidence that would strengthen your generalization and one that would weaken or falsify it.",
              connectPrompt: "How does 'Falsifiability' (Skeptical Empiricism) relate to the process of testing inductive generalizations? How does 'Bayesian Reasoning' provide a formal framework for updating the strength of an inductive belief based on new evidence?"
            }
          },
          { 
            id: 'think-d1-n3', 
            title: 'Abductive Reasoning (Inference to Best Explanation)', 
            nodeType: 'strategy', 
            shortDefinition: 'A form of logical inference that starts with an observation or set of observations and then seeks to find the simplest and most likely explanation.', 
            learningObjective: 'Apply abductive reasoning to generate and evaluate plausible hypotheses that best explain incomplete or puzzling sets of data or observations.', 
            keyTerms: ['abduction', 'inference to best explanation (IBE)', 'hypothesis', 'diagnosis', 'explanation', 'explanatory power', 'simplicity (Occam\'s Razor)'], 
            download: { 
              clarification: 'Abductive reasoning is about finding the most plausible hypothesis given the available evidence. It doesn\'t guarantee truth but aims for the best current explanation. Often used in diagnostics and scientific discovery.', 
              example: 'The ground is wet; the sky is cloudy; you hear thunder. The best explanation (abduction) is that it has recently rained or is raining.', 
              scenario: 'Doctors diagnosing an illness by observing symptoms and inferring the most likely underlying disease. Detectives solving a crime by constructing the most plausible narrative from clues.', 
              recallPrompt: 'Define abductive reasoning. How does it differ from inductive and deductive reasoning?' 
            }, 
            epic: {
              explainPrompt: "Explain 'abductive reasoning' or 'inference to the best explanation.' What criteria make one explanation 'better' than another (e.g., explanatory power, simplicity, coherence with existing knowledge)?",
              probePrompt: "What are the risks of abductive reasoning (e.g., jumping to conclusions, being swayed by the most available explanation rather than the most likely)? How can these be mitigated?",
              implementPrompt: "Observe an everyday unexplained phenomenon (e.g., a strange noise, an unexpected computer behavior, a plant wilting despite watering). Generate at least two different plausible hypotheses (explanations) using abductive reasoning. Which explanation seems 'best' and why, based on criteria like simplicity and explanatory power?",
              connectPrompt: "How does 'Belief Architecture' (AXIOMOS) influence which explanations are considered 'best' during abductive reasoning, by providing a network of existing beliefs for coherence checking?"
            }
          },
          { 
            id: 'think-d1-n4', 
            title: 'Argument Mapping & Structure Analysis', 
            nodeType: 'strategy', 
            shortDefinition: 'Visually or conceptually representing the logical structure of arguments, identifying premises, conclusions, sub-arguments, and inferential links.', 
            learningObjective: 'Analyze and visually map the logical structure of complex arguments to clarify their components and evaluate their coherence.', 
            keyTerms: ['premise', 'conclusion', 'inference', 'argument mapping', 'logical flow', 'sub-argument', 'co-premise', 'assumption (revisited)'], 
            download: { 
              clarification: 'Argument mapping involves breaking down an argument into its core claims (conclusions) and the reasons supporting them (premises), showing how they connect. This visual representation clarifies the argument\'s structure and helps identify strengths, weaknesses, and hidden assumptions.', 
              example: 'Mapping an editorial by identifying its main conclusion, then listing each supporting reason as a premise, and further breaking down complex reasons into sub-arguments.', 
              scenario: 'Lawyers structuring complex legal arguments for court, ensuring all claims are supported by evidence and logical reasoning. Academics analyzing philosophical texts by mapping the author\'s chain of reasoning.', 
              recallPrompt: 'What are the key components one identifies when creating an argument map, and what is the primary benefit of this technique?' 
            }, 
            epic: {
              explainPrompt: "Describe the process of 'argument mapping.' How can visualizing an argument's structure help in understanding and evaluating it?",
              probePrompt: "What are some common challenges in accurately mapping complex or poorly structured arguments? How can one deal with unstated premises or ambiguous language?",
              implementPrompt: "Find a short opinion piece or letter to the editor. Create a simple argument map: 1. Identify the main conclusion. 2. List the explicit premises offered. 3. Show the connections (which premises support which conclusions/sub-conclusions). 4. Try to identify at least one unstated assumption if possible.",
              connectPrompt: "How does 'Argument Deconstruction' (Critical Analysis domain in this module) complement 'Argument Mapping'? Are they different stages of the same analytical process?"
            }
          },
          { 
            id: 'think-d1-n5', 
            title: 'Introduction to Formal Logic Systems', 
            nodeType: 'concept', 
            shortDefinition: 'Understanding the basics of symbolic systems (e.g., propositional logic, predicate logic) used to represent and evaluate logical validity with precision, abstracting from natural language ambiguity.', 
            learningObjective: 'Understand the purpose and basic symbols/rules of formal logic systems like propositional logic, and how they aid in precise argument evaluation.', 
            keyTerms: ['propositional logic', 'predicate logic', 'symbols (logical)', 'truth values', 'validity testing', 'Boolean algebra', 'logical connectives (¬, ∧, ∨, →, ↔)'], 
            download: { 
              clarification: 'Formal logic uses symbolic language to abstract the logical form of arguments from their specific content, allowing for rigorous testing of validity. Propositional logic deals with whole statements, while predicate logic analyzes the internal structure of statements involving subjects and predicates.', 
              example: 'Using propositional logic: P → Q (If P, then Q). P (P is true). Therefore, Q (Q is true) - Modus Ponens. This form is valid regardless of what P and Q represent.', 
              scenario: 'Computer science relies heavily on formal logic (e.g., Boolean algebra for circuit design, predicate logic for database queries and AI reasoning systems).', 
              recallPrompt: 'What is the primary purpose of using formal logic systems in reasoning, compared to relying on natural language arguments alone?' 
            }, 
            epic: {
              explainPrompt: "Explain the basic idea behind 'formal logic systems' like propositional logic. Why is abstracting logical form from content useful for evaluating arguments?",
              probePrompt: "What are some limitations of simple propositional logic when trying to represent the complexity of real-world arguments? How does predicate logic address some of these limitations?",
              implementPrompt: "Translate the following simple argument into propositional logic symbols: 'If it is raining (R), then the street is wet (W). It is raining (R). Therefore, the street is wet (W).' What is the name of this valid argument form?",
              connectPrompt: "How do 'Ethical Axioms' (Ethical Architecture) function similarly to axioms in a formal logical system, providing foundational starting points for reasoning within that domain?"
            }
          },
          { 
            id: 'think-d1-n6', 
            title: 'Soundness vs. Validity in Argumentation', 
            nodeType: 'principle', 
            shortDefinition: 'The critical distinction between an argument having a logically correct structure (validity) and an argument being valid *and* having all true premises (soundness).', 
            learningObjective: 'Accurately evaluate arguments for both logical validity and factual soundness, understanding that an argument can be valid but unsound, or invalid even with true premises.', 
            keyTerms: ['validity (revisited)', 'soundness', 'true premises', 'logical structure (revisited)', 'argument evaluation', 'factual accuracy'], 
            download: { 
              clarification: 'A deductive argument is *valid* if its conclusion logically follows from its premises, regardless of whether the premises are true. An argument is *sound* if it is both valid AND all its premises are actually true. Only sound arguments guarantee a true conclusion.', 
              example: 'Valid but Unsound: All cats can fly (False Premise). Felix is a cat (True Premise). Therefore, Felix can fly (False Conclusion, but valid structure). Sound: All dogs are mammals (True Premise). Fido is a dog (True Premise). Therefore, Fido is a mammal (True Conclusion, sound argument).', 
              scenario: 'Evaluating policy proposals requires assessing not only if the proposed actions logically lead to the stated goals (validity) but also if the assumptions and factual claims underpinning the proposal are true (soundness).', 
              recallPrompt: 'Explain the difference between a valid deductive argument and a sound deductive argument. Can a valid argument have a false conclusion? Can an unsound argument have a true conclusion?' 
            }, 
            epic: {
              explainPrompt: "Describe the difference between 'validity' and 'soundness' in the context of deductive arguments. Why is this distinction crucial for critical thinking?",
              probePrompt: "Is it possible for an argument to have all true premises and a true conclusion, but still be invalid? If so, provide an example. What does this tell us about the importance of logical structure?",
              implementPrompt: "Create two short deductive arguments: 1. An argument that is VALID but UNSOUND. 2. An argument that is SOUND. Clearly label premises and conclusion for each, and explain why they fit the criteria.",
              connectPrompt: "How does 'Evidence Evaluation' (Sovereign Core - Skeptical Empiricism) contribute to determining the 'soundness' of an argument, while logical analysis primarily addresses its 'validity'?"
            }
          },
        ], 'thinking', 'think-d1'),
      },
      {
        id: 'think-d2',
        title: 'Creative Synthesis & Problem Solving',
        learningGoal: 'Develop and apply a diverse toolkit of techniques for generating novel ideas, synthesizing information, and creatively solving complex problems.',
        chronicleTheme: 'Navigating idea generation challenges, conceptual blending puzzles, and constraint-based innovation tasks within a dynamic creative forge.',
        domainDungeonType: 'creation_forge_of_ideas',
        characterAffinities: ['architect', 'praxis', 'ekitty', 'synthesis'],
        specterAffinities: ['emergence-specter', 'fragmentation-specter', 'rigidity-specter'],
        nodes: addStatusToNodes([
          { 
            id: 'think-d2-n1', 
            title: 'Divergent & Convergent Thinking Cycles', 
            nodeType: 'strategy', 
            shortDefinition: 'Alternating between generating multiple unique ideas or solutions (divergent thinking) and then evaluating and selecting the best options (convergent thinking).', 
            learningObjective: 'Apply cycles of divergent and convergent thinking to effectively brainstorm, explore possibilities, evaluate options, and select optimal solutions for a given problem.', 
            keyTerms: ['divergent thinking', 'convergent thinking', 'brainstorming', 'idea generation', 'evaluation criteria', 'problem-solving cycle', 'creative process'], 
            download: { 
              clarification: 'Effective problem-solving and creativity often involve cycling between these two modes: first, broadly exploring many possibilities (divergent), then narrowing down and refining (convergent). Rushing convergence or failing to diverge enough can limit solutions.', 
              example: 'Design process: Brainstorming many different product concepts (divergent), then applying criteria like feasibility, cost, and user need to select a few for prototyping (convergent).', 
              scenario: 'A research team first generates a wide range of hypotheses to explain a phenomenon (divergent), then designs experiments to systematically test and eliminate hypotheses until the most supported one remains (convergent).', 
              recallPrompt: 'Define divergent and convergent thinking. Why is it often beneficial to cycle between them when problem-solving?' 
            }, 
            epic: {
              explainPrompt: "Explain the difference between divergent and convergent thinking. Why is it important to separate these phases in a creative or problem-solving process?",
              probePrompt: "What common mistakes do people or teams make regarding divergent and convergent thinking (e.g., converging too quickly, insufficient divergence, criticizing ideas during brainstorming)?",
              implementPrompt: "Choose a simple, everyday problem (e.g., 'How to make a daily chore more enjoyable?' or 'How to reduce food waste at home?'). Spend 5 minutes in pure divergent thinking, listing as many ideas as possible without judgment. Then, spend 5 minutes in convergent thinking, selecting your top 1-2 ideas based on criteria like feasibility and impact. Describe your process.",
              connectPrompt: "How do 'Fluency, Flexibility, Originality, Elaboration' (Intuitive Synthesis module) primarily relate to the divergent thinking phase? What 'Critical Analysis' skills (from this module) are key for the convergent phase?"
            }
          },
          { 
            id: 'think-d2-n2', 
            title: 'Analogical & Metaphorical Thinking', 
            nodeType: 'strategy', 
            shortDefinition: 'Using knowledge, structures, or relationships from one domain (the source) to understand, explain, or solve problems in another domain (the target).', 
            learningObjective: 'Identify and apply useful analogies and metaphors to generate insights, explain complex concepts, and solve problems across different domains.', 
            keyTerms: ['analogy', 'metaphor', 'transfer of learning (revisited)', 'cross-domain thinking', 'conceptual mapping', 'structural similarity', 'biomimicry'], 
            download: { 
              clarification: 'Analogical thinking involves recognizing underlying structural similarities between different concepts or situations, allowing insights from a familiar domain to be applied to an unfamiliar one. Metaphors are a form of this, framing one concept in terms of another.', 
              example: 'Velcro was famously inspired by burrs sticking to fabric (biomimicry, a form of analogy). Describing the internet as an "information superhighway" is a metaphor that helps explain its function.', 
              scenario: 'Scientists often use analogies from known physical systems to develop hypotheses about unknown phenomena (e.g., early models of the atom analogized to the solar system). Educators use analogies to explain complex ideas in simpler terms.', 
              recallPrompt: 'Explain analogical thinking. How can it be a tool for both understanding and innovation?' 
            }, 
            epic: {
              explainPrompt: "Describe 'analogical thinking' and 'metaphorical thinking.' How do they aid in problem-solving and creativity? What makes an analogy or metaphor effective?",
              probePrompt: "What are the dangers of relying on poor or misleading analogies/metaphors? How can one critically evaluate the appropriateness of an analogy?",
              implementPrompt: "Choose a complex concept from one of your NeuroOS modules (e.g., 'Recursive Sovereignty,' 'Path Dependence,' 'Cognitive Bias'). Generate at least two different analogies or metaphors to explain this concept to someone unfamiliar with it. Evaluate which of your analogies is stronger and why.",
              connectPrompt: "How does 'Cross-Domain Mapping' (Synthetic Systems module) formalize the process of analogical thinking by identifying structural correspondences between different knowledge domains?"
            }
          },
          { 
            id: 'think-d2-n3', 
            title: 'Conceptual Blending & Integration Networks', 
            nodeType: 'strategy', 
            shortDefinition: 'A cognitive process of combining elements and relations from diverse conceptual input spaces into a new, "blended" mental space that often yields emergent, novel structures and meanings.', 
            learningObjective: 'Understand and apply the principles of conceptual blending to generate creative ideas, synthesize disparate information, and create novel conceptual frameworks.', 
            keyTerms: ['conceptual blending', 'mental spaces', 'integration network', 'emergent structure', 'creativity (cognitive theory)', 'Fauconnier & Turner', 'bisociation (revisited)'], 
            download: { 
              clarification: 'Conceptual blending theory (Fauconnier & Turner) explains how humans create new meanings by selectively projecting elements from different "input spaces" into a "blended space," which then develops its own emergent logic and structure. It\'s a powerful engine for creativity, metaphor, and everyday reasoning.', 
              example: 'The concept of a "computer virus" blends ideas from biology (virus, infection, replication, immune response) and technology (computers, software, networks) to create a new understanding of malicious software. The "desktop metaphor" in GUIs blends the physical office desk with computer operations.', 
              scenario: 'Innovators often use conceptual blending, consciously or unconsciously, e.g., combining "phone" and "internet access" and "camera" into the blended concept of a "smartphone." Many artistic and humorous creations rely on surprising conceptual blends.', 
              recallPrompt: 'Describe conceptual blending. What are "input spaces" and "blended space" in this theory?' 
            }, 
            epic: {
              explainPrompt: "Explain 'conceptual blending.' How does the 'blended space' often contain 'emergent structure' not present in the original input spaces? Provide an example.",
              probePrompt: "What makes some conceptual blends more successful, creative, or useful than others? Are there principles for creating effective blends?",
              implementPrompt: "Choose two distinct NeuroOS concepts from different modules (e.g., 'Sovereign Boundaries' from Sovereign Core and 'Feedback Loops' from Synthetic Systems). Attempt to create a 'conceptual blend' of these two. What new concept or insight emerges from their integration? Give your blend a name.",
              connectPrompt: "How does 'Bisociation' (Intuitive Synthesis module) relate to Conceptual Blending Theory? Is bisociation a specific type or outcome of a conceptual blend?"
            }
          },
          { 
            id: 'think-d2-n4', 
            title: 'Problem Reframing & Restructuring', 
            nodeType: 'strategy', 
            shortDefinition: 'The technique of changing the conceptual viewpoint, assumptions, or boundaries of a problem to see it in a new light, often revealing novel solutions or pathways.', 
            learningObjective: 'Apply various problem reframing techniques to overcome mental blocks, challenge initial assumptions, and discover alternative approaches to problem-solving.', 
            keyTerms: ['perspective shift', 'problem restructuring', 'cognitive restructuring', 'viewpoint change', 'assumption challenging (revisited)', 'problem definition'], 
            download: { 
              clarification: 'Problem reframing involves altering how a problem is initially perceived or defined. By shifting the perspective, one can often unlock new solutions that were invisible within the original frame. It challenges the implicit "rules" we set around a problem.', 
              example: 'If a company is struggling with "low employee morale" (problem frame 1), reframing it as "how can we create a more engaging work environment?" (problem frame 2) might lead to very different types of solutions.', 
              scenario: 'In therapy, cognitive restructuring techniques help individuals reframe negative or unhelpful thought patterns (e.g., reframing a "failure" as a "learning opportunity"). Designers often reframe problems based on user research to ensure they are solving the right problem.', 
              recallPrompt: 'What does it mean to "reframe" a problem, and why is this a powerful problem-solving technique?' 
            }, 
            epic: {
              explainPrompt: "Describe 'problem reframing.' How can changing the way a problem is stated or conceptualized lead to different solutions? Provide an example.",
              probePrompt: "What are some common obstacles to effective problem reframing (e.g., functional fixedness, prior experience, emotional attachment to a particular problem definition)?",
              implementPrompt: "Take a common personal or societal problem. State it in its usual form. Then, generate at least three different 'reframes' of the problem by: 1) Changing the verb/action. 2) Changing the assumed goal. 3) Changing the perspective (e.g., from individual to systemic). How do these reframes suggest different solution paths?",
              connectPrompt: "How does 'Framework Deconstruction' (Liminal Fluidity) support problem reframing by helping to dismantle the existing, potentially limiting, frame of a problem?"
            }
          },
          { 
            id: 'think-d2-n5', 
            title: 'Constraint-Driven Creativity & Innovation', 
            nodeType: 'principle', 
            shortDefinition: 'The principle that imposing or strategically leveraging limitations, rules, or constraints can often spur, rather than hinder, creative and innovative solutions.', 
            learningObjective: 'Effectively leverage constraints (e.g., time, resources, rules) as catalysts for creative problem-solving and innovation, rather than viewing them solely as impediments.', 
            keyTerms: ['constraints', 'limitations', 'rules (as enablers)', 'innovation', 'creative challenge', 'resourcefulness', 'design thinking'], 
            download: { 
              clarification: 'While often seen as restrictive, constraints can foster innovation by forcing focused effort, novel approaches, and resourcefulness. They narrow the problem space, which can paradoxically lead to more original solutions than complete freedom.', 
              example: 'Writing a poem with a specific rhyme scheme and meter (e.g., a sonnet) imposes constraints that can lead to highly creative word choices and expressions. The "100-dollar car" design challenge forcing engineers to innovate within extreme cost constraints.', 
              scenario: 'Startups often demonstrate constraint-driven innovation, leveraging limited resources to create disruptive solutions that larger, less constrained companies might overlook. Architects working with difficult sites or strict building codes often produce highly creative designs.', 
              recallPrompt: 'Explain the paradox of how constraints can enhance creativity and innovation.' 
            }, 
            epic: {
              explainPrompt: "Explain 'constraint-driven creativity.' Why can limitations sometimes lead to more innovative solutions than complete freedom?",
              probePrompt: "Is there a point where constraints become too severe and genuinely stifle creativity? How might one find the 'optimal' level of constraint for a given creative task?",
              implementPrompt: "Challenge yourself with a creative task under a significant constraint. For example: 1) Write a compelling short story of exactly 50 words. 2) Design a useful object using only three common household items (e.g., paperclips, rubber bands, cardboard). 3) Compose a simple melody using only three different musical notes. Reflect on how the constraint influenced your process and outcome.",
              connectPrompt: "How does 'Algorithmic Thinking' (Algorithmic Rationality) sometimes involve imposing constraints (rules, steps) to achieve a reliable outcome, and how might this intersect with creative problem-solving within those constraints?"
            }
          },
        ], 'thinking', 'think-d2'),
      },
       {
        id: 'think-d3',
        title: 'Critical Analysis & Evidence Evaluation',
        learningGoal: 'Develop and apply rigorous methods for deconstructing arguments, evaluating the quality of information and evidence, and identifying cognitive biases.',
        chronicleTheme: 'Navigating bias detection trials, evidence evaluation gauntlets, and argument deconstruction challenges presented by deceptive entities or corrupted data systems.',
        domainDungeonType: 'analysis_crucible_of_truth',
        characterAffinities: ['veritas', 'sentinel', 'neuros'],
        specterAffinities: ['certainty-specter', 'contradiction-specter', 'fragmentation-specter'], // Misinterpretation as fragmentation.
        nodes: addStatusToNodes([
          { 
            id: 'think-d3-n1', 
            title: 'Cognitive Bias Recognition & Mitigation', 
            nodeType: 'strategy', 
            shortDefinition: 'Identifying common systematic errors in thinking (e.g., confirmation bias, anchoring) that affect judgment, and applying strategies to reduce their impact.', 
            learningObjective: 'Recognize at least five common cognitive biases in oneself and in presented arguments, and articulate specific mitigation strategies for each.', 
            keyTerms: ['cognitive bias', 'heuristics (biasing)', 'confirmation bias', 'anchoring bias', 'availability heuristic', 'debiasing techniques', 'metacognition (revisited)'], 
            download: { 
              clarification: 'Cognitive biases are predictable mental shortcuts that can lead to flawed judgments. Recognizing them is the first step; mitigation involves conscious strategies like considering the opposite, seeking disconfirming evidence, or using structured decision processes.', 
              example: 'Noticing your tendency to primarily seek news sources that confirm your existing political beliefs (confirmation bias) and actively seeking out reputable sources with opposing viewpoints to mitigate it.', 
              scenario: 'Training programs for medical diagnosticians or financial analysts often include cognitive bias recognition and mitigation techniques to improve the accuracy of their professional judgments.', 
              recallPrompt: 'What are cognitive biases, and why is it important to both recognize and have strategies to mitigate them?' 
            }, 
            epic: {
              explainPrompt: "Define 'cognitive bias.' Choose two common cognitive biases and explain how they can lead to errors in judgment or decision-making.",
              probePrompt: "Why are cognitive biases often so difficult to detect in our own thinking? What makes them persistent even when we are aware of them?",
              implementPrompt: "Reflect on a recent decision you made or an opinion you formed. Try to identify at least one cognitive bias that might have influenced your thinking. What specific strategy could you have used (or could use next time) to mitigate that bias?",
              connectPrompt: "How does 'Epistemic Hygiene' (AXIOMOS) serve as a set of practices for mitigating cognitive biases in the information acquisition and belief formation process?"
            }
          },
          { 
            id: 'think-d3-n2', 
            title: 'Advanced Evidence Evaluation', 
            nodeType: 'strategy', 
            shortDefinition: 'Critically assessing the strength, relevance, source credibility, and methodological rigor of evidence used to support claims or hypotheses.', 
            learningObjective: 'Apply a comprehensive framework to critically evaluate the quality and relevance of diverse types of evidence (e.g., statistical, anecdotal, expert testimony) supporting a complex claim.', 
            keyTerms: ['evidence quality', 'source credibility (revisited)', 'relevance', 'statistical significance vs. practical significance', 'methodological rigor', 'hierarchy of evidence', 'data interpretation'], 
            download: { 
              clarification: 'This goes beyond basic fact-checking to scrutinize the nature of the evidence itself: How was it obtained? Is the source reliable and unbiased? Is the evidence directly relevant to the claim? Are statistical claims properly interpreted? How strong is it compared to other available evidence?', 
              example: 'Evaluating a scientific study by examining its sample size, control groups, statistical methods, peer-review status, funding sources, and reproducibility, rather than just accepting its stated conclusions.', 
              scenario: 'Intelligence analysts meticulously evaluating evidence from various, often conflicting, sources, assessing the reliability of each source and the credibility of each piece of information before synthesizing a conclusion.', 
              recallPrompt: 'What are at least three key factors to consider when conducting an advanced evaluation of evidence supporting a claim?' 
            }, 
            epic: {
              explainPrompt: "Describe the key criteria for 'Advanced Evidence Evaluation.' How does this differ from simply accepting information from a seemingly authoritative source?",
              probePrompt: "What is the 'hierarchy of evidence' concept often used in fields like medicine? Why are some types of evidence generally considered stronger than others?",
              implementPrompt: "Find a news article or online post making a significant claim supported by some form of evidence (e.g., a statistic, a reference to a study, an expert quote). Apply advanced evidence evaluation: 1. Assess source credibility. 2. Analyze the evidence itself (Is it specific? How was it obtained?). 3. Consider potential biases. 4. Is the evidence sufficient for the claim being made?",
              connectPrompt: "How does 'Confidence Calibration' (Sovereign Core - Skeptical Empiricism) depend heavily on the ability to perform 'Advanced Evidence Evaluation' to accurately gauge the strength of support for one's beliefs?"
            }
          },
          { 
            id: 'think-d3-n3', 
            title: 'Argument Deconstruction & Fallacy Analysis', 
            nodeType: 'strategy', 
            shortDefinition: 'Systematically breaking down arguments into their core components (premises, conclusions, assumptions) and analyzing them for logical fallacies and structural weaknesses.', 
            learningObjective: 'Accurately deconstruct complex arguments, identify any logical fallacies present, and evaluate the overall logical soundness of the reasoning.', 
            keyTerms: ['argument analysis', 'claim (revisited)', 'assumption (revisited)', 'evidence link (revisited)', 'logical structure (revisited)', 'logical fallacies (revisited)', 'validity and soundness (revisited)'], 
            download: { 
              clarification: 'This involves mapping the structure of an argument, identifying its explicit and implicit premises, and scrutinizing the inferential links between premises and conclusion for common errors in reasoning (fallacies).', 
              example: 'Analyzing a political speech by identifying its main claims, the evidence offered, any unstated assumptions, and checking for fallacies like ad hominem attacks, straw man arguments, or appeals to emotion.', 
              scenario: 'Fact-checkers and debate adjudicators routinely deconstruct arguments to assess their logical validity and identify any manipulative or fallacious reasoning.', 
              recallPrompt: 'Describe the general process of argument deconstruction. What is a logical fallacy?' 
            }, 
            epic: {
              explainPrompt: "Explain the process of 'argument deconstruction.' What are you looking for when you deconstruct an argument? How does identifying fallacies contribute to this analysis?",
              probePrompt: "Why are fallacious arguments often persuasive despite their logical flaws? What psychological factors make us susceptible to them?",
              implementPrompt: "Find an example of an argument in an online discussion, advertisement, or opinion piece. Attempt to deconstruct it: 1. What is the main conclusion/claim? 2. What are the stated premises/reasons? 3. Can you identify any specific logical fallacies being used? Explain the fallacy.",
              connectPrompt: "How do 'Formal Logic Systems' (Logical Reasoning domain) provide the tools for rigorously analyzing the *structure* of an argument during deconstruction, separate from its content?"
            }
          },
          { 
            id: 'think-d3-n4', 
            title: 'Critical Assumption Identification & Evaluation', 
            nodeType: 'strategy', 
            shortDefinition: 'The skill of uncovering and critically evaluating the hidden or unstated beliefs and presuppositions that underlie an argument, claim, or conceptual framework.', 
            learningObjective: 'Develop proficiency in identifying crucial unstated assumptions in reasoning and assessing their validity and impact on the overall argument.', 
            keyTerms: ['hidden assumptions', 'unstated premises', 'foundational beliefs (revisited)', 'critical questioning', 'implicit bias', 'presupposition'], 
            download: { 
              clarification: 'Many arguments rely on assumptions that are not explicitly stated. Identifying these is crucial because if an underlying assumption is false or questionable, the entire argument built upon it may be unsound, even if the stated logic is valid.', 
              example: 'An argument for a particular economic policy might implicitly assume that "all individuals are perfectly rational economic actors." Identifying and questioning this assumption is key to a critical evaluation of the policy.', 
              scenario: 'In a negotiation, successfully identifying the other party\'s unstated assumptions about your priorities or constraints can provide a significant strategic advantage.', 
              recallPrompt: 'Why is identifying and evaluating unstated assumptions a critical part of analyzing any argument or belief system?' 
            }, 
            epic: {
              explainPrompt: "Describe the importance of identifying 'hidden assumptions' in an argument. How can unstated assumptions, if left unexamined, lead to flawed conclusions even with apparently logical steps?",
              probePrompt: "What questioning techniques can be used to surface hidden assumptions in someone else's argument, or even in one's own thinking?",
              implementPrompt: "Consider a common societal belief or a strong personal opinion you hold. Try to identify at least two unstated assumptions that this belief/opinion rests upon. Are these assumptions always true? Are they universally accepted? How does questioning them affect your confidence in the original belief/opinion?",
              connectPrompt: "How does 'Axiomatic Frame' (AXIOMOS) relate to critical assumption identification? Are axioms essentially foundational, often unstated, assumptions of a system?"
            }
          },
          { 
            id: 'think-d3-n5', 
            title: 'Advanced Source Analysis & Credibility Assessment', 
            nodeType: 'strategy', 
            shortDefinition: 'Rigorous evaluation of information sources, considering expertise, bias, methodology, funding, reputation, and corroboration with other independent sources.', 
            learningObjective: 'Perform comprehensive credibility assessments of diverse information sources (e.g., academic papers, news reports, expert opinions, online content), identifying potential biases and limitations.', 
            keyTerms: ['source credibility (revisited)', 'bias detection (revisited)', 'expertise assessment', 'information literacy', 'fact-checking (revisited)', 'triangulation', 'primary vs. secondary sources'], 
            download: { 
              clarification: 'This involves a deeper dive than basic source checking, looking into the author\'s credentials and potential conflicts of interest, the publisher\'s reputation, the methodology used (if applicable), corroboration with other sources, and the overall quality of reasoning and evidence presented.', 
              example: 'Distinguishing between a peer-reviewed scientific journal article, a news report summarizing that article, a blog post commenting on the news report, and an anonymous social media post about the topic, assigning different levels of credibility to each.', 
              scenario: 'Students conducting academic research must critically evaluate sources for scholarly rigor, objectivity, and relevance to their research question. Intelligence analysts must assess the reliability of human sources and technical intelligence.', 
              recallPrompt: 'What are at least three criteria beyond simple authoritativeness used in advanced source analysis to assess credibility?' 
            }, 
            epic: {
              explainPrompt: "Explain the key components of 'Advanced Source Analysis.' Why is it insufficient to simply check if a source 'sounds' authoritative or aligns with one's own views?",
              probePrompt: "How can one assess potential bias in a source, even when the source presents itself as objective? What indicators might suggest a hidden agenda or conflict of interest?",
              implementPrompt: "Find a news article or online resource about a current controversial topic. Conduct an advanced source analysis: 1. Who is the author/organization? What are their credentials/potential biases? 2. What kind of evidence is presented? Is it primary or secondary? 3. Is the information corroborated by other independent, reputable sources? 4. What is your overall assessment of its credibility?",
              connectPrompt: "How does 'Epistemic Hygiene' (AXIOMOS) provide a broader framework for practices that include advanced source analysis as a key component of maintaining clean information intake?"
            }
          },
        ], 'thinking', 'think-d3'),
      },
       {
        id: 'think-d4',
        title: 'Metacognition & Cognitive Self-Regulation',
        learningGoal: 'Develop profound self-awareness and strategic control over one\'s own thinking processes, enabling continuous cognitive improvement and adaptation.',
        chronicleTheme: 'Engaging in self-reflection challenges, cognitive strategy selection tasks, and real-time thought process optimization within simulated high-stakes scenarios.',
        domainDungeonType: 'metacognitive_mirror_chamber',
        characterAffinities: ['mirror_tender', 'sovereign_core_companion', 'neuros'],
        specterAffinities: ['recursion-specter', 'control-specter', 'identity-specter'], // Performance maps to control/identity.
        nodes: addStatusToNodes([
          { 
            id: 'think-d4-n1', 
            title: 'Real-Time Cognitive Monitoring', 
            nodeType: 'strategy', 
            shortDefinition: 'Actively observing, tracking, and assessing one\'s own thought processes, attention, and cognitive states as they occur.', 
            learningObjective: 'Develop and practice the ability to monitor one\'s own thinking, focus, and emotional state in real-time during cognitive tasks, identifying deviations or inefficiencies.', 
            keyTerms: ['metacognitive awareness', 'self-observation', 'thought tracking', 'process monitoring', 'attentional focus', 'internal state awareness'], 
            download: { 
              clarification: 'This is about being aware of *how* you are thinking and feeling while you are thinking, not just what you are thinking about. It involves noticing when your attention wanders, when you get stuck in a thought loop, or when an emotion is heavily influencing your reasoning.', 
              example: 'While reading a difficult text, noticing that your attention has drifted and you\'re no longer comprehending, then consciously bringing your focus back. Or, noticing you are jumping to conclusions and pausing to check assumptions.', 
              scenario: 'High-performance professionals like surgeons or pilots continuously monitor their situational awareness, focus, and decision-making processes, especially under pressure, to catch errors early.', 
              recallPrompt: 'Define real-time cognitive monitoring. What are you observing when you engage in this practice?' 
            }, 
            epic: {
              explainPrompt: "Explain 'real-time cognitive monitoring.' Why is this skill foundational for metacognitive self-regulation?",
              probePrompt: "What are common challenges in developing consistent real-time cognitive monitoring? Why is it easy to get 'lost in thought' rather than observing thought?",
              implementPrompt: "For the next 30 minutes while working on a task (studying, writing, problem-solving), set a timer to go off every 5 minutes. When it goes off, briefly pause and ask: 'What was I just thinking? Was I focused? What was my internal state?' Jot down a one-sentence observation. Reflect on any patterns at the end.",
              connectPrompt: "How does the 'Mirror Protocol' (Sovereign Core) provide a framework for achieving the 'observer perspective' necessary for real-time cognitive monitoring?"
            }
          },
          { 
            id: 'think-d4-n2', 
            title: 'Strategic Cognitive Control & Regulation', 
            nodeType: 'strategy', 
            shortDefinition: 'Intentionally directing, guiding, and regulating one\'s thought processes, attention, and cognitive strategies to align with specific goals and task demands.', 
            learningObjective: 'Improve the ability to consciously control and direct cognitive resources, select appropriate thinking strategies, and manage internal states to optimize cognitive performance.', 
            keyTerms: ['executive functions (revisited)', 'attention regulation', 'thought direction', 'goal-directed thinking', 'cognitive inhibition', 'working memory management'], 
            download: { 
              clarification: 'Cognitive control goes beyond monitoring; it\'s about actively steering your thinking. This includes inhibiting distractions, maintaining focus on goals, switching strategies when needed, and managing working memory effectively.', 
              example: 'Deliberately shifting focus back to a primary task after an interruption, or consciously choosing to use a specific problem-solving heuristic because it\'s well-suited to the current challenge.', 
              scenario: 'Students using effective study strategies like planning their study sessions, managing distractions, self-testing, and allocating appropriate time to different topics are exercising cognitive control.', 
              recallPrompt: 'What is strategic cognitive control, and how does it build upon cognitive monitoring?' 
            }, 
            epic: {
              explainPrompt: "Describe 'strategic cognitive control.' Provide examples of how one might actively regulate their thought processes to achieve a specific goal.",
              probePrompt: "What is the role of 'cognitive inhibition' (the ability to suppress irrelevant thoughts or responses) in effective cognitive control? Why is this often difficult?",
              implementPrompt: "Identify one cognitive task you find challenging or where you often get distracted (e.g., writing, complex problem-solving, studying a dense text). Before your next session, explicitly define: 1) Your specific goal for the session. 2) One potential internal distraction (e.g., worry, boredom). 3) One strategy you will use to control your attention and regulate your thinking if that distraction arises.",
              connectPrompt: "How does 'Sovereign Energy Management' (Sovereign Core) provide the necessary resources for sustained cognitive control, given that executive functions are often effortful?"
            }
          },
          { 
            id: 'think-d4-n3', 
            title: 'Metacognitive Strategy Selection & Adaptation', 
            nodeType: 'strategy', 
            shortDefinition: 'The ability to choose the most appropriate cognitive tools, thinking strategies, or problem-solving approaches for a given task or context, and to adapt these strategies based on performance and feedback.', 
            learningObjective: 'Learn to select and adapt the most effective cognitive strategies for different types of problems and learning situations, moving beyond default or habitual approaches.', 
            keyTerms: ['metacognitive strategies', 'tool selection (cognitive)', 'task analysis (metacognitive)', 'approach optimization', 'adaptive expertise', 'learning agility'], 
            download: { 
              clarification: 'This is about knowing *which* thinking skill or mental model to apply, and *when*. It involves assessing the demands of a task and selecting the cognitive approach best suited to meet those demands, rather than using a one-size-fits-all strategy.', 
              example: 'When faced with a novel problem, deciding whether to first use divergent brainstorming to generate many ideas, or deductive reasoning to break it down from first principles, or analogical thinking to find similar solved problems.', 
              scenario: 'Experienced chess players adapt their strategic approach (e.g., aggressive, defensive, positional) based on the board state, their opponent\'s style, and the stage of the game. They don\'t just play one way.', 
              recallPrompt: 'Explain metacognitive strategy selection. Why is it important to have a repertoire of strategies and know when to use them?' 
            }, 
            epic: {
              explainPrompt: "Describe 'metacognitive strategy selection.' How does one develop the wisdom to choose the right cognitive tool for a given task? What factors influence this choice?",
              probePrompt: "How can over-learning or developing deep expertise in one particular thinking strategy sometimes hinder the ability to select other, more appropriate strategies for different types_of problems (i.e., the 'law of the instrument' - if all you have is a hammer, everything looks like a nail)?",
              implementPrompt: "Consider two very different types of problems you might encounter: 1) A well-defined logical puzzle. 2) An ill-defined creative challenge. For each, identify at least two specific NeuroOS nodes (from any module) that represent cognitive strategies you would prioritize applying, and explain your reasoning.",
              connectPrompt: "How does 'Meta-Reasoning' (AXIOMOS), particularly 'Process Evaluation,' directly support metacognitive strategy selection by helping to assess the effectiveness of current and alternative approaches?"
            }
          },
          { 
            id: 'think-d4-n4', 
            title: 'Cognitive Self-Correction & Error Analysis', 
            nodeType: 'strategy', 
            shortDefinition: 'The process of identifying errors or inefficiencies in one\'s own thinking or problem-solving processes and making targeted adjustments to improve future performance.', 
            learningObjective: 'Develop the capacity for systematic cognitive self-correction by analyzing errors in reasoning or judgment, identifying their root causes, and implementing corrective strategies.', 
            keyTerms: ['error detection (cognitive)', 'belief updating (revisited)', 'strategy adjustment', 'feedback integration (self-generated)', 'reflective practice', 'root cause analysis (cognitive)'], 
            download: { 
              clarification: 'This involves not just noticing a mistake in a conclusion, but understanding the flaw in the *thinking process* that led to it, and then revising that process. It\'s about learning how to learn and think better from one\'s own cognitive missteps.', 
              example: 'After consistently underestimating project completion times (planning fallacy), one might analyze their estimation process, identify the bias, and implement a new strategy like "add a 30% buffer" or "break tasks into smaller, more predictable units."', 
              scenario: 'Scientists rigorously analyze failed experiments not just to see what went wrong with the materials, but to identify potential flaws in their hypotheses, experimental design (reasoning), or interpretation of previous data.', 
              recallPrompt: 'Describe the process of cognitive self-correction. How does it go beyond simply fixing a factual mistake?' 
            }, 
            epic: {
              explainPrompt: "Explain 'cognitive self-correction.' What are the key steps involved in not just identifying an error, but learning from it to improve future thinking?",
              probePrompt: "What emotional factors (e.g., ego, defensiveness, fear of being wrong) can impede effective cognitive self-correction? How can 'Error Tolerance' (Sovereign Core) help overcome these?",
              implementPrompt: "Recall a recent instance where you realized you had made a mistake in your reasoning, judgment, or problem-solving approach. Perform a brief 'cognitive error analysis': 1. What was the error? 2. What thinking process or assumption led to it? 3. What specific change to your thinking process could prevent similar errors in the future?",
              connectPrompt: "How does 'Constitutional Amendments' (Self-Authorship in Sovereign Core), when applied to one's 'Personal Constitution' of beliefs and principles, represent a high-level form of cognitive self-correction for one's foundational mental operating system?"
            }
          },
          { 
            id: 'think-d4-n5', 
            title: 'Adaptive Cognitive Flexibility', 
            nodeType: 'skill', 
            shortDefinition: 'The advanced ability to fluidly and appropriately switch between different modes of thought, perspectives, and cognitive strategies in response to changing contexts, new information, or task demands.', 
            learningObjective: 'Enhance cognitive flexibility to dynamically adapt thinking approaches, overcome mental ruts, and respond effectively to novel or complex situations.', 
            keyTerms: ['mental flexibility (advanced)', 'perspective shifting (dynamic)', 'task switching (efficient)', 'adaptive thinking', 'cognitive agility', 'unfreezing (cognitive)'], 
            download: { 
              clarification: 'This is more than just knowing different strategies; it\'s the dynamic capacity to shift between them as needed, to "unfreeze" from one mode of thinking and adopt another that is better suited to the current reality. It involves high situational awareness and metacognitive control.', 
              example: 'Shifting seamlessly between analytical, data-driven thinking when evaluating financial reports, to empathic, user-centered thinking when designing a product feature, to creative, divergent thinking when brainstorming new solutions.', 
              scenario: 'Leaders in rapidly changing industries must demonstrate high adaptive cognitive flexibility, constantly re-evaluating assumptions, shifting strategies in response to market changes, and integrating diverse information streams.', 
              recallPrompt: 'What distinguishes "adaptive cognitive flexibility" from simply knowing multiple thinking styles?' 
            }, 
            epic: {
              explainPrompt: "Describe 'adaptive cognitive flexibility.' Why is this skill particularly important in complex, rapidly changing environments?",
              probePrompt: "What are the signs of low cognitive flexibility (e.g., getting stuck in one approach, difficulty adapting to new information, resistance to changing one's mind)? How can these be addressed?",
              implementPrompt: "Identify a situation where you tend to rely on a single, habitual way of thinking or problem-solving. This week, if that situation arises, consciously try to approach it from at least two *different* cognitive perspectives or using two different strategies from your NeuroOS modules. Note the difference in your process and potential outcomes.",
              connectPrompt: "How does 'Mental Model Shifting' (Adaptive Resilience or this module) provide the building blocks for adaptive cognitive flexibility? Is flexibility the dynamic application of diverse mental models?"
            }
          },
          { 
            id: 'think-d4-n6', 
            title: 'Meta-Level Understanding Evaluation', 
            nodeType: 'strategy', 
            shortDefinition: 'Accurately and critically assessing the depth, limits, coherence, and applicability of one\'s own knowledge and understanding within and across domains.', 
            learningObjective: 'Improve the accuracy and nuance of self-assessment regarding one\'s knowledge structures, including identifying areas of true mastery, superficial understanding, and critical knowledge gaps.', 
            keyTerms: ['epistemic self-assessment (advanced)', 'knowledge calibration (revisited)', 'limits of knowledge (revisited)', 'comprehension monitoring (deep)', 'intellectual humility (revisited)', 'meta-understanding'], 
            download: { 
              clarification: 'This involves a sophisticated ability to "know what you know" and, more importantly, "know what you *don\'t* know, and to what degree." It includes assessing the coherence of one\'s knowledge, the reliability of its sources, and its appropriate range of application.', 
              example: 'Using self-testing, concept mapping, or the Feynman technique (explaining a concept in simple terms) to rigorously gauge one\'s true depth of comprehension before an exam or important application, rather than relying on a vague feeling of familiarity.', 
              scenario: 'True experts are often characterized by their acute awareness of the boundaries of their expertise and the remaining open questions in their field, contrasting with the Dunning-Kruger effect often seen in novices.', 
              recallPrompt: 'Why is accurately evaluating your own understanding, including its limits, a crucial metacognitive skill?' 
            }, 
            epic: {
              explainPrompt: "Explain what 'meta-level understanding evaluation' entails. How does it go beyond simple 'comprehension monitoring'?",
              probePrompt: "What are the common biases or psychological tendencies that make accurate self-assessment of understanding difficult (e.g., Dunning-Kruger effect, illusion of explanatory depth)?",
              implementPrompt: "Choose a complex concept you believe you understand well from any NeuroOS module. Attempt to explain it to an imaginary 10-year-old (Feynman technique). Where do you struggle to simplify? What questions would they likely ask that you can't easily answer? This exercise helps reveal the true depth and limits of your understanding.",
              connectPrompt: "How does 'Confidence Calibration' (Sovereign Core) serve as an external measure that can help validate or correct one's internal 'Meta-Level Understanding Evaluation'?"
            }
          },
        ], 'thinking', 'think-d4'),
      },
    ],
};
