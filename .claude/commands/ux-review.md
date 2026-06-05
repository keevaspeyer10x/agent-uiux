# `/ux-review` — Human-Centered UX Review and Walkthrough

A rigorous, cognitive-walkthrough critique of interfaces, systems, and dashboards to reduce mental load, optimize feedforward/feedback loops, and align software structure with user mental models.

## Heuristic Framework: Don Norman's Design of Everyday Things

Every interface must be audited across the **Seven Stages of Action**:

### 1. Goal (What do I want to accomplish?)
* **UX Question:** Does the interface clearly orient the user toward their high-level goals?
* **Common Failure:** Walls of technical features and disconnected issue lists that do not tell the user what they are trying to achieve.
* **The Bar:** The primary dashboard state must display *executive, outcomes-first* headings (e.g., "Active Matters require your approval to proceed to next stage" instead of "Issue Backlog").

### 2. Plan (What are the alternative sequences of action?)
* **UX Question:** Is it easy to understand the different paths available?
* **Common Failure:** Dozens of equivalent-weight buttons or links scattered across the page.
* **The Bar:** Enforce the **"One-Colored-Button" Rule**. Only the primary, recommended CTA per component card has a colored background gradient; secondary buttons are low-contrast outlines that subtly glow on hover.

### 3. Specify (What action can I do now?)
* **UX Question:** Does the user know exactly *what* button to press, *why* they should press it, and *what* will happen immediately after?
* **Common Failure:** Ambiguous button labels ("Run", "Execute", "Submit") with no context.
* **The Bar:** Every interactive button must provide explicit **Feedforward** — stating the precise consequence of the action (e.g., `[ 🧹 Let Agent Tidy Up Repo ]` or `[ 🛑 Abort Active Wave ]`).

### 4. Perform (How do I do it?)
* **UX Question:** Is the execution of the action seamless, responsive, and error-tolerant?
* **Common Failure:** Unresponsive clicks, lack of loading indicators, or non-cancelable long-running background tasks.
* **The Bar:** When an action is clicked, immediately transition the UI state to a progress indicator. Long-running tasks must expose a prominent cancel button (e.g., orange outline `[ 🛑 Abort ]`) connected to an abort endpoint.

### 5. Perceive (What happened?)
* **UX Question:** Is there clear, immediate visual indication that the system is responding?
* **Common Failure:** Quiet, background-only processing with no visible change in the UI.
* **The Bar:** Real-time state updates. No polling loops. Utilize Server-Sent Events (SSE) to push streaming telemetry (e.g., current sub-step, running cost, elapsed time) to the browser.

### 6. Interpret (What does it mean?)
* **UX Question:** Can the user make sense of the new system state without technical translation?
* **Common Failure:** Dumping raw JSON payloads, terminal stdout, or python stack traces in the center of the viewport.
* **The Bar:** **Progressive Disclosure of Complexity**. Hide raw system logs, terminal output, and shell traces inside collapsible `<details>` accordions. Keep the primary interface strictly limited to human-readable summaries.

### 7. Compare (Have I achieved my goal?)
* **UX Question:** Does the system explicitly confirm that the user's intent was satisfied?
* **Common Failure:** Page refreshes that discard state, leaving the user wondering if the transaction completed.
* **The Bar:** Clean, satisfying success states. Celebrate resolution with a brief, high-readability confirmation message, and update global status ribbons to the next logical action.

---

## The UX Audit Process

When invoked via `/ux-review`, perform the following deep process:

```
┌──────────────────────────────────────────────┐
│  Phase 1: Identify User Persona & Context    │
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│  Phase 2: Map the 7 Stages of Action         │
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│  Phase 3: Multi-Model Cognitive Walkthrough  │ (Using MultiMinds: Claude, GPT, Gemini)
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│  Phase 4: Programmatic Accessibility Audit   │ (Luminance Contrast & Layout Spacing)
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│  Phase 5: Refinement & Actionable Redesign   │
└──────────────────────────────────────────────┘
```

### Phase 1: Context Harvesting
* Identify the user persona (e.g., non-technical executive vs. SRE platform operator).
* Define the primary core task the user is trying to accomplish.
* List all environmental constraints (screen size, host sandbox limits, cognitive distractions).

### Phase 2: Heuristic Mapping
* Audit the existing layout, tracing a complete loop through Don Norman's Seven Stages of Action.
* Identify where the **Gulf of Execution** occurs (user is confused about what to press or what will happen).
* Identify where the **Gulf of Evaluation** occurs (user is blind to what the system is doing or why).

### Phase 3: Consensus Review
* Run a multi-model critique using `minds ask --all`.
* Ask the models to evaluate the interface's cognitive load, layout density, and information hierarchy.
* Synthesize their critiques, filtering out superficial UI "fixes" and focusing on deep structural UX improvements.

### Phase 4: Contrast & Accessibility Math
* Run programmatic checks via Axe-Core / Playwright or local scripts.
* Ensure text/background contrast strictly meets **WCAG 2.1 AA** targets (e.g., 4.5:1 for body, 3:1 for large text).
* Verify layout padding: elements must have generous breathing room (e.g., standard margins `p-6` or `gap-8`), preventing high-density data sheets from causing ocular fatigue.

### Phase 5: Actionable Redesign Blueprint
* Present a comprehensive, outcome-first blueprint that does *not* jump to code.
* Detail the exact structural and layout updates.
* Map out the updated feedforward messages and feedback loops.
* Wire the changes into the appropriate static/dynamic views.

---

## Operational Directives

* **NO Superficial Shortcuts:** Never propose styling changes (colors, borders, fonts) without first addressing the underlying structural hierarchy, user intent, and informational flow.
* **Avoid Duplication:** Do not redefine brand tokens or visual copy standards. Read color pallets from `agent-brand` (when available) and respect `agent-web`'s `knowledge/first-pass-web-quality.md` and `knowledge/copy-principles.md` for customer-facing sites.
* **Keep Details Hidden:** Ensure all raw logs, processes, and technical parameters default to a hidden, collapsed state. Keep the main command layout clean, serene, and calm.
