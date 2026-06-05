# Human-Centered UX Design Process & Cognitive Framework

Good UX is not a static state of visual styling (UI); **UX is a process, a disciplined way of thinking, and an ongoing conversation between system behavior and human cognition.** 

This document defines the official, non-negotiable **UX Design Process and Way of Thinking** for **Agent UI/UX**. It synthesizes the world's most robust open-source agent UX frameworks (including `@mastepanoski/claude-skills` and the highly starred `gotalab/uxaudit` regression suite) into a cohesive, 4-stage operational blueprint.

---

## 🧭 The Core Philosophy: The Human-Centered Mindset

Before auditing a line of code or reviewing a layout, the agent must adopt the following three core beliefs:
1. **The flow must make sense, not just run:** E2E tests verify that code executes without crashing. UX auditing verifies that the execution *makes sense* to a human under real cognitive load, time constraints, and emotional pressure.
2. **We design for the user's mental model, not the database schema:** If a user has to understand database relationships, API parameters, or Unix execution queues to use the app, the UX has fundamentally failed.
3. **No vibes-only feedback — every critique must cite precedent:** We do not say "I don't like this color" or "this feels crowded." Every single audit item must trace back to an established heuristic or empirical standard (e.g., WCAG 2.2, Don Norman, Jakob Nielsen, Baymard, or ISO 9241-11).

---

## 💎 The Four-Phase "Double Diamond" UX Process

Every UX project, redesign, or feature request must walk through these four discrete phases:

```
    🗺️ DISCOVER             🎯 DEFINE             🎨 DEVELOP             🚀 DELIVER
  ┌──────────────┐        ┌──────────────┐      ┌──────────────┐       ┌──────────────┐
  │  Harvesting  │        │ Heuristics & │      │ Interaction  │       │ Verification │
  │   Context    ├───────►│  Cognitive   ├─────►│  Design &    ├──────►│  & Smokes    │
  │  & Personas  │        │ Walkthrough  │      │ Redesign     │       │   Testing    │
  └──────────────┘        └──────────────┘      └──────────────┘       └──────────────┘
```

---

### PHASE 1: DISCOVER — Context Harvesting & Goal Alignment

In this phase, we map out *why* the product exists and *who* is using it, moving from abstract strategy to specific requirements.

#### 1. Formulate the Persona & User Context
We do not build for a generic "user." We formulate explicit, high-resolution user profiles. A standard persona must declare:
* **The Persona Name & Role:** (e.g., "Sarah, Non-Technical Corporate Executive" or "Marcus, High-Pressure SRE On-Call Lead").
* **Motivation & Goal:** What is their primary, non-technical definition of success?
* **Cognitive Context:** Device used, environment (quiet office vs. mobile/on-the-go), and active time/attention pressure.
* **Technical Level:** Domain vocabulary vs. software-engineering familiarity.

#### 2. Harvest the Core Journey
Decompose the system's operational space into **3–5 high-value atomic user journeys** (the critical paths to value). Examples:
* *Onboarding Journey:* First land $\rightarrow$ Understand value $\rightarrow$ First meaningful transaction.
* *Control Journey:* Notice warning $\rightarrow$ Isolate root-cause $\rightarrow$ Successfully trigger remediation.

---

### PHASE 2: DEFINE — Heuristic Inspection & The Cognitive Walkthrough

In this phase, we audit the interface, tracing user journeys step-by-step to identify points of friction, dead-ends, and cognitive blocks.

#### 1. The Atomic Cognitive Walkthrough
For every step in a user journey, the agent must ask the **4 Core Cognitive Questions**:
1. **Q1: Will the user try to achieve the right effect?** *(Is the goal of this step clear and aligned with their mental model?)*
2. **Q2: Will the user notice that the correct action is available?** *(Is the button/control prominent and visible, or is it hidden in nested menus?)*
3. **Q3: Will the user associate the correct action with the effect they are trying to achieve?** *(Does the button's label explicitly state its outcome, or is it vague?)*
4. **Q4: If the correct action is performed, will the user see that progress is being made?** *(Is there immediate feedback confirming success, or does the system go silent?)*

#### 2. The Heuristic Grid Audit
Evaluate the interface against the integrated **Peter Morville Honeycomb & Don Norman Principles**:
* **Discoverability:** Are actions visible without hunting?
* **Affordance & Signifiers:** Do buttons look clickable? Are interactive targets clearly marked?
* **Feedback Loops:** Does the system respond instantly and understandably to every click?
* **Findability (IA):** Is the navigation layout logical, grouped, and scannable (F-pattern)?
* **Credibility:** Is the layout clean, containing no broken assets, secure (HTTPS), and professional?

#### 3. Flagging "AI-Slop" (Lazy UI Coding Fingerprints)
The agent must specifically scan for and flag the visual fingerprints of lazy AI-generated interfaces:
* **shadcn defaults everywhere:** Uncustomized, flat, gray panels lacking visual depth or brand character.
* **The "Coming Soon" Trap:** Placeholder buttons, stub sections, or inactive icons used as filler.
* **Emoji-as-Icon slop:** Using basic raw emojis (e.g., 🚀, 💡, 🛠️) as primary interface icons instead of a unified SVG icon set.
* **Generic Hero copy:** Corporate "Consultant-speak" copywriting (e.g., "Empowering your business with intelligent synergy") instead of concrete, outcome-oriented headings.

---

### PHASE 3: DEVELOP — Interaction Design & The Redesign Blueprint

In this phase, we design the alternative layout, focusing on reducing mental load and establishing clear cognitive paths.

#### 1. Enforce the "One-Colored-Button" Rule
* **Primary CTA:** Exactly *one* primary, recommended action per card, viewport band, or container has a colored background or gradient. This indicates the "happy path" of feedforward.
* **Secondary Actions:** All alternative, secondary buttons are styled as low-contrast outlines or text-links that only glow subtly on hover, preventing visual competition.

#### 2. Progressive Disclosure of Complexity
* **At-A-Glance Executive View:** The default state shows the minimum information required to understand system health and identify what needs attention.
* **Details on Demand:** Technical parameters, logs, raw JSON outputs, and shell traces are hidden inside collapsible details accordions. They are easily accessible, but do not clutter the primary experience.

#### 3. Clear State & Feedback Loops
* **Empty States:** Never show a blank screen or empty panel. Show an illustrative state, a clear description of why it's empty, and the direct unblocking action button.
* **Loading & Progress States:** Long-running processes must show active sub-step indicators, estimated completion, and a prominent, highly visible **Abort / Cancel** button.

---

### PHASE 4: DELIVER — Programmatic Verification & Smokes

In this phase, we execute deterministic checks to verify that the redesigned interface meets WCAG accessibility guidelines and maintains visual hierarchy.

#### 1. Color Contrast Math (WCAG 2.2 AA Floor)
* Text-to-background contrast ratios must be mathematically calculated and verified.
* Primary body text must achieve a contrast ratio of at least **4.5:1** on its background.
* Large display text or interactive UI borders must achieve at least **3:1**.
* *Note:* Banish pure black (`#000000`) and pure white (`#ffffff`) combinations where possible, preferring softer high-contrast neutral scales (e.g., `#1e293b` slate on `#f8fafc` gray-blue) to reduce eye fatigue.

#### 2. Spacing Scales & Target Zones
* Tap targets must be at least **44x44px** (preferably **48x48px** in responsive layouts) to prevent misclicks.
* Padding must respect an strict **8px spacing grid** scale (e.g., `p-4` / `p-6` / `p-8` in Tailwind), ensuring proportional balance.

#### 3. User Journey Smoke Walkthrough
* Headlessly walk the completed user journey using Playwright or manual walkthroughs.
* Confirm that the 4 Core Cognitive Questions are fully answered, and the user successfully navigates from first-land to goal completion with zero friction.
