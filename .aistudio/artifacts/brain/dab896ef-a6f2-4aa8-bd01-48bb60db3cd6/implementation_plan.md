# SORT//LAB — Complete Learning Experience Redesign

Evolve SORT//LAB from an algorithm-focused sandbox into an adaptive, gamified computer science learning workbench that takes students from absolute zero to advanced algorithms. The platform follows an eight-stage pedagogical progression: **Understand → Learn → Visualize → Draw → Play → Code → Test → Earn a Skill Badge**, packaged in an atelier aesthetic with a collapsible navigation shell, an interactive Flowchart Canvas, topic-specific learning games, and an illustrated six-realm Skill Map.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions guide this comprehensive redesign. Please review these defaults before proceeding to execution:

- **10-Section Navigation Shell**: A unified responsive shell featuring a compact header, a collapsible left sidebar (1. Home Dashboard, 2. Start From Zero, 3. Learning Path, 4. Visual Lab, 5. Flowchart Canvas, 6. Play & Learn, 7. Code Arena, 8. Assessments, 9. My Skills & Badges, 10. AI Mentor), and an expandable right-side AI Mentor Sheet.
- **Physical Metaphor Foundation ("Start From Zero")**: Level 0 & Level 1 teach computing fundamentals from scratch using relatable visual models (variable storage boxes with typed slots, instruction conveyor belts, boolean logic gates, and memory vectors) so no prior coding knowledge is required.
- **Interactive Flowchart Canvas ("Draw" Stage)**: A dedicated drag-and-drop flowchart builder with standard symbols (Terminator, Process, I/O Parallelogram, Decision Diamond, Connector), real-time branch connection validation, an execution simulator with sample inputs, and beginner challenges (Even/Odd, Max of 2, 1-to-5 loop, Array traversal).
- **Topic-Specific Learning Games**: Replacing repetitive quizzes with distinct game mechanics across six domains: Variables (Memory Match, Predict Output), Conditions (Decision Detective, Logic Gates), Loops (Loop Runner, Iteration Detective, Break Infinite Loop), 1D Arrays (Array Explorer, Index Quest, Treasure Search), 2D Arrays (Grid Navigator, Matrix Mission), and Sorting/Searching (Swap Blitz, Search Quest, Algorithm Detective).
- **Six-Realm Illustrated Skill Map**: Expanding the topological map into six interconnected regions: Foundations Island, Logic Valley, Loop Forest, Array Archipelago, Algorithm Highlands, and Data Structure Citadel, with deterministic prerequisite unlocking.
- **Verifiable Skill Cards & Badges**: Bronze (Developing), Gold (Proficient), and Platinum (Demonstrated Excellence) awarded based on verified test-case completion, streak metrics, and minimal hint reliance. Never uses arbitrary vanity marks.

***

## 1. Overview & Core Concept

### What It Does
SORT//LAB transforms abstract computer science concepts into tangible, visual, and playable experiences. Students can start with no prior knowledge at **Level 0 (Foundations)**, explore interactive analogies, trace live variables in memory, sketch program logic on a **Flowchart Canvas**, test their reflexes in **Topic Games**, write real code in the **Code Arena**, and prove their competence on rigorous assessments to earn verifiable **Skill Cards**.

### Target Audience & Persona
- **Absolute Beginners**: Students with zero programming background who need intuitive physical analogies, step-by-step guidance, and zero jargon.
- **Early CS Learners & AP/Undergraduate Students**: Coders struggling with loop invariants, pointer bounds, recursion, or algorithm trade-offs who benefit from visual stepping and code-repair sandboxes.
- **Self-Directed Explorers**: Learners who want an adventure-style progression map, streak rewards, and diagnostic evaluations without rigid classroom pressure.

### Key Value
Replaces passive textbook reading and disjointed chat prompts with a coherent, multi-modal learning workflow:
$$\text{Understand} \to \text{Learn} \to \text{Visualize} \to \text{Draw} \to \text{Play} \to \text{Code} \to \text{Test} \to \text{Earn Badge}$$

***

## 2. User Experience & Visual Design

### Key User Flows

1. **New Student Onboarding ("Start From Zero")**:
   - The student arrives at the **Home Dashboard**, greeted by a prominent "Start From Zero" card and an optional diagnostic placement test ("I already know some coding").
   - Selecting "Start From Zero" launches the Level 0 introduction: a visual breakdown of a computer program, memory registers, and instruction flow using interactive labeled containers.
2. **The 8-Stage Focused Lesson Flow**:
   - Opening any topic (e.g., *While Loops* or *Array Indexing*) enters a focused stage progression:
     1. *Concept Intro*: Plain-language explanation with relatable everyday analogy (e.g., repeating a recipe step until water boils).
     2. *Interactive Sandbox*: Live inputs let the user tweak values and watch variables mutate.
     3. *Visual Lab Simulator*: Deterministic stepping through memory registers with Play/Pause/Step controls.
     4. *Flowchart Activity*: Visualizing or assembling decision diamonds and loop-back arrows.
     5. *Mini-Game*: Applying intuition in a topic-specific challenge (e.g., *Break the Infinite Loop*).
     6. *Code Arena*: Writing or completing code in Python, JavaScript, Java, or C++ with test cases.
     7. *Adaptive Assessment*: Scenario-based questions measuring conceptual edge-case understanding.
     8. *Skill Card Unlock*: Demonstrating competence awards a Bronze, Gold, or Platinum badge.
3. **Flowchart Canvas Studio**:
   - Accessible from the sidebar or directly within lessons.
   - Students drag nodes from a floating palette, connect output ports to input ports, configure decision branches (`Yes` / `No`), edit node text, and hit **Simulate Logic** to watch execution traverse the nodes with sample test inputs.
4. **Skill Map Exploration**:
   - An illustrated map displaying the six learning territories. Prerequisite paths visually illuminate as milestones are unlocked. Clicking a node opens an inspection drawer with objectives, estimated time, and direct launch actions.

### Visual Identity & Theme
- **Color Discipline (60-30-10 Rule)**:
  - *60% Dominant Canvas*: Warm ivory paper (`#F2F0E7`) in light mode; deep obsidian arcade (`#0E0F0C`) in dark mode.
  - *30% Structural Surfaces*: Crisp card surfaces (`#FBFAF5` / `#151712`), hairline 1px borders (`#DAD6C8` / `#272A22`), and quiet text (`#54534A` / `#9C9B90`).
  - *10% Focal Accents*: Forest green (`#597346` / `#9BD77A`) for primary actions and active paths; amber (`#C98A1B`) for warnings/developing tiers; soft coral (`#C8412F`) for syntax defects.
- **Typography & Scale**:
  - Headings: Clean geometric display (`Geist` / `Outfit`) with occasional editorial italic emphasis (`Instrument Serif`) for focal concepts.
  - Body & Reading: Refined sans (`Geist` / `Plus Jakarta Sans`) at 14–16px with comfortable 1.6 line height.
  - Registers & Code: Monospace with tabular numerals (`Geist Mono`, `tabular-nums`) for memory addresses, loop counters, and indices.
- **Spatial Math & Zero-Overflow Policy**:
  - Fixed-width or flex layouts use `min-w-0`, `max-w-full`, and `overflow-x-clip` to guarantee zero horizontal page scrolling at 360px, 768px, 1024px, and 1440px.
  - Compact icon-rail left sidebar (60px collapsed, 240px expanded on desktop; sliding drawer on mobile).

### Motion & Micro-Interactions
- **Lift-Up Entrance Animations**: 220–280ms cubic-bezier vertical entrances (`transform: translateY(12px) → translateY(0)`, `opacity: 0 → 1`) when switching views, opening drawers, or revealing feedback.
- Full respect for `prefers-reduced-motion: reduce`.

***

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Built-in Flowchart Engine vs. Heavy External Dependencies
- *Chosen Approach*: A lightweight, highly performant SVG + HTML5 draggable node-and-connector canvas specifically tailored to computer science logic diagrams (Terminator, Process, I/O, Decision Diamond, Connector). Includes drag-and-drop, port snapping, bezier connectors, undo/redo, and a step-by-step logic simulator.
- *Why*: Provides zero-latency rendering, avoids heavy multi-megabyte bundle bloat or version conflicts with React 19, and allows deep custom integration with our curriculum's execution simulator (highlighting nodes in real time as test inputs run).

### Decision 2: Topic-Specific Mini-Game Engines
- *Chosen Approach*: Implement six dedicated, deterministic mini-game engines in local TypeScript (Memory Match, Decision Detective, Loop Runner, Index Quest, Matrix Mission, Swap Blitz/Algorithm Detective).
- *Why*: Students learn conditions, loops, and matrices through vastly different mental models than sorting algorithms. Deterministic local engines ensure games are instantaneous, responsive, and fully functional even when offline or when the AI API is rate-limited.

### Decision 3: Deterministic Prerequisite Progression & Storage
- *Chosen Approach*: Progression state tracked in `localStorage` (`sortlab_v2_progression`) with explicit prerequisite graph validation.
- *Why*: Guarantees instant state persistence across browser refreshes, zero required account login barriers for new students, and transparent unlocking of subsequent curriculum nodes.

***

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SORT//LAB Application Shell                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Compact Top Bar: Brand · Lang (EN/HI/PA) · XP · Theme · Mute · AI│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────┬───────────────────────────────────┬──────────────┐  │
│  │ Collapsible   │ Main Workspace Viewport           │ Optional     │  │
│  │ Left Sidebar  │ (Responsive, max-w-[1280px])      │ Right Mentor │  │
│  │               │                                   │ Drawer Sheet │  │
│  │ 1. Dashboard  │ ┌───────────────────────────────┐ │              │  │
│  │ 2. Start Zero │ │ Active Mode View:             │ │ Context-     │  │
│  │ 3. Learn Path │ │ • Home Dashboard              │ │ Aware AI     │  │
│  │ 4. Visual Lab │ │ • Lesson Journey (8 Stages)   │ │ Socratic     │  │
│  │ 5. Flowcharts │ │ • Flowchart Canvas Studio     │ │ Guidance     │  │
│  │ 6. Play Games │ │ • 6-Realm Skill Map           │ │ (Gemini API  │  │
│  │ 7. Code Arena │ │ • Topic Arcade Games (6 modes)│ │  Proxy)      │  │
│  │ 8. Assessment │ │ • Code Arena & Test Runner    │ │              │  │
│  │ 9. Badges     │ │ • Adaptive Assessments        │ │              │  │
│  │ 10. AI Mentor │ │ • My Skills & Badges Portfolio│ │              │  │
│  │               │ └───────────────────────────────┘ │              │  │
│  └───────────────┴───────────────────────────────────┴──────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼───────────────────────────┐
       ▼                            ▼                           ▼
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ Curriculum Graph │     │ Local Game & Sim     │     │ Storage Engine   │
│ & Prerequisites  │     │ Execution Engines    │     │ (localStorage)   │
│ (Levels 0 to 5)  │     │ (Flowchart, Sort,    │     │ • Unlocked Nodes │
│                  │     │  Memory, Matrix)     │     │ • Badge Tiers    │
│                  │     │                      │     │ • Saved Diagrams │
└──────────────────┘     └──────────────────────┘     └──────────────────┘
```

### Core Data Models

- **Curriculum Node**:
  - `id`: Unique identifier (e.g., `l0-variables`, `l2-loops`, `l4-bubble-sort`).
  - `level`: 0 (Foundations) to 5 (Data Structures).
  - `realm`: `foundations` | `logic` | `loops` | `arrays` | `algorithms` | `structures`.
  - `title`, `tagline`, `description`.
  - `prerequisites`: Array of prerequisite node IDs.
  - `stages`: Structured definitions for Concept, Sandbox, Visualizer, Flowchart, Game, Code Task, and Assessment.
- **Flowchart State**:
  - `nodes`: Array of `{ id, type, x, y, label, config }`.
  - `connections`: Array of `{ id, fromNode, fromPort, toNode, toPort, label }`.
  - `validationRules`: Expected node flow and branch definitions for exercise evaluation.
- **Skill Badge Record**:
  - `topicId`: Associated curriculum node.
  - `tier`: `bronze` | `gold` | `platinum`.
  - `earnedAt`: Timestamp.
  - `score`: Assessment score percentage.
  - `evidence`: Bullet points of verified tasks passed.

### Interactive State Transitions

1. **Lesson Stage Progression**:
   - Completing an interactive sandbox or game automatically unlocks the next stage tab with lift-up animations.
   - Finishing stage 7 (Assessment) evaluates performance:
     - $\ge 60\% \implies$ Bronze Awarded
     - $\ge 80\% \implies$ Gold Awarded
     - $\ge 90\% \text{ with zero hints} \implies$ Platinum Awarded
2. **Flowchart Canvas Simulator**:
   - `Run Flowchart`: Traverses nodes from `start` terminator along connected edges, evaluating decision branches against test inputs, highlighting the active path in real time, and outputting result vectors.
3. **Responsive Shell Transitions**:
   - Left sidebar toggles between `compact` (64px icon rail) and `expanded` (240px) on desktop, and collapses into a touch-friendly slide-over drawer on screens $< 768\text{px}$.
   - Right mentor drawer opens as an accessible overlay sheet with keyboard `Escape` dismissal.
