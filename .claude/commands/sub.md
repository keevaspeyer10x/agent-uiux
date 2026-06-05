# /sub — Create a Sub-matter

Argument: `$ARGUMENTS` is `{slug}` or `{slug} {problem-description}`. The slug is kebab-case.

Creates a sub-matter under the currently active matter (resolved per the matter-resolution rules in CLAUDE.md).

## Process

1. **Resolve the parent matter.** Use the active matter. If none can be resolved unambiguously, ask the user which matter to nest under (or to specify via `/sub {parent-path}/{slug}` form).

2. **Validate the slug.**
   - Must match `^[a-z][a-z0-9-]*$` (which already rejects `_`-prefixed names, uppercase, dots, slashes).
   - Must not be a reserved name: `sub`, `research`, `archive`, `notes`, `artifacts`.
   - Must not collide with an existing entry under `{parent}/sub/`.
   - If invalid, reserved, or colliding, ask the user for a new slug.

3. **Scaffold the sub-matter folder** using the same structure as a top-level matter (per `conventions/matters.md`):
   ```
   matters/{parent-path}/sub/{slug}/
   ├── manifest.yaml
   └── (any per-agent subfolders — notes/, artifacts/, etc.)
   ```

4. **Populate the new manifest.** Start from `templates/matters/_template/manifest.yaml.tmpl`, then set:
   - `name:` to a humanised version of the slug (or ask).
   - `created:` to today's date.
   - `parent:` to `../..`. This is always correct because every sub-matter sits at `{parent-folder}/sub/{slug}/`, so the parent's manifest folder is exactly two segments up regardless of nesting depth.
   - `children:` to `[]`.
   - Other envelope fields: leave blank (they inherit from the parent at read-time per the inheritance rules in `conventions/matters.md`). Only override explicitly when the sub-matter genuinely differs.
   - If `{problem-description}` was provided, populate it in the appropriate domain field (agent-specific — typically a `problem` or `description` key under `domain:`).

5. **Update the parent's `children:` list.** Add the new slug. Keep the list alphabetised.

6. **Log the creation.** If the agent maintains a `session-log.md` per matter, append a `## [timestamp] — sub-matter created: {slug}` entry to the parent's session-log, and a `## [timestamp] — sub-matter scaffolded` entry to the new sub-matter's session-log.

7. **Tell the user what was created** and what the next step is — typically the agent's pipeline-entry command targeted at the new sub-matter.

## Notes

- Do not duplicate parent context into the sub-matter manifest. Inheritance handles it at read-time.
- The template placeholder values (`""`, `null`, etc.) should be filled in just as they would for a top-level matter creation.
