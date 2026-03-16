---
name: ui-components
category: enforcement
layer: ui
priority: high
tags:
  - components
  - style-factories
  - theme-tokens
  - component-system
triggers:
  - 'Creating components in src/components/'
  - 'Modifying shared components'
  - 'Theme integration in components'
description: Enforces the 3-tier component system (core, form, layout), theme token usage, component style factories, and consistent API patterns across all shared components.
---

# Components Skill — UI Component System Enforcer

## 1. Metadata

| Field           | Value                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**        | `ui-components`                                                                                                                                                    |
| **Description** | Enforces the 3-tier component system (core, form, layout), theme token usage, component style factories, and consistent API patterns across all shared components. |
| **Purpose**     | Maintain visual consistency, prevent style drift, and ensure all components integrate with the 5-mode theme system.                                                |
| **Category**    | UI/UX, Quality, Performance                                                                                                                                        |

## 2. Trigger

| Condition          | Detail                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Activated when** | Creating or modifying components in `src/components/` or `src/modules/*/ui/components/`           |
| **Context**        | New component creation, style changes, theme integration, component refactoring                   |
| **Observed paths** | `src/components/core/`, `src/components/form/`, `src/components/layout/`, `src/theme/components/` |

## 3. Responsibilities

### Validates

- Components are placed in the correct tier (core/form/layout)
- All spacing uses `spacing` tokens, never raw pixel values
- All text uses `<Text variant="...">`, never raw `<RNText>`
- Colors come from `useTheme()` or style factory, never hardcoded hex
- Style factories accept `mode`/`variant`/`size` parameters
- New components are registered in their tier's `index.ts` barrel export

### Recommends

- Use existing core components (`Button`, `Card`, `Text`, `TextInput`) before creating new ones
- Style factories in `src/theme/components/` for theme-dependent styles
- `React.memo` for list item components
- `forwardRef` for input components

### Prevents

- Hardcoded colors (`#hex`, `rgb()`, color strings)
- Raw pixel values for spacing (`padding: 16`)
- Raw `<Text>` from react-native (use `@components/core` `Text`)
- Complex inline styles (use `StyleSheet.create`)
- Components defined inside other components

## 4. Rules

### Component Tier System

| Tier       | Path                           | Purpose                              | Examples                                                                                                                            |
| ---------- | ------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Core**   | `src/components/core/`         | Atomic UI primitives, theme-aware    | `Button`, `Text`, `Card`, `TextInput`, `Modal`, `Toast`, `Avatar`, `Badge`, `Checkbox`, `Select`, `DatePicker`, `AnimatedPressable` |
| **Form**   | `src/components/form/`         | react-hook-form wrappers around core | `TextInput` (with `useController`), `Select`, `Checkbox`, `DatePicker`                                                              |
| **Layout** | `src/components/layout/`       | Screen-level structural components   | `RootLayout`, `Header`, `Toolbar`, `LoadingState`, `ErrorState`, `EmptyState`, `DeleteConfirmationSheet`, `ItemSeparatorComponent`  |
| **Module** | `src/modules/*/ui/components/` | Feature-specific composed components | `ProductList`, `ProductItem`, `ProductForm`, `UserItem`, `SignInForm`                                                               |

### Core Component API Pattern (from codebase)

```typescript
// src/components/core/Button.tsx — theme-aware with variants
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Style factory: src/theme/components/Button.styles.ts
export function getButtonStyle(
  mode: ThemeMode,
  variant: ButtonVariant,
  size: ButtonSize,
  options?: { disabled?: boolean; fullWidth?: boolean }
) { ... }
```

### Form Component Pattern (from codebase)

```typescript
// src/components/form/TextInput.tsx — wraps core with react-hook-form
interface FormTextInputProps
  extends Omit<CoreTextInputProps, 'value' | 'onChangeText'> {
  name: string;
  control: Control<any>;
}

export function TextInput({ name, control, ...props }: FormTextInputProps) {
  const { field } = useController({ name, control });
  return (
    <CoreTextInput
      {...props}
      value={String(field.value ?? '')}
      onChangeText={field.onChange}
    />
  );
}
```

### Layout Component Pattern (from codebase)

```typescript
// src/components/layout/RootLayout.tsx — screen wrapper
interface RootLayoutProps {
  children: React.ReactNode;
  scroll?: boolean; // ScrollView vs View
  padding?: 'sm' | 'md' | 'lg';
  toolbar?: boolean; // Show back button toolbar
  title?: string;
  onPress?: () => void; // Toolbar back action
}
```

### Style Factory Pattern

```typescript
// src/theme/components/Card.styles.ts
export function getCardStyle(
  mode: ThemeMode,
  variant: 'elevated' | 'outlined' | 'filled' | 'ghost',
  size: 'sm' | 'md' | 'lg',
) {
  const theme = getTheme(mode);
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.md,
      padding:
        size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md,
      ...getShadow(mode, variant === 'elevated' ? 'md' : 'none'),
    },
  });
}
```

### Barrel Export Registration

```typescript
// src/components/core/index.ts — every core component exported here
export { Button } from './Button';
export { Text } from './Text';
export { Card } from './Card';
export { TextInput } from './TextInput';
export { Modal } from './Modal';
export { Toast } from './Toast';
// ... all core components
```

### Prohibited Anti-patterns

| Anti-pattern                            | Why                                 | Correct                                    |
| --------------------------------------- | ----------------------------------- | ------------------------------------------ |
| `color: '#FF5733'`                      | Breaks theme modes                  | `color: colors.primary` via `useTheme()`   |
| `padding: 16`                           | Not responsive, breaks token system | `padding: spacing.md`                      |
| `<Text>Hello</Text>` (RN)               | No theme integration                | `<Text variant="body">Hello</Text>` (core) |
| `style={{ ... complex }}`               | Not cacheable                       | `StyleSheet.create()` at file bottom       |
| `const Child = () => ...` inside parent | Re-mounts on every render           | Extract to separate file/const             |
| Missing `index.ts` export               | Import paths break conventions      | Add to tier's barrel export                |

## 5. Expected Output

| Aspect                | Detail                                                                             |
| --------------------- | ---------------------------------------------------------------------------------- |
| **Feedback type**     | Component audit report                                                             |
| **Severity: error**   | Hardcoded color, raw RN `Text` in feature code, component defined inside component |
| **Severity: warning** | Missing barrel export, inline styles, missing variant prop                         |
| **Severity: info**    | Could use `React.memo`, could extract style factory                                |

## 6. Practical Example

### Before — Non-themed, non-composable component

```typescript
import { View, Text, TouchableOpacity } from 'react-native';

export const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
      {product.name}
    </Text>
    <Text style={{ fontSize: 14, color: '#666' }}>${product.price}</Text>
  </TouchableOpacity>
);
```

### After — Themed, composable, following project patterns

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from '@components/core';
import type { ProductEntity } from '../../domain/product.model';
import { spacing } from '@theme/index';
import { ProductsRoutes } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';

interface ProductItemProps {
  product: ProductEntity;
}

export const ProductItem = React.memo(function ProductItem({
  product,
}: ProductItemProps) {
  const { navigate } = useNavigationProducts();

  const handleCardPress = () => {
    navigate(ProductsRoutes.ProductDetail, { productId: product.id });
  };

  return (
    <Card onPress={handleCardPress}>
      <View style={styles.info}>
        <Text variant="h3">{product.name}</Text>
        {product.description ? (
          <Text variant="body">{product.description}</Text>
        ) : null}
        <Text variant="caption" color="primary">
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  info: { flex: 1, gap: spacing.xs },
});
```

**Explanation**: Uses `Card` and `Text` from core components (theme-aware). `React.memo` prevents unnecessary re-renders in lists. Spacing uses tokens. Animations are handled at the layout level by `RootLayout` (not in individual items). Styles use `StyleSheet.create` at file bottom. Props are typed with explicit interface.
