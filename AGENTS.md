# React Native Clean Architecture Template

React Native 0.83.4, Clean Architecture (4 layers), TypeScript strict mode, New Architecture enabled. Package manager: **bun** (never npm/yarn). Node >= 20.

## Commands

```bash
bun install                          # Install dependencies
bun run test                         # Run all tests
bun run test -- path/to/file.test.ts # Run single test file
bun run test:watch                   # Watch mode
bun run test:coverage                # Coverage report
bun run lint                         # ESLint check
bun run lint:fix                     # ESLint fix
bun run typecheck                    # TypeScript check
bun run prettier                     # Format code
bun run start / android / ios        # Run app
```

Always run `bun run lint`, `bun run typecheck`, and `bun run test` after making changes.

### Clean Commands (troubleshooting)

```bash
bun run clean-node                   # Remove node_modules + bun.lockb
bun run clean-android                # Remove Android build artifacts
bun run clean-ios                    # Remove iOS build/Pods/Podfile.lock
bun run clean-watch                  # Reset watchman
bun run pod-install                  # Bundle exec pod install (iOS)
```

## Architecture

Clean Architecture with 4 layers per feature module under `src/modules/{module}/`:

- **domain/** — Entity interfaces (`{Entity}`, `Create{Entity}Payload`, `Update{Entity}Payload`, `{Entity}Filter`), repository interface, Yup schema, adapter
- **infrastructure/** — Service factory (switches on `CONFIG.SERVICE_PROVIDER`), HTTP (axios), Firebase (firestore), Mock implementations
- **application/** — React Query hooks (queries with offline fallback, mutations with toast), Zustand stores with MMKV persistence
- **ui/** — Screens (`{Entities}ListView`, `{Entity}DetailView`, `{Entity}FormView`) and screen-specific components

Entry: `App.tsx` → `AppProvider` → `RootNavigator`. Service provider set in `src/config/config.ts`.

## Imports

Use path aliases: `@assets/*`, `@components/*`, `@modules/*`, `@theme/*`, `@utils/*`, `@config/*`, `@navigation/*`. Aliases defined in both `tsconfig.json` and `babel.config.js`. Group imports with blank lines and comment labels:

```typescript
import React from 'react';
import { View } from 'react-native';
// Types
import { Product } from '@modules/products/domain/product.model';
// Theme
import { useTheme } from '@theme/index';
// Components
import { Button } from './Button';
```

## Naming

- **Files**: kebab-case (`product.service.ts`, `use-products.ts`)
- **Components/Exports**: PascalCase (`ProductCard`, `useProductCreate`)
- **Interfaces**: PascalCase (`Product`, `CreateProductPayload`)
- **Variables/Functions**: camelCase (`productService`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (`QUERY_KEYS`, `SERVICE_PROVIDER`)
- **Enums**: PascalCase with PascalCase members (`ProductRoutes.ProductList`)

## Formatting (Prettier)

- Single quotes, trailing commas (all), arrow parens avoided
- Enforced via lint-staged on commit: ESLint fix + Prettier write on `src/**/*.{ts,tsx}`

## TypeScript & Error Handling

- `interface` for object shapes, `type` for unions/aliases
- Services return `Promise<T | Error>` — never throw in services
- Mutations check `instanceof Error` and re-throw
- Use `InferType` from Yup for form data types
- Use `Omit`, `Pick`, `Partial` for prop variations

```typescript
// Service: return Error, never throw
async getById(id: string): Promise<Product | Error> {
  try { return (await axiosService.get(`/products/${id}`)).data; }
  catch (e) { return manageAxiosError(e); }
}

// Mutation: check and re-throw
const result = await productService.getById(id);
if (result instanceof Error) throw result;
```

## React Patterns

- Functional components with explicit props interface, destructure with defaults
- Include `accessibilityRole` and `accessibilityState` on interactive elements
- Co-located `*.styles.ts` files with style factories: `getButtonStyle({ variant, size })`
- Theme tokens: `spacing.sm`, `colors.primary`, `borderRadius.md`

## React Query

- Queries: use `QUERY_KEYS` from `@config/query.keys`, check `getIsConnected()` for offline fallback, use `placeholderData` from local storage
- Mutations: check connectivity before server call, sync with local storage on success, show toast via `useAppStorage(s => s.toast)`, invalidate queries on success
- Never create a new QueryClient in feature code — use the one in `AppProvider`

## Testing

- Custom render: `import { render } from '@utils/test-utils'`
- Test QueryClient uses `retry: false`, `gcTime: 0`
- Global mocks in `jest.setup.js`: gesture-handler, MMKV, Firebase, react-navigation, jail-monkey, react-native-config
- SVG files mocked via `__mocks__/svgMock.js`

### Coverage

Excluded from coverage collection:

- `*.styles.ts`, `*.types.ts`, `*.scheme.ts`, `*.adapter.ts`, `*.routes.ts`, `*.model.ts`, `*.repository.ts`
- `index.ts`, `test-utils.tsx`, `src/config/*.ts`
- Example/demo modules: `examples`, `firebase`, `products`, `users`, `navigation`

Global thresholds: branches 20%, functions 20%, lines 25%, statements 25%. Core components (`Button`, `TextInput`, `Text`) have higher per-file thresholds (70-100%).

## Language

- **Code, variables, types, files**: English
- **UI text, validation messages, toast messages**: Spanish

## Security & Git

- `SecureProvider` blocks rooted/jailbroken devices
- Never commit API keys — use `react-native-config`
- Firebase credentials gitignored
- Pre-commit: Husky + lint-staged (ESLint fix + Prettier)
- Commit style: conventional commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`)

## Key Dependencies

| Category   | Library                                                      |
| ---------- | ------------------------------------------------------------ |
| Navigation | `@react-navigation/native` + `native-stack`                  |
| State      | `zustand` (MMKV persistence), `@tanstack/react-query`        |
| Forms      | `react-hook-form` + `@hookform/resolvers` + `yup`            |
| Lists      | `@shopify/flash-list`                                        |
| HTTP       | `axios`                                                      |
| Firebase   | `@react-native-firebase/app`, `auth`, `firestore`, `storage` |
| Storage    | `react-native-mmkv` (never AsyncStorage)                     |
| Images     | `react-native-fast-image`, `react-native-image-picker`       |
| Security   | `jail-monkey`, `react-native-keychain`                       |

## Gotchas

- Path aliases must be in both `babel.config.js` and `tsconfig.json`
- MMKV for persistence, not AsyncStorage
- Module creation rules in `.opencode/rules/create-module.md`
- The `.ai/` directory is the source of truth — copied to `.opencode/`, `.claude/`, `.trae/` via package.json scripts
