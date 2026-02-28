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

**Zod schemas** define form validation and infer TypeScript types via `z.infer<typeof schema>`. Located in `domain/*.scheme.ts`.

## Theme System

5 theme modes: `light`, `dark`, `primary`, `secondary`, `premium`. Access via `useTheme()` hook.

Design tokens exported from `@theme/index`: `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `commonStyles`.

Component styles live in `src/theme/components/*.styles.ts` as factory functions that accept mode/variant/size.

Theme persistence uses Zustand + MMKV storage (`src/theme/providers/theme.storage.ts`).

## Providers

`AppProvider` composes (outer → inner): `SecureProvider` → `QueryClientProvider` → `ThemeProvider` → `SafeAreaProvider` → `GestureHandlerRootView`

## Navigation

Custom state-based navigation (no React Navigation). Uses a view registry pattern with animated transitions in `src/modules/examples/ui/RootNavigator.tsx`.

## Error Handling

Centralized in `src/modules/network/domain/network.error.ts`. Returns typed Error objects with `name` property for specific cases (`FormError`, `DuplicateIdentifierError`). Error messages are in Spanish.

## Notes

- iOS first setup: `npm run pod-cocoa && npm run pod-install`
- Requires `@babel/plugin-transform-export-namespace-from` for Zod v4 compatibility
- MMKV storage config in `src/config/storage.ts` with custom Date reviver
- Node >= 22.11.0 required
- Prettier: single quotes, trailing commas, no arrow parens
