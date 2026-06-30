---
description: Add a backend provider implementation to a module's service factory
agent: build
---

Add a backend provider to an existing module. `$ARGUMENTS` should name the
module and the provider (`http` | `firebase` | `supabase` | `local` | `mock`);
ask if missing.

Canonical rules: [service factory](../rules/architecture.md) and
[backend mappers](../rules/error-handling.md).

Steps:

1. Locate the module and its `{entity}.service.ts` factory.
2. Load the `layer-infrastructure` skill.
3. Create `{entity}.{provider}.service.ts` implementing the domain repository
   interface — services return `Promise<T | Error>` and never throw.
4. Normalize failures with the matching mapper (`manageAxiosError`,
   `manageFirebaseError`, `manageSupabaseError`, `manageSqliteError`).
5. Wire the new `case` into the factory; keep the singleton default export.
6. Run `bun run lint`, `bun run typecheck`, `bun run test`.

Do not force provider parity — add only the requested provider.
