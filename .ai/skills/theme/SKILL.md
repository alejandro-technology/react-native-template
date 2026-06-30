---
name: theme
description: Create or extend the theme system: design tokens, component style factories, local StyleSheet styles, and animation hooks. Load when adding colors, spacing, typography, animations, new theme modes, or component-level styles (both reusable factories and local co-located styles).
license: MIT
compatibility: React Native 0.83+, TypeScript strict mode, bun package manager. Requires project structure from react-native-template.
metadata:
  version: "1.0"
  category: theming-styling
  layer: theme,ui
  workflow: scaffold
  output: src/theme/**, src/components/**/*.styles.ts
---

# Skill: Theme

Create or extend the theme system for: $ARGUMENTS

## Decision Tree — What Do You Need?

| I need to… | Go to |
|---|---|
| Style a reusable component with variants/sizes | Part A: Style Factory |
| Add local co-located styles to a screen or feature | Part B: Local StyleSheet |
| Add a new spacing, border, or typography value | Part C: Design Tokens |
| Add a fade-in, spring, or custom animation | Part D: Animation Hooks |
| Add a new theme mode (dark, corporate, brand) | Part E: Theme Colors |

---

## Part A: Style Factory

Style factories live in `src/theme/components/{Component}.styles.ts`. They receive props (variant, size, mode, disabled) and return computed styles.

### Step 1: Create the factory file

```typescript
// src/theme/components/Card.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { Colors, ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';
import { borderRadius } from '../borders';
import { typography } from '../typography';
import { hScale } from '../responsive';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

interface CardStyleProps {
  variant?: CardVariant;
  size?: CardSize;
  mode?: ThemeMode;
  disabled?: boolean;
}

const SIZE_STYLES: Record<CardSize, { padding: number; minHeight: number }> = {
  sm: { padding: spacing.sm, minHeight: hScale(80) },
  md: { padding: spacing.md, minHeight: hScale(120) },
  lg: { padding: spacing.lg, minHeight: hScale(160) },
};

export function getCardStyle({
  variant = 'elevated',
  size = 'md',
  mode = 'light',
  disabled = false,
}: CardStyleProps): { container: ViewStyle; title: TextStyle; body: TextStyle } {
  const themeColors = colors[mode];

  const containerByVariant: Record<CardVariant, ViewStyle> = {
    elevated: { backgroundColor: themeColors.surface, borderWidth: 0 },
    outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: themeColors.border },
    filled: { backgroundColor: themeColors.surface, borderWidth: 0 },
  };

  return {
    container: {
      ...SIZE_STYLES[size],
      borderRadius: borderRadius.lg,
      opacity: disabled ? 0.5 : 1,
      ...containerByVariant[variant],
    },
    title: { ...typography.h5, color: themeColors.text },
    body: { ...typography.body, color: themeColors.textSecondary },
  };
}
```

### Step 2: Export from index

```typescript
// src/theme/components/index.ts
export * from './Card.styles';
```

### Step 3: Use in component

```typescript
import { useTheme } from '@theme/index';
import { getCardStyle } from '@theme/components';

function Card({ variant = 'elevated', size = 'md', ...props }: CardProps) {
  const { mode } = useTheme();
  const styles = getCardStyle({ mode, variant, size });
  return <View style={styles.container}>...</View>;
}
```

---

## Part B: Local StyleSheet

### When to use

- Styles are local to one file (screen, feature component, layout component)
- No public variant/size API needed
- Just layout/composition helpers (`wrapper`, `row`, `icon`, `content`)

### When to promote to a factory (Part A)

- Component is reused across modules
- Needs variants, sizes, states, or theme-driven visual rules
- Belongs in `src/components/core` or `src/components/form`

### Pattern

```typescript
import { StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';

function MyScreen() {
  const { colors, spacing } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
  });

  return <View style={styles.container} />;
}
```

→ See [references/patterns.md](references/patterns.md) for full patterns.

---

## Part C: Design Tokens

### Add to an existing token file

```typescript
// src/theme/spacing.ts
export const spacing = {
  // ... existing tokens
  '4xl': wScale(80), // New token
} as const;
```

### Create a new token file

1. Create `src/theme/{tokenName}.ts` with `as const` exports
2. Define the type: `export type TokenName = typeof tokenName;`
3. Add to the `Theme` interface in `src/theme/index.ts`
4. Re-export: `export * from './{tokenName}';`

---

## Part D: Animation Hooks

Animation hooks live in `src/theme/hooks/use{Name}.ts`.

```typescript
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ANIMATION_DURATION, ANIMATION_EASING, SPRING_CONFIGS } from '../animations';

export function useFadeScale(config?: { initialScale?: number; duration?: number }) {
  const { initialScale = 0.8, duration = ANIMATION_DURATION.normal } = config ?? {};
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: ANIMATION_EASING.entrance,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        ...SPRING_CONFIGS.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, duration]);

  return { opacity, scale };
}
```

Export from `src/theme/hooks/index.ts`.

---

## Part E: Theme Colors

```typescript
// src/theme/colors.ts
export type CustomThemeMode = 'primary' | 'premium' | 'corporate';

const corporateColors: Colors = {
  background: '#F0F4F8',
  surface: '#FFFFFF',
  border: '#D2D6DB',
  text: '#111928',
  textSecondary: '#6B7280',
  primary: '#1C64F2',
  success: '#0E9F6E',
  warning: '#C27803',
  error: '#F05252',
  info: '#1C64F2',
  onPrimary: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onError: '#FFFFFF',
  onInfo: '#FFFFFF',
};

export const colors: Record<ThemeMode, Colors> = {
  // ... existing
  corporate: corporateColors,
} as const;
```

---

## Checklist

- [ ] All values use theme tokens — no hardcoded pixels or colors
- [ ] Responsive functions used for all size values (`wScale`, `hScale`, `fScale`)
- [ ] Style factory exported as `get{Component}Style()`
- [ ] New files exported from respective `index.ts`
- [ ] Animation hooks use `ANIMATION_DURATION`, `SPRING_CONFIGS`, `ANIMATION_EASING`
- [ ] `StyleSheet.create` used only for local/static styles (not reusable variants)
- [ ] Run `bun run lint`, `bun run typecheck`, and `bun run test`
