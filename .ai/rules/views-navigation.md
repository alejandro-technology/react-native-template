# Views & Navigation Rules

The UI layer is screens (`*View.tsx`) plus screen-specific components. Screens
are **layout-only**: they read route params and delegate fetching, state, and
actions to a sibling component. This rule also covers the two screen patterns
that recur across modules — **forms** and **filtered lists** — and how screens
are wired into typed navigation.

## Core Mandates — Screens

1. **Naming.** CRUD modules use `{Entities}ListView`, `{Entity}DetailView`,
   `{Entity}FormView`. Non-CRUD modules use semantic names ending in `View`
   (`SignInView`, `LandingView`). A module implements only the screens it needs.
2. **Layout-only views.** A `*View` composes `RootLayout` and hands data and
   actions to a sibling component (`{Entity}Detail`, `{Entity}List`,
   `{Entity}Form`). No data fetching lives in the screen.
3. **Async states.** Components that depend on async data render `LoadingState`,
   `ErrorState`, and `EmptyState` from `@components/layout`.
4. **Lists use `FlashList`.** Never `FlatList`/`SectionList`. Lists own
   pull-to-refresh and infinite scroll, show `OfflineBanner`, and use
   `ItemSeparatorComponent`.
5. **Add-from-list navigation.** To reach `{Entity}FormView` from a list screen,
   use either a `Header` action icon (`pressIcon="plus"`) or a `RootLayout` FAB.

## Forms

- Use `react-hook-form` with `@hookform/resolvers/yup` and `yup`.
- **Separation:** `{Entity}FormView` handles navigation and invokes the React
  Query mutation; it contains no `useForm`. `{Entity}Form` owns `useForm`, the
  fields, and `handleSubmit`, receiving default values and an `onSubmit`.
- Schemas live in `domain/{entity}.scheme.ts`; derive the form type with
  `InferType`. Map form data to API payloads with `domain/{entity}.adapter.ts`.
- Inputs come from `@components/form` (already integrated with `useController`).

## Search & Filters

- Model filters as `{Entity}ListFilters` (`searchText?` + keyed `advanced?`).
- **Debounce** `searchText` and `advanced` (≈400 ms) before they reach the
  query key — raw filter state is never passed straight to React Query.
- Encapsulate filter state, debounce, and persistence in a
  `use-{entities}-filters` hook returning `{ uiFilters, queryFilters, setFilters }`.
- A **capabilities contract** drives the `FiltersBar` (which filters to show);
  the bar must not hardcode filter keys.
- Persist active filters per source via Zustand + MMKV; build the query-key
  fingerprint with `JSON.stringify`. Guard `onEndReached` with `isConnected`.

## Navigation

- `RootNavigator` renders `PublicNavigator` or `PrivateNavigator` by
  `useAuth().isAuthenticated`; each module contributes a stack navigator.
- Routes are strongly typed per module in `navigation/routes/{module}.routes.ts`
  (route `enum` + `ParamList` + `ScreenProps`). Stacks live in
  `navigation/stacks/`, typed hooks (`useNavigation{Module}`) in
  `navigation/hooks/`.

## File Structure

```
src/modules/{module}/ui/
  {Entities}ListView.tsx | {Entity}DetailView.tsx | {Entity}FormView.tsx
  components/
    {Entity}List.tsx | {Entity}Item.tsx | {Entity}FiltersBar.tsx
    {Entity}Detail.tsx | {Entity}Form.tsx
    use-{entities}-filters.ts
src/navigation/
  routes/{module}.routes.ts | stacks/{Module}StackNavigator.tsx | hooks/
```

## Do Not

- Do not fetch data in a `*View` — delegate to the sibling component or a hook.
- Do not use `FlatList`/`SectionList`, or `useEffect` + raw `fetch`/`axios`.
- Do not hardcode filter keys in `FiltersBar`; read the capabilities contract.
- Do not skip debounce, and do not call `onEndReached` while offline.
- Do not place `useForm` inside a `*FormView`.

## See Also

- Component families: [`components.md`](./components.md)
- Query/store wiring behind screens: [`state-management.md`](./state-management.md)
- Layering and module boundaries: [`architecture.md`](./architecture.md)
