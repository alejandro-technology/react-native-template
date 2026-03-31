---
name: create-screen
category: generation
layer: ui
priority: high
last_updated: 2026-03-31
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

## Current UI Structure

Feature module screens must follow the UI split defined in `.ai/rules/ui-module-structure.md`.

```text
src/modules/{feature}/ui/
├── {Feature}ListView.tsx
├── {Feature}DetailView.tsx
├── {Feature}FormView.tsx
└── components/
    ├── {Feature}List.tsx
    ├── {Feature}Item.tsx
    └── {Feature}Form.tsx
```

### Responsibilities

- `*View.tsx`: screen composition, navigation, route params, application hooks, layout wiring
- `ui/components/*.tsx`: reusable UI pieces for that module
- Prefer one component per file
- Only keep a tiny local helper component in the same file if it is very small and used only there

### Import boundaries

- UI can import from `application` and `domain` (types)
- UI must not import from `infrastructure`
- Form views pass `FormData` to mutations; payload adaptation happens in `application`

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

Displays a collection of items with search in the `View`, while the list rendering stays in `ui/components/{Feature}List.tsx`.

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

**Companion component:**

```typescript
// src/modules/{feature}/ui/components/{Feature}List.tsx
import React from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Icon } from '@components/core';
import { {Feature}Item } from './{Feature}Item';
import {
  EmptyState,
  ErrorState,
  ItemSeparatorComponent,
  LoadingState,
} from '@components/layout';
import { use{Feature}s } from '../../application/{feature}.queries';
import { spacing } from '@theme/index';

interface {Feature}ListProps {
  searchText: string;
}

export function {Feature}List({ searchText }: {Feature}ListProps) {
  const { data, isLoading, isRefetching, isError, error, refetch } =
    use{Feature}s({ searchText });

  if (isLoading) {
    return <LoadingState message="Cargando..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudieron cargar los elementos'}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Sin resultados"
        message="No hay elementos"
        icon={<Icon name="package" size={42} />}
      />
    );
  }

  return (
    <FlashList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => (
        <{Feature}Item item={item} index={index} />
      )}
      ItemSeparatorComponent={ItemSeparatorComponent}
      contentContainerStyle={styles.list}
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

**Key rules:**
- Search state and header stay in the `View`
- Data guards (`loading/error/empty`) usually live in the list/detail component that owns the query
- List item goes in its own file: `ui/components/{Feature}Item.tsx`

### Type 2: Detail Screen

Displays a single entity with actions. Uses typed screen props.

```typescript
// src/modules/{feature}/ui/{Feature}DetailView.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Button, Icon } from '@components/core';
import {
  ErrorState,
  EmptyState,
  LoadingState,
  RootLayout,
} from '@components/layout';
import { use{Feature} } from '../application/{feature}.queries';
import { use{Feature}Delete } from '../application/{feature}.mutations';
import { useNavigation{Feature}s } from '@navigation/hooks';
import { {Feature}sRoutes, {Feature}sScreenProps } from '@navigation/routes';
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

  if (isLoading) {
    return <LoadingState message="Cargando {feature}..." />;
  }

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
        message="El elemento que buscas no existe o fue eliminado"
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
          <Text variant="body">{item.description}</Text>
        </Card>

        <View>
          <Button
            variant="secondary"
            onPress={handleEdit}
            style={styles.button}
          >
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

**Key rules:**
- Use typed route props: `{Feature}sScreenProps<{Feature}sRoutes.{Feature}Detail>`
- Keep guard order: `Loading -> Error -> Empty -> Success`
- If the detail content becomes large, extract sections/cards to `ui/components/`

### Type 3: Form Screen

Form screens should stay thin: load route params, choose create vs update mutation, and delegate the UI to `ui/components/{Feature}Form.tsx`.

```typescript
// src/modules/{feature}/ui/{Feature}FormView.tsx
import React from 'react';
import { Animated } from 'react-native';
import { RootLayout } from '@components/layout';
import { {Feature}Form } from './components/{Feature}Form';
import {
  use{Feature}Create,
  use{Feature}Update,
} from '../application/{feature}.mutations';
import type { {Feature}FormData } from '../domain/{feature}.scheme';
import { {Feature}sRoutes, {Feature}sScreenProps } from '@navigation/routes';
import { useFocusSlideIn } from '@theme/hooks';
import { ANIMATION_DURATION } from '@theme/animations';

export function {Feature}FormView({
  route: { params },
  navigation: { goBack },
}: {Feature}sScreenProps<{Feature}sRoutes.{Feature}Form>) {
  const { mutateAsync: createItem, isPending: isCreating } =
    use{Feature}Create();
  const { mutateAsync: updateItem, isPending: isUpdating } =
    use{Feature}Update();

  const item = params?.{feature};
  const isEditing = !!item;
  const isLoading = isCreating || isUpdating;

  const { animatedStyle } = useFocusSlideIn({
    direction: 'right',
    duration: ANIMATION_DURATION.slow,
  });

  function handleSubmit(form: {Feature}FormData) {
    if (isEditing) {
      updateItem({ id: item.id, form });
    } else {
      createItem(form);
    }
    goBack();
  }

  return (
    <RootLayout
      scroll
      padding="lg"
      title={isEditing ? 'Editar {Feature}' : 'Crear {Feature}'}
    >
      <Animated.View style={animatedStyle}>
        <{Feature}Form
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={item}
        />
      </Animated.View>
    </RootLayout>
  );
}
```

**Key rules:**
- The `View` does not transform `FormData` into payloads
- That adapter call happens inside the application mutation
- Keep the actual form markup in `ui/components/{Feature}Form.tsx`

### Type 4: Settings / Static Screen

```typescript
// src/modules/{feature}/ui/{Feature}SettingsView.tsx
import React from 'react';
import { RootLayout } from '@components/layout';
import { Card, Text } from '@components/core';
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

## Guard Order

List and detail screens must follow this guard order:

```
Loading -> Error -> Empty -> Success
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

## Screen Generation Rules

| Rule | Description |
|------|-------------|
| **One screen per file** | Each `*View.tsx` exports a single main screen |
| **Separate heavy UI** | Lists, forms, items, and large sections go to `ui/components/` |
| **Thin screens** | Views orchestrate layout/navigation/hooks; avoid embedding large presentational trees |
| **No infrastructure imports** | Screens never import services directly |
| **Typed routes** | Use `{Feature}sScreenProps<Route>` when route params exist |
| **Match module convention** | Preserve the export style already used in that module |

## Creation Checklist

When creating a new screen:

- [ ] Screen file lives in `src/modules/{feature}/ui/`
- [ ] Supporting UI pieces live in `src/modules/{feature}/ui/components/`
- [ ] No more than one main component per file
- [ ] Screen uses `RootLayout` as root wrapper with appropriate props
- [ ] List screens: `scroll={false}`, `toolbar={false}`, use `Header` + `FlashList`
- [ ] Detail/Form screens: use `RootLayout` with `padding` and `title`
- [ ] Guard order: `Loading -> Error -> Empty -> Success`
- [ ] Route defined in `src/navigation/routes/{feature}.routes.ts`
- [ ] Screen registered in stack navigator
- [ ] Navigation hook available (`useNavigation{Feature}s`)
- [ ] Stack registered in parent navigator (Public or Private)
- [ ] All text uses `<Text>` component with variants
- [ ] Colors/tokens come from theme system; no hardcoded UI values
- [ ] Screen props typed with `{Feature}sScreenProps<Route>`
- [ ] Delete uses `useAppStorage` modal pattern
- [ ] UI imports only from `application` and `domain` (types), never `infrastructure`

## References

- UI structure rule: `.ai/rules/ui-module-structure.md`
- List screen: `src/modules/products/ui/ProductsListView.tsx`
- Detail screen: `src/modules/products/ui/ProductDetailView.tsx`
- Form screen: `src/modules/products/ui/ProductFormView.tsx`
- List component: `src/modules/products/ui/components/ProductList.tsx`
- Layout components: `src/components/layout/`
- Create Form skill: `.ai/skills/generation/create-form/skill.md`
- Create Navigation skill: `.ai/skills/generation/create-navigation/skill.md`
