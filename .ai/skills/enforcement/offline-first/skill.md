---
name: offline-first
category: enforcement
layer: cross-cutting
priority: high
tags:
  - offline
  - cache
  - sync
  - react-query
  - mmkv
  - zustand
triggers:
  - 'Implementing offline support'
  - 'Adding cache persistence'
  - 'Handling connectivity'
description: Enforce offline-first patterns using Zustand + MMKV for cache persistence, React Query for server state, and connectivity-aware strategies. Uses only existing project dependencies.
---

# Offline-First Skill

Enforces offline-first architecture patterns using only existing project dependencies (Zustand, MMKV, React Query).

## When to Use

- Adding offline support to a module
- Persisting server data for offline access
- Implementing optimistic updates
- Handling network state transitions
- Queuing mutations for later sync

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  UI Layer                                            │
│  ┌──────────────┐  ┌────────────────┐               │
│  │ useProducts  │  │ Connectivity   │               │
│  │ (cached)     │  │ Banner         │               │
│  └──────┬───────┘  └────────────────┘               │
├─────────┼───────────────────────────────────────────┤
│  Application Layer                                   │
│  ┌──────┴───────┐  ┌────────────────┐               │
│  │ React Query  │  │ Zustand Store  │               │
│  │ (server)     │  │ (offline cache)│               │
│  └──────┬───────┘  └───────┬────────┘               │
├─────────┼──────────────────┼────────────────────────┤
│  Infrastructure Layer                                │
│  ┌──────┴──────────────────┴────────┐               │
│  │ MMKV Storage (persistence)       │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

**Key principle**: Zustand + MMKV acts as the offline cache layer. React Query handles server state and refetching. When offline, UI reads from the Zustand/MMKV cache. When online, React Query fetches fresh data and syncs it to the cache.

## Dependencies (All Already Installed)

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | 5.0.11 | State management with persistence |
| `react-native-mmkv` | 4.1.2 | Fast synchronous storage |
| `@tanstack/react-query` | 5.90.21 | Server state and refetching |

**No additional packages required.**

## Rules

### R1: Create Zustand Offline Cache Store with MMKV Persistence

Each module that needs offline support gets a Zustand store with MMKV persistence for its data.

```typescript
// ✅ CORRECT: Offline cache store for a module
// src/modules/products/infrastructure/product.offline.storage.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import type { ProductEntity } from '../domain/product.model';

const offlineStorage = new MMKV({ id: 'products-offline' });

const mmkvStorage = {
  getItem: (name: string) => offlineStorage.getString(name) ?? null,
  setItem: (name: string, value: string) => offlineStorage.set(name, value),
  removeItem: (name: string) => offlineStorage.delete(name),
};

interface ProductOfflineState {
  products: ProductEntity[];
  lastSyncedAt: number | null;

  // Actions
  setProducts: (products: ProductEntity[]) => void;
  addProduct: (product: ProductEntity) => void;
  updateProduct: (id: string, product: ProductEntity) => void;
  removeProduct: (id: string) => void;
  clear: () => void;
}

export const useProductOfflineStore = create<ProductOfflineState>()(
  persist(
    (set) => ({
      products: [],
      lastSyncedAt: null,

      setProducts: (products) =>
        set({ products, lastSyncedAt: Date.now() }),

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
          lastSyncedAt: Date.now(),
        })),

      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? product : p)),
          lastSyncedAt: Date.now(),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          lastSyncedAt: Date.now(),
        })),

      clear: () => set({ products: [], lastSyncedAt: null }),
    }),
    {
      name: 'products-offline-cache',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
```

```typescript
// ❌ INCORRECT: Using AsyncStorage for offline cache
import AsyncStorage from '@react-native-async-storage/async-storage';
// AsyncStorage is async and slower — use MMKV for synchronous access

// ❌ INCORRECT: Storing cache in React Query only (no persistence across app restarts)
// React Query cache lives in memory only — lost when app is killed
```

### R2: Sync React Query Results to Offline Store

Queries should write successful results to the offline store so data survives app restarts.

```typescript
// ✅ CORRECT: Query syncs to offline store on success
// src/modules/products/application/product.queries.ts
import { useQuery } from '@tanstack/react-query';
import productService from '../infrastructure/product.service';
import { productEntityAdapter } from '../domain/product.adapter';
import { useProductOfflineStore } from '../infrastructure/product.offline.storage';

export function useProducts() {
  const setProducts = useProductOfflineStore((s) => s.setProducts);
  const cachedProducts = useProductOfflineStore((s) => s.products);

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const result = await productService.getAll();
      if (result instanceof Error) throw result;
      const products = result.map(productEntityAdapter);
      // Sync to offline store
      setProducts(products);
      return products;
    },
    // Use cached data as placeholder while fetching
    placeholderData: cachedProducts.length > 0 ? cachedProducts : undefined,
    staleTime: 1000 * 60 * 5,    // 5 min — data considered fresh
    gcTime: 1000 * 60 * 60 * 24, // 24h — keep in React Query memory cache
  });
}

// ❌ INCORRECT: No sync to offline store — data lost on app restart
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const result = await productService.getAll();
      if (result instanceof Error) throw result;
      return result.map(productEntityAdapter);
      // Missing: sync to offline store
    },
  });
}
```

```typescript
// ✅ CORRECT: Detail query with offline fallback
export function useProductById(id: string) {
  const cachedProduct = useProductOfflineStore(
    (s) => s.products.find((p) => p.id === id),
  );

  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const result = await productService.getById(id);
      if (result instanceof Error) throw result;
      return productEntityAdapter(result);
    },
    placeholderData: cachedProduct ?? undefined,
    enabled: !!id,
  });
}
```

### R3: Configure Cache Time Guidelines

Queries that should work offline need appropriate `staleTime` and `gcTime`.

```typescript
// ✅ CORRECT: Query with offline-friendly cache times
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => { /* ... */ },
    staleTime: 1000 * 60 * 5,    // 5 min — data considered fresh
    gcTime: 1000 * 60 * 60 * 24, // 24h — keep in React Query memory cache
  });
}

// ❌ INCORRECT: Default gcTime (5 min) — data lost too quickly
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => { /* ... */ },
    // No gcTime → defaults to 5 min, memory cache cleared quickly
  });
}
```

**Guidelines for cache times:**

| Data Type | staleTime | gcTime | Rationale |
|-----------|-----------|--------|-----------|
| Reference data (categories, config) | 30 min | 7 days | Rarely changes |
| Lists (products, users) | 5 min | 24 hours | Changes moderately |
| Details (single entity) | 2 min | 1 hour | May need fresh data |
| User-specific data | 1 min | 24 hours | Important but changes |

**Note**: `gcTime` only controls React Query's in-memory cache. The Zustand/MMKV store persists independently across app restarts — that's the true offline cache.

### R4: Connectivity Detection with Zustand

Create a lightweight connectivity store instead of installing `@react-native-community/netinfo`. For a simple approach, detect connectivity from fetch failures.

```typescript
// ✅ CORRECT: Connectivity store using Zustand + MMKV
// src/modules/core/infrastructure/connectivity.storage.ts
import { create } from 'zustand';
import { AppState, type AppStateStatus } from 'react-native';

interface ConnectivityState {
  isConnected: boolean;
  lastCheckedAt: number | null;

  setConnected: (connected: boolean) => void;
  checkConnectivity: () => Promise<boolean>;
}

export const useConnectivityStore = create<ConnectivityState>()((set, get) => ({
  isConnected: true,
  lastCheckedAt: null,

  setConnected: (connected) =>
    set({ isConnected: connected, lastCheckedAt: Date.now() }),

  checkConnectivity: async () => {
    try {
      // Lightweight connectivity check — HEAD request to known endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      set({ isConnected: true, lastCheckedAt: Date.now() });
      return true;
    } catch {
      set({ isConnected: false, lastCheckedAt: Date.now() });
      return false;
    }
  },
}));
```

```typescript
// ✅ CORRECT: Hook that wraps the store for UI usage
// src/hooks/useConnectivity.ts
import { useConnectivityStore } from '@modules/core/infrastructure/connectivity.storage';

export function useConnectivity() {
  const isConnected = useConnectivityStore((s) => s.isConnected);
  const checkConnectivity = useConnectivityStore((s) => s.checkConnectivity);

  return { isConnected, checkConnectivity };
}
```

```typescript
// ✅ CORRECT: Mark offline when service calls fail with network error
// Integration in services — update connectivity state on network errors
// src/modules/network/infrastructure/axios.error.ts (enhancement)
import { useConnectivityStore } from '@modules/core/infrastructure/connectivity.storage';

export function manageAxiosError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      // Network error — no response received
      useConnectivityStore.getState().setConnected(false);
      return new Error('No pudimos conectar con el servidor');
    }
    // Server responded — we are connected
    useConnectivityStore.getState().setConnected(true);
    // ... rest of error handling
  }
  return new Error('Error inesperado');
}
```

### R5: Queue Mutations When Offline with Zustand

Mutations made offline are stored in a Zustand queue and replayed when connectivity returns.

```typescript
// ✅ CORRECT: Offline mutation queue
// src/modules/core/infrastructure/mutation-queue.storage.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const queueStorage = new MMKV({ id: 'mutation-queue' });

const mmkvStorage = {
  getItem: (name: string) => queueStorage.getString(name) ?? null,
  setItem: (name: string, value: string) => queueStorage.set(name, value),
  removeItem: (name: string) => queueStorage.delete(name),
};

export interface PendingMutation {
  id: string;
  module: string;           // 'products', 'users', etc.
  action: string;           // 'create', 'update', 'delete'
  payload: Record<string, any>;
  createdAt: number;
  retries: number;
}

interface MutationQueueState {
  queue: PendingMutation[];

  addToQueue: (mutation: Omit<PendingMutation, 'id' | 'createdAt' | 'retries'>) => void;
  removeFromQueue: (id: string) => void;
  incrementRetries: (id: string) => void;
  clearQueue: () => void;
}

export const useMutationQueueStore = create<MutationQueueState>()(
  persist(
    (set) => ({
      queue: [],

      addToQueue: (mutation) =>
        set((state) => ({
          queue: [
            ...state.queue,
            {
              ...mutation,
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              createdAt: Date.now(),
              retries: 0,
            },
          ],
        })),

      removeFromQueue: (id) =>
        set((state) => ({
          queue: state.queue.filter((m) => m.id !== id),
        })),

      incrementRetries: (id) =>
        set((state) => ({
          queue: state.queue.map((m) =>
            m.id === id ? { ...m, retries: m.retries + 1 } : m,
          ),
        })),

      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'offline-mutation-queue',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
```

```typescript
// ✅ CORRECT: Mutation with offline queue fallback
// src/modules/products/application/product.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnectivityStore } from '@modules/core/infrastructure/connectivity.storage';
import { useMutationQueueStore } from '@modules/core/infrastructure/mutation-queue.storage';
import { useProductOfflineStore } from '../infrastructure/product.offline.storage';

export function useProductCreate() {
  const queryClient = useQueryClient();
  const isConnected = useConnectivityStore((s) => s.isConnected);
  const addToQueue = useMutationQueueStore((s) => s.addToQueue);
  const addProductOffline = useProductOfflineStore((s) => s.addProduct);

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = productFormToPayloadAdapter(data);

      if (!isConnected) {
        // Queue for later and update offline store optimistically
        addToQueue({ module: 'products', action: 'create', payload });
        const optimistic: ProductEntity = {
          ...payload,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addProductOffline(optimistic);
        return optimistic;
      }

      const result = await productService.create(payload);
      if (result instanceof Error) throw result;
      return productEntityAdapter(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

```typescript
// ✅ CORRECT: Process mutation queue when back online
// src/hooks/useMutationQueueProcessor.ts
import { useEffect } from 'react';
import { useConnectivityStore } from '@modules/core/infrastructure/connectivity.storage';
import { useMutationQueueStore } from '@modules/core/infrastructure/mutation-queue.storage';
import { useAppStorage } from '@modules/core/infrastructure/app.storage';

// Service resolvers per module (register your module services here)
const serviceResolvers: Record<string, Record<string, (payload: any) => Promise<any>>> = {
  products: {
    create: (payload) => require('@modules/products/infrastructure/product.service').default.create(payload),
    update: (payload) => require('@modules/products/infrastructure/product.service').default.update(payload.id, payload),
    delete: (payload) => require('@modules/products/infrastructure/product.service').default.delete(payload.id),
  },
};

const MAX_RETRIES = 5;

export function useMutationQueueProcessor() {
  const isConnected = useConnectivityStore((s) => s.isConnected);
  const queue = useMutationQueueStore((s) => s.queue);
  const removeFromQueue = useMutationQueueStore((s) => s.removeFromQueue);
  const incrementRetries = useMutationQueueStore((s) => s.incrementRetries);
  const toast = useAppStorage((s) => s.toast);

  useEffect(() => {
    if (!isConnected || queue.length === 0) return;

    const processQueue = async () => {
      for (const mutation of queue) {
        if (mutation.retries >= MAX_RETRIES) {
          removeFromQueue(mutation.id);
          toast.show({
            message: `Operación descartada después de ${MAX_RETRIES} intentos`,
            type: 'error',
          });
          continue;
        }

        const resolver = serviceResolvers[mutation.module]?.[mutation.action];
        if (!resolver) {
          removeFromQueue(mutation.id);
          continue;
        }

        try {
          const result = await resolver(mutation.payload);
          if (result instanceof Error) throw result;
          removeFromQueue(mutation.id);
        } catch {
          incrementRetries(mutation.id);
        }
      }
    };

    processQueue();
  }, [isConnected, queue.length]);
}
```

### R6: Optimistic Updates with Rollback

Apply optimistic updates for mutations that modify cached data in both React Query and the offline store.

```typescript
// ✅ CORRECT: Optimistic update with rollback in both caches
export function useProductUpdate() {
  const queryClient = useQueryClient();
  const updateProductOffline = useProductOfflineStore((s) => s.updateProduct);
  const cachedProducts = useProductOfflineStore((s) => s.products);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const payload = productFormToPayloadAdapter(data);
      const result = await productService.update(id, payload);
      if (result instanceof Error) throw result;
      const updated = productEntityAdapter(result);
      // Sync to offline store
      updateProductOffline(id, updated);
      return updated;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products', id] });

      // Snapshot previous values
      const previousQueryData = queryClient.getQueryData(['products', id]);
      const previousOfflineProduct = cachedProducts.find((p) => p.id === id);

      // Optimistically update React Query
      queryClient.setQueryData(['products', id], (old: any) => ({
        ...old,
        ...data,
      }));

      // Optimistically update offline store
      if (previousOfflineProduct) {
        updateProductOffline(id, { ...previousOfflineProduct, ...data } as ProductEntity);
      }

      return { previousQueryData, previousOfflineProduct };
    },
    onError: (_error, { id }, context) => {
      // Rollback React Query
      if (context?.previousQueryData) {
        queryClient.setQueryData(['products', id], context.previousQueryData);
      }
      // Rollback offline store
      if (context?.previousOfflineProduct) {
        updateProductOffline(id, context.previousOfflineProduct);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ❌ INCORRECT: No rollback on error
onMutate: async ({ id, data }) => {
  queryClient.setQueryData(['products', id], (old) => ({
    ...old,
    ...data,
  }));
  // Missing: snapshot for rollback
  // Missing: offline store update
},
```

### R7: Show Connectivity Status in UI

Display a non-intrusive banner when offline.

```typescript
// ✅ CORRECT: Offline banner component
// src/components/layout/OfflineBanner.tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@components/core/Text';
import { useTheme, spacing } from '@theme/index';
import { useConnectivity } from '@hooks/useConnectivity';

export function OfflineBanner() {
  const theme = useTheme();
  const { isConnected } = useConnectivity();

  if (isConnected) return null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.warning,
        padding: spacing.sm,
        alignItems: 'center',
      }}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text variant="caption" color="text">
        Sin conexión — usando datos guardados
      </Text>
    </View>
  );
}
```

### R8: Handle Network Errors Gracefully in UI

With offline cache, data may exist even when fetch fails. Adjust the UI guard order.

```typescript
// ✅ CORRECT: UI handles stale cached data
export function ProductsListView() {
  const { data, isError, isLoading, refetch } = useProducts();

  // With placeholderData from offline store, data may exist even when fetch fails
  if (isLoading && !data) return <LoadingState />;
  if (isError && !data) return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyState message="No hay productos" />;

  // Show data (possibly stale) even if there was an error refetching
  return (
    <RootLayout>
      {isError && <OfflineBanner />}
      <FlatList data={data} /* ... */ />
    </RootLayout>
  );
}

// ❌ INCORRECT: Blocking UI on error even when cached data exists
if (isError) return <ErrorState />; // Hides valid cached data
```

## Integration with Existing Patterns

| Pattern | Offline Behavior |
|---------|-----------------|
| `T \| Error` return | Network errors return `Error`, Zustand cache still has data |
| Service factory | All providers (HTTP, Firebase, mock) benefit from offline cache |
| React Query queries | Use `placeholderData` from Zustand/MMKV, refetch when online |
| React Query mutations | Check connectivity → queue if offline, execute if online |
| Zustand + MMKV | Already the persistence layer — extended for offline cache |
| Toast notifications | Show "Sin conexión" on network errors |

## Offline Store Naming Convention

| Store | File | MMKV ID |
|-------|------|---------|
| Products cache | `product.offline.storage.ts` | `products-offline` |
| Users cache | `user.offline.storage.ts` | `users-offline` |
| Mutation queue | `mutation-queue.storage.ts` | `mutation-queue` |
| Connectivity | `connectivity.storage.ts` | (in-memory only) |

## Verification Checklist

```bash
# 1. Verify offline stores exist for feature modules
grep -r "persist" src/modules/*/infrastructure/*.offline.storage.ts
# Each feature module should have an offline store with MMKV persistence

# 2. Verify queries sync to offline store
grep -rn "setProducts\|setUsers\|placeholderData" src/modules/*/application/*.queries.ts
# Queries should write to offline store on success and use placeholderData

# 3. Verify connectivity store exists
grep -r "useConnectivityStore" src/modules/core/infrastructure/
# Should have centralized connectivity state

# 4. Verify mutations handle offline
grep -rn "isConnected\|addToQueue" src/modules/*/application/*.mutations.ts
# Mutations should check connectivity and queue if offline

# 5. Verify optimistic updates have rollback
grep -rn "onMutate" src/modules/*/application/*.mutations.ts
# Each should return context for rollback in both React Query and offline store
```

## References

- Zustand persist middleware: docs.pmnd.rs/zustand/integrations/persisting-store-data
- React Query placeholderData: tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data
- MMKV storage: `src/modules/core/infrastructure/app.storage.ts`
- Zustand store pattern: `.ai/skills/generation/create-store/SKILL.md`
