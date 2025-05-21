
import type { Module, ModuleType } from '@/types/neuro';
import { addStatusToNodes } from './_common'; // Using existing addStatusToNodes

export const chronologyModuleData: Omit<Module, 'status'> = {
    id: 'chronology',
    type: 'pillar' as ModuleType,
    title: 'Chronological Cognition: The Architecture of Time',
    description: 'Develop the ability to reason across time—understanding sequences, cause/effect chains, historical context, and future projection.',
    moduleLearningGoal: 'To master the cognitive frameworks for understanding temporal relationships, enabling effective analysis of past events, navigation of present complexities, and strategic planning for future outcomes.',
    tags: ['time', 'sequence', 'causality', 'history', 'forecasting', 'temporal reasoning'],
    alignmentBias: 'neutral',
    defaultCompanion: 'chronicler',
    associatedSpecters: ['certainty-specter', 'control-specter', 'recursion-specter'], // Delay maps to control/certainty, recursion is a specter.
    recommendedChronicleDungeon: 'The Archive of Time Loops',
    moduleCategory: ['Temporal Reasoning', 'Historical Thinking', 'Strategic Foresight'],
    reviewProfile: {
      decayModel: 'performance_adaptive',
      reviewClusters: [
        ['chrono-d1-n1', 'chrono-d1-n2', 'chrono-d1-n3'],
        ['chrono-d2-n1', 'chrono-d2-n2', 'chrono-d2-n4'],
        ['chrono-d3-n1', 'chrono-d3-n4', 'chrono-d3-n6'],
        ['chrono-d4-n1', 'chrono-d4-n2', 'chrono-d4-n5'],
      ],
      interleaveRatio: 0.25
    },
    domains: [
      {
        id: 'chrono-d1',
        title: 'Temporal Perception & Framing',
        learningGoal: 'Develop a nuanced understanding of how subjective, cultural, and cognitive factors shape the human experience and interpretation of time.',
        chronicleTheme: 'Navigating environments with distorted time flows and challenges that exploit subjective temporal biases.',
        domainDungeonType: 'perception_trial_chamber',
        characterAffinities: ['mirror_tender', 'chronicler', 'ekitty'],
        specterAffinities: ['control-specter', 'certainty-specter'], // Delay and certainty are relevant.
        nodes: addStatusToNodes([
          { 
            id: 'chrono-d1-n1', 
            title: 'Subjective Time Perception', 
            nodeType: 'concept', 
            shortDefinition: 'The personal, often variable, experience of time passing, influenced by factors like emotion, attention, and engagement.', 
            learningObjective: 'Analyze and articulate at least three distinct factors that influence one\'s subjective perception of time, providing personal examples for each.', 
            keyTerms: ['time perception', 'flow state', 'emotional time', 'attentional effects', 'chronopsychology'], 
            download: { 
              clarification: 'Subjective time refers to how time *feels* as it passes, which can differ significantly from objective clock time. It\'s shaped by our internal state (emotions, focus) and the nature of our activities (engagement, novelty).', 
              example: 'Time "flying" when deeply engrossed in an enjoyable activity (flow state), versus time "dragging" during a boring lecture or when anxiously awaiting an event.', 
              scenario: 'A project manager strategically breaks down long, tedious tasks into smaller, more engaging chunks to alter the team\'s subjective experience of time and maintain motivation.', 
              recallPrompt: 'Explain the concept of subjective time and list two factors that strongly influence it.' 
            }, 
            epic: {
              explainPrompt: "Describe subjective time perception. How does it differ from objective clock time? Provide an example from your own life where your sense of time was significantly distorted.",
              probePrompt: "What are the evolutionary advantages or disadvantages of having a flexible, subjective perception of time rather than a purely objective internal clock?",
              implementPrompt: "For one day, consciously track your subjective time perception. Note at least three instances where time felt faster or slower than usual. For each, identify: 1) The activity. 2) Your emotional state. 3) Your level of engagement. What patterns do you notice?",
              connectPrompt: "How might 'Sovereign Energy Management' (Sovereign Core) be influenced by an understanding of one's own subjective time perception patterns?"
            }
          },
          { 
            id: 'chrono-d1-n2', 
            title: 'Cultural Orientations to Time', 
            nodeType: 'concept', 
            shortDefinition: 'Socially constructed norms, values, and expectations surrounding time management, punctuality, and future orientation (e.g., monochronic vs. polychronic).', 
            learningObjective: 'Compare and contrast monochronic and polychronic time orientations, identifying potential sources of cross-cultural misunderstanding.', 
            keyTerms: ['monochronic time', 'polychronic time', 'cultural norms', 'punctuality', 'time orientation', 'cross-cultural communication'], 
            download: { 
              clarification: 'Cultures differ significantly in how they perceive and value time. Monochronic cultures tend to view time as linear and segmented, emphasizing schedules and one task at a time. Polychronic cultures see time as more fluid, prioritizing relationships and multiple simultaneous activities.', 
              example: 'Germany is often cited as a monochronic culture (punctuality is key, schedules are firm). Many Latin American cultures are more polychronic (flexible appointments, relationship-building takes precedence over strict schedules).', 
              scenario: 'An international business negotiation where a monochronic team becomes frustrated by a polychronic team\'s perceived lack of punctuality and focus, while the polychronic team feels the other is impersonal and overly rigid.', 
              recallPrompt: 'Describe the key difference between monochronic and polychronic time cultures.' 
            }, 
            epic: {
              explainPrompt: "Explain the concepts of monochronic and polychronic time orientations. Provide an example of how these differing orientations might lead to misunderstandings in a cross-cultural interaction.",
              probePrompt: "Are these cultural orientations absolute, or do individuals within a culture vary? Can a single culture exhibit both monochronic and polychronic tendencies in different contexts (e.g., work vs. social life)?",
              implementPrompt: "Imagine you are a project manager leading a multicultural team with members from both highly monochronic and highly polychronic backgrounds. Outline three specific strategies you would implement to manage time expectations and ensure project deadlines are met while respecting different cultural approaches to time.",
              connectPrompt: "How might a society's 'Cultural Time' orientation influence its approach to 'Long-Term Thinking' (another node in this domain) or its 'Strategic Planning' processes (Chronology/Synthetic Systems)?"
            }
          },
          { 
            id: 'chrono-d1-n3', 
            title: 'Individual Time Horizons & Future Orientation', 
            nodeType: 'concept', 
            shortDefinition: 'The typical span of time an individual considers when making decisions and planning, ranging from immediate to very long-term.', 
            learningObjective: 'Evaluate the impact of different personal time horizons (short-term, medium-term, long-term) on decision-making quality and life outcomes.', 
            keyTerms: ['short-term thinking', 'long-term thinking', 'future orientation', 'decision scope', 'delayed gratification', 'strategic foresight'], 
            download: { 
              clarification: 'Time horizon refers to how far into the future individuals typically look when planning or considering the consequences of their actions. This varies greatly and significantly impacts choices related to savings, health, career, and societal issues.', 
              example: 'Choosing immediate gratification (e.g., spending on luxuries) reflects a shorter time horizon, while consistently investing for retirement or pursuing long-term education reflects a longer time horizon.', 
              scenario: 'Public policy decisions often involve balancing short-term economic or political impacts with long-term environmental or social consequences, a conflict of time horizons.', 
              recallPrompt: 'Define "time horizon" in the context of decision-making and explain its potential significance for personal planning.' 
            }, 
            epic: {
              explainPrompt: "What is an individual's 'time horizon' or 'future orientation'? How can a predominantly short-term or long-term orientation impact different areas of life (e.g., finances, health, relationships)?",
              probePrompt: "What factors (e.g., age, socioeconomic status, cultural background, personal experiences of uncertainty) might influence an individual's typical time horizon? Can it be consciously changed?",
              implementPrompt: "Identify one important long-term goal you have (e.g., 5+ years away). Break it down into: 1) Actions needed this year. 2) Actions needed this month. 3) One action you can take this week. How does this exercise help bridge the gap between a long time horizon and present action?",
              connectPrompt: "How does the 'Present Bias' concept (another node) often conflict with maintaining a 'Long-Term Thinking' horizon? What strategies from 'Sovereign Energy Management' (Sovereign Core) could support long-term goal pursuit?"
            }
          },
          { 
            id: 'chrono-d1-n4', 
            title: 'Temporal Framing Effects', 
            nodeType: 'strategy', 
            shortDefinition: 'The cognitive bias where the description or framing of time intervals influences choices and perceptions, often independent of objective duration.', 
            learningObjective: 'Identify and analyze at least two examples of how temporal framing (e.g., framing benefits sooner vs. later, aggregating vs. segregating time costs) can influence choices.', 
            keyTerms: ['framing effect', 'cognitive bias', 'temporal perspective', 'loss aversion (temporal)', 'time discounting', 'choice architecture'], 
            download: { 
              clarification: 'Temporal framing refers to how the presentation of time-related information sways decisions. For instance, people might perceive a daily cost differently than an annual one, even if mathematically equivalent, or prefer options framed with immediate benefits over delayed ones.', 
              example: 'Framing a subscription cost as "$1 per day" often feels less significant than "$365 per year." Presenting a retirement savings plan by showing the small daily sacrifice versus the large future lump sum are different temporal frames.', 
              scenario: 'Marketing campaigns frequently use temporal framing, such as "limited time offers" (urgency frame) or emphasizing immediate benefits of a product over long-term ones, to influence purchasing decisions.', 
              recallPrompt: 'Explain temporal framing with an example of how it can be used to influence a decision.' 
            }, 
            epic: {
              explainPrompt: "What is 'temporal framing'? Provide an example of how the same time-related information can be framed differently to produce different psychological effects or decisions.",
              probePrompt: "How do cognitive biases like 'Present Bias' or 'Loss Aversion' interact with temporal framing effects? Can temporal framing be used to counteract these biases?",
              implementPrompt: "Find an advertisement or public service announcement that uses temporal framing. Analyze: 1) What is being framed (e.g., cost, benefit, risk)? 2) How is time being presented (e.g., immediate vs. delayed, short vs. long interval)? 3) What is the likely intended effect of this framing on the audience's perception or decision?",
              connectPrompt: "How might 'Narrative Construction' (Self-Authorship or Communication modules) use temporal framing to shape the perceived significance or urgency of events within a story?"
            }
          },
          { 
            id: 'chrono-d1-n5', 
            title: 'Present Bias (Hyperbolic Discounting)', 
            nodeType: 'concept', 
            shortDefinition: 'The common human tendency to overweight immediate rewards and undervalue larger, delayed rewards, with the discount rate being steeper for shorter delays.', 
            learningObjective: 'Recognize manifestations of present bias in personal decision-making and identify at least two strategies to mitigate its negative impact.', 
            keyTerms: ['hyperbolic discounting', 'delay discounting', 'impulsivity', 'self-control', 'time inconsistency', 'precommitment'], 
            download: { 
              clarification: 'Present bias, or hyperbolic discounting, explains why we often choose smaller, sooner rewards over larger, later ones (e.g., choosing to watch TV now instead of studying for a future exam that yields greater long-term benefits). The "hyperbolic" part means our preference for immediacy is disproportionately strong for near-term choices.', 
              example: 'Preferring $50 today over $100 in a year, but perhaps NOT preferring $50 in 5 years over $100 in 6 years (even though the absolute delay is the same). The immediacy of "today" has a powerful pull.', 
              scenario: 'Public health challenges like smoking or unhealthy eating are often exacerbated by present bias, where the immediate pleasure outweighs the distant health consequences.', 
              recallPrompt: 'What is present bias (hyperbolic discounting), and how does it make long-term goal achievement challenging?' 
            }, 
            epic: {
              explainPrompt: "Describe 'present bias' or 'hyperbolic discounting.' Why does this pattern of time preference often lead to choices that are not in our long-term best interest?",
              probePrompt: "What evolutionary or psychological reasons might underlie present bias? Were there ancestral environments where prioritizing immediate rewards was more adaptive?",
              implementPrompt: "Identify one area in your life where present bias frequently affects your choices (e.g., procrastination, diet, savings). Describe a specific precommitment strategy or a way to make the long-term benefits more salient NOW to counteract this bias. For example, setting up automatic savings transfers, or visualizing the future benefits of studying.",
              connectPrompt: "How does 'Inner Legislator' (Sovereign Core) and creating 'Personal Policies' help combat present bias by making long-term choices more automatic or rule-based?"
            }
          },
          { 
            id: 'chrono-d1-n6', 
            title: 'Flow State & Time Distortion', 
            nodeType: 'concept', 
            shortDefinition: 'An optimal psychological state of deep immersion and energized focus in an activity, often characterized by a distorted (usually accelerated) perception of time.', 
            learningObjective: 'Describe the core characteristics of a flow state, its impact on time perception, and conditions conducive to achieving it.', 
            keyTerms: ['flow state', 'optimal experience', 'Csikszentmihalyi', 'immersion', 'time distortion', 'concentration', 'autotelic activity'], 
            download: { 
              clarification: 'Flow, as described by Mihaly Csikszentmihalyi, is a feeling of being fully absorbed in an activity, with a balance between challenge and skill, clear goals, immediate feedback, and a merging of action and awareness. Time often seems to pass very quickly or become irrelevant.', 
              example: 'An artist losing track of time while painting, a programmer deeply absorbed in coding, or a musician lost in a performance.', 
              scenario: 'Designing work environments or educational activities to facilitate flow states can lead to increased productivity, learning, and enjoyment.', 
              recallPrompt: 'Explain what a "flow state" is and how it typically affects one\'s perception of time passing.' 
            }, 
            epic: {
              explainPrompt: "Describe the key characteristics of a 'flow state.' What conditions are generally necessary to enter flow? How does time perception typically change during flow?",
              probePrompt: "Can flow states be cultivated deliberately? What personal or environmental factors might prevent or facilitate entry into flow?",
              implementPrompt: "Reflect on an activity where you have personally experienced a flow state. Describe: 1) The activity. 2) What made it conducive to flow (challenge/skill balance, clear goals, feedback)? 3) How your perception of time changed. 4) Your emotional state during and after.",
              connectPrompt: "How does 'Sovereign Energy Management' (Sovereign Core) relate to creating conditions for flow, particularly in terms of 'Attention Management' and 'Priority Alignment'?"
            }
          },
        ], 'chronology', 'chrono-d1'),
      },
      {
        id: 'chrono-d2',
        title: 'Sequential & Causal Reasoning',
        learningGoal: 'Master the cognitive tools for understanding and reasoning about sequences, cause-and-effect relationships, and conditional events over time.',
        chronicleTheme: 'Solving intricate causal chain puzzles and reconstructing fragmented timelines to avert simulated disasters or unlock ancient mechanisms.',
        domainDungeonType: 'sequence_logic_maze',
        characterAffinities: ['neuros', 'veritas', 'chronicler'],
        specterAffinities: ['recursion-specter', 'certainty-specter', 'contradiction-specter'],
        nodes: addStatusToNodes([
          { 
            id: 'chrono-d2-n1', 
            title: 'Causal Chains & Networks', 
            nodeType: 'concept', 
            shortDefinition: 'Identifying and mapping the sequence of events where one action or state leads to another, forming simple chains or complex networks of influence.', 
            learningObjective: 'Analyze and diagram direct and indirect cause-and-effect relationships in multi-step sequences or systems.', 
            keyTerms: ['causality', 'cause and effect', 'sequence analysis', 'dependency', 'root cause analysis', 'feedback loops (revisited)'], 
            download: { 
              clarification: 'Causal chains trace how one event triggers another in a sequence. More complex situations involve networks where multiple causes contribute to effects, and effects can become causes themselves (feedback loops).', 
              example: 'Simple chain: Spark (cause) → Fire (effect/cause) → Smoke (effect). Network: Poverty (cause) → Poor Nutrition (effect/cause) ↔ Reduced Immunity (effect/cause) ↔ Increased Illness (effect).', 
              scenario: 'Troubleshooting a complex technical issue by tracing the sequence of component failures to identify the root cause. Environmental scientists mapping causal networks of climate change factors.', 
              recallPrompt: 'Define causal chains. How do they differ from more complex causal networks?' 
            }, 
            epic: {
              explainPrompt: "Explain the concept of a 'causal chain.' How can diagramming causal relationships help in understanding complex problems or predicting future outcomes?",
              probePrompt: "What are common errors in identifying causal relationships (e.g., confusing correlation with causation, overlooking confounding variables, post hoc fallacy)? How can 'Skeptical Empiricism' help avoid these?",
              implementPrompt: "Choose a recent news event or a common problem (e.g., traffic congestion in your city). Attempt to map out a simple causal chain or network showing at least 3-4 interconnected causes and effects leading to the event/problem. Identify at least one potential feedback loop.",
              connectPrompt: "How does understanding 'Systems Dynamics' (from Synthetic Systems or Chronology itself) enhance the analysis of complex causal networks beyond simple linear chains?"
            }
          },
          { 
            id: 'chrono-d2-n2', 
            title: 'Necessary & Sufficient Conditions', 
            nodeType: 'principle', 
            shortDefinition: 'Understanding the logical difference between conditions that *must* be present for an event (necessary) and conditions that, if present, *guarantee* an event (sufficient).', 
            learningObjective: 'Accurately distinguish between necessary and sufficient conditions in analyzing prerequisites for events or outcomes.', 
            keyTerms: ['necessary condition', 'sufficient condition', 'correlation vs causation (revisited)', 'logical prerequisites', 'if-then statements'], 
            download: { 
              clarification: 'A necessary condition (A is necessary for B) means B cannot happen without A. A sufficient condition (A is sufficient for B) means if A happens, B is guaranteed. Confusing these is a common logical error.', 
              example: 'Oxygen is necessary for fire (no oxygen, no fire). Striking a match is often sufficient for fire (if oxygen and fuel are present). Being a mammal is necessary to be a dog, but not sufficient (cats are mammals). Being a poodle is sufficient to be a dog.', 
              scenario: 'Scientific experiments are designed to isolate necessary and sufficient causes for phenomena. Legal reasoning often involves determining if certain conditions were necessary or sufficient for a crime to occur.', 
              recallPrompt: 'Explain the difference between a necessary condition and a sufficient condition using an example for each.' 
            }, 
            epic: {
              explainPrompt: "Describe the distinction between necessary and sufficient conditions. Why is this distinction critical for clear causal reasoning and problem diagnosis?",
              probePrompt: "Can a condition be both necessary and sufficient? Provide an example. Can something be neither necessary nor sufficient but still a contributing factor?",
              implementPrompt: "Consider the outcome 'getting a college degree.' Identify one condition that is necessary but not sufficient, one condition that might be considered sufficient (though this is harder for complex outcomes, aim for 'highly likely'), and one condition that is neither but correlated.",
              connectPrompt: "How does understanding 'Necessary & Sufficient Conditions' help in deconstructing arguments (Thinking module) by identifying flawed causal claims or unstated assumptions about prerequisites?"
            }
          },
          { 
            id: 'chrono-d2-n3', 
            title: 'Timeline Cognition & Mental Timelines', 
            nodeType: 'concept', 
            shortDefinition: 'The cognitive ability to mentally organize events, experiences, and information along a linear temporal axis, establishing chronological order and duration.', 
            learningObjective: 'Accurately place sequences of events in chronological order, estimate relative durations, and understand temporal relationships (before, after, during).', 
            keyTerms: ['chronology', 'temporal order', 'sequence memory', 'mental timeline', 'historical sequencing', 'duration estimation'], 
            download: { 
              clarification: 'Timeline cognition is our internal representation of time and the ordering of events within it. It allows us to understand history, plan future sequences, and comprehend narratives.', 
              example: 'Recalling the sequence of historical events in a war, or mentally planning the steps to bake a cake in the correct order.', 
              scenario: 'Project management extensively uses timeline cognition, visualized in tools like Gantt charts, to plan and track tasks and dependencies over time.', 
              recallPrompt: 'What is timeline cognition, and why is it fundamental to understanding history and planning?' 
            }, 
            epic: {
              explainPrompt: "Explain 'timeline cognition.' How do we mentally construct these timelines? What cognitive processes are involved in sequencing events correctly?",
              probePrompt: "How can biases in memory (e.g., recency effect, primacy effect, telescoping effect) distort our mental timelines or our perception of when events occurred?",
              implementPrompt: "Choose a significant period from your own life (e.g., last year, your college years). Create a simple timeline with at least 5-7 key events in chronological order. For two of these events, estimate their duration. Reflect on how easy or difficult it was to accurately sequence and estimate.",
              connectPrompt: "How does 'Temporal Chunking' (another node in this domain) assist in managing complex mental timelines by grouping related events into larger phases?"
            }
          },
          { 
            id: 'chrono-d2-n4', 
            title: 'Conditional Sequencing & Branching Futures', 
            nodeType: 'concept', 
            shortDefinition: 'Understanding and reasoning about sequences where future events and pathways depend critically on prior outcomes or conditions being met (if-then logic over time).', 
            learningObjective: 'Reason about and map out branching possibilities, dependencies, and contingent pathways in future-oriented or hypothetical scenarios.', 
            keyTerms: ['conditional logic', 'if-then reasoning', 'branching paths', 'dependency analysis', 'scenario planning (revisited)', 'decision trees (revisited)'], 
            download: { 
              clarification: 'Conditional sequencing involves thinking about "what if" scenarios over time, where different choices or events lead to divergent future paths. This is crucial for planning, risk assessment, and strategic thinking.', 
              example: 'If I pass this exam (condition), then I can apply for the advanced course (consequence/next step), which might lead to a different career path (branching future).', 
              scenario: 'Computer programming relies heavily on conditional statements (if/else, switch) to create branching logic. Strategic game playing (e.g., chess) involves constantly evaluating conditional sequences based on potential moves.', 
              recallPrompt: 'Describe conditional sequencing using an if-then example that illustrates branching future possibilities.' 
            }, 
            epic: {
              explainPrompt: "Explain 'conditional sequencing.' How does it allow us to think about multiple potential futures or outcomes based on present choices or events?",
              probePrompt: "What are the challenges in accurately assessing the probabilities associated with different branches in a conditional sequence, especially when looking far into the future?",
              implementPrompt: "Consider a current personal goal. Identify one key decision point or uncertain event related to this goal. Map out at least two different 'branches' or future pathways that could result depending on the outcome of that decision/event. For each branch, list one subsequent action you would take.",
              connectPrompt: "How does 'Decision Trees' (Algorithmic Rationality or Thinking module) provide a formal tool for visualizing and analyzing conditional sequences and branching futures?"
            }
          },
          { 
            id: 'chrono-d2-n5', 
            title: 'Temporal Chunking & Periodization', 
            nodeType: 'strategy', 
            shortDefinition: 'The cognitive strategy of grouping sequences of events or periods of time into larger, meaningful units or phases to simplify complexity and aid understanding.', 
            learningObjective: 'Apply temporal chunking techniques to organize complex timelines or historical narratives into manageable, coherent periods or stages.', 
            keyTerms: ['chunking (temporal)', 'periodization', 'phase identification', 'timeline simplification', 'narrative structuring', 'historical periods'], 
            download: { 
              clarification: 'Temporal chunking simplifies complex timelines by identifying distinct stages, phases, or eras based on shared characteristics or significant turning points. This makes long or complex sequences easier to comprehend, remember, and analyze.', 
              example: 'Chunking a large project into "Phase 1: Research & Planning," "Phase 2: Development," and "Phase 3: Testing & Launch." Historians use periodization to divide history into eras like "The Renaissance," "The Industrial Revolution," etc.', 
              scenario: 'A student learning history uses periodization to organize vast amounts of information into coherent blocks, understanding the key features and transitions of each era.', 
              recallPrompt: 'Explain temporal chunking (or periodization) and its primary benefits for understanding long sequences of events.' 
            }, 
            epic: {
              explainPrompt: "Describe 'temporal chunking' or 'periodization.' How does this cognitive strategy help us manage and make sense of complex historical or developmental sequences?",
              probePrompt: "What are the potential dangers or limitations of periodization? Can it sometimes oversimplify history or impose artificial boundaries on continuous processes?",
              implementPrompt: "Think about your own life story or the history of a project you were involved in. Divide it into 3-5 distinct 'phases' or 'periods.' Give each phase a name and briefly describe its defining characteristics or key events. Why did you choose these particular boundaries?",
              connectPrompt: "How does 'Timeline Cognition' (another node) provide the raw material that 'Temporal Chunking' then organizes and structures into more meaningful units?"
            }
          },
          { 
            id: 'chrono-d2-n6', 
            title: 'Retrospective Analysis & Lessons Learned', 
            nodeType: 'strategy', 
            shortDefinition: 'Systematically analyzing past sequences of events and their outcomes to understand causal factors, extract valuable lessons, and improve future performance.', 
            learningObjective: 'Conduct structured retrospective analyses (e.g., after-action reviews) on past projects or events to identify key learnings and actionable improvements.', 
            keyTerms: ['post-mortem analysis', 'after-action review (AAR)', 'historical analysis (applied)', 'lessons learned', 'root cause analysis (revisited)', 'continuous improvement'], 
            download: { 
              clarification: 'Retrospective analysis involves looking back at completed projects, events, or periods to critically assess what happened, why it happened, what went well, what went poorly, and what can be learned to inform future actions. It is a key component of continuous improvement.', 
              example: 'A software team conducting a "sprint retrospective" to discuss what worked and what didn\'t in the previous development cycle, identifying process improvements for the next sprint.', 
              scenario: 'Accident investigators meticulously analyze the sequence of events leading up to an incident (e.g., a plane crash, industrial accident) to determine causal factors and prevent recurrence.', 
              recallPrompt: 'What is the primary purpose of retrospective analysis, and what kind of information does it aim to extract from past events?' 
            }, 
            epic: {
              explainPrompt: "Explain the value of conducting a 'retrospective analysis' or 'after-action review.' What are the key questions such a review typically seeks to answer?",
              probePrompt: "What psychological biases (e.g., hindsight bias, self-serving bias) can hinder an objective and productive retrospective analysis? How can these be mitigated?",
              implementPrompt: "Choose a recently completed personal project or a significant event you experienced. Conduct a brief 'after-action review': 1) What was supposed to happen? 2) What actually happened? 3) What went well and why? 4) What could have gone better and why? 5) What will you do differently next time?",
              connectPrompt: "How does 'Error Tolerance' (Sovereign Core - Skeptical Empiricism) create the necessary psychological safety for honest and effective retrospective analysis, especially when failures are involved?"
            }
          },
        ], 'chronology', 'chrono-d2'),
      },
       {
        id: 'chrono-d3',
        title: 'Historical Integration & Contextualization',
        learningGoal: 'Develop the ability to identify deep patterns across historical periods, understand the influence of context, and critically analyze historical narratives.',
        chronicleTheme: 'Navigating historical archives to identify recurring civilizational patterns, decode contextual influences, and challenge biased narratives.',
        domainDungeonType: 'history_vault_of_patterns',
        characterAffinities: ['chronicle_keeper', 'veriscribe', 'veritas'],
        specterAffinities: ['narrative-specter', 'complexity-specter', 'certainty-specter'], // Externalization for narrative bias, complexity of historical factors.
        nodes: addStatusToNodes([
          { 
            id: 'chrono-d3-n1', 
            title: 'Temporal Pattern Recognition & Cyclical Thinking', 
            nodeType: 'strategy', 
            shortDefinition: 'Identifying recurring sequences, trends, oscillations, or cycles across different historical periods or within long-term data sets.', 
            learningObjective: 'Detect and analyze various types of recurring temporal patterns (e.g., cycles, trends, spirals) in historical or systemic data.', 
            keyTerms: ['historical patterns', 'cycle detection', 'trend analysis', 'temporal similarities', 'longue durée', 'Kondratiev waves'], 
            download: { 
              clarification: 'This involves looking for repeated sequences of events, long-term trends (upward, downward, stable), or cyclical phenomena (e.g., economic boom-bust cycles, generational shifts) across history or in evolving systems.', 
              example: 'Noticing recurring patterns of innovation followed by societal adaptation and then resistance to further change in technological history. Identifying cyclical patterns in fashion trends or political ideologies.', 
              scenario: 'Economists analyzing historical data to identify long-wave economic cycles (like Kondratiev waves) or shorter business cycles. Climate scientists identifying long-term warming trends amidst short-term weather variability.', 
              recallPrompt: 'Explain temporal pattern recognition. What are two different types of patterns one might look for in historical data?' 
            }, 
            epic: {
              explainPrompt: "Describe 'temporal pattern recognition.' How does identifying cycles, trends, or recurring sequences in history help us understand the present or anticipate the future?",
              probePrompt: "What are the dangers of over-interpreting apparent patterns in historical data (apophenia)? How can 'Pattern Skepticism' (Sovereign Core) be applied to historical pattern analysis?",
              implementPrompt: "Choose a significant historical trend or cycle you are familiar with (e.g., the rise and fall of empires, a specific technological adoption cycle, a recurring social movement). Briefly describe the pattern and identify at least two key factors that seem to drive its recurrence.",
              connectPrompt: "How might 'Systems Dynamics' (Synthetic Systems or Chronology itself) provide tools for modeling and understanding the feedback loops that drive cyclical patterns in history?"
            }
          },
          { 
            id: 'chrono-d3-n2', 
            title: 'Historical Modeling & Simulation (Conceptual)', 
            nodeType: 'strategy', 
            shortDefinition: 'Creating simplified conceptual or computational representations of past systems or events to understand their dynamics, explore counterfactuals, and test hypotheses about causal factors.', 
            learningObjective: 'Construct and utilize simple historical models (conceptual or diagrammatic) to analyze past cause-and-effect relationships and explore alternative historical pathways.', 
            keyTerms: ['historical simulation', 'systems dynamics (historical)', 'causal modeling', 'past reconstruction', 'counterfactual history', 'agent-based modeling (conceptual)'], 
            download: { 
              clarification: 'Historical modeling involves using models (which can range from simple diagrams to complex computer simulations) to explore "what if" scenarios, test theories about historical causation, or understand the interplay of different factors in past events.', 
              example: 'Conceptually modeling the factors leading to a specific historical revolution (e.g., economic hardship, political oppression, new ideologies, external influences) and how changing one factor might have altered the outcome.', 
              scenario: 'Climate scientists use complex computer models to simulate past climate changes and validate their understanding of climate drivers. Historians might use agent-based models to simulate the spread of ideas or diseases in past populations.', 
              recallPrompt: 'What is the purpose of historical modeling, and what can it help us understand about past events?' 
            }, 
            epic: {
              explainPrompt: "Explain 'historical modeling.' How can creating a simplified model of a past event or system help in understanding its complex dynamics?",
              probePrompt: "What are the major limitations and potential biases involved in historical modeling, especially when dealing with incomplete data or complex human motivations?",
              implementPrompt: "Choose a significant historical event. Create a simple conceptual model (e.g., a causal loop diagram or a list of key interacting factors) that represents what you believe were the 3-5 most important drivers of that event. Then, consider one 'counterfactual': what if one of those key drivers had been different? How might the outcome have changed?",
              connectPrompt: "How does 'Belief Architecture' (AXIOMOS) relate to the assumptions embedded within any historical model? How does 'Evidence Evaluation' (Sovereign Core) inform the construction and validation of such models?"
            }
          },
          { 
            id: 'chrono-d3-n3', 
            title: 'Contextual Understanding & Avoiding Presentism', 
            nodeType: 'principle', 
            shortDefinition: 'The critical importance of interpreting past events, beliefs, and actions within their specific historical, social, cultural, and technological context, avoiding the imposition of modern values or understanding.', 
            learningObjective: 'Analyze historical events by explicitly considering their specific context and consciously working to avoid presentist biases in interpretation.', 
            keyTerms: ['historical context', 'presentism', 'cultural relativism (historical)', 'situated interpretation', 'anachronism', 'empathy (historical)'], 
            download: { 
              clarification: 'Contextual understanding means judging the past on its own terms, considering the knowledge, values, and constraints of the time. Presentism is the error of interpreting past events using modern standards, often leading to misjudgment and a lack of genuine understanding.', 
              example: 'Understanding historical scientific theories (e.g., phlogiston theory) within the limited empirical knowledge and conceptual frameworks available at that time, rather than simply dismissing them as "wrong" from a modern perspective.', 
              scenario: 'Legal historians interpreting the original intent of laws must immerse themselves in the specific socio-political context in which those laws were written, rather than applying contemporary meanings to historical terms.', 
              recallPrompt: 'Define "presentism" in historical analysis and explain why contextual understanding is crucial for avoiding it.' 
            }, 
            epic: {
              explainPrompt: "Explain the importance of 'contextual understanding' in historical analysis. What is 'presentism,' and why is it considered a significant error in historical interpretation?",
              probePrompt: "Is it ever appropriate or useful to apply modern ethical standards to past events, even while striving for contextual understanding? Where is the line between understanding and condoning?",
              implementPrompt: "Choose a historical figure or event often judged harshly by modern standards. Research the specific historical context (prevailing beliefs, available knowledge, societal norms of that time). Write a brief analysis explaining how understanding this context might lead to a more nuanced (though not necessarily approving) interpretation of their actions or the event.",
              connectPrompt: "How does 'Perspective Taking' (Communication module or Self-Authorship) apply to achieving historical contextual understanding? How can 'Reality Tunnels' (if available) help in appreciating the different 'worlds' historical actors inhabited?"
            }
          },
          { 
            id: 'chrono-d3-n4', 
            title: 'Path Dependence & Historical Constraints', 
            nodeType: 'concept', 
            shortDefinition: 'The concept that past decisions, events, or technological choices constrain and shape future possibilities, often leading to "lock-in" effects even if better alternatives emerge.', 
            learningObjective: 'Identify and analyze instances of path dependence in technological, social, or institutional development, explaining how early choices create lasting constraints.', 
            keyTerms: ['path dependence', 'historical constraints', 'lock-in effect', 'legacy systems', 'initial conditions', 'QWERTY effect', 'increasing returns'], 
            download: { 
              clarification: 'Path dependence is the idea that "history matters"—early choices, even small or accidental ones, can create self-reinforcing dynamics that make it difficult to switch to alternatives later, even if those alternatives are superior. This leads to "lock-in."', 
              example: 'The QWERTY keyboard layout, originally designed to slow typists down on mechanical typewriters, persists today despite more efficient layouts existing, due to the high switching costs and network effects of widespread adoption.', 
              scenario: 'Urban development patterns are often heavily influenced by historical infrastructure choices (e.g., road networks, railway lines) that constrain modern city planning even if those original choices are no longer optimal.', 
              recallPrompt: 'Explain path dependence with an example, and define "lock-in effect."' 
            }, 
            epic: {
              explainPrompt: "Describe 'path dependence.' How can small, early events or decisions have large, long-lasting, and often constraining effects on future development?",
              probePrompt: "How can societies or organizations try to mitigate the negative effects of path dependence or avoid getting 'locked-in' to suboptimal pathways? What makes breaking out of lock-in so difficult?",
              implementPrompt: "Identify an example of path dependence in your personal life, your workplace, or a technology you use (e.g., a specific software you continue to use despite better alternatives, a long-standing habit, an organizational process). Describe the initial conditions/choices and how they've constrained current options.",
              connectPrompt: "How does 'System Boundaries' (AXIOMOS) relate to path dependence, in that early boundary choices for a system can create strong path dependencies for its evolution? Can 'Recursive Sovereignty' help in consciously breaking detrimental path dependencies?"
            }
          },
          { 
            id: 'chrono-d3-n5', 
            title: 'Historical Analogical Reasoning', 
            nodeType: 'strategy', 
            shortDefinition: 'Using past situations, events, or processes as analogies to understand present challenges, make predictions, or inform strategic decisions, while critically assessing similarity and difference.', 
            learningObjective: 'Critically apply historical analogies to contemporary problems, carefully evaluating the degree of similarity, relevant differences, and potential misapplications.', 
            keyTerms: ['historical analogy', 'comparative history', 'precedent analysis', 'transfer of learning (historical)', 'misleading analogies', 'critical use of history'], 
            download: { 
              clarification: 'Historical analogical reasoning involves drawing parallels between past and present situations to gain insights. However, it requires careful analysis of both similarities and crucial differences to avoid superficial or misleading comparisons.', 
              example: 'Policymakers comparing a current international crisis to historical precedents (e.g., the Cuban Missile Crisis, the lead-up to WWI) to inform their decision-making, while also noting how current conditions differ.', 
              scenario: 'Military strategists studying past battles and campaigns for tactical insights, but adapting those lessons to modern technology and geopolitical contexts.', 
              recallPrompt: 'Describe historical analogical reasoning. What is a key caution one must observe when using historical analogies?' 
            }, 
            epic: {
              explainPrompt: "Explain 'historical analogical reasoning.' What are its benefits for understanding current events or making decisions, and what are its potential pitfalls?",
              probePrompt: "Why are humans so prone to using historical analogies, even when they might be inappropriate or misleading? What cognitive functions does analogical reasoning serve?",
              implementPrompt: "Choose a current event or societal challenge. Identify a historical event that is often used as an analogy for it. Analyze the analogy: What are the key similarities that make the analogy compelling? What are crucial differences that might limit its applicability or make it misleading?",
              connectPrompt: "How does 'Cross-Domain Mapping' (Synthetic Systems) provide a more general framework for the kind of analogical thinking used in historical reasoning? How can 'Fallacy Identification' (Thinking module) help detect flawed historical analogies?"
            }
          },
          { 
            id: 'chrono-d3-n6', 
            title: 'Critical Historiography & Narrative Construction', 
            nodeType: 'concept', 
            shortDefinition: 'Understanding how historical accounts are actively constructed narratives shaped by evidence selection, interpretation, perspective, and the historian\'s own context, rather than being purely objective records.', 
            learningObjective: 'Critically evaluate different historical narratives of the same event, identifying their underlying assumptions, sources, and potential biases.', 
            keyTerms: ['historiography', 'narrative bias', 'interpretation', 'historical selection', 'source criticism', 'historical perspective', 'metanarrative'], 
            download: { 
              clarification: 'Critical historiography recognizes that "history" is not just a collection of facts, but a constructed narrative. Historians make choices about what evidence to include, how to interpret it, and what story to tell. Different perspectives can lead to vastly different historical accounts of the same events.', 
              example: 'Different historical narratives of a major war, such as WWII, as told from the perspective of the Allied powers, the Axis powers, or neutral countries, each emphasizing different aspects and interpretations.', 
              scenario: 'Museum exhibits constructing historical narratives through the selection and arrangement of artifacts, the language of display texts, and the exclusion of alternative viewpoints.', 
              recallPrompt: 'Explain why historical accounts are considered "constructions" rather than simple objective records. What factors influence this construction?' 
            }, 
            epic: {
              explainPrompt: "What is 'historiography,' and why is it important to critically examine how historical narratives are constructed?",
              probePrompt: "If all historical accounts are constructed narratives, does that mean all interpretations are equally valid, or are there criteria for judging the quality or reliability of historical narratives? What might those be?",
              implementPrompt: "Find two different brief accounts of the same significant historical event from different sources (e.g., a textbook vs. a primary source excerpt, or two historians with different viewpoints). Compare them: What facts are emphasized or omitted in each? What interpretations are offered? What might account for the differences?",
              connectPrompt: "How does 'Sovereign Narrative' (Self-Authorship domain in Sovereign Core) apply to the historian's task of constructing a coherent and meaningful account from historical evidence? How does 'Epistemic Hygiene' (AXIOMOS) apply to the historian's use of sources?"
            }
          },
        ], 'chronology', 'chrono-d3'),
      },
      {
        id: 'chrono-d4',
        title: 'Strategic Foresight & Future Projection',
        learningGoal: 'Develop rigorous skills in forecasting potential future trends, planning for multiple scenarios, and making strategic decisions under conditions of uncertainty.',
        chronicleTheme: 'Navigating scenario simulation challenges that require predictive modeling, risk assessment, and long-range strategic planning to ensure future stability or achieve desired outcomes.',
        domainDungeonType: 'oracle_chamber_of_foresight',
        characterAffinities: ['architect', 'praxis', 'chronicler'],
        specterAffinities: ['optimization-specter', 'complexity-specter', 'certainty-specter'],
        nodes: addStatusToNodes([
          { 
            id: 'chrono-d4-n1', 
            title: 'Trend Extrapolation & Its Limits', 
            nodeType: 'strategy', 
            shortDefinition: 'Projecting current trends into the future, assuming a continuation of existing patterns, while also understanding the limitations and potential disruptions to such trends.', 
            learningObjective: 'Apply basic trend extrapolation techniques to forecast potential short-term futures, and critically evaluate the assumptions and inherent limitations of this method.', 
            keyTerms: ['forecasting', 'trend analysis', 'projection', 'linear extrapolation', 'exponential extrapolation', 'black swan events (revisited)'], 
            download: { 
              clarification: 'Trend extrapolation is a common forecasting method that extends past and present patterns into the future. While useful for short-term predictions in stable systems, it often fails to account for disruptive innovations, systemic shifts, or "black swan" events.', 
              example: 'Predicting next year\'s sales based on the average growth rate of the past five years. Predicting population growth by extrapolating current birth and death rates.', 
              scenario: 'Demographers projecting population changes often use trend extrapolation but must also consider factors like changing fertility rates, migration, and healthcare advancements that can alter trends.', 
              recallPrompt: 'What is trend extrapolation, and what is its main limitation as a forecasting method?' 
            }, 
            epic: {
              explainPrompt: "Explain 'trend extrapolation' as a forecasting technique. What are its strengths for certain types of predictions and its critical weaknesses for others?",
              probePrompt: "What kinds of events or factors typically cause extrapolated trends to 'break' or become unreliable? How can one try to anticipate such breaks?",
              implementPrompt: "Find a real-world dataset that shows a clear trend over time (e.g., global internet users, atmospheric CO2 levels, a stock price). Create a simple extrapolation for the next 5-10 units of time. Then, identify at least two factors that could cause your extrapolation to be significantly wrong.",
              connectPrompt: "How does 'Path Dependence' (Historical Integration domain) sometimes reinforce the apparent reliability of trend extrapolation, and how can it also lead to being blindsided when a system breaks from its path?"
            }
          },
          { 
            id: 'chrono-d4-n2', 
            title: 'Scenario Planning & Plausible Futures', 
            nodeType: 'strategy', 
            shortDefinition: 'A strategic planning method that involves developing multiple plausible, internally consistent narratives of future possibilities based on key uncertainties and driving forces.', 
            learningObjective: 'Construct a set of diverse and plausible future scenarios (e.g., optimistic, pessimistic, transformative) for a given strategic issue or domain.', 
            keyTerms: ['scenario planning', 'future studies', 'uncertainty management', 'plausible futures', 'driving forces', 'critical uncertainties', 'strategic conversations'], 
            download: { 
              clarification: 'Instead of aiming for a single "correct" prediction, scenario planning explores a range of different potential futures. This helps organizations or individuals prepare for multiple eventualities, identify robust strategies, and recognize early warning signs of different futures unfolding.', 
              example: 'A business creating scenarios for its 10-year future: one where technology rapidly disrupts its market, one where regulations become much stricter, and one where current trends continue with minor modifications.', 
              scenario: 'Governments using scenario planning to prepare for different climate change impact scenarios (e.g., varying degrees of sea-level rise, different frequencies of extreme weather events) to inform infrastructure and policy decisions.', 
              recallPrompt: 'Describe the purpose of scenario planning. How does it differ from traditional forecasting that aims for a single prediction?' 
            }, 
            epic: {
              explainPrompt: "Explain the process and benefits of 'scenario planning.' Why is developing multiple plausible futures often more useful for strategy than trying to make a single point forecast?",
              probePrompt: "What are the key challenges in developing truly insightful and useful scenarios (e.g., avoiding biases, identifying genuine critical uncertainties, making scenarios distinct yet plausible)?",
              implementPrompt: "Choose a current technological or social trend (e.g., remote work, AI development, personalized medicine). Develop two brief but distinct future scenarios for the year 2040 based on this trend: one significantly more optimistic and one significantly more pessimistic. For each, identify 1-2 key assumptions or driving forces.",
              connectPrompt: "How can 'Conditional Sequencing & Branching Futures' (Sequential Reasoning domain) be seen as a micro-level application of the same thinking used in macro-level scenario planning?"
            }
          },
          { 
            id: 'chrono-d4-n3', 
            title: 'Predictive Modeling (Conceptual Overview)', 
            nodeType: 'concept', // Focus on understanding, not implementing complex models here
            shortDefinition: 'Using statistical techniques and/or computational algorithms (including AI/ML) to analyze historical and current data to make quantitative or qualitative predictions about future outcomes.', 
            learningObjective: 'Understand the fundamental principles, common types (e.g., regression, classification), and inherent limitations of predictive modeling.', 
            keyTerms: ['forecasting models', 'quantitative prediction', 'algorithmic forecasting', 'machine learning (for prediction)', 'regression analysis', 'classification models', 'time series analysis'], 
            download: { 
              clarification: 'Predictive modeling encompasses a range of quantitative approaches used to forecast future events or behaviors. These models learn patterns from data to make predictions, but their accuracy depends heavily on data quality, model assumptions, and the inherent predictability of the system.', 
              example: 'Using machine learning algorithms trained on historical customer data to predict which customers are likely to churn (cancel a subscription) in the next month. Credit scoring models predicting likelihood of loan default.', 
              scenario: 'Meteorologists use complex numerical weather prediction models, which are a form of predictive modeling, to forecast weather patterns based on current atmospheric data and physical laws.', 
              recallPrompt: 'What is predictive modeling, and what is its primary input and output?' 
            }, 
            epic: {
              explainPrompt: "Describe what 'predictive modeling' is in general terms. What are some common applications, and what makes a predictive model 'good'?",
              probePrompt: "What are the ethical implications and potential biases that can arise from using predictive models, especially in areas like criminal justice, hiring, or loan applications? How can these be addressed?",
              implementPrompt: "Identify a real-world situation where predictive modeling is used (e.g., weather forecasting, stock market prediction, sports analytics). Briefly describe: 1) What is being predicted? 2) What kind of data might be used? 3) What are potential sources of error or uncertainty in the predictions?",
              connectPrompt: "How does 'Evidence Evaluation' (Sovereign Core) apply to assessing the reliability and limitations of predictive models and the data they are built upon?"
            }
          },
          { 
            id: 'chrono-d4-n4', 
            title: 'Temporal Risk Assessment & Mitigation', 
            nodeType: 'strategy', 
            shortDefinition: 'Systematically evaluating the probability and potential impact of negative future events over specific time horizons, and developing strategies to reduce that risk.', 
            learningObjective: 'Conduct a basic temporal risk assessment for a personal or project goal, identifying potential future risks and proposing mitigation strategies.', 
            keyTerms: ['risk analysis', 'future risk', 'probability assessment', 'impact assessment', 'risk mitigation', 'contingency planning (revisited)'], 
            download: { 
              clarification: 'Temporal risk assessment involves looking ahead to consider what could go wrong, how likely it is, and how severe the consequences would be. Mitigation strategies are then developed to either reduce the likelihood or lessen the impact of these potential negative events.', 
              example: 'An individual assessing the financial risks of long-term unemployment and mitigating it by building an emergency fund and continuously developing marketable skills.', 
              scenario: 'Insurance companies use sophisticated temporal risk assessment models to calculate premiums based on the likelihood and potential cost of future events (e.g., accidents, natural disasters).', 
              recallPrompt: 'What are the two main components that are evaluated in a risk assessment (temporal or otherwise)?' 
            }, 
            epic: {
              explainPrompt: "Explain 'temporal risk assessment.' How does adding a 'temporal' dimension change standard risk assessment?",
              probePrompt: "How do cognitive biases (like optimism bias or availability heuristic) affect our ability to accurately assess future risks? How can these be countered?",
              implementPrompt: "Choose a long-term personal goal. Identify three potential future risks that could derail this goal. For each risk, estimate its likelihood (Low/Med/High) and potential impact (Low/Med/High). Propose one mitigation strategy for the highest-priority risk.",
              connectPrompt: "How does 'Confidence Calibration' (Sovereign Core) improve the 'probability assessment' component of temporal risk assessment?"
            }
          },
          { 
            id: 'chrono-d4-n5', 
            title: 'Strategic Goal Setting & Backcasting', 
            nodeType: 'strategy', 
            shortDefinition: 'A planning method that starts by defining a desired future state or goal and then works backward to identify the necessary steps, milestones, and resources required to achieve it from the present.', 
            learningObjective: 'Apply backcasting techniques to develop a strategic plan for achieving a significant long-term goal.', 
            keyTerms: ['backcasting', 'goal-oriented planning', 'strategic planning', 'reverse engineering (planning)', 'visioning', 'milestone planning'], 
            download: { 
              clarification: 'Backcasting is a powerful planning method that contrasts with forecasting (which projects forward from the present). By starting with a clear vision of a desired future, backcasting helps identify the critical path and necessary preconditions to make that future a reality.', 
              example: 'Planning for retirement by first setting a target retirement age and income level, then calculating the necessary savings rate, investment strategy, and intermediate financial milestones needed to reach that target from one\'s current position.', 
              scenario: 'NASA planning a mission to Mars by defining the end goal (e.g., humans landing on Mars by a certain date) and then working backward to determine all the technological developments, tests, and intermediate missions required.', 
              recallPrompt: 'Describe the process of backcasting. How does it differ from traditional forecasting-based planning?' 
            }, 
            epic: {
              explainPrompt: "Explain the methodology of 'backcasting.' What are its advantages for long-range strategic planning compared to simply extrapolating current trends forward?",
              probePrompt: "What are the challenges in effectively implementing backcasting (e.g., defining a sufficiently clear future vision, accurately identifying all necessary intermediate steps, dealing with unforeseen obstacles)?",
              implementPrompt: "Choose a significant personal or professional goal you'd like to achieve in 5-10 years. Using backcasting: 1. Clearly define the desired end state. 2. Identify 2-3 major milestones you'd need to hit 1-2 years before that. 3. For one of those milestones, identify 2-3 key actions needed in the next 6-12 months. 4. What is one action you can take this month?",
              connectPrompt: "How does 'Values Embodiment' (Sovereign Core) inform the initial 'visioning' stage of backcasting, ensuring the desired future aligns with core principles?"
            }
          },
          { 
            id: 'chrono-d4-n6', 
            title: 'Adaptive Contingency Planning', 
            nodeType: 'strategy', 
            shortDefinition: 'Preparing robust and flexible alternative plans ("Plan B," "Plan C") to address potential future disruptions, obstacles, or failures in the primary plan.', 
            learningObjective: 'Develop and articulate at least one detailed contingency plan for a critical project or personal goal, identifying triggers and alternative actions.', 
            keyTerms: ['contingency planning', 'backup plan', 'Plan B', 'resilience planning', 'risk response', 'alternative strategies', 'worst-case scenario planning'], 
            download: { 
              clarification: 'Contingency planning involves proactively developing alternative courses of action for "what if" scenarios where key assumptions of the main plan fail or unexpected disruptions occur. Good contingency plans are adaptive and specify triggers for activation.', 
              example: 'Planning an outdoor wedding with a detailed indoor backup plan (including venue, logistics) in case of heavy rain, with a clear trigger point (e.g., "if rain probability exceeds 60% by 24 hours prior").', 
              scenario: 'Disaster preparedness planning by emergency services involves extensive contingency plans for various types of disasters, outlining resource deployment, communication strategies, and evacuation routes for different scenarios.', 
              recallPrompt: 'What is contingency planning, and what are the key elements of an effective contingency plan?' 
            }, 
            epic: {
              explainPrompt: "Explain 'adaptive contingency planning.' Why is it more than just having a single 'backup plan'? What makes it 'adaptive'?",
              probePrompt: "How can one avoid contingency planning becoming an exercise in excessive worry or planning for every conceivable (but improbable) negative outcome? How do you prioritize which contingencies to plan for?",
              implementPrompt: "For the long-term goal you used in the 'Backcasting' implement prompt, identify one major potential obstacle or point of failure in your plan. Develop a concise contingency plan: 1. What is the trigger that would activate this plan? 2. What is the alternative course of action? 3. What resources would it require?",
              connectPrompt: "How does 'Real-Time Strategy Adjustment' (Adaptive Resilience) represent the execution phase of a well-prepared contingency plan when a trigger event occurs?"
            }
          },
        ], 'chronology', 'chrono-d4'),
      },
    ],
};
