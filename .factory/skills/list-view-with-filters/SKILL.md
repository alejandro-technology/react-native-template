---
name: list-view-with-filters
description: Implement a list screen with inline search bar and/or advanced filter panel (modal). Load when creating ListView screens that need searchText debouncing, per-source filter capabilities, and persistent filter state.
license: MIT
compatibility: opencode
metadata:
  version: "1.0"
  category: ui-patterns
  layer: ui,application,domain
  workflow: scaffold
  output: src/modules/{module}/ui/{Entities}ListView.tsx, src/modules/{module}/ui/components/{Entity}FiltersBar.tsx, src/modules/{module}/ui/components/use-{entities}-filters.ts
---

# Skill: List View with Search and Filters

Implements the full pattern for a list screen with a search bar and optional advanced filter panel. Complements `layer-ui`, `layer-application`, and `layer-domain` skills.

## When to Use

Load this skill when:

- Creating a `{Entities}ListView` that needs a search input
- The list supports one or more advanced filters (select, text) via a modal
- Filters must be debounced before reaching React Query
- Filter state must persist per source/entity across sessions (Zustand + MMKV)
- The list is paginated / infinite scroll

## Architecture Overview

```
{Entities}ListView           ← screen, layout only
  ├── {Entity}FiltersBar     ← search input + filter button + modal
  └── {Entity}List           ← FlashList + states + infinite scroll
        └── {Entity}Item     ← single row card

use-{entities}-filters.ts    ← uiFilters / queryFilters / setFilters
{entity}-sources.config.ts   ← capabilities contract (if multi-source)
{entities}.storage.ts        ← Zustand + MMKV persistence
{entity}.queries.ts          ← useInfiniteQuery with offline fallback
{entity}-query.model.ts      ← {Entity}ListFilters interface
```

---

## Step 1 — Domain: Filter Model
Defines the `ListFilters` interface (search text, advanced filters) and `ListQuery` payload.
→ See [references/step-templates.md](references/step-templates.md) → "Step 1" for full code.

## Step 2 — Application: Capabilities Config
Defines the capabilities contract so `FiltersBar` never hard-codes filters.
→ See [references/step-templates.md](references/step-templates.md) → "Step 2" for full code.

## Step 3 — Application: Zustand Storage with MMKV
Creates a persisted Zustand store with:
- `{Entity}[]` cache array + CRUD helpers (`upsert`, `remove`)  
- `{Entity}ListFilters` state persisted per-source  
- `Date` rehydration via `mmkvReviver` in `onRehydrateStorage`
- `partialize` to persist only data, not actions

→ See [references/step-templates.md](references/step-templates.md) → "Step 3" for full code.

## Step 4 — Application: Filter Hook
Manages local `uiFilters` and debounced `queryFilters`.
→ See [references/step-templates.md](references/step-templates.md) → "Step 4" for full code.

## Step 5 — Application: Infinite Query
React Query hook with offline fallback from Zustand.
→ See [references/step-templates.md](references/step-templates.md) → "Step 5" for full code.

## Step 6 — UI: FiltersBar Component
Search input and advanced filter modal driven by capabilities.
→ See [references/step-templates.md](references/step-templates.md) → "Step 6" for full code.

## Step 7 — UI: List Component
FlashList setup with loading/error/empty states and offline banner.
→ See [references/step-templates.md](references/step-templates.md) → "Step 7" for full code.

## Step 8 — UI: ListView Screen
Main layout combining FiltersBar and List.
→ See [references/step-templates.md](references/step-templates.md) → "Step 8" for full code.

## Variants

### Simple search only (no advanced filters)

Set `supportsFilters: false` and `filterFields: []` in capabilities. The filter button will not render; only the `TextInput` row appears.

### No search, no filters

Set both `supportsSearch: false` and `supportsFilters: false`. `FiltersBar` returns `null` automatically — no conditional rendering needed in the screen.

### Multi-source (dynamic source selector)

When the same screen switches between data sources (e.g. a dynamic list with a source picker), store `selectedSource` in Zustand and key `sourceFilters` by source:

```typescript
sourceFilters: Record<DataSource, {Entity}ListFilters>;
setSourceFilters: (source: DataSource, filters: {Entity}ListFilters) => void;
```

Pass `selectedSource` to `use{Entities}Filters(selectedSource)` and `use{Entities}({ source: selectedSource, filters: queryFilters })`. See `src/modules/examples/ui/DynamicListView.tsx` as a full reference.

---

## Complementary Skills

| Skill                  | When to load together                                                    |
| ---------------------- | ------------------------------------------------------------------------ |
| `layer-ui`             | Base ListView/DetailView/FormView patterns                               |
| `layer-application`    | React Query queries, mutations, Zustand storage                          |
| `layer-domain`         | Entity model, repository contract                                        |
| `layer-infrastructure` | HTTP / Firebase / Mock service implementations                           |
| `components-gallery`   | All available props for `TextInput`, `Select`, `Modal`, `Button`, `Icon` |
