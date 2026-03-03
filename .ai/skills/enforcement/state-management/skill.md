---
name: state-management
category: enforcement
layer: application
priority: high
tags:
  - zustand
  - react-query
  - mmkv
  - persistence
  - caching
triggers:
  - 'Creating stores'
  - 'Caching strategies'
  - 'Data flow review'
description: Guide state management patterns using Zustand for global state, TanStack React Query for server state, and MMKV for persistence. Use when creating stores, caching strategies, or managing data flow.
---

# State Management Skill

Enforces the three-tier state management strategy used throughout the project.

## When to Use

- Creating global state (Zustand)
- Managing server state (React Query)
- Persisting data across sessions (MMKV)
- Deciding where state should live
- Reviewing data flow patterns

## State Architecture

```
┌──────────────────────────────────────────────┐
│                  UI Layer                     │
│  Components consume state via hooks           │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │   Zustand    │  │   TanStack Query     │   │
│  │  (Global)    │  │   (Server State)     │   │
│  │             │  │                      │   │
│  │  - UI state  │  │  - API data cache    │   │
│  │  - Theme     │  │  - Query hooks       │   │
│  │  - Toast     │  │  - Mutation hooks    │   │
│  │  - Modal     │  │  - Auto-refetch      │   │
│  └──────┬──────┘  └───────────┬──────────┘   │
│         │                     │              │
│         ▼                     ▼              │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │    MMKV     │  │   Infrastructure     │   │
│  │ (Persist)   │  │   (Services)         │   │
│  └─────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────┘
```

## Decision Matrix: Where Does State Live?

| State Type             | Solution             | Example                      |
| ---------------------- | -------------------- | ---------------------------- |
| Server data (CRUD)     | TanStack React Query | Products list, user details  |
| UI preferences         | Zustand + MMKV       | Theme mode, language         |
| Ephemeral UI state     | React `useState`     | Form input, modal visibility |
| Cross-screen transient | Zustand (no persist) | Toast messages, modal state  |
| Navigation params      | React Navigation     | `productId`, `user` object   |

## TanStack React Query Patterns

### Query Key Convention

```typescript
// List queries: ['{entities}', 'list', ...filters]
queryKey: ['products', 'list', filter?.searchText];

// Detail queries: ['{entities}', 'detail', id]
queryKey: ['products', 'detail', id];
```

### Query Hook Pattern

```typescript
export function useProducts(filter?: ProductFilter, enabled = true) {
  return useQuery({
    queryKey: ['products', 'list', filter?.searchText],
    queryFn: async () => {
      const result = await productService.getAll(filter);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled,
  });
}
```

### Mutation Hook Pattern

```typescript
export function useProductCreate() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (data: Parameters<typeof productService.create>[0]) => {
      const result = await productService.create(data);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    onSuccess: () => {
      show({
        message: 'Producto creado exitosamente',
        type: 'success',
        position: 'bottom',
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

### Cache Invalidation Rules

| Action | Invalidate                                        |
| ------ | ------------------------------------------------- |
| Create | `['{entities}']` (all lists)                      |
| Update | `['{entities}']` + `['{entities}', 'detail', id]` |
| Delete | `['{entities}']` (all lists)                      |

## Zustand Patterns

### Store with MMKV Persistence

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@config/storage';

interface ThemeState {
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStorage = create<ThemeState>()(
  persist(
    set => ({
      mode: 'light',
      setTheme: mode => set({ mode }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
```

### Transient Store (No Persistence)

```typescript
// For toast, modal, and other ephemeral global state
export const useAppStorage = create<AppState>(set => ({
  toast: {
    show: config => set({ toast: { ...config, visible: true } }),
    hide: () => set(state => ({ toast: { ...state.toast, visible: false } })),
  },
  modal: {
    open: config => set({ modal: { ...config, visible: true } }),
    close: () => set(state => ({ modal: { ...state.modal, visible: false } })),
  },
}));
```

## Validation Rules

| Rule | Description                                                                      |
| ---- | -------------------------------------------------------------------------------- |
| R1   | Server data MUST use React Query, not Zustand                                    |
| R2   | Query keys follow `[entity, scope, ...params]` convention                        |
| R3   | Mutations MUST invalidate related query keys on success                          |
| R4   | Success feedback uses `useAppStorage(s => s.toast).show()`                       |
| R5   | Toast messages: Spanish, `type: 'success'`, `position: 'bottom'`                 |
| R6   | Persisted stores use MMKV via `createJSONStorage(() => mmkvStorage)`             |
| R7   | `enabled` parameter controls query execution (disabled for conditional fetching) |
| R8   | Detail query uses `enabled: enabled && Boolean(id)` guard                        |
| R9   | Mutation types inferred via `Parameters<typeof service.method>[N]`               |

## Anti-Patterns

```typescript
// WRONG: Storing server data in Zustand
const useProductStore = create(set => ({
  products: [],
  setProducts: products => set({ products }),
}));

// CORRECT: Use React Query for server data
const { data: products } = useProducts();

// WRONG: Manual cache update
setProducts([...products, newProduct]);

// CORRECT: Invalidate and let React Query refetch
queryClient.invalidateQueries({ queryKey: ['products'] });

// WRONG: Fetching in useEffect
useEffect(() => {
  fetchProducts().then(setProducts);
}, []);

// CORRECT: Declarative with React Query
const { data, isLoading, isError } = useProducts(filter);
```
