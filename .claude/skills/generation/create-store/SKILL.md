---
name: create-store
category: generation
layer: application
priority: medium
last_updated: 2026-03-25
tags:
  - zustand
  - global-state
  - mmkv
  - persistence
triggers:
  - 'Creating global state'
  - 'Adding state persistence'
description: Create Zustand stores with optional MMKV persistence. Use when creating global state that needs to persist across app restarts.
---

# Create Store

Create Zustand stores following this project's patterns.

## When to Use

- Creating global state (auth, user preferences, app-wide UI state)
- Needing client-side state that persists across app restarts
- Sharing state between multiple components
- NOT for server state (use React Query in `{feature}.queries.ts`)

## Store Types

### Basic Store (No Persistence)

Used for transient UI state (toasts, modals, etc.).

```typescript
// src/modules/{feature}/application/{feature}.storage.ts
import { create } from 'zustand';

interface {Feature}State {
  someValue: string;
  setSomeValue: (value: string) => void;
  reset: () => void;
}

export const use{Feature}Storage = create<{Feature}State>()(set => ({
  someValue: '',
  setSomeValue: (value) => set({ someValue: value }),
  reset: () => set({ someValue: '' }),
}));
```

### Persistent Store (With MMKV)

Used for data that survives app restarts.

```typescript
// src/modules/{feature}/application/{feature}.storage.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@config/storage';

interface {Feature}State {
  preference: string;
  setPreference: (value: string) => void;
}

export const use{Feature}Storage = create<{Feature}State>()(
  persist(
    set => ({
      preference: 'default',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: '{feature}-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
```

### Nested Slice Pattern (Actual App Storage)

The project's main store uses nested objects for related state:

```typescript
// src/modules/core/application/app.storage.ts
import { create } from 'zustand';
import type {
  ModalOpenParams,
  ToastShowParams,
  ToastType,
  ToastPosition,
} from '../domain/app.model';

interface State {
  modal: {
    visible: boolean;
    entityName: string;
    entityType: string;
    onConfirm: (() => Promise<void>) | null;
    open: (params: ModalOpenParams) => void;
    close: () => void;
  };
  toast: {
    visible: boolean;
    message: string;
    type: ToastType;
    duration: number;
    position: ToastPosition;
    show: (params: ToastShowParams) => void;
    hide: () => void;
  };
}

export const useAppStorage = create<State>()(set => ({
  modal: {
    visible: false,
    entityName: '',
    entityType: '',
    onConfirm: null,
    open: ({ entityName, entityType, onConfirm }: ModalOpenParams) =>
      set(state => ({
        modal: { ...state.modal, visible: true, entityName, entityType, onConfirm },
      })),
    close: () =>
      set(state => ({
        modal: { ...state.modal, visible: false, entityName: '', entityType: '', onConfirm: null },
      })),
  },
  toast: {
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    position: 'bottom',
    show: ({ message, type, duration = 3000, position = 'bottom' }: ToastShowParams) =>
      set(state => ({
        toast: { ...state.toast, visible: true, message, type, duration, position },
      })),
    hide: () =>
      set(state => ({
        toast: { ...state.toast, visible: false, message: '', type: 'info' },
      })),
  },
}));
```

## Usage in Components

```typescript
// Select specific slice to avoid unnecessary re-renders
const { show } = useAppStorage(s => s.toast);

show({ message: 'Creado exitosamente', type: 'success' });
```

```typescript
// Select specific fields
const { open, close } = useAppStorage(state => state.modal);

open({
  entityName: product.name,
  entityType: 'producto',
  onConfirm: async () => {
    await deleteProduct(id);
    close();
    goBack();
  },
});
```

## MMKV Storage Options

The project provides two MMKV instances:

| Storage | Import | Use For |
|---------|--------|---------|
| `mmkvStorage` | `@config/storage` | General persistent data |
| `secureMMKVStorage` | `@config/storage` | Sensitive data (tokens, credentials) |

## Checklist

1. Import `create` from `'zustand'`
2. For persistence: import `persist`, `createJSONStorage` from `'zustand/middleware'`
3. For persistence: import `mmkvStorage` or `secureMMKVStorage` from `@config/storage`
4. Define state interface with TypeScript
5. Create store with `create<StateInterface>()`
6. Use named export: `export const use{Feature}Storage`
7. Storage key must be unique: `{feature}-storage`
8. Place in `src/modules/{feature}/application/`
9. Use selectors for optimal re-renders: `useStore(s => s.specificSlice)`

## Naming Convention

| Element | Pattern | Example |
|---------|---------|---------|
| Store hook | `use{Feature}Storage` | `useAppStorage` |
| State interface | `{Feature}State` or `State` | `State` |
| Location | `application/{feature}.storage.ts` | `application/app.storage.ts` |

## File Structure

```
src/modules/{feature}/
├── domain/
│   └── {feature}.model.ts         # State types (ModalOpenParams, ToastShowParams, etc.)
└── application/
    └── {feature}.storage.ts       # Zustand store
```

## Best Practices

- Use selectors to pick specific slices: `useStore(s => s.toast)`
- Keep stores focused on single responsibility
- Define types for action params in domain layer
- Group related state in nested objects (modal, toast, etc.)
- For large stores, use nested slices pattern (not Zustand slice middleware)

---

# Project Specific

## Existing Stores

- `useAppStorage` — `src/modules/core/application/app.storage.ts` (modal + toast)
- Theme persistence — handled by `ThemeProvider` via MMKV directly

## NOT for Server State

For server state (API data), use React Query:

- Queries: `{feature}.queries.ts`
- Mutations: `{feature}.mutations.ts`

## References

- App storage: `src/modules/core/application/app.storage.ts`
- App model types: `src/modules/core/domain/app.model.ts`
- MMKV config: `src/config/storage.ts`
