# Playbook: The Cognitive Walkthrough Workbook

This playbook is the hands-on, step-by-step workbook for executing a **Cognitive Walkthrough Usability Inspection**. It is the concrete implementation of Phase 2 of our design process. 

Whenever **Agent UI/UX** is asked to evaluate a user journey, onboarding flow, or user interface, it must open this playbook and execute the walkthrough step-by-step, documenting its findings in the standard matter manifest.

---

## 📅 Walkthrough Process Steps

```
Step 1: Scoping ──► Step 2: Decomposition ──► Step 3: Atomic Evaluation ──► Step 4: Fix-Plan
```

---

## STEP 1: Define the Scoping Envelope (10 mins)

Before starting the walkthrough, you must establish the boundary conditions. Document the following envelope in the matter manifest:

1. **The User Persona Profile:**
   * **Name/Type:** (e.g., Novice Admin, Executive Manager, SRE Team Member)
   * **Domain Knowledge:** What terms, icons, or concepts does this persona already know? (e.g., "Knows what a repository is, but doesn't know what a Docker volume mounting is.")
   * **Technical Proficiency:** How comfortable are they with complex software?
   * **Environmental Context:** Is the user distracted? Are they looking at a small screen? Are they under high-pressure?

2. **The Defined Core Task:**
   * Write out the exact goal the user is trying to accomplish (e.g., "Add a new data connector to the platform and confirm it is streaming").
   * Define the **Success Criteria**: How does the user *know* the task has succeeded? What is the visual/cognitive proof?

3. **The Entry Point:**
   * Where does the user begin the task? (e.g., "On the dashboard front page after logging in").

---

## STEP 2: Task Decomposition (15 mins)

Break the high-level user goal down into its **atomic actions** – the absolute smallest, individual behaviors the user must execute. 

Do not group multiple steps together. An atomic action is a single movement, click, input, or wait state.

### Example Decomposition ("Deploying a new database"):
1. Locate the "Deploy New Service" action button.
2. Click the "Deploy New Service" button.
3. Locate the "Service Type" dropdown menu.
4. Click the dropdown menu and select "PostgreSQL Database".
5. Locate the "Service Name" text field and enter "production-db".
6. Locate the "Configure Memory" slider.
7. Slide the memory to "2GB".
8. Locate and click the "Launch Database" primary CTA.
9. Wait for the deploy progress telemetry to reach 100% and show a green confirmation checkmark.

---

## STEP 3: Atomic Step Evaluation (45 mins)

For **every single atomic action** identified in Step 2, run a strict evaluation loop against the **4 Core Cognitive Questions**. Document the answers verbatim:

```markdown
### Action [N]: [Action Description]
* **User's Active Goal:** [What the user believes they are trying to achieve at this exact moment]
* **System Surface State:** [What is currently visible on screen]

#### Q1: Will the user try to achieve the right effect?
* **Cognitive Analysis:** Is the user's immediate intent aligned with this step? Do they know this is what they should do next?
* **Verdict:** [PASS | FAIL | RISK]
* **Evidence/Reasoning:** [Why did it pass/fail? Cite specific elements]

#### Q2: Will the user notice that the correct action is available?
* **Cognitive Analysis:** Is the control or interactive element highly visible? Is it buried or off-screen?
* **Verdict:** [PASS | FAIL | RISK]
* **Evidence/Reasoning:** [Cite visual hierarchy, color prominence, layout positioning, size]

#### Q3: Will the user associate the correct action with the effect they are trying to achieve?
* **Cognitive Analysis:** Does the label, icon, or visual signifier of the control match the user's vocabulary and intent? Will they recognize this button does what they want?
* **Verdict:** [PASS | FAIL | RISK]
* **Evidence/Reasoning:** [Cite button labels, tooltip copy, icons, visual affordance]

#### Q4: If the correct action is performed, will the user see that progress is being made?
* **Cognitive Analysis:** Does the system provide immediate, clear feedback that the action was received and is processing? Does it communicate progress in human-readable terms?
* **Verdict:** [PASS | FAIL | RISK]
* **Evidence/Reasoning:** [Cite state changes, loading indicators, progress telemetry, messages]
```

---

## STEP 4: Synthesize the Rated UX Fix-Plan (15 mins)

Consolidate all "FAIL" and "RISK" verdicts from your walkthrough into a prioritized, actionable backlog.

### 1. Assign Severity Ratings
For every identified UX issue, assign one of the following standard severity ratings:
* **Catastrophic (4):** Prevents the user from completing the task or causes critical, irreversible errors.
* **High (3):** Causes extreme friction, severe confusion, or forces the user to seek external support to continue.
* **Medium (2):** Causes temporary confusion or annoying friction, but the user is eventually able to recover and proceed.
* **Low (1):** Minor or cosmetic issue that does not affect task completion but degrades aesthetic appeal or trust.

### 2. Construct the Actionable Backlog
Format your final output as a ranked backlog, mapping each issue to its corresponding phase of Don Norman's *Seven Stages of Action*:

| Priority | Stage of Action | Issue Description | Severity | Concrete Redesign Proposal |
| :--- | :--- | :--- | :---: | :--- |
| **1** | Specify (Gulf of Execution) | Vague buttons "Run" and "Do it" do not state consequences. | High | Change labels to outcome-oriented terms: `[ 🌊 Run Assembly Line Wave ]` and `[ 🧹 Let Agent Tidy Up ]`. |
| **2** | Perceive (Gulf of Evaluation) | Long running deployment goes silent, user thinks it's hung. | High | Integrate a Server-Sent Events (SSE) progress bar displaying active sub-step telemetry and elapsed time. |
| **3** | Interpret (Gulf of Evaluation) | Raw terminal logs are dumped on-screen, confusing non-technical persona. | Medium | Group log files and tuck them inside a collapsed, expandable accordion labeled "Technical Details & CLI Logs". |

This structured fix-plan must be written directly to the active matter folder so that coding agents (like `agent-web` or `keeva-unattended-workflow`) can read and execute the changes deterministically.
