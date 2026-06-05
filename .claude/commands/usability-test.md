# `/usability-test` — Downstream Usability Evaluation

Expert inspection only catches 30–50% of real usability failures. This command conducts downstream usability testing—either using high-fidelity terminal user simulations or guided human walkthroughs—to record empirical performance metrics.

---

## Operating Procedure

When `/usability-test` is invoked, execute the following steps:

### Step 1: Prepare the Usability Test Plan
Define the criteria:
* **The Target Scenario:** Load from `matters/{slug}/research/index.md` or manifest.
* **Success Criteria:** The exact, measurable state that confirms goal completion.
* **Task Budgets:** Max allowed atomic steps (e.g., "Goal: ≤7 steps") and rage-quit score.

### Step 2: Conduct the Simulation / Guided Walkthrough
* If running autonomously, spawn an isolated agent thread acting as the target persona. The simulating agent must navigate the interface, outputting their step-by-step thoughts, hesitations, or mistakes.
* If testing with a human, provide clear step-by-step prompts without instructing them *how* or *where* to click (e.g., "Please try to deploy a database named 'test-db' using the default settings").

### Step 3: Record Core Usability Metrics
At the end of the test, calculate and record these four hard metrics:
* **Task Completion Rate:** (Percentage of successful runs).
* **Time-on-Task (ToT):** Total elapsed seconds required to reach the success criteria.
* **Error Rate:** Average number of invalid actions, misclicks, or wrong inputs made per run.
* **Rage-Quit Score:** A count of instances where the user or simulating agent aborted the flow out of frustration or became permanently blocked.

### Step 4: Write to the Usability Log
Save these results directly to the active matter folder:
📁 `matters/{slug}/logs/usability-metrics.jsonl`

Format:
```json
{"timestamp": "2026-06-06T09:30:00Z", "task_id": "deploy-db", "completion_rate": 1.0, "time_on_task_sec": 142, "error_rate": 1.2, "rage_quit_score": 0}
```

### Step 5: Rank Usability Regressions
Compare metrics against the baseline of the prior build:
* If **Time-on-Task** or **Error Rate** has increased by >15%, flag it as a **UX Regression**.
* List the exact bottleneck or friction point that caused the regression, and output a prioritized redesign ticket for coding agents.
