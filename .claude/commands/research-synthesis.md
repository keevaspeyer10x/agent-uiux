# `/research-synthesis` — Upstream Evidence Harvesting

This command handles the harvesting of Grade A (Observed) and Grade B (Reported) user data to formulate grounded Task Completion Scenarios, ensuring that design decisions are backed by empirical user reality, not stakeholder assumptions.

---

## Operating Procedure

When `/research-synthesis` is invoked, execute the following steps:

### Step 1: Ingest Evidence Sources
Scan the repository and environment for concrete inputs:
* **Support Logs / Intercom / Helpdesk exports:** Identify recurring user help-requests.
* **Slack Channels:** Read user feedback shared directly in team or client channels.
* **Web-Analytics Metrics:** Read page events, drop-off rates, conversion paths, and screen hotzones.
* **User Interviews & Surveys:** Read transcripts or verbatim feedback files in `context/`.

### Step 2: Rate Evidence Confidence Levels
Map every customer claim or user behavior to the standard **Evidence Confidence Scale**:
* **Grade A:** Playwright trace logs, Hotjar screen recordings, analytics funnels, or direct user video interviews.
* **Grade B:** Support tickets, NPS feedback text, Slack client complaints, email queries.
* **Grade C:** Expert heuristic audits (e.g., prior Nielsen or Don Norman walkthroughs).
* **Grade D:** Stakeholder claims, product manager guesses, or model assumptions.

### Step 3: Extract Core "Jobs-To-Be-Done" (JTBD)
Map observations into the standard JTBD template:
* *"When I am [operational situation/trigger], I want to [execute a specific action], so that I can [reap a clear business or technical outcome]."*

### Step 4: Construct the Grounded Persona & Scenario
Replace generic demographic profiles with specific **Task Completion Scenarios**:
```markdown
## Grounded Scenario: [Task Name]
* **User Context:** [Real persona, domain knowledge level, active devices, emotional pressure, cognitive load]
* **Friction Evidence:** [Quote or metric showing why this is hard today - Grade A/B citation]
* **Expected Flow:** [The happy path sequence to task success]
* **Rage-Quit Budget:** [Maximum allowed failures before task abandon]
```

### Step 5: Generate the Assumptions & Risk Register
If any step in the journey relies on *Grade D (Assumption)* data, add it to the **Assumptions & Risk Register** inside the active matter folder. Every assumption must be paired with a proposed verification task (e.g., "Assumption: User knows where to find log button. Verification: Run usability test with 3 users next Tuesday").
