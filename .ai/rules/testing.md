---
trigger: model_decision
---

# Testing Rules

Tests run on Jest + `@testing-library/react-native`. They exercise behavior, mock
all infrastructure, and render through a custom helper that wires the app's
providers. Tests describe behavior in Spanish, mirroring the product language.

## Core Mandates

1. **Custom render.** Use `import { render } from '@utils/test-utils'` — it wraps
   the tree with QueryClient, ThemeProvider, and SafeAreaProvider.
2. **Provider tests are the exception.** Provider tests render with
   `@testing-library/react-native` directly to avoid circular wrapping.
3. **Mirror the source tree.** Tests live in `__tests__/` mirroring `src/`.
4. **Mock before import.** Place `jest.mock()` calls before importing the module
   under test, and mock all infrastructure (HTTP, Firebase, MMKV, navigation).
5. **Behavior-first, Spanish descriptions.** Write `it()` descriptions in Spanish
   (`it('debe renderizar correctamente')`) and assert observable behavior.
6. **Test QueryClient config.** `retry: false`, `gcTime: 0`.
7. **Coverage.** No global threshold; primitives (Button, TextInput, Text) carry
   per-file thresholds. Excluded from coverage: `*.styles.ts`, `*.types.ts`,
   `*.scheme.ts`, `*.adapter.ts`, `*.routes.ts`, `index.ts`, `test-utils.tsx`.

## File Structure

```
__tests__/
  components/{core|form|layout}/{Component}.test.tsx
  providers/{Name}Provider.test.tsx
  modules/{module}/application/{entity}.queries.test.ts
  theme/{token}.test.ts
```

## Do Not

- Do not hit real services — mock every infrastructure dependency.
- Do not import the module under test before its `jest.mock()` calls.
- Do not wrap provider tests in `test-utils` (causes circular provider nesting).
- Do not assert on implementation details when behavior is observable.

## See Also

- What gets mocked at each layer: [`architecture.md`](./architecture.md)
- Store access in non-React contexts: [`state-management.md`](./state-management.md)
