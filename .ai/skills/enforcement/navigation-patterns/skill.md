---
name: navigation-patterns
description: Enforce React Navigation patterns, typed route definitions, stack navigator structure, and navigation hooks. Use when adding screens, creating navigation flows, or reviewing navigation code.
---

# Navigation Patterns Skill

Enforces the centralized, type-safe navigation architecture.

## When to Use

- Adding new screens or navigation stacks
- Creating route type definitions
- Wiring screens to navigators
- Reviewing navigation-related code

## Navigation Architecture

```
src/navigation/
├── RootNavigator.tsx              # Top-level stack
├── routes/
│   ├── root.routes.ts            # RootStackParamList enum + type
│   ├── products.routes.ts        # ProductsStackParamList
│   ├── users.routes.ts           # UsersStackParamList
│   ├── examples.routes.ts        # ExamplesStackParamList
│   └── index.ts                  # Barrel re-export
├── stacks/
│   ├── ProductsStackNavigator.tsx
│   ├── UsersStackNavigator.tsx
│   └── ExampleStackNavigator.tsx
└── hooks/
    ├── useNavigation.ts          # Typed navigation hooks
    └── index.ts
```

## Adding a New Feature Stack (Step by Step)

### Step 1: Define Routes (`routes/{entities}.routes.ts`)

```typescript
import { {Entity}Entity } from '@modules/{entities}/domain/{entity}.model';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export enum {Entities}Routes {
  {Entity}List = '{Entity}List',
  {Entity}Detail = '{Entity}Detail',
  {Entity}Form = '{Entity}Form',
}

export type {Entities}StackParamList = {
  [{Entities}Routes.{Entity}List]: undefined;
  [{Entities}Routes.{Entity}Detail]: { {entity}Id: string };
  [{Entities}Routes.{Entity}Form]?: { {entity}: {Entity}Entity };
};

export type {Entities}ScreenProps<T extends keyof {Entities}StackParamList> =
  NativeStackScreenProps<{Entities}StackParamList, T>;
```

### Step 2: Create Stack Navigator (`stacks/{Entities}StackNavigator.tsx`)

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { {Entity}FormView } from '@modules/{entities}/ui/{Entity}FormView';
import { {Entities}ListView } from '@modules/{entities}/ui/{Entities}ListView';
import { {Entity}DetailView } from '@modules/{entities}/ui/{Entity}DetailView';
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
      <Stack.Screen name={{Entities}Routes.{Entity}List} component={{Entities}ListView} />
      <Stack.Screen name={{Entities}Routes.{Entity}Detail} component={{Entity}DetailView} />
      <Stack.Screen name={{Entities}Routes.{Entity}Form} component={{Entity}FormView} />
    </Stack.Navigator>
  );
}
```

### Step 3: Add Navigation Hook (`hooks/useNavigation.ts`)

```typescript
export const useNavigation{Entities} = useNavigation<
  NativeStackNavigationProp<{Entities}StackParamList>
>;
```

### Step 4: Register in Root (`routes/root.routes.ts`)

```typescript
export enum RootRoutes {
  // ...existing
  {Entities} = '{Entities}',
}

export type RootStackParamList = {
  // ...existing
  [RootRoutes.{Entities}]: NavigatorScreenParams<{Entities}StackParamList>;
};
```

### Step 5: Add to Root Navigator (`RootNavigator.tsx`)

```typescript
import {Entities}Navigator from './stacks/{Entities}StackNavigator';

// Inside Stack.Navigator:
<Stack.Screen name={RootRoutes.{Entities}} component={{Entities}Navigator} />
```

### Step 6: Export from barrel (`routes/index.ts`)

```typescript
export * from './{entities}.routes';
```

## Screen Props Pattern

Screens receive typed props via `ScreenProps`:

```typescript
export function ProductDetailView({
  route: {
    params: { productId },
  },
}: ProductsScreenProps<ProductsRoutes.ProductDetail>) {
  // productId is typed as string
}
```

For optional params (Form screen):

```typescript
export function ProductFormView({
  route: { params },
  navigation: { goBack },
}: ProductsScreenProps<ProductsRoutes.ProductForm>) {
  const product = params?.product; // Optional
  const isEditing = !!product;
}
```

## Validation Rules

| Rule | Description |
|---|---|
| R1 | Every feature stack has routes enum + ParamList + ScreenProps |
| R2 | ParamList uses route enum keys, not string literals |
| R3 | Detail screens receive entity ID as param (not full entity) |
| R4 | Form screens receive optional full entity for edit mode |
| R5 | All stacks use `headerShown: false` (custom toolbar via RootLayout) |
| R6 | Animation: `slide_from_right` with `animationDuration: 2500` |
| R7 | Navigation hooks are typed: `useNavigation<NativeStackNavigationProp<ParamList>>` |
| R8 | All route files re-exported from `routes/index.ts` |

## Anti-Patterns

```typescript
// WRONG: String-based navigation
navigation.navigate('ProductDetail', { productId: '123' });

// CORRECT: Enum-based navigation
navigate(ProductsRoutes.ProductDetail, { productId: '123' });

// WRONG: Untyped navigation hook
const navigation = useNavigation();

// CORRECT: Typed hook
const { navigate, goBack } = useNavigationProducts();

// WRONG: Passing full entity to detail screen
navigate('ProductDetail', { product: fullProductObject });

// CORRECT: Pass only ID, let detail screen fetch
navigate(ProductsRoutes.ProductDetail, { productId: product.id });
```
