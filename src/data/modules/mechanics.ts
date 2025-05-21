import type { Module, ModuleType } from '@/types/neuro';
import { addStatusToNodes } from './_common'; // Using existing addStatusToNodes

export const mechanicsModuleData: Omit<Module, 'status'> = {
    id: 'mechanics',
    type: 'pillar' as ModuleType,
    title: 'Physical Mechanics: Understanding the Universe\'s Operating System',
    description: 'Explore the fundamental laws governing the physical world, from motion and energy at macroscopic scales to the interactions of matter and radiation at atomic and cosmic levels.',
    moduleLearningGoal: 'To develop a foundational understanding of core principles in physics, chemistry, biology, and astronomy, enabling a scientifically literate perspective on the mechanics of the universe and life.',
    tags: ['physics', 'chemistry', 'biology', 'astronomy', 'science', 'natural laws', 'scientific method'],
    alignmentBias: 'neutral',
    defaultCompanion: 'praxis', 
    associatedSpecters: ['entropy-specter', 'complexity-specter', 'reductionism-specter', 'certainty-specter'],
    recommendedChronicleDungeon: 'The Observatory of Natural Laws & Universal Constants',
    moduleCategory: ['Foundational Sciences', 'Scientific Literacy', 'Physical World Understanding'],
     reviewProfile: {
      decayModel: 'standard_exponential',
      reviewClusters: [
        ['mech-d1-n1', 'mech-d1-n2', 'mech-d1-n3', 'mech-d1-n4', 'mech-d1-n5'], // Physics basics
        ['mech-d2-n1', 'mech-d2-n2', 'mech-d2-n3', 'mech-d2-n4', 'mech-d2-n5', 'mech-d2-n6'], // Chemistry basics
        ['mech-d3-n1', 'mech-d3-n2', 'mech-d3-n3', 'mech-d3-n4', 'mech-d3-n5', 'mech-d3-n6'], // Biology basics
        ['mech-d4-n1', 'mech-d4-n2', 'mech-d4-n3', 'mech-d4-n4', 'mech-d4-n5', 'mech-d4-n6'], // Astronomy & Science method
      ],
      interleaveRatio: 0.2
    },
    domains: [
      {
        id: 'mech-d1',
        title: 'Classical Mechanics & Energy Systems',
        learningGoal: 'Master fundamental principles of motion, force, work, energy, and basic thermodynamics, forming a basis for understanding physical interactions.',
        chronicleTheme: 'Navigating physics-based puzzles involving projectile motion, energy transfer challenges, and gravitational field manipulation within simulated environments.',
        domainDungeonType: 'newtonian_physics_simulation_lab',
        characterAffinities: ['neuros', 'architect', 'praxis'],
        specterAffinities: ['entropy-specter', 'reductionism-specter', 'control-specter'],
        nodes: addStatusToNodes([
          { 
            id: 'mech-d1-n1', 
            title: 'Newton\'s Laws of Motion', 
            nodeType: 'principle', 
            shortDefinition: 'Three fundamental physical laws describing the relationship between a body and the forces acting upon it, and its motion in response to those forces.', 
            learningObjective: 'Explain and apply Newton\'s three laws of motion to predict and analyze the motion of macroscopic objects in various scenarios.', 
            keyTerms: ['inertia (Newton\'s 1st)', 'force (F=ma, Newton\'s 2nd)', 'mass', 'acceleration', 'action-reaction (Newton\'s 3rd)', 'momentum'], 
            download: { 
              clarification: '1st Law (Inertia): An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. 2nd Law: Force equals mass times acceleration (F=ma). 3rd Law: For every action, there is an equal and opposite reaction.', 
              example: 'A rocket expelling gas downwards (action) experiences an equal and opposite upward thrust (reaction), causing it to accelerate upwards (F=ma). A car continues moving forward when brakes are suddenly applied due to inertia.', 
              scenario: 'Designing safe vehicles involves understanding inertia and impact forces (Newton\'s Laws). Calculating the forces needed to launch a satellite into orbit.', 
              recallPrompt: 'State Newton\'s three laws of motion in your own words and give a real-world example for each.' 
            }, 
            epic: {
              explainPrompt: "Explain each of Newton\'s Three Laws of Motion. How do these laws collectively provide a comprehensive framework for understanding classical mechanics?",
              probePrompt: "In what situations or scales do Newton\'s Laws of Motion begin to break down or require modification (e.g., very high speeds, very small scales)? What theories supersede them in those regimes?",
              implementPrompt: "Consider a common scenario involving motion (e.g., kicking a ball, pushing a heavy box, a car braking). For this scenario, identify how each of Newton\'s three laws is demonstrated or relevant. Describe the forces, masses, and accelerations involved.",
              connectPrompt: "How does the concept of \'Causality\' (Chronology module) relate to Newton\'s Laws, particularly F=ma where a force (cause) produces an acceleration (effect)?"
            }
          },
          { 
            id: 'mech-d1-n2', 
            title: 'Work, Energy, and Power', 
            nodeType: 'concept', 
            shortDefinition: 'Fundamental physical concepts describing the transfer of energy (work), the capacity to do work (energy), and the rate at which work is done or energy is transferred (power).', 
            learningObjective: 'Define work, kinetic energy, potential energy, and power, and be able to calculate these quantities in simple physical systems.', 
            keyTerms: ['work (physics)', 'kinetic energy', 'potential energy (gravitational, elastic)', 'power (physics)', 'energy transfer', 'joule', 'watt'], 
            download: { 
              clarification: 'Work is done when a force causes displacement (W = Fd cosθ). Energy is the capacity to do work; forms include kinetic (motion) and potential (position/stored). Power is the rate of doing work (P = W/t).', 
              example: 'Lifting an object against gravity does work and increases its gravitational potential energy. A fast-moving car has high kinetic energy. A powerful engine can do a lot of work in a short amount of time.', 
              scenario: 'Calculating the energy efficiency of machines (e.g., how much input energy is converted to useful work). Designing hydroelectric dams to convert potential energy of water into electrical power.', 
              recallPrompt: 'Define work, kinetic energy, potential energy, and power in physics, including their standard units.' 
            }, 
            epic: {
              explainPrompt: "Explain the relationship between work and energy. How does the concept of power relate to both work and energy? Provide an example that illustrates all three.",
              probePrompt: "Can work be done without a net change in kinetic or potential energy? If so, how (consider friction)? Is energy always conserved when work is done?",
              implementPrompt: "Imagine lifting a 10kg box 2 meters vertically in 5 seconds. Calculate: a) The work done against gravity (assume g ≈ 9.8 m/s²). b) The potential energy gained by the box. c) The average power exerted. Show your calculations.",
              connectPrompt: "How does \'Sovereign Energy Management\' (Sovereign Core) metaphorically relate to the physical concepts of energy allocation and power, in terms of managing personal cognitive and physical resources?"
            }
          },
          {
            id: 'mech-d1-n3',
            title: 'Conservation of Energy & Momentum',
            nodeType: 'principle',
            shortDefinition: 'Two fundamental conservation laws: Energy cannot be created or destroyed, only transformed. In a closed system, total momentum remains constant.',
            learningObjective: 'Apply the principles of conservation of energy and conservation of momentum to analyze collisions, transformations, and interactions in isolated systems.',
            keyTerms: ['conservation of energy', 'conservation of momentum', 'closed system', 'elastic collision', 'inelastic collision', 'energy transformation'],
            download: {
              clarification: 'Conservation of Energy: The total energy of an isolated system remains constant over time. Energy can be converted from one form to another (e.g., potential to kinetic), but the total amount stays the same. Conservation of Momentum: In the absence of external forces, the total momentum of a system of objects remains constant (p=mv).',
              example: 'A pendulum swinging: potential energy at its highest points converts to kinetic energy at its lowest point and back, with total mechanical energy (ignoring friction) conserved. In a collision between two billiard balls, the total momentum before impact equals the total momentum after impact.',
              scenario: 'Designing roller coasters relies on energy conservation (converting potential energy to kinetic). Analyzing car crashes uses conservation of momentum to determine pre-impact speeds.',
              recallPrompt: 'State the principles of conservation of energy and conservation of momentum. What is meant by a "closed system" in these contexts?'
            },
            epic: {
              explainPrompt: "Explain the principles of conservation of energy and conservation of momentum. Why are these considered fundamental laws in physics?",
              probePrompt: "How do real-world systems often deviate from ideal 'closed systems' in terms of energy and momentum conservation (e.g., due to friction, air resistance)? How are these deviations accounted for?",
              implementPrompt: "Describe a scenario involving an elastic collision (e.g., two billiard balls) and an inelastic collision (e.g., two cars crashing and sticking together). Explain how momentum and kinetic energy are (or are not) conserved in each case.",
              connectPrompt: "How might the principle of \'Conservation of Energy\' metaphorically apply to psychological or cognitive systems, like managing mental effort or emotional reserves (Sovereign Core)?"
            }
          },
          {
            id: 'mech-d1-n4',
            title: 'Newton\'s Law of Universal Gravitation',
            nodeType: 'principle',
            shortDefinition: 'Every particle attracts every other particle in the universe with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers.',
            learningObjective: 'Understand and apply Newton\'s law of universal gravitation to calculate gravitational forces between objects and explain orbital motion.',
            keyTerms: ['universal gravitation', 'gravitational force', 'gravitational constant (G)', 'inverse square law', 'orbit', 'celestial mechanics'],
            download: {
              clarification: 'The formula is F = Gm₁m₂/r², where G is the gravitational constant. This law explains why planets orbit stars, why objects fall to Earth, and the formation of large-scale structures in the universe.',
              example: 'The Earth exerts a gravitational force on the Moon, keeping it in orbit. You exert a (very small) gravitational force on everything around you, and everything exerts one on you.',
              scenario: 'Calculating satellite orbits, predicting tides, understanding the formation of galaxies and solar systems.',
              recallPrompt: 'State Newton\'s law of universal gravitation. What does the "inverse square" part of the law mean?'
            },
            epic: {
              explainPrompt: "Explain Newton\'s Law of Universal Gravitation. What are its key components and implications for celestial mechanics?",
              probePrompt: "While Newton\'s law is highly accurate for many applications, how does Einstein\'s theory of General Relativity provide a more complete description of gravity, especially in strong gravitational fields or at cosmological scales?",
              implementPrompt: "If the Earth\'s mass were doubled, but its radius remained the same, how would the gravitational force on an object at its surface change? If the distance between two objects triples, how does the gravitational force between them change?",
              connectPrompt: "How does the \'Universal Constants\' concept (AXIOMOS or a meta-node) relate to the gravitational constant G in Newton\'s law, representing fundamental parameters of the universe?"
            }
          },
          {
            id: 'mech-d1-n5',
            title: 'Basic Laws of Thermodynamics',
            nodeType: 'principle',
            shortDefinition: 'Fundamental principles governing energy, heat, work, and entropy, describing how energy is transformed and the directionality of natural processes.',
            learningObjective: 'State and explain the Zeroth, First, Second, and Third Laws of Thermodynamics and their implications for physical systems and energy conversion.',
            keyTerms: ['thermodynamics', 'heat', 'work', 'internal energy', 'entropy', 'Zeroth Law (thermal equilibrium)', 'First Law (energy conservation)', 'Second Law (entropy increase)', 'Third Law (absolute zero)'],
            download: {
              clarification: 'Zeroth Law: Defines thermal equilibrium. First Law: Energy conservation (ΔU = Q - W). Second Law: Total entropy of an isolated system can only increase over time or remain constant in ideal cases. Third Law: It is impossible to reach absolute zero in a finite number of steps.',
              example: 'A refrigerator uses work to move heat from a cold space to a warmer space (illustrating principles related to the Second Law). A cup of hot coffee cooling down in a room demonstrates heat transfer and entropy increase.',
              scenario: 'Designing efficient engines, power plants, and refrigeration systems. Understanding the limits of energy conversion and the inevitable increase of disorder in the universe.',
              recallPrompt: 'Briefly state the First and Second Laws of Thermodynamics. What is entropy?'
            },
            epic: {
              explainPrompt: "Explain the First and Second Laws of Thermodynamics. How does the Second Law introduce a 'direction' to time in physical processes?",
              probePrompt: "Can the entropy of a specific *part* of a system decrease? If so, how is this compatible with the Second Law applying to the *total* system? Consider life as an example.",
              implementPrompt: "Describe an everyday example of a process that clearly demonstrates the Second Law of Thermodynamics (increase in entropy/disorder). Explain why it illustrates this law.",
              connectPrompt: "How does the concept of \'Entropy\' (from the Entropy Specter or AXIOMOS) relate to the Second Law of Thermodynamics, and how might this physical principle inform understanding of decay or disorder in other complex systems (e.g., information, organizations)?"
            }
          },
          {
            id: 'mech-d1-n6',
            title: 'Waves & Optics Basics',
            nodeType: 'concept',
            shortDefinition: 'The study of wave motion (mechanical and electromagnetic) and the behavior of light, including reflection, refraction, diffraction, and interference.',
            learningObjective: 'Describe basic wave properties (wavelength, frequency, amplitude, speed) and fundamental optical phenomena like reflection, refraction, and the nature of light.',
            keyTerms: ['wave', 'wavelength', 'frequency', 'amplitude', 'wave speed', 'transverse wave', 'longitudinal wave', 'reflection', 'refraction', 'diffraction', 'interference', 'light', 'electromagnetic spectrum'],
            download: {
              clarification: 'Waves transfer energy without transferring matter. Light is an electromagnetic wave. Reflection is bouncing off a surface. Refraction is bending when passing through different media. Diffraction is bending around obstacles. Interference is the superposition of waves.',
              example: 'Sound waves are longitudinal mechanical waves. Light waves enable vision. Rainbows are formed by refraction and dispersion of sunlight through raindrops. Lenses in glasses or telescopes use refraction.',
              scenario: 'Designing communication systems (radio waves), medical imaging (ultrasound, X-rays), optical instruments (microscopes, telescopes), and understanding vision.',
              recallPrompt: 'Define wavelength, frequency, and amplitude of a wave. What is the difference between reflection and refraction of light?'
            },
            epic: {
              explainPrompt: "Explain the difference between mechanical waves and electromagnetic waves, providing an example of each. Describe how reflection and refraction of light occur.",
              probePrompt: "How does the wave-particle duality of light challenge classical descriptions of waves and particles? What are some phenomena that demonstrate this duality?",
              implementPrompt: "Imagine shining a laser beam at a flat mirror and then through a glass of water. Describe what happens to the light path in each case, using the terms reflection and refraction. Draw a simple diagram.",
              connectPrompt: "How does understanding the \'Electromagnetic Spectrum\' (from Astronomy or a dedicated node) expand upon the basic concepts of light waves introduced here?"
            }
          }
        ], 'mechanics', 'mech-d1'),
      },
      {
        id: 'mech-d2',
        title: 'Chemistry & The Nature of Matter',
        learningGoal: 'Develop a foundational understanding of the atomic structure of matter, chemical bonding, reactions, states of matter, and the periodic table.',
        chronicleTheme: 'Solving chemical reaction puzzles, identifying unknown substances based on atomic properties, and navigating phase transition challenges within a molecular simulation lab.',
        domainDungeonType: 'molecular_chemistry_lab',
        characterAffinities: ['veritas', 'praxis', 'neuros'],
        specterAffinities: ['reductionism-specter', 'complexity-specter', 'certainty-specter'],
        nodes: addStatusToNodes([
          { 
            id: 'mech-d2-n1', 
            title: 'Atomic Structure & Subatomic Particles', 
            nodeType: 'concept', 
            shortDefinition: 'The composition of atoms, consisting of a nucleus (protons and neutrons) surrounded by electrons, and how this structure defines elements.', 
            learningObjective: 'Describe the basic structure of an atom, the properties of protons, neutrons, and electrons, and how atomic number and mass number define an element and its isotopes.', 
            keyTerms: ['atom', 'proton', 'neutron', 'electron', 'nucleus', 'atomic model (Bohr, quantum)', 'atomic number', 'mass number', 'isotope'], 
            download: { 
              clarification: 'Atoms are the fundamental building blocks of chemical elements. The number of protons defines the element. Electrons occupy specific energy levels or orbitals around the nucleus.', 
              example: 'A carbon atom has 6 protons in its nucleus. Carbon-12 has 6 neutrons, while Carbon-14 (an isotope) has 8 neutrons but is still carbon due to its 6 protons.', 
              scenario: 'Understanding atomic structure is fundamental to chemistry, physics (nuclear energy, particle physics), materials science, and biology (biochemistry).', 
              recallPrompt: 'What are the three main subatomic particles, their charges, and their locations within an atom? What defines an element?' 
            }, 
            epic: {
              explainPrompt: "Describe the Bohr model of the atom and one key way the quantum mechanical model improves upon it or offers a different perspective.",
              probePrompt: "If atoms are mostly empty space, why do objects feel solid and why can\'t we pass our hands through walls? What forces are at play?",
              implementPrompt: "Choose an element from the first 20 elements of the periodic table. For a neutral atom of this element, determine: 1) Its atomic number. 2) The number of protons. 3) The number of electrons. 4) The most common number of neutrons (you may need to look this up). Draw a simplified Bohr model diagram for it.",
              connectPrompt: "How does the \'System Boundaries\' concept (AXIOMOS) apply when considering different atomic models (e.g., the boundary of what the model tries to explain or its level of abstraction)?"
            }
          },
          { 
            id: 'mech-d2-n2', 
            title: 'Chemical Bonding: Ionic, Covalent, & Metallic', 
            nodeType: 'concept', 
            shortDefinition: 'The fundamental forces and mechanisms (transfer or sharing of electrons) that hold atoms together to form molecules, compounds, and materials.', 
            learningObjective: 'Identify, describe, and differentiate between the main types of chemical bonds (ionic, covalent, metallic) based on electron behavior and resulting material properties.', 
            keyTerms: ['chemical bond', 'ionic bond', 'covalent bond', 'metallic bond', 'molecule', 'compound', 'octet rule', 'electronegativity'], 
            download: { 
              clarification: 'Chemical bonds determine molecular structure, stability, and the physical/chemical properties of substances. Ionic bonds involve electron transfer (metal-nonmetal). Covalent bonds involve electron sharing (nonmetal-nonmetal). Metallic bonds involve a "sea" of delocalized electrons (metal-metal).', 
              example: 'Water (H₂O) is formed by covalent bonds between oxygen and hydrogen atoms. Table salt (NaCl) is formed by ionic bonds between Na⁺ and Cl⁻ ions. Copper wire exhibits metallic bonding.', 
              scenario: 'Developing new materials with specific properties (e.g., strength, conductivity, reactivity) relies on understanding and manipulating chemical bonding. Drug design involves creating molecules with specific shapes and bonding capabilities to interact with biological targets.', 
              recallPrompt: 'Name and briefly describe the three main types of chemical bonds, including the general types of elements involved in each.' 
            }, 
            epic: {
              explainPrompt: "Explain how the concept of \'electronegativity\' helps predict whether an ionic or covalent bond will form between two atoms.",
              probePrompt: "Are the distinctions between ionic, covalent, and metallic bonds always absolute, or is there a spectrum or overlap between these bonding types? Provide an example if possible.",
              implementPrompt: "For each of the following pairs of elements, predict the primary type of chemical bond that would form between them and briefly justify your answer: 1) Sodium (Na) and Chlorine (Cl). 2) Carbon (C) and Oxygen (O). 3) Iron (Fe) and Iron (Fe).",
              connectPrompt: "How does the \'Principle of Non-Contradiction\' (AXIOMOS) apply when considering different models of chemical bonding (e.g., Lewis structures vs. molecular orbital theory)? Can different valid models exist for different explanatory purposes?"
            }
          },
          {
            id: 'mech-d2-n3',
            title: 'Chemical Reactions & Stoichiometry',
            nodeType: 'concept',
            shortDefinition: 'The process of substances (reactants) transforming into new substances (products), and the quantitative relationships between them.',
            learningObjective: 'Balance chemical equations, identify common reaction types, and use stoichiometry to calculate amounts of reactants and products.',
            keyTerms: ['chemical reaction', 'reactant', 'product', 'chemical equation', 'balancing equations', 'stoichiometry', 'mole (chemistry)', 'molar mass', 'reaction types (synthesis, decomposition, combustion, etc.)'],
            download: {
              clarification: 'Chemical reactions involve breaking and forming chemical bonds. Balancing equations ensures mass conservation. Stoichiometry uses mole ratios from balanced equations to relate amounts of substances.',
              example: 'Combustion of methane: CH₄ + 2O₂ → CO₂ + 2H₂O. This balanced equation shows that 1 mole of methane reacts with 2 moles of oxygen to produce 1 mole of carbon dioxide and 2 moles of water.',
              scenario: 'Industrial chemical production relies on stoichiometry to maximize product yield and minimize waste. Pharmaceutical synthesis requires precise control of reaction conditions and reactant amounts.',
              recallPrompt: 'What does it mean to "balance" a chemical equation, and why is it important? What is a "mole" in chemistry?'
            },
            epic: {
              explainPrompt: "Explain the concept of stoichiometry and how it is used in conjunction with balanced chemical equations. Why is the mole concept central to stoichiometric calculations?",
              probePrompt: "What factors can affect the actual yield of a chemical reaction compared to the theoretical yield calculated by stoichiometry (e.g., side reactions, incomplete reactions, experimental errors)?",
              implementPrompt: "Consider the reaction for the formation of ammonia: N₂ + 3H₂ → 2NH₃. If you start with 2 moles of N₂ and 5 moles of H₂, which is the limiting reactant? How many moles of NH₃ can be produced theoretically?",
              connectPrompt: "How does the \'Conservation of Mass\' principle (implied in mechanics/physics) manifest in the balancing of chemical equations?"
            }
          },
          {
            id: 'mech-d2-n4',
            title: 'States of Matter & Phase Transitions',
            nodeType: 'concept',
            shortDefinition: 'The distinct forms (solid, liquid, gas, plasma) that matter takes, characterized by particle arrangement and energy, and the processes of transitioning between them.',
            learningObjective: 'Describe the characteristics of solids, liquids, and gases in terms of particle motion and intermolecular forces, and explain common phase transitions.',
            keyTerms: ['solid', 'liquid', 'gas', 'plasma', 'intermolecular forces', 'kinetic theory of matter', 'phase transition (melting, freezing, vaporization, condensation, sublimation, deposition)', 'boiling point', 'melting point'],
            download: {
              clarification: 'Solids have fixed shape and volume. Liquids have fixed volume but take the shape of their container. Gases expand to fill their container. These states depend on temperature, pressure, and the strength of forces between particles.',
              example: 'Ice (solid water) melts to liquid water, which boils to steam (gaseous water). Dry ice (solid CO₂) sublimes directly to CO₂ gas.',
              scenario: 'Distillation separates liquids based on different boiling points. Weather patterns are driven by phase transitions of water in the atmosphere. Understanding plasma is crucial for fusion energy research.',
              recallPrompt: 'Describe the main differences between solids, liquids, and gases in terms of particle arrangement and movement. Name two common phase transitions.'
            },
            epic: {
              explainPrompt: "Explain how the kinetic theory of matter (particle motion and energy) and intermolecular forces determine whether a substance is a solid, liquid, or gas at a given temperature and pressure.",
              probePrompt: "What is plasma, often called the 'fourth state of matter'? How does it differ from a gas, and where is it commonly found in the universe or in technology?",
              implementPrompt: "Draw a simple heating curve for water, starting from ice below 0°C to steam above 100°C. Label the states of matter and the phase transitions (melting, boiling) on the curve. What happens to the temperature during a phase transition?",
              connectPrompt: "How do the \'Laws of Thermodynamics\' (Classical Mechanics & Energy Systems domain) govern the energy changes involved in phase transitions?"
            }
          },
          {
            id: 'mech-d2-n5',
            title: 'The Periodic Table & Trends',
            nodeType: 'concept',
            shortDefinition: 'A tabular arrangement of chemical elements, ordered by atomic number, electron configuration, and recurring chemical properties, revealing periodic trends.',
            learningObjective: 'Understand the organization of the periodic table and explain common periodic trends such as atomic radius, ionization energy, and electronegativity.',
            keyTerms: ['periodic table', 'element', 'period (chemistry)', 'group (chemistry)', 'atomic radius', 'ionization energy', 'electronegativity', 'electron configuration', 'metals', 'nonmetals', 'metalloids'],
            download: {
              clarification: 'The periodic table organizes elements by increasing atomic number. Elements in the same group (column) have similar valence electron configurations and thus similar chemical properties. Trends in properties can be observed across periods (rows) and down groups.',
              example: 'Alkali metals (Group 1) are all highly reactive. Noble gases (Group 18) are very unreactive. Atomic radius generally decreases across a period and increases down a group.',
              scenario: 'Predicting the properties of unknown elements. Understanding the reactivity and bonding behavior of elements in chemical synthesis. Materials science uses periodic trends to select elements for specific applications.',
              recallPrompt: 'How are elements arranged in the periodic table? Name one periodic trend and describe how it generally changes across a period and down a group.'
            },
            epic: {
              explainPrompt: "Explain how the electron configuration of elements leads to the periodic trends observed in properties like ionization energy and atomic radius.",
              probePrompt: "Are there exceptions to the general periodic trends? If so, what factors can cause these anomalies?",
              implementPrompt: "Using a periodic table, predict which element in each pair would have: a) a larger atomic radius: Na or Cl? b) a higher first ionization energy: K or Ca? c) higher electronegativity: F or Br? Briefly explain your reasoning based on periodic trends.",
              connectPrompt: "How does the \'Pattern Recognition\' skill (Thinking module) relate to understanding and utilizing the periodic table and its trends?"
            }
          },
          {
            id: 'mech-d2-n6',
            title: 'Acids, Bases, and pH',
            nodeType: 'concept',
            shortDefinition: 'The chemical properties of acids (proton donors, electron acceptors) and bases (proton acceptors, electron donors), and the pH scale as a measure of acidity or alkalinity.',
            learningObjective: 'Define acids and bases according to common theories (Arrhenius, Brønsted-Lowry, Lewis), explain the pH scale, and understand basic neutralization reactions.',
            keyTerms: ['acid', 'base', 'pH scale', 'Arrhenius theory', 'Brønsted-Lowry theory', 'Lewis theory', 'H⁺ (proton)', 'OH⁻ (hydroxide)', 'neutralization', 'buffer (chemistry)'],
            download: {
              clarification: 'Acids produce H⁺ ions in solution (or donate protons). Bases produce OH⁻ ions (or accept protons). The pH scale (0-14) measures H⁺ concentration: pH < 7 is acidic, pH > 7 is basic, pH = 7 is neutral. Neutralization is the reaction between an acid and a base, often forming salt and water.',
              example: 'Vinegar (acetic acid) is acidic. Baking soda (sodium bicarbonate) is basic. Pure water is neutral (pH 7). Antacids neutralize stomach acid.',
              scenario: 'Maintaining proper pH is critical in biological systems (e.g., blood pH). Industrial processes often require pH control. Environmental monitoring includes measuring the pH of water bodies.',
              recallPrompt: 'Define an acid and a base according to the Brønsted-Lowry theory. What does a low pH value indicate?'
            },
            epic: {
              explainPrompt: "Explain the Brønsted-Lowry definitions of acids and bases. How does the pH scale relate to the concentration of hydrogen ions (H⁺) in a solution?",
              probePrompt: "What is a chemical buffer, and how does it work to resist changes in pH? Why are buffers important in biological systems?",
              implementPrompt: "If a solution has a pH of 3, is it acidic, basic, or neutral? If you add a strong base to this solution, what would happen to the pH? Describe a common example of an acid and a base you might encounter in daily life.",
              connectPrompt: "How does the concept of \'Equilibrium\' (Synthetic Systems module, or a general science principle) apply to acid-base chemistry, particularly in the context of weak acids/bases and buffer solutions?"
            }
          }
        ], 'mechanics', 'mech-d2'),
      },
      {
        id: 'mech-d3',
        title: 'Biological Systems & The Machinery of Life',
        learningGoal: 'Explore core concepts of life, including cellular structures, genetic mechanisms, evolutionary processes, ecological interactions, and metabolic functions.',
        chronicleTheme: 'Navigating simulated ecosystems, solving genetic inheritance puzzles, and managing cellular metabolic pathways to sustain virtual life forms.',
        domainDungeonType: 'cellular_biology_simulation_lab',
        characterAffinities: ['chronicler', 'mirror_tender', 'praxis'],
        specterAffinities: ['complexity-specter', 'emergence-specter', 'entropy-specter'],
        nodes: addStatusToNodes([
          { 
            id: 'mech-d3-n1', 
            title: 'Cell Theory & Cellular Organization', 
            nodeType: 'principle', 
            shortDefinition: 'The fundamental biological theory stating that all livingthings are composed of cells, cells are the basic unit of life, and all cells arise from pre-existing cells.',
            learningObjective: 'Explain the main tenets of cell theory and describe the basic structure and key organelles of prokaryotic and eukaryotic cells.',
            keyTerms: ['cell', 'cell theory', 'prokaryote', 'eukaryote', 'organelle (nucleus, mitochondria, chloroplast)', 'cell membrane', 'cytoplasm'],
            download: {
              clarification: 'Cell theory is a cornerstone of biology. Eukaryotic cells (plants, animals, fungi, protists) have a nucleus and membrane-bound organelles, while prokaryotic cells (bacteria, archaea) are simpler and lack these.',
              example: 'Observing plant cells under a microscope revealing cell walls, chloroplasts, and a nucleus. Recognizing that a bacterium is a single prokaryotic cell.',
              scenario: 'Medical research into diseases like cancer often focuses on understanding malfunctions at the cellular level (e.g., uncontrolled cell division). Biotechnology leverages cellular processes for producing medicines or materials.',
              recallPrompt: 'What are the three key points of cell theory? What is a major structural difference between prokaryotic and eukaryotic cells?'
            },
            epic: {
              explainPrompt: 'Describe the significance of cell theory in biology. How did its development revolutionize our understanding of life?',
              probePrompt: 'Are there any exceptions or entities that challenge the strict definition of cell theory (e.g., viruses)? How do biologists categorize these?',
              implementPrompt: 'Draw a simplified diagram of a eukaryotic animal cell and a prokaryotic bacterial cell. Label at least three key structures that are different between them and two that are common to both. Briefly state the function of one organelle unique to the eukaryotic cell.',
              connectPrompt: 'How does the concept of \'Modularity\' (Synthetic Systems module) apply to the organization of cells into tissues, organs, and organ systems?'
            }
          },
          {
            id: 'mech-d3-n2',
            title: 'Genetics, DNA, & Heredity',
            nodeType: 'concept',
            shortDefinition: 'The study of genes, genetic variation, and heredity in living organisms, focusing on DNA as the carrier of genetic information and its mechanisms of replication and expression.',
            learningObjective: 'Describe the structure of DNA, explain its role in heredity, and understand the basic processes of DNA replication and protein synthesis (transcription and translation).',
            keyTerms: ['genetics', 'DNA (deoxyribonucleic acid)', 'gene', 'chromosome', 'heredity', 'replication', 'transcription', 'translation', 'RNA', 'genetic code', 'mutation'],
            download: {
              clarification: 'DNA carries the genetic instructions for the development, functioning, growth and reproduction of all known organisms. Genes are segments of DNA. The central dogma describes the flow of genetic information: DNA → RNA → Protein.',
              example: 'Eye color is a heritable trait determined by genes passed from parents to offspring. Genetic diseases like cystic fibrosis are caused by mutations in specific genes.',
              scenario: 'Genetic engineering modifies organisms\' DNA for agriculture or medicine. DNA fingerprinting is used in forensics. Understanding heredity is crucial for selective breeding of plants and animals.',
              recallPrompt: 'What is the basic structure of DNA? Describe the central dogma of molecular biology.'
            },
            epic: {
              explainPrompt: 'Explain the structure of DNA and how it encodes genetic information. Describe the processes of transcription and translation in protein synthesis.',
              probePrompt: 'What are mutations, and how can they affect an organism? Are all mutations harmful?',
              implementPrompt: 'Imagine a simple gene sequence (e.g., TAC-GGC-ATA). Transcribe this into mRNA and then translate it into a short amino acid sequence using a provided genetic code table (you can look one up).',
              connectPrompt: 'How does the concept of \'Information Storage and Transmission\' (Synthetic Systems or Information Ecosystems module) apply to the role of DNA in living systems?'
            }
          },
          {
            id: 'mech-d3-n3',
            title: 'Evolution & Natural Selection',
            nodeType: 'principle',
            shortDefinition: 'The process by which populations of organisms change over generations through mechanisms like natural selection, genetic drift, mutation, and gene flow, leading to adaptation and biodiversity.',
            learningObjective: 'Explain the theory of evolution by natural selection and describe the main mechanisms that drive evolutionary change.',
            keyTerms: ['evolution', 'natural selection', 'adaptation', 'species', 'genetic variation', 'mutation', 'genetic drift', 'gene flow', 'fitness (biology)'],
            download: {
              clarification: 'Natural selection is a key mechanism of evolution where individuals with advantageous heritable traits are more likely to survive and reproduce, leading to an increase in those traits in the population over time. Evolution results in the diversity of life.',
              example: 'The evolution of antibiotic resistance in bacteria: bacteria with genetic mutations allowing them to survive antibiotics reproduce, leading to populations of resistant bacteria. The long necks of giraffes evolved through natural selection favoring individuals who could reach higher leaves.',
              scenario: 'Understanding evolution is crucial for medicine (e.g., viral evolution, antibiotic resistance), agriculture (crop and livestock improvement), and conservation biology (protecting biodiversity).',
              recallPrompt: 'What is natural selection, and what are the key conditions required for it to occur? Name another mechanism of evolution.'
            },
            epic: {
              explainPrompt: 'Explain Darwin\'s theory of evolution by natural selection. What are the main components of this theory, and what evidence supports it?',
              probePrompt: 'How does the concept of "fitness" in an evolutionary context differ from the common understanding of physical fitness? Can a trait be advantageous in one environment and disadvantageous in another?',
              implementPrompt: 'Describe a hypothetical scenario where a specific environmental change (e.g., climate change leading to longer droughts, introduction of a new predator) could lead to evolutionary change in a population of animals or plants through natural selection.',
              connectPrompt: 'How does the concept of \'Adaptation\' in evolutionary biology relate to the principles of adaptation in complex systems discussed in the Synthetic Systems module?'
            }
          },
          {
            id: 'mech-d3-n4',
            title: 'Metabolism & Cellular Respiration/Photosynthesis',
            nodeType: 'concept',
            shortDefinition: 'The sum of all chemical processes that occur in living organisms to maintain life, including energy conversion processes like cellular respiration (releasing energy from glucose) and photosynthesis (capturing light energy).',
            learningObjective: 'Describe the overall processes of cellular respiration and photosynthesis, including their inputs, outputs, and importance for energy flow in ecosystems.',
            keyTerms: ['metabolism', 'cellular respiration', 'photosynthesis', 'ATP (adenosine triphosphate)', 'glucose', 'mitochondria', 'chloroplast', 'anabolism', 'catabolism'],
            download: {
              clarification: 'Metabolism includes catabolic reactions (breaking down molecules, e.g., cellular respiration) and anabolic reactions (building molecules, e.g., protein synthesis). Cellular respiration converts glucose and oxygen into ATP, water, and CO₂. Photosynthesis uses light energy, water, and CO₂ to produce glucose and oxygen.',
              example: 'Animals perform cellular respiration to get energy from food. Plants perform photosynthesis to create their own food (glucose) and also respire.',
              scenario: 'Understanding metabolism is key to nutrition, exercise physiology, and treating metabolic disorders. Photosynthesis is the basis of most food chains and oxygen production on Earth.',
              recallPrompt: 'What are the main inputs and outputs of cellular respiration? What is the primary role of photosynthesis in ecosystems?'
            },
            epic: {
              explainPrompt: 'Explain the relationship between photosynthesis and cellular respiration in terms of energy flow and matter cycling in an ecosystem. Why is ATP important?',
              probePrompt: 'Besides glucose, what other types of molecules can be used by cells for energy through cellular respiration pathways? How are these pathways interconnected?',
              implementPrompt: 'Create a simple diagram illustrating the inputs and outputs of photosynthesis and cellular respiration, showing how they are linked (e.g., products of one being reactants for the other).',
              connectPrompt: 'How do the \'Energy Transformation\' principles (Classical Mechanics & Energy Systems domain) apply to the biochemical processes of metabolism, such as photosynthesis and cellular respiration?'
            }
          },
          {
            id: 'mech-d3-n5',
            title: 'Homeostasis & Feedback Systems',
            nodeType: 'principle',
            shortDefinition: 'The maintenance of a stable internal environment within an organism despite changes in the external environment, primarily achieved through negative feedback mechanisms.',
            learningObjective: 'Explain the concept of homeostasis and describe how negative and positive feedback loops contribute to its maintenance.',
            keyTerms: ['homeostasis', 'internal environment', 'negative feedback', 'positive feedback', 'stimulus', 'receptor', 'control center', 'effector', 'set point'],
            download: {
              clarification: 'Homeostasis is essential for survival. Negative feedback loops counteract changes to return to a set point (e.g., temperature regulation). Positive feedback loops amplify a change (e.g., blood clotting, childbirth), which are less common for homeostasis but important for specific processes.',
              example: 'Thermoregulation: If body temperature rises, sweating (effector response) cools the body down (negative feedback). If body temperature drops, shivering generates heat.',
              scenario: 'Medical diagnostics often involve assessing whether homeostatic mechanisms are functioning correctly (e.g., blood sugar regulation in diabetes). Understanding feedback is crucial in systems biology and engineering.',
              recallPrompt: 'What is homeostasis? Briefly explain the difference between negative and positive feedback loops, giving an example of a negative feedback system in the human body.'
            },
            epic: {
              explainPrompt: 'Explain the importance of homeostasis for living organisms. How do negative feedback loops work to maintain a stable internal environment? Provide a detailed example.',
              probePrompt: 'While positive feedback is less common for homeostasis, describe a biological process where positive feedback is essential and explain why it is used instead of negative feedback in that specific context.',
              implementPrompt: 'Choose a homeostatic mechanism in the human body (e.g., blood calcium regulation, osmoregulation). Identify the stimulus, receptor, control center, effector(s), and the set point for this system.',
              connectPrompt: 'How do the principles of \'Feedback Loops\' in homeostasis relate to the broader concept of feedback in complex adaptive systems, as might be discussed in the Synthetic Systems or Sovereign Core modules?'
            }
          },
          {
            id: 'mech-d3-n6',
            title: 'Ecology & Interdependence of Life',
            nodeType: 'concept',
            shortDefinition: 'The study of interactions among organisms and between organisms and their physical environment, emphasizing the interconnectedness of living systems.',
            learningObjective: 'Describe basic ecological concepts, including levels of organization, energy flow, nutrient cycling, and types of interspecies interactions.',
            keyTerms: ['ecology', 'ecosystem', 'biosphere', 'population', 'community', 'niche', 'habitat', 'food web', 'energy pyramid', 'nutrient cycling (carbon, nitrogen)', 'symbiosis (mutualism, commensalism, parasitism)', 'competition', 'predation'],
            download: {
              clarification: 'Ecology studies life from individual organisms to the entire biosphere. Key concepts include how energy flows (e.g., from sun to producers to consumers) and how matter cycles through ecosystems.',
              example: 'A forest ecosystem includes trees (producers), deer (primary consumers), wolves (secondary consumers), and decomposers (fungi, bacteria), all interacting with abiotic factors like sunlight, water, and soil nutrients.',
              scenario: 'Conservation efforts aim to protect ecosystems and biodiversity. Understanding ecological principles is vital for sustainable resource management, agriculture, and addressing environmental problems like climate change and pollution.',
              recallPrompt: 'Define an ecosystem. What is the primary source of energy for most ecosystems on Earth, and how does it flow through a food web?'
            },
            epic: {
              explainPrompt: 'Describe the different levels of ecological organization (e.g., individual, population, community, ecosystem). Explain the concept of a food web and how energy flows through it.',
              probePrompt: 'How can human activities disrupt ecological balance and nutrient cycles? Provide an example of such a disruption and its consequences.',
              implementPrompt: 'Choose a specific ecosystem (e.g., a local pond, a desert, a coral reef). Describe three different types of interspecies interactions (e.g., predation, mutualism, competition) that might occur in that ecosystem.',
              connectPrompt: 'How does the \'Interconnectedness of Systems\' principle (Synthetic Systems module) manifest at the ecological level, demonstrating how changes in one part of an ecosystem can affect many others?'
            }
          }
        ], 'mechanics', 'mech-d3'),
      },
      {
        id: 'mech-d4',
        title: 'Astronomy, Cosmology & The Scientific Method',
        learningGoal: 'Develop an understanding of our place in the cosmos, from the solar system to the universe\'s origins, and master the principles of the scientific method.',
        chronicleTheme: 'Navigating accurately scaled star systems, confronting cosmological paradoxes, and applying rigorous scientific methodology to solve cosmic mysteries.',
        domainDungeonType: 'cosmic_observatory_and_methodology_crucible',
        characterAffinities: ['chronicler', 'veritas', 'neuros'],
        specterAffinities: ['certainty-specter', 'complexity-specter', 'control-specter'],
        nodes: addStatusToNodes([
          {
            id: 'mech-d4-n1',
            title: 'Our Solar System & Planetary Science',
            nodeType: 'concept',
            shortDefinition: 'The Sun and the celestial bodies orbiting it (planets, moons, asteroids, comets), including their formation, characteristics, and motions.',
            learningObjective: 'Identify the main components of our solar system and describe key characteristics of planets, moons, and other celestial bodies within it.',
            keyTerms: ['solar system', 'sun', 'planet (terrestrial/gas giant)', 'moon', 'asteroid', 'comet', 'orbit', 'Kepler\'s Laws'],
            download: {
              clarification: 'Our solar system consists of the Sun, eight major planets, dwarf planets, moons, asteroids, comets, and Kuiper Belt objects, all bound by gravity. Planetary science studies their geology, atmospheres, and potential for life.',
              example: 'Earth is the third planet from the Sun, a terrestrial planet with one large moon. Jupiter is a gas giant with many moons and a strong magnetic field.',
              scenario: 'Space exploration missions like Voyager, Hubble, or the Mars rovers gather data about planets and other bodies in our solar system, vastly expanding our understanding.',
              recallPrompt: 'Name the planets in our solar system in order from the Sun. What is a key difference between terrestrial planets and gas giants?'
            },
            epic: {
              explainPrompt: 'Describe the general structure of our solar system. How is it believed to have formed (e.g., nebular hypothesis)?',
              probePrompt: 'What makes Earth unique (or perhaps not so unique) among the planets in our solar system in its ability to support life as we know it?',
              implementPrompt: 'Choose two different planets in our solar system. For each, list three distinct characteristics (e.g., size, composition, atmosphere, major moons, unique features). Compare and contrast them.',
              connectPrompt: 'How does \'Newton\'s Law of Universal Gravitation\' (Classical Mechanics domain) explain the orbital motions of planets and moons within the solar system?'
            }
          },
          {
            id: 'mech-d4-n2',
            title: 'Stellar Evolution & Life Cycle of Stars',
            nodeType: 'concept',
            shortDefinition: 'The process by which a star changes over the course of time, from its formation from a nebula to its eventual death as a remnant like a white dwarf, neutron star, or black hole.',
            learningObjective: 'Describe the main stages of stellar evolution for different types of stars (low-mass and high-mass) and understand the role of nuclear fusion.',
            keyTerms: ['star', 'nebula', 'protostar', 'main sequence', 'nuclear fusion', 'red giant', 'supernova', 'white dwarf', 'neutron star', 'black hole', 'Hertzsprung-Russell diagram'],
            download: {
              clarification: 'Stars are born from clouds of gas and dust (nebulae). They spend most of their lives on the main sequence, fusing hydrogen into helium. Their ultimate fate depends on their initial mass.',
              example: 'Our Sun is a main-sequence star that will eventually become a red giant and then a white dwarf. Massive stars end their lives in supernova explosions, which can create neutron stars or black holes.',
              scenario: 'Understanding stellar evolution helps us comprehend the origin of chemical elements (many are forged in stars and supernovae) and the future of our Sun and solar system.',
              recallPrompt: 'What is the main process that powers stars during their main sequence phase? Name two possible end-states for a star, depending on its mass.'
            },
            epic: {
              explainPrompt: 'Describe the typical life cycle of a low-mass star (like our Sun) and a high-mass star. How does nuclear fusion drive these evolutionary stages?',
              probePrompt: 'How do astronomers study stellar evolution, given that star lifetimes are vastly longer than human lifetimes or even civilizations?',
              implementPrompt: 'Sketch a simplified Hertzsprung-Russell (H-R) diagram and indicate where you would find: a) main sequence stars, b) red giants, c) white dwarfs. What do the axes of an H-R diagram typically represent?',
              connectPrompt: 'How does the process of nucleosynthesis in stars relate to the abundance of different chemical elements in the universe (Periodic Table & Trends node in Chemistry domain)?'
            }
          },
          {
            id: 'mech-d4-n3',
            title: 'Galaxies & Cosmic Structures',
            nodeType: 'concept',
            shortDefinition: 'Vast systems of stars, stellar remnants, interstellar gas, dust, and dark matter, bound together by gravity, and their organization into larger structures like clusters and superclusters.',
            learningObjective: 'Describe the different types of galaxies (spiral, elliptical, irregular), the basic structure of our Milky Way galaxy, and how galaxies are organized in the universe.',
            keyTerms: ['galaxy', 'Milky Way', 'spiral galaxy', 'elliptical galaxy', 'irregular galaxy', 'interstellar medium', 'dark matter', 'galaxy cluster', 'supercluster', 'cosmic web'],
            download: {
              clarification: 'Galaxies come in various shapes and sizes. Our solar system is part of the Milky Way, a spiral galaxy. Galaxies are not uniformly distributed but are found in groups, clusters, and superclusters, forming a vast "cosmic web."',
              example: 'The Andromeda Galaxy is the nearest major spiral galaxy to the Milky Way. The Virgo Cluster is a large cluster of galaxies relatively close to us.',
              scenario: 'Astronomers study galaxies to understand galaxy formation and evolution, the distribution of matter (including dark matter) in the universe, and the large-scale structure of the cosmos.',
              recallPrompt: 'Name the three main types of galaxies. What is the name of our own galaxy, and what type is it?'
            },
            epic: {
              explainPrompt: 'Describe the basic structure of a spiral galaxy like the Milky Way. What is meant by "dark matter," and what is its inferred role in galaxies?',
              probePrompt: 'How do astronomers measure the vast distances to other galaxies? What are some of the challenges involved in these measurements?',
              implementPrompt: 'Imagine you are an astronomer observing a distant galaxy. What types of information would you try to gather about it to classify its type and understand its properties (e.g., color, shape, spectral information)?',
              connectPrompt: 'How does the concept of \'Scale Invariance vs. Emergence\' (Synthetic Systems module) apply when considering the universe from stars to galaxies to superclusters? Do the same physical laws operate equally at all scales, or do new emergent properties arise?'
            }
          },
          {
            id: 'mech-d4-n4',
            title: 'The Big Bang Theory & Cosmology',
            nodeType: 'concept',
            shortDefinition: 'The prevailing cosmological model describing the origin and evolution of the universe from an extremely hot, dense state, followed by expansion and cooling.',
            learningObjective: 'Explain the main ideas of the Big Bang theory and describe key pieces of evidence that support it (e.g., cosmic microwave background, Hubble\'s Law).',
            keyTerms: ['Big Bang theory', 'cosmology', 'universe expansion', 'Hubble\'s Law', 'cosmic microwave background (CMB)', 'redshift', 'nucleosynthesis (primordial)'],
            download: {
              clarification: 'The Big Bang theory states the universe began as a very hot, dense point that has been expanding and cooling ever since. It does not describe the "bang" itself but the subsequent evolution.',
              example: 'The observation that distant galaxies are moving away from us (Hubble\'s Law, evidenced by redshift) supports the idea of an expanding universe. The CMB is faint radiation left over from an early, hot phase of the universe.',
              scenario: 'Cosmology is the study of the origin, evolution, and ultimate fate of the universe. The Big Bang theory provides the framework for this study, guiding research with space telescopes and particle accelerators.',
              recallPrompt: 'What is the Big Bang theory? Name two key pieces of evidence that support it.'
            },
            epic: {
              explainPrompt: 'Explain the Big Bang theory as the current leading model for the universe\'s origin and evolution. What does it mean for the universe to be "expanding"?',
              probePrompt: 'What are some of the major unanswered questions or mysteries in cosmology that the Big Bang theory, in its current form, does not fully address (e.g., dark matter, dark energy, the very earliest moments)?',
              implementPrompt: 'If you were to explain the Big Bang theory to someone with no scientific background, what analogy or simplified explanation might you use to convey the core idea of an expanding and cooling universe originating from a hot, dense state?',
              connectPrompt: 'How does the concept of \'Historical Contingency\' (Chronology module) apply to our understanding of the universe\'s evolution as described by cosmology? Could the universe have evolved differently?'
            }
          },
          {
            id: 'mech-d4-n5',
            title: 'The Electromagnetic Spectrum & Astronomical Tools',
            nodeType: 'concept',
            shortDefinition: 'The range of all types of electromagnetic radiation, from radio waves to gamma rays, and the instruments (telescopes) used across this spectrum to study celestial objects.',
            learningObjective: 'Identify the main regions of the electromagnetic spectrum and describe how different types of telescopes (optical, radio, X-ray, etc.) are used to observe different astronomical phenomena.',
            keyTerms: ['electromagnetic spectrum', 'radio waves', 'microwaves', 'infrared', 'visible light', 'ultraviolet', 'X-rays', 'gamma rays', 'telescope (optical, radio, space)', 'spectroscopy'],
            download: {
              clarification: 'Celestial objects emit radiation across the entire electromagnetic spectrum. Different types of radiation provide different information. Earth\'s atmosphere blocks some types, necessitating space telescopes for certain wavelengths.',
              example: 'Optical telescopes observe visible light (like our eyes). Radio telescopes detect radio waves from pulsars or distant galaxies. The Hubble Space Telescope observes in visible, UV, and near-infrared. The Chandra X-ray Observatory studies high-energy phenomena like black holes and supernovae.',
              scenario: 'Multi-wavelength astronomy combines data from different telescopes to get a more complete picture of astronomical objects and events. Spectroscopy analyzes the spectrum of light to determine composition, temperature, and motion of celestial bodies.',
              recallPrompt: 'Name three regions of the electromagnetic spectrum besides visible light. Why are space telescopes necessary for some types of astronomical observations?'
            },
            epic: {
              explainPrompt: 'Describe the electromagnetic spectrum. Why is it important for astronomers to observe celestial objects across different parts of this spectrum, rather than just in visible light?',
              probePrompt: 'What are some of the technological challenges involved in designing and operating telescopes that detect non-visible parts of the electromagnetic spectrum (e.g., X-ray or infrared telescopes)?',
              implementPrompt: 'Choose two different astronomical phenomena (e.g., a star-forming nebula, a supernova remnant, a quasar). For each, which part(s) of the electromagnetic spectrum would be most informative for studying it, and why?',
              connectPrompt: 'How does the \'Signal and Noise\' concept (Information Ecosystems or a general scientific principle) apply to astronomical observations, especially when dealing with faint signals from distant objects across the electromagnetic spectrum?'
            }
          },
          {
            id: 'mech-d4-n6',
            title: 'The Scientific Method: A Framework for Inquiry',
            nodeType: 'strategy',
            shortDefinition: 'A systematic, iterative process for acquiring knowledge and testing hypotheses through observation, experimentation, analysis, and logical reasoning.',
            learningObjective: 'Describe the key steps of the scientific method and critically evaluate its strengths and limitations as a framework for empirical inquiry.',
            keyTerms: ['scientific method', 'observation', 'hypothesis', 'experimentation', 'analysis (scientific)', 'conclusion (scientific)', 'empirical evidence', 'reproducibility', 'peer review', 'falsifiability'],
            download: {
              clarification: 'The scientific method generally involves: 1. Observation & Question. 2. Hypothesis Formulation. 3. Prediction based on Hypothesis. 4. Experimentation/Data Collection to test prediction. 5. Analysis of Results. 6. Conclusion (support, refute, or revise hypothesis) & Reporting. It is an iterative and self-correcting process.',
              example: 'Testing a new drug\'s effectiveness using double-blind, placebo-controlled clinical trials follows the scientific method rigorously.',
              scenario: 'The foundation of all scientific discovery and progress, from physics to medicine to psychology, relies on the application of the scientific method in various forms.',
              recallPrompt: 'Outline the basic steps of the scientific method. Why is reproducibility a crucial aspect of this method?'
            },
            epic: {
              explainPrompt: 'Describe the scientific method. Why is it considered a powerful tool for acquiring reliable knowledge about the natural world?',
              probePrompt: 'What are some common misconceptions about the scientific method (e.g., that it\'s a rigid, linear process, or that it leads to absolute truth)? How is it actually more iterative and provisional?',
              implementPrompt: 'Formulate a simple, testable hypothesis about an everyday observation (e.g., \'Plants grow taller with more sunlight,\' or \'My internet is slower in the evenings\'). Briefly outline how you would design a simple experiment (even a thought experiment) to test this hypothesis using the steps of the scientific method.',
              connectPrompt: 'How do \'Falsifiability\' and \'Evidence Evaluation\' (Sovereign Core - Skeptical Empiricism) represent core principles embedded within the scientific method?'
            }
          }
        ], 'mechanics', 'mech-d4'),
      },
    ],
};
