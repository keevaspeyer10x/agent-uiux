import { OAuth2Client } from "google-auth-library";
import type { Request, Response, NextFunction } from "express";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID ?? "";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const ALLOWED_EMAILS = (process.env.UIUX_ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
const ALLOW_UNAUTHENTICATED = process.env.UIUX_ALLOW_UNAUTHENTICATED === "true";

export interface AuthenticatedUser {
  email: string;
  name: string;
}

/**
 * Express middleware: validate Google OAuth bearer token.
 * Fails closed — if ALLOWED_EMAILS is empty, rejects all requests
 * unless ALLOW_UNAUTHENTICATED is explicitly set to "true".
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  // No bearer token — check if unauthenticated access is allowed
  if (!authHeader?.startsWith("Bearer ")) {
    if (ALLOW_UNAUTHENTICATED) {
      next();
      return;
    }
    _res.status(401).json({ error: "Missing Bearer token" });
    return;
  }

  // Fail closed: if no allowlist configured and not explicitly permissive, reject
  if (ALLOWED_EMAILS.length === 0 && !ALLOW_UNAUTHENTICATED) {
    _res.status(403).json({ error: "No allowed emails configured" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      _res.status(401).json({ error: "Token missing email" });
      return;
    }

    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(payload.email)) {
      _res.status(403).json({ error: "User not authorized" });
      return;
    }

    (req as any).user = { email: payload.email, name: payload.name ?? payload.email } as AuthenticatedUser;
    next();
  } catch (err) {
    console.error("Auth token verification failed:", err);
    _res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Extract authenticated user from request. Returns a default for unauthenticated (cron) contexts.
 */
export function getUser(req: Request): AuthenticatedUser {
  return (req as any).user ?? { email: "system", name: "System (cron)" };
}
