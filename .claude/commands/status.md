# /status — Current Status

Report the current state of Agent UI/UX.

Argument: `$ARGUMENTS` is an optional matter path (top-level slug, or nested via `parent/child`).

## With argument

Resolve the matter per the matter-resolution rules in CLAUDE.md. Present:
- Current stage / status
- Inherited context fields (note which came from the parent chain)
- Direct children if any (slug + stage)
- Pending items, upcoming deadlines

## Without argument

Render the full matter tree. Each line shows the slug (indented by depth), stage in brackets, and last-touched as a relative time. Mark the matter the agent will resolve on bare-shorthand calls this session with `★ active`.

Illustrative output:

```
acme-deal                                  [active]         ↻ 3h ago
├─ term-sheet                              [drafting]       ↻ 1h ago    ★ active
│  └─ buyout-clause                        [review]         ↻ 2d ago
└─ side-letter                             [intake]         ↻ 5d ago

bolt-capital                               [completed]      ↻ 14d ago
```

Tree-walk procedure:

1. Glob `matters/*/manifest.{yaml,md}` for top-level matters. For each:
   - Read `status:` and `stage:` for the label.
   - `stat` the `session-log.md` (or manifest if no session-log) for the mtime.
2. For each top-level matter, recurse into `sub/*/manifest.{yaml,md}` and repeat.
3. Render as a tree with box-drawing characters.
4. Skip any path containing a `_`-prefixed segment at any depth.

If only one manifest exists anywhere in the tree, fall through to the "with argument" branch and show its full status.

## Additional Steps

5. Check `logs/tool-invocations.jsonl` for activity in the last 7 days.
6. Run `git log --oneline --since="7 days ago"` for recent commits.
7. Report any pending items or upcoming deadlines.
