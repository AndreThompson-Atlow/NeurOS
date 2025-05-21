import type { Module, ModuleType } from '@/types/neuro';
import { addStatusToNodes } from './_common'; // Using existing addStatusToNodes

export const syntheticSystemsModuleData: Omit<Module, 'status'> = {
    id: 'synthetic-systems',
    type: 'pillar' as ModuleType,
    title: 'Constructive Intelligence: The Architecture of Designed Systems',
    description: 'Train users in design principles, system modeling, abstraction building, and adaptive recombination of knowledge.',
    moduleLearningGoal: 'To master the principles and practices of designing, analyzing, and integrating complex systems, enabling the creation of robust, adaptive, and innovative solutions through structured abstraction, modeling, and synthesis.',
    tags: ['systems thinking', 'design', 'abstraction', 'integration', 'complexity', 'modeling', 'innovation'],
    dependencies: [],
    alignmentBias: 'constructive', // This alignment seems fitting given the module name
    defaultCompanion: 'architect',
    associatedSpecters: ['complexity-specter', 'rigidity-specter', 'control-specter', 'fragmentation-specter'], // Optimization and emergence map to these.
    recommendedChronicleDungeon: 'The Cathedral of Emergent Design',
    moduleCategory: ['Systems Thinking', 'Design Principles', 'Knowledge Integration', 'Innovation Frameworks'],
     reviewProfile: {
      decayModel: 'standard_exponential',
      reviewClusters: [
        ['synth-d1-n1', 'synth-d1-n5', 'synth-d1-n6'], // Integration
        ['synth-d2-n1', 'synth-d2-n2', 'synth-d2-n4'], // Schema
        ['synth-d3-n1', 'synth-d3-n2', 'synth-d3-n3'], // Emergence
        ['synth-d4-n1', 'synth-d4-n3', 'synth-d4-n6'], // Adaptive Design
      ],
      interleaveRatio: 0.25
    },
    domains: [
      {
        id: 'synth-d1',
        title: 'Integration Mechanisms & Modularity',
        learningGoal: 'Master techniques for effectively combining diverse knowledge, systems, and components into coherent, functional wholes using modular design principles.',
        chronicleTheme: 'Navigating knowledge fusion puzzles, interface design challenges, and modular system assembly tasks within a dynamic integration hub.',
        domainDungeonType: 'system_integration_hub',
        characterAffinities: ['architect', 'veritas', 'synthesis'],
        specterAffinities: ['fragmentation-specter', 'complexity-specter'], // Overcomplexity can be a specter.
        nodes: addStatusToNodes([
          { 
            id: 'synth-d1-n1', 
            title: 'Knowledge Fusion & Synthesis Frameworks', 
            nodeType: 'strategy', 
            shortDefinition: 'Combining information from different sources or domains into a coherent, novel understanding or artifact using structured approaches.', 
            learningObjective: 'Apply at least two distinct synthesis frameworks (e.g., SWOT, PESTLE, mind mapping, affinity diagramming) to integrate diverse information into a unified analysis or solution.', 
            keyTerms: ['synthesis', 'information integration', 'data fusion', 'cross-domain knowledge', 'synthesis model', 'framework (e.g., SWOT, PESTLE)', 'mind mapping'], 
            download: { 
              clarification: 'Knowledge fusion is the process of merging disparate data points, concepts, or perspectives to create a more comprehensive or innovative understanding. Synthesis frameworks provide structured methods for this integration.', 
              example: 'Integrating market research data, technical feasibility reports, and user feedback (diverse sources) using a SWOT analysis (framework) to inform a new product design strategy.', 
              scenario: 'Intelligence agencies fusing data from multiple sources (human intelligence, signals intelligence, open-source intelligence) to create a comprehensive threat assessment. Scientific literature reviews synthesizing findings from numerous individual studies to establish broader conclusions.', 
              recallPrompt: 'Define knowledge fusion. What is the role of a synthesis framework in this process?' 
            }, 
            epic: {
              explainPrompt: "Explain 'knowledge fusion' and the purpose of using 'synthesis frameworks.' How can a structured framework help in combining diverse information effectively?",
              probePrompt: "What are the common challenges in knowledge fusion (e.g., conflicting information, differing levels of abstraction, information overload)? How can a good synthesis framework help address these?",
              implementPrompt: "Choose a current event or a topic you're learning about. Gather information from three distinctly different types of sources (e.g., a news article, a personal blog post, a statistical report). Use a simple synthesis framework (like creating a mind map or a pros/cons list from all sources) to integrate the information into a concise summary of the topic.",
              connectPrompt: "How does 'Conceptual Blending' (Thinking module) act as a micro-level cognitive mechanism that can be scaled up and structured by 'Synthesis Frameworks' for larger knowledge fusion tasks?"
            }
          },
          { 
            id: 'synth-d1-n2', 
            title: 'Cross-Domain Mapping & Analogical Transfer', 
            nodeType: 'strategy', 
            shortDefinition: 'Identifying underlying structural similarities or analogies between different fields or concepts to transfer insights, solutions, or models from one domain to another.', 
            learningObjective: 'Utilize cross-domain mapping to identify a relevant analogy from a familiar domain and apply its structural insights to generate a potential solution or new understanding for a problem in an unfamiliar domain.', 
            keyTerms: ['analogy (structural)', 'transfer of learning (far)', 'structural similarity', 'interdisciplinary thinking', 'conceptual mapping', 'biomimicry (revisited)'], 
            download: { 
              clarification: 'Cross-domain mapping involves applying concepts, principles, or solution patterns from one area of knowledge to another, often seemingly unrelated, area. It relies on recognizing abstract structural similarities rather than superficial feature overlap.', 
              example: 'Using ecological concepts like food webs or predator-prey dynamics (source domain) to understand competitive dynamics in a business market (target domain). The development of Velcro was inspired by observing how burrs (nature) stick to fabric (engineering).', 
              scenario: 'Applying principles from fluid dynamics (physics) to model traffic flow (urban planning) or information spread on social networks (sociology).', 
              recallPrompt: 'Explain cross-domain mapping. What is the key to making it an effective strategy for innovation or problem-solving?' 
            }, 
            epic: {
              explainPrompt: "Describe 'cross-domain mapping' and 'analogical transfer.' How can looking for structural similarities between different fields lead to breakthroughs?",
              probePrompt: "What are the risks of superficial or misleading analogies in cross-domain mapping? How can one ensure the transfer of insights is valid and appropriate?",
              implementPrompt: "Choose a problem you are currently facing in one domain (e.g., personal productivity, a creative block, a technical challenge). Brainstorm three completely different domains (e.g., biology, sports, cooking, history). For one of these domains, try to find an analogy or structural similarity that offers a new perspective or potential solution to your original problem. Describe the mapping.",
              connectPrompt: "How does 'Abstraction' (another domain in this module) enable effective cross-domain mapping by helping to identify the underlying 'essential features' or structures that can be transferred?"
            }
          },
          { 
            id: 'synth-d1-n3', 
            title: 'Conceptual Interface Design', 
            nodeType: 'strategy', 
            shortDefinition: 'The art and science of defining how different systems, concepts, components, or knowledge domains connect, interact, and exchange information or influence.', 
            learningObjective: 'Design clear and effective conceptual interfaces (e.g., defining inputs, outputs, protocols, shared language) between at least two distinct systems, ideas, or functional units.', 
            keyTerms: ['interface', 'boundary management (revisited)', 'information flow', 'API design (conceptual)', 'interaction points', 'protocol design', 'coupling & cohesion (revisited)'], 
            download: { 
              clarification: 'Conceptual interface design is about managing the boundaries and defining the rules of engagement between different parts of a larger system, whether those parts are software modules, organizational teams, or distinct knowledge areas. Good interfaces facilitate smooth interaction and minimize unwanted interference.', 
              example: 'Defining clear API (Application Programming Interface) contracts between different software components, specifying what data can be exchanged and how. Establishing clear communication protocols and role definitions between different departments in a company.', 
              scenario: 'Designing the organizational structure of a new interdisciplinary research institute by defining how different research groups (e.g., AI, neuroscience, ethics) will share data, collaborate on projects, and resolve conflicts—essentially designing their conceptual interfaces.', 
              recallPrompt: 'What is the primary role of a conceptual interface between two systems or components?' 
            }, 
            epic: {
              explainPrompt: "Explain 'conceptual interface design.' Why is it crucial for the effective integration of different systems or knowledge domains?",
              probePrompt: "What are the characteristics of a well-designed interface versus a poorly designed one, in conceptual terms (e.g., clarity, simplicity, robustness, flexibility)?",
              implementPrompt: "Imagine two distinct NeuroOS modules (e.g., 'Chronology' and 'Financial Sovereignty'). Design a 'conceptual interface' that would allow insights or data from one to productively inform the other. What information would flow? What common language or metrics might be needed? What would be the 'protocol' for their interaction?",
              connectPrompt: "How does 'Modular Design' (another node in this domain) rely heavily on well-defined interfaces between modules to achieve its benefits?"
            }
          },
          { 
            id: 'synth-d1-n4', 
            title: 'Interoperability & Standardization', 
            nodeType: 'principle', 
            shortDefinition: 'The ability of different systems, devices, applications, or components to access, exchange, integrate, and cooperatively use data in a coordinated manner, often achieved through adherence to common standards.', 
            learningObjective: 'Understand the principles and benefits of interoperability and the role of standardization in achieving seamless system integration.', 
            keyTerms: ['interoperability', 'compatibility', 'standards (technical & data)', 'system integration', 'seamless connection', 'protocol', 'data exchange formats'], 
            download: { 
              clarification: 'Interoperability ensures that diverse systems can "talk" to each other and work together effectively. Standardization (e.g., of data formats, communication protocols, or physical connectors) is a key enabler of interoperability.', 
              example: 'The ability of different software applications (e.g., a word processor and a spreadsheet) to share data through standardized file formats like CSV or XML. The internet itself functions due to standardized protocols like TCP/IP and HTTP.', 
              scenario: 'In healthcare, achieving interoperability between different electronic health record (EHR) systems is a major goal to allow seamless sharing of patient information between hospitals and clinics, improving care quality and efficiency.', 
              recallPrompt: 'Define interoperability. What is the role of standards in achieving it?' 
            }, 
            epic: {
              explainPrompt: "Explain 'interoperability.' Why is it a critical consideration in designing complex, multi-component systems or in facilitating collaboration between different organizations/technologies?",
              probePrompt: "What are the challenges in achieving widespread interoperability (e.g., competing standards, legacy systems, proprietary interests)? How can these be addressed?",
              implementPrompt: "Think about two technological devices or software applications you use that *don't* interoperate well, but ideally should. Describe the lack of interoperability and suggest one or two specific 'standards' (e.g., a common data format, a shared API protocol) that could enable them to work together more effectively.",
              connectPrompt: "How does a commitment to 'Open Source Principles' (Linux Foundations or similar module) often promote greater interoperability compared to proprietary, closed systems?"
            }
          },
          { 
            id: 'synth-d1-n5', 
            title: 'Modular Design & Componentization', 
            nodeType: 'principle', 
            shortDefinition: 'A design approach that subdivides a system into smaller, independent, and interchangeable parts or modules, each with a specific function and well-defined interfaces.', 
            learningObjective: 'Apply principles of modular design to break down a complex system into manageable, well-defined components, emphasizing high cohesion within modules and low coupling between them.', 
            keyTerms: ['modularity', 'componentization', 'interchangeability', 'decoupling', 'cohesion (module)', 'coupling (module)', 'system architecture (modular)'], 
            download: { 
              clarification: 'Modular design offers benefits like improved maintainability, reusability, parallel development, and easier debugging, as changes in one module have minimal impact on others. Key principles are high cohesion (module parts are strongly related) and low coupling (modules are independent).', 
              example: 'Lego bricks, where standardized connectors allow diverse pieces to be combined into many structures. Component-based software development, where applications are built from reusable software modules.', 
              scenario: 'Modern automotive manufacturing uses modular design, where large sub-assemblies (like the engine, dashboard, or seating system) are built independently and then integrated on the final assembly line.', 
              recallPrompt: 'What are two primary benefits of modular design in complex systems?' 
            }, 
            epic: {
              explainPrompt: "Explain 'modular design.' What are the key characteristics of a well-designed module (e.g., well-defined interface, high cohesion, low coupling)?",
              probePrompt: "What are the potential downsides of modularity if taken to an extreme or poorly implemented (e.g., too many tiny modules leading to interface complexity, performance overhead)?",
              implementPrompt: "Choose a complex system you are familiar with (e.g., a website you use, your kitchen, a project you worked on). Conceptually break it down into 3-5 major 'modules.' For each module, define its primary function and its key 'interfaces' (how it interacts with other modules).",
              connectPrompt: "How does 'Conceptual Interface Design' (another node in this domain) directly enable effective modular design by defining how these independent modules will interact?"
            }
          },
          { 
            id: 'synth-d1-n6', 
            title: 'Integration Forge & Synthesis Architecture', 
            nodeType: 'concept', 
            shortDefinition: 'The systematic approach to creating unified, coherent solutions from diverse components through structured integration methodologies that preserve essential qualities while achieving synergy.', 
            learningObjective: 'Develop skills to orchestrate the integration process, balancing the preservation of component integrity with the creation of emergent system-level properties.', 
            keyTerms: ['integration methodology', 'synthesis architecture', 'component preservation', 'emergent properties', 'synergy creation', 'systematic integration'], 
            download: { 
              clarification: 'Integration forge represents the disciplined practice of bringing together different elements—whether ideas, systems, or components—in ways that create more value than the sum of parts while maintaining what makes each component valuable.', 
              example: 'A city planning project that integrates transportation, housing, commercial, and green space systems through careful architectural design that preserves the function of each while creating a vibrant urban ecosystem.', 
              scenario: 'A research institute designing an interdisciplinary program that combines computer science, neuroscience, and philosophy to study consciousness, creating specialized interfaces between departments while maintaining each discipline\'s rigor.', 
              recallPrompt: 'What is meant by "synthesis architecture" and how does it differ from simple combination of components?' 
            }, 
            epic: {
              explainPrompt: "Explain the concept of 'Integration Forge' as a systematic approach to synthesis. How does it ensure both component integrity and emergent system properties?",
              probePrompt: "What are the key challenges in designing integration processes that avoid both fragmentation (losing component value) and homogenization (losing component distinctiveness)?",
              implementPrompt: "Choose a challenge in your field that requires integrating multiple disparate elements (technologies, methodologies, perspectives). Design a 'synthesis architecture' that specifies: 1) What essential qualities of each element must be preserved, 2) What interfaces/connections need to be created, 3) What new properties you expect to emerge from the integration.",
              connectPrompt: "How does 'Integration Forge' build upon all other nodes in this domain to create a holistic approach to systematic synthesis and integration?"
            }
          },
        ], 'synthetic-systems', 'synth-d1'),
      },
      {
        id: 'synth-d2',
        title: 'Schema Formation & Abstraction',
        learningGoal: 'Develop advanced skills in creating useful abstractions, designing robust mental models, and choosing effective representations for complex information.',
        chronicleTheme: 'Navigating abstraction ladder challenges, building and refining mental models under pressure, and solving representation choice puzzles in a conceptual modeling workshop.',
        domainDungeonType: 'schema_design_workshop',
        characterAffinities: ['neuros', 'veriscribe', 'architect'],
        specterAffinities: ['rigidity-specter', 'reductionism-specter', 'complexity-specter'],
        nodes: addStatusToNodes([
          { 
            id: 'synth-d2-n1', 
            title: 'Mental Model Design & Refinement', 
            nodeType: 'strategy', 
            shortDefinition: 'Consciously constructing, testing, and iteratively improving internal cognitive representations of how complex systems or phenomena work.', 
            learningObjective: 'Design and articulate a testable mental model for a given complex system, and identify at least two ways to refine it based on new information or feedback.', 
            keyTerms: ['mental model', 'internal representation', 'cognitive modeling', 'understanding systems', 'model testing', 'schema refinement (revisited)'], 
            download: { 
              clarification: 'Mental models are our internal explanations for how things work. Designing them consciously involves making assumptions explicit, identifying key variables and relationships, and testing the model against reality. Refinement occurs as new data or experiences challenge or confirm the model.', 
              example: 'Developing an evolving mental model of how a car engine functions, starting simple (fuel + air + spark = power) and gradually adding complexity (cylinders, ignition timing, ECU).', 
              scenario: 'Pilots train with highly developed mental models of aircraft systems and emergency procedures, constantly refining them through simulation and experience. Effective leaders have robust mental models of their organizations and markets.', 
              recallPrompt: 'What is a mental model? Why is the process of *refinement* crucial for effective mental models?' 
            }, 
            epic: {
              explainPrompt: "Describe the process of 'mental model design and refinement.' How can one consciously build and improve their internal representations of complex systems?",
              probePrompt: "What are common errors or biases in mental model formation (e.g., oversimplification, confirmation bias in testing the model)? How can 'Epistemic Hygiene' (AXIOMOS) help create more accurate models?",
              implementPrompt: "Choose a complex system you interact with regularly but don't fully understand (e.g., how your smartphone works, how a specific piece of software functions, how your city's government makes decisions). Sketch out your current (even if vague) mental model of it. Then, identify one aspect you could research to refine or test this model.",
              connectPrompt: "How does 'Belief Architecture' (AXIOMOS) provide the structure within which individual mental models are embedded and interconnected?"
            }
          },
          { 
            id: 'synth-d2-n2', 
            title: 'Strategic Abstraction & Generalization', 
            nodeType: 'concept', 
            shortDefinition: 'The cognitive skill of focusing on essential features and underlying principles while intentionally ignoring irrelevant details, to simplify complexity, identify core patterns, and enable generalization.', 
            learningObjective: 'Apply abstraction techniques to simplify a complex problem or system, identifying its core principles and enabling generalization to other contexts.', 
            keyTerms: ['abstraction', 'simplification', 'generalization (revisited)', 'level of detail (revisited)', 'essential features', 'pattern recognition (abstract)'], 
            download: { 
              clarification: 'Abstraction involves creating simplified representations by omitting details deemed non-essential for a particular purpose. This allows us to manage complexity, see underlying structures, and transfer knowledge. Generalization is identifying common principles that apply across multiple specific instances.', 
              example: 'A map is an abstraction of a territory, omitting details like individual trees but showing essential features like roads and cities. The mathematical concept of a "number" is an abstraction from specific quantities of objects.', 
              scenario: 'Object-oriented programming uses classes as abstractions to represent real-world entities, focusing on their essential properties and behaviors while hiding implementation details. Scientific laws are generalizations derived from many specific observations.', 
              recallPrompt: 'Define abstraction. How does it help in dealing with complexity and in generalizing knowledge?' 
            }, 
            epic: {
              explainPrompt: "Explain 'strategic abstraction' and 'generalization.' How are these two concepts related? Provide an example of how abstraction facilitates generalization.",
              probePrompt: "What are the risks of excessive or inappropriate abstraction (e.g., losing crucial detail, creating misleading generalizations, oversimplification)? How does one determine the 'right' level of abstraction for a given purpose?",
              implementPrompt: "Consider a set of specific, related examples (e.g., three different types of chairs, three different marketing campaigns, three different personal conflicts). Identify the 'essential features' they share and formulate a 'general principle' or an 'abstract concept' that encompasses them. What details did you have to ignore to arrive at this abstraction/generalization?",
              connectPrompt: "How does 'Navigating Levels of Abstraction' (Integration Forge) build upon the foundational skill of 'Strategic Abstraction' by enabling movement between different levels of detail and generality?"
            }
          },
          { 
            id: 'synth-d2-n3', 
            title: 'Optimal Representation Choice', 
            nodeType: 'strategy', 
            shortDefinition: 'Selecting the most effective and efficient ways to represent information (e.g., visual, symbolic, textual, mathematical, spatial) based on the nature of the data, the task at hand, and the intended audience.', 
            learningObjective: 'For a given complex piece of information or problem, evaluate and choose the most appropriate representational format, justifying the choice based on clarity, efficiency, and communicative power.', 
            keyTerms: ['representation', 'visualization', 'symbolic systems', 'data representation', 'information design', 'cognitive fit', 'multimodal representation'], 
            download: { 
              clarification: 'The way information is represented profoundly affects our ability to understand, manipulate, and communicate it. Choosing the right representation (e.g., a graph vs. a table vs. a narrative) can make complex data intelligible or a difficult problem solvable.', 
              example: 'Choosing to represent statistical data as a bar chart for easy comparison of categories, a line graph for showing trends over time, or a scatter plot for exploring correlations. Using musical notation to represent complex sound patterns.', 
              scenario: 'Cartographers choosing specific map projections and symbolisms to best represent geographical information for a particular purpose (e.g., navigation, demographic analysis). User interface designers choosing optimal representations for information and controls to ensure usability.', 
              recallPrompt: 'Why is choosing the right representation for information crucial for understanding and problem-solving?' 
            }, 
            epic: {
              explainPrompt: "Explain 'optimal representation choice.' What factors influence whether a particular way of representing information is 'optimal' for a given task or audience?",
              probePrompt: "How can a poor choice of representation hinder understanding or lead to misinterpretation, even if the underlying information is accurate?",
              implementPrompt: "Imagine you need to explain the hierarchical structure of your NeuroOS modules and domains to a new user. Propose at least two different ways to represent this information (e.g., an outline, a tree diagram, an interactive mind map, a nested folder structure). Which representation do you think would be most effective and why?",
              connectPrompt: "How does 'Multimodal Communication' (Communication module) leverage the principle of optimal representation choice by combining different sensory and symbolic systems to convey meaning?"
            }
          },
          { 
            id: 'synth-d2-n4', 
            title: 'Ontology & Taxonomy Design', 
            nodeType: 'concept', 
            shortDefinition: 'The principles and practices of creating formal classification systems (taxonomies) and explicit specifications of conceptualizations (ontologies) that define entities, properties, and relationships within a knowledge domain.', 
            learningObjective: 'Understand the fundamental principles of ontology and taxonomy design for structuring and organizing complex knowledge domains, and be able to create a simple taxonomy for a given set of concepts.', 
            keyTerms: ['ontology', 'taxonomy', 'classification', 'knowledge structure', 'semantic relationships', 'knowledge representation', 'metadata', 'controlled vocabulary'], 
            download: { 
              clarification: 'Taxonomies are hierarchical classification systems (e.g., Kingdom, Phylum, Class in biology). Ontologies are richer, formal specifications of a shared conceptualization, defining concepts, their properties, and the relationships between them. Both are crucial for organizing knowledge, enabling semantic interoperability, and supporting automated reasoning.', 
              example: 'Biological classification (Linnaean taxonomy). The Dewey Decimal System for library classification. WordNet as a lexical ontology for English, defining semantic relationships between words.', 
              scenario: 'Developing database schemas for complex information systems. Creating standardized metadata for scientific data sharing. Building knowledge graphs for AI applications like semantic search or question answering.', 
              recallPrompt: 'What is the difference between a taxonomy and an ontology? What purpose do they serve in knowledge organization?' 
            }, 
            epic: {
              explainPrompt: "Explain the concepts of 'taxonomy' and 'ontology.' How do they help in structuring knowledge and enabling more precise communication or computation within a domain?",
              probePrompt: "What are some challenges in designing effective ontologies or taxonomies, especially for complex or evolving domains (e.g., achieving consensus, maintaining consistency, handling ambiguity)?",
              implementPrompt: "Take the set of 'Key Terms' from any three NeuroOS nodes you've studied. Attempt to create a simple hierarchical taxonomy that organizes these terms, showing parent-child relationships or broader-narrower categories. Briefly justify your structure.",
              connectPrompt: "How can 'Belief Architecture' (AXIOMOS) be viewed as a personal, often implicit, ontology and taxonomy for one's own knowledge and beliefs?"
            }
          },
          { 
            id: 'synth-d2-n5', 
            title: 'Navigating Levels of Abstraction', 
            nodeType: 'strategy', 
            shortDefinition: 'The ability to fluidly move between different levels of detail and generality in understanding and communication, adapting the level of abstraction to the purpose, audience, and context.', 
            learningObjective: 'Demonstrate skill in moving between concrete details and abstract principles, choosing the appropriate level for different analytical or communicative purposes.', 
            keyTerms: ['abstraction hierarchy', 'level of detail', 'zoom in/zoom out', 'granularity control', 'contextual abstraction', 'multi-level thinking'], 
            download: { 
              clarification: 'Different situations require different levels of abstraction—from concrete implementation details to broad conceptual frameworks. The skill lies in knowing when to zoom in for precision and when to zoom out for perspective, and being able to translate between levels effectively.', 
              example: 'A software architect might discuss system architecture at a high level with executives, dive into detailed design patterns with senior developers, and explain specific implementation choices with junior programmers—all describing the same system at different abstraction levels.', 
              scenario: 'Teaching requires constant navigation of abstraction levels—starting with concrete examples to build intuition, moving to abstract principles for understanding, then back to specific applications for skill development.', 
              recallPrompt: 'Why is the ability to navigate between different levels of abstraction important for effective thinking and communication?' 
            }, 
            epic: {
              explainPrompt: "Explain 'navigating levels of abstraction.' What are the key skills involved in moving fluidly between concrete details and abstract principles?",
              probePrompt: "What happens when someone gets 'stuck' at one level of abstraction? How can inappropriate abstraction levels hinder problem-solving or communication?",
              implementPrompt: "Choose a concept from your expertise area. Create a brief explanation at three different abstraction levels: 1) High-level (big picture, broad principles), 2) Mid-level (key mechanisms/processes), 3) Low-level (specific details/examples). Note how the focus and language change.",
              connectPrompt: "How does 'Strategic Abstraction' provide the foundational skill that enables effective 'Navigation of Abstraction Levels' in dynamic contexts?"
            }
          },
        ], 'synthetic-systems', 'synth-d2'),
      },
       {
        id: 'synth-d3',
        title: 'Emergent Properties & Complex Systems Dynamics',
        learningGoal: 'Develop an intuitive and analytical understanding of how complex, unpredictable behaviors and properties arise from the interactions of simpler components within a system.',
        chronicleTheme: 'Navigating and influencing simulations demonstrating non-linear dynamics, feedback loops, tipping points, and self-organization in complex adaptive systems.',
        domainDungeonType: 'emergence_simulation_lab',
        characterAffinities: ['praxis', 'chronicler', 'synthesis', 'ekitty'],
        specterAffinities: ['emergence-specter', 'complexity-specter', 'control-specter', 'fragmentation-specter'], // Overcomplexity can be a specter.
        nodes: addStatusToNodes([
          { 
            id: 'synth-d3-n1', 
            title: 'Fundamentals of Complex Adaptive Systems (CAS)', 
            nodeType: 'concept', 
            shortDefinition: 'Systems composed of many interacting components (agents) whose aggregate behavior is complex, adaptive, and often unpredictable from the properties of individual components alone.', 
            learningObjective: 'Identify and explain key characteristics of complex adaptive systems, including nonlinearity, feedback, adaptation, and emergence.', 
            keyTerms: ['complex adaptive system (CAS)', 'agent-based system', 'nonlinearity', 'feedback loops (revisited)', 'adaptation (systemic)', 'emergence (revisited)', 'self-organization (revisited)'], 
            download: { 
              clarification: 'CAS are characterized by numerous interacting agents, decentralized control, constant adaptation to changing environments, and emergent global behaviors that are not programmed top-down but arise from local interactions.', 
              example: 'Ecosystems, economies, cities, the internet, ant colonies, the human immune system. The stock market is a CAS where individual trader decisions lead to complex, emergent market dynamics.', 
              scenario: 'Urban planners increasingly use CAS models to understand how cities evolve and to design interventions that foster desirable emergent properties like resilience or innovation, rather than trying to control every aspect through top-down master plans.', 
              recallPrompt: 'What defines a complex adaptive system (CAS)? Name two key characteristics.' 
            }, 
            epic: {
              explainPrompt: "Describe a 'complex adaptive system' (CAS). What makes its behavior 'complex' and 'adaptive'? Provide an example of a CAS you interact with or observe regularly.",
              probePrompt: "Why is the behavior of CAS often difficult to predict using traditional linear models? What does 'decentralized control' mean in this context?",
              implementPrompt: "Consider your social network (friends, family, colleagues) as a CAS. Identify: 1) The 'agents'. 2) Some key 'interaction rules' (spoken or unspoken). 3) One 'emergent property' of this network (e.g., a shared sense of humor, a tendency towards certain activities, overall resilience).",
              connectPrompt: "How does 'Self-Organization' (another node in this domain) explain how CAS can generate order and patterns without central control?"
            }
          },
          { 
            id: 'synth-d3-n2', 
            title: 'Emergence: The Whole Beyond the Parts', 
            nodeType: 'concept', 
            shortDefinition: 'The arising of novel and coherent structures, patterns, and properties during the process of self-organization in complex systems, which are not present in, nor deducible from, the system\'s individual components in isolation.', 
            learningObjective: 'Explain the concept of emergence and provide compelling examples of emergent properties in diverse systems (natural, social, technological).', 
            keyTerms: ['emergence', 'collective behavior', 'self-organization (revisited)', 'holism', 'synergy', 'unpredictability (novelty)', 'downward causation'], 
            download: { 
              clarification: 'Emergence describes how complex systems can exhibit global behaviors or properties that are qualitatively different from, and not simply the sum of, the behaviors of their individual parts. "The whole is more than the sum of its parts" is a common expression of emergence.', 
              example: 'Consciousness emerging from the interaction of billions of non-conscious neurons in the brain. The intricate patterns of a flock of starlings (murmuration) emerging from simple local interaction rules followed by individual birds. Wetness as an emergent property of H2O molecules at a certain temperature and pressure.', 
              scenario: 'Traffic jams emerging from the collective decisions of individual drivers, none of whom intend to create a jam. The intricate and functional structure of an ant colony emerging from the simple, genetically programmed behaviors of individual ants.', 
              recallPrompt: 'Define emergence. Why are emergent properties often surprising or difficult to predict by only studying the individual components of a system?' 
            }, 
            epic: {
              explainPrompt: "Explain the concept of 'emergence.' Provide an example of an emergent property and explain why it cannot be fully understood by only looking at the individual parts of the system.",
              probePrompt: "What is 'downward causation' in the context of emergence? (i.e., how can emergent global patterns constrain or influence the behavior of the individual components that create them?).",
              implementPrompt: "Think of a team project you've been involved in. Identify one 'emergent property' of the team's performance or dynamic (e.g., high creativity, excellent problem-solving, poor communication, groupthink) that wasn't simply an additive result of individual members' skills but arose from their interactions.",
              connectPrompt: "How does 'Dissipative Structures Theory' (Chaossynthesis module) provide a framework for understanding how ordered, complex emergent structures can arise and maintain themselves in far-from-equilibrium systems?"
            }
          },
          { 
            id: 'synth-d3-n3', 
            title: 'Feedback Loops: Engines of System Dynamics', 
            nodeType: 'concept', 
            shortDefinition: 'Circular causal relationships within a system where the output of an action or process influences future inputs or actions, driving system behavior towards growth, stability, or oscillation.', 
            learningObjective: 'Distinguish between positive (reinforcing) and negative (balancing) feedback loops, and analyze their effects on system behavior and stability.', 
            keyTerms: ['feedback loop', 'positive feedback (reinforcing)', 'negative feedback (balancing)', 'amplification', 'stabilization', 'cybernetics', 'goal-seeking behavior', 'runaway loops'], 
            download: { 
              clarification: 'Feedback loops are fundamental to how systems operate and change. Positive (reinforcing) loops amplify change, leading to exponential growth or decline. Negative (balancing) loops counteract change, seeking to maintain equilibrium or a target state.', 
              example: 'Microphone feedback screech (positive/reinforcing loop where sound is amplified repeatedly). A thermostat controlling room temperature (negative/balancing loop that turns heating/cooling on/off to maintain a set point). Compound interest (positive/reinforcing).', 
              scenario: 'Economic boom-bust cycles often involve interacting positive and negative feedback loops. Predator-prey population dynamics in an ecosystem are regulated by negative feedback loops (more predators reduce prey, fewer prey reduce predators).', 
              recallPrompt: 'Explain the difference between a positive (reinforcing) feedback loop and a negative (balancing) feedback loop. Give an example of each.' 
            }, 
            epic: {
              explainPrompt: "Describe positive and negative feedback loops. How do they drive system behavior differently? Why are both types often present and necessary in complex systems?",
              probePrompt: "What happens when a negative feedback loop is too slow or has significant delays? What happens when a positive feedback loop operates without any balancing loops to constrain it?",
              implementPrompt: "Identify one positive feedback loop and one negative feedback loop in your personal life or a system you interact with regularly (e.g., learning a skill, a social media dynamic, a financial habit). Diagram them simply, showing the key variables and causal links.",
              connectPrompt: "How does 'Homeostasis' (Mechanics module - Biology) rely fundamentally on negative feedback loops to maintain internal balance in living organisms?"
            }
          },
          { 
            id: 'synth-d3-n4', 
            title: 'Network Effects & Scaling Dynamics', 
            nodeType: 'concept', 
            shortDefinition: 'The phenomenon where the value or utility of a product, service, or system increases as more people use it, leading to non-linear scaling effects and potential market dominance.', 
            learningObjective: 'Analyze how network effects create value and drive adoption dynamics, understanding both direct and indirect network effects and their implications for system growth.', 
            keyTerms: ['network effects', 'network externalities', 'metcalfes law', 'viral growth', 'critical mass', 'network topology', 'scaling dynamics'], 
            download: { 
              clarification: 'Network effects occur when the value of a system increases as more users join it. This creates a positive feedback loop where success breeds more success. Direct effects benefit all users equally, while indirect effects create value through complementary services or two-sided markets.', 
              example: 'Social media platforms become more valuable as more friends join. Telephone networks increase in utility with each new subscriber. Online marketplaces become more valuable to buyers as more sellers join, and vice versa.', 
              scenario: 'The early internet demonstrated network effects—each new website and user made the entire network more valuable. Similarly, programming languages with larger communities attract more developers, creating better tools and libraries.', 
              recallPrompt: 'What are network effects and how do they lead to non-linear growth patterns?' 
            }, 
            epic: {
              explainPrompt: "Explain 'network effects' and why they lead to exponential rather than linear growth. What is the difference between direct and indirect network effects?",
              probePrompt: "How do network effects relate to 'winner-takes-all' markets? What factors can limit or prevent network effects from occurring?",
              implementPrompt: "Identify a platform or service you use regularly that exhibits network effects (e.g., social media, messaging apps, professional networks). Analyze: 1) What makes it more valuable as more people join? 2) Is this a direct or indirect network effect? 3) What might prevent competitors from easily replicating this advantage?",
              connectPrompt: "How do network effects demonstrate the principle of 'Emergence' by creating system-level value that transcends individual user contributions?"
            }
          },
          { 
            id: 'synth-d3-n5', 
            title: 'Phase Transitions & Tipping Points', 
            nodeType: 'concept', 
            shortDefinition: 'Critical thresholds in systems where small changes can trigger dramatic, often irreversible shifts in system behavior, structure, or state.', 
            learningObjective: 'Identify characteristics of systems approaching tipping points and understand how small perturbations can cause large-scale transitions.', 
            keyTerms: ['phase transition', 'critical point', 'tipping point', 'bifurcation', 'critical mass', 'threshold effects', 'hysteresis'], 
            download: { 
              clarification: 'Phase transitions occur when systems reach critical points where small changes trigger large-scale reorganization. These transitions often display hysteresis—returning to the original state requires different conditions than the initial trigger, making some transitions irreversible.', 
              example: 'Water boiling at 100°C represents a physical phase transition. Social movements reaching critical mass and suddenly spreading. Climate tipping points where warming triggers irreversible changes like ice sheet collapse.', 
              scenario: 'Financial markets experiencing crashes where small events trigger cascading failures. Ecosystems shifting between stable states, such as grasslands becoming deserts when grazing pressure exceeds a critical threshold.', 
              recallPrompt: 'What characterizes a phase transition or tipping point? Why might these transitions be difficult to reverse?' 
            }, 
            epic: {
              explainPrompt: "Explain 'phase transitions' and 'tipping points' in complex systems. What makes certain transitions irreversible or difficult to reverse?",
              probePrompt: "How can systems be monitored for early warning signs of approaching tipping points? What role does feedback play in phase transitions?",
              implementPrompt: "Think of a dramatic change you've witnessed in an organization, technology, or social group (e.g., rapid adoption of a new platform, sudden culture shift, organizational restructuring). Can you identify: 1) What the 'tipping point' was? 2) What factors led up to it? 3) Why the change was so rapid once it began?",
              connectPrompt: "How do 'Leverage Points' (from systems thinking) relate to tipping points, representing places where small interventions can trigger large systemic changes?"
            }
          },
          { 
            id: 'synth-d3-n6', 
            title: 'Self-Organization & Spontaneous Order', 
            nodeType: 'concept', 
            shortDefinition: 'The process by which patterns and structures arise spontaneously from the interactions of system components without external control or central planning.', 
            learningObjective: 'Analyze how decentralized interactions can lead to organized patterns and understand the conditions that enable or hinder self-organization.', 
            keyTerms: ['self-organization', 'spontaneous order', 'decentralized coordination', 'local interactions', 'global patterns', 'autopoiesis', 'dissipative structures'], 
            download: { 
              clarification: 'Self-organization demonstrates how order can emerge from apparent chaos through local interactions following simple rules. This process requires energy flow through the system and typically occurs in conditions far from equilibrium.', 
              example: 'Ant colonies forming complex trail systems without central planning. Market economies coordinating resource allocation through price signals. Flocking behaviors in birds creating beautiful murmurations from simple local rules.', 
              scenario: 'Smart cities using sensor networks and algorithms to allow traffic, energy, and services to self-organize based on real-time demand rather than centralized control. Biological cells organizing into tissues and organs through chemical signals.', 
              recallPrompt: 'What is self-organization and what conditions typically enable it?' 
            }, 
            epic: {
              explainPrompt: "Explain 'self-organization' and 'spontaneous order.' How can organized patterns emerge without central control or planning?",
              probePrompt: "What are the key conditions required for self-organization to occur? What factors can inhibit or destroy self-organized systems?",
              implementPrompt: "Observe a self-organizing system in your environment (e.g., how people naturally form lines, pedestrian traffic patterns, social media trending topics, team dynamics). Identify: 1) The simple local rules or behaviors, 2) The emergent global pattern, 3) What maintains or disrupts this organization.",
              connectPrompt: "How does self-organization illustrate the principle of 'Emergence' by showing how global patterns arise from local interactions?"
            }
          },
          { 
            id: 'synth-d3-n7', 
            title: 'Leverage Points in Complex Systems', 
            nodeType: 'concept', 
            shortDefinition: 'Places within complex systems where a small shift in one factor can produce significant changes in everything, ranging from parameters to paradigms in order of increasing leverage.', 
            learningObjective: 'Identify and evaluate different leverage points within systems, understanding Donella Meadows\' hierarchy from low-leverage parameters to high-leverage paradigm shifts.', 
            keyTerms: ['leverage points', 'systems intervention', 'parameters vs paradigms', 'structural change', 'mental models', 'systems thinking', 'intervention hierarchy'], 
            download: { 
              clarification: 'Leverage points represent places where small changes can lead to big differences in system behavior. Counterintuitively, the most obvious intervention points (like changing numbers or parameters) often have the least leverage, while changing underlying paradigms or purposes has the most impact.', 
              example: 'In organizations, changing incentive structures (rules) often has more leverage than changing budgets (parameters). Shifting from a "maximize profit" paradigm to "optimize stakeholder value" can transform entire business models.', 
              scenario: 'Environmental movements finding that changing cultural values and worldviews (paradigm level) creates more lasting change than just new regulations (rules level) or efficiency improvements (parameters level).', 
              recallPrompt: 'What are leverage points and why do paradigms often provide more leverage than parameters?' 
            }, 
            epic: {
              explainPrompt: "Explain Donella Meadows' concept of 'leverage points.' Why does the hierarchy suggest that changing paradigms has more leverage than changing parameters?",
              probePrompt: "Why might people instinctively focus on low-leverage interventions (like changing numbers) rather than high-leverage ones (like changing paradigms)? What makes paradigm change so difficult?",
              implementPrompt: "Choose a system you'd like to change (personal habit, team dynamic, organizational process, social issue). Identify potential intervention points at three levels: 1) Parameters (numbers, budget, time), 2) Structure (rules, policies, incentives), 3) Paradigm (goals, values, worldview). Which level do you think would create the most lasting change?",
              connectPrompt: "How do 'Leverage Points' provide a framework for understanding where to intervene in the 'Complex Adaptive Systems' studied in this domain?"
            }
          },
        ], 'synthetic-systems', 'synth-d3'),
      },
       {
        id: 'synth-d4',
        title: 'Adaptive Design & Evolutionary Systems',
        learningGoal: 'Master principles and practices for designing systems that can learn, adapt, and evolve in response to changing environments and performance feedback.',
        chronicleTheme: 'Participating in iterative design challenges, system resilience tests under dynamic conditions, and guiding the evolution of adaptive algorithms or simulated organisms.',
        domainDungeonType: 'evolutionary_design_foundry',
        characterAffinities: ['praxis', 'sentinel', 'architect'],
        specterAffinities: ['rigidity-specter', 'control-specter', 'complexity-specter'], // Optimization and fragility map to these.
        nodes: addStatusToNodes([
          { 
            id: 'synth-d4-n1', 
            title: 'Contextual Generalization & Learning Transfer', 
            nodeType: 'strategy', 
            shortDefinition: 'The ability to apply knowledge, skills, or principles learned in one context to new, relevant, but potentially different situations, and understanding the factors that facilitate or hinder this transfer.', 
            learningObjective: 'Improve the ability to generalize learning effectively across diverse contexts by identifying underlying principles and adapting their application, distinguishing between near and far transfer scenarios.', 
            keyTerms: ['generalization (learning)', 'transfer of learning', 'context adaptation', 'knowledge application', 'near transfer', 'far transfer', 'analogical transfer (revisited)'], 
            download: { 
              clarification: 'Effective learning isn\'t just about acquiring knowledge in isolation, but about being able to apply it flexibly in new situations. "Near transfer" is application to very similar contexts, while "far transfer" is application to substantially different contexts, which is more challenging but also more powerful.', 
              example: 'Applying problem-solving skills learned in mathematics to solve a programming challenge (near to medium transfer). A musician applying principles of rhythm and harmony learned in classical music to jazz improvisation (far transfer).', 
              scenario: 'Pilots transferring skills learned in a flight simulator (training context) to real flight operations (application context). Designing educational programs to maximize the likelihood that students can transfer learned concepts to real-world problems.', 
              recallPrompt: 'Define "transfer of learning." What is the difference between "near transfer" and "far transfer"?' 
            }, 
            epic: {
              explainPrompt: "Explain 'learning transfer' and the distinction between 'near' and 'far' transfer. Why is far transfer often difficult to achieve?",
              probePrompt: "What instructional strategies or learning conditions are thought to promote better learning transfer (e.g., learning underlying principles vs. rote memorization, varied practice contexts, explicit encouragement of transfer)?",
              implementPrompt: "Identify one skill or piece of knowledge you learned in a specific context (e.g., a particular course, job, or hobby). Describe how you have (or could potentially) transfer that learning to a completely different context or problem in your life. What makes the transfer possible? What are the challenges?",
              connectPrompt: "How does 'Cross-Domain Mapping' (Integration Mechanisms domain in this module) directly facilitate far transfer by helping to identify structural similarities across different contexts?"
            }
          },
          { 
            id: 'synth-d4-n2',
            title: 'Error Analysis & Productive Failure',
            nodeType: 'strategy',
            shortDefinition: 'The systematic examination of failures, mistakes, and suboptimal outcomes to extract valuable learning and improve system performance through structured failure analysis.',
            learningObjective: 'Develop methodologies for analyzing errors and failures in a way that generates actionable insights for system improvement without blame or defensiveness.',
            keyTerms: ['failure analysis', 'root cause analysis', 'post-mortem', 'productive failure', 'error forensics', 'learning from mistakes', 'blame-free analysis'],
            download: {
              clarification: 'Error analysis treats failures as valuable data sources rather than problems to hide. It involves systematic investigation of what went wrong, why it went wrong, and how similar failures can be prevented, while maintaining psychological safety to encourage honest reporting.',
              example: 'Software teams conducting blameless post-mortems after system outages, examining not just the technical cause but the processes and assumptions that led to the failure. Hospitals using mortality and morbidity conferences to learn from adverse events.',
              scenario: 'Aviation industry\'s systematic approach to incident reporting and analysis, where near-misses and errors are studied to improve safety systems. Startup companies analyzing failed product launches to extract lessons for future innovations.',
              recallPrompt: 'How does productive failure analysis differ from traditional blame-oriented approaches to mistakes?'
            },
            epic: {
              explainPrompt: "Explain 'error analysis' and 'productive failure.' How can systematic failure analysis lead to system improvements?",
              probePrompt: "What psychological and organizational factors can hinder effective error analysis? How can we create 'psychological safety' to encourage honest failure reporting?",
              implementPrompt: "Think of a recent failure or significant error in a project you were involved with. Conduct a brief 'productive failure analysis': 1) What happened? 2) What were the contributing factors (not just the immediate cause)? 3) What systemic improvements could prevent similar failures? 4) What positive learning emerged from this experience?",
              connectPrompt: "How does 'Error Tolerance' (Sovereign Core) create the psychological foundation necessary for conducting honest and productive error analysis?"
            }
          },
          { 
            id: 'synth-d4-n3', 
            title: 'Iterative Design & Prototyping Cycles', 
            nodeType: 'strategy', 
            shortDefinition: 'A cyclical process of designing, building preliminary versions (prototypes), testing, gathering feedback, and refining solutions or systems based on learning from each cycle.', 
            learningObjective: 'Apply iterative design and prototyping processes to systematically develop and improve solutions, incorporating feedback at each stage.', 
            keyTerms: ['iteration', 'prototyping', 'testing (formative)', 'refinement', 'design cycle', 'agile development (revisited)', 'minimum viable product (MVP)'], 
            download: { 
              clarification: 'Iterative design emphasizes learning through building and testing. Instead of trying to perfect a design upfront, it involves creating successive versions, getting feedback, and making improvements. This is central to methodologies like Agile.', 
              example: 'Software development using Agile sprints where small, functional pieces of the product are built, tested by users, and refined in each cycle. Industrial designers creating multiple physical prototypes of a product to test ergonomics and functionality.', 
              scenario: 'A writer producing multiple drafts of a book, incorporating feedback from editors and beta readers at each stage to refine the story, characters, and pacing.', 
              recallPrompt: 'Describe the iterative design process. What are the key activities in a typical design cycle?' 
            }, 
            epic: {
              explainPrompt: "Explain the 'iterative design cycle.' Why is this approach often more effective for complex projects than trying to plan everything perfectly from the start?",
              probePrompt: "What is a 'Minimum Viable Product' (MVP) in the context of iterative design? What is its purpose, and how does it relate to gathering feedback?",
              implementPrompt: "Choose a simple design problem (e.g., designing a better way to organize your desk, a new feature for a common app, a plan for a small event). Sketch out a 2-cycle iterative design process: Cycle 1 (simple prototype/plan, test/feedback method, expected learning). Cycle 2 (refined prototype/plan based on Cycle 1 learning, further test/feedback, expected improvement).",
              connectPrompt: "How does 'Productive Failure' (Error Analysis) become a valuable part of the iterative design process, where 'failed' tests provide crucial data for refinement?"
            }
          },
          { 
            id: 'synth-d4-n4',
            title: 'Adaptive Systems Architecture',
            nodeType: 'concept',
            shortDefinition: 'System designs that can modify their own structure, behavior, or parameters in response to changing conditions without external reprogramming or redesign.',
            learningObjective: 'Understand the principles of building systems that can adapt autonomously, including feedback mechanisms, learning algorithms, and self-modification capabilities.',
            keyTerms: ['adaptive systems', 'autonomous adaptation', 'self-modification', 'learning systems', 'adaptive algorithms', 'dynamic reconfiguration', 'evolutionary computation'],
            download: {
              clarification: 'Adaptive systems can change their behavior, structure, or parameters based on experience or environmental changes. Unlike static systems, they incorporate mechanisms for sensing, learning, and self-modification to improve performance over time.',
              example: 'Machine learning algorithms that improve performance based on new data. Immune systems that adapt to new pathogens. Smart building systems that learn and adjust to optimize energy usage based on occupancy patterns.',
              scenario: 'Autonomous vehicles that improve their driving performance by learning from millions of driving scenarios. Recommendation systems that adapt to user preferences over time. Organizational structures that evolve based on feedback and results.',
              recallPrompt: 'What distinguishes an adaptive system from a static system? What components enable adaptation?'
            },
            epic: {
              explainPrompt: "Explain 'adaptive systems architecture.' What design principles enable systems to modify their own behavior in response to changing conditions?",
              probePrompt: "What are the challenges and risks of creating highly adaptive systems? How do we ensure adaptation leads to improvement rather than drift or instability?",
              implementPrompt: "Design a simple adaptive system for a problem you face (e.g., personal productivity, home automation, team coordination). Specify: 1) What it should adapt to (inputs/feedback), 2) What aspects can change (parameters/behaviors), 3) How it will learn/improve, 4) Safeguards against unwanted adaptation.",
              connectPrompt: "How do 'Complex Adaptive Systems' (Emergent Properties domain) provide natural models for designing artificial adaptive systems architecture?"
            }
          },
          { 
            id: 'synth-d4-n5',
            title: 'Robustness, Resilience & Antifragility',
            nodeType: 'concept',
            shortDefinition: 'Three levels of system response to stress: robustness (resistance to damage), resilience (recovery from damage), and antifragility (improvement from stress).',
            learningObjective: 'Distinguish between robustness, resilience, and antifragility in system design, and understand how to build systems that not only withstand but benefit from volatility.',
            keyTerms: ['robustness', 'resilience', 'antifragility', 'stress testing', 'graceful degradation', 'beneficial stress', 'hormesis', 'volatility'],
            download: {
              clarification: 'Robustness resists damage, resilience recovers from damage, but antifragility actually benefits from stressors and volatility. Antifragile systems get stronger when exposed to appropriate stress, like muscles that grow stronger from resistance training.',
              example: 'Robust: A bulletproof vest that resists damage. Resilient: An ecosystem that recovers after a fire. Antifragile: An immune system that becomes stronger after exposure to pathogens, or a business model that profits from market volatility.',
              scenario: 'Startup ecosystems that become more innovative and diverse during economic downturns. Social movements that grow stronger when faced with opposition. Decentralized systems that become more robust as they encounter and overcome various failures.',
              recallPrompt: 'Distinguish between robustness, resilience, and antifragility. How does antifragility differ from the other two?'
            },
            epic: {
              explainPrompt: "Explain the concepts of robustness, resilience, and antifragility. How does antifragility go beyond just surviving or recovering from stress?",
              probePrompt: "What design principles can make systems antifragile? What kinds of stress are beneficial versus harmful for different types of systems?",
              implementPrompt: "Analyze a system you're part of (team, organization, personal practice). Identify: 1) Areas where it's robust (resists stress), 2) Areas where it's resilient (recovers from setbacks), 3) Potential areas where it could be antifragile (benefit from certain stressors). What changes might increase antifragility?",
              connectPrompt: "How does 'Adaptive Systems Architecture' enable the development of antifragile systems that can benefit from the stressors they encounter?"
            }
          },
          { 
            id: 'synth-d4-n6',
            title: 'Exaptation & Functional Repurposing',
            nodeType: 'concept',
            shortDefinition: 'The evolutionary principle where features evolved for one purpose are later co-opted for entirely different functions, enabling innovation through creative reuse.',
            learningObjective: 'Recognize opportunities for exaptation in design and innovation, understanding how existing components can be repurposed for new functions.',
            keyTerms: ['exaptation', 'functional repurposing', 'adaptive reuse', 'evolutionary innovation', 'serendipitous functionality', 'repurposing design', 'functional shift'],
            download: {
              clarification: 'Exaptation involves using existing features, structures, or capabilities for purposes other than their original design intent. This principle drives both biological evolution and technological innovation through creative reuse rather than building from scratch.',
              example: 'Bird feathers originally evolved for insulation and display, later co-opted for flight. Computer monitors repurposed as TVs. Social media platforms designed for personal connection being used for business marketing and education.',
              scenario: 'Urban planners converting abandoned industrial buildings into creative spaces. Software developers repurposing gaming technology for educational simulations. Scientists using CRISPR (originally a bacterial immune system) for gene therapy.',
              recallPrompt: 'What is exaptation and how does it differ from original design purpose? Give an example of functional repurposing.'
            },
            epic: {
              explainPrompt: "Explain 'exaptation' and 'functional repurposing.' How does this principle drive innovation in both biological evolution and technological design?",
              probePrompt: "What factors make some features more likely to be successfully exapted than others? How can designers intentionally create features with exaptive potential?",
              implementPrompt: "Look around your environment and identify: 1) Three items being used for purposes other than their original design (exaptation in action), 2) One underutilized feature or resource that could be repurposed for a different need, 3) An innovative way to repurpose an existing capability in your work or personal life.",
              connectPrompt: "How does 'Cross-Domain Mapping' facilitate exaptation by helping identify how solutions from one domain can be repurposed for problems in another domain?"
            }
          },
        ], 'synthetic-systems', 'synth-d4'),
      },
    ],
};