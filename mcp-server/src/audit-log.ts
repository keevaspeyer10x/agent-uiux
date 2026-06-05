import { appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const LOG_PATH = join(process.env.UIUX_REPO_ROOT ?? process.cwd(), "logs", "tool-invocations.jsonl");

/** Field names known to contain PII. Add domain-specific PII fields here. */
const PII_FIELDS: ReadonlySet<string> = new Set([
  "person",
  "to_email",
  "to_name",
  "parties",
  "body",
  "content",
  "content_summary",
  "nature",
]);

/**
 * Return a deep copy of params with PII field values replaced by "[REDACTED]".
 * Recurses into nested objects and arrays.
 */
export function redactParams(params: Record<string, unknown>): Record<string, unknown> {
  function redactValue(key: string, value: unknown): unknown {
    if (PII_FIELDS.has(key)) return "[REDACTED]";
    if (Array.isArray(value)) return value.map((item, i) => redactValue(String(i), item));
    if (value !== null && typeof value === "object") {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        obj[k] = redactValue(k, v);
      }
      return obj;
    }
    return value;
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    redacted[key] = redactValue(key, value);
  }
  return redacted;
}

export interface AuditEntry {
  timestamp: string;
  user: string;
  tool: string;
  params: Record<string, unknown>;
  result: "success" | "error";
  detail?: string;
}

export function logToolInvocation(entry: AuditEntry): void {
  mkdirSync(dirname(LOG_PATH), { recursive: true });
  const redactedEntry = { ...entry, params: redactParams(entry.params) };
  appendFileSync(LOG_PATH, JSON.stringify(redactedEntry) + "\n", "utf-8");
}
