# STATUS — agent-uiux / work.keeva.space (Apex Organiser COO)
_State: PAUSED · Updated 2026-06-06 · Design complete; build not started_

---

## What This Is

`agent-uiux` is the home of Keeva's UX design agent and the **Apex Organiser (Apex COO)** product — a headless background operations assistant with a premium light-mode web cockpit at `work.keeva.space`.

The purpose of `work.keeva.space` is to automate 95% of Keeva's administrative preparation (drafting emails, summarising meeting transcripts, compiling repo statuses, tracking commercial terms) with Keeva as a click-to-approve decision maker.

---

## Current State (as of 2026-06-06)

### ✅ What exists
- **Full production-grade design spec v3.0** committed at `matters/apex-organiser/research/detailed_design.md`
  - Calm Design Light Mode UI spec
  - Deep Asana integration with privacy segregation (email allowlist, not domain wildcards)
  - Deterministic 3R risk framework (Reach × Reversibility = S, routes to Auto-Act / Propose / Hold)
  - Durable SQLite outbox queue with 10-second undo
  - Tamper-evident append-only audit logs with hash chaining
  - Complete DB schema (tasks, task_contexts, outbox_queue, agent_runs, audit_events)
  - OAuth2-proxy Nginx block spec for `work.keeva.space` on port 8122
  - Data flows: Drive transcript ingestion, email draft approval & send
- **HTML mockup live at `https://share.keeva.space/apex-organiser/`** (built during lost session)
- **MCP server scaffold** at `mcp-server/` (TypeScript, not yet implemented)
- **UX research** at `docs/research/openai-o4-mini-deep-research.md` (AI Cognitive Overload, Calm Design patterns)
- **VVS integration spec** at `docs/design-process/vvs-integration.md`
- **Cognitive walkthrough playbook** at `docs/design-process/cognitive-walkthrough-playbook.md`

### ❌ What does NOT exist yet (build not started)
- No backend code for `work.keeva.space`
- No Nginx vhost (Nginx block is spec'd in design doc but not committed to vps-infra)
- No Asana integration code
- No Gmail draft/send pipeline
- No SQLite database on VPS
- No outbox queue daemon
- No Google Drive transcript poller

### ⚠️ Context from today (partially lost)
- A session today was working on refining the design and potentially starting scaffolding — that session's conversational context was lost due to a database sync bug.
- The HTML mockup at `share.keeva.space/apex-organiser/` was built today. The source HTML for it may be under `projects/share.keeva.space/` in agent-web — **check there first** before assuming it's lost.
- `agent-COO#96` references the Devin integration; the COO-side tracking issue for `work.keeva.space` needs to be opened (see GitHub Issues section below).

---

## Where to Pick This Up

### Immediate next steps
1. **Find the mockup source** — check `agent-web/projects/share.keeva.space/public/apex-organiser/` or similar. If it's there, commit it properly.
2. **Open a GitHub issue** on this repo (or agent-COO) as the canonical tracking issue for the `work.keeva.space` build.
3. **Create Nginx vhost** in `vps-infra/nginx.conf` for `work.keeva.space → localhost:8122`.
4. **Scaffold the backend** — FastAPI app serving the Decision Feed from SQLite, with Asana integration. The DB schema is fully spec'd in `detailed_design.md`.
5. **Wire the Drive transcript poller** — watches Google Drive folder `17KFf41CfSqWRyzOSpjsHjoTbPjDGQMQA`.

### Design references
| File | What it covers |
|---|---|
| `matters/apex-organiser/research/detailed_design.md` | **Full v3.0 production spec** — read this first |
| `matters/apex-organiser/research/index.md` | Research index |
| `docs/design-process/workflow.md` | Double Diamond UX process + design standards |
| `docs/design-process/cognitive-walkthrough-playbook.md` | Novice user journey analysis |
| `docs/design-process/vvs-integration.md` | Playwright + VVS visual verification spec |
| `docs/research/openai-o4-mini-deep-research.md` | AI Cognitive Overload & Calm Design research |

## Core Design Principles (do not deviate)
- **Asana is the primary front-end** — `work.keeva.space` is a read-only decision feed, not a task manager
- **Light Mode by default** — soft slate palette (`#f8fafc` bg, `#ffffff` cards, `#0f172a` text)
- **Progressive disclosure** — only outcomes visible by default; logs/diffs behind expandable panels
- **Deterministic risk routing** — never model-inferred; S = Reach × Reversibility
- **Tamper-evident audit** — append-only SQLite with hash chaining; no UPDATE/DELETE on audit tables
- **Email allowlist, not domain wildcard** — `keeva.speyer@10xlabs.com.au` and `keeva.speyer@gmail.com` only

<!-- Keep this file to one screen. -->
