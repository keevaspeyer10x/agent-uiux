"""
work.keeva.space — Decision Feed API
Phase 1: FastAPI skeleton serving the Light Mode HTML Decision Feed.

Endpoints:
  GET  /              → Decision Feed HTML (auth-gated at nginx)
  GET  /health        → Health check (plain JSON)
  POST /webhooks/asana → Asana webhook receiver (public, no auth)
"""

from fastapi import FastAPI, Request, Header, Response
from fastapi.responses import HTMLResponse

app = FastAPI(title="work.keeva.space Decision Feed", version="0.1.0")

DECISION_FEED_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>work.keeva.space — Decision Feed</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f8fafc;
      color: #0f172a;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      padding: 2rem 1rem;
    }
    header {
      max-width: 720px;
      margin: 0 auto 2rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 1rem;
    }
    header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #0f172a;
    }
    header p.subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
    main {
      max-width: 720px;
      margin: 0 auto;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: #94a3b8;
      font-size: 1rem;
    }
    .empty-state svg {
      display: block;
      margin: 0 auto 1rem;
      opacity: 0.4;
    }
  </style>
</head>
<body>
  <header>
    <h1>work.keeva.space</h1>
    <p class="subtitle">Decision Feed</p>
  </header>
  <main>
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      No decisions pending.
    </div>
  </main>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
async def decision_feed():
    """Return the Decision Feed HTML page."""
    return DECISION_FEED_HTML


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "work-keeva-space", "version": "0.1.0"}


@app.post("/webhooks/asana")
async def asana_webhook(
    request: Request,
    x_hook_secret: str = Header(None),
):
    """
    Asana webhook receiver.
    Phase 1: Accept handshake and log events; full processing in Phase 2.
    This endpoint is public (nginx allows /webhooks/ without OAuth).
    """
    # Handshake: Asana sends X-Hook-Secret on first registration
    if x_hook_secret:
        return Response(
            status_code=200,
            headers={"X-Hook-Secret": x_hook_secret},
        )

    # Accept and acknowledge event delivery (Phase 2 will process events)
    try:
        body = await request.json()
        events = body.get("events", [])
        print(f"[webhooks/asana] Received {len(events)} events (Phase 1 — not processed)")
    except Exception as e:
        print(f"[webhooks/asana] Failed to parse body: {e}")

    return {"status": "accepted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8122, reload=False)
