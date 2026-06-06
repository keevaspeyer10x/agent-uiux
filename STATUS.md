# STATUS — agent-uiux / work.keeva.space (Apex Organiser COO)
_State: ACTIVE · Updated 2026-06-06 · Phase 1 complete_

---

## What This Is

`agent-uiux` is the home of Keeva's UX design agent and the **Apex Organiser (Apex COO)** product — a headless background operations assistant with a premium light-mode web cockpit at `work.keeva.space`.

The purpose of `work.keeva.space` is to automate 95% of Keeva's administrative preparation (drafting emails, summarising meeting transcripts, compiling repo statuses, tracking commercial terms) with Keeva as a click-to-approve decision maker.

---

## Current State (as of 2026-06-06)

### ✅ Phase 1 Complete (ak_uiux1)

All Phase 1 deliverables deployed and verified:

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Nginx vhost `work.keeva.space` | ✅ Active | Port 8122, OAuth2-proxy auth_request, email allowlist, Cache-Control no-store |
| FastAPI skeleton (`backend/app.py`) | ✅ Running | Serves Decision Feed HTML + `/webhooks/asana` |
| SQLite schema (`backend/schema.sql`) | ✅ Applied | `/home/keeva/data/work-keeva-space.db` — 5 tables + audit triggers |
| systemd user service | ✅ Active | `work-keeva-space.service` on port 8122 |
| SSL cert | ✅ Valid | Wildcard `*.keeva.space` (expires 2026-08-25) |

**Replaced:** `apex-coo.service` (the previous Asana webhook handler on 8122) is now disabled. The new `work-keeva-space.service` preserves the `/webhooks/asana` endpoint for continuity.

### 🔜 Phase 2 — Drive Poller + Asana Integration
Next steps (open tracking in new issue):
1. **Google Drive transcript poller** — watches folder `17KFf41CfSqWRyzOSpjsHjoTbPjDGQMQA` for new meeting transcripts
2. **Asana sync** — pull tasks from Asana into SQLite `tasks` table; wire outbox queue
3. **Decision Feed data** — replace empty-state with real tasks from SQLite
4. **Email draft approval** — Gmail draft creation + approval flow

---

## Architecture

```
work.keeva.space (HTTPS)
  └── nginx (Docker, /home/keeva/infra/nginx.conf)
        ├── /oauth2/   → oauth2-proxy:4180  (auth)
        ├── /webhooks/ → localhost:8122      (public, no auth)
        └── /          → localhost:8122      (auth_request gated, email allowlist)
                              │
                        work-keeva-space.service
                        /home/keeva/repos/agent-uiux/backend/app.py
                              │
                        /home/keeva/data/work-keeva-space.db (SQLite WAL)
```

## Database

**File:** `/home/keeva/data/work-keeva-space.db`
**Tables:** `tasks`, `task_contexts`, `outbox_queue`, `agent_runs`, `audit_events`
**Audit enforcement:** `audit_events` has BEFORE UPDATE and BEFORE DELETE triggers that raise errors (append-only)

## Core Design Principles (do not deviate)
- **Asana is the primary front-end** — `work.keeva.space` is a read-only decision feed, not a task manager
- **Light Mode by default** — soft slate palette (`#f8fafc` bg, `#ffffff` cards, `#0f172a` text)
- **Progressive disclosure** — only outcomes visible by default; logs/diffs behind expandable panels
- **Deterministic risk routing** — never model-inferred; S = Reach × Reversibility
- **Tamper-evident audit** — append-only SQLite with hash chaining; no UPDATE/DELETE on audit tables
- **Email allowlist, not domain wildcard** — `keeva.speyer@10xlabs.com.au` and `keeva.speyer@gmail.com` only

## Design references
| File | What it covers |
|---|---|
| `matters/apex-organiser/research/detailed_design.md` | **Full v3.0 production spec** — read this first |
| `matters/apex-organiser/research/index.md` | Research index |
| `docs/design-process/workflow.md` | Double Diamond UX process + design standards |
| `docs/design-process/cognitive-walkthrough-playbook.md` | Novice user journey analysis |

<!-- Keep this file to one screen. -->
