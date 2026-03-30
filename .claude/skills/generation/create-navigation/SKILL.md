---
name: create-navigation
category: generation
layer: ui
priority: high
last_updated: 2026-03-25
tags:
  - react-navigation
  - stack-navigator
  - typed-routes
  - navigation-flows
triggers:
  - 'Setting up navigation'
  - 'Creating new screens'
  - 'Adding navigation for module'
description: Create typed navigation for a feature module — route enum, param list, screen props type, stack navigator, navigation hook, and registration in parent navigator.
---

# Create Navigation

Set up typed navigation for a feature module in this project.

## When to Use

- Adding navigation for a new feature module
- Creating a new stack navigator with typed routes
- Adding screens to existing navigation stacks

## Project Navigation Architecture

```
App.tsx
└── AppProvider
    └── NavigationProvider (NavigationContainer)
        └── RootNavigator
            ├── PublicNavigator (if not authenticated)
            │   ├── ExamplesNavigator
            │   └── AuthenticationNavigator
            └── PrivateNavigator (if authenticated)
                ├── ProductsNavigator
                ├── UsersNavigator
                └── AuthExampleView
```

## Step-by-Step: Add Navigation for a New Module

### Step 1: Define Routes (`src/navigation/routes/{feature}.routes.ts`)

```typescript
import { {Feature}Entity } from '@modules/{feature}/domain/{feature}.model';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export enum {Feature}sRoutes {
  {Feature}List = '{Feature}List',
  {Feature}Detail = '{Feature}Detail',
  {Feature}Form = '{Feature}Form',
}

export type {Feature}sStackParamList = {
  [{Feature}sRoutes.{Feature}List]: undefined;
  [{Feature}sRoutes.{Feature}Detail]: { {feature}Id: string };
  [{Feature}sRoutes.{Feature}Form]?: { {feature}: {Feature}Entity };
};

export type {Feature}sScreenProps<T extends keyof {Feature}sStackParamList> =
  NativeStackScreenProps<{Feature}sStackParamList, T>;
```

**Key patterns:**
- Route enum: `{Feature}sRoutes` (plural for the module namespace)
- Param list: `{Feature}sStackParamList`
- Screen props type: `{Feature}sScreenProps<T>` using `NativeStackScreenProps`
- Optional params use `?` suffix on the key (e.g., `{Feature}Form` for create vs edit)
- Pass entity object for edit mode, entity ID for detail view

### Step 2: Register in Routes Barrel (`src/navigation/routes/index.ts`)

```typescript
// Add to existing barrel
export * from './{feature}.routes';
```

### Step 3: Create Stack Navigator (`src/navigation/stacks/{Feature}sStackNavigator.tsx`)

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import { {Feature}ListView } from '@modules/{feature}/ui/{Feature}ListView';
import { {Feature}DetailView } from '@modules/{feature}/ui/{Feature}DetailView';
import { {Feature}FormView } from '@modules/{feature}/ui/{Feature}FormView';
// Routes
import {
  {Feature}sRoutes,
  {Feature}sStackParamList,
} from '@navigation/routes/{feature}.routes';

const Stack = createNativeStackNavigator<{Feature}sStackParamList>();

export default function {Feature}sNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 2500,
      }}
    >
      <Stack.Screen
        name={{Feature}sRoutes.{Feature}List}
        component={{Feature}ListView}
      />
      <Stack.Screen
        name={{Feature}sRoutes.{Feature}Detail}
        component={{Feature}DetailView}
      />
      <Stack.Screen
        name={{Feature}sRoutes.{Feature}Form}
        component={{Feature}FormView}
      />
    </Stack.Navigator>
  );
}
```

**Key patterns:**
- `headerShown: false` — project uses custom Header/Toolbar components
- `animation: 'slide_from_right'` — consistent slide animation
- Default export for stack navigators
- Use route enum values for `name` prop

### Step 4: Add Navigation Hook (`src/navigation/hooks/useNavigation.ts`)

```typescript
// Add to existing file:
import type { {Feature}sStackParamList } from '../routes/{feature}.routes';

export const useNavigation{Feature}s = useNavigation<
  NativeStackNavigationProp<{Feature}sStackParamList>
>;
```

### Step 5: Register in Parent Navigator

Add the new module to `PrivateStackNavigator` (or `PublicStackNavigator`):

```typescript
// In src/navigation/stacks/PrivateStackNavigator.tsx
import {Feature}sNavigator from './{Feature}sStackNavigator';
import { PrivateRoutes } from '@navigation/routes';

// Add route enum value:
// In src/navigation/routes/private.routes.ts
export enum PrivateRoutes {
  // ... existing routes
  {Feature}s = '{Feature}s',
}

export type PrivateStackParamList = {
  // ... existing routes
  [PrivateRoutes.{Feature}s]: NavigatorScreenParams<{Feature}sStackParamList>;
};

// Add screen:
<Stack.Screen
  name={PrivateRoutes.{Feature}s}
  component={{Feature}sNavigator}
/>
```

## Using Navigation in Screens

### Navigating

```typescript
import { {Feature}sRoutes } from '@navigation/routes';
import { useNavigation{Feature}s } from '@navigation/hooks';

function SomeScreen() {
  const { navigate, goBack } = useNavigation{Feature}s();

  // Navigate to list
  navigate({Feature}sRoutes.{Feature}List);

  // Navigate to detail
  navigate({Feature}sRoutes.{Feature}Detail, { {feature}Id: '123' });

  // Navigate to create form
  navigate({Feature}sRoutes.{Feature}Form);

  // Navigate to edit form
  navigate({Feature}sRoutes.{Feature}Form, { {feature}: entity });
}
```

### Reading Route Params (via Screen Props)

```typescript
import { {Feature}sRoutes, {Feature}sScreenProps } from '@navigation/routes';

export function {Feature}DetailView({
  route: {
    params: { {feature}Id },
  },
}: {Feature}sScreenProps<{Feature}sRoutes.{Feature}Detail>) {
  // Use {feature}Id
}
```

## Conditional Auth Navigation

The root navigator renders conditionally based on authentication:

```typescript
// src/navigation/RootNavigator.tsx
import { useAuth } from '@modules/authentication';

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <PrivateNavigator />;
  }

  return <PublicNavigator />;
}
```

## Existing Navigation Hooks

| Hook | Stack | Import |
|------|-------|--------|
| `useNavigationPrivate` | `PrivateStackParamList` | `@navigation/hooks` |
| `useNavigationPublic` | `PublicStackParamList` | `@navigation/hooks` |
| `useNavigationProducts` | `ProductsStackParamList` | `@navigation/hooks` |
| `useNavigationUsers` | `UsersStackParamList` | `@navigation/hooks` |
| `useNavigationAuthentication` | `AuthenticationStackParamList` | `@navigation/hooks` |

## File Structure

```
src/navigation/
├── RootNavigator.tsx                # Auth-conditional root
├── routes/
│   ├── index.ts                     # Barrel export all routes
│   ├── public.routes.ts
│   ├── private.routes.ts
│   ├── products.routes.ts
│   ├── users.routes.ts
│   ├── authentication.routes.ts
│   ├── examples.routes.ts
│   └── {feature}.routes.ts          # New module routes
├── hooks/
│   ├── index.ts                     # Barrel export
│   └── useNavigation.ts             # All typed navigation hooks
└── stacks/
    ├── PublicStackNavigator.tsx
    ├── PrivateStackNavigator.tsx
    ├── ProductsStackNavigator.tsx
    ├── UsersStackNavigator.tsx
    ├── AuthenticationStackNavigator.tsx
    ├── ExampleStackNavigator.tsx
    └── {Feature}sStackNavigator.tsx  # New module stack
```

## Checklist

1. Define route enum + param list in `src/navigation/routes/{feature}.routes.ts`
2. Export `{Feature}sScreenProps` type for screen components
3. Register in `src/navigation/routes/index.ts` barrel
4. Create stack navigator in `src/navigation/stacks/{Feature}sStackNavigator.tsx`
5. Add navigation hook in `src/navigation/hooks/useNavigation.ts`
6. Register in parent navigator (Private or Public)
7. Add route to parent's enum and param list
8. Use `{Feature}sScreenProps<Route>` for screen prop typing

## References

- Products navigation: `src/navigation/routes/products.routes.ts`
- Products stack: `src/navigation/stacks/ProductsStackNavigator.tsx`
- Navigation hooks: `src/navigation/hooks/useNavigation.ts`
- Root navigator: `src/navigation/RootNavigator.tsx`
- Private navigator: `src/navigation/stacks/PrivateStackNavigator.tsx`
