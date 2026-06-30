# Rules — Index

Entry point for every architectural and development rule of this template. Each
rule is **summarized here**; rules with an authored detail file link to it. Code
examples and step-by-step recipes do not live in rules — they belong to skills.

How to use this index:

- Rules **1–3** are the non-negotiable foundations: how the app is structured,
  how errors flow, and who owns state. They have authored detail files.
- Rules **4+** build on those foundations and are summarized here; their detail
  files are authored separately.
- When a rule conflicts with convenience, the rule wins.

**Reference implementation:** `src/modules/products` exercises every layer. When
in doubt, read it.

---

## 1. Architecture

Modular + Clean Architecture. Every feature lives in `src/modules/{module}/`
split into four inward-pointing layers: **domain → infrastructure → application
→ ui**. Domain is pure TypeScript and depends on nothing; outer layers depend on
inner ones, never the reverse. Backends are swappable through a service factory
keyed by `CONFIG.SERVICE_PROVIDER` (`local | supabase | firebase | http | mock`).

**Detail:** [`architecture.md`](./architecture.md)

## 2. Error Handling

Services **never throw** — they return `Promise<T | Error>`. Each backend
normalizes failures through its own mapper in `domain/{name}.error.ts`
(`manageAxiosError`, `manageFirebaseError`, `manageSupabaseError`,
`manageSqliteError`), tagging `error.name` and using Spanish, UI-ready messages.
The application layer turns the value-error back into a throw so React Query and
the toast system react to it.

**Detail:** [`error-handling.md`](./error-handling.md)

## 3. State Management

Two state systems with clear ownership. **React Query owns server state** — the
runtime source of truth, keyed exclusively through `QUERY_KEYS`. **Zustand owns
client state.** Persistent per-module Zustand stores (MMKV) are an offline cache
and `placeholderData` source, **not** a second source of truth. Read stores with
selector hooks inside components and with `.getState()` outside React.

**Detail:** [`state-management.md`](./state-management.md)

## 4. Components

Three component families. **Core** (`@components/core`) — presentational,
theme-driven primitives (Button, Text, TextInput, Modal…). **Form**
(`@components/form`) — thin `react-hook-form` wrappers over core via
`useController`. **Layout** (`@components/layout`) — screen scaffolding
(`RootLayout`, `Header`, `LoadingState`, `ErrorState`, `EmptyState`). Atomic,
typed with `Omit`/`Pick`/`Partial`, no business logic.

**Detail:** [`components.md`](./components.md)

## 5. Views & Navigation

Screens end in `View` and are **layout-only**: they read route params and
delegate data fetching, state handling, and actions to a sibling component.
CRUD modules use `{Entities}ListView` / `{Entity}DetailView` /
`{Entity}FormView`; non-CRUD modules use semantic names. Lists use `FlashList`
with `LoadingState` / `ErrorState` / `EmptyState`. Navigation is typed per module
(route enum + ParamList + `useNavigation{Module}` hook) and composed into Public
vs Private stacks by `useAuth().isAuthenticated`.

**Detail:** [`views-navigation.md`](./views-navigation.md)

## 6. Dependencies

Curated stack with mandated replacements (e.g. `FlashList` over `FlatList`,
MMKV over `AsyncStorage`, `react-native-config` for env). Do not add a dependency
that duplicates an approved one — check the approved list and New Architecture
compatibility before installing anything.

**Detail:** [`dependencies.md`](./dependencies.md)

## 7. Theme & Styles

Design tokens (colors, typography, spacing) are consumed via `useTheme`; styles
are built with `StyleSheet.create` through a theme-aware style factory. No
hardcoded colors and no magic numbers — everything comes from tokens so theming
and dark mode stay consistent.

**Detail:** [`theme-styles.md`](./theme-styles.md)

## 8. Testing

Render with the custom `render` from `@utils/test-utils` (wraps QueryClient +
ThemeProvider + SafeAreaProvider). Global native mocks live in `jest.setup.js`.
Tests are behavior-first; primitives carry per-file coverage thresholds. The test
QueryClient uses `retry: false`, `gcTime: 0`.

**Detail:** [`testing.md`](./testing.md)

## 9. Providers & Bootstrap

`App.tsx → AppProvider → RootNavigator`. Providers compose outside-in
(`Secure → Query → Theme → SafeArea → Gesture → Navigation`). Each provider is
single-responsibility; async initialization (secure storage) gates render before
children mount.

**Detail:** [`providers.md`](./providers.md)

## 10. Foundational Modules (Core & Network)

`core` and `network` are cross-cutting modules most of the app depends on. Treat
them as stable infrastructure: smallest safe change, preserve public APIs.
`core/app.storage.ts` owns transient global UI (toast, modal, searchbar);
`network` owns the Axios client (auth refresh, retry queue), the single Axios
error mapper, and connectivity (`getIsConnected()`). Never import a feature
module into either, and never duplicate Axios parsing outside `network`.

**Detail:** [`core-network.md`](./core-network.md)

## 11. Conventions

Cross-cutting code and language rules. **English** for code, types, identifiers,
file names, and comments; **Spanish** for all user-facing text — UI copy,
validation messages, toasts, errors — and Spanish month abbreviations for dates.
Imports are grouped (external → types → config/theme → components/modules) and
cross-module access uses `@modules/...` aliases over deep relative paths.

**Detail:** [`conventions.md`](./conventions.md)
