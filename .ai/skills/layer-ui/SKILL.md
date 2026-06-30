---
name: layer-ui
description: >
  Create the UI layer for a Clean Architecture module: list view, detail view,
  and form view screens (layout-only, delegate logic to sibling components),
  plus EntityList with FlashList, EntityItem, and EntityForm with react-hook-form.
  Use when scaffolding screens for a new feature, adding CRUD views to a module,
  or implementing the presentation layer of a Clean Architecture feature.
  Also covers form screens (View/Form split pattern) and filtered list screens.
license: MIT
compatibility: React Native 0.83+, TypeScript strict mode, bun package manager. Requires project structure from react-native-template.
metadata:
  version: "2.0"
  category: architecture-layer
  layer: ui
  workflow: scaffold
  output: src/modules/{module}/ui/**
---

# UI Layer

Create the UI layer for entity `$ARGUMENTS`.

## Files to Create

```
src/modules/{module}/ui/
  {Entities}ListView.tsx      # List screen with optional search
  {Entity}DetailView.tsx      # Detail screen (layout only)
  {Entity}FormView.tsx        # Create/Edit form screen
  components/
    {Entity}List.tsx          # List container (FlashList)
    {Entity}Item.tsx          # Single item row
    {Entity}Form.tsx          # Form fields component
    {Entity}Detail.tsx        # Detail content + data fetching
```

## Non-Negotiable Rules

- **Screens are layout-only.** `*View.tsx` files read route params and delegate
  data, state, and actions to sibling components. No `useQuery` in screens.
- **CRUD naming:** `{Entities}ListView` / `{Entity}DetailView` / `{Entity}FormView`.
- **Lists:** `FlashList` from `@shopify/flash-list` — never `FlatList`.
- **Images:** `FastImage` from `react-native-fast-image` — never `Image`.
- **Async states:** `LoadingState`, `ErrorState`, `EmptyState` from `@components/layout` — never raw `ActivityIndicator`.
- **Colors/spacing:** `useTheme()` — never hardcode.
- **UI text:** Spanish.
- **Accessibility:** `accessibilityRole` and `accessibilityState` on all interactive elements.

## Form Screen Pattern (View/Form Split)

Two files, strict responsibility split:

| File | Owns |
|------|------|
| `{Entity}FormView.tsx` | Route params, mutations, `navigation.goBack()` — NO `useForm` |
| `{Entity}Form.tsx` | `useForm`, form fields, `handleSubmit` — NO mutations |

Key gotchas:
- `useForm` lives ONLY in `{Entity}Form` — never in `{Entity}FormView`
- The adapter (`domain/{entity}.adapter.ts`) converts form data to API payload — never convert inline
- Default values for edit forms come from route params or a detail query
- Form inputs come from `@components/form` (not `@components/core`) — they accept `control` and `name`
- `handleSubmit` from `useForm` wraps async calls — mutations must use `onError` to handle errors

→ See [references/form-flow.md](references/form-flow.md) for full code templates.

## Filtered List Pattern

Use this pattern when the ListView needs search, debounced filters, or persistent filter state across sessions.

Architecture:
```
{Entities}ListView           ← screen, layout only
  ├── {Entity}FiltersBar     ← search input + filter button + modal
  └── {Entity}List           ← FlashList + states + infinite scroll
        └── {Entity}Item     ← single row card

use-{entities}-filters.ts    ← uiFilters / queryFilters / setFilters
{entity}-sources.config.ts   ← capabilities contract (if multi-source)
```

→ See [references/list-view-with-filters.md](references/list-view-with-filters.md) for full pattern.
→ See [references/list-view-step-templates.md](references/list-view-step-templates.md) for full code.

## Templates

Includes templates for: EntitiesListView, EntityDetailView, EntityDetail, EntityFormView, EntityList, EntityItem, EntityForm.
→ See [references/templates.md](references/templates.md) for full code.

## Checklist

- [ ] Screens are layout-only — no data fetching in `*View.tsx`
- [ ] Lists use `FlashList` with `LoadingState` / `ErrorState` / `EmptyState`
- [ ] `useForm` is in `{Entity}Form`, mutations in `{Entity}FormView`
- [ ] All colors/spacing come from `useTheme()`
- [ ] UI text is in Spanish
- [ ] `accessibilityRole` on all interactive elements
- [ ] Run `bun run lint`, `bun run typecheck`, and `bun run test`

## Reference

- Example module: `src/modules/products/ui/`
