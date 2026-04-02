---
name: navigation
description: Register a feature module in the navigation system (routes, stack navigator, private routes, typed hooks). Use when adding navigation for a new module or registering screens.
license: MIT
compatibility: opencode
metadata:
  layer: navigation
  workflow: scaffold
  output: src/navigation/routes/{entities}.routes.ts, src/navigation/stacks/{Entities}StackNavigator.tsx
---

# Navigation Registration

Register module `$ARGUMENTS` in the navigation system.

## Files to Create/Modify

```
src/navigation/
  routes/{entities}.routes.ts     # NEW: Routes enum + ParamList
  stacks/{Entities}StackNavigator.tsx  # NEW: Stack navigator
  routes/private.routes.ts        # MODIFY: Add enum + ParamList
  routes/index.ts                 # MODIFY: Export routes
  stacks/PrivateStackNavigator.tsx # MODIFY: Add screen
  hooks/useNavigation.ts          # MODIFY: Add typed hook
```

## Step 1: Create `routes/{entities}.routes.ts`

```typescript
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// Types
import { {Entity} } from '@modules/{module}/domain/{entity}.model';

export enum {Entities}Routes {
  {Entity}List = '{Entity}List',
  {Entity}Detail = '{Entity}Detail',
  {Entity}Form = '{Entity}Form',
}

export type {Entities}StackParamList = {
  [{Entities}Routes.{Entity}List]: undefined;
  [{Entities}Routes.{Entity}Detail]: { {entity}Id: string };
  [{Entities}Routes.{Entity}Form]?: { {entity}: {Entity} };
};

export type {Entities}ScreenProps<T extends keyof {Entities}StackParamList> =
  NativeStackScreenProps<{Entities}StackParamList, T>;
```

**Rules:**

- Enum: PascalCase name, PascalCase members
- Detail screen: receives `{entity}Id: string` as param
- Form screen: optional param with entity data for edit mode (use `?`)
- Import entity type from domain layer for form param

## Step 2: Create `stacks/{Entities}StackNavigator.tsx`

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import { {Entity}FormView } from '@modules/{module}/ui/{Entity}FormView';
import { {Entities}ListView } from '@modules/{module}/ui/{Entities}ListView';
import { {Entity}DetailView } from '@modules/{module}/ui/{Entity}DetailView';
// Routes
import {
  {Entities}Routes,
  {Entities}StackParamList,
} from '@navigation/routes/{entities}.routes';

const Stack = createNativeStackNavigator<{Entities}StackParamList>();

export default function {Entities}Navigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 2500,
      }}
    >
      <Stack.Screen
        name={{Entities}Routes.{Entity}List}
        component={{Entities}ListView}
      />
      <Stack.Screen
        name={{Entities}Routes.{Entity}Detail}
        component={{Entity}DetailView}
      />
      <Stack.Screen
        name={{Entities}Routes.{Entity}Form}
        component={{Entity}FormView}
      />
    </Stack.Navigator>
  );
}
```

**Rules:**

- Default export the navigator component
- `headerShown: false` on all screens
- List screen is the first screen (default route)
- Import screens from `@modules/{module}/ui/`
- Import routes from `@navigation/routes/`

## Step 3: Modify `routes/private.routes.ts`

Add to the enum:

```typescript
export enum PrivateRoutes {
  // ... existing routes
  {Entities} = '{Entities}',
}
```

Add to the ParamList:

```typescript
import { NavigatorScreenParams } from '@react-navigation/native';
import { {Entities}StackParamList } from './{entities}.routes';

export type PrivateStackParamList = {
  // ... existing entries
  [PrivateRoutes.{Entities}]: NavigatorScreenParams<{Entities}StackParamList>;
};
```

## Step 4: Modify `routes/index.ts`

Add export:

```typescript
export * from './{entities}.routes';
```

## Step 5: Modify `stacks/PrivateStackNavigator.tsx`

Import the navigator:

```typescript
import {Entities}Navigator from './{Entities}StackNavigator';
```

Add the screen inside `Stack.Navigator`:

```typescript
<Stack.Screen
  name={PrivateRoutes.{Entities}}
  component={{Entities}Navigator}
/>
```

## Step 6: Modify `hooks/useNavigation.ts`

Import the ParamList:

```typescript
import type { {Entities}StackParamList } from '../routes/{entities}.routes';
```

Add the typed hook:

```typescript
export const useNavigation{Entities} = () =>
  useNavigation<NativeStackNavigationProp<{Entities}StackParamList>>();
```

## Navigation Patterns

**Navigating between screens in same module:**

```typescript
const { navigate } = useNavigation{Entities}();
navigate({Entities}Routes.{Entity}Detail, { {entity}Id: '123' });
navigate({Entities}Routes.{Entity}Form); // create mode
navigate({Entities}Routes.{Entity}Form, { {entity}: existing{Entity} }); // edit mode
```

**Navigating to a module from another module:**

```typescript
const { navigate } = useNavigationPrivate();
navigate(PrivateRoutes.{Entities}); // enters the {Entities} stack
```

**Screen Props:**

```typescript
import { {Entities}ScreenProps } from '@navigation/routes';

type Props = {Entities}ScreenProps<'{Entity}Detail'>;

export function {Entity}DetailView({ route }: Props) {
  const { {entity}Id } = route.params;
  // ...
}
```

## Reference

- Example: `src/navigation/routes/products.routes.ts`
- Example: `src/navigation/stacks/ProductsStackNavigator.tsx`
