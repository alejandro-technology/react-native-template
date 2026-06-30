---
description: Add a screen (list / detail / form) to an existing module
agent: build
---

Add a screen to a module. `$ARGUMENTS` should name the module and the screen
kind (`list` | `detail` | `form`); ask if missing.

Canonical rules: [rules/views-navigation](../rules/views-navigation.md) [rules/components](../rules/components.md).

Honor:

- A `*View` is layout-only — it reads route params and delegates data, state,
  and actions to a sibling component.
- CRUD naming: `{Entities}ListView` / `{Entity}DetailView` / `{Entity}FormView`.
- Lists use `FlashList` with `LoadingState` / `ErrorState` / `EmptyState`.
- Forms: `{Entity}FormView` handles navigation + mutation (no `useForm`);
  `{Entity}Form` owns `useForm`, fields, and `handleSubmit`.

Load skills:
- Always: `layer-ui`, `components-gallery` (for component usage reference)
- For form screens: also load `form-handling`
- For filtered list screens: also load `list-view-with-filters`
- If the screen requires a **new route** (not yet in the module's navigator): also load `navigation`

Finish with `bun run lint`, `bun run typecheck`, `bun run test`.

If a new route was added, run the navigation check:
```bash
# Note: Replace <AGENT_DIR> with your active agent directory (e.g., .agents, .opencode, .claude)
./<AGENT_DIR>/skills/navigation/scripts/check-registration.sh <ModuleName>
```
