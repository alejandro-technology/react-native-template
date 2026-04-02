---
name: create-theme-token
description: Create new theme tokens, style factories, or animation hooks in src/theme/. Load when adding colors, spacing, typography, border, shadow, or animation values.
license: MIT
compatibility: opencode
metadata:
  layer: theme
  workflow: scaffold
  output: src/theme/**
---

# Skill: Create Theme Token / Style Factory

Create new theme tokens, style factories, or animation hooks in `src/theme/`.

## When to Use

- Adding a new design token file (e.g., opacity, elevation scale)
- Creating a style factory for a new component
- Adding a new animation hook
- Extending an existing token file (new spacing value, new color)

## Part A: Create a Style Factory

Style factories live in `src/theme/components/{Component}.styles.ts`. They receive props (variant, size, mode, disabled) and return computed styles using theme tokens.

### Step 1: Create the Style Factory File

Create `src/theme/components/{Component}.styles.ts`:

```typescript
import { ViewStyle, TextStyle } from 'react-native';
import { Colors, ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';
import { borderRadius, BorderRadiusToken } from '../borders';
import { typography } from '../typography';
import { hScale } from '../responsive';

// 1. Define variant and size types
export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

// 2. Define props interface
interface CardStyleProps {
  variant?: CardVariant;
  size?: CardSize;
  mode?: ThemeMode;
  disabled?: boolean;
}

// 3. Helper: size styles using theme tokens
function getSizeStyles(size: CardSize) {
  switch (size) {
    case 'sm':
      return { padding: spacing.sm, minHeight: hScale(80) };
    case 'md':
      return { padding: spacing.md, minHeight: hScale(120) };
    case 'lg':
      return { padding: spacing.lg, minHeight: hScale(160) };
  }
}

// 4. Helper: variant styles using theme colors
function getVariantStyles(
  variant: CardVariant,
  themeColors: Colors,
): { container: ViewStyle } {
  switch (variant) {
    case 'elevated':
      return {
        container: {
          backgroundColor: themeColors.surface,
          borderWidth: 0,
        },
      };
    case 'outlined':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: themeColors.border,
        },
      };
    case 'filled':
      return {
        container: {
          backgroundColor: themeColors.surface,
          borderWidth: 0,
        },
      };
  }
}

// 5. Main exported factory function
export function getCardStyle({
  variant = 'elevated',
  size = 'md',
  mode = 'light',
  disabled = false,
}: CardStyleProps): {
  container: ViewStyle;
  title: TextStyle;
  body: TextStyle;
} {
  const themeColors = colors[mode];
  const sizeConfig = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, themeColors);

  return {
    container: {
      ...sizeConfig,
      borderRadius: borderRadius.lg,
      opacity: disabled ? 0.5 : 1,
      ...variantStyles.container,
    },
    title: {
      ...typography.h5,
      color: themeColors.text,
    },
    body: {
      ...typography.body,
      color: themeColors.textSecondary,
    },
  };
}
```

### Step 2: Export from index

Add to `src/theme/components/index.ts`:

```typescript
export * from './Card.styles';
```

### Step 3: Use in Component

```typescript
import { useTheme } from '@theme/index';
import { getCardStyle } from '@theme/components';

function Card({ variant = 'elevated', size = 'md', ...props }: CardProps) {
  const { mode } = useTheme();
  const styles = getCardStyle({ mode, variant, size });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.body}>{props.body}</Text>
    </View>
  );
}
```

## Part B: Create an Animation Hook

Animation hooks live in `src/theme/hooks/use{Name}.ts`. They use Animated API with tokens from `animations.ts`.

### Step 1: Create the Hook File

Create `src/theme/hooks/use{Name}.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  ANIMATION_DURATION,
  ANIMATION_EASING,
  SPRING_CONFIGS,
} from '../animations';

interface FadeScaleConfig {
  initialScale?: number;
  duration?: number;
  springConfig?: { friction: number; tension: number };
}

export function useFadeScale(config?: FadeScaleConfig) {
  const {
    initialScale = 0.8,
    duration = ANIMATION_DURATION.normal,
    springConfig = SPRING_CONFIGS.gentle,
  } = config ?? {};

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
        friction: springConfig.friction,
        tension: springConfig.tension,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, duration, springConfig.friction, springConfig.tension]);

  return { opacity, scale };
}
```

### Step 2: Export from index

Add to `src/theme/hooks/index.ts`:

```typescript
export * from './useFadeScale';
```

## Part C: Add a New Design Token

### Adding to an existing token file

Example: adding a new spacing value to `src/theme/spacing.ts`:

```typescript
export const spacing = {
  // ... existing tokens
  '4xl': wScale(80), // New token
} as const;
```

### Creating a new token file

1. Create `src/theme/{tokenName}.ts` with `as const` exports
2. Define the type: `export type TokenName = typeof tokenName;`
3. Add to the `Theme` interface in `src/theme/index.ts`
4. Re-export from `src/theme/index.ts`: `export * from './{tokenName}';`

## Part D: Add Theme Colors

To add a new theme mode, add a new `Colors` object in `src/theme/colors.ts`:

```typescript
// 1. Add to CustomThemeMode union
export type CustomThemeMode = 'primary' | 'premium' | 'corporate';

// 2. Define the color palette
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

// 3. Register in the colors record
export const colors: Record<ThemeMode, Colors> = {
  // ... existing themes
  corporate: corporateColors,
} as const;
```

## Checklist

- [ ] All values use theme tokens (spacing, colors, borderRadius) — no hardcoded pixels
- [ ] Responsive functions used for all size values (`wScale`, `hScale`, `fScale`)
- [ ] Style factory exported as `get{Component}Style()`
- [ ] New files exported from respective `index.ts`
- [ ] Animation hooks use `ANIMATION_DURATION`, `SPRING_CONFIGS`, `ANIMATION_EASING`
- [ ] Run `bun run lint && bun run typecheck && bun run test`
