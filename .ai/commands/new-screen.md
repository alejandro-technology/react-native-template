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

Load skills: `layer-ui`, plus `form-handling` (forms) or
`list-view-with-filters` (filtered lists). Register the route/stack/typed hook
if the screen is new. Finish with `bun run lint`, `bun run typecheck`,
`bun run test`.
