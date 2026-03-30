---
name: create-screen
category: generation
layer: ui
priority: high
last_updated: 2026-03-25
tags:
  - screen
  - view
  - navigation
  - scaffold
triggers:
  - 'Creating new screen'
  - 'Adding new view'
  - 'New page'
description: Scaffold new screens with RootLayout, Toolbar, navigation integration, and typed routes. Generates view file, route registration, and stack navigator entry.
---

# Create Screen

Scaffold new screens following project conventions with proper layout, navigation, and typing.

## When to Use

- Adding a new screen/view to an existing module
- Creating a settings, detail, form, or list screen
- Adding screens to public or private navigation stacks

## RootLayout API

All screens use `RootLayout` as root wrapper. Key props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scroll` | `boolean` | `true` | Wraps content in ScrollView |
| `padding` | `SpacingToken` | - | Padding using spacing tokens (`'md'`, `'lg'`, etc.) |
| `toolbar` | `boolean` | `true` | Shows Toolbar with back button |
| `title` | `string` | - | Title shown in Toolbar |
| `leftOptions` | `ToolbarOptions[]` | `[{icon: 'arrow-left', onPress: goBack}]` | Left toolbar buttons |
| `rightOptions` | `ToolbarOptions[]` | `[{icon: 'mailbox'}]` | Right toolbar buttons |

## Screen Types

### Type 1: List Screen

Displays a collection of items with search, loading/error/empty states, and FlashList.

```typescript
// src/modules/{feature}/ui/{Feature}sListView.tsx
import { useState } from 'react';
import { {Feature}List } from './components/{Feature}List';
import { useDebounce } from '@modules/core/application/core.hooks';
import { {Feature}sRoutes } from '@navigation/routes';
import { useNavigation{Feature}s } from '@navigation/hooks';
import { Header, RootLayout } from '@components/layout';

export function {Feature}sListView() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);

  const { navigate } = useNavigation{Feature}s();
  const onAdd = () => navigate({Feature}sRoutes.{Feature}Form);

  return (
    <RootLayout scroll={false} toolbar={false}>
      <Header
        title="{Feature}s"
        onPress={onAdd}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <{Feature}List searchText={debouncedSearch} />
    </RootLayout>
  );
}
```

**List component with FlashList:**

```typescript
// src/modules/{feature}/ui/components/{Feature}List.tsx
import React from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Icon } from '@components/core';
import { {Feature}Item } from './{Feature}Item';
import {
  EmptyState,
  ErrorState,
  ItemSeparatorComponent,
  LoadingState,
} from '@components/layout';
import { use{Feature}s } from '@modules/{feature}/application/{feature}.queries';
import type { {Feature}Entity } from '../../domain/{feature}.model';
import { spacing } from '@theme/index';

const renderItem: ListRenderItem<{Feature}Entity> = ({ item, index }) => (
  <{Feature}Item {feature}={item} index={index} />
);

interface {Feature}ListProps {
  searchText: string;
}

export function {Feature}List({ searchText }: {Feature}ListProps) {
  const {
    data: items,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = use{Feature}s({ searchText });

  if (isLoading) return <LoadingState message="Cargando {features}..." />;

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudieron cargar los {features}'}
      />
    );
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="{Feature} no encontrado"
        message="No hay {features} disponibles"
        icon={<Icon name="package" size={42} />}
      />
    );
  }

  return (
    <FlashList
      data={items}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshing={isRefetching}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
});
```

### Type 2: Detail Screen

Displays a single entity with actions. Uses typed screen props.

```typescript
// src/modules/{feature}/ui/{Feature}DetailView.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Button, Icon } from '@components/core';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  RootLayout,
} from '@components/layout';
import { use{Feature} } from '../application/{feature}.queries';
import { use{Feature}Delete } from '../application/{feature}.mutations';
import { {Feature}sRoutes, {Feature}sScreenProps } from '@navigation/routes';
import { useNavigation{Feature}s } from '@navigation/hooks';
import { spacing } from '@theme/index';
import { useAppStorage } from '@modules/core/application/app.storage';

export function {Feature}DetailView({
  route: {
    params: { {feature}Id },
  },
}: {Feature}sScreenProps<{Feature}sRoutes.{Feature}Detail>) {
  const { goBack, navigate } = useNavigation{Feature}s();
  const { data: item, isLoading, isError, error } = use{Feature}({feature}Id);
  const { mutateAsync: deleteAsync } = use{Feature}Delete();
  const { open, close } = useAppStorage(state => state.modal);

  function handleEdit() {
    item && navigate({Feature}sRoutes.{Feature}Form, { {feature}: item });
  }

  if (isLoading) return <LoadingState message="Cargando {feature}..." />;
  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudo cargar el {feature}'}
        onRetry={goBack}
        retryLabel="Volver"
      />
    );
  }
  if (!item) {
    return (
      <EmptyState
        title="{Feature} no encontrado"
        message="El {feature} que buscas no existe o fue eliminado"
        icon={<Icon name="package" size={42} />}
        onAction={goBack}
        actionLabel="Volver"
      />
    );
  }

  return (
    <RootLayout padding="md" title="Detalle de {Feature}">
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text variant="h2">{item.name}</Text>
          {item.description && <Text variant="body">{item.description}</Text>}
        </Card>

        <View>
          <Button variant="secondary" onPress={handleEdit} style={styles.button}>
            Editar {Feature}
          </Button>
          <Button
            variant="primary"
            style={styles.button}
            onPress={() =>
              open({
                entityName: item.name,
                entityType: '{feature}',
                onConfirm: async () => {
                  await deleteAsync({feature}Id);
                  close();
                  goBack();
                },
              })
            }
          >
            Eliminar {Feature}
          </Button>
        </View>
      </View>
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    gap: spacing.xs,
  },
  button: {
    marginBottom: spacing.sm,
  },
});
```

### Type 3: Form Screen

See `create-form` skill for complete form patterns.

```typescript
// src/modules/{feature}/ui/{Feature}FormView.tsx
export function {Feature}FormView({
  route: { params },
  navigation: { goBack },
}: {Feature}sScreenProps<{Feature}sRoutes.{Feature}Form>) {
  // See create-form skill for full implementation
}
```

### Type 4: Settings / Static Screen

```typescript
// src/modules/{feature}/ui/{Feature}SettingsView.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { RootLayout } from '@components/layout';
import { Text } from '@components/core';
import { Card } from '@components/core';
import { spacing } from '@theme/index';

export function {Feature}SettingsView() {
  return (
    <RootLayout scroll padding="md" title="Configuracion">
      <Card style={{ marginBottom: spacing.md }}>
        <Text variant="h4">Seccion</Text>
        <Text variant="body" color="textSecondary">
          Descripcion de la seccion
        </Text>
      </Card>
    </RootLayout>
  );
}
```

## State Guard Order

List and detail screens must follow this guard order:

```
Loading → Error → Empty → Success (render content)
```

## Delete Confirmation Pattern

Use `useAppStorage` modal for delete confirmations:

```typescript
const { open, close } = useAppStorage(state => state.modal);

open({
  entityName: item.name,
  entityType: '{feature}',
  onConfirm: async () => {
    await deleteAsync(id);
    close();
    goBack();
  },
});
```

## Creation Checklist

When creating a new screen:

- [ ] Screen uses `RootLayout` as root wrapper with appropriate props
- [ ] List screens: `scroll={false}`, `toolbar={false}`, use `Header` + `FlashList`
- [ ] Detail/Form screens: use `RootLayout` with `padding` and `title`
- [ ] Guard order: Loading → Error → Empty → Success
- [ ] Route defined in `src/navigation/routes/{feature}.routes.ts`
- [ ] Screen registered in stack navigator
- [ ] Navigation hook available (`useNavigation{Feature}s`)
- [ ] Stack registered in parent navigator (Public or Private)
- [ ] All text uses `<Text>` component with variants
- [ ] Colors from `useTheme()`, spacing from `spacing.*`
- [ ] Screen props typed with `{Feature}sScreenProps<Route>`
- [ ] Delete uses `useAppStorage` modal pattern

## References

- List screen: `src/modules/products/ui/ProductsListView.tsx`
- Detail screen: `src/modules/products/ui/ProductDetailView.tsx`
- Form screen: `src/modules/products/ui/ProductFormView.tsx`
- List component: `src/modules/products/ui/components/ProductList.tsx`
- Layout components: `src/components/layout/`
- Create Form skill: `.ai/skills/generation/create-form/skill.md`
- Create Navigation skill: `.ai/skills/generation/create-navigation/skill.md`
