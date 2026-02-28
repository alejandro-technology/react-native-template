# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Commands, architecture structure, naming conventions, and testing rules are in `.claude/rules/` (auto-injected). This file covers cross-cutting patterns not documented there.

## Key Patterns

**Services use factory pattern** — class implements a repository interface, factory function returns the interface type, default export is the singleton:
```typescript
class AuthService implements AuthRepository { ... }
function createAuthService(): AuthRepository { return new AuthService(); }
export default createAuthService();
```

**Services return `T | Error`** instead of throwing. Mutations convert these to throws for React Query:
```typescript
const result = await authService.signup(payload);
if (result instanceof Error) throw result;
```

**Adapters** transform data between layers (form data → API payload, API response → domain entity). Located in `domain/*.adapter.ts`.

**Zod schemas** define form validation and infer TypeScript types via `z.infer<typeof schema>`. Located in `domain/*.scheme.ts`. Validation rules:
- Error messages in Spanish
- Use string format: `.min(1, 'message')` NOT object format: `.min(1, { message: 'message' })`
- Optional fields: use `.optional()` suffix
- Type coercion: use `z.coerce.TYPE()` when form data needs conversion (e.g., string to number)
- Max length: define for all string fields with user input

**Shared hooks** located in `src/hooks/` are accessible via `@hooks/*` alias. Use for cross-cutting concerns like debouncing, not feature-specific logic.

## Theme System

5 theme modes: `light`, `dark`, `primary`, `secondary`, `premium`. Access via `useTheme()` hook.

Design tokens exported from `@theme/index`: `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `commonStyles`.

Component styles live in `src/theme/components/*.styles.ts` as factory functions that accept mode/variant/size.

Theme persistence uses Zustand + MMKV storage (`src/theme/providers/theme.storage.ts`).

## Providers

`AppProvider` composes (outer → inner): `SecureProvider` → `QueryClientProvider` → `ThemeProvider` → `SafeAreaProvider` → `GestureHandlerRootView` → `NavigationProvider`

## Navigation

React Navigation with Native Stack. Root navigator in `src/navigation/RootNavigator.tsx` with a `RootStackParamList`. Feature stacks are nested (e.g. `ExamplesNavigator` in `src/modules/examples/ui/navigation/`). `NavigationProvider` in `src/providers/NavigationProvider.tsx` wraps `NavigationContainer` and maps the project theme to React Navigation's theme. To add a new stack: create types + navigator in the module's `ui/navigation/` folder, then register in `RootStackParamList`.

## Error Handling

Centralized in `src/modules/network/domain/network.error.ts`. Returns typed Error objects with `name` property for specific cases (`FormError`, `DuplicateIdentifierError`). Error messages are in Spanish.

## Notes

- iOS first setup: `npm run pod-cocoa && npm run pod-install`
- Requires `@babel/plugin-transform-export-namespace-from` for Zod v4 compatibility
- MMKV storage config in `src/config/storage.ts` with custom Date reviver
- Node >= 22.11.0 required
- Prettier: single quotes, trailing commas, no arrow parens
