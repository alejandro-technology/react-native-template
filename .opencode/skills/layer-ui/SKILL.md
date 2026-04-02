---
name: layer-ui
description: Create the UI layer for a Clean Architecture module (screens, screen-specific components).
license: MIT
compatibility: opencode
metadata:
  layer: ui
  workflow: scaffold
  output: src/modules/{module}/ui/**
---

# UI Layer

Create the UI layer for entity `$ARGUMENTS`.

## Files to Create

```
src/modules/{module}/ui/
  {Entities}ListView.tsx      # List screen with search
  {Entity}DetailView.tsx      # Detail screen (layout only)
  {Entity}FormView.tsx        # Create/Edit form screen
  components/
    {Entity}List.tsx          # List container (FlashList)
    {Entity}Item.tsx          # Single item row
    {Entity}Form.tsx          # Form fields component
    {Entity}Detail.tsx        # Detail content + data fetching
```

## Step 1: `{Entities}ListView.tsx`

```typescript
import React, { useState } from 'react';
// Components
import { {Entity}List } from './components/{Entity}List';
// Hooks
import { useDebounce } from '@modules/core/application/core.hooks';
// Navigation
import { {Entities}Routes } from '@navigation/routes';
import { useNavigation{Entities} } from '@navigation/hooks';
// Layout
import { Header, RootLayout } from '@components/layout';

export function {Entities}ListView() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);
  const { navigate } = useNavigation{Entities}();

  const onAdd{Entity} = () => navigate({Entities}Routes.{Entity}Form);

  return (
    <RootLayout scroll={false} toolbar={false}>
      <Header
        title="{Entities}"
        onPress={onAdd{Entity}}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <{Entity}List searchText={debouncedSearch} />
    </RootLayout>
  );
}
```

## Step 2: `{Entity}DetailView.tsx`

Layout-only — extracts the route param and delegates all logic to `{Entity}Detail`.

```typescript
import React from 'react';
// Components
import { RootLayout } from '@components/layout';
// Navigation
import { {Entities}Routes, {Entities}ScreenProps } from '@navigation/routes';
// UI Components
import { {Entity}Detail } from './components/{Entity}Detail';

export function {Entity}DetailView({
  route: {
    params: { {entity}Id },
  },
}: {Entities}ScreenProps<{Entities}Routes.{Entity}Detail>) {
  return (
    <RootLayout padding="md" title="Detalle de {Entity}">
      <{Entity}Detail {entity}Id={{entity}Id} />
    </RootLayout>
  );
}
```

## Step 2b: `components/{Entity}Detail.tsx`

Owns data fetching, all states (loading/error/empty), and all actions (edit, delete).

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { Text, Card, Button, Icon } from '@components/core';
import { EmptyState, LoadingState, ErrorState } from '@components/layout';
// Navigation
import { {Entities}Routes } from '@navigation/routes';
import { useNavigation{Entities} } from '@navigation/hooks';
// Theme
import { spacing } from '@theme/index';
// Store
import { useAppStorage } from '@modules/core/application/app.storage';
// Application
import { use{Entity} } from '../../application/{entity}.queries';
import { use{Entity}Delete } from '../../application/{entity}.mutations';

interface {Entity}DetailProps {
  {entity}Id: string;
}

export function {Entity}Detail({ {entity}Id }: {Entity}DetailProps) {
  const { goBack, navigate } = useNavigation{Entities}();
  const { data: {entity}, isLoading, isError, error } = use{Entity}({entity}Id);
  const { mutateAsync: delete{Entity}Async } = use{Entity}Delete();
  const { open, close } = useAppStorage(state => state.modal);

  function handleEdit() {
    {entity} && navigate({Entities}Routes.{Entity}Form, { {entity} });
  }

  if (isLoading) {
    return <LoadingState message="Cargando {entity}..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudo cargar el {entity}'}
        onRetry={goBack}
        retryLabel="Volver"
      />
    );
  }

  if (!{entity}) {
    return <{Entity}DetailEmpty onBack={goBack} />;
  }

  return (
    <View style={styles.content}>
      <Card style={styles.card}>
        <Text variant="h2">{{entity}.name}</Text>
        {/* Add other fields here */}
      </Card>

      <Card style={styles.card}>
        <Text variant="caption">Fechas</Text>
        <Text variant="body">Creado: {{entity}.createdAt.toLocaleDateString()}</Text>
        <Text variant="body">Actualizado: {{entity}.updatedAt.toLocaleDateString()}</Text>
      </Card>

      <View>
        <Button variant="secondary" onPress={handleEdit} style={styles.button}>
          Editar {Entity}
        </Button>
        <Button
          variant="primary"
          style={styles.button}
          onPress={() =>
            open({
              type: 'delete',
              entityName: {entity}.name,
              entityType: '{entity}',
              onConfirm: async () => {
                await delete{Entity}Async({entity}Id);
                close();
                goBack();
              },
            })
          }
        >
          Eliminar {Entity}
        </Button>
      </View>
    </View>
  );
}

export function {Entity}DetailEmpty({ onBack }: { onBack: () => void }) {
  return (
    <EmptyState
      title="{Entity} no encontrado"
      message="El {entity} que buscas no existe o fue eliminado"
      icon={<Icon name="package" size={42} />}
      onAction={onBack}
      actionLabel="Volver"
    />
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

## Step 3: `{Entity}FormView.tsx`

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// Components
import { Button } from '@components/core';
import { RootLayout } from '@components/layout';
import { {Entity}Form } from './components/{Entity}Form';
// Domain
import { {entity}Schema, {Entity}FormData } from '../domain/{entity}.scheme';
import { {entity}FormToPayloadAdapter } from '../domain/{entity}.adapter';
// Hooks
import { use{Entity}Create, use{Entity}Update } from '../application/{entity}.mutations';
// Navigation
import { {Entities}ScreenProps } from '@navigation/routes';
import { useNavigation{Entities} } from '@navigation/hooks';

type Props = {Entities}ScreenProps<'{Entity}Form'>;

export function {Entity}FormView({ route }: Props) {
  const existing{Entity} = route.params?.{entity};
  const isEditMode = !!existing{Entity};
  const { goBack } = useNavigation{Entities}();

  const { control, handleSubmit, formState } = useForm<{Entity}FormData>({
    resolver: yupResolver({entity}Schema),
    defaultValues: existing{Entity}
      ? { name: existing{Entity}.name }
      : { name: '' },
  });

  const createMutation = use{Entity}Create();
  const updateMutation = use{Entity}Update();

  const onSubmit = handleSubmit(async (form: {Entity}FormData) => {
    const payload = {entity}FormToPayloadAdapter(form);

    if (isEditMode && existing{Entity}) {
      await updateMutation.mutateAsync({ id: existing{Entity}.id, form });
    } else {
      await createMutation.mutateAsync(form);
    }

    goBack();
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <RootLayout>
      <{Entity}Form control={control} formState={formState} />
      <Button
        onPress={onSubmit}
        disabled={isLoading || !formState.isValid}
        loading={isLoading}
      >
        {isEditMode ? 'Actualizar' : 'Crear'}
      </Button>
    </RootLayout>
  );
}
```

## Step 4: `components/{Entity}List.tsx`

```typescript
import React from 'react';
import { FlashList } from '@shopify/flash-list';
// Components
import { {Entity}Item } from './{Entity}Item';
import { LoadingState, ErrorState, EmptyState } from '@components/layout';
// Hooks
import { use{Entities} } from '../../application/{entity}.queries';
// Types
import type { {Entity} } from '../../domain/{entity}.model';

interface Props {
  searchText: string;
}

export function {Entity}List({ searchText }: Props) {
  const { data, isLoading, error, refetch } = use{Entities}({ searchText });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data || data.length === 0) {
    return <EmptyState message="No hay elementos" />;
  }

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <{Entity}Item {entity}={item} />}
      keyExtractor={(item: {Entity}) => item.id}
      estimatedItemSize={80}
    />
  );
}
```

## Step 5: `components/{Entity}Item.tsx`

```typescript
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
// Components
import { Text } from '@components/core';
// Navigation
import { {Entities}Routes } from '@navigation/routes';
import { useNavigation{Entities} } from '@navigation/hooks';
// Theme
import { useTheme } from '@theme/index';
// Types
import type { {Entity} } from '../../domain/{entity}.model';

interface Props {
  {entity}: {Entity};
}

export function {Entity}Item({ {entity} }: Props) {
  const { navigate } = useNavigation{Entities}();
  const theme = useTheme();

  const onPress = () => {
    navigate({Entities}Routes.{Entity}Detail, { {entity}Id: {entity}.id });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { borderColor: theme.colors.border }]}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <Text variant="body">{entity}.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
```

## Step 6: `components/{Entity}Form.tsx`

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Control, FormState } from 'react-hook-form';
// Components
import { TextInput } from '@components/form';
// Types
import type { {Entity}FormData } from '../../domain/{entity}.scheme';

interface Props {
  control: Control<{Entity}FormData>;
  formState: FormState<{Entity}FormData>;
}

export function {Entity}Form({ control }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        control={control}
        name="name"
        label="Nombre"
        placeholder="Ingrese el nombre"
      />
      {/* Add other form fields here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
```

## Reference

- Example module: `src/modules/products/ui/`
