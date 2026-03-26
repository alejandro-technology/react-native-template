---
name: create-component
description: Create new React Native components following project conventions. Use when creating UI components, form components, or layout components.
last_updated: 2026-03-25
---

# Create Component

Create React Native components following this project's conventions.

## When to Use

- Creating new UI components (core)
- Creating form components with react-hook-form integration
- Creating layout components

## Component Types

### Core Components (`src/components/core/`)

Base UI components with theme-aware factory pattern for styles.

**Every core component must:**
1. Use a style factory function from `src/theme/components/{Component}.styles.ts`
2. Accept `mode` from `useTheme()` to support dark/light themes
3. Use named export (not default)

```typescript
// src/components/core/MyComponent.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@theme/index';
import { getMyComponentStyle, MyComponentVariant } from '@theme/components/MyComponent.styles';

interface MyComponentProps {
  title: string;
  variant?: MyComponentVariant;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MyComponent({ title, variant = 'default', style }: MyComponentProps) {
  const theme = useTheme();

  const styles = getMyComponentStyle({
    mode: theme.mode,
    variant,
  });

  return (
    <View style={[styles.container, style]}>
      <Text variant="body">{title}</Text>
    </View>
  );
}
```

**Corresponding style factory:**

```typescript
// src/theme/components/MyComponent.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';

export type MyComponentVariant = 'default' | 'outlined';

interface MyComponentStyleProps {
  variant?: MyComponentVariant;
  mode?: ThemeMode;
}

export function getMyComponentStyle({
  variant = 'default',
  mode = 'light',
}: MyComponentStyleProps): {
  container: ViewStyle;
  text: TextStyle;
} {
  const themeColors = colors[mode];

  return {
    container: {
      padding: spacing.md,
      backgroundColor: variant === 'default' ? themeColors.surface : 'transparent',
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: themeColors.border,
    },
    text: {
      color: themeColors.text,
    },
  };
}
```

### Form Components (`src/components/form/`)

Wrappers around core components with `useController` from react-hook-form.

```typescript
// src/components/form/TextInput.tsx
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import {
  TextInput as TextInputCore,
  TextInputProps as TextInputCoreProps,
} from '../core/TextInput';

interface TextInputProps<T extends FieldValues = any>
  extends TextInputCoreProps {
  control: Control<T>;
  name: Path<T>;
}

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ label, name, control, ...rest }, ref) => {
    const {
      field: { value, onChange },
      fieldState: { error },
    } = useController({ name, control });

    const onChangeText = React.useCallback(
      (text: string) => {
        onChange(text);
      },
      [onChange],
    );

    return (
      <TextInputCore
        ref={ref}
        label={label}
        error={error?.message}
        value={value ? String(value) : ''}
        onChangeText={onChangeText}
        {...rest}
      />
    );
  },
);
```

### Layout Components (`src/components/layout/`)

Components that structure screen layouts (RootLayout, Header, Toolbar, etc.).

```typescript
// src/components/layout/MyLayout.tsx
import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, spacing } from '@theme/index';

export function MyLayout({ children }: PropsWithChildren) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
});
```

## Checklist

1. Define interface for props with PascalCase: `ComponentNameProps`
2. Use named export: `export function ComponentName()`
3. **Core components**: Create style factory in `src/theme/components/{Component}.styles.ts`
4. **Core components**: Use `useTheme()` and pass `mode` to style factory
5. **Form components**: Use `useController` from react-hook-form, wrap core component
6. **Layout components**: Use `StyleSheet.create()` at bottom + theme colors
7. Export from barrel file (`index.ts`) in component folder

## File Structure

```
src/components/
├── core/
│   ├── Button.tsx
│   ├── Text.tsx
│   ├── TextInput.tsx
│   ├── Card.tsx
│   ├── Checkbox.tsx
│   ├── Modal.tsx
│   ├── Select.tsx
│   ├── DatePicker.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Toast.tsx
│   ├── Icon.tsx
│   ├── AnimatedPressable.tsx
│   └── index.ts          # Barrel export
├── form/
│   ├── TextInput.tsx      # Wraps core/TextInput with useController
│   ├── Checkbox.tsx
│   ├── DatePicker.tsx
│   ├── Select.tsx
│   └── index.ts
└── layout/
    ├── RootLayout.tsx
    ├── Header.tsx
    ├── Toolbar.tsx
    ├── LoadingState.tsx
    ├── ErrorState.tsx
    ├── EmptyState.tsx
    ├── ItemSeparatorComponent.tsx
    ├── DeleteConfirmationSheet.tsx
    ├── ErrorBoundary.tsx
    └── index.ts
```

## Style Factory Pattern

```
src/theme/components/
├── Button.styles.ts       # getButtonStyle()
├── Text.styles.ts         # getTextStyle()
├── TextInput.styles.ts    # getTextInputStyle()
├── Card.styles.ts         # getCardStyle()
└── ...
```

Each factory:
- Accepts `mode: ThemeMode` parameter
- Accepts variant/size/disabled props
- Returns object with typed style keys (`container`, `text`, `icon`, etc.)
- Uses `colors[mode]` for theme-aware colors
- Uses `spacing`, `borderRadius`, `typography` tokens

## Import Order

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
// External libs
import { useMutation } from '@tanstack/react-query';
// Components
import { Button } from '@components/core';
// Theme
import { useTheme, spacing } from '@theme/index';
import { getMyStyle } from '@theme/components/MyComponent.styles';
// Types
import { SomeType } from './types';
```

Order: React → React Native → External libs → Internal aliases → Relative imports

---

# Project Specific

## Theme Configuration

- Theme location: `src/theme/`
- Hook: `useTheme()` from `@theme/index`
- Tokens: `colors`, `spacing`, `typography`, `borderRadius`, `shadows`
- Style factories: `src/theme/components/*.styles.ts`

## Component Aliases

- `@components/core` - Base UI components with factory styles
- `@components/form` - Form-integrated components (useController wrappers)
- `@components/layout` - Layout components (RootLayout, Header, etc.)

## Available Core Components

AnimatedPressable, Avatar, Badge, Button, Card, Checkbox, DatePicker, Icon, Modal, Select, Text, TextInput, Toast

## Available Form Components

Checkbox, DatePicker, Select, TextInput
