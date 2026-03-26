---
name: create-hook
category: generation
layer: application
priority: medium
last_updated: 2026-03-25
tags:
  - custom-hooks
  - react-hooks
  - reusable-logic
triggers:
  - 'Creating reusable logic'
  - 'Extracting hook logic'
description: Create custom React hooks following project conventions. Use when creating reusable logic hooks, not React Query hooks or Zustand stores.
---

# Create Hook

Create custom React hooks following this project's conventions.

## When to Use

- Creating custom logic hooks (useDebounce, useAnimation, useForm logic)
- Extracting reusable component logic
- Any `use*` function that encapsulates stateful logic
- NOT for React Query hooks (those are in `application/{feature}.queries.ts`)
- NOT for Zustand stores (use create-store skill)

## Hook Locations

| Type | Location | Example |
|------|----------|---------|
| Feature hooks | `src/modules/{feature}/application/` | `core.hooks.ts` |
| Theme hooks | `src/theme/hooks/` | `useFocusFadeIn`, `useFocusSlideIn` |
| Navigation hooks | `src/navigation/hooks/` | `useNavigationProducts` |

## Hook Templates

### Simple State Hook

```typescript
// src/modules/{feature}/application/{feature}.hooks.ts
import { useState, useCallback } from 'react';

interface UseSomethingOptions {
  initialValue?: string;
}

interface UseSomethingReturn {
  value: string;
  handleChange: (newValue: string) => void;
  reset: () => void;
}

export function useSomething(
  options: UseSomethingOptions = {},
): UseSomethingReturn {
  const { initialValue = '' } = options;
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return { value, handleChange, reset };
}
```

### Debounce Hook (Actual Pattern)

```typescript
// src/modules/core/application/core.hooks.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Effect-based Hook

```typescript
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

## Checklist

1. Name with `use` prefix: `useSomething`
2. Export as named export: `export function useSomething()`
3. Use `useCallback` for functions to maintain referential equality
4. Use `useMemo` for expensive computations
5. Place in appropriate location (see table above)
6. Group related hooks in a single file: `{feature}.hooks.ts`

## Import Order

```typescript
import { useState, useCallback, useEffect } from 'react';
// React Native
import { Animated } from 'react-native';
// Internal
import { useTheme } from '@theme/index';
```

---

# Project Specific

## Existing Hooks

- `useDebounce` — `src/modules/core/application/core.hooks.ts`
- `useFocusFadeIn` — `src/theme/hooks/`
- `useFocusSlideIn` — `src/theme/hooks/`
- `useNavigationProducts`, `useNavigationUsers`, etc. — `src/navigation/hooks/`

## NOT for Server State

For server state, use React Query hooks in `application/` layer:

- Queries: `{feature}.queries.ts`
- Mutations: `{feature}.mutations.ts`

## NOT for Global State

For global state, use Zustand stores:

- Location: `src/modules/core/application/app.storage.ts`
- See: `create-store` skill
