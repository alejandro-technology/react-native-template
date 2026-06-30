---
name: layer-application
description: >
  Create the application layer for a Clean Architecture module: React Query
  queries with offline fallback and placeholderData, mutations with toast
  feedback and storage sync, Zustand store with MMKV persistence, and utility
  hooks (useDebounce, useToggle). Use when implementing data fetching, caching,
  server state management, offline-first behavior, or CRUD operations for a
  feature module.
license: MIT
compatibility: React Native 0.83+, TypeScript strict mode, bun package manager. Requires project structure from react-native-template.
metadata:
  version: "2.0"
  category: architecture-layer
  layer: application
  workflow: scaffold
  output: src/modules/{module}/application/**
---

# Application Layer

Create the application layer for entity `$ARGUMENTS`.

## Files to Create

```
src/modules/{module}/application/
  {entities}.storage.ts     # Zustand store with MMKV persistence
  {entity}.queries.ts       # React Query query hooks
  {entity}.mutations.ts     # React Query mutation hooks
  {module}.hooks.ts         # Custom hooks (optional)
```

## Non-Negotiable Rules

1. **Query keys** always come from `QUERY_KEYS` in `@config/query.keys` — never inline arrays.
2. **Connectivity check** before every server call: `const isConnected = await getIsConnected()`.
3. **Offline fallback** via `placeholderData` from the Zustand store in every query.
4. **Mutations flow:** connectivity check → service call → `instanceof Error` check → sync storage → show toast → invalidate query.
5. **Store persistence:** `partialize` to exclude action functions, `mmkvReviver` in `onRehydrateStorage` for `Date` fields.
6. **Never** call `.getState()` inside a React component — use selector hooks.
7. **Never** call selector hooks outside React — use `.getState()` in `queryFn`, `mutationFn`, services.

## Store Shape (Zustand + MMKV)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, mmkvReviver } from '@config/storage';
import { {Entity} } from '../domain/{entity}.model';

interface {Entities}Store {
  {entities}: {Entity}[];
  // Actions
  set{Entities}: ({entities}: {Entity}[]) => void;
  upsert{Entity}: ({entity}: {Entity}) => void;
  remove{Entity}: (id: string) => void;
}

export const use{Entities}Storage = create<{Entities}Store>()(
  persist(
    (set) => ({
      {entities}: [],
      set{Entities}: ({entities}) => set({ {entities} }),
      upsert{Entity}: ({entity}) =>
        set((state) => ({
          {entities}: state.{entities}.some((e) => e.id === {entity}.id)
            ? state.{entities}.map((e) => (e.id === {entity}.id ? {entity} : e))
            : [...state.{entities}, {entity}],
        })),
      remove{Entity}: (id) =>
        set((state) => ({ {entities}: state.{entities}.filter((e) => e.id !== id) })),
    }),
    {
      name: '{entities}-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ {entities}: state.{entities} }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.{entities} = state.{entities}.map((e) => mmkvReviver(e));
        }
      },
    },
  ),
);
```

## Query Shape

```typescript
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@config/query.keys';
import { getIsConnected } from '@modules/network';
import {entity}Service from '../infrastructure/{entity}.service';
import { use{Entities}Storage } from './{entities}.storage';

export function use{Entities}(search = '') {
  const stored{Entities} = use{Entities}Storage((s) => s.{entities});

  return useQuery({
    queryKey: QUERY_KEYS.{ENTITIES}(search),
    queryFn: async () => {
      const isConnected = await getIsConnected();
      if (!isConnected) return stored{Entities};

      const result = await {entity}Service.getAll({ search });
      if (result instanceof Error) throw result;
      return result;
    },
    placeholderData: stored{Entities},
  });
}
```

## Mutation Shape

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@config/query.keys';
import { getIsConnected } from '@modules/network';
import { useAppStorage } from '@modules/core';
import {entity}Service from '../infrastructure/{entity}.service';
import { use{Entities}Storage } from './{entities}.storage';
import { Create{Entity}Payload } from '../domain/{entity}.model';

export function use{Entity}Create() {
  const queryClient = useQueryClient();
  const showToast = useAppStorage((s) => s.toast.show);
  const upsert{Entity} = use{Entities}Storage.getState().upsert{Entity};

  return useMutation({
    mutationFn: async (payload: Create{Entity}Payload) => {
      const isConnected = await getIsConnected();
      if (!isConnected) throw new Error('Sin conexión a internet');

      const result = await {entity}Service.create(payload);
      if (result instanceof Error) throw result;
      return result;
    },
    onSuccess: ({entity}) => {
      upsert{Entity}({entity});
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.{ENTITIES}() });
      showToast({ message: '{Entity} creado exitosamente', type: 'success' });
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: 'error' });
    },
  });
}
```

→ See [references/templates.md](references/templates.md) for full templates including delete, update, and utility hooks.

## Checklist

- [ ] All query keys use `QUERY_KEYS.{entity}.*` — no inline arrays
- [ ] Every query checks `getIsConnected()` before calling service
- [ ] Mutations check connectivity, handle `instanceof Error`, sync storage, show toast
- [ ] Zustand store has `partialize` that excludes action functions
- [ ] `mmkvReviver` is set in `onRehydrateStorage` for stores with `Date` fields
- [ ] Selector hooks used inside React; `.getState()` used outside React
- [ ] Run `bun run typecheck`

## Reference

- Example: `src/modules/products/application/`
