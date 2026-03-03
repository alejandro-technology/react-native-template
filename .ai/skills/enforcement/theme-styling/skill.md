---
name: theme-styling
category: enforcement
layer: ui
priority: high
tags:
  - theme-system
  - design-tokens
  - style-factories
  - animations
  - dark-mode
triggers:
  - 'Styling components'
  - 'Creating theme-aware UI'
  - 'Adding animations'
description: Guide the 5-mode theme system, design tokens, component style factories, and animation hooks. Use when styling components, creating theme-aware UI, or adding animations.
---

# Theme & Styling Skill

Enforces the design token system, theme-aware component styling, and animation patterns.

## When to Use

- Styling new components
- Creating theme-aware UI
- Adding animations or transitions
- Reviewing visual consistency
- Adding new design tokens

## Theme System Overview

5 theme modes, all accessible via `useTheme()`:

| Mode        | Background | Primary | Use Case       |
| ----------- | ---------- | ------- | -------------- |
| `light`     | #f6f6f8    | #3B82F6 | Default light  |
| `dark`      | #0F172A    | #60A5FA | Dark mode      |
| `primary`   | #EFF6FF    | #2563EB | Corporate blue |
| `secondary` | #F0FDF4    | #16A34A | Nature green   |
| `premium`   | #FAF5FF    | #7C3AED | Elegant purple |

## Design Tokens

### Spacing

```typescript
import { spacing } from '@theme/index';

spacing.xs; // 4px  - Tight gaps
spacing.sm; // 8px  - Small padding
spacing.md; // 12px - Default gaps
spacing.base; // 16px - Standard padding
spacing.lg; // 24px - Section padding
spacing.xl; // 32px - Large sections
spacing['2xl']; // 48px
spacing['3xl']; // 64px
```

### Typography Variants

```typescript
import { Text } from '@components/core';

<Text variant="h1">32px bold - Hero sections</Text>
<Text variant="h2">28px bold - Main headings</Text>
<Text variant="h3">24px semibold - Subheadings</Text>
<Text variant="body">16px regular - Content</Text>
<Text variant="bodySmall">14px regular - Secondary</Text>
<Text variant="caption">12px regular - Labels</Text>
<Text variant="button">14px semibold uppercase</Text>
```

### Color Variants

```typescript
<Text color="text">Default text</Text>
<Text color="textSecondary">Muted text</Text>
<Text color="primary">Brand color</Text>
<Text color="error">Error red</Text>
<Text color="success">Success green</Text>
```

### Border Radius

```typescript
import { borderRadius } from '@theme/index';

borderRadius.none; // 0
borderRadius.sm; // 4px
borderRadius.md; // 8px
borderRadius.lg; // 12px
borderRadius.xl; // 16px
borderRadius.full; // 9999px (circles)
```

## Component Style Factories

Styles live in `src/theme/components/{Component}.styles.ts` as factory functions:

```typescript
// src/theme/components/Button.styles.ts
export function getButtonStyle(
  mode: ThemeMode,
  variant: 'primary' | 'secondary' | 'outlined' | 'ghost',
  size: 'sm' | 'md' | 'lg',
  disabled: boolean,
  fullWidth: boolean,
  borderRadius: BorderRadiusToken,
) {
  const colors = getColors(mode);
  // Returns { container: ViewStyle, text: TextStyle }
}
```

### When to Create Style Factories

- Component has theme-dependent colors
- Component has multiple variants or sizes
- Style logic is complex (>15 lines)

### When to Use Inline StyleSheet

- Simple, static styles
- No theme dependency
- Module-specific layout (not reusable)

```typescript
// Simple layout - inline StyleSheet is fine
const styles = StyleSheet.create({
  container: { gap: spacing.md },
  button: { marginTop: spacing.md },
});
```

## Animation System

### Animation Duration Constants

```typescript
import { ANIMATION_DURATION } from '@theme/index';

ANIMATION_DURATION.fast; // 200ms - Quick feedback
ANIMATION_DURATION.normal; // 400ms - Standard transitions
ANIMATION_DURATION.slow; // 600ms - Emphasis animations
ANIMATION_DURATION.slowest; // 1000ms - Dramatic entrances
```

### Focus-Based Animation Hooks

```typescript
import { useFocusFadeIn } from '@theme/hooks';
import { useFocusSlideIn } from '@theme/hooks';

// Fade in when screen gains focus
const { animatedStyle } = useFocusFadeIn({
  duration: ANIMATION_DURATION.slow,
  delay: 0,
  offset: 20,
});

// Slide in from direction when screen gains focus
const { animatedStyle } = useFocusSlideIn({
  direction: 'right',
  duration: ANIMATION_DURATION.slow,
});
```

### Animation Usage Convention

| Screen Type    | Animation                             | Duration |
| -------------- | ------------------------------------- | -------- |
| Detail content | `useFocusFadeIn`                      | `slow`   |
| Detail buttons | `useFocusFadeIn` + delay 300          | `slow`   |
| Form content   | `useFocusSlideIn('right')`            | `slow`   |
| List items     | `useFocusFadeIn` + index \* 100 delay | `normal` |

## Validation Rules

| Rule | Description                                                              |
| ---- | ------------------------------------------------------------------------ |
| R1   | Use `spacing` tokens, never raw pixel values                             |
| R2   | Use `Text` component with `variant` prop, never raw `<RNText>`           |
| R3   | Use `useTheme()` for dynamic colors, not hardcoded hex                   |
| R4   | Style factories in `theme/components/`, not in component files           |
| R5   | `StyleSheet.create()` at bottom of file, not inline                      |
| R6   | Animation durations from `ANIMATION_DURATION` constants                  |
| R7   | Screen entrance animations use focus-based hooks                         |
| R8   | List item animations stagger by `index * 100` delay                      |
| R9   | Buttons use `variant` prop (`primary`, `secondary`, `outlined`, `ghost`) |
| R10  | Cards use `variant` prop (`elevated`, `outlined`)                        |

## Anti-Patterns

```typescript
// WRONG: Hardcoded colors
<View style={{ backgroundColor: '#3B82F6' }}>

// CORRECT: Theme-aware
const { colors } = useTheme();
<View style={{ backgroundColor: colors.primary }}>

// WRONG: Raw pixel values
<View style={{ padding: 16, marginTop: 24 }}>

// CORRECT: Spacing tokens
<View style={{ padding: spacing.base, marginTop: spacing.lg }}>

// WRONG: Hardcoded font sizes
<RNText style={{ fontSize: 24, fontWeight: '600' }}>

// CORRECT: Typography variant
<Text variant="h3">Title</Text>

// WRONG: Animation duration as magic number
Animated.timing(opacity, { toValue: 1, duration: 600 })

// CORRECT: Duration constant
Animated.timing(opacity, { toValue: 1, duration: ANIMATION_DURATION.slow })
```
