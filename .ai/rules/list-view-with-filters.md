---
paths:
  - 'src/modules/*/ui/*ListView.tsx'
  - 'src/modules/*/ui/components/*List.tsx'
  - 'src/modules/*/ui/components/*FiltersBar.tsx'
  - 'src/modules/*/ui/components/use-*-filters.ts'
---

# List View with Search and Filters Rules

Rules for implementing list screens that include a search bar and/or advanced filter panel.
This pattern complements `layer-ui.md` and `layer-application.md`.

## Core Mandates

1. **Filter Model**: Define a `{Entity}ListFilters` interface in `domain/{entity}-query.model.ts` with:
   - `searchText?: string` — plain-text search field
   - `advanced?: Record<string, string | number | boolean | undefined>` — keyed advanced filters
2. **Debounce**: ALWAYS debounce `searchText` and `advanced` independently before passing them to React Query. Use `useDebounce` from `@modules/core/application/core.hooks`. Default delay: 400 ms.
3. **Filter Hook**: Encapsulate filter state, debounce, and persistence in a dedicated `use-{entities}-filters.ts` hook. The hook returns `{ uiFilters, queryFilters, setFilters }`:
   - `uiFilters` — immediate value bound to inputs (no debounce)
   - `queryFilters` — debounced value passed to `useQuery` / `useInfiniteQuery`
   - `setFilters` — setter that sanitizes before applying
4. **Capabilities Contract**: Define a `{Entity}SourceCapabilities` (or equivalent) object per source/entity that declares `supportsSearch`, `supportsFilters`, and `filterFields`. The `FiltersBar` component reads this contract — it MUST NOT hard-code which filters to show.
5. **FiltersBar Component**: Create a standalone `{Entity}FiltersBar` component that:
   - Renders the `TextInput` search row only when `capabilities.supportsSearch === true`
   - Shows a filter icon `Button` (outlined when inactive, primary when filters active) only when `capabilities.supportsFilters === true` and `filterFields.length > 0`
   - Opens a `Modal` (size `"md"`, `closeOnBackdropPress`) with the advanced filter fields
   - Renders `TextInput` for `type: 'text'` fields and `Select` for `type: 'select'` fields
   - Provides "Limpiar" (`ghost`) and "Aplicar" (`primary`) actions inside the modal
   - Counts active filters and reflects that count on the button variant
6. **List Component**: The `{Entity}List` component owns the `FlashList`, pull-to-refresh, and infinite scroll. It:
   - Renders `LoadingState`, `ErrorState`, `EmptyState` for the respective states
   - Includes `OfflineBanner` above the list
   - Guards `onEndReached` with `isConnected && hasNextPage` to avoid offline fetches
   - Uses `ItemSeparatorComponent` from `@components/layout`
7. **ListView Screen**: `{Entities}ListView` is layout-only — it orchestrates `FiltersBar` + `List` but contains NO data-fetching logic directly. Data fetching lives inside the list component or a dedicated hook.
8. **Persistence**: Persist active filters per source/entity via Zustand + MMKV. Re-hydrate on mount; sanitize stale keys when the source changes.
9. **Query Key Fingerprint**: Serialize filters with `JSON.stringify` to build a stable cache fingerprint. Include the fingerprint in the `queryKey`.

## File Structure

```
src/modules/{module}/
  domain/
    {entity}-query.model.ts       # {Entity}ListFilters, {Entity}ListQuery
  application/
    {entity}-sources.config.ts    # Capabilities + sanitize helpers (if multi-source)
    {entities}.storage.ts         # Zustand store with sourceFilters + cache
    {entity}.queries.ts           # useInfiniteQuery with offline fallback
  ui/
    {Entities}ListView.tsx        # Screen: RootLayout + FiltersBar + List
    components/
      {Entity}List.tsx            # FlashList + states + infinite scroll
      {Entity}Item.tsx            # Single row card
      {Entity}FiltersBar.tsx      # Search + advanced filters modal
      use-{entities}-filters.ts   # Filter state, debounce, persistence hook
```

## Naming

- Filter interface: `{Entity}ListFilters`
- Capabilities object: `{Entity}SourceCapabilities`
- Filter fields array: `filterFields: {Entity}FilterField[]`
- Hook: `use{Entities}Filters` returning `{ uiFilters, queryFilters, setFilters }`

## Do Not

- Do NOT use `useEffect` + raw `fetch`/`axios` for data fetching — use React Query.
- Do NOT use `FlatList` — use `FlashList` from `@shopify/flash-list`.
- Do NOT hard-code filter keys inside `FiltersBar` — read them from the capabilities contract.
- Do NOT call `onEndReached` when offline — always guard with `isConnected`.
- Do NOT skip debounce — raw filter state must never be passed directly to `queryKey`.

_For full implementation details and golden examples, load the `list-view-with-filters` skill._
