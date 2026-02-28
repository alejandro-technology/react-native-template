---
name: mobile-testing
description: Complete guide for writing tests. Load when creating or modifying tests. Edit to adapt to your project.
---

# Mobile Testing Guide (Template)

## When to use this skill

- When creating tests for components, hooks, services, or utilities.
- When debugging failed tests.

## Generic Setup

### Render with providers

Always import from your custom test-utils:

```typescript
import { render, screen, fireEvent, waitFor } from '@test-utils';
```

The custom render must wrap in: QueryClientProvider + ThemeProvider + SafeAreaProvider + NavigationContainer (adjust to your project's providers).

### Infrastructure mocks

Mock services at the module level:

```typescript
jest.mock('@modules/.../infrastructure/service');
```

### Cleanup

Always clean in each main describe:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Hook testing

```typescript
import { renderHook, waitFor } from '@test-utils';

const { result } = renderHook(() => useMyHook());
await waitFor(() => expect(result.current.data).toBeDefined());
```

## File location (generic)

The testing root folder should map the src/ hierarchy.

---

# Project Specific (edit for other projects)

## Testing Configuration

- Test utils: jest/test-utils.tsx
- Providers: QueryClientProvider + ThemeProvider + SafeAreaProvider + NavigationContainer
- Mocks: jest.mock('@modules/.../infrastructure/service')
- Location: **__tests__/**
- Coverage: excludes index.ts, *.model.ts, *.repository.ts
