# React Native Clean Architecture Template

React Native 0.83.4 template with Clean Architecture (4 layers), New Architecture enabled, TypeScript strict mode.

## Build & Test

- Install dependencies: `bun install`
- Run tests: `bun run test`
- Run single test: `bun run test -- <path>.test.ts`
- Lint: `bun run lint`
- Lint fix: `bun run lint:fix`
- Type check: `bun run typecheck`
- Format: `bun run prettier`
- Start Metro: `bun run start`
- Run Android: `bun run android`
- Run iOS: `bun run ios`
- Install pods: `bun run pod-install`
- Clean Android: `bun run clean-android`
- Clean iOS: `bun run clean-ios`

## Architecture Overview

Clean Architecture with 4 layers per feature module:

```
src/modules/{module}/
  domain/          → Entities, repository interfaces, validations (Yup)
  infrastructure/  → Repository implementations (http, firebase, mock)
  application/     → React Query hooks (queries, mutations)
  ui/              → Screens and screen-specific components
```

Entry point: `App.tsx` → `AppProvider` (providers chain) → `RootNavigator`.

Service provider pattern: `src/config/config.ts` → `CONFIG.SERVICE_PROVIDER` (`'http'` | `'firebase'` | `'mock'`). Each module has a factory `{entity}.service.ts` that resolves the implementation.

## Project Layout

```
src/
  assets/          → SVG icons, images
  components/
    core/          → AnimatedPressable, Avatar, Badge, Button, Card, Checkbox, DatePicker, Modal, Select, Text, TextInput, Toast
    form/          → react-hook-form wrappers (Checkbox, DatePicker, Select, TextInput)
    layout/        → DeleteConfirmationSheet, EmptyState, ErrorState, Header, LoadingState, RootLayout, Toolbar
  config/          → api.routes.ts, collections.routes.ts, config.ts
  modules/
    products/      → Reference CRUD module (copy this for new modules)
    users/         → User management module
    authentication/→ Login/register (HTTP, Firebase, mock)
    core/          → Global state (Zustand): toast, delete confirmation modal
    network/       → AxiosService singleton
    firebase/      → Firestore and Storage services
    examples/      → Component showcase
  navigation/      → RootNavigator, Public/Private stacks, typed routes
  providers/       → SecureProvider, ThemeProvider, NavigationProvider
  theme/           → Design tokens, colors, spacing, typography
  utils/           → test-utils, helpers
```

## Conventions & Patterns

- **Language**: Code, variables, types in English. UI text and validation messages in Spanish.
- **State management**: Zustand for global state (`useAppStorage`), React Query for server state.
- **Forms**: react-hook-form + Yup validation schemas (`{entity}.scheme.ts`).
- **Navigation**: Typed routes with enums in `src/navigation/routes/{module}.routes.ts`. Hooks: `useNavigation{Module}`.
- **Repository pattern**: Interface in `domain/{entity}.repository.ts`, three implementations in `infrastructure/`.
- **Styling**: Each component has a co-located `*.styles.ts` file using the theme context.
- **Package manager**: Always use `bun`, never `npm` or `yarn`.
- **New modules**: Copy `products` module structure as reference.
- **No new runtime deps** without explicit justification.

## Testing

- Custom render: `import { render } from '@utils/test-utils'` (wraps QueryClient + ThemeProvider + SafeAreaProvider).
- Global mocks in `jest.setup.js`: gesture-handler, MMKV, Firebase, react-navigation, jail-monkey.
- Excluded from coverage: `*.styles.ts`, `*.types.ts`, `*.scheme.ts`, `*.adapter.ts`, `*.routes.ts`, `index.ts`.
- Test QueryClient config: `retry: false`, `gcTime: 0`.

## Security

- `SecureProvider` blocks rooted/jailbroken devices via jail-monkey.
- Firebase credentials: `ios/GoogleService-Info.plist`, `android/app/google-services.json` (gitignored).
- Never commit API keys, tokens, or secrets. Environment config via `react-native-config`.

## Git Workflows

- Default branch: `main`.
- Pre-commit hooks via Husky + lint-staged: ESLint fix + Prettier on `src/**/*.{ts,tsx}`.
- Before committing: ensure `bun run test`, `bun run lint`, and `bun run typecheck` pass.
- Commit style: conventional commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `perf:`, `style:`).

## Gotchas

- Path aliases (`@components`, `@modules`, `@utils`, etc.) are configured in `babel.config.js` and `tsconfig.json`.
- MMKV is used for theme persistence, not AsyncStorage.
- React Query defaults are configured in `AppProvider` — do not create a new QueryClient in feature code.
- The `.ai/` directory is the source of truth for AI tool configs. Run `bun run claude` to sync to `.claude/`.
