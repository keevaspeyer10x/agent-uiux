import { describe, it, expect } from "vitest";
import { redactParams } from "../src/audit-log.js";
import { getUser } from "../src/auth.js";

describe("audit-log", () => {
  it("redacts PII fields", () => {
    const params = { person: "Jane Doe", tool_name: "test", body: "secret content" };
    const redacted = redactParams(params);
    expect(redacted.person).toBe("[REDACTED]");
    expect(redacted.body).toBe("[REDACTED]");
    expect(redacted.tool_name).toBe("test");
  });

  it("does not mutate original params", () => {
    const params = { person: "Jane Doe" };
    redactParams(params);
    expect(params.person).toBe("Jane Doe");
  });

  it("handles empty params", () => {
    expect(redactParams({})).toEqual({});
  });
});

describe("auth", () => {
  it("returns system user for unauthenticated requests", () => {
    const req = {} as any;
    const user = getUser(req);
    expect(user.email).toBe("system");
    expect(user.name).toBe("System (cron)");
  });

  it("returns authenticated user when present", () => {
    const req = { user: { email: "test@example.com", name: "Test User" } } as any;
    const user = getUser(req);
    expect(user.email).toBe("test@example.com");
  });
});
