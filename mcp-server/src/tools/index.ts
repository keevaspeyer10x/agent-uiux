import { logToolInvocation } from "../audit-log.js";

export async function handleTool(
  repoRoot: string,
  name: string,
  args: Record<string, unknown>,
  user: string,
): Promise<string> {
  let result: string;
  try {
    switch (name) {
      case "get_status":
        result = `Agent UI/UX is running. No active matters yet.`;
        break;
      default:
        result = `Unknown tool: ${name}`;
    }
    logToolInvocation({ timestamp: new Date().toISOString(), user, tool: name, params: args, result: "success" });
    return result;
  } catch (err: any) {
    // Log the error but return it as a string — never throw to the MCP layer.
    // This follows the convention: "Tools MUST return strings."
    logToolInvocation({ timestamp: new Date().toISOString(), user, tool: name, params: args, result: "error", detail: err.message });
    return `Error in ${name}: ${err.message}`;
  }
}
