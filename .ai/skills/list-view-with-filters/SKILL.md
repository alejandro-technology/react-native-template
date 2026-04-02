---
name: list-view-with-filters
description: Implement a list screen with inline search bar and/or advanced filter panel (modal). Load when creating ListView screens that need searchText debouncing, per-source filter capabilities, and persistent filter state.
license: MIT
compatibility: opencode
metadata:
  layer: ui,application,domain
  workflow: scaffold
  output: src/modules/{module}/ui/{Entities}ListView.tsx, src/modules/{module}/ui/components/{Entity}FiltersBar.tsx, src/modules/{module}/ui/components/use-{entities}-filters.ts
---

# Skill: List View with Search and Filters

Implements the full pattern for a list screen with a search bar and optional advanced filter panel. Complements `layer-ui`, `layer-application`, and `layer-domain` skills.

## When to Use

Load this skill when:

- Creating a `{Entities}ListView` that needs a search input
- The list supports one or more advanced filters (select, text) via a modal
- Filters must be debounced before reaching React Query
- Filter state must persist per source/entity across sessions (Zustand + MMKV)
- The list is paginated / infinite scroll

## Architecture Overview

```
{Entities}ListView           ← screen, layout only
  ├── {Entity}FiltersBar     ← search input + filter button + modal
  └── {Entity}List           ← FlashList + states + infinite scroll
        └── {Entity}Item     ← single row card

use-{entities}-filters.ts    ← uiFilters / queryFilters / setFilters
{entity}-sources.config.ts   ← capabilities contract (if multi-source)
{entities}.storage.ts        ← Zustand + MMKV persistence
{entity}.queries.ts          ← useInfiniteQuery with offline fallback
{entity}-query.model.ts      ← {Entity}ListFilters interface
```

---

## Step 1 — Domain: Filter Model

**`src/modules/{module}/domain/{entity}-query.model.ts`**

```typescript
export interface {Entity}ListFilters {
  searchText?: string;
  advanced?: Record<string, string | number | boolean | undefined>;
}

export interface {Entity}ListQuery {
  page: number;
  filters?: {Entity}ListFilters;
}
```

---

## Step 2 — Application: Capabilities Config

Define a capabilities contract so `FiltersBar` never hard-codes which filters to show.

**`src/modules/{module}/application/{entity}-sources.config.ts`**

```typescript
export interface {Entity}FilterField {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: Array<{ label: string; value: string }>;
}

export interface {Entity}SourceCapabilities {
  supportsSearch: boolean;
  supportsFilters: boolean;
  filterFields: {Entity}FilterField[];
}

// Example: capabilities for a single entity (no multi-source)
export const {ENTITY}_CAPABILITIES: {Entity}SourceCapabilities = {
  supportsSearch: true,
  supportsFilters: true,
  filterFields: [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
      ],
    },
    {
      key: 'category',
      label: 'Categoría',
      type: 'text',
    },
  ],
};

export function sanitize{Entity}Filters(
  filters: {Entity}ListFilters,
  capabilities: {Entity}SourceCapabilities,
): {Entity}ListFilters {
  const allowedKeys = new Set(capabilities.filterFields.map(f => f.key));
  const advanced = Object.entries(filters.advanced ?? {}).reduce<
    Record<string, string | number | boolean | undefined>
  >((acc, [key, value]) => {
    if (!allowedKeys.has(key)) return acc;
    const v = typeof value === 'string' ? value.trim() || undefined : value;
    if (v !== undefined) acc[key] = v;
    return acc;
  }, {});

  const result: {Entity}ListFilters = {};
  if (capabilities.supportsSearch && filters.searchText?.trim()) {
    result.searchText = filters.searchText.trim();
  }
  if (Object.keys(advanced).length > 0) result.advanced = advanced;
  return result;
}
```

> **Multi-source variant**: if the module handles multiple data sources (like the `examples` module), wrap capabilities in an `{Entity}SourceDefinition[]` array and add a `getSourceDefinition(source)` lookup. See `src/modules/examples/application/example-sources.config.ts` as reference.

---

## Step 3 — Application: Zustand Storage

Persist filter state per entity (or per source) with MMKV.

**`src/modules/{module}/application/{entities}.storage.ts`**

```typescript
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
// Config
import { mmkvStorage } from '@config/storage';
// Types
import type { {Entity}ListFilters } from '../domain/{entity}-query.model';
import { sanitize{Entity}Filters, {ENTITY}_CAPABILITIES } from './{entity}-sources.config';

interface {Entities}State {
  filters: {Entity}ListFilters;
  setFilters: (filters: {Entity}ListFilters) => void;
  // Optional: per-page cache for offline fallback
  cache: Record<string, unknown>;
  setCache: (fingerprint: string, page: unknown) => void;
  getCachedPage: (fingerprint: string) => unknown | undefined;
}

export const use{Entities}Storage = create<{Entities}State>()(
  persist(
    (set, get) => ({
      filters: {},
      cache: {},
      setFilters: filters =>
        set({ filters: sanitize{Entity}Filters(filters, {ENTITY}_CAPABILITIES) }),
      setCache: (fingerprint, page) =>
        set(state => ({ cache: { ...state.cache, [fingerprint]: page } })),
      getCachedPage: fingerprint => get().cache[fingerprint],
    }),
    {
      name: '{entities}-storage',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: state => ({ filters: state.filters, cache: state.cache }),
    },
  ),
);
```

---

## Step 4 — Application: Filter Hook

**`src/modules/{module}/ui/components/use-{entities}-filters.ts`**

```typescript
import { useEffect, useMemo, useRef, useState } from 'react';
// Hooks
import { useDebounce } from '@modules/core/application/core.hooks';
// Types
import type { {Entity}ListFilters } from '../../domain/{entity}-query.model';
import { use{Entities}Storage } from '../../application/{entities}.storage';
import { sanitize{Entity}Filters, {ENTITY}_CAPABILITIES } from '../../application/{entity}-sources.config';

interface Use{Entities}FiltersResult {
  uiFilters: {Entity}ListFilters;
  queryFilters: {Entity}ListFilters;
  setFilters: (filters: {Entity}ListFilters) => void;
}

export function use{Entities}Filters(): Use{Entities}FiltersResult {
  const storedFilters = use{Entities}Storage(state => state.filters);
  const setStoredFilters = use{Entities}Storage(state => state.setFilters);
  const skipPersistRef = useRef(false);

  const [uiFilters, setUiFilters] = useState<{Entity}ListFilters>(() =>
    sanitize{Entity}Filters(storedFilters, {ENTITY}_CAPABILITIES),
  );

  const debouncedSearch = useDebounce(uiFilters.searchText ?? '', 400);
  const debouncedAdvanced = useDebounce(uiFilters.advanced ?? {}, 400);

  // Re-sync local state when persisted store changes externally
  useEffect(() => {
    skipPersistRef.current = true;
    setUiFilters(sanitize{Entity}Filters(storedFilters, {ENTITY}_CAPABILITIES));
  }, [storedFilters]);

  // Persist after user-driven changes (skip the store-driven re-sync above)
  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    setStoredFilters(uiFilters);
  }, [uiFilters, setStoredFilters]);

  const queryFilters = useMemo<{Entity}ListFilters>(
    () =>
      sanitize{Entity}Filters(
        { searchText: debouncedSearch, advanced: debouncedAdvanced },
        {ENTITY}_CAPABILITIES,
      ),
    [debouncedSearch, debouncedAdvanced],
  );

  return {
    uiFilters,
    queryFilters,
    setFilters: next =>
      setUiFilters(sanitize{Entity}Filters(next, {ENTITY}_CAPABILITIES)),
  };
}
```

> **Key rule**: `uiFilters` is bound to inputs (instant feedback). `queryFilters` is the debounced value passed to React Query. Never swap them.

---

## Step 5 — Application: Infinite Query

**`src/modules/{module}/application/{entity}.queries.ts`** (relevant excerpt)

```typescript
import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult } from '@tanstack/react-query';
// Config
import { QUERY_KEYS } from '@config/query.keys';
import { getIsConnected } from '@modules/network/application/connectivity.storage';
// Types
import type { {Entity}ListFilters } from '../domain/{entity}-query.model';
import type { {Entity}ListPage } from '../domain/{entity}.model';
import { use{Entities}Storage } from './{entities}.storage';
import {entity}Service from '../infrastructure/{entity}.service';

export function use{Entities}(
  filters?: {Entity}ListFilters,
): UseInfiniteQueryResult<InfiniteData<{Entity}ListPage, number>, Error> {
  const fingerprint = JSON.stringify(filters ?? {});
  const cachedPage = use{Entities}Storage.getState().getCachedPage(fingerprint);
  const setCache = use{Entities}Storage.getState().setCache;

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.{ENTITIES}(fingerprint),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!getIsConnected() && cachedPage) return cachedPage as {Entity}ListPage;
      const result = await {entity}Service.getAll({ page: Number(pageParam), filters });
      if (result instanceof Error) throw result;
      setCache(fingerprint, result);
      return result;
    },
    getNextPageParam: page => page.nextPage ?? undefined,
    getPreviousPageParam: () => undefined,
    placeholderData: cachedPage
      ? { pageParams: [1], pages: [cachedPage as {Entity}ListPage] }
      : undefined,
  });
}
```

Add the query key to `src/config/query.keys.ts`:

```typescript
{ENTITIES}: (fingerprint: string) => ['{entities}', fingerprint] as const,
```

---

## Step 6 — UI: FiltersBar Component

**`src/modules/{module}/ui/components/{Entity}FiltersBar.tsx`**

```typescript
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { Button, Icon, Modal, Select, Text, TextInput } from '@components/core';
import type { SelectOption } from '@components/core/Select';
// Theme
import { spacing } from '@theme/index';
// Types
import type { {Entity}ListFilters } from '../../domain/{entity}-query.model';
import type { {Entity}FilterField, {Entity}SourceCapabilities } from '../../application/{entity}-sources.config';

interface Props {
  capabilities: {Entity}SourceCapabilities;
  filters: {Entity}ListFilters;
  onChange: (filters: {Entity}ListFilters) => void;
}

function getSelectValue(field: {Entity}FilterField, value: unknown): SelectOption | null {
  if (typeof value !== 'string') return null;
  return field.options?.find(o => o.value === value) ?? null;
}

export function {Entity}FiltersBar({ capabilities, filters, onChange }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!capabilities.supportsSearch && !capabilities.supportsFilters) return null;

  const hasAdvancedFilters =
    capabilities.supportsFilters && capabilities.filterFields.length > 0;

  const activeFiltersCount = capabilities.filterFields.reduce((count, field) => {
    const value = filters.advanced?.[field.key];
    return typeof value === 'string' && value.trim().length > 0 ? count + 1 : count;
  }, 0);

  return (
    <>
      <View style={styles.container}>
        {capabilities.supportsSearch ? (
          <TextInput
            placeholder="Escribe para buscar"
            value={filters.searchText ?? ''}
            onChangeText={searchText => onChange({ ...filters, searchText })}
            leftIcon={<Icon name="search" size={18} color="textSecondary" />}
            fullWidth
            containerStyle={styles.searchInput}
          />
        ) : (
          <View style={styles.searchInput} />
        )}

        {hasAdvancedFilters ? (
          <Button
            variant={activeFiltersCount > 0 ? 'primary' : 'outlined'}
            onPress={() => setIsModalVisible(true)}
            accessibilityLabel="Abrir filtros"
            style={styles.filterButton}
          >
            <Icon
              name="filter"
              size={18}
              color={activeFiltersCount > 0 ? 'onPrimary' : 'primary'}
            />
          </Button>
        ) : null}
      </View>

      {hasAdvancedFilters ? (
        <Modal
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
          title="Filtros"
          closeOnBackdropPress
          size="md"
        >
          <View style={styles.modalContent}>
            <Text variant="bodySmall" color="textSecondary">
              Ajusta los filtros disponibles.
            </Text>

            {capabilities.filterFields.map(field => {
              const currentValue = filters.advanced?.[field.key];

              if (field.type === 'text') {
                return (
                  <TextInput
                    key={field.key}
                    label={field.label}
                    placeholder={`Filtrar por ${field.label.toLowerCase()}`}
                    value={typeof currentValue === 'string' ? currentValue : ''}
                    onChangeText={value =>
                      onChange({
                        ...filters,
                        advanced: { ...(filters.advanced ?? {}), [field.key]: value },
                      })
                    }
                    fullWidth
                  />
                );
              }

              return (
                <Select
                  key={field.key}
                  label={field.label}
                  options={field.options ?? []}
                  value={getSelectValue(field, currentValue)}
                  onChange={option =>
                    onChange({
                      ...filters,
                      advanced: {
                        ...(filters.advanced ?? {}),
                        [field.key]: option?.value ?? undefined,
                      },
                    })
                  }
                  containerStyle={styles.fullWidth}
                />
              );
            })}

            <View style={styles.actions}>
              <Button
                variant="ghost"
                onPress={() => onChange({ ...filters, advanced: {} })}
              >
                Limpiar
              </Button>
              <Button variant="primary" onPress={() => setIsModalVisible(false)}>
                Aplicar
              </Button>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
  },
  searchInput: { flex: 1 },
  filterButton: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  modalContent: { gap: spacing.md },
  fullWidth: { width: '100%' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
```

---

## Step 7 — UI: List Component

**`src/modules/{module}/ui/components/{Entity}List.tsx`**

```typescript
import React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
// Components
import {
  EmptyState,
  ErrorState,
  ItemSeparatorComponent,
  LoadingState,
  OfflineBanner,
} from '@components/layout';
import { Icon } from '@components/core';
// Network
import { useIsConnected } from '@modules/network/application/connectivity.storage';
// Theme
import { spacing } from '@theme/index';
// Types
import type { {Entity} } from '../../domain/{entity}.model';
import { {Entity}Item } from './{entity}-item';

interface Props {
  items?: {Entity}[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  hasNextPage?: boolean;
}

const renderItem: ListRenderItem<{Entity}> = ({ item }) => <{Entity}Item item={item} />;

export function {Entity}List({
  items,
  isLoading,
  isError,
  error,
  isRefetching,
  onRefresh,
  onEndReached,
  hasNextPage,
}: Props) {
  const isConnected = useIsConnected();

  if (isLoading) return <LoadingState message="Cargando..." />;
  if (isError)
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message ?? 'No se pudieron cargar los datos'}
        onRetry={onRefresh}
      />
    );
  if (!items?.length)
    return (
      <EmptyState
        title="Sin resultados"
        message="No se encontraron elementos"
        icon={<Icon name="package" size={42} />}
      />
    );

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(isRefetching)}
            onRefresh={onRefresh}
          />
        }
        onEndReached={isConnected && hasNextPage ? onEndReached : undefined}
        onEndReachedThreshold={0.6}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md },
});
```

---

## Step 8 — UI: ListView Screen

**`src/modules/{module}/ui/{Entities}ListView.tsx`**

```typescript
import React from 'react';
// Components
import { RootLayout } from '@components/layout';
// Application
import { use{Entities} } from '../application/{entity}.queries';
import { {ENTITY}_CAPABILITIES } from '../application/{entity}-sources.config';
// UI
import { {Entity}List } from './components/{entity}-list';
import { {Entity}FiltersBar } from './components/{entity}-filters-bar';
import { use{Entities}Filters } from './components/use-{entities}-filters';

export function {Entities}ListView() {
  const { uiFilters, queryFilters, setFilters } = use{Entities}Filters();

  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = use{Entities}(queryFilters);

  const items = data?.pages.flatMap(page => page.items);

  return (
    <RootLayout scroll={false} toolbar={false}>
      <{Entity}FiltersBar
        capabilities={{ENTITY}_CAPABILITIES}
        filters={uiFilters}
        onChange={setFilters}
      />
      <{Entity}List
        items={items}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        isRefetching={isRefetching}
        onRefresh={refetch}
        onEndReached={fetchNextPage}
        hasNextPage={hasNextPage}
      />
    </RootLayout>
  );
}
```

> For a list that also needs a `Header` with a title and an "add" button, wrap the content in a `View style={{ flex: 1 }}` and add `<Header title="..." onPress={...} />` above `<{Entity}FiltersBar />`.

---

## Variants

### Simple search only (no advanced filters)

Set `supportsFilters: false` and `filterFields: []` in capabilities. The filter button will not render; only the `TextInput` row appears.

### No search, no filters

Set both `supportsSearch: false` and `supportsFilters: false`. `FiltersBar` returns `null` automatically — no conditional rendering needed in the screen.

### Multi-source (dynamic source selector)

When the same screen switches between data sources (e.g. a dynamic list with a source picker), store `selectedSource` in Zustand and key `sourceFilters` by source:

```typescript
sourceFilters: Record<DataSource, {Entity}ListFilters>;
setSourceFilters: (source: DataSource, filters: {Entity}ListFilters) => void;
```

Pass `selectedSource` to `use{Entities}Filters(selectedSource)` and `use{Entities}({ source: selectedSource, filters: queryFilters })`. See `src/modules/examples/ui/DynamicListView.tsx` as a full reference.

---

## Complementary Skills

| Skill                  | When to load together                                                    |
| ---------------------- | ------------------------------------------------------------------------ |
| `layer-ui`             | Base ListView/DetailView/FormView patterns                               |
| `layer-application`    | React Query queries, mutations, Zustand storage                          |
| `layer-domain`         | Entity model, repository contract                                        |
| `layer-infrastructure` | HTTP / Firebase / Mock service implementations                           |
| `components-gallery`   | All available props for `TextInput`, `Select`, `Modal`, `Button`, `Icon` |
