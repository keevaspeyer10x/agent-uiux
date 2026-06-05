import { google, type drive_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// --- Resilience: timeout, retry with backoff, circuit breaker ---

const DRIVE_TIMEOUT_MS = 30_000;
const DRIVE_MAX_RETRIES = 3;
const DRIVE_BACKOFF_BASE_MS = 500;

const circuitBreaker = {
  failures: 0,
  threshold: 5,
  resetAfterMs: 60_000,
  openedAt: 0,
  get isOpen(): boolean {
    if (this.failures < this.threshold) return false;
    if (Date.now() - this.openedAt > this.resetAfterMs) {
      this.failures = 0; // half-open → allow one attempt
      return false;
    }
    return true;
  },
  recordSuccess(): void {
    this.failures = 0;
  },
  recordFailure(): void {
    this.failures++;
    if (this.failures >= this.threshold) this.openedAt = Date.now();
  },
};

function isTransient(err: unknown): boolean {
  if (err instanceof Error && "code" in err) {
    const code = (err as any).code;
    if (code === 429 || (typeof code === "number" && code >= 500)) return true;
  }
  if (err instanceof Error && err.name === "AbortError") return true;
  return false;
}

async function withResilience<T>(label: string, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  if (circuitBreaker.isOpen) {
    throw new Error(`Drive API circuit breaker open — ${label} rejected. Try again later.`);
  }

  for (let attempt = 0; attempt < DRIVE_MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DRIVE_TIMEOUT_MS);
    try {
      const result = await fn(controller.signal);
      circuitBreaker.recordSuccess();
      return result;
    } catch (err) {
      if (attempt < DRIVE_MAX_RETRIES - 1 && isTransient(err)) {
        const delay = DRIVE_BACKOFF_BASE_MS * Math.pow(2, attempt);
        console.warn(`Drive API ${label}: transient error (attempt ${attempt + 1}/${DRIVE_MAX_RETRIES}), retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      circuitBreaker.recordFailure();
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`Drive API ${label}: exhausted retries`);
}

// --- End resilience ---

let driveClient: drive_v3.Drive | null = null;

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;

  const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Drive not configured. Set GOOGLE_DRIVE_OAUTH_CLIENT_ID, GOOGLE_DRIVE_OAUTH_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN."
    );
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  driveClient = google.drive({ version: "v3", auth: oauth2Client });
  return driveClient;
}

const DRIVE_ROOT_ID = process.env.UIUX_DRIVE_ROOT_ID ?? "";
const DRIVE_STRICT_SCOPE = process.env.UIUX_DRIVE_STRICT_SCOPE === "true";

const DRIVE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function assertValidDriveId(id: string, label: string): void {
  if (!DRIVE_ID_PATTERN.test(id)) {
    throw new Error(`Invalid ${label}: must be alphanumeric/dash/underscore`);
  }
}

function assertScopedId(id: string, label: string): void {
  if (DRIVE_STRICT_SCOPE && DRIVE_ROOT_ID && id !== DRIVE_ROOT_ID) {
    throw new Error(`${label} '${id}' is outside the Drive root scope`);
  }
}

/**
 * Find a folder by name under a given parent, or create it if it doesn't exist.
 */
export async function findOrCreateFolder(name: string, parentId: string = DRIVE_ROOT_ID): Promise<string> {
  assertValidDriveId(parentId, "parentId");
  assertScopedId(parentId, "parentId");
  const drive = getDrive();

  const query = [
    `name = '${name.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
    `'${parentId}' in parents`,
  ];

  const res = await withResilience("findOrCreateFolder.list", (signal) =>
    drive.files.list({
      q: query.join(" and "),
      fields: "files(id, name)",
      spaces: "drive",
      signal,
    }),
  );

  if (res.data.files?.length) {
    const id = res.data.files[0].id;
    if (!id) throw new Error("Drive API returned folder without id");
    return id;
  }

  const createRes = await withResilience("findOrCreateFolder.create", (signal) =>
    drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id",
      signal,
    }),
  );

  const folderId = createRes.data.id;
  if (!folderId) throw new Error("Drive API did not return id for created folder");
  return folderId;
}

/**
 * Create a Google Doc from HTML content in a specified folder.
 */
export async function createGoogleDoc(
  name: string,
  htmlContent: string,
  parentId: string = DRIVE_ROOT_ID,
): Promise<{ id: string; url: string }> {
  assertValidDriveId(parentId, "parentId");
  assertScopedId(parentId, "parentId");
  const drive = getDrive();
  const { Readable } = await import("node:stream");

  const res = await withResilience("createGoogleDoc", (signal) =>
    drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.document",
        parents: [parentId],
      },
      media: {
        mimeType: "text/html",
        body: Readable.from(Buffer.from(htmlContent)),
      },
      fields: "id, webViewLink",
      signal,
    }),
  );

  const docId = res.data.id;
  const docUrl = res.data.webViewLink;
  if (!docId || !docUrl) throw new Error("Drive API did not return id/url for created doc");
  return { id: docId, url: docUrl };
}

/**
 * Export a Google Doc as PDF and save it to a folder.
 */
export async function exportAsPdf(
  docId: string,
  pdfName: string,
  parentId: string = DRIVE_ROOT_ID,
): Promise<{ id: string; url: string }> {
  assertValidDriveId(docId, "docId");
  assertValidDriveId(parentId, "parentId");
  assertScopedId(parentId, "parentId");
  const drive = getDrive();

  const exportRes = await withResilience("exportAsPdf.export", (signal) =>
    drive.files.export(
      { fileId: docId, mimeType: "application/pdf" },
      { responseType: "stream", signal } as any,
    ),
  );

  const pdfRes = await withResilience("exportAsPdf.create", (signal) =>
    drive.files.create({
      requestBody: { name: pdfName, parents: [parentId] },
      media: { mimeType: "application/pdf", body: exportRes.data as any },
      fields: "id, webViewLink",
      signal,
    }),
  );

  const pdfId = pdfRes.data.id;
  const pdfUrl = pdfRes.data.webViewLink;
  if (!pdfId || !pdfUrl) throw new Error("Drive API did not return id/url for created PDF");
  return { id: pdfId, url: pdfUrl };
}

export interface ListDocsResult {
  docs: Array<{ id: string; name: string; modified: string; url: string }>;
  nextPageToken?: string;
}

/**
 * List Google Docs in a folder, optionally filtering by name pattern.
 * Filtering is done in code — never inject user input into Drive query strings.
 * Returns `{ docs, nextPageToken }` for pagination. Pass `pageToken` to fetch the next page.
 */
export async function listDocsInFolder(
  folderId: string = DRIVE_ROOT_ID,
  options?: { nameFilter?: string; pageToken?: string; pageSize?: number },
): Promise<ListDocsResult> {
  assertValidDriveId(folderId, "folderId");
  assertScopedId(folderId, "folderId");
  const drive = getDrive();

  const q = [
    `'${folderId}' in parents`,
    "mimeType = 'application/vnd.google-apps.document'",
    "trashed = false",
  ].join(" and ");

  const res = await withResilience("listDocsInFolder", (signal) =>
    drive.files.list({
      q,
      fields: "files(id, name, modifiedTime, webViewLink), nextPageToken",
      orderBy: "modifiedTime desc",
      pageSize: options?.pageSize ?? 100,
      pageToken: options?.pageToken,
      signal,
    }),
  );

  if (res.data.nextPageToken) {
    console.warn(`listDocsInFolder: results truncated for folder ${folderId}. Use nextPageToken to fetch more.`);
  }

  let docs = (res.data.files ?? []).map((f) => ({
    id: f.id!,
    name: f.name!,
    modified: f.modifiedTime!,
    url: f.webViewLink!,
  }));

  if (options?.nameFilter) {
    const lower = options.nameFilter.toLowerCase();
    docs = docs.filter((d) => d.name.toLowerCase().includes(lower));
  }

  return { docs, nextPageToken: res.data.nextPageToken ?? undefined };
}
