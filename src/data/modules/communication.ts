import type { Module, ModuleType } from '@/types/neuro';
import { addStatusToNodes } from './_common';

export const communicationModuleData: Omit<Module, 'status'> = {
    id: 'communication',
    type: 'pillar' as ModuleType,
    title: 'Expressive Precision: The Architecture of Language and Connection',
    description: 'Enable fluent, intentional, and adaptive communication across mediums, audiences, and emotional contexts.',
    moduleLearningGoal: 'To master the cognitive and practical skills required for clear, impactful, and adaptive communication, encompassing linguistic precision, social understanding, effective expression, and productive dialogue.',
    tags: ['language', 'social cognition', 'expression', 'dialogue', 'interpersonal skills', 'rhetoric'],
    dependencies: ['sovereign-core', 'thinking'],
    alignmentBias: 'neutral',
    defaultCompanion: 'verivox',
    associatedSpecters: ['misinterpretation-specter', 'projection-specter', 'silence-specter', 'signal-loss-specter'],
    recommendedChronicleDungeon: 'Temple of Broken Signals',
    moduleCategory: ['expression', 'interpersonal', 'social cognition'],
    reviewProfile: {
      decayModel: 'performance_adaptive',
      reviewClusters: [
        ['semantic_precision', 'syntactic_mastery', 'pragmatic_context'],
        ['theory_of_mind', 'perspective_taking', 'empathic_resonance'],
        ['audience_adaptation', 'multimodal_expression', 'rhetorical_effectiveness'],
        ['active_listening', 'constructive_argumentation', 'collaborative_synthesis']
      ],
      interleaveRatio: 0.3
    },
    domains: [
      {
        id: 'language_processing',
        title: 'Language Processing Domain',
        learningGoal: 'Master the fundamental components of language—semantics, syntax, and pragmatics—to achieve precision in both comprehension and expression.',
        chronicleTheme: 'Navigating linguistic labyrinths where meaning shifts across semantic layers, syntactic structures, and pragmatic contexts',
        domainDungeonType: 'logic_maze',
        characterAffinities: ['veriscribe', 'neuros', 'veridix'],
        specterAffinities: ['misinterpretation-specter', 'signal-loss-specter'],
        nodes: addStatusToNodes([
          {
            id: 'semantic_precision',
            title: 'Semantic Precision',
            nodeType: 'concept',
            shortDefinition: 'The ability to select and arrange words to convey precise meaning, accounting for denotation, connotation, and contextual nuance.',
            learningObjective: 'Apply semantic awareness to eliminate ambiguity and enhance precision in both spoken and written communication.',
            keyTerms: ['denotation', 'connotation', 'polysemy', 'semantic field', 'lexical choice', 'meaning disambiguation'],
            download: {
              clarification: 'Semantic precision involves understanding multiple layers of meaning—the literal definition (denotation), associated feelings or cultural meanings (connotation), and how words relate within broader conceptual networks. It requires choosing words that convey exactly what you intend, considering how your audience will interpret them.',
              example: 'Choosing "assertive" vs "aggressive" vs "pushy" vs "confident" to describe someone\'s behavior. Each carries different connotations despite overlapping denotations, creating very different impressions of the same actions.',
              scenario: 'In diplomatic communication, semantic precision prevents misunderstandings that could escalate conflicts. A treaty negotiator must ensure that terms like "sovereignty," "autonomy," and "independence" are used with precise meanings that all parties understand consistently.',
              recallPrompt: 'Explain how semantic precision differs from simply using correct vocabulary, and why connotation matters as much as denotation.'
            },
            epic: {
              explainPrompt: "Explain semantic precision as it applies to effective communication. How do denotation, connotation, and context interact to create precise meaning?",
              probePrompt: "What happens when semantic precision is lacking in professional, personal, or academic settings? Can excessive semantic precision become counterproductive?",
              implementPrompt: "Choose a concept important to your field or interests. Write three different explanations using: 1) Technical/precise language for experts, 2) Clear but accessible language for educated non-specialists, 3) Simple language for children. Notice how semantic choices affect clarity and precision.",
              connectPrompt: "How does semantic precision support the 'Non-Contradiction' principle from AXIOMOS by ensuring statements mean what they appear to mean?"
            }
          },
          {
            id: 'syntactic_mastery',
            title: 'Syntactic Mastery',
            nodeType: 'strategy',
            shortDefinition: 'The ability to manipulate sentence structure, grammar, and linguistic patterns to enhance clarity, emphasis, and stylistic effect.',
            learningObjective: 'Consciously employ syntactic structures to improve readability, create emphasis, and adapt style for different communicative purposes.',
            keyTerms: ['sentence structure', 'grammatical patterns', 'parallelism', 'subordination', 'coordination', 'syntactic variety'],
            download: {
              clarification: 'Syntactic mastery goes beyond basic grammatical correctness to strategic use of sentence structure. This includes varying sentence length and complexity for rhythm, using parallel structure for emphasis, and employing subordination and coordination to show relationships between ideas clearly.',
              example: 'Compare "The company failed because of poor planning and bad execution and market changes" (weak coordination) vs. "The company failed due to poor planning, while market changes exposed these weaknesses and bad execution compounded the problems" (strategic subordination).',
              scenario: 'Legal writing requires syntactic mastery to create documents that are both precise and comprehensible. A well-structured contract uses syntactic patterns to clarify which clauses modify which terms, preventing ambiguity that could lead to disputes.',
              recallPrompt: 'How does syntactic mastery differ from basic grammatical correctness? Give an example of how sentence structure affects meaning or emphasis.'
            },
            epic: {
              explainPrompt: "Explain syntactic mastery and how it enhances communication beyond grammatical correctness. What are some ways sentence structure can be manipulated for effect?",
              probePrompt: "How do different languages offer different syntactic possibilities? What syntactic features of English help or hinder clear communication?",
              implementPrompt: "Take a paragraph you've written recently. Rewrite it focusing on: 1) Varying sentence length, 2) Using parallel structure where appropriate, 3) Ensuring subordination clearly shows relationships between ideas. Note how these changes affect readability and emphasis.",
              connectPrompt: "How does syntactic mastery support 'Logical Reasoning' from Thinking by making the logical relationships between ideas clearer through sentence structure?"
            }
          },
          {
            id: 'pragmatic_context',
            title: 'Pragmatic Context',
            nodeType: 'principle',
            shortDefinition: 'The understanding that meaning emerges from the interaction between what is said and the social, cultural, and situational context in which it\'s said.',
            learningObjective: 'Interpret and generate communication that accounts for contextual factors including social dynamics, cultural norms, and implicit shared knowledge.',
            keyTerms: ['contextual meaning', 'implicature', 'speech acts', 'cultural pragmatics', 'situational awareness', 'shared assumptions'],
            download: {
              clarification: 'Pragmatic context recognizes that communication meaning isn\'t contained solely in words and grammar but emerges from the interaction between language and context. This includes understanding indirect speech acts ("Can you pass the salt?" as a request, not a question), cultural communication patterns, and how shared knowledge shapes interpretation.',
              example: 'In Japanese business culture, saying "That\'s an interesting idea, we\'ll consider it" often pragmatically means "No" in a way that allows face-saving. The semantic meaning is positive, but the pragmatic meaning is negative, understood through cultural context.',
              scenario: 'A software engineer joining a new team must learn not just the technical vocabulary but the pragmatic patterns—when "Let\'s discuss this offline" means "this is controversial," when silence in meetings indicates disagreement, and how feedback is typically given indirectly.',
              recallPrompt: 'Explain how pragmatic context creates meaning beyond semantic and syntactic content. Why is cultural awareness essential for pragmatic understanding?'
            },
            epic: {
              explainPrompt: "Explain pragmatic context in communication. How does the same utterance can have completely different meanings in different contexts?",
              probePrompt: "What are the risks of misunderstanding pragmatic context in cross-cultural communication or professional settings? How can pragmatic competence be developed?",
              implementPrompt: "Analyze a recent conversation where subtext was important. Identify: 1) What was said literally, 2) What was pragmatically implied, 3) What contextual factors enabled this pragmatic interpretation, 4) How the same words might be interpreted differently in a different context.",
              connectPrompt: "How does pragmatic context relate to 'Contextual Understanding' from Chronology, extending the principle to linguistic rather than historical contexts?"
            }
          },
          {
            id: 'discourse_analysis',
            title: 'Discourse Analysis',
            nodeType: 'strategy',
            shortDefinition: 'The systematic examination of how meaning is constructed across larger units of text or conversation, including coherence, cohesion, and rhetorical structure.',
            learningObjective: 'Analyze and construct discourse that maintains coherence across extended communication, using appropriate linking, transitions, and organizational patterns.',
            keyTerms: ['coherence', 'cohesion', 'discourse markers', 'text structure', 'thematic development', 'rhetorical patterns'],
            download: {
              clarification: 'Discourse analysis examines how meaning is built across sentences, paragraphs, and entire conversations or texts. It includes how ideas connect through transitions, how themes develop, how arguments are structured, and how speakers maintain coherence across extended communication.',
              example: 'Analyzing how academic papers use discourse markers ("however," "furthermore," "in contrast") to guide readers through argumentation, how thesis statements set up discourse structure, and how conclusions synthesize earlier themes.',
              scenario: 'A project manager analyzing team meeting transcripts to identify communication patterns—who speaks when, how topics are introduced and developed, where conversations break down, and how decisions emerge through the discourse structure.',
              recallPrompt: 'What is discourse analysis and how does it differ from analyzing individual sentences? Why are coherence and cohesion important in extended communication?'
            },
            epic: {
              explainPrompt: "Explain discourse analysis and its importance for understanding extended communication. What elements create coherence across multiple sentences or conversational turns?",
              probePrompt: "How do different genres (academic writing, conversation, technical documentation) use different discourse patterns? What makes some discourse more effective than others?",
              implementPrompt: "Analyze a piece of extended communication (long email, article, recorded conversation). Map its discourse structure: 1) How topics are introduced and developed, 2) What transitions connect ideas, 3) Where the argument or narrative structure becomes clear, 4) How effectively the whole holds together.",
              connectPrompt: "How does discourse analysis support 'Argument Mapping' from Thinking by examining how premises and conclusions are connected across extended argumentation?"
            }
          },
          {
            id: 'metalinguistic_awareness',
            title: 'Metalinguistic Awareness',
            nodeType: 'principle',
            shortDefinition: 'The ability to think about language as a system—recognizing how linguistic choices affect meaning, impact, and interpretation.',
            learningObjective: 'Develop conscious awareness of language as a tool, enabling strategic linguistic choices and effective language learning.',
            keyTerms: ['language about language', 'linguistic consciousness', 'code-switching', 'register awareness', 'stylistic choice', 'language variety'],
            download: {
              clarification: 'Metalinguistic awareness means treating language as an object of conscious thought rather than just a transparent medium. This includes recognizing different language varieties, understanding how style affects perception, and being able to discuss language patterns themselves.',
              example: 'A writer consciously choosing between "The data shows..." (treating data as singular, common in American business) vs. "The data show..." (treating data as plural, preferred in academic writing) based on audience and context.',
              scenario: 'A multilingual professional developing metalinguistic awareness to code-switch appropriately between languages, recognizing not just what to say but which linguistic features (formal/informal, direct/indirect, technical/accessible) to employ in different contexts.',
              recallPrompt: 'What is metalinguistic awareness? How does conscious awareness of language as a system improve communication effectiveness?'
            },
            epic: {
              explainPrompt: "Explain metalinguistic awareness and its role in sophisticated communication. How does treating language as an object of study improve language use?",
              probePrompt: "What are the benefits and potential drawbacks of high metalinguistic awareness? Can too much focus on language mechanics interfere with natural communication?",
              implementPrompt: "Choose a recent piece of your own writing or speaking. Analyze your linguistic choices: 1) What register (formal/informal) did you use and why? 2) What sentence patterns dominated? 3) How might changing these choices affect the impact? 4) What does this reveal about your default linguistic habits?",
              connectPrompt: "How does metalinguistic awareness support 'Meta-Reasoning' from AXIOMOS by applying reflexive analysis to the tool of language itself?"
            }
          },
          {
            id: 'figurative_language',
            title: 'Figurative Language',
            nodeType: 'strategy',
            shortDefinition: 'The strategic use of metaphor, analogy, and other non-literal linguistic devices to enhance understanding, memorability, and emotional impact.',
            learningObjective: 'Employ figurative language effectively to clarify complex concepts, create vivid imagery, and enhance persuasive impact while avoiding confusion.',
            keyTerms: ['metaphor', 'analogy', 'symbolism', 'imagery', 'rhetorical devices', 'conceptual mapping'],
            download: {
              clarification: 'Figurative language uses non-literal expressions to create meaning through comparison, association, and imagery. When used skillfully, it makes abstract concepts concrete, complex ideas accessible, and dry content memorable. However, it requires audience awareness to avoid confusion or misinterpretation.',
              example: 'Describing a company restructuring as "performing surgery on the organization" creates a metaphor that implies precision, necessity, temporary pain for long-term health, and the need for skilled execution—conveying complex meanings economically.',
              scenario: 'A teacher uses the analogy of a computer\'s memory and processing to explain human cognition to students, then extends the metaphor to discuss differences (emotions, consciousness) that break the analogy, helping students understand both the similarities and unique aspects of minds.',
              recallPrompt: 'How does figurative language enhance communication beyond literal description? What are the risks of using figurative language?'
            },
            epic: {
              explainPrompt: "Explain how figurative language functions in communication. What makes metaphors and analogies effective tools for understanding and persuasion?",
              probePrompt: "When might figurative language be inappropriate or counterproductive? How can cultural differences affect the interpretation of figurative expressions?",
              implementPrompt: "Choose a complex concept from your work or studies. Create three different figurative explanations: 1) A metaphor, 2) An analogy to something familiar, 3) A symbolic representation. Evaluate which works best for different audiences and why.",
              connectPrompt: "How does figurative language connect to 'Analogical Thinking' from the Thinking module, applied specifically to linguistic expression rather than problem-solving?"
            }
          },
        ], 'communication', 'comm-1'),
      },
      {
        id: 'social_cognition',
        title: 'Social Cognition Domain',
        learningGoal: 'Develop sophisticated understanding of other minds, social dynamics, and interpersonal patterns to enable effective and empathetic communication.',
        chronicleTheme: 'Navigating complex social simulations requiring accurate reading of intentions, emotions, and cultural patterns across diverse interactions',
        domainDungeonType: 'identity_trial_nexus',
        characterAffinities: ['mirror_tender', 'ekitty', 'sovereign'],
        specterAffinities: ['projection-specter', 'misinterpretation-specter'],
        nodes: addStatusToNodes([
          {
            id: 'theory_of_mind',
            title: 'Theory of Mind',
            nodeType: 'concept',
            shortDefinition: 'The cognitive ability to attribute mental states—beliefs, desires, intentions, emotions—to others and understand that these may differ from your own and from reality.',
            learningObjective: 'Apply theory of mind to predict behavior, understand motivations, and navigate complex social situations effectively.',
            keyTerms: ['mental state attribution', 'false belief understanding', 'intentionality', 'perspective awareness', 'social prediction'],
            download: {
              clarification: 'Theory of mind enables us to understand that others have inner lives different from our own—different knowledge, beliefs, desires, and intentions. This foundational social cognitive ability underpins empathy, deception, teaching, cooperation, and most complex human interactions.',
              example: 'Understanding that when someone arrives late and looks around confused, they likely don\'t know about the room change that was announced while they were absent—their behavior makes sense given their mental state, even though it seems obvious to those who heard the announcement.',
              scenario: 'A manager recognizes that an employee\'s apparent resistance to a new process isn\'t defiance but confusion—they haven\'t yet understood the reasoning behind the change. By addressing the knowledge gap rather than the behavior, the manager resolves the issue effectively.',
              recallPrompt: 'Explain theory of mind and why understanding that others have different mental states is crucial for social interaction.'
            },
            epic: {
              explainPrompt: "Explain theory of mind and its importance in human social interaction. How does understanding others' mental states differ from simply predicting their behavior?",
              probePrompt: "How does theory of mind develop, and what conditions can impair it? What are some advanced applications beyond basic false belief understanding?",
              implementPrompt: "Recall a recent misunderstanding with someone. Apply theory of mind analysis: 1) What were your beliefs/intentions? 2) What were likely theirs? 3) How did differing mental states create the misunderstanding? 4) How could awareness of mental state differences have prevented it?",
              connectPrompt: "How does theory of mind provide the foundation for 'Perspective Taking' and 'Empathic Resonance' by making us aware that other perspectives exist?"
            }
          },
          {
            id: 'perspective_taking',
            title: 'Perspective Taking',
            nodeType: 'strategy',
            shortDefinition: 'The active process of imagining how a situation appears to another person, considering their background, knowledge, values, and emotional state.',
            learningObjective: 'Systematically adopt others\' perspectives to enhance understanding, reduce conflict, and improve collaborative problem-solving.',
            keyTerms: ['viewpoint shifting', 'cognitive empathy', 'situational understanding', 'contextual perspective', 'decentering'],
            download: {
              clarification: 'Perspective taking requires actively stepping outside your own viewpoint to imagine how others experience a situation. This cognitive skill considers not just different opinions but different knowledge bases, cultural backgrounds, emotional states, and contextual factors that shape interpretation.',
              example: 'A product designer imagining how an elderly user with limited tech experience would approach a new app interface, considering not just different preferences but different mental models of how technology works, different physical abilities, and different emotional relationships with digital tools.',
              scenario: 'In international business negotiations, successful negotiators systematically take their counterparts\' cultural and organizational perspectives—understanding different decision-making processes, different concepts of time and relationship, and different definitions of success.',
              recallPrompt: 'How does perspective taking go beyond simply acknowledging that others have different opinions? What factors should be considered when taking another\'s perspective?'
            },
            epic: {
              explainPrompt: "Explain perspective taking as a deliberate cognitive strategy. What elements should you consider when trying to see a situation from another person's viewpoint?",
              probePrompt: "What are common barriers to effective perspective taking? How can cognitive biases like the fundamental attribution error interfere with accurate perspective taking?",
              implementPrompt: "Choose a current disagreement in your life (personal or professional). Take 15 minutes to write from the other person's perspective: their background, constraints, values, and how the situation looks to them. What insights emerge that weren't apparent from your original viewpoint?",
              connectPrompt: "How does perspective taking build on 'Theory of Mind' by not just recognizing different mental states but actively simulating them to understand experience?"
            }
          },
          {
            id: 'empathic_resonance',
            title: 'Empathic Resonance',
            nodeType: 'concept',
            shortDefinition: 'The ability to both understand others\' emotional states cognitively and feel with them emotionally, creating genuine connection and compassionate response.',
            learningObjective: 'Develop balanced empathic abilities that enhance connection and helping behavior without emotional overwhelm or boundary confusion.',
            keyTerms: ['cognitive empathy', 'affective empathy', 'emotional contagion', 'compassion', 'empathic boundaries', 'resonance regulation'],
            download: {
              clarification: 'Empathic resonance involves both cognitive empathy (understanding others\' emotions) and affective empathy (feeling with them). Healthy empathy maintains appropriate boundaries—you feel with someone without losing your own emotional center, and you understand their emotions without necessarily agreeing with their interpretation or actions.',
              example: 'A counselor feeling genuine sadness when a client describes loss (affective empathy) while simultaneously understanding the specific nature of their grief and its context (cognitive empathy), all while maintaining professional boundaries and emotional stability.',
              scenario: 'A team leader notices a colleague seems withdrawn and stressed. Through empathic resonance, they sense both the emotional distress and recognize signs suggesting work overload rather than personal issues, enabling an appropriately supportive response.',
              recallPrompt: 'Distinguish between cognitive and affective empathy. Why are both components important for empathic resonance, and why are boundaries necessary?'
            },
            epic: {
              explainPrompt: "Explain empathic resonance and how it combines cognitive and affective dimensions. What role do boundaries play in healthy empathy?",
              probePrompt: "How can empathic abilities be both a strength and a vulnerability? What's the difference between empathy and emotional contagion or codependency?",
              implementPrompt: "Practice empathic resonance in a low-stakes interaction: 1) Notice what emotions the other person seems to be experiencing, 2) Allow yourself to feel some resonance with that emotion, 3) Maintain awareness of your own emotional state and boundaries, 4) Reflect on how this affected your understanding and response.",
              connectPrompt: "How does empathic resonance enhance the effectiveness of 'Advanced Active Listening' by creating genuine emotional connection alongside cognitive understanding?"
            }
          },
          {
            id: 'intent_recognition',
            title: 'Intent Recognition',
            nodeType: 'strategy',
            shortDefinition: 'The ability to accurately infer others\' underlying purposes, motivations, and goals from their words, actions, and nonverbal cues.',
            learningObjective: 'Develop skills to recognize genuine intentions behind communication, distinguishing between stated purposes and actual motivations.',
            keyTerms: ['motivation inference', 'hidden agendas', 'behavioral cues', 'intentional transparency', 'purpose alignment', 'goal detection'],
            download: {
              clarification: 'Intent recognition involves reading between the lines to understand what someone actually wants to accomplish, which may differ from what they explicitly state. This includes recognizing when intentions are consciously hidden, unconsciously unclear, or simply assumed to be obvious.',
              example: 'Recognizing that when a colleague says "Just wanted to check in about the project," they may actually be concerned about a specific aspect, want to influence direction, or need reassurance about their own contribution—the stated intent (checking in) differs from the operational intent.',
              scenario: 'A sales professional developing intent recognition to understand when a client\'s stated objections ("too expensive") reflect actual concerns versus negotiation tactics, allowing for more effective responses.',
              recallPrompt: 'Why is recognizing actual intent often different from taking stated purposes at face value? What cues help identify underlying intentions?'
            },
            epic: {
              explainPrompt: "Explain intent recognition in communication. Why might someone's actual intentions differ from their stated purposes?",
              probePrompt: "How can misreading intentions damage relationships or create conflict? What's the balance between healthy skepticism and paranoid interpretation?",
              implementPrompt: "In your next few conversations, practice intent recognition: 1) Notice any discrepancy between stated purpose and implied intent, 2) Identify what cues suggest deeper motivations, 3) Test your interpretation through clarifying questions, 4) Reflect on accuracy and what improved your recognition.",
              connectPrompt: "How does intent recognition link to 'Pragmatic Context' by extending contextual interpretation to motivational rather than just semantic levels?"
            }
          },
          {
            id: 'social_dynamics',
            title: 'Social Dynamics',
            nodeType: 'concept',
            shortDefinition: 'Understanding how power, status, roles, and relationships shape interaction patterns within groups and between individuals.',
            learningObjective: 'Analyze and navigate complex social dynamics to communicate more effectively within existing structures while maintaining authentic relationships.',
            keyTerms: ['power dynamics', 'status hierarchies', 'role expectations', 'group dynamics', 'social context', 'relational positioning'],
            download: {
              clarification: 'Social dynamics encompass the often-invisible forces that shape how people interact—who speaks when, whose ideas get attention, how decisions are made, how conflict is handled. Understanding these patterns helps navigate complex social environments more skillfully.',
              example: 'Recognizing that in a team meeting, junior members may hesitate to contradict senior members directly, instead using phrases like "I wonder if we might also consider..." or waiting for a senior person to voice similar concerns first.',
              scenario: 'A new employee learning the social dynamics of their organization—understanding informal influence networks, recognizing unwritten rules about communication styles, and identifying how change typically happens beyond the official org chart.',
              recallPrompt: 'What are social dynamics and how do they influence communication patterns? Give an example of how social dynamics might affect who speaks and how in a group setting.'
            },
            epic: {
              explainPrompt: "Explain social dynamics and how they influence communication patterns in groups. What invisible forces shape who speaks, how, and when?",
              probePrompt: "How can understanding social dynamics help someone communicate more effectively without manipulating or contributing to unhealthy power structures?",
              implementPrompt: "Observe a group interaction (meeting, social gathering, online discussion). Map the social dynamics: 1) Who has formal vs. informal influence? 2) What patterns determine speaking order or topic changes? 3) How do people modify their communication style based on who's present? 4) What dynamics help or hinder effective communication?",
              connectPrompt: "How do social dynamics provide context for 'Audience Adaptation' by revealing not just who you're speaking to but their position in larger social systems?"
            }
          },
          {
            id: 'nonverbal_communication',
            title: 'Nonverbal Communication',
            nodeType: 'concept',
            shortDefinition: 'The transmission and interpretation of meaning through body language, facial expressions, tone of voice, spatial relationships, and other non-linguistic channels.',
            learningObjective: 'Accurately interpret nonverbal cues and consciously manage your own nonverbal communication to enhance message consistency and emotional connection.',
            keyTerms: ['body language', 'facial expressions', 'vocal tone', 'proxemics', 'paralinguistics', 'nonverbal leakage', 'congruence'],
            download: {
              clarification: 'Nonverbal communication often carries more emotional and relational information than words, and incongruence between verbal and nonverbal messages creates confusion or distrust. This includes both interpreting others\' nonverbal cues and managing your own nonverbal expression.',
              example: 'Notice how someone saying "I\'m fine" with crossed arms, avoiding eye contact, and tight facial expression sends a nonverbal message that contradicts their words—the nonverbal message typically carries more weight in emotional interpretation.',
              scenario: 'A presenter learning to align their nonverbal communication with their message—using open posture to convey confidence, appropriate gestures to emphasize points, and facial expressions that match their content to build credibility and connection.',
              recallPrompt: 'Why is nonverbal communication important, and what happens when verbal and nonverbal messages don\'t align? Name three categories of nonverbal communication.'
            },
            epic: {
              explainPrompt: "Explain the role of nonverbal communication. Why do nonverbal cues often carry more weight than words in interpersonal interaction?",
              probePrompt: "How do cultural differences affect nonverbal communication interpretation? What are some common misinterpretations of nonverbal cues?",
              implementPrompt: "For one day, pay special attention to nonverbal communication: 1) Notice incongruence between words and nonverbal cues in others, 2) Observe your own nonverbal habits during conversations, 3) Experiment with consciously adjusting your nonverbal communication, 4) Reflect on how this awareness changed your interactions.",
              connectPrompt: "How does nonverbal communication provide important data for 'Empathic Resonance' by revealing emotional states that might not be verbally expressed?"
            }
          },
        ], 'communication', 'comm-2'),
      },
      {
        id: 'expression_systems',
        title: 'Expression Systems Domain',
        learningGoal: 'Master diverse modalities and techniques for clear, impactful, and strategically adapted expression across contexts, audiences, and purposes.',
        chronicleTheme: 'Testing expressive mastery through audience adaptation challenges, multimodal design puzzles, and rhetorical effectiveness trials',
        domainDungeonType: 'narrative_construction_foundry',
        characterAffinities: ['verivox', 'veriscribe', 'praxis'],
        specterAffinities: ['signal-loss-specter', 'misinterpretation-specter'],
        nodes: addStatusToNodes([
          {
            id: 'audience_adaptation',
            title: 'Audience Adaptation',
            nodeType: 'strategy',
            shortDefinition: 'The strategic modification of content, style, structure, and delivery based on audience knowledge, needs, values, and context.',
            learningObjective: 'Systematically analyze audiences and adapt communication across multiple dimensions to maximize understanding, engagement, and desired outcomes.',
            keyTerms: ['audience analysis', 'register shifting', 'content tailoring', 'style adaptation', 'cultural sensitivity', 'expertise gauging'],
            download: {
              clarification: 'Audience adaptation goes beyond changing vocabulary—it involves adjusting content depth, organizational patterns, examples, emotional appeals, and delivery style based on who you\'re communicating with. This requires analysis of audience knowledge, values, cultural background, and situational constraints.',
              example: 'Explaining artificial intelligence to: (1) Engineers using technical specifications and implementation details, (2) Business executives focusing on ROI and competitive advantage, (3) Elementary students using analogies to familiar concepts like "teaching a computer to recognize cats," each requiring fundamentally different approaches.',
              scenario: 'A researcher presenting findings to three audiences: academic peers (detailed methodology), policymakers (implications and recommendations), and public (relatable examples and broader significance), requiring complete restructuring rather than mere simplification.',
              recallPrompt: 'What dimensions of communication should be adapted for different audiences? Why is audience adaptation more than just simplifying vocabulary?'
            },
            epic: {
              explainPrompt: "Explain audience adaptation as a strategic communication skill. What factors should you consider when analyzing an audience, and how do these influence your communication choices?",
              probePrompt: "How can you balance audience adaptation with authenticity? When might over-adaptation become pandering or manipulation?",
              implementPrompt: "Select a topic you know well. Design brief presentations for three very different audiences (consider age, expertise, cultural background, or stakes). Note specific changes in: 1) Content emphasis, 2) Language complexity, 3) Examples used, 4) Organizational structure, 5) Tone and style.",
              connectPrompt: "How does audience adaptation build on 'Theory of Mind' and 'Perspective Taking' by applying social cognitive insights to strategic communication design?"
            }
          },
          {
            id: 'multimodal_expression',
            title: 'Multimodal Expression',
            nodeType: 'strategy',
            shortDefinition: 'The integrated use of visual, auditory, textual, and kinesthetic elements to create more effective and engaging communication than any single mode alone.',
            learningObjective: 'Design and deliver communications that strategically combine multiple modes to enhance understanding, retention, and engagement.',
            keyTerms: ['modal integration', 'visual design', 'multimedia composition', 'sensory engagement', 'channel optimization', 'cognitive processing'],
            download: {
              clarification: 'Multimodal expression recognizes that different modes (visual, auditory, textual, kinesthetic) activate different cognitive processing pathways and serve different purposes. Effective multimodal communication doesn\'t just add modes for variety but strategically leverages each mode\'s strengths.',
              example: 'An effective infographic combines visual hierarchy (drawing attention to key points), textual precision (providing specific data), and spatial relationships (showing connections between concepts) in ways that would be inefficient in pure text or pure visual form.',
              scenario: 'A training program combining written instructions (reference), video demonstrations (procedural understanding), hands-on practice (kinesthetic learning), and visual diagrams (spatial relationships) to accommodate different learning preferences and reinforce understanding through multiple channels.',
              recallPrompt: 'What is multimodal expression and why is it often more effective than single-mode communication? How do different modes serve different cognitive functions?'
            },
            epic: {
              explainPrompt: "Explain multimodal expression and why combining different communication modes can be more effective than using any single mode. What strengths does each mode offer?",
              probePrompt: "When might multimodal communication become overwhelming or counterproductive? How do you determine the optimal combination of modes for a specific message?",
              implementPrompt: "Take an important explanation or instruction you've given recently that was primarily text or verbal. Redesign it as a multimodal communication: 1) Identify what visual elements could enhance understanding, 2) Consider what auditory elements might help, 3) Think about interactive or kinesthetic components, 4) Create a simple prototype combining 2-3 modes.",
              connectPrompt: "How does multimodal expression connect to 'Strategic Medium Selection' by expanding beyond choosing a single channel to orchestrating multiple channels effectively?"
            }
          },
          {
            id: 'rhetorical_effectiveness',
            title: 'Rhetorical Effectiveness',
            nodeType: 'principle',
            shortDefinition: 'The skillful use of classical rhetorical principles—ethos, pathos, and logos—to create persuasive and impactful communication.',
            learningObjective: 'Apply rhetorical principles to enhance credibility, emotional connection, and logical persuasion in various communication contexts.',
            keyTerms: ['ethos', 'pathos', 'logos', 'credibility building', 'emotional appeal', 'logical persuasion', 'rhetorical situation'],
            download: {
              clarification: 'Rhetorical effectiveness involves strategic use of three modes of persuasion: ethos (credibility/character), pathos (emotional connection), and logos (logical reasoning). Effective communication typically combines all three, adapted to audience and purpose.',
              example: 'A climate scientist (ethos: expertise) presenting data on temperature trends (logos: evidence) while connecting to audience concerns about their children\'s future (pathos: emotional relevance), creating comprehensive persuasive appeal.',
              scenario: 'A startup founder pitching to investors combines personal track record and team credentials (ethos), compelling vision of market opportunity (pathos), and detailed financial projections (logos) to create a persuasive case for funding.',
              recallPrompt: 'Define ethos, pathos, and logos. Why is combining all three typically more effective than relying on only one mode of persuasion?'
            },
            epic: {
              explainPrompt: "Explain rhetorical effectiveness and how ethos, pathos, and logos work together in persuasive communication. When might each mode be most important?",
              probePrompt: "How can rhetorical techniques be used ethically versus manipulatively? What's the difference between persuasion and manipulation?",
              implementPrompt: "Analyze a persuasive communication you found compelling (speech, article, advertisement). Identify: 1) How ethos was established, 2) What emotional appeals were used (pathos), 3) What logical arguments were presented (logos), 4) How these elements reinforced each other, 5) What made it effective for its audience.",
              connectPrompt: "How does rhetorical effectiveness build on 'Constructive Argumentation' by adding credibility and emotional dimensions to logical reasoning?"
            }
          },
          {
            id: 'clarity_and_concision',
            title: 'Clarity and Concision',
            nodeType: 'principle',
            shortDefinition: 'The ability to express complex ideas in ways that are simultaneously clear, precise, and economical with attention and words.',
            learningObjective: 'Master techniques for eliminating ambiguity and unnecessary complexity while preserving essential meaning and nuance.',
            keyTerms: ['conceptual clarity', 'economic expression', 'precision', 'directness', 'simplification without loss', 'cognitive efficiency'],
            download: {
              clarification: 'Clarity and concision involves removing barriers to understanding while preserving necessary complexity. It\'s not about dumbing down but about efficient cognitive processing—using the minimum viable complexity to convey maximum meaning.',
              example: 'Compare "The implementation of the aforementioned protocol will be undertaken in a manner that ensures optimal outcomes" vs. "We\'ll implement this protocol to achieve the best results"—the second preserves meaning while dramatically improving clarity and concision.',
              scenario: 'A legal document being rewritten for public understanding—maintaining legal precision while eliminating jargon, complex sentence structures, and unnecessary qualifications that obscure rather than protect meaning.',
              recallPrompt: 'How do clarity and concision work together? What\'s the difference between simplification and dumbing down?'
            },
            epic: {
              explainPrompt: "Explain clarity and concision in communication. How do you balance being clear and concise with being thorough and precise?",
              probePrompt: "When might attempts at clarity and concision actually reduce understanding? How do you maintain necessary complexity while improving accessibility?",
              implementPrompt: "Take a complex explanation you've written recently. Revise it for clarity and concision: 1) Identify and eliminate unnecessary words, 2) Replace complex terms with clearer alternatives without losing precision, 3) Reorganize sentences for directness, 4) Test whether the revised version maintains the original meaning.",
              connectPrompt: "How does clarity and concision support 'Semantic Precision' by ensuring that precise meaning is also accessible meaning?"
            }
          },
          {
            id: 'narrative_construction',
            title: 'Narrative Construction',
            nodeType: 'strategy',
            shortDefinition: 'The deliberate crafting of stories and narrative elements to make information more engaging, memorable, and persuasive.',
            learningObjective: 'Construct compelling narratives that enhance understanding and retention while maintaining factual accuracy and relevance.',
            keyTerms: ['storytelling', 'narrative arc', 'character development', 'dramatic structure', 'information embedding', 'story coherence'],
            download: {
              clarification: 'Narrative construction uses story elements—characters, conflict, resolution, causation—to organize and present information. Well-constructed narratives make abstract concepts concrete, create emotional engagement, and provide memorable frameworks for complex information.',
              example: 'Instead of listing features of a product, creating a narrative about a specific user facing a problem, attempting various solutions, discovering the product, and achieving transformation—embedding product information within a compelling story.',
              scenario: 'A change management consultant using narrative to help employees understand organizational transformation—creating a story of the organization as a character facing challenges, making difficult decisions, and emerging stronger, making abstract change concrete and meaningful.',
              recallPrompt: 'What is narrative construction and how does it enhance communication beyond factual reporting? What elements make a narrative effective for information communication?'
            },
            epic: {
              explainPrompt: "Explain narrative construction as a communication strategy. What makes stories particularly effective for conveying complex information?",
              probePrompt: "How do you balance narrative engagement with factual accuracy? When might narrative techniques distort rather than illuminate the truth?",
              implementPrompt: "Transform a factual explanation or data presentation into a narrative: 1) Identify the core information to convey, 2) Create characters or protagonists relevant to the information, 3) Structure conflict and resolution that highlights key points, 4) Embed facts within the story structure, 5) Test whether the narrative enhances understanding or memorability.",
              connectPrompt: "How does narrative construction relate to the 'Sovereign Narrative' concept from the Sovereign Core, extending from personal to communicative storytelling?"
            }
          },
          {
            id: 'feedback_mechanisms',
            title: 'Feedback Mechanisms',
            nodeType: 'strategy',
            shortDefinition: 'The systematic incorporation of recipient responses, questions, and reactions to assess and improve communication effectiveness.',
            learningObjective: 'Design and implement feedback systems that continuously improve communication quality and ensure message reception matches intention.',
            keyTerms: ['communication loops', 'comprehension checking', 'response analysis', 'iterative improvement', 'reception verification', 'adaptive messaging'],
            download: {
              clarification: 'Feedback mechanisms create loops between communicator and audience to verify understanding, identify misinterpretations, and refine messages in real-time or for future communications. This includes both formal feedback systems and real-time adjustments based on audience cues.',
              example: 'A teacher building feedback mechanisms into lessons: asking specific questions to check understanding, monitoring nonverbal cues for confusion, providing multiple ways for students to indicate comprehension, and adjusting explanations based on this feedback.',
              scenario: 'A software company developing user documentation that includes feedback mechanisms—comment systems for users to report confusion, analytics showing where users get stuck, and regular surveys to identify communication gaps.',
              recallPrompt: 'What are feedback mechanisms in communication and why are they essential for effectiveness? How can you build feedback into different types of communication?'
            },
            epic: {
              explainPrompt: "Explain feedback mechanisms in communication. How do they help ensure that the message received matches the message intended?",
              probePrompt: "What barriers prevent people from seeking or receiving feedback on their communication? How can these barriers be overcome?",
              implementPrompt: "Design feedback mechanisms for a type of communication you do regularly: 1) Identify specific aspects you want feedback on, 2) Create methods for gathering feedback (formal and informal), 3) Plan how you'll analyze and respond to feedback, 4) Implement one feedback mechanism this week and reflect on the results.",
              connectPrompt: "How do feedback mechanisms implement the 'Error Tolerance' principle from the Sovereign Core, creating opportunities to learn from and correct communication failures?"
            }
          },
        ], 'communication', 'comm-3'),
      },
      {
        id: 'dialogical_reasoning',
        title: 'Dialogical Reasoning Domain',
        learningGoal: 'Master the principles and practices of productive dialogue, debate, and collaborative communication for mutual understanding and problem-solving.',
        chronicleTheme: 'Engaging in complex dialogue challenges requiring skillful listening, constructive argumentation, and collaborative synthesis across diverse perspectives',
        domainDungeonType: 'empirical_validation_crucible',
        characterAffinities: ['sovereign', 'mirror_tender', 'veritas'],
        specterAffinities: ['projection-specter', 'silence-specter', 'misinterpretation-specter'],
        nodes: addStatusToNodes([
          {
            id: 'active_listening',
            title: 'Advanced Active Listening',
            nodeType: 'strategy',
            shortDefinition: 'Deep, concentrated engagement with speakers that seeks to understand not just words but underlying meaning, emotions, and intentions.',
            learningObjective: 'Practice advanced active listening techniques that create genuine understanding and connection while maintaining appropriate boundaries.',
            keyTerms: ['empathic listening', 'reflective responding', 'clarifying questions', 'paraphrasing', 'presence', 'listening levels'],
            download: {
              clarification: 'Advanced active listening involves full cognitive and emotional engagement with the speaker, seeking to understand their complete message including emotions, values, and unstated assumptions. It requires managing your own reactions and agenda to create space for genuine understanding.',
              example: 'Instead of planning your response while someone speaks, actively listening means: tracking their main points, noticing their emotional state, asking clarifying questions like "When you say \'unfair,\' what specifically felt unjust?", and reflecting back what you understand before responding.',
              scenario: 'A negotiator using advanced active listening to understand the underlying interests behind stated positions—hearing not just "We need a 20% increase" but the concerns about cost of living, recognition, or equity that drive that request.',
              recallPrompt: 'What distinguishes advanced active listening from passive hearing or waiting for your turn to speak? What techniques help achieve this deeper level of listening?'
            },
            epic: {
              explainPrompt: "Explain advanced active listening and how it differs from ordinary listening. What specific techniques help you truly understand another person's complete message?",
              probePrompt: "What internal barriers (judgments, preparing responses, emotional reactions) interfere with active listening? How can these be managed?",
              implementPrompt: "In your next significant conversation, practice advanced active listening: 1) Ask one clarifying question to deepen understanding, 2) Paraphrase one main point to confirm comprehension, 3) Reflect back an emotion you notice, 4) Notice when your attention drifts to planning responses. Document the effects on the conversation.",
              connectPrompt: "How does advanced active listening integrate 'Empathic Resonance' with 'Perspective Taking' to create genuine understanding beyond just hearing words?"
            }
          },
          {
            id: 'constructive_argumentation',
            title: 'Constructive Argumentation',
            nodeType: 'strategy',
            shortDefinition: 'The practice of engaging with disagreement through reasoned discourse aimed at mutual understanding and collaborative truth-seeking rather than winning.',
            learningObjective: 'Develop skills for engaging in arguments that strengthen relationships and advance understanding, even amid significant disagreement.',
            keyTerms: ['steelmanning', 'collaborative reasoning', 'good faith discourse', 'position vs. interest', 'argument charity', 'dialectical thinking'],
            download: {
              clarification: 'Constructive argumentation treats disagreement as an opportunity for collaborative truth-seeking rather than combat. It involves steelmanning (presenting others\' positions in their strongest form), addressing underlying interests rather than just stated positions, and maintaining respect for persons while vigorously engaging with ideas.',
              example: 'In a policy debate, constructive argumentation means: "If I understand your position correctly, you\'re arguing X because you\'re concerned about Y. That\'s a valid concern. Let me explain why I think approach Z addresses Y while also accomplishing goal W..."',
              scenario: 'Two scientists with competing hypotheses engaging in constructive argumentation—carefully stating each other\'s positions, identifying specific points of evidence that favor each theory, collaboratively designing experiments that could distinguish between them.',
              recallPrompt: 'What makes argumentation constructive rather than destructive? How does steelmanning improve the quality of disagreement?'
            },
            epic: {
              explainPrompt: "Explain constructive argumentation and how it differs from typical debate or argument. What is 'steelmanning' and why is it important?",
              probePrompt: "How can you maintain strong disagreement while still being constructive? What's the difference between attacking ideas and attacking persons?",
              implementPrompt: "The next time you disagree with someone on a significant issue: 1) Before stating your position, accurately summarize theirs until they confirm you understand, 2) Identify one valid concern in their position, 3) Present your alternative while acknowledging their concerns, 4) Look for underlying interests you might share.",
              connectPrompt: "How does constructive argumentation apply the logical reasoning skills from the Thinking module within the interpersonal context of disagreement and potential conflict?"
            }
          },
          {
            id: 'collaborative_synthesis',
            title: 'Collaborative Synthesis',
            nodeType: 'strategy',
            shortDefinition: 'The process of integrating diverse perspectives, ideas, and partial truths into greater understanding or novel solutions through dialogue.',
            learningObjective: 'Facilitate and participate in dialogues that combine different viewpoints into new insights, solutions, or frameworks that transcend initial positions.',
            keyTerms: ['perspective integration', 'emergent understanding', 'dialogical thinking', 'synthesis creation', 'collective intelligence', 'conversational alchemy'],
            download: {
              clarification: 'Collaborative synthesis moves beyond compromise or choosing between positions to create new understanding that incorporates the best insights from multiple perspectives. It requires seeing partial truths in different viewpoints and weaving them into more complete understanding.',
              example: 'A design team synthesizing user experience and engineering perspectives—not choosing between "user-friendly" and "technically feasible" but discovering designs that achieve both by integrating insights about what users actually need with new technical approaches.',
              scenario: 'A community group addressing homelessness bringing together formerly homeless individuals, service providers, city planners, and business owners to create solutions that address root causes, practical implementation challenges, and community concerns simultaneously.',
              recallPrompt: 'What is collaborative synthesis and how does it differ from compromise? What enables groups to create new understanding together?'
            },
            epic: {
              explainPrompt: "Explain collaborative synthesis in dialogue. How is creating new understanding together different from choosing between existing positions or compromising?",
              probePrompt: "What conditions enable collaborative synthesis to emerge? What factors prevent it, causing groups to remain stuck in initial positions?",
              implementPrompt: "In a group discussion with differing viewpoints: 1) Listen for partial truths in each position, 2) Identify shared underlying values or concerns, 3) Ask questions that help the group see connections between perspectives, 4) Propose integrations or new possibilities that incorporate multiple insights, 5) Notice what helps or hinders emergence of synthesis.",
              connectPrompt: "How does collaborative synthesis connect to 'Conceptual Blending' from the Thinking module, applying these cognitive principles to group dialogue and problem-solving?"
            }
          },
          {
            id: 'conflict_transformation',
            title: 'Conflict Transformation',
            nodeType: 'strategy',
            shortDefinition: 'The process of changing destructive conflict patterns into constructive engagement that addresses underlying needs and creates stronger relationships.',
            learningObjective: 'Transform conflict from destructive patterns into opportunities for growth, understanding, and collaborative problem-solving.',
            keyTerms: ['conflict reframing', 'underlying needs', 'transformation vs. resolution', 'relationship repair', 'constructive engagement', 'nonviolent communication'],
            download: {
              clarification: 'Conflict transformation goes beyond simply ending disagreement to changing how people relate to each other and address differences. It identifies underlying needs that generate conflict, reframes problems as shared challenges, and builds capacity for future constructive engagement.',
              example: 'Two departments constantly fighting over resources discovering that their underlying need is for autonomy and recognition—leading to restructuring that gives both more control over their domains rather than just negotiating current resource allocation.',
              scenario: 'A mediator helping divorced parents transform ongoing custody battles into collaborative co-parenting by focusing on their shared commitment to children\'s wellbeing and developing communication patterns that honor both parents\' relationships with their children.',
              recallPrompt: 'How does conflict transformation differ from conflict resolution? What role do underlying needs play in transforming conflict?'
            },
            epic: {
              explainPrompt: "Explain conflict transformation and how it differs from simply resolving or ending conflicts. What makes conflicts transformative rather than just resolved?",
              probePrompt: "What are common destructive patterns in conflict that prevent transformation? How can these patterns be interrupted and changed?",
              implementPrompt: "Think of a recurring conflict in your life: 1) Identify the surface disagreement and underlying needs for each party, 2) Reframe the conflict as a shared problem to solve, 3) Generate options that address underlying needs rather than just positions, 4) Consider how this conflict could strengthen rather than damage the relationship if handled well.",
              connectPrompt: "How does conflict transformation apply 'Narrative Resilience' from the Sovereign Core to interpersonal dynamics, creating new stories about relationships despite past difficulties?"
            }
          },
          {
            id: 'consensus_building',
            title: 'Consensus Building',
            nodeType: 'strategy',
            shortDefinition: 'The process of guiding groups toward decision or agreement through inclusive participation, creative problem-solving, and attention to all participants\' core concerns.',
            learningObjective: 'Facilitate group processes that achieve sustainable agreements through addressing all stakeholders\' essential needs rather than majority rule.',
            keyTerms: ['inclusive decision-making', 'stakeholder engagement', 'consensus process', 'creative agreement', 'sustainable decisions', 'participatory dialogue'],
            download: {
              clarification: 'Consensus building creates decisions that all participants can support, not necessarily through unanimous enthusiasm but through addressing everyone\'s core concerns sufficiently that they can commit to the outcome. It requires creative problem-solving to find solutions that work for everyone.',
              example: 'A neighborhood deciding on a park renovation using consensus building—ensuring seniors, families, teenagers, and environmental advocates all have their core needs addressed in the final design through iterative dialogue and creative integration of concerns.',
              scenario: 'A nonprofit board making strategic decisions through consensus building—taking time to understand each member\'s perspective, identifying shared values, creatively addressing concerns, and reaching decisions everyone can support even if not everyone\'s first choice.',
              recallPrompt: 'What is consensus building and how does it differ from majority voting or compromise? What makes consensus decisions more sustainable?'
            },
            epic: {
              explainPrompt: "Explain consensus building as a decision-making process. How does it create more sustainable agreements than voting or executive decision-making?",
              probePrompt: "What are the challenges and limitations of consensus building? When might other decision-making approaches be more appropriate?",
              implementPrompt: "In your next group decision situation: 1) Ensure all voices are heard on their concerns and needs, 2) Look for creative options that address multiple concerns, 3) Check that everyone can commit to supporting the outcome even if it's not their first choice, 4) Notice how this process affects both the decision quality and group relationships.",
              connectPrompt: "How does consensus building apply 'Strategic Cognitive Mode Selection' from the Thinking module to group decision-making, choosing the most appropriate process for the situation and stakeholders?"
            }
          },
          {
            id: 'dialectical_engagement',
            title: 'Dialectical Engagement',
            nodeType: 'principle',
            shortDefinition: 'The practice of holding and working with opposing viewpoints simultaneously to generate new understanding that transcends either position alone.',
            learningObjective: 'Develop capacity for dialectical thinking that generates new insights through the creative tension between opposing perspectives.',
            keyTerms: ['thesis-antithesis-synthesis', 'both/and thinking', 'paradox navigation', 'creative tension', 'integrative thinking', 'higher order solutions'],
            download: {
              clarification: 'Dialectical engagement involves holding opposing viewpoints in creative tension rather than immediately choosing sides or seeking quick resolution. This tension generates new insights and possibilities that transcend the initial opposition through synthesis.',
              example: 'In business strategy, dialectically engaging with the tension between innovation and stability—not choosing one or compromising between them, but finding approaches that achieve breakthrough innovation through disciplined, stable processes.',
              scenario: 'A therapist using dialectical engagement to help clients work with internal contradictions—simultaneously accepting themselves as they are while working toward change, finding ways to honor both self-acceptance and growth impulses.',
              recallPrompt: 'What is dialectical engagement and how does it differ from choosing between opposites or finding compromise? What does it mean to hold contradictions in creative tension?'
            },
            epic: {
              explainPrompt: "Explain dialectical engagement and how it creates new understanding through working with oppositions. What makes this different from compromise or choosing sides?",
              probePrompt: "When is dialectical engagement most valuable, and when might it be inefficient or inappropriate? How do you know when synthesis emerges versus when you're just avoiding decision?",
              implementPrompt: "Identify a current dilemma where you feel torn between two seemingly opposite approaches: 1) Articulate each side's strengths and validity, 2) Explore how both might be true or necessary in different ways, 3) Look for creative integrations that honor both poles, 4) Notice what new possibilities emerge from holding the tension rather than resolving it quickly.",
              connectPrompt: "How does dialectical engagement connect to the 'Non-Contradiction' principle from AXIOMOS, not by eliminating contradictions but by finding higher-level frameworks that integrate them?"
            }
          },
          {
            id: 'strategic_questioning',
            title: 'Strategic Questioning',
            nodeType: 'strategy',
            shortDefinition: 'The skillful use of questions to deepen understanding, reveal assumptions, guide thinking processes, and facilitate discovery.',
            learningObjective: 'Master various questioning techniques to enhance dialogue, promote critical thinking, and facilitate insight in yourself and others.',
            keyTerms: ['socratic questioning', 'powerful questions', 'question sequences', 'assumption surfacing', 'generative inquiry', 'metacognitive prompts'],
            download: {
              clarification: 'Strategic questioning uses carefully chosen questions not just to gather information but to stimulate thinking, uncover hidden assumptions, guide dialogue direction, and help people discover insights for themselves. Different types of questions serve different purposes in dialogue.',
              example: 'Instead of saying "You\'re wrong about that policy," using strategic questioning: "What outcomes do you expect from that policy? What assumptions about human behavior does it rely on? What might happen if those assumptions don\'t hold? What alternative approaches might achieve similar outcomes?"',
              scenario: 'A coach using strategic questioning to help a client work through challenges—not providing answers but asking questions that help the client explore their situation, uncover their own insights, and generate solutions aligned with their values and goals.',
              recallPrompt: 'What makes questioning strategic rather than just curiosity? How do questions guide thinking and dialogue in ways that statements cannot?'
            },
            epic: {
              explainPrompt: "Explain strategic questioning and how it differs from simple information-gathering. What makes some questions more powerful than others for facilitating insight?",
              probePrompt: "How can questions be misused to manipulate rather than facilitate understanding? What's the difference between leading questions and genuinely open inquiry?",
              implementPrompt: "Practice strategic questioning in conversations this week: 1) When someone makes a strong claim, ask about underlying assumptions, 2) Use questions to help others explore their own thinking rather than arguing with them, 3) Notice how different types of questions (what, how, why, what if) generate different kinds of exploration, 4) Reflect on how questioning changed the quality of dialogue.",
              connectPrompt: "How does strategic questioning implement 'Socratic Method' principles from classical philosophy, adapted for modern dialogical engagement and collaborative thinking?"
            }
          },
        ], 'communication', 'comm-4'),
      },
    ],
};