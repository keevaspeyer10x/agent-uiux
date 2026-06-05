# /promote — Move a Sub-matter Up One Level

Argument: `$ARGUMENTS` is `{sub-matter-path}` — the matter to promote. The matter must currently be a sub-matter (not top-level).

After promotion, the named matter becomes a sibling of its current parent (or top-level if its current parent was already top-level).

## Process

1. **Resolve the target.** Apply the matter-resolution rules from CLAUDE.md. If the resolved matter is top-level (no `parent:` field), refuse with an explanation (nothing to promote to).
2. **Read lineage.** Read the target's `parent:` field. Read the parent's `children:` list. Read the parent's `parent:` (the grandparent, if any).
2a. **Pre-flight consistency check.** Verify the parent's `children:` list contains the target's slug. If it does not, the tree is already inconsistent. Distinguish two cases:
   - **Drift / corruption** — the target's `parent:` points at this parent but `children:` is missing the entry. Surface the situation and ask whether to repair `children:` first or proceed.
   - **Partial prior promotion** — detectable when the target also exists at the destination this `/promote` would write to (i.e. a previous attempt completed the `mv` but failed before finishing the manifest edits). In that case, propose completing the in-flight promotion: skip step 8a, apply steps 8b–8d.
3. **Compute the new location.**
   - If the current parent is top-level: target moves to `matters/{slug}/` (becomes top-level).
   - Otherwise: target moves to `matters/{grandparent-path}/sub/{slug}/` (becomes a sibling of its parent).
4. **Refuse if the destination already exists.** Do not overwrite. Descendants move with the target as a subtree, so this single check covers descendant collisions too.
5. **Present a dry-run diff to the user.** Show:
   - `mv {source-path} {destination-path}`
   - Edit to the moved matter's `parent:` field (`../..`, or removed if now top-level)
   - Edit to the old parent's `children:` list (slug removed)
   - Edit to the new parent's `children:` list (slug added) — or "now top-level, no children list to edit"
6. **Require explicit user confirmation.** Do not proceed without it. Use an actual prompt — do not auto-apply on a typed-out yes.
7. **Apply the changes in this order** (mv-first for recoverable partial-failure states):
   - **`mv` the folder** to its new location. If this fails, abort — nothing else has changed yet.
   - **Edit the moved matter's `parent:` field** in its new location. Always `../..` (every sub-matter sits at `{parent}/sub/{slug}/` and parent's manifest folder is always two segments up); if the target is now top-level, remove the field entirely. If this edit fails, retry from this step.
   - **Edit the new parent's `children:` list** (add the slug), if applicable. If this edit fails, retry from this step.
   - **Edit the old parent's `children:` list** (remove the slug). If this edit fails, retry from this step.

   Each failure mode above leaves the tree in a recoverable state.
8. **Log to session-logs** if the agent maintains them. Append `## [timestamp] — promoted from {old-path}` to the moved matter's session-log, and `## [timestamp] — child promoted out: {slug} → {new-path}` to the old parent's session-log.

## Notes

- Promotion does not modify pipeline state, stage, decisions log, or per-matter content. Only folder location and lineage fields change.
- Promotion is reversible by hand (`mv` + manifest edits in the opposite direction); no dedicated demote command is provided.
- **Cascade guard:** if the target sub-matter has children of its own, they move with it (sub-tree stays intact). Show this in the dry-run diff.
- Branch-promotion (turning a node of an `issue-tree.md` into a sub-matter) is not handled here — if the agent needs it, implement it as a separate command. The conventions defer that work item.
