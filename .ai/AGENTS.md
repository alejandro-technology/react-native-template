## Template maintenance (`.ai/` → per-agent dirs) 
**Only if the .ai/ directory exist**

This template authors all AI rules, skills, agents, and commands **once** in `.ai/`, then copies them into a directory named for each AI tool. Each tool reads only its own copy.

```bash
bun run claude     # .ai/ -> .claude/   (Claude Code — this file's rules dir)
bun run opencode   # .ai/ -> .opencode/
bun run trae       # .ai/ -> .trae/
bun run droid      # .ai/ -> .factory/  (agents -> droids)
```

**Referencing rule:** `.ai/` is the authoring source and does **not** ship to a scaffolded consumer project — only the chosen tool's directory does. So from this file, always point at `.claude/...`, never `.ai/...`. Edit rules in `.ai/`, run the matching sync, commit both.