import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, realpathSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

export interface CommitAuthor {
  name: string;
  email: string;
}

export interface CommitOptions {
  repoRoot: string;
  files: string[];
  message: string;
  author?: string | CommitAuthor;
}

function assertInsideRepo(repoRoot: string, relativePath: string): string {
  const resolved = resolve(repoRoot, relativePath);
  const real = realpathSync(resolved);
  const realRoot = realpathSync(repoRoot);
  if (!real.startsWith(realRoot + "/") && real !== realRoot) {
    throw new Error(`Path traversal blocked: ${relativePath} resolves outside repo root`);
  }
  return resolved;
}

export function commitFiles({ repoRoot, files, message, author }: CommitOptions): string {
  for (const file of files) {
    assertInsideRepo(repoRoot, file);
    execFileSync("git", ["add", "--", file], { cwd: repoRoot });
  }

  const commitArgs = ["commit", "-m", message];
  if (author) {
    if (typeof author === "object") {
      commitArgs.push("--author", `${author.name} <${author.email}>`);
    } else {
      commitArgs[commitArgs.indexOf(message)] = `${message} [${author}]`;
    }
  }

  execFileSync("git", commitArgs, { cwd: repoRoot });

  return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: repoRoot }).toString().trim();
}

export function readRepoFile(repoRoot: string, relativePath: string): string {
  const fullPath = assertInsideRepo(repoRoot, relativePath);
  return readFileSync(fullPath, "utf-8");
}

export function writeRepoFile(repoRoot: string, relativePath: string, content: string): void {
  const fullPath = assertInsideRepo(repoRoot, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
}
