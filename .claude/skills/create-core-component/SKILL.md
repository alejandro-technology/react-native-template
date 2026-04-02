---
name: create-core-component
description: Create a new core UI primitive component with style factory. Use when creating Button, Text, TextInput, Card, Modal, or any base UI component.
license: MIT
compatibility: opencode
metadata:
  layer: ui
  workflow: scaffold
  output: src/components/core/{Component}.tsx, src/theme/components/{Component}.styles.ts
---

# Create Core Component

Create a new core component named `$ARGUMENTS`.

## Files to Create

```
src/theme/components/{Component}.styles.ts   # Style factory
src/components/core/{Component}.tsx          # Component
src/components/core/index.ts                 # Export (modify)
```

## Step 1: Create Style Factory

`src/theme/components/{Component}.styles.ts`

```typescript
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, ThemeMode } from '../colors';
import { spacing } from '../spacing';
import { borderRadius } from '../border-radius';
import { typography } from '../typography';

// Variant types
export type {Component}Variant = 'primary' | 'secondary' | 'outlined' | 'ghost';
export type {Component}Size = 'sm' | 'md' | 'lg';

// Style props interface
interface {Component}StyleProps {
  mode: ThemeMode;
  variant: {Component}Variant;
  size: {Component}Size;
  disabled?: boolean;
}

// Style return type
interface {Component}Styles {
  container: ViewStyle;
  text: TextStyle;
}

// Variant styles by mode
const variantStyles: Record<
  {Component}Variant,
  (mode: ThemeMode) => { container: ViewStyle; text: TextStyle }
> = {
  primary: mode => ({
    container: {
      backgroundColor: colors[mode].primary,
      borderWidth: 0,
    },
    text: {
      color: colors[mode].primaryForeground,
    },
  }),
  secondary: mode => ({
    container: {
      backgroundColor: colors[mode].secondary,
      borderWidth: 0,
    },
    text: {
      color: colors[mode].secondaryForeground,
    },
  }),
  outlined: mode => ({
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors[mode].border,
    },
    text: {
      color: colors[mode].foreground,
    },
  }),
  ghost: mode => ({
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: {
      color: colors[mode].foreground,
    },
  }),
};

// Size styles
const sizeStyles: Record<{Component}Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    text: {
      fontSize: typography.sizes.sm,
    },
  },
  md: {
    container: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    text: {
      fontSize: typography.sizes.md,
    },
  },
  lg: {
    container: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
    },
    text: {
      fontSize: typography.sizes.lg,
    },
  },
};

// Style factory function
export function get{Component}Style(props: {Component}StyleProps): {Component}Styles {
  const { mode, variant, size, disabled = false } = props;

  const variantStyle = variantStyles[variant](mode);
  const sizeStyle = sizeStyles[size];

  return {
    container: {
      ...variantStyle.container,
      ...sizeStyle.container,
      opacity: disabled ? 0.5 : 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      ...variantStyle.text,
      ...sizeStyle.text,
      fontFamily: typography.fonts.medium,
    },
  };
}
```

## Step 2: Create Component

`src/components/core/{Component}.tsx`

```typescript
import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
// Components
import { Text } from './Text';
// Theme
import { useTheme } from '@theme/index';
import {
  get{Component}Style,
  {Component}Variant,
  {Component}Size,
} from '@theme/components/{Component}.styles';

// Props interface
interface {Component}Props extends Omit<PressableProps, 'style'> {
  variant?: {Component}Variant;
  size?: {Component}Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function {Component}(props: {Component}Props) {
  const {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    style: customStyle,
    children,
    ...rest
  } = props;

  const theme = useTheme();
  const styles = get{Component}Style({
    mode: theme.mode,
    variant,
    size,
    disabled: disabled || loading,
  });

  return (
    <Pressable
      style={[styles.container, baseStyles.container, customStyle]}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={styles.text.color} />
      ) : typeof children === 'string' ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

// Layout-only base styles
const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
```

## Step 3: Export Component

Add to `src/components/core/index.ts`:

```typescript
export { {Component} } from './{Component}';
export type { {Component}Variant, {Component}Size } from '@theme/components/{Component}.styles';
```

## Checklist

- [ ] Style factory created with variants and sizes
- [ ] Component uses `useTheme()` for theme access
- [ ] Props interface extends RN equivalent with `Omit<..., 'style'>`
- [ ] Destructured props with defaults
- [ ] `accessibilityRole` and `accessibilityState` included
- [ ] Component exported from `index.ts`
- [ ] Types exported from `index.ts`

## Reference

- Example: `src/components/core/Button.tsx`
- Example: `src/theme/components/Button.styles.ts`
