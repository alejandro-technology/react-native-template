# TRAE.md

This file provides guidance to Trae IDE when working with code in this repository.

## Overview

React Native template built on **Clean Architecture** (4 layers per feature module). React Native 0.83.9, React 19.2.0, TypeScript 5.8.3 (strict), New Architecture enabled. Package manager: **bun** — never npm/yarn. Node >= 20.

- **Reference module that exercises every layer:** `src/modules/products` — copy it when creating a new module.
- **Deeper architecture rules (11 detail files):** `.trae/rules/` — Trae Code's own rules directory. Optional reading; this file is self-contained. (In the template repo, generate it with `bun run trae` — see *Template maintenance* below.)
- **Companion agent guide at repo root:** `AGENTS.md`

## Commands

```bash
bun install                          # Install dependencies
bun run test                         # Run all tests (jest)
bun run test -- path/to/file.test.ts # Run a single test file
bun run test:watch                   # Watch mode
bun run test:coverage                # Coverage report
bun run lint                         # ESLint
bun run lint:fix                     # ESLint --fix
bun run typecheck                    # tsc --noEmit
bun run prettier                     # Format src/
bun run start | android | ios        # Metro / run on device

# Troubleshooting / native
bun run pod-cocoa                    # bundle install (ios/)
bun run pod-install                  # bundle exec pod install (ios/)
bun run clean-android                # rm Android build + gradlew clean
bun run clean-ios                    # rm iOS build + Pods + Podfile.lock
bun run clean-watch                  # reset watchman
bun run clean-node                   # rm node_modules + bun.lock
```

After changes, run `bun run lint`, `bun run typecheck`, and `bun run test`.

## Architecture

Every feature lives in `src/modules/{module}/`, split into four inward-pointing layers. Domain is pure TypeScript and depends on nothing; outer layers depend on inner ones, never the reverse.

- **domain/** — entity interfaces (`{Entity}`, `Create{Entity}Payload`, `Update{Entity}Payload`, `{Entity}Filter`), repository interface (`{entity}.repository.ts`), Yup scheme, adapter/mapper, and the backend error mapper (`{name}.error.ts`).
- **infrastructure/** — service factory (`{entity}.service.ts`, switches on `CONFIG.SERVICE_PROVIDER`) plus one implementation per backend, all satisfying the domain repository interface.
- **application/** — React Query hooks (queries with offline fallback, mutations with toast) and Zustand stores with MMKV persistence.
- **ui/** — screens (`{Entities}ListView` / `{Entity}DetailView` / `{Entity}FormView`, or semantic names for non-CRUD modules) and screen-specific components.

Entry: `App.tsx → AppProvider → RootNavigator`. Providers compose outside-in: `Secure → Query → Theme → SafeArea → Gesture → Navigation`. `SecureProvider` gates render until secure-storage init completes.

## Service backends (swappable)

`CONFIG.SERVICE_PROVIDER` in `src/config/config.ts` selects the backend; the default is `mock`. Each module's `{entity}.service.ts` factory resolves the implementation — nothing else changes.

| Value | Uses | Configure |
|---|---|---|
| `http` | Axios → REST API | `API_ROUTES.ROOT` in `src/config/api.routes.ts` |
| `firebase` | Firestore + Storage | `ios/GoogleService-Info.plist` + `android/app/google-services.json` |
| `supabase` | Supabase client | `src/modules/supabase/infrastructure/supabase.client.ts` |
| `local` | SQLite (nitro-sqlite) | `src/modules/sqlite` (schema in `sqlite.migrations.ts`) |
| `mock` | Hardcoded data | none |

Other `config.ts` fields: `ROOT_CREDENTIALS` (mock-only auth), `RAWG_API_KEY`, `CURRENCY` (`COP`), `LOCALE` (`es-CO`). Secrets come from `react-native-config` (`.env`), never hardcoded.

## Modules

| Module | Type | Purpose |
|---|---|---|
| `products` | Feature | CRUD reference exercising all 4 layers — copy this for new modules |
| `users` | Feature | User management, all 4 layers |
| `authentication` | Feature | Login/registro across http, firebase, mock |
| `core` | Shared | Global UI state (Zustand) + permissions (`react-native-permissions`) |
| `network` | Infrastructure | Axios client (auth refresh + retry queue), the single Axios error mapper, `getIsConnected()` |
| `firebase` | Infrastructure | Firestore + Storage services |
| `supabase` | Infrastructure | Supabase client |
| `sqlite` | Infrastructure | SQLite DB + migrations (the `local` backend) |
| `examples` | Showcase | Visual component gallery |

`iap` exists as an empty placeholder directory — not yet implemented.

## Imports

Path aliases (defined in `tsconfig.json`, `babel.config.js`, and `jest.config.js`): `@assets @components @modules @theme @utils @config @navigation`. Prefer `@modules/...` over deep relative paths. Group imports with blank lines and comment labels (external → types → config/theme → components/modules).

## Naming

- **Files**: kebab-case (`product.service.ts`, `use-products.ts`)
- **Components / hooks / exports**: PascalCase / camelCase (`ProductCard`, `useProductCreate`)
- **Interfaces**: PascalCase (`Product`, `CreateProductPayload`)
- **Constants**: SCREAMING_SNAKE_CASE (`QUERY_KEYS`)
- **Enums**: PascalCase members (`ProductRoutes.ProductList`)
- `interface` for object shapes, `type` for unions/aliases; `Omit`/`Pick`/`Partial` for prop variations; `InferType` from Yup for form data.

## Error handling

Services **return `Promise<T | Error>` and never throw**. Each backend normalizes failures through its own mapper in `domain/{name}.error.ts` — `manageAxiosError`, `manageFirebaseError`, `manageSupabaseError`, `manageSqliteError` — which tags `error.name` and produces Spanish, UI-ready messages. The application layer checks `instanceof Error` and re-throws so React Query and the toast system react.

## State management

- **React Query owns server state** — runtime source of truth, keyed exclusively via `QUERY_KEYS` (`@config/query.keys`). Check `getIsConnected()` for offline fallback; use `placeholderData` from the local store. Never instantiate a `QueryClient` in feature code — use the one in `AppProvider`.
- **Zustand owns client state.** Persistent per-module stores (MMKV) are an offline cache and `placeholderData` source, **not** a second source of truth. Read with selector hooks inside components, `.getState()` outside React.
- **Global transient UI:** `useAppStorage` (`src/modules/core/application/app.storage.ts`) — `toast` and the delete-confirmation `modal` (plus `onboarding` and per-list `searchbar` state slots). The global toast and delete-confirmation sheet are mounted once in `AppProvider` and driven from anywhere via the store.

## Navigation

`RootNavigator` renders the **Private** or **Public** stack based on `useAuth().isAuthenticated`. Navigation is typed per module: route enum + ParamList + a `useNavigation{Module}` hook. Lists use `FlashList` with `LoadingState` / `ErrorState` / `EmptyState`.

## Components

- **core** (`@components/core`) — presentational, theme-driven primitives (Button, Text, TextInput, Modal, Select…). No business logic.
- **form** (`@components/form`) — thin `react-hook-form` wrappers over core via `useController`.
- **layout** (`@components/layout`) — screen scaffolding (`RootLayout`, `Header`, `LoadingState`, `ErrorState`, `EmptyState`, `DeleteConfirmationSheet`, `ErrorBoundary`).

Browse the live gallery in the `examples` module.

## Theme & styles

Design tokens (colors, typography, spacing) are consumed via `useTheme`. Styles are built with `StyleSheet.create` through a theme-aware factory (e.g. `getButtonStyle({ variant, size })`) in co-located `*.styles.ts` files. No hardcoded colors and no magic numbers — use tokens (`spacing.sm`, `colors.primary`, `borderRadius.md`). Theme persists via MMKV.

## Testing

- Custom render: `import { render } from '@utils/test-utils'` — wraps QueryClient + ThemeProvider + SafeAreaProvider. Test QueryClient uses `retry: false`, `gcTime: 0`.
- Global native mocks in `jest.setup.js`: gesture-handler, MMKV, Firebase (app/auth/firestore), react-navigation, jail-monkey, react-native-config. SVGs via `__mocks__/svgMock.js`.
- Tests are behavior-first.

**Coverage** (`jest.config.js`): global thresholds — branches 20, functions 20, lines 25, statements 25. Excluded from collection: `*.styles.ts`, `*.types.ts`, `*.scheme.ts`, `*.adapter.ts`, `*.routes.ts`, `*.model.ts`, `*.repository.ts`, `index.ts`, `test-utils.tsx`, `src/config/*`, and demo modules (`examples`, `firebase`, `products`, `users`, `navigation`). Higher per-file thresholds: `Button`, `TextInput`, `Text` (core); `ErrorBoundary`, `DeleteConfirmationSheet`, `Header` (layout); `app.storage.ts`.

## Language

- **Code, identifiers, types, file names, comments**: English.
- **User-facing text** (UI copy, validation messages, toasts, errors): Spanish.
- **Dates**: Spanish month abbreviations (`Ene`, `Feb`, …) via the `core` date utils.

## Security & git

`SecureProvider` blocks rooted/jailbroken devices (`jail-monkey`). Sensitive values via `react-native-config`; Firebase credentials are gitignored. Pre-commit runs Husky + lint-staged (`eslint --fix` + `prettier`) on `src/**/*.{ts,tsx}`. Use conventional commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`).

## Key dependencies

| Category | Library |
|---|---|
| Navigation | `@react-navigation/native` + `native-stack` |
| Server state | `@tanstack/react-query` |
| Client state | `zustand` (persisted with `react-native-mmkv`) |
| Forms | `react-hook-form` + `@hookform/resolvers` + `yup` |
| Lists | `@shopify/flash-list` (never `FlatList`) |
| HTTP | `axios` |
| Backends | `@react-native-firebase/*`, `@supabase/supabase-js`, `react-native-nitro-sqlite` |
| Storage | `react-native-mmkv` (never `AsyncStorage`) |
| Env / secrets | `react-native-config` |
| Images | `react-native-fast-image`, `react-native-image-picker` |
| Security | `jail-monkey`, `react-native-keychain` |
| Permissions | `react-native-permissions` |
