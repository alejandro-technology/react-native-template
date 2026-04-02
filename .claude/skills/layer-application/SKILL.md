---
name: layer-application
description: Create the application layer for a Clean Architecture module (React Query queries, mutations, Zustand storage, custom hooks).
license: MIT
compatibility: opencode
metadata:
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

## Step 1: `{entities}.storage.ts`

Zustand store with MMKV persistence for offline support.

```typescript
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
// Config
import { mmkvStorage, mmkvReviver } from '@config/storage';
// Types
import type { {Entity}, {Entity}Filter } from '../domain/{entity}.model';

/**
 * {Entities} storage state interface
 */
interface {Entities}State {
  // Data
  {entities}: {Entity}[];

  // Actions
  add{Entity}: (item: {Entity}) => void;
  set{Entities}: (items: {Entity}[]) => void;
  get{Entities}: (filter?: {Entity}Filter) => {Entity}[];
  get{Entity}ById: (id: string) => {Entity} | undefined;
  update{Entity}: (id: string, updates: Partial<{Entity}>) => void;
  delete{Entity}: (id: string) => void;
  clear{Entities}: () => void;
}

const initialState = {
  {entities}: [] as {Entity}[],
};

/**
 * Zustand store with MMKV persistence
 * Provides offline data access and sync
 */
export const use{Entities}Storage = create<{Entities}State>()(
  persist(
    (set, get) => ({
      ...initialState,

      add{Entity}: (item: {Entity}) =>
        set(state => ({
          {entities}: [...state.{entities}, item],
        })),

      set{Entities}: (items: {Entity}[]) =>
        set({ {entities}: items }),

      get{Entities}: (filter?: {Entity}Filter) => {
        let {entities} = get().{entities};

        // Apply search filter
        if (filter?.searchText) {
          const search = filter.searchText.toLowerCase();
          {entities} = {entities}.filter(e =>
            e.name.toLowerCase().includes(search),
          );
        }

        // Sort by most recent
        return {entities}.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
        );
      },

      get{Entity}ById: (id: string) => {
        return get().{entities}.find(e => e.id === id);
      },

      update{Entity}: (id: string, updates: Partial<{Entity}>) =>
        set(state => ({
          {entities}: state.{entities}.map(e =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e,
          ),
        })),

      delete{Entity}: (id: string) =>
        set(state => ({
          {entities}: state.{entities}.filter(e => e.id !== id),
        })),

      clear{Entities}: () => set({ {entities}: [] }),
    }),
    {
      name: '{entities}-storage',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      // Only persist the data, not the actions
      partialize: state => ({ {entities}: state.{entities} }),
      // Rehydrate dates from JSON strings
      onRehydrateStorage: () => state => {
        if (state?.{entities}) {
          state.{entities} = state.{entities}.map(e => ({
            ...e,
            createdAt: mmkvReviver('createdAt', e.createdAt) as Date,
            updatedAt: mmkvReviver('updatedAt', e.updatedAt) as Date,
          }));
        }
      },
    },
  ),
);
```

## Step 2: `{entity}.queries.ts`

React Query hooks with offline fallback.

```typescript
import { useQuery } from '@tanstack/react-query';
// Storage
import { use{Entities}Storage } from './{entities}.storage';
// Service
import {entity}Service from '../infrastructure/{entity}.service';
// Config
import { QUERY_KEYS } from '@config/query.keys';
import { getIsConnected } from '@modules/network/application/connectivity.storage';
// Types
import type { {Entity}Filter } from '../domain/{entity}.repository';

/**
 * Query hook for fetching all {entities}
 * Falls back to local storage when offline
 */
export function use{Entities}(filter?: {Entity}Filter, enabled = true) {
  const get{Entities} = use{Entities}Storage.getState().get{Entities};
  const set{Entities} = use{Entities}Storage.getState().set{Entities};

  return useQuery({
    queryKey: QUERY_KEYS.{ENTITIES}(filter?.searchText),
    queryFn: async () => {
      // Check connectivity
      const connected = getIsConnected();
      if (!connected) {
        // Return local data when offline
        return get{Entities}(filter);
      }

      // Fetch from server
      const result = await {entity}Service.getAll(filter);
      if (result instanceof Error) {
        throw result;
      }

      // Sync to local storage
      set{Entities}(result);
      return result;
    },
    // Show local data while loading
    placeholderData: () => get{Entities}(filter),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Query hook for fetching a single {entity}
 * Falls back to local storage when offline
 */
export function use{Entity}(id: string, enabled = true) {
  const get{Entity}ById = use{Entities}Storage.getState().get{Entity}ById;

  return useQuery({
    queryKey: QUERY_KEYS.{ENTITY}_DETAIL(id),
    queryFn: async () => {
      // Check connectivity
      const connected = getIsConnected();
      if (!connected) {
        // Return local data when offline
        const local = get{Entity}ById(id);
        if (local) return local;
        throw new Error('{Entity} no encontrado en caché');
      }

      // Fetch from server
      const result = await {entity}Service.getById(id);
      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    // Show local data while loading
    placeholderData: () => get{Entity}ById(id),
    enabled: enabled && Boolean(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

## Step 3: `{entity}.mutations.ts`

React Query mutation hooks with toast notifications.

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Domain
import { {entity}FormToPayloadAdapter } from '../domain/{entity}.adapter';
import type { {Entity}FormData } from '../domain/{entity}.scheme';
// Storage
import { use{Entities}Storage } from './{entities}.storage';
// Service
import {entity}Service from '../infrastructure/{entity}.service';
// App
import { useAppStorage } from '@modules/core/application/app.storage';
import { getIsConnected } from '@modules/network/application/connectivity.storage';
// Config
import { QUERY_KEYS } from '@config/query.keys';

/**
 * Mutation hook for creating a new {entity}
 */
export function use{Entity}Create() {
  const queryClient = useQueryClient();
  const add{Entity} = use{Entities}Storage.getState().add{Entity};
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (form: {Entity}FormData) => {
      // Check connectivity
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('Sin conexión a internet');
      }

      // Convert form to payload
      const payload = {entity}FormToPayloadAdapter(form);

      // Call service
      const result = await {entity}Service.create(payload);
      if (result instanceof Error) {
        throw result;
      }

      // Sync to local storage
      add{Entity}(result);
      return result;
    },
    onSuccess: () => {
      // Show success toast
      show({
        message: '{Entity} creado exitosamente',
        type: 'success',
      });
      // Invalidate list query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.{ENTITIES}() });
    },
    onError: (error: Error) => {
      // Show error toast
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}

/**
 * Mutation hook for updating an existing {entity}
 */
export function use{Entity}Update() {
  const queryClient = useQueryClient();
  const update{Entity} = use{Entities}Storage.getState().update{Entity};
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: {Entity}FormData }) => {
      // Check connectivity
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('Sin conexión a internet');
      }

      // Convert form to payload
      const payload = {entity}FormToPayloadAdapter(form);

      // Call service
      const result = await {entity}Service.update(id, payload);
      if (result instanceof Error) {
        throw result;
      }

      // Sync to local storage
      update{Entity}(id, result);
      return result;
    },
    onSuccess: (_, variables) => {
      // Show success toast
      show({
        message: '{Entity} actualizado exitosamente',
        type: 'success',
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.{ENTITIES}() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.{ENTITY}_DETAIL(variables.id),
      });
    },
    onError: (error: Error) => {
      // Show error toast
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}

/**
 * Mutation hook for deleting a {entity}
 */
export function use{Entity}Delete() {
  const queryClient = useQueryClient();
  const delete{Entity} = use{Entities}Storage.getState().delete{Entity};
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (id: string) => {
      // Check connectivity
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('Sin conexión a internet');
      }

      // Call service
      const result = await {entity}Service.delete(id);
      if (result instanceof Error) {
        throw result;
      }

      // Sync to local storage
      delete{Entity}(id);
    },
    onSuccess: () => {
      // Show success toast
      show({
        message: '{Entity} eliminado exitosamente',
        type: 'success',
      });
      // Invalidate list query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.{ENTITIES}() });
    },
    onError: (error: Error) => {
      // Show error toast
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}
```

## Step 4: `{module}.hooks.ts` (Optional)

Custom utility hooks for the module.

```typescript
import { useEffect, useState, useCallback } from 'react';

/**
 * Debounce hook for search input
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Toggle hook for boolean state
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}
```

## Rules

1. **Queries**: Always check connectivity, use `placeholderData` from storage
2. **Mutations**: Check connectivity before calling service, sync storage on success
3. **Toast**: Show success/error messages via `useAppStorage`
4. **Storage**: Use MMKV persistence, rehydrate Date fields
5. **Query Keys**: Use `QUERY_KEYS` from `@config/query.keys`

## Reference

- Example: `src/modules/products/application/`
