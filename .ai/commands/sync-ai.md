---
description: Sync .ai/ sources into the tool-specific dirs (.claude, .opencode, …)
agent: build
---

Propagate the canonical `.ai/` sources (rules, skills, agents, commands) into
the tool directories.

`.ai/` is the single source of truth; the tool dirs are generated copies — edit
`.ai/`, then run this command.

Run the sync script(s) selected by `$ARGUMENTS` (default: `claude`):

- `bun run claude`     # .ai/ -> .claude/
- `bun run opencode`   # .ai/ -> .opencode/
- `bun run trae`       # .ai/ -> .trae/
- `bun run droid`      # .ai/ -> .factory/ (agents -> droids)

If `$ARGUMENTS` is `all`, run every sync script. Report which directories were
updated.
