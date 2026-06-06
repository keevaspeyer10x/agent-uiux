-- work.keeva.space SQLite Schema
-- Phase 1 — Decision Feed backbone
-- Applied to: /home/keeva/data/work-keeva-space.db

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── tasks ───────────────────────────────────────────────────────────────────
-- Core decision / action item record.
CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    title       TEXT    NOT NULL,
    description TEXT,
    status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK(status IN ('pending','in_progress','decided','done','dismissed')),
    priority    INTEGER NOT NULL DEFAULT 50,   -- 0 = highest; 100 = lowest
    source      TEXT,                          -- 'asana' | 'drive' | 'manual' | ...
    source_id   TEXT,                          -- external system record ID
    due_at      TEXT,                          -- ISO-8601 UTC
    decided_at  TEXT,                          -- ISO-8601 UTC
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at   ON tasks(due_at);

-- ─── task_contexts ───────────────────────────────────────────────────────────
-- Arbitrary key-value context blobs attached to a task (Drive links, Asana URLs,
-- agent observations, etc.).
CREATE TABLE IF NOT EXISTS task_contexts (
    id         TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    task_id    TEXT    NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    key        TEXT    NOT NULL,
    value      TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_task_contexts_task_id ON task_contexts(task_id);

-- ─── outbox_queue ────────────────────────────────────────────────────────────
-- Transactional outbox for agent→external writes (Asana tasks, Drive comments,
-- Slack notifications).  Delivered by a worker that polls for pending rows.
CREATE TABLE IF NOT EXISTS outbox_queue (
    id           TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    event_type   TEXT    NOT NULL,   -- e.g. 'asana.task.create', 'slack.notify'
    payload      TEXT    NOT NULL,   -- JSON blob
    status       TEXT    NOT NULL DEFAULT 'pending'
                         CHECK(status IN ('pending','processing','done','failed')),
    attempts     INTEGER NOT NULL DEFAULT 0,
    last_error   TEXT,
    scheduled_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    processed_at TEXT,
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_outbox_status       ON outbox_queue(status);
CREATE INDEX IF NOT EXISTS idx_outbox_scheduled_at ON outbox_queue(scheduled_at);

-- ─── agent_runs ──────────────────────────────────────────────────────────────
-- Log of every agent execution (Drive poller, Asana sync, decision agent).
CREATE TABLE IF NOT EXISTS agent_runs (
    id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    agent       TEXT    NOT NULL,   -- 'drive_poller' | 'asana_sync' | 'decision_agent'
    status      TEXT    NOT NULL DEFAULT 'running'
                        CHECK(status IN ('running','success','failed','skipped')),
    summary     TEXT,
    items_seen  INTEGER,
    items_new   INTEGER,
    started_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    finished_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent      ON agent_runs(agent);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs(started_at);

-- ─── audit_events ────────────────────────────────────────────────────────────
-- Append-only audit log.  BEFORE UPDATE and BEFORE DELETE triggers enforce
-- immutability — no row may ever be changed or removed.
CREATE TABLE IF NOT EXISTS audit_events (
    id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    entity_type TEXT    NOT NULL,   -- 'task' | 'outbox_queue' | 'agent_run' | ...
    entity_id   TEXT    NOT NULL,
    action      TEXT    NOT NULL,   -- 'created' | 'updated' | 'status_change' | ...
    actor       TEXT,               -- user email or agent name
    old_value   TEXT,               -- JSON snapshot of prior state (nullable)
    new_value   TEXT,               -- JSON snapshot of new state (nullable)
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_events(created_at);

-- Prevent updates to audit_events (append-only enforcement)
CREATE TRIGGER IF NOT EXISTS trg_audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN
    SELECT RAISE(FAIL, 'audit_events is append-only: UPDATE is forbidden');
END;

-- Prevent deletes from audit_events (append-only enforcement)
CREATE TRIGGER IF NOT EXISTS trg_audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN
    SELECT RAISE(FAIL, 'audit_events is append-only: DELETE is forbidden');
END;
