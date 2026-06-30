---
description: Review the current diff against the template's rules
agent: build
---

Review the working changes for compliance with [the rule
set](../rules/index.md). Scope to `$ARGUMENTS` if provided, otherwise the full working diff.

Delegate to the `code-reviewer` subagent (read-only). It MUST:

1. Inspect the diff (`git status`, `git diff`).
2. Load the following skills and rules before reviewing:
   - Skills: `third-party-libraries` (library policy checks), `layer-domain` (service contracts), `layer-application` (query keys, store access patterns)
   - Rules: [rules/index.md](../rules/index.md), [rules/architecture.md](../rules/architecture.md), [rules/error-handling.md](../rules/error-handling.md), [rules/dependencies.md](../rules/dependencies.md)

   Also run the automated dependency audit as part of the review:
   ```bash
   ./.ai/skills/third-party-libraries/scripts/audit-deps.sh
   ```
3. Check, at minimum:
   - Layer boundaries (`domain` imports nothing outward).
   - Services return `Promise<T | Error>` — never throw.
   - `QUERY_KEYS` used (no inline keys); selector hook in React vs `.getState()`
     outside.
   - Library policy: `FlashList`, MMKV, `FastImage`, React Query.
   - Theme tokens (no hardcoded colors), Spanish UI text, module naming.

Output findings grouped `critical → major → minor`, each with `file:line` and a
concrete fix. End with: approve / request changes / block merge.
