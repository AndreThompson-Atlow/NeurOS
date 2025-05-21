import type { Module, ModuleType } from '@/types/neuro';
import { addStatusToNodes } from './_common';

export const machiavelliStateModuleData: Omit<Module, 'status'> = {
    id: 'machiavellian-state',
    type: 'auxiliary',
    title: 'Machiavellian Statecraft: The Architecture of Power',
    description: 'Master the timeless principles of acquiring, consolidating, and maintaining power as articulated by Niccolò Machiavelli in The Prince.',
    moduleLearningGoal: 'To understand and apply Machiavellian principles of effective leadership, strategic thinking, and power dynamics, drawing from historical examples to navigate modern challenges in governance, organizations, and influence.',
    tags: ['power', 'leadership', 'strategy', 'politics', 'pragmatism', 'statecraft'],
    dependencies: ['chronology'],
    alignmentBias: 'neutral',
    defaultCompanion: 'praxis',
    associatedSpecters: ['power-specter', 'adaptation-specter', 'moral-ambiguity-specter', 'control-specter'],
    recommendedChronicleDungeon: 'The Court of Mirrors',
    moduleCategory: ['Political Philosophy', 'Strategic Leadership', 'Power Dynamics'],
    reviewProfile: {
      decayModel: 'performance_adaptive',
      reviewClusters: [
        ['principality_types', 'acquisition_methods', 'hereditary_vs_new'],
        ['virtu_concept', 'fortuna_management', 'timing_adaptation'],
        ['army_types', 'military_leadership', 'defensive_strategies'],
        ['princely_character', 'strategic_communication', 'reputation_management']
      ],
      interleaveRatio: 0.3
    },
    domains: [
      {
        id: 'principality_foundations',
        title: 'Principality Foundations',
        learningGoal: 'Understand the different types of states and principalities, their inherent challenges, and the strategic approaches required for each.',
        chronicleTheme: 'Navigating territorial acquisition scenarios and learning to distinguish between different governance structures and their strategic implications.',
        domainDungeonType: 'territorial_strategy_chamber',
        characterAffinities: ['chronicler', 'praxis', 'architect'],
        specterAffinities: ['power-specter', 'control-specter'],
        nodes: addStatusToNodes([
          {
            id: 'principality_types',
            title: 'Principality Classification',
            nodeType: 'concept',
            shortDefinition: 'The systematic categorization of states into republics and principalities, with principalities further divided into hereditary, mixed, and entirely new forms.',
            learningObjective: 'Analyze different types of political structures and identify the unique challenges and opportunities each presents for governance.',
            keyTerms: ['republicanism', 'hereditary principality', 'mixed principality', 'new principality', 'territorial annexation', 'political taxonomy'],
            download: {
              clarification: 'Machiavelli begins The Prince by establishing a clear taxonomy of states. All states are either republics (where power rests with the people through representatives) or principalities (where power rests with a single ruler). Principalities subdivide into hereditary (ruled by the same family for generations), mixed (new territories annexed to existing states), and entirely new (created from scratch or conquered completely).',
              example: 'The Duchy of Ferrara represents a hereditary principality that survived attacks from Venice and Pope Julius II due to established traditions. France under Louis XII attempting to control Milan represents a mixed principality scenario, where new territory is grafted onto an existing state.',
              scenario: 'A tech company acquiring a startup faces mixed principality challenges—integrating new culture and systems while maintaining the parent company\'s governance. An entrepreneur starting fresh faces new principality challenges—building legitimacy and structure from nothing.',
              recallPrompt: 'What are the three types of principalities Machiavelli identifies, and why does he argue that new principalities are most difficult to maintain?'
            },
            epic: {
              explainPrompt: "Explain Machiavelli's classification of principalities and why he focuses primarily on new principalities rather than republics or hereditary states.",
              probePrompt: "How might modern organizational structures (corporate acquisitions, political unions, startup creation) map onto Machiavelli's principality types? What are the contemporary equivalents of his examples?",
              implementPrompt: "Identify a current political or organizational situation and classify it according to Machiavelli's taxonomy. Analyze what specific challenges this classification suggests and what historical examples might provide guidance.",
              connectPrompt: "How does 'Path Dependence' from Chronology illuminate why hereditary principalities are easier to maintain than new ones?"
            }
          },
          {
            id: 'acquisition_methods',
            title: 'Methods of Acquisition',
            nodeType: 'strategy',
            shortDefinition: 'The various ways power can be acquired: through one\'s own arms and ability, through fortune and foreign aid, through crime, or through favor of fellow citizens.',
            learningObjective: 'Evaluate different pathways to power and their implications for long-term stability and governance effectiveness.',
            keyTerms: ['merit-based acquisition', 'fortune-dependent acquisition', 'criminal acquisition', 'civic appointment', 'legitimacy sources', 'power consolidation'],
            download: {
              clarification: 'Machiavelli identifies four primary ways to acquire principalities: through personal virtue and capability (like Francesco Sforza), through luck or others\' support (like Cesare Borgia), through criminal means (like Agathocles), or through fellow citizens\' favor (like civic principalities). Each method creates different challenges for maintaining power.',
              example: 'Francesco Sforza conquered Milan through military skill and political acumen—difficult to achieve but easy to maintain. Cesare Borgia gained power through his father Pope Alexander VI\'s influence—easy to acquire but harder to maintain once the supporting power vanished.',
              scenario: 'A CEO appointed by a board faces similar challenges to Borgia—power dependent on others\' continued support. An entrepreneur who builds a company from scratch faces Sforza-like challenges—harder to achieve but more secure once established.',
              recallPrompt: 'What are the four methods of acquiring power according to Machiavelli, and why is power acquired through one\'s own virtue easier to maintain than power gained through fortune?'
            },
            epic: {
              explainPrompt: "Describe Machiavelli's four methods of acquiring principalities. How does the method of acquisition affect the ease of maintaining power?",
              probePrompt: "What ethical tensions arise from Machiavelli's inclusion of criminal acquisition as a legitimate route to power? How does he distinguish between effective and ineffective criminal acquisition?",
              implementPrompt: "Analyze a contemporary leader's rise to power using Machiavelli's categories. Predict potential challenges they might face based on their acquisition method and suggest strategies for consolidation.",
              connectPrompt: "How does 'Strategic Foresight' from Chronology apply to choosing the most sustainable method of power acquisition for long-term success?"
            }
          },
          {
            id: 'hereditary_vs_new',
            title: 'Hereditary vs. New Principalities',
            nodeType: 'principle',
            shortDefinition: 'The fundamental distinction between states with established traditions and those requiring active construction of legitimacy and governance systems.',
            learningObjective: 'Understand why traditional authority differs from entrepreneurial leadership and develop strategies appropriate to each context.',
            keyTerms: ['traditional authority', 'established legitimacy', 'institutional momentum', 'change resistance', 'legacy systems', 'innovation adaptation'],
            download: {
              clarification: 'Hereditary principalities enjoy natural advantages: subjects are accustomed to the ruling family, institutions are established, and only gross incompetence threatens stability. New principalities face constant challenges: subjects have no habitual loyalty, every decision faces scrutiny, and rivals actively work to destabilize the new order.',
              example: 'A monarch inheriting a throne needs only maintain existing systems and avoid egregious errors. A revolutionary leader or corporate turnaround CEO must actively build legitimacy, restructure systems, and overcome resistance from those loyal to the old order.',
              scenario: 'Taking over a family business represents hereditary principality advantages—established relationships, known processes, customer loyalty. Leading a startup or merger represents new principality challenges—building trust, establishing processes, creating culture.',
              recallPrompt: 'Why does Machiavelli argue that it\'s easier to rule a hereditary principality than a new one? What specific advantages do hereditary rulers possess?'
            },
            epic: {
              explainPrompt: "Why does Machiavelli spend little time on hereditary principalities? What inherent advantages do they possess that new principalities must actively create?",
              probePrompt: "How might hereditary principalities become vulnerable during periods of rapid change? When might their traditional advantages become liabilities?",
              implementPrompt: "Compare a situation where you entered an established system (hereditary) versus one where you had to build from scratch (new). What different challenges and strategies were required?",
              connectPrompt: "How does 'Cultural Time Orientations' from Chronology explain why subjects in hereditary principalities are more accepting of traditional authority?"
            }
          },
          {
            id: 'mixed_principalities',
            title: 'Mixed Principalities & Integration',
            nodeType: 'strategy',
            shortDefinition: 'Strategies for successfully integrating new territories or entities with existing power structures while managing conflicting loyalties and systems.',
            learningObjective: 'Master techniques for merging different organizational cultures, managing dual loyalties, and preventing integration challenges from destabilizing overall power.',
            keyTerms: ['territorial integration', 'cultural assimilation', 'dual loyalties', 'colonial administration', 'systematic occupation', 'native collaboration'],
            download: {
              clarification: 'Mixed principalities arise when new territory is added to existing states—like mergers, acquisitions, or territorial conquest. Success requires carefully managing the integration: maintaining loyalty in original territory while building it in new areas, adapting systems without destroying effective existing structures.',
              example: 'Louis XII of France failed in Italy by not moving his court there, relying on weak local allies, and strengthening potential rivals like the Pope and Venice. Romans succeeded by establishing colonies, protecting weak neighbors, and systematically weakening strong local powers.',
              scenario: 'Corporate mergers face mixed principality challenges: integrating different cultures, maintaining loyalty of both workforces, deciding which systems to standardize. International expansion requires similar careful balance of local adaptation and corporate control.',
              recallPrompt: 'What are the key strategies Machiavelli recommends for successfully managing mixed principalities, and why did France fail in Italy while Rome succeeded in its conquests?'
            },
            epic: {
              explainPrompt: "Analyze Machiavelli's advice for managing mixed principalities. What specific mistakes does he identify in French policy toward Italy?",
              probePrompt: "How do modern concepts like cultural sensitivity and stakeholder management relate to Machiavelli's advice about mixed principalities? What has changed and what remains constant?",
              implementPrompt: "Design a strategy for integrating a new department, subsidiary, or territory into an existing organization using Machiavellian principles. Address potential resistance and loyalty conflicts.",
              connectPrompt: "How does 'System Boundaries' from the Sovereign Core help understand the challenges of managing mixed principalities with overlapping jurisdictions and loyalties?"
            }
          },
          {
            id: 'roman_model',
            title: 'The Roman Model',
            nodeType: 'concept',
            shortDefinition: 'The systematic approach to expansion and integration that made Rome successful: establishing colonies, protecting weak allies, weakening strong rivals, and avoiding empowerment of foreign powers.',
            learningObjective: 'Apply Roman strategic principles to modern contexts of expansion, influence, and competitive advantage.',
            keyTerms: ['colonial strategy', 'strategic alliances', 'systematic weakening', 'foreign influence limitation', 'divided authority', 'imperial administration'],
            download: {
              clarification: 'Machiavelli uses Rome as his model for successful expansion. Romans established colonies rather than garrisons (cheaper, more loyal), protected weaker neighbors against stronger ones (preventing powerful coalitions), systematically weakened potential rivals, and never allowed foreign powers to gain influence in their territories.',
              example: 'Rome protected smaller Italian city-states against ambitious rivals like Syracuse, preventing any single power from becoming strong enough to challenge Roman authority. They avoided empowering foreign kings who might later become rivals, unlike France which foolishly strengthened Venice against Milan.',
              scenario: 'Tech companies use Roman-like strategies: establishing satellite offices (colonies), partnering with smaller firms against larger competitors, acquiring potential rivals before they become threats, and preventing competitors from gaining influence in their key markets.',
              recallPrompt: 'What four principles made Roman expansion successful according to Machiavelli, and how did France violate these principles in Italy?'
            },
            epic: {
              explainPrompt: "Detail the Roman model of expansion that Machiavelli praises. How did Romans balance control with local autonomy to maintain stable rule over diverse territories?",
              probePrompt: "What are the ethical implications of the Roman model? How might its principles apply to or conflict with modern ideas of sovereignty and self-determination?",
              implementPrompt: "Apply Roman principles to a modern expansion strategy (business, political, or organizational). How would you establish 'colonies,' protect weak allies, and weaken rivals?",
              connectPrompt: "How does 'Historical Analogical Reasoning' from Chronology support Machiavelli's use of Roman examples to guide contemporary strategic thinking?"
            }
          },
          {
            id: 'foreign_invasion_defense',
            title: 'Defense Against Foreign Invasion',
            nodeType: 'strategy',
            shortDefinition: 'Systematic methods for preventing foreign powers from gaining footholds in your territory and managing the threat of external intervention.',
            learningObjective: 'Develop defensive strategies that prevent competitors from establishing bases of operation within your sphere of influence.',
            keyTerms: ['invasion prevention', 'foreign interference', 'internal collaboration', 'defensive alliances', 'preemptive action', 'territorial intelligence'],
            download: {
              clarification: 'Foreign invasion succeeds when internal dissatisfaction creates collaborators who invite outside intervention. Defense requires monitoring internal sentiment, identifying potential collaborators, maintaining loyalty through good governance, and preventing external powers from establishing local connections.',
              example: 'Alexander conquered Persian Empire easily because internal dissent created willing collaborators. Romans prevented such scenarios by granting citizenship to loyal subjects and swift punishment for treason, making foreign-supported rebellions less attractive.',
              scenario: 'Corporate hostile takeovers often succeed when internal stakeholders (board members, managers, shareholders) become dissatisfied with current leadership. Defense requires maintaining stakeholder satisfaction and identifying potential defectors early.',
              recallPrompt: 'How do foreign invasions typically succeed according to Machiavelli, and what preventive measures can rulers take to avoid internal collaboration with foreign powers?'
            },
            epic: {
              explainPrompt: "Explain Machiavelli's analysis of how foreign invasions succeed and what defensive strategies he recommends.",
              probePrompt: "How do information warfare and cyber-security concerns in the modern era relate to Machiavelli's warnings about foreign intervention?",
              implementPrompt: "Analyze a modern case of foreign intervention (political, economic, or corporate) using Machiavellian principles. What internal factors enabled external success?",
              connectPrompt: "How does 'Intent Recognition' from Communication help identify potential internal collaborators with foreign powers before they become threats?"
            }
          },
        ], 'machiavellian-state', 'mach-1'),
      },
      {
        id: 'virtu_fortuna',
        title: 'Virtù and Fortuna',
        learningGoal: 'Master the dynamic relationship between personal capability (virtù) and circumstantial fortune (fortuna) in achieving and maintaining power.',
        chronicleTheme: 'Testing ability to recognize and seize opportunities while building capabilities that can master changing circumstances.',
        domainDungeonType: 'fortune_control_arena',
        characterAffinities: ['praxis', 'sovereign', 'ekitty'],
        specterAffinities: ['adaptation-specter', 'control-specter', 'uncertainty-specter'],
        nodes: addStatusToNodes([
          {
            id: 'virtu_concept',
            title: 'Virtù - Political Effectiveness',
            nodeType: 'concept',
            shortDefinition: 'The quality combining intelligence, capability, adaptability, and willingness to act decisively—whatever the moral cost—to achieve political objectives.',
            learningObjective: 'Develop the practical wisdom and flexibility necessary to adapt strategies to circumstances while maintaining effectiveness.',
            keyTerms: ['political virtue', 'adaptability', 'strategic flexibility', 'practical wisdom', 'effectual action', 'moral flexibility'],
            download: {
              clarification: 'Virtù is not traditional moral virtue but practical effectiveness in politics. It combines intelligence, adaptability, foresight, decisiveness, and the flexibility to act morally or immorally as circumstances require. Virtù enables the prince to respond appropriately to changing conditions and seize opportunities.',
              example: 'Cesare Borgia demonstrated virtù by quickly consolidating power, eliminating rivals, establishing efficient governance, and adapting his methods to different situations—showing mercy when it built loyalty, cruelty when it ensured order.',
              scenario: 'A crisis manager shows virtù by adapting communication style to different stakeholders, making tough decisions quickly, and using both collaborative and authoritative approaches as situations demand—prioritizing organizational survival over personal comfort.',
              recallPrompt: 'How does Machiavellian virtù differ from traditional moral virtue, and what qualities does it encompass for effective political leadership?'
            },
            epic: {
              explainPrompt: "Define Machiavellian virtù and explain why it differs from conventional moral virtue. What makes it essential for political effectiveness?",
              probePrompt: "How might virtù be developed? What practices or experiences cultivate the flexibility and judgment it requires?",
              implementPrompt: "Identify a leadership challenge you've faced or observed. Analyze how virtù would approach it differently from conventional moral leadership. What trade-offs would be necessary?",
              connectPrompt: "How does 'Adaptive Cognitive Flexibility' from Thinking provide the mental foundation for developing Machiavellian virtù?"
            }
          },
          {
            id: 'fortuna_management',
            title: 'Fortuna - Managing Uncertain Circumstances',
            nodeType: 'principle',
            shortDefinition: 'The understanding that fortune controls roughly half of human affairs, but can be influenced through preparation, bold action, and adaptive response to changing circumstances.',
            learningObjective: 'Learn to prepare for uncertainty, recognize opportunities within chaos, and take bold action when fortune presents openings.',
            keyTerms: ['circumstantial luck', 'opportunity recognition', 'preparation meets opportunity', 'bold action', 'adaptive timing', 'uncertainty navigation'],
            download: {
              clarification: 'Fortuna represents the external circumstances and chance events that affect political success. While uncontrollable, fortuna can be partially managed through preparation (building capabilities before crises), quick recognition of opportunities, and bold action when circumstances align favorably.',
              example: 'Cesare Borgia prepared for his father\'s death by building independent power bases, but couldn\'t control the timing of Alexander VI\'s death or his own illness. His misfortune came from failing to prevent the election of Pope Julius II, who opposed the Borgias.',
              scenario: 'Market crashes represent fortuna for businesses—unpredictable but manageable through preparation (cash reserves, diversified revenue), opportunity recognition (acquiring distressed assets), and bold action (expanding when competitors retreat).',
              recallPrompt: 'How does Machiavelli describe the relationship between fortuna and human agency, and what metaphors does he use to explain how fortune can be managed?'
            },
            epic: {
              explainPrompt: "Explain Machiavelli's concept of fortuna and his famous river metaphor. How can humans prepare for and respond to fortune's variations?",
              probePrompt: "What is problematic about Machiavelli's gendered description of fortune? How might we update his insights while rejecting harmful metaphors?",
              implementPrompt: "Analyze a time when external circumstances (fortuna) significantly impacted your plans. How could better preparation or bolder action have changed the outcome?",
              connectPrompt: "How does 'Temporal Risk Assessment' from Chronology provide tools for preparing against fortuna's potential disruptions?"
            }
          },
          {
            id: 'timing_adaptation',
            title: 'Timing and Adaptation',
            nodeType: 'strategy',
            shortDefinition: 'The critical ability to match one\'s actions and style to the demands of current circumstances, being bold when times favor boldness, cautious when caution is needed.',
            learningObjective: 'Develop sensitivity to timing and the ability to adapt leadership style and strategies to match changing environmental demands.',
            keyTerms: ['situational adaptation', 'temporal sensitivity', 'strategic timing', 'contextual leadership', 'environmental reading', 'behavioral flexibility'],
            download: {
              clarification: 'Successful leaders must adapt their approach to circumstances—being audacious when opportunities arise, cautious when risks are high, generous when it builds loyalty, strict when discipline is needed. Few leaders manage this adaptation well, often sticking to one style regardless of context.',
              example: 'Pope Julius II succeeded through impetuosity—launching military campaigns and taking bold political actions. Had he lived longer and faced different circumstances requiring caution, his inflexibility might have led to failure, as his enemies waited for such an opportunity.',
              scenario: 'Tech leaders must adapt timing—moving quickly in emerging markets, patiently building capability in established ones, pivoting boldly when disruption occurs, conserving resources during downturns.',
              recallPrompt: 'Why does Machiavelli argue that few leaders successfully adapt their behavior to changing times, and what does he mean by matching one\'s nature to the quality of the times?'
            },
            epic: {
              explainPrompt: "Describe Machiavelli's analysis of how successful leaders must adapt their methods to changing circumstances. Why is this adaptation so difficult?",
              probePrompt: "How might personality assessment tools and situational leadership theories relate to Machiavelli's insights about adaptation to circumstances?",
              implementPrompt: "Reflect on a leader you admire. How well do they adapt their style to different situations? Identify one area where greater adaptation might improve their effectiveness.",
              connectPrompt: "How does 'Cultural Orientations to Time' from Chronology influence what timing approaches work in different cultural contexts?"
            }
          },
          {
            id: 'cesare_borgia_model',
            title: 'Cesare Borgia - The Virtù Exemplar',
            nodeType: 'concept',
            shortDefinition: 'The case study of Cesare Borgia as the near-perfect example of how virtù can rapidly consolidate power, manage complex territories, and adapt to changing circumstances.',
            learningObjective: 'Analyze how effective leadership combines strategic planning, tactical flexibility, and decisive action through Borgia\'s successes and ultimate failure.',
            keyTerms: ['rapid consolidation', 'systematic governance', 'rival elimination', 'popular support', 'dependency management', 'institutional building'],
            download: {
              clarification: 'Cesare Borgia exemplifies virtù through his rapid conquest of Romagna, efficient governance, strategic elimination of rivals, building popular support, and attempting to create independent power bases. His failure came from dependency on papal power and inability to control the papal succession.',
              example: 'Borgia pacified Romagna by appointing the cruel Remirro de Orco to suppress chaos, then dramatically executed him when order was restored—showing both decisive action and adaptation to public sentiment. He eliminated potential rivals while building loyalty among former enemies.',
              scenario: 'A turnaround CEO might follow Borgia\'s model: making hard decisions quickly, removing ineffective managers, building new systems, winning over previously hostile stakeholders, while working to reduce dependence on original supporters.',
              recallPrompt: 'What specific actions demonstrated Cesare Borgia\'s virtù, and what factors beyond his control ultimately led to his downfall?'
            },
            epic: {
              explainPrompt: "Analyze Cesare Borgia as Machiavelli's model of virtù. What specific strategies and actions made him exemplary, and how did fortune ultimately defeat him?",
              probePrompt: "What ethical questions arise from Machiavelli's admiration for Borgia's methods? How do we evaluate effectiveness separately from morality?",
              implementPrompt: "Apply Borgia's methods to a modern leadership challenge: rapid organizational change, entering a new market, or managing a crisis. What would be the 'Borgian' approach?",
              connectPrompt: "How does 'Retrospective Analysis' from Chronology help us understand both Borgia's successes and the lessons from his eventual failure?"
            }
          },
          {
            id: 'criminal_acquisition',
            title: 'Criminal Acquisition of Power',
            nodeType: 'concept',
            shortDefinition: 'The analysis of how power gained through criminal means can be legitimized through subsequent good governance and strategic cruelty management.',
            learningObjective: 'Understand how illegitimate origins of power can be overcome through effective governance, while recognizing the ethical implications of such analysis.',
            keyTerms: ['illegitimate power', 'post-facto legitimization', 'strategic cruelty', 'cruelty timing', 'benefit distribution', 'reputation rehabilitation'],
            download: {
              clarification: 'Machiavelli analyzes how rulers who gain power through crime can maintain it through well-executed cruelty (done all at once, then ended) followed by consistent benefits to subjects. The key is completing all necessary cruelty quickly, then showing sustained benevolence.',
              example: 'Agathocles of Syracuse murdered fellow citizens and senators to seize power, then ruled effectively for many years. Oliverotto da Fermo eliminated political rivals but was eventually killed by Cesare Borgia, showing how criminal acquisition creates vulnerabilities.',
              scenario: 'Corporate raiders who acquire companies through hostile takeovers must quickly implement all painful changes (layoffs, restructuring) then focus on building value for remaining stakeholders to legitimize their leadership.',
              recallPrompt: 'According to Machiavelli, what distinguishes successful from unsuccessful criminal acquisition of power, and why is the timing of cruelty crucial?'
            },
            epic: {
              explainPrompt: "Examine Machiavelli's analysis of criminal acquisition of power. What does he mean by 'cruelties well used' versus 'badly used'?",
              probePrompt: "How do we grapple with Machiavelli's clinical analysis of criminal paths to power? What are the dangers of treating such analysis as guidance rather than historical observation?",
              implementPrompt: "Analyze a historical or contemporary case where power was gained through questionable means. How did the subsequent actions determine long-term legitimacy?",
              connectPrompt: "How does 'Narrative Resilience' from the Sovereign Core explain how leaders can reconstruct their legitimacy after controversial actions?"
            }
          },
          {
            id: 'fortune_preparation',
            title: 'Preparing for Fortune\'s Variations',
            nodeType: 'strategy',
            shortDefinition: 'Building capabilities, relationships, and resources during favorable times to weather future adversity and capitalize on unexpected opportunities.',
            learningObjective: 'Develop systematic approaches to preparation that increase resilience against negative fortune and readiness to exploit positive fortune.',
            keyTerms: ['scenario preparation', 'capability building', 'relationship investment', 'resource accumulation', 'opportunity readiness', 'resilience development'],
            download: {
              clarification: 'Like building dikes before floods, wise leaders prepare for fortune\'s changes by developing diverse capabilities, building broad coalitions, accumulating resources, and creating multiple contingency plans. Preparation enables both defense against bad fortune and rapid action when good fortune appears.',
              example: 'Machiavelli himself exemplifies preparation—his diplomatic experience with various rulers provided material for The Prince, showing how systematic observation and analysis create lasting value beyond immediate circumstances.',
              scenario: 'Successful entrepreneurs prepare for market volatility by maintaining cash reserves, developing multiple revenue streams, building diverse networks, and continuously updating skills—enabling them to survive downturns and quickly exploit new opportunities.',
              recallPrompt: 'How does Machiavelli\'s dike and embankment metaphor explain the relationship between preparation and fortune, and what specific preparations does he recommend?'
            },
            epic: {
              explainPrompt: "Elaborate on Machiavelli's advice for preparing for fortune's variations. How can leaders build 'dikes and embankments' against future disruption?",
              probePrompt: "What balance is needed between preparing for fortune and becoming so risk-averse that opportunities are missed? How do you avoid over-preparation?",
              implementPrompt: "Assess your current 'fortune preparations' in one area of life (career, business, relationships). What additional preparations would increase your resilience and opportunity-readiness?",
              connectPrompt: "How does 'Adaptive Contingency Planning' from Chronology provide systematic methods for the fortune preparation Machiavelli advocates?"
            }
          },
        ], 'machiavellian-state', 'mach-2'),
      },
      {
        id: 'military_leadership',
        title: 'Military Leadership & Defense',
        learningGoal: 'Master the principles of military organization, leadership, and strategic defense as Machiavelli viewed them as fundamental to all political power.',
        chronicleTheme: 'Commanding diverse military formations and defending against various threats while building lasting military strength.',
        domainDungeonType: 'strategic_warfare_academy',
        characterAffinities: ['praxis', 'sentinel', 'architect'],
        specterAffinities: ['dependence-specter', 'vulnerability-specter', 'control-specter'],
        nodes: addStatusToNodes([
          {
            id: 'army_types',
            title: 'Types of Armies',
            nodeType: 'concept',
            shortDefinition: 'The classification of military forces into native, mercenary, auxiliary, and mixed armies, with analysis of their relative reliability and effectiveness.',
            learningObjective: 'Evaluate different forms of military organization and understand why native forces are superior to hired or borrowed armies.',
            keyTerms: ['native armies', 'mercenary forces', 'auxiliary troops', 'mixed armies', 'military loyalty', 'force reliability'],
            download: {
              clarification: 'Machiavelli identifies four types of armies: native troops (your own citizens), mercenaries (hired professionals), auxiliaries (borrowed from allies), and mixed (combinations). Native troops are most reliable because they fight for their own state, while mercenaries lack commitment and auxiliaries serve foreign interests.',
              example: 'Italian city-states fell to foreign invasions partly because they relied on unreliable mercenary condottieri who avoided real battles to preserve their forces. Swiss and German native militias proved far more effective than Italian hired professionals.',
              scenario: 'Companies using entirely contracted workers face mercenary-like problems—limited loyalty, higher costs, knowledge drain. Organizations with strong internal cultures and career development (native forces) show greater resilience and effectiveness.',
              recallPrompt: 'What are the four types of armies according to Machiavelli, and why does he argue that native armies are superior to all alternatives?'
            },
            epic: {
              explainPrompt: "Analyze Machiavelli's classification of army types. Why does he consider mercenaries and auxiliaries 'useless and dangerous'?",
              probePrompt: "How do modern concepts like contractor dependency, cultural alignment, and organizational loyalty relate to Machiavelli's analysis of army types?",
              implementPrompt: "Assess an organization's 'army composition'—what percentage of key functions rely on contractors, temporary workers, or borrowed resources? How might this affect resilience?",
              connectPrompt: "How does 'Social Dynamics' from Communication explain why native armies develop stronger cohesion and fighting effectiveness than mercenary forces?"
            }
          },
          {
            id: 'military_leadership',
            title: 'Princely Military Leadership',
            nodeType: 'principle',
            shortDefinition: 'The necessity for leaders to personally understand military affairs, study warfare continuously, and command respect through military competence.',
            learningObjective: 'Recognize the importance of strategic and tactical knowledge for effective leadership, even in non-military contexts.',
            keyTerms: ['military competence', 'strategic studies', 'tactical knowledge', 'leadership credibility', 'warrior-philosopher', 'defensive readiness'],
            download: {
              clarification: 'Leaders must understand the tools of their trade—for princes, this means military affairs. Machiavelli insists rulers study warfare constantly, understand terrain and tactics, learn from military history, and maintain credibility with armed forces through demonstrated competence.',
              example: 'Roman generals rose through military ranks and studied warfare extensively. By contrast, princes who ignored military affairs could not command respect, make sound strategic decisions, or effectively defend their territories.',
              scenario: 'CEOs must understand their industry\'s competitive dynamics, operational realities, and market forces. Leaders who lack practical knowledge of their organization\'s core functions cannot make informed decisions or earn team respect.',
              recallPrompt: 'Why does Machiavelli insist that princes must study military affairs, and how should they prepare during peacetime for wartime challenges?'
            },
            epic: {
              explainPrompt: "Explain Machiavelli's insistence that princes must be students of military affairs. How does this principle extend beyond literal warfare?",
              probePrompt: "In what ways might modern leaders apply the principle of 'studying warfare' to their domains? What constitutes 'military knowledge' for non-military leaders?",
              implementPrompt: "Identify the 'military knowledge' most relevant to your field or role. How well do you understand the strategic and tactical fundamentals? Create a learning plan to strengthen crucial areas.",
              connectPrompt: "How does 'Strategic Foresight' from Chronology parallel Machiavelli's advice about studying warfare to prepare for future conflicts?"
            }
          },
          {
            id: 'defensive_strategies',
            title: 'Defensive Strategies',
            nodeType: 'strategy',
            shortDefinition: 'Methods for protecting principalities including fortress construction, alliance management, and maintaining subjects\' loyalty as the best defense.',
            learningObjective: 'Develop comprehensive defensive thinking that combines physical, political, and social elements to protect against various threats.',
            keyTerms: ['fortress strategy', 'alliance systems', 'subject loyalty', 'deterrence mechanisms', 'defensive positioning', 'strategic depth'],
            download: {
              clarification: 'Defense requires multiple layers: physical fortifications, strategic alliances, and most importantly, subjects\' loyalty. Fortresses can become prisons if subjects hate you, but are valuable if they love you. The best fortress is not having enemies.',
              example: 'The Count of Forlì\'s fortress saved his children during popular uprising but couldn\'t save him—showing how fortresses work best when combined with popular support. Strong alliances deter attacks but create dependencies.',
              scenario: 'Companies defend through intellectual property (fortresses), industry partnerships (alliances), and employee loyalty (subject support). All three work together—legal protection is useless if employees leak secrets to competitors.',
              recallPrompt: 'According to Machiavelli, what is the most important element of defense, and when are fortresses useful versus dangerous for a prince?'
            },
            epic: {
              explainPrompt: "Describe Machiavelli's multi-layered approach to defensive strategy. Why does he emphasize political and social defenses over purely military ones?",
              probePrompt: "How do modern cybersecurity and organizational security concepts relate to Machiavelli's advice about fortresses and defensive strategies?",
              implementPrompt: "Analyze your organization's or personal 'defensive strategies.' How well do you balance different types of protection? Where are the vulnerabilities?",
              connectPrompt: "How does 'Sovereign Boundaries' from the Sovereign Core relate to establishing clear defensive perimeters in various domains?"
            }
          },
          {
            id: 'mercenary_problems',
            title: 'The Mercenary Problem',
            nodeType: 'principle',
            shortDefinition: 'The systematic analysis of why hired forces lack the motivation, loyalty, and fighting spirit necessary for reliable military service.',
            learningObjective: 'Understand how incentive misalignment and divided loyalties create unreliability in outsourced critical functions.',
            keyTerms: ['incentive misalignment', 'divided loyalties', 'professional soldiers', 'contractor reliability', 'outsourcing risks', 'motivation structures'],
            download: {
              clarification: 'Mercenaries serve multiple masters and preserve their ability to fight for others. Their incentives misalign with employers—they prefer prolonged, low-risk conflicts over decisive battles. Without patriotic motivation, they lack the commitment necessary for supreme efforts.',
              example: 'Italian condottieri would stage elaborate mock battles with minimal casualties, prolonging conflicts to maintain employment. When faced with truly committed foreign armies, these professionals quickly collapsed.',
              scenario: 'Companies relying heavily on consultants face similar issues—consultants may prefer prolonged engagements over quick solutions, lack deep commitment to company success, and maintain loyalties to multiple clients.',
              recallPrompt: 'What specific problems does Machiavelli identify with mercenary armies, and how do these problems stem from their incentive structure?'
            },
            epic: {
              explainPrompt: "Detail Machiavelli's critique of mercenary armies. What makes hired fighters inherently unreliable compared to citizen soldiers?",
              probePrompt: "How do modern 'gig economy' trends and contractor relationships face similar challenges to Machiavelli's mercenary problem? What might be solutions?",
              implementPrompt: "Identify areas in your life or organization where you rely on 'mercenaries.' How might dependence on outsiders create vulnerabilities? What would 'native army' alternatives look like?",
              connectPrompt: "How does 'Intent Recognition' from Communication help identify when mercenaries' stated goals differ from their actual motivations?"
            }
          },
          {
            id: 'auxiliary_dangers',
            title: 'Auxiliary Forces and Foreign Dependence',
            nodeType: 'principle',
            shortDefinition: 'The risks of relying on borrowed military forces and how such dependence makes victory dangerous and defeat certain.',
            learningObjective: 'Recognize how dependence on others\' resources creates vulnerability and limits autonomous action.',
            keyTerms: ['foreign dependence', 'borrowed resources', 'strategic autonomy', 'alliance risks', 'capability gaps', 'independence preservation'],
            download: {
              clarification: 'Auxiliary forces serve their own rulers\' interests. If they lose, you lose; if they win, you become dependent on them. Such forces represent ultimate strategic dependence—your success relies entirely on others\' goodwill and competence.',
              example: 'Emperor Charles VIII used Swiss auxiliaries to conquer Italian cities, but these forces served Swiss interests first. The auxiliaries\' loyalty belonged to Switzerland, making Charles\'s victories precarious.',
              scenario: 'Startups depending on platform companies face auxiliary dangers—Google or Apple changes can destroy businesses overnight. Success on someone else\'s platform creates dependence that limits strategic autonomy.',
              recallPrompt: 'Why does Machiavelli warn that auxiliary forces make victory dangerous and defeat certain, and how do they create strategic dependence?'
            },
            epic: {
              explainPrompt: "Analyze Machiavelli's warnings about auxiliary forces. How does dependence on others' military strength create strategic vulnerabilities?",
              probePrompt: "How do modern strategic partnerships, platform dependencies, and alliance structures create similar risks to auxiliary military dependence?",
              implementPrompt: "Assess your strategic dependencies—where do you rely on others' capabilities for crucial functions? How might these dependencies become liabilities?",
              connectPrompt: "How does 'Path Dependence' from Chronology explain how reliance on auxiliary forces can lock rulers into increasingly dependent positions?"
            }
          },
          {
            id: 'citizen_militias',
            title: 'Citizen Militias and Civic Defense',
            nodeType: 'concept',
            shortDefinition: 'The advantages of armed citizen militias who fight for their own communities, combining personal stake with military obligation.',
            learningObjective: 'Understand how distributed capability and personal investment create more resilient and motivated defensive forces.',
            keyTerms: ['citizen soldiers', 'civic engagement', 'distributed defense', 'popular mobilization', 'community investment', 'participatory security'],
            download: {
              clarification: 'Citizen militias fight for their own homes, families, and communities. This personal stake creates superior motivation and commitment compared to hired professionals. Citizens also understand local terrain and maintain defensive readiness as part of civic duty.',
              example: 'Swiss cantons developed highly effective militia systems where citizens trained regularly and fought ferociously when invaded. Their defeats of professional armies demonstrated militia effectiveness when properly organized.',
              scenario: 'Open-source software projects exemplify militia principles—contributors work on tools they personally use, creating robust software through distributed effort and personal investment rather than corporate hierarchies.',
              recallPrompt: 'What advantages do citizen militias have over professional armies according to Machiavelli, and how do personal stakes affect military performance?'
            },
            epic: {
              explainPrompt: "Examine Machiavelli's advocacy for citizen militias. What makes citizen-soldiers more effective than professional mercenaries in his view?",
              probePrompt: "How do modern concepts like community policing, volunteer organizations, and distributed security networks relate to Machiavellian militia principles?",
              implementPrompt: "Design a 'citizen militia' approach for a modern challenge (cybersecurity, emergency response, organizational resilience). How would distributed participation improve outcomes?",
              connectPrompt: "How does 'Collaborative Synthesis' from Communication enable the coordination necessary for effective citizen militia operations?"
            }
          },
        ], 'machiavellian-state', 'mach-3'),
      },
      {
        id: 'princely_character',
        title: 'Princely Character & Statecraft',
        learningGoal: 'Understand the character traits and behavioral principles necessary for effective leadership, including the famous tensions between being loved versus feared.',
        chronicleTheme: 'Navigating moral and strategic dilemmas while building effective leadership personas and managing public perception.',
        domainDungeonType: 'leadership_trial_chamber',
        characterAffinities: ['sovereign', 'verivox', 'praxis'],
        specterAffinities: ['moral-ambiguity-specter', 'reputation-specter', 'projection-specter'],
        nodes: addStatusToNodes([
          {
            id: 'realism_vs_idealism',
            title: 'Realism vs. Idealism in Leadership',
            nodeType: 'principle',
            shortDefinition: 'The distinction between how leaders ought to live according to moral ideals versus how they must live to be effective in the real world.',
            learningObjective: 'Balance idealistic aspirations with practical necessities, understanding when compromise is required for effective leadership.',
            keyTerms: ['political realism', 'moral idealism', 'practical ethics', 'effective leadership', 'value trade-offs', 'situational ethics'],
            download: {
              clarification: 'Machiavelli argues rulers must understand the gap between idealistic moral prescriptions and practical reality. Those who follow moral ideals rigidly in all situations may achieve moral purity but fail to accomplish their political objectives or protect their people.',
              example: 'A perfectly honest leader might reveal military secrets that endanger citizens. A perfectly generous leader might bankrupt the state. Effective leaders occasionally compromise pure virtue to achieve greater goods.',
              scenario: 'Crisis managers must sometimes withhold information to prevent panic, make unpopular decisions to ensure survival, or negotiate with unsavory actors to protect stakeholders—balancing ideal openness with practical necessity.',
              recallPrompt: 'What does Machiavelli mean by the distinction between how princes ought to live and how they must live, and why does he prioritize effectiveness over moral purity?'
            },
            epic: {
              explainPrompt: "Explain Machiavelli's argument about the gap between moral ideals and political reality. How does this relate to his broader philosophy of effective governance?",
              probePrompt: "What are the dangers of both rigid idealism and complete moral relativism in leadership? How might one maintain ethical grounding while accepting practical compromises?",
              implementPrompt: "Identify a current leadership dilemma where ideal behavior might conflict with practical necessity. How would you balance moral principles with effective outcomes?",
              connectPrompt: "How does 'Meta-Integrity' from the Sovereign Core help maintain authentic values while adapting behavior to circumstances?"
            }
          },
          {
            id: 'feared_vs_loved',
            title: 'Being Feared vs. Being Loved',
            nodeType: 'principle',
            shortDefinition: 'The analysis of whether it is better for a leader to be loved or feared, concluding that fear is more reliable than love when properly managed.',
            learningObjective: 'Understand the dynamics of authority, respect, and loyalty in leadership relationships.',
            keyTerms: ['fear vs love', 'authority dynamics', 'loyalty maintenance', 'respect cultivation', 'power relationships', 'leader dependability'],
            download: {
              clarification: 'Love depends on others\' goodwill and can vanish when self-interest conflicts with loyalty. Fear, based on threat of punishment, remains more constant. However, fear must not become hatred—leaders should be feared for their strength, not hated for their cruelty.',
              example: 'Hannibal maintained discipline through fear and was never betrayed despite diverse armies and limited resources. Leaders who rely only on being loved find loyalty evaporates during hardship when followers\' interests shift.',
              scenario: 'Managers who are only \"friends\" with subordinates struggle to enforce standards or make tough decisions. Those who maintain professional authority (respectful fear) while showing genuine care achieve both compliance and loyalty.',
              recallPrompt: 'Why does Machiavelli argue that fear is more reliable than love in maintaining authority, and what is the crucial distinction between being feared and being hated?'
            },
            epic: {
              explainPrompt: "Analyze Machiavelli's famous discussion of being feared versus loved. What makes fear a more reliable foundation for authority?",
              probePrompt: "How might modern leadership research on authority, trust, and psychological safety relate to or challenge Machiavelli's analysis?",
              implementPrompt: "Reflect on leaders you've observed or your own leadership. How do you balance being respected/feared with being liked? When has each approach been more effective?",
              connectPrompt: "How does 'Social Dynamics' from Communication explain the power relationships underlying fear vs. love in leadership contexts?"
            }
          },
          {
            id: 'strategic_communication',
            title: 'Strategic Communication & Image Management',
            nodeType: 'strategy',
            shortDefinition: 'The careful management of public perception, promises, and reputation to maintain power while adapting to changing circumstances.',
            learningObjective: 'Master the art of strategic communication that builds credibility while maintaining flexibility to adapt to changing situations.',
            keyTerms: ['reputation management', 'strategic ambiguity', 'promise flexibility', 'image cultivation', 'public perception', 'diplomatic communication'],
            download: {
              clarification: 'Leaders must cultivate beneficial public images while maintaining flexibility to change course. This involves strategic communication—being truthful when it benefits you, misleading when necessary, and managing perceptions to support larger strategic goals.',
              example: 'Pope Alexander VI was notorious for making and breaking agreements, yet maintained power by being strategically helpful to various parties when it served his interests. His flexibility enabled survival in complex political situations.',
              scenario: 'Successful politicians master strategic communication—making campaign promises that appeal to voters while preserving room to govern pragmatically, adapting positions as circumstances change without appearing completely unprincipled.',
              recallPrompt: 'How does Machiavelli advise leaders to manage promises and public communication, and what role does strategic flexibility play in maintaining power?'
            },
            epic: {
              explainPrompt: "Describe Machiavelli's approach to strategic communication and reputation management. How should leaders balance honesty with strategic necessity?",
              probePrompt: "What are the ethical boundaries around strategic communication? How do we distinguish between necessary diplomatic flexibility and harmful deception?",
              implementPrompt: "Analyze a recent example of strategic communication by a leader. How did they balance transparency with strategic interests? What could have been done better?",
              connectPrompt: "How does 'Rhetorical Effectiveness' from Communication provide tools for the strategic communication Machiavelli advocates?"
            }
          },
          {
            id: 'cruelty_mercy_balance',
            title: 'Cruelty and Mercy - Strategic Application',
            nodeType: 'strategy',
            shortDefinition: 'The careful calibration of when to apply cruelty versus mercy to maintain order, deter opposition, and build loyalty.',
            learningObjective: 'Understand how tough decisions and enforcement create stability, while excessive harshness or leniency can destabilize authority.',
            keyTerms: ['strategic cruelty', 'calculated mercy', 'deterrence effect', 'order maintenance', 'proportional response', 'disciplinary measures'],
            download: {
              clarification: 'Judicious cruelty prevents larger disorder, while excessive mercy can encourage rebellion. Well-timed harshness establishes authority and deters future problems. The goal is order and stability, not sadistic pleasure.',
              example: 'Cesare Borgia appointed the cruel Remirro de Orco to pacify Romagna, then executed him publicly when order was restored—using strategic cruelty to achieve peace, then demonstrating accountability to win popular support.',
              scenario: 'Effective managers sometimes make harsh decisions (firing problem employees, cutting failing projects) to protect overall team morale and organizational health, then show mercy and support to those willing to improve.',
              recallPrompt: 'How does Machiavelli distinguish between well-used and badly-used cruelty, and why does he sometimes prefer decisive harshness over weak mercy?'
            },
            epic: {
              explainPrompt: "Explain Machiavelli's nuanced approach to cruelty and mercy. When does he advocate for harsh measures, and how should they be applied?",
              probePrompt: "How do we apply Machiavellian insights about cruelty and mercy in modern contexts while maintaining ethical standards and human dignity?",
              implementPrompt: "Think of a situation requiring tough decisions (discipline, restructuring, conflict resolution). How might Machiavellian principles guide timing and application of firm measures?",
              connectPrompt: "How does 'Conflict Transformation' from Communication provide alternatives to Machiavellian cruelty while achieving similar stabilizing effects?"
            }
          },
          {
            id: 'reputation_management',
            title: 'Reputation and Perception Control',
            nodeType: 'strategy',
            shortDefinition: 'The active cultivation of desired public images and reputation to support political objectives while avoiding damaging perceptions.',
            learningObjective: 'Learn to consciously shape how others perceive your character, capabilities, and intentions to support larger goals.',
            keyTerms: ['public image', 'reputation cultivation', 'perception management', 'symbolic behavior', 'credibility building', 'impression formation'],
            download: {
              clarification: 'Reputation is a strategic asset that must be actively managed. Leaders should cultivate images of strength, competence, and reliability while avoiding perceptions of weakness, incompetence, or untrustworthiness that invite challenges.',
              example: 'Ferdinand of Aragon built a reputation for religious devotion and military prowess through carefully chosen campaigns and public displays. This reputation enabled him to undertake bold actions that others could not attempt.',
              scenario: 'CEOs manage corporate reputation through strategic communication, symbolic actions, and consistent delivery on promises. A reputation for innovation, reliability, or disruption becomes a competitive advantage.',
              recallPrompt: 'Why does Machiavelli emphasize reputation management, and how can leaders actively shape perceptions to support their strategic objectives?'
            },
            epic: {
              explainPrompt: "Describe Machiavelli's approach to reputation and perception management. How can leaders actively shape how they are perceived?",
              probePrompt: "What's the difference between authentic reputation building and manipulative image management? How can leaders maintain integrity while managing perceptions?",
              implementPrompt: "Assess your current reputation in a key domain. What perceptions support your goals? What perceptions hinder them? Develop a plan to consciously strengthen beneficial impressions.",
              connectPrompt: "How does 'Audience Adaptation' from Communication enable the targeted reputation management Machiavelli describes?"
            }
          },
          {
            id: 'flattery_resistance',
            title: 'Avoiding Flatterers and Counselors',
            nodeType: 'strategy',
            shortDefinition: 'Methods for obtaining honest counsel while avoiding the dangerous influence of flatterers and self-interested advisors.',
            learningObjective: 'Develop systems for receiving accurate information and genuine advice while filtering out manipulation and self-serving counsel.',
            keyTerms: ['flattery detection', 'honest counsel', 'advisor management', 'information filtering', 'truth seeking', 'decision support'],
            download: {
              clarification: 'Leaders face constant pressure from flatterers who tell them what they want to hear rather than what they need to know. Effective leaders create systems to receive honest feedback, encourage dissent, and distinguish between genuinely helpful advice and self-serving flattery.',
              example: 'Wise princes select advisors known for honesty, give them specific permission to speak truth, and ask targeted questions. They avoid open councils where advisors compete to please rather than inform.',
              scenario: 'Successful leaders create cultures where people feel safe disagreeing, actively seek disconfirming information, and have trusted advisors with no agenda other than the leader\'s success.',
              recallPrompt: 'What methods does Machiavelli recommend for avoiding flatterers and obtaining honest counsel, and why is this crucial for effective leadership?'
            },
            epic: {
              explainPrompt: "Analyze Machiavelli's advice for avoiding flatterers and obtaining honest counsel. What systems should leaders establish to hear uncomfortable truths?",
              probePrompt: "How do modern concepts like echo chambers, confirmation bias, and organizational culture relate to Machiavelli's warnings about flatterers?",
              implementPrompt: "Evaluate your current information sources and advisors. How do you ensure you're getting honest feedback rather than flattery? What changes might improve your access to truth?",
              connectPrompt: "How does 'Critical Assumption Identification' from Thinking help leaders recognize and question the premises that flatterers exploit?"
            }
          },
          {
            id: 'great_project_leadership',
            title: 'Great Projects and Popular Engagement',
            nodeType: 'strategy',
            shortDefinition: 'Using significant undertakings to demonstrate capability, unite people around common purposes, and create lasting legacies that reinforce authority.',
            learningObjective: 'Understand how ambitious projects can build legitimacy, engage popular imagination, and create momentum for leadership.',
            keyTerms: ['legacy projects', 'popular engagement', 'capability demonstration', 'unifying vision', 'national purpose', 'ambitious leadership'],
            download: {
              clarification: 'Great projects serve multiple functions: demonstrating leader capability, giving people shared purpose, creating visible achievements that reinforce authority, and keeping potential rivals busy with constructive work rather than plotting.',
              example: 'Ferdinand of Aragon undertook the conquest of Granada, which united his kingdom, demonstrated military prowess, increased his reputation, and gave nobles productive outlet for military ambitions rather than internal conflicts.',
              scenario: 'Leaders of organizations launch ambitious initiatives (new product lines, expansion into new markets, transformational technology projects) to galvanize teams, demonstrate vision, and create positive momentum.',
              recallPrompt: 'How do great projects serve the political interests of leaders according to Machiavelli, and what functions do they perform beyond their immediate objectives?'
            },
            epic: {
              explainPrompt: "Explore Machiavelli's advice about undertaking great projects. How do ambitious endeavors serve political as well as practical purposes?",
              probePrompt: "What risks do great projects pose to leaders? How might ambitious undertakings backfire or become political liabilities?",
              implementPrompt: "Identify a 'great project' you could undertake in your context. How would it demonstrate capability, unite stakeholders, and reinforce your authority or credibility?",
              connectPrompt: "How does 'Strategic Goal Setting' from Chronology provide frameworks for designing great projects that achieve multiple leadership objectives?"
            }
          },
        ], 'machiavellian-state', 'mach-4'),
      },
    ],
};