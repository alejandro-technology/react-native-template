---
description: Scaffold a complete Clean Architecture module (4 layers + navigation)
agent: build
---

Create a new feature module named `$ARGUMENTS` following the template's Clean
Architecture.

Canonical rules: [index rules](../rules/index.md) — especially `1. Architecture`,
`2. Error Handling`, `3. State Management`, and `11. Conventions`.
Reference module to copy: `src/modules/products`.

Delegate the implementation to the `module-builder` subagent. It MUST load the
relevant skills (`create-module`, `layer-domain`, `layer-infrastructure`,
`layer-application`, `layer-ui`, `navigation`) before writing code.

Steps:

1. Resolve the module name (`kebab-case`) and entity (`PascalCase`). If
   `$ARGUMENTS` is empty, ask before scaffolding.
2. For a non-trivial module, plan layers first with the `architect` subagent.
3. Build `domain → infrastructure → application → ui → navigation`.
4. Register only what the module uses: `query.keys.ts`, `api.routes.ts` /
   `collections.routes.ts`, navigation, and the public `index.ts`.
5. Run `bun run lint`, `bun run typecheck`, `bun run test`.

Report: files created, registrations done, and check results.
