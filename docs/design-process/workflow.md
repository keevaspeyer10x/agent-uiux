# Human-Centered UX Design Process & Cognitive Framework

Good UX is not a static state of visual styling (UI); **UX is a process, a disciplined way of thinking, and an ongoing conversation between system behavior and human cognition.** 

This document defines the official, non-negotiable **UX Design Process and Way of Thinking** for **Agent UI/UX**. It synthesizes Peter Morville’s 7 UX Factors, ISO usability standards, and the 5 Dimensions of Interaction Design, augmented by the multi-model consensus of Claude, GPT, Gemini, Grok, DeepSeek, and Kimi.

---

## 🧭 The Core Philosophy: The Human-Centered Mindset

Before auditing a line of code or reviewing a layout, the agent must adopt the following three core beliefs:
1. **The flow must make sense, not just run:** E2E tests verify that code executes without crashing. UX auditing verifies that the execution *makes sense* to a human under real cognitive load, time constraints, and emotional pressure.
2. **We design for the user's mental model, not the database schema:** If a user has to understand database relationships, API parameters, or Unix execution queues to use the app, the UX has fundamentally failed.
3. **No vibes-only feedback — every critique must cite precedent:** We do not say "I don't like this color." Every single audit item must trace back to an established heuristic or empirical standard (e.g., WCAG 2.2, Don Norman, Jakob Nielsen, Baymard, or ISO 9241-11) and be tied directly to a specific observed element or task failure.

---

## 💎 The Six-Phase "Continuous Loop" UX Process

Every UX project, redesign, or feature request must walk through these six discrete phases. We reject pure heuristic evaluations on invented personas and instead mandate real evidence inputs and empirical testing:

```
  🗺️ PHASE 0: RESEARCH ──► 🗺️ PHASE 1: DISCOVER ──► 🎯 PHASE 2: DEFINE ──► 🎨 PHASE 3: DEVELOP ──► 🚀 PHASE 4: DELIVER ──► 🕒 PHASE 5: LEARN
  (Evidence Harvesting)    (Context & Journeys)     (Cognitive Audit)      (Interaction Design)    (Accessibility/Math)    (Empirical Testing)
```

---

### PHASE 0: RESEARCH — Evidence Harvesting & Confidence Scales

UX is invalid without empirical inputs. We forbid inventing personas from imagination without grounding them in raw data.

#### 1. Evidence Confidence Hierarchy
When defining user behavior, pain points, or needs, the agent must classify and state the **Evidence Confidence Level**:
* **Grade A (Observed Truth):** Direct screen recordings, video usability tests, user interview transcripts, or raw web-analytics event data.
* **Grade B (Reported Truth):** Direct quotes from support tickets, Slack feedback channels, customer-written emails, or NPS comments.
* **Grade C (Expert Heuristic):** Industry-standard design heuristics (e.g., Nielsen, Norman) applied by an expert designer or agent.
* **Grade D (Assumption):** Stakeholder claims, designer guesses, or unvalidated hypotheses.

#### 2. The Unvalidated Assumptions Banner
If any persona or user journey is formulated using *Grade D (Assumption)* data, the agent **MUST** display a prominent warning banner at the top of the output:
```text
⚠️ UNVALIDATED ASSUMPTION: This journey/persona is built on assumptions and has NOT been verified with empirical user data. Treat these findings as hypotheses until Grade A or B evidence is harvested.
```

---

### PHASE 1: DISCOVER — Context Mapping & Jobs-to-be-Done (JTBD)

In this phase, we map out *why* the product exists and *who* is using it, moving from abstract strategy to specific requirements.

#### 1. Formulate the Persona & User Context
Formulate high-resolution Task Completion Scenarios:
* **The Persona Name & Role:** (e.g., "Sarah, Non-Technical Corporate Executive" or "Marcus, High-Pressure SRE On-Call Lead").
* **Jobs-to-be-Done (JTBD):** Frame using the standard: "When I am [situation], I want to [action], so that I can [outcome]."
* **Cognitive & Environmental Context:** What is distracting them? (e.g., "Reviewing this on an iPhone in a taxi between meetings with a spotty 4G connection while Slack is blowing up with alerts.")

#### 2. Harvest the Core Journey
Decompose the system's operational space into **3–5 high-value atomic user journeys** (the critical paths to value).

---

### PHASE 2: DEFINE — Heuristic Inspection & The Cognitive Walkthrough

In this phase, we audit the interface, tracing user journeys step-by-step to identify points of friction, dead-ends, and cognitive blocks.

#### 1. The Atomic Cognitive Walkthrough
For every step in a user journey, the agent must ask the **5 Core Cognitive Questions** (documented in `cognitive-walkthrough-playbook.md`):
* **Q1:** Will the user try to achieve the right effect?
* **Q2:** Will the user notice that the correct action is available?
* **Q3:** Will the user associate the correct action with the effect they are trying to achieve?
* **Q4:** If the correct action is performed, will the user see that progress is being made?
* **Q5 (Error Tolerance):** If the user makes an error, performs an unintended action, or wishes to pivot, is there a clear, painless, and highly visible recovery or reversal path?

#### 2. Auditing out "AI-Slop" (Cosmetic & Structural Slop)
We do not tolerate lazy, generative UI. The agent must scan for and audit out:
* **Cosmetic AI-Slop:** uncustomized shadcn defaults, "Coming Soon" stubs, emoji-as-icons, and high-hype, zero-substance "consultant-speak" copy.
* **Structural AI-Slop:** 
  * *Schema-Driven Navigation:* Exposing the underlying database schema or file tree directly to the user as the navigation structure.
  * *CRUD-as-Workflow:* Forcing the user to manually Create, Read, Update, and Delete multiple forms in sequence instead of designing a unified task-oriented workflow.
  * *Apology-Only Error Messages:* Presenting standard "Error: Something went wrong" alerts without explaining *why* it failed, *what* the consequences are, and *how* to recover.
  * *False Affordances:* Visual elements (e.g., underlined text, gray boxes) that look interactive but are completely static.

---

### PHASE 3: DEVELOP — Interaction Design & Progressive Disclosure

In this phase, we design the alternative layout, focusing on reducing mental load and establishing clear cognitive paths.

#### 1. Primary Action Dominance (Soften the "One-Colored-Button" Rule)
* **The Bar:** Every container or card must exhibit unmistakable visual hierarchy. Exactly *one* primary, recommended action must visually dominate the surface (using solid gradients, high contrast, or size).
* **Secondary and Tertiary Actions:** Must be styled as low-contrast outlines, text links, or icon buttons that subtly glow on hover.
* **Exceptions:** In complex developer workspaces or data dashboards, multiple primary-weight controls are permitted *only* when grouped into logical, functional toolbars or split panels.

#### 2. Progressive Disclosure of Complexity
* **At-A-Glance Executive View:** The default state shows the minimum information required to understand system health and identify what needs attention.
* **Details on Demand:** Technical parameters, logs, raw JSON outputs, and shell traces are hidden inside collapsible details accordions. They are easily accessible, but do not clutter the primary experience.

#### 3. State & Feedback Loops
* **Empty States:** Never show a blank screen. Show an illustrative state, a clear description of why it's empty, and the direct unblocking action button.
* **Loading & Progress States:** Long-running processes must show active sub-step indicators, estimated completion, and a prominent, highly visible **Abort / Cancel** button.

---

### PHASE 4: DELIVER — Programmatic Verification & Accessibility Math

In this phase, we execute deterministic checks to verify that the redesigned interface meets accessibility guidelines.

#### 1. Color Contrast Math (WCAG 2.2 AA Floor)
* Text-to-background contrast ratios must be mathematically calculated and verified.
* Primary body text must achieve a contrast ratio of at least **4.5:1** on its background.
* Large display text or interactive UI borders must achieve at least **3:1**.
* *Note:* Banish pure black (`#000000`) and pure white (`#ffffff`) combinations where possible, preferring softer high-contrast neutral scales (e.g., `#1e293b` slate on `#f8fafc` gray-blue) to reduce eye fatigue.

#### 2. Complete Accessibility (Beyond Contrast)
* **Tap targets:** Must be at least **44x44px** (preferably **48x48px** in responsive layouts) to prevent misclicks.
* **Keyboard Navigation:** Every interactive element must be reachable using the `Tab` key, and have a highly visible focus ring.
* **Focus Management:** When a modal or accordion is opened, focus must automatically trap inside that container.

---

### PHASE 5: LEARN — Downstream Empirical Usability Testing

Expert inspection catches only 30–50% of real usability failures. We close the design loop with empirical measurement.

#### 1. Usability Testing Walkthroughs
* Recruit real users (or run high-fidelity terminal user-simulations) to execute the core journeys.
* Record usability failures where the user deviates from the happy path, hesitates for more than 5 seconds, or expresses confusion.

#### 2. Hard Usability Metrics
Every design iteration must track and report these three hard metrics:
* **Task Completion Rate:** The percentage of users/simulations that successfully reach the success criteria.
* **Time-on-Task (ToT):** The total elapsed seconds required to complete the journey.
* **Error Rate:** The average number of invalid actions or misclicks made per user during the task.
* **Rage-Quit Score:** Instances where a user aborts the flow out of frustration due to severe cognitive friction.

These metrics must be logged in the active matter's `logs/usability-metrics.jsonl` to ensure design decisions are backed by empirical progression.
