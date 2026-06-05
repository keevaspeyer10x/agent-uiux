import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register docs/ref/*.md as MCP resources and any dynamic status resources.
 */
export function registerResources(server: McpServer, repoRoot: string): void {
  const refDir = join(repoRoot, "docs", "ref");

  let files: string[];
  try {
    files = readdirSync(refDir).filter((f) => f.endsWith(".md"));
  } catch {
    // No ref docs directory — that's fine for new agents
    return;
  }

  for (const file of files) {
    const name = basename(file, ".md");
    const uri = `uiux://ref/${name}`;
    const filePath = join(refDir, file);

    server.resource(
      name,
      uri,
      { description: `Reference: ${name.replace(/-/g, " ")}`, mimeType: "text/markdown" },
      async () => {
        const content = readFileSync(filePath, "utf-8");
        return { contents: [{ uri, text: content, mimeType: "text/markdown" }] };
      }
    );
  }
}
