#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { handleTool } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { requireAuth, getUser } from "./auth.js";

export const REPO_ROOT = process.env.UIUX_REPO_ROOT ?? process.cwd();
const PORT = parseInt(process.env.PORT ?? "8202");
const MAX_SESSIONS = 100;

const app = express();
app.use(express.json({ limit: "1mb" }));

// Health check (no auth)
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Apply auth middleware to MCP routes
app.use("/mcp", requireAuth);

// Track active sessions with creation time for stale session cleanup
const transports: Record<string, { transport: StreamableHTTPServerTransport; createdAt: number; ownerEmail: string }> = {};

// Clean up stale sessions every 30 minutes (sessions older than 4 hours)
const SESSION_MAX_AGE_MS = 4 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of Object.entries(transports)) {
    if (now - entry.createdAt > SESSION_MAX_AGE_MS) {
      entry.transport.close?.();
      delete transports[id];
      console.log(`Stale session cleaned: ${id}`);
    }
  }
}, 30 * 60 * 1000).unref();

function createMcpServer(user: string = "mcp-session"): McpServer {
  const server = new McpServer(
    { name: "uiux", version: "0.1.0" },
    {
      capabilities: { tools: {}, resources: {} },
      instructions: `Domain authority on User Experience and Design Process`,
    }
  );

  registerTools(server, user);
  registerResources(server, REPO_ROOT);

  return server;
}

function registerTools(server: McpServer, user: string): void {
  // Example tool — replace with domain-specific tools
  server.tool(
    "get_status",
    "Get the current status of active matters and recent activity.",
    {},
    async () => {
      const result = await handleTool(REPO_ROOT, "get_status", {}, user);
      return { content: [{ type: "text" as const, text: result }] };
    }
  );
}

// MCP Streamable HTTP endpoint — POST for messages
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId && transports[sessionId]) {
    const resumingUser = getUser(req);
    if (resumingUser.email !== transports[sessionId].ownerEmail) {
      res.status(403).json({ error: "Session owner mismatch" });
      return;
    }
    await transports[sessionId].transport.handleRequest(req, res, req.body);
    return;
  }

  // Reject if at session cap
  if (Object.keys(transports).length >= MAX_SESSIONS) {
    res.status(503).json({ error: "Too many active sessions" });
    return;
  }

  // New session — create transport and server
  const authenticatedUser = getUser(req);
  const userIdentity = authenticatedUser.email !== "system"
    ? authenticatedUser.email
    : "mcp-session";

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => {
      transports[id] = { transport, createdAt: Date.now(), ownerEmail: userIdentity };
      console.log(`Session initialized: ${id} (user: ${userIdentity})`);
    },
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      delete transports[transport.sessionId];
      console.log(`Session closed: ${transport.sessionId}`);
    }
  };

  const server = createMcpServer(userIdentity);
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// MCP Streamable HTTP endpoint — GET for SSE streaming
app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string;
  if (sessionId && transports[sessionId]) {
    const resumingUser = getUser(req);
    if (resumingUser.email !== transports[sessionId].ownerEmail) {
      res.status(403).json({ error: "Session owner mismatch" });
      return;
    }
    await transports[sessionId].transport.handleRequest(req, res);
  } else {
    res.status(400).json({ error: "Invalid or missing session" });
  }
});

// MCP Streamable HTTP endpoint — DELETE for session termination
app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string;
  if (sessionId && transports[sessionId]) {
    const resumingUser = getUser(req);
    if (resumingUser.email !== transports[sessionId].ownerEmail) {
      res.status(403).json({ error: "Session owner mismatch" });
      return;
    }
    await transports[sessionId].transport.handleRequest(req, res);
  } else {
    res.status(400).json({ error: "Invalid or missing session" });
  }
});

app.listen(PORT, () => {
  console.log(`Agent UI/UX MCP server listening on port ${PORT}`);
});
