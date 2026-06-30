---
name: create-test
description: Create Jest + React Testing Library tests for components, providers, hooks, services, and stores. Load when writing or fixing any test file.
license: MIT
compatibility: opencode
metadata:
  version: "1.0"
  category: testing
  layer: testing
  workflow: test
  output: __tests__/**/*.test.ts
---

# Skill: Create Test

Create tests for components, providers, hooks, services, and stores.

## When to Use

- Writing tests for a new component, provider, hook, or service
- Adding test coverage to an existing module
- Testing React Query hooks with offline fallback

## Pre-Checks

1. Identify the type: component, provider, hook, service, or store
2. Check `jest.setup.js` for existing global mocks
3. Determine if `@utils/test-utils` or `@testing-library/react-native` should be used

## Gotchas

- Provider tests use `@testing-library/react-native` DIRECTLY — NOT the custom `render` from test-utils (circular wrapping)
- Always call `jest.mock()` BEFORE importing the module under test — order is critical in Jest
- Test QueryClient must have `retry: false` and `gcTime: 0` — the custom `render` in test-utils handles this
- Test descriptions (`describe`, `it`) are in Spanish — `it('debe renderizar correctamente')`
- Never hit real services — mock every HTTP/Firebase/MMKV dependency
- Zustand stores in tests: call `store.setState(...)` directly to set initial state, no need to wrap in act
- `renderHook` from `@testing-library/react-native` needs the custom `wrapper` with providers for query hooks
- SVG mocks are in `__mocks__/svgMock.js` — imported SVGs automatically return a mock component

## Pattern Templates
Available templates: component, provider, query-hook, mutation-hook, service, store, theme-hook.
→ See [references/test-templates.md](references/test-templates.md) for full code.


## Global Mocks Reference (jest.setup.js)

Already mocked globally — do NOT re-mock in tests unless overriding:

- `react-native-gesture-handler`
- `react-native-mmkv`
- `@react-native-firebase/app`, `auth`, `firestore`
- `@react-navigation/native` (useNavigation, useRoute, useFocusEffect)
- `jail-monkey`
- `react-native-keychain`
- `react-native-svg`
- `@react-native-community/netinfo`
- `react-native-permissions`
- `react-native-image-picker`

## test-utils.tsx Reference

The custom render wraps components with:

1. `QueryClientProvider` (retry: false, gcTime: 0)
2. `ThemeProvider`
3. `SafeAreaProvider` (initialMetrics: zeroed)

Exports:

- `render` — custom render with all providers
- `createTestQueryClient` — factory for test QueryClient
- All re-exports from `@testing-library/react-native`

## Checklist

- [ ] Correct import: `@utils/test-utils` for components, `@testing-library/react-native` for providers
- [ ] `jest.mock()` calls placed BEFORE import of module under test
- [ ] Spanish `it()` descriptions: `it('debe renderizar correctamente')`
- [ ] `beforeEach(() => jest.clearAllMocks())` in each describe block
- [ ] No real HTTP/Firebase calls — all services mocked
- [ ] Test file mirrors `src/` structure in `__tests__/`
- [ ] Run `bun run test -- path/to/file.test.ts` to verify
