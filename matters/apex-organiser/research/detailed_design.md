# Apex Organiser (or Apex COO) — Comprehensive System Design Specification
**Version:** 3.0 (Production-Grade, Hardened, Light Mode, Asana-First)
**Author:** SRE & Systems Architect Agent
**Status:** Approved & Hardened (Critiqued by MultiMinds Claude-Opus-4.8)

---

## 1. Executive Summary & Core Mission

The **Apex Organiser (Apex COO)** is a headless, background operations assistant that operates on the Intrepid VPS, utilizing **Asana as its primary front-end** and Google Drive/Gmail as its core communication channels. 

Its primary mission is to **automate 95% of administrative preparation** (drafting client/partner emails, summarizing raw meeting transcripts into textbook briefings, compiling cross-repository software statuses, and tracking outstanding commercial terms) while keeping the founder (Keeva) strictly in-the-loop as a click-to-approve decision maker.

To solve the "dashboard fatigue" and "multi-conversation overload" common in AI workflows, Apex COO adopts **Asana-first task management** for active collaboration, while providing a **calm, premium light-mode visual cockpit (`work.keeva.space`)** as a chronological "Decision Feed" and "Black Box Recorder" to review past agent runs and drill down into historical logs.

---

## 2. Core Architectural Pillars & Hardened Principles

### A. The "Calm Design" Light Mode UI (`work.keeva.space`)
*   **Whitespace & Visual Serenity:** A single, centered, wide vertical column (`max-w-2xl mx-auto`) with high padding and breathing room. No left sidebars, no scrolling terminal windows, no noisy performance tickers.
*   **Premium Light Palette:** Soft gray backgrounds (`#f8fafc` slate-gray), crisp white cards (`#ffffff`), and deep slate typography (`#0f172a`). Accent colors are used sparingly for active states (`#2563eb` linear blue) and status flags.
*   **Progressive Disclosure:** By default, only outcomes and decisions are visible. All technical traces, raw logs, model prompts, and git diffs are hidden behind clickable, beautiful, interactive disclosure components.
*   **Contrast Accessibility:** Status indicators and badges utilize WCAG AA compliant contrast ratios (minimum 4.5:1) pairing color with distinct semantic icons/labels to ensure full accessibility.

### B. Deep Asana Integration & Privacy Segregation (Hardened)
*   **The Main Front-End:** Daily tasks, assignments, status changes, and quick notes occur natively in Asana.
*   **Strict Privacy/Segregation Enforcement:** 
    *   **The Domain-Wildcard Danger Resolved:** The OAuth proxy at `work.keeva.space` strictly rejects domain-level wildcards. Access is restricted exclusively to an **explicit email allowlist** (e.g., `keeva.speyer@10xlabs.com.au` and `keeva.speyer@gmail.com`). No other team members on the domain can load the cockpit.
    *   **Deterministic Project Allowlists:** The agent strictly avoids dynamic or soft-matching of project names. It utilizes a hard-coded allowlist of Keeva's personal project IDs stored securely in Infisical.
    *   **Default-Deny Privacy Routing:** If a task's classification is ambiguous or its project ID is missing, the system defaults to routing it to the *Private Personal* workspace, completely bypassing shared corporate folders or team boards.

### C. Transparency, Audibility & The Tamper-Evident Black Box (Hardened)
*   **The Drill-Down Console:** Every card in the web feed is fully clickable. Clicking a card slides open or expands an in-context detail console with tabs:
    1.  **Draft/Action:** Interactive textareas with live editing, word counts, and action buttons.
    2.  **Cognitive Log:** The exact LLM provider, prompt template version (using Git commit SHA / template hash), temperature, and raw reasoning trace.
    3.  **Command & File Log:** The exact terminal commands executed by the agent, files modified, and git diffs generated.
    4.  **Audit Trail:** Immutable timestamped history of how this task was processed (ingested ➔ analyzed ➔ drafted ➔ queued).
*   **Tamper-Evident Append-Only Logs:** SQLite database records for `agent_runs` and `audit_events` are strictly append-only. **SQL triggers reject all `UPDATE` and `DELETE` requests**, ensuring an immutable record of historical runs. Rows are linked via hash chaining (`prev_hash`) to render any database modification immediately evident.
*   **Authorship Separation:** The database separately stores `ai_output` (the raw drafted response) and `final_output` (the human-edited version) with a `edited_by_human` boolean, preserving a perfect audit of machine vs. human authorship.

### D. Deterministic 3R Operational Risk Framework (Hardened)
To prevent "hallucination-induced auto-actions" (e.g., the LLM misclassifying a client email as an internal mock check), the risk classification is strictly rule-based and deterministic, never model-inferred:
*   **Reach ($R_{each}$):** 
    *   `1` = Self / Internal System change (no human contact)
    *   `2` = Shared Team / Staff workspace (e.g., Slack, shared Asana)
    *   `3` = External Client / Public (e.g., sending an email to a client, merging to main branch)
*   **Reversibility ($R_{eversibility}$):**
    *   `1` = High Reversibility (Type 2 - can be undone instantly in one click, e.g., archiving a draft, changing a local variable)
    *   `2` = Medium Reversibility (Can be corrected with low cost, e.g., creating an internal PR, creating a draft)
    *   `3` = Low Reversibility (Type 1 - high-cost or irreversible, e.g., sending an email, merging a PR, paying an invoice)
*   **Risk Severity ($S$) Calculation:**
    $$S = R_{each} \times R_{eversibility}$$
*   **Deterministic Action Routing Matrix:**
    *   **$S \le 2$ (Low Risk):** **Auto-Act.** (e.g., Reach=1, Rev=1/2 or Reach=2, Rev=1). The agent executes autonomously in the background and logs the completed result to the "Completed Feed" (e.g., updating a local `STATUS.md`).
    *   **$2 < S \le 6$ (Medium Risk):** **Propose.** (e.g., Reach=3, Rev=1/2 or Reach=2, Rev=2/3). The agent prepares the draft/briefing and puts it in the "Decision Feed", waiting for Keeva's manual approval.
    *   **$S > 6$ (High Risk):** **Hold.** (e.g., Reach=3, Rev=3 - S=9). Enforces a hard manual lock. Requires explicit manual verification and multi-factor approval checks.
    *   **Hard Ceiling Override:** Any external-facing action (Reach=3) or irreversible operation (Reversibility=3) defaults to **Hold** or **Propose**—auto-send is completely forbidden.

### E. Durable Server-Side Outbox & Idempotency (Hardened)
*   **Durable State Queue:** The 10-second countdown does not live in fragile client-side JS or in-memory state. On approval, the task is committed to a **durable, persistent SQLite outbox queue** with `send_at = now + 10s`, `status = 'pending'`, and a unique `idempotency_key`.
*   **Lightweight Daemon Poller:** A robust, low-footprint background worker on the VPS polls for `send_at < now AND status = 'pending'`. 
*   **Crash-Safe & Fail-Safe Recovery:** If the VPS restarts or the server crashes, pending outbox items are safely preserved. On restart, the worker resumes the queue.
*   **Cancellation (Undo):** Clicking "Cancel" simply flips the status in the DB transaction to `cancelled`, instantly halting the send.
*   **Idempotency Protection:** The Gmail API send carries the unique `idempotency_key`. Before making the API call, the database locks the row and marks `status = 'sending'`, completely preventing duplicate email dispatches.

---

## 3. Detailed Data Flow & System Mechanics

### Flow A: Ingestion (Google Drive Transcript to Asana/Web Feed)
1.  **Trigger:** A background cron/Prefect poller watches Google Drive Folder `17KFf41CfSqWRyzOSpjsHjoTbPjDGQMQA` using the Google Drive `changes.watch` API with a persisted `pageToken` checkpoint.
2.  **Processing:**
    *   The poller reads the new transcript.
    *   It calls `minds ask --single --model claude` to extract:
        *   Strategic takeaways (CEO/COO).
        *   Outstanding commercials or deliverables (CFO/CRO).
        *   Textbook briefings and suggest follow-up questions.
3.  **Handoff:**
    *   `apex-coo` writes the complete parsed brief to the central SQLite database on the VPS.
    *   It creates a matching task in Keeva's Asana board (using the appropriate private or public project based on domain).
    *   The Asana card's description contains a clean markdown rendering of the brief, alongside a secure click-to-approve link: `https://work.keeva.space/decide?id=<task_id>`.

### Flow B: Email Draft Approval & Sending
1.  **Trigger:** An email is received (e.g., from a prospective client).
2.  **Processing:**
    *   `apex-coo` ingests the email, cross-references your internal `10x-wiki` for strategic alignments, and drafts a precise, professional reply.
    *   It creates a card in Asana and registers the task in the SQLite DB.
3.  **Review (Human-in-the-Loop):**
    *   Keeva opens Asana or `work.keeva.space` and views the draft.
    *   Keeva can edit the draft directly in the textarea on `work.keeva.space`, or edit the Asana description, or comment in Asana.
4.  **Dispatch & Sending:**
    *   Keeva clicks **"Approve and Send"**.
    *   The task is pushed to the durable outbox queue.
    *   The UI displays the active **10-second countdown** progress bar.
    *   If the countdown expires without cancellation, the background daemon retrieves the `idempotency_key`, triggers the Gmail API, and dispatches the email.
    *   **Failure Handlers:** If the Gmail API returns a 5xx error or connection timeout, the task is transitioned to `status = 'failed'` in the SQLite DB and written to a Dead-Letter Queue (DLQ), generating a "Needs Attention: Email Dispatch Failed" card in Keeva's feed.

---

## 4. Hardened Database Schema (SQLite on VPS)

```sql
-- Core Tasks Table
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,               -- UUID or Asana Task ID
    title TEXT NOT NULL,
    project_id TEXT NOT NULL,           -- Asana Project ID (public or private)
    task_type TEXT CHECK(task_type IN ('email', 'transcript', 'status', 'todo')),
    status TEXT CHECK(status IN ('backlog', 'ready', 'running', 'needs_approval', 'completed', 'cancelled', 'failed')),
    reach INTEGER NOT NULL,             -- 1=System, 2=Team, 3=Client
    reversibility INTEGER NOT NULL,     -- 1=High, 2=Medium, 3=Low
    risk_score INTEGER NOT NULL,        -- reach * reversibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Context/Payloads Table (Authorship Segregated)
CREATE TABLE task_contexts (
    task_id TEXT PRIMARY KEY,
    raw_input TEXT NOT NULL,           -- Raw email or raw transcript
    ai_output TEXT NOT NULL,           -- Original raw AI-generated output
    final_output TEXT,                 -- Edited final version (human-authored / adjusted)
    edited_by_human BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Durable Outbox Queue Table
CREATE TABLE outbox_queue (
    id TEXT PRIMARY KEY,               -- Task ID
    send_at TIMESTAMP NOT NULL,        -- Epoch/timestamp when action triggers
    status TEXT CHECK(status IN ('pending', 'sending', 'sent', 'cancelled', 'failed')) DEFAULT 'pending',
    idempotency_key TEXT UNIQUE NOT NULL,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Tamper-Evident Append-Only Agent Runs Table
CREATE TABLE agent_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    model_used TEXT NOT NULL,          -- e.g. 'claude-3-5-sonnet'
    prompt_version TEXT NOT NULL,      -- Git hash or template commit SHA
    reasoning_trace TEXT,              -- Raw think blocks / reasoning steps
    commands_run TEXT,                 -- List of terminal commands executed (JSON)
    files_changed TEXT,                -- Git patches or list of files changed (JSON)
    api_cost REAL NOT NULL,
    run_duration_ms INTEGER NOT NULL,
    prev_hash TEXT NOT NULL,           -- Hash chain link (SHA-256 of prev row)
    row_hash TEXT NOT NULL,            -- SHA-256 hash of this entire row
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Immutable Append-Only Audit Events Table
CREATE TABLE audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    event_type TEXT CHECK(event_type IN ('ingested', 'drafted', 'approved', 'cancelled', 'sent', 'failed')),
    performer_email TEXT NOT NULL,      -- 'ai-agent' or 'keeva.speyer@10xlabs.com.au'
    prev_hash TEXT NOT NULL,
    row_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

---

## 5. Security, Access & SQL Triggers

### A. SQLite Triggers to Prevent Modification
To guarantee the immutability of the audit trails, SQL triggers are enabled on `agent_runs` and `audit_events`:

```sql
CREATE TRIGGER prevent_agent_runs_update BEFORE UPDATE ON agent_runs
BEGIN
    SELECT RAISE(FAIL, 'Modification of audit trail rows is strictly forbidden.');
END;

CREATE TRIGGER prevent_agent_runs_delete BEFORE DELETE ON agent_runs
BEGIN
    SELECT RAISE(FAIL, 'Deletion of audit trail rows is strictly forbidden.');
END;

CREATE TRIGGER prevent_audit_events_update BEFORE UPDATE ON audit_events
BEGIN
    SELECT RAISE(FAIL, 'Modification of audit events is strictly forbidden.');
END;

CREATE TRIGGER prevent_audit_events_delete BEFORE DELETE ON audit_events
BEGIN
    SELECT RAISE(FAIL, 'Deletion of audit events is strictly forbidden.');
END;
```

### B. OAuth Proxy Email Allowlist Gateway (Nginx block)
```nginx
# Secure routing block for work.keeva.space
server {
    listen 443 ssl;
    server_name work.keeva.space;
    
    # Strictly gate to specific email addresses
    # (Enforced by oauth2-proxy via authenticated email header injection)
    location / {
        auth_request /oauth2/auth;
        
        # Soft check block: only Keeva's verified emails
        if ($upstream_http_x_auth_request_email !~* "^(keeva\.speyer@10xlabs\.com\.au|keeva\.speyer@gmail\.com)$") {
            return 403 "Access Denied: You do not have permission to view this personal cockpit.";
        }
        
        proxy_pass http://localhost:8122; # local Node/Python fast-UI
    }
}
```
