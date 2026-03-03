---
name: create-hook
description: Create custom React hooks following project conventions. Use when creating reusable logic hooks, not React Query or Zustand.
---

# Create Hook

Create custom React hooks following this project's conventions.

## When to Use

- Creating custom logic hooks (useForm, useDebounce, useAnimation)
- Extracting reusable component logic
- Any `use*` function that encapsulates stateful logic
- NOT for React Query hooks (those are in application layer)
- NOT for Zustand stores (use create-store skill)

## Hook Types

### Simple Hook (`src/modules/{feature}/ui/hooks/`)

```typescript
import { useState, useCallback } from 'react';

interface UseSomethingOptions {
  initialValue?: string;
  debounceMs?: number;
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

### Hook with Dependencies

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
5. Place in `src/modules/{feature}/ui/hooks/` directory
6. Create barrel export in `index.ts` if needed

## File Structure

```
src/modules/{feature}/
└── ui/
    └── hooks/
        ├── useSomething.ts
        └── index.ts          # Barrel export
```

## Import Order

```typescript
import { useState, useCallback, useEffect } from 'react';
// React Native
import { Animated } from 'react-native';
// Internal
import { useTheme } from '@theme/index';
```

---

# Project Specific (edit for other projects)

## Location

- Feature-specific hooks: `src/modules/{feature}/ui/hooks/`
- Global hooks: `src/hooks/` (if needed)

## NOT for Server State

For server state, use React Query hooks in `application/` layer:
- Queries: `{feature}.queries.ts`
- Mutations: `{feature}.mutations.ts`

## NOT for Global State

For global state, use Zustand stores:
- Location: `src/modules/{feature}/application/{feature}.store.ts`
- See: `create-store` skill
