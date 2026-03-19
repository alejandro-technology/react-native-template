---
name: create-screen
category: generation
layer: ui
priority: high
tags:
  - screen
  - view
  - navigation
  - scaffold
triggers:
  - 'Creating new screen'
  - 'Adding new view'
  - 'New page'
description: Scaffold new screens with RootLayout, Header, navigation integration, and typed routes. Generates view file, route registration, and stack navigator entry.
---

# Create Screen

Scaffold new screens following project conventions with proper layout, navigation, and typing.

## When to Use

- Adding a new screen/view to an existing module
- Creating a settings, detail, form, or list screen
- Adding screens to public or private navigation stacks

## Screen Types

### Type 1: List Screen

Displays a collection of items with loading/error/empty states.

```typescript
// src/modules/{feature}/ui/{Feature}ListView.tsx
import React from 'react';
import { FlatList } from 'react-native';
import { RootLayout } from '@components/layout/RootLayout';
import { Header } from '@components/layout/Header';
import { LoadingState } from '@components/layout/LoadingState';
import { ErrorState } from '@components/layout/ErrorState';
import { EmptyState } from '@components/layout/EmptyState';
import { ItemSeparatorComponent } from '@components/layout/ItemSeparatorComponent';
import { use{Feature}s } from '../application/{feature}.queries';
import { {Feature}Item } from './components/{Feature}Item';
import { useNavigation{Module} } from '@navigation/hooks';

export function {Feature}ListView() {
  const navigation = useNavigation{Module}();
  const { data, isLoading, isError, refetch } = use{Feature}s();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyState message="No hay {features}" />;

  return (
    <RootLayout>
      <Header
        title="{Features}"
        rightIcon="plus"
        onRightPress={() => navigation.navigate('{Feature}Create')}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <{Feature}Item
            item={item}
            onPress={() => navigation.navigate('{Feature}Detail', { id: item.id })}
          />
        )}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </RootLayout>
  );
}
```

### Type 2: Detail Screen

Displays a single entity with actions.

```typescript
// src/modules/{feature}/ui/{Feature}DetailView.tsx
import React from 'react';
import { View } from 'react-native';
import { RootLayout } from '@components/layout/RootLayout';
import { Header } from '@components/layout/Header';
import { LoadingState } from '@components/layout/LoadingState';
import { ErrorState } from '@components/layout/ErrorState';
import { Text } from '@components/core/Text';
import { useTheme, spacing } from '@theme/index';
import { use{Feature}ById } from '../application/{feature}.queries';
import { useNavigation{Module} } from '@navigation/hooks';
import { useRoute } from '@react-navigation/native';
import type { {Feature}DetailRouteProps } from '@navigation/routes/{feature}.routes';

export function {Feature}DetailView() {
  const theme = useTheme();
  const navigation = useNavigation{Module}();
  const route = useRoute<{Feature}DetailRouteProps>();
  const { id } = route.params;
  const { data, isLoading, isError, refetch } = use{Feature}ById(id);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return <ErrorState onRetry={refetch} />;

  return (
    <RootLayout>
      <Header
        title={data.name}
        showBack
        rightIcon="pencil"
        onRightPress={() => navigation.navigate('{Feature}Edit', { id })}
      />
      <View style={{ padding: spacing.base }}>
        {/* Entity fields */}
        <Text variant="body">{data.description}</Text>
      </View>
    </RootLayout>
  );
}
```

### Type 3: Form Screen

Create or edit entity using react-hook-form.

```typescript
// src/modules/{feature}/ui/{Feature}FormView.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RootLayout } from '@components/layout/RootLayout';
import { Header } from '@components/layout/Header';
import { Button } from '@components/core/Button';
import { TextInput } from '@components/form/TextInput';
import { useTheme, spacing } from '@theme/index';
import { {feature}Schema, type {Feature}FormData } from '../domain/{feature}.scheme';
import { use{Feature}Create } from '../application/{feature}.mutations';
import { useNavigation{Module} } from '@navigation/hooks';
import { useAppStorage } from '@modules/core/infrastructure/app.storage';

export function {Feature}FormView() {
  const theme = useTheme();
  const navigation = useNavigation{Module}();
  const toast = useAppStorage(state => state.toast);
  const createMutation = use{Feature}Create();

  const methods = useForm<{Feature}FormData>({
    resolver: yupResolver({feature}Schema),
    defaultValues: {
      // Default values here
    },
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.show({ message: '{Feature} creado exitosamente', type: 'success' });
      navigation.goBack();
    } catch {
      toast.show({ message: 'Error al crear {feature}', type: 'error' });
    }
  });

  return (
    <RootLayout>
      <Header title="Crear {Feature}" showBack />
      <ScrollView
        style={{ padding: spacing.base }}
        keyboardShouldPersistTaps="handled"
      >
        <FormProvider {...methods}>
          <TextInput
            name="name"
            label="Nombre"
            placeholder="Ingresa el nombre"
          />
          {/* More form fields */}
          <Button
            onPress={handleSubmit}
            loading={createMutation.isPending}
            style={{ marginTop: spacing.lg }}
          >
            Guardar
          </Button>
        </FormProvider>
      </ScrollView>
    </RootLayout>
  );
}
```

### Type 4: Settings / Static Screen

Simple content screen without data fetching.

```typescript
// src/modules/{feature}/ui/{Feature}SettingsView.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { RootLayout } from '@components/layout/RootLayout';
import { Header } from '@components/layout/Header';
import { Text } from '@components/core/Text';
import { Card } from '@components/core/Card';
import { useTheme, spacing } from '@theme/index';

export function {Feature}SettingsView() {
  const theme = useTheme();

  return (
    <RootLayout>
      <Header title="Configuración" showBack />
      <ScrollView style={{ padding: spacing.base }}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text variant="h4">Sección</Text>
          <Text variant="body" color="textSecondary">
            Descripción de la sección
          </Text>
        </Card>
      </ScrollView>
    </RootLayout>
  );
}
```

## Navigation Integration

### Step 1: Define Route Constants

```typescript
// src/navigation/routes/{feature}.routes.ts
import type { RouteProp } from '@react-navigation/native';

export enum {Feature}Routes {
  {Feature}List = '{Feature}List',
  {Feature}Detail = '{Feature}Detail',
  {Feature}Create = '{Feature}Create',
  {Feature}Edit = '{Feature}Edit',
}

export type {Feature}StackParamList = {
  [{Feature}Routes.{Feature}List]: undefined;
  [{Feature}Routes.{Feature}Detail]: { id: string };
  [{Feature}Routes.{Feature}Create]: undefined;
  [{Feature}Routes.{Feature}Edit]: { id: string };
};

// Route prop types for useRoute()
export type {Feature}DetailRouteProps = RouteProp<
  {Feature}StackParamList,
  {Feature}Routes.{Feature}Detail
>;

export type {Feature}EditRouteProps = RouteProp<
  {Feature}StackParamList,
  {Feature}Routes.{Feature}Edit
>;
```

### Step 2: Create Stack Navigator

```typescript
// src/navigation/stacks/{Feature}StackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { {Feature}Routes, type {Feature}StackParamList } from '../routes/{feature}.routes';
import { {Feature}ListView } from '@modules/{feature}/ui/{Feature}ListView';
import { {Feature}DetailView } from '@modules/{feature}/ui/{Feature}DetailView';
import { {Feature}FormView } from '@modules/{feature}/ui/{Feature}FormView';

const Stack = createNativeStackNavigator<{Feature}StackParamList>();

export function {Feature}StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={{Feature}Routes.{Feature}List}
        component={{Feature}ListView}
      />
      <Stack.Screen
        name={{Feature}Routes.{Feature}Detail}
        component={{Feature}DetailView}
      />
      <Stack.Screen
        name={{Feature}Routes.{Feature}Create}
        component={{Feature}FormView}
      />
      <Stack.Screen
        name={{Feature}Routes.{Feature}Edit}
        component={{Feature}FormView}
      />
    </Stack.Navigator>
  );
}
```

### Step 3: Create Navigation Hook

```typescript
// Add to src/navigation/hooks/index.ts (or create useNavigation{Feature}.ts)
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { {Feature}StackParamList } from '../routes/{feature}.routes';

export function useNavigation{Feature}() {
  return useNavigation<NativeStackNavigationProp<{Feature}StackParamList>>();
}
```

### Step 4: Register in Parent Navigator

```typescript
// In the appropriate parent navigator (PrivateStackNavigator or PublicStackNavigator)
// Add the screen entry:
<Stack.Screen
  name={PrivateRoutes.{Feature}}
  component={{Feature}StackNavigator}
/>
```

And add the route to the parent's routes enum and param list.

## Creation Checklist

When creating a new screen, verify:

- [ ] Screen uses `RootLayout` as root wrapper
- [ ] Screen has `Header` with appropriate title and navigation
- [ ] List screens follow guard order: Loading → Error → Empty → Success
- [ ] Form screens use `FormProvider` + `yupResolver`
- [ ] Route constants defined in `src/navigation/routes/{feature}.routes.ts`
- [ ] Screen registered in stack navigator
- [ ] Navigation hook available for the module
- [ ] Stack registered in parent navigator (Public or Private)
- [ ] All text uses `<Text>` component with variants (no raw `<Text>` from RN)
- [ ] Colors from `useTheme()`, spacing from `spacing.*`
- [ ] Accessibility labels on interactive elements

## References

- Layout components: `src/components/layout/`
- Existing screens: `src/modules/products/ui/` (reference implementation)
- Navigation: `src/navigation/`
- Create Navigation skill: `.ai/skills/generation/create-navigation/SKILL.md`
