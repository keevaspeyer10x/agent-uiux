# Integration: Visual Verification Service (VVS) & Agent UI/UX

This guide defines how **Agent UI/UX** programmatically leverages Keeva's **Visual Verification Service (VVS)** (running live at `https://vvs.keeva.space`) to bridge the gap between *heuristics* and *empirical reality*. 

By integrating VVS into our design loop, we transform from an "expert audit bot" into a fully closed-loop, data-driven Human-Centered Design system.

---

## 🛰️ The VVS Architectural Role in the UX Loop

```
                        ┌────────────────────────────────────────────────────────┐
                        │      Visual Verification Service (vvs.keeva.space)     │
                        └───────────────────────┬──────▲─────────────────────────┘
                                                │      │
                          1. Ingests Raw        │      │ 2. Triggers Autonomous
                          Observed Evidence     │      │    Journeys & Tests
                          (Grade A Truth)       │      │
                                                ▼      │
┌──────────────────────────────────────────────────────┴─────────────────────────┐
│                                 AGENT UI/UX                                    │
│   - `/research-synthesis`   - `/ux-review`   - `/usability-test`   - `/critique`│
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Upstream Evidence Gathering (Grade A Truth)
*We forbid designing based on unvalidated assumptions (Grade D).*

When executing the **`/research-synthesis`** command, the agent can programmatically trigger an autonomous exploration on VVS:
* **The API Endpoint:** `POST /api/v2/explore`
* **Payload:**
  ```json
  {
    "url": "https://coding.keeva.space",
    "maxSteps": 15,
    "goals": ["Examine issue list scannability", "Verify button labeling feedforward", "Audit empty states"]
  }
  ```
* **The Return Value:** VVS autonomously traverses the interface, captures snapshots, and reports visual and structural observations.
* **The Integration:** `agent-uiux` imports these findings directly into the matter's `research/index.md` file, classifying them as **Grade A (Observed Truth)** evidence.

---

## 2. Downstream Empirical Usability Testing (Phase 5 of Workflow)
*Expert inspections catch only 30–50% of real failures. We close the loop with automated user simulations.*

When executing the **`/usability-test`** command, the agent initiates an automated visual test on VVS:
* **The API Endpoint:** `POST /api/v2/test-autonomously`
* **Payload:**
  ```json
  {
    "url": "https://coding.keeva.space",
    "testPlan": {
      "cases": [
        {
          "name": "Trigger and cancel an action",
          "steps": [
            "Find and click the primary action button",
            "Wait for the progress telemetry indicator to stream",
            "Click the Cancel / Abort button",
            "Confirm the UI displays a clean cancelled state"
          ]
        }
      ]
    },
    "maxSteps": 30
  }
  ```
* **The Integration:** 
  1. The agent polls or streams progress from `/api/v2/runs/:runId/stream`.
  2. Once complete, it parses the execution telemetry.
  3. It extracts the **Time-on-Task (ToT)**, **Task Completion Rate**, and **Error Rate** from the logs.
  4. It logs these metrics directly to the matter's `usability-metrics.jsonl` database, flagging any performance regressions.

---

## 3. Accessibility & Contrast Math (Phase 4 of Workflow)
*We do not use fuzzy vision model predictions for color contrast or layout padding. We enforce mathematical, deterministic verification.*

VVS executes standard **axe-core** accessibility suites directly inside the Playwright Chromium browser during its runs:
* **The Result:** It returns precise WCAG 2.0/2.1/2.2 AA conformance data, target tap size measurements, and focus outline states.
* **The Integration:** During the **`/ux-review`** or **`/critique`** commands, `agent-uiux` calls the VVS accessibility report to automatically flag:
  * Input contrast values falling below **4.5:1**.
  * Interactive components lacking standard `:focus-visible` outline rings.
  * Tap targets smaller than **44x44px**.

---

## 4. Visual Regression & Baseline Comparison
*When a coding agent (like `agent-web`) refactors an interface, we must verify we haven't introduced spacing or alignment regressions.*

When running the **`/critique`** or **`/ux-review`** loops, the agent can run pixel-level comparisons:
* **The API Endpoint:** `POST /verify` (on `https://vvs.keeva.space`)
* **The Process:** Playwright navigates to the target, captures screenshots, and runs `pixelmatch` against baseline visual states, reporting layout, margin, or alignment drift.
* **The Integration:** If regressions exceed the visual threshold, the audit fails and outputs the visual diff as evidence to the coding thread, preventing broken spacing or alignment changes from shipping.
