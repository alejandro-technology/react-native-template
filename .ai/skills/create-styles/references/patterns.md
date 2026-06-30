# Style Patterns — Full Reference

> Load this file when you need a complete example of a specific style pattern.
> Patterns: local-stylesheet, base-plus-factory, responsive-helpers, animated, static-separation, when-to-promote.

## Pattern 1: Local StyleSheet + useTheme

Use this pattern for screens, layout wrappers, and feature components.

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { Text } from '@components/core';
// Theme
import { spacing, useTheme } from '@theme/index';

export function ProductDetailSection() {
  const {
    colors: { surface, border, textSecondary },
  } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: surface, borderColor: border },
      ]}
    >
      <Text variant="h3">Detalle</Text>
      <Text style={{ color: textSecondary }}>Contenido</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: spacing.sm,
  },
});
```

### Why this pattern fits the repo

- `Header.tsx` keeps spacing/layout in `StyleSheet.create` and injects theme colors inline
- `ProductDetail.tsx` uses `StyleSheet.create` for screen-specific spacing and button margins
- `RootLayout.tsx` keeps the static container in `StyleSheet.create` and composes animated/theme values in render

## Pattern 2: Base StyleSheet + Theme Style Factory

Use this when a reusable core component already has a theme factory, but still needs a few fixed helper styles.

Repo examples:

- `src/components/core/Button.tsx`
- `src/components/core/TextInput.tsx`

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing, useTheme } from '@theme/index';
import { getButtonStyle } from '@theme/components/Button.styles';

export function ButtonWithIcons() {
  const theme = useTheme();
  const styles = getButtonStyle({ mode: theme.mode, variant: 'primary' });

  return (
    <View style={styles.container}>
      <View style={baseStyles.leftIcon} />
    </View>
  );
}

const baseStyles = StyleSheet.create({
  leftIcon: {
    marginRight: spacing.sm,
  },
});
```

### Rule of thumb

- Variant/state/theme math: put it in the theme style factory
- Tiny helper spacing/layout: keep it in local `StyleSheet.create`

## Pattern 3: Use Existing Design Utilities

Before adding a new value, check these utilities first:

### `spacing`

Use `spacing` for margin, padding, gaps, and rhythm.

```typescript
const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
});
```

Do not do this unless there is a clear exception:

```typescript
padding: 13,
marginBottom: 22,
```

### `commonStyles`

Use shared layout helpers instead of rewriting them.

```typescript
import { commonStyles } from '@theme/index';

<View style={commonStyles.flex} />
<View style={commonStyles.center} />
```

Prefer composition:

```typescript
<View style={[commonStyles.flexRow, styles.actions]} />
```

### `responsive.ts`

Use responsive helpers for non-tokenized dimensions.

```typescript
import { hScale, wScale, fScale, moderateScale, wp, hp } from '@theme/index';

const styles = StyleSheet.create({
  avatar: {
    width: wScale(56),
    height: wScale(56),
    borderRadius: wScale(28),
  },
  hero: {
    minHeight: hp('30%'),
  },
  icon: {
    width: moderateScale(18),
  },
  title: {
    fontSize: fScale(18),
  },
});
```

Use these guidelines:

- `spacing.*` for spacing rhythm
- `wScale` / `hScale` for dimensions
- `fScale` for font-like numeric values outside typography tokens
- `wp` / `hp` for percentage-based layouts
- `moderateScale` for values that should scale softly

## Pattern 4: Animated Without Reanimated

Use the built-in React Native `Animated` API together with the tokens from `src/theme/animations.ts`.

```typescript
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { ANIMATION_DURATION, ANIMATION_EASING, spacing } from '@theme/index';

export function FadeInCard() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(spacing.md)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION.normal,
        easing: ANIMATION_EASING.entrance,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION.normal,
        easing: ANIMATION_EASING.entrance,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[styles.card, { opacity, transform: [{ translateY }] }]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
});
```

### Animation rules

- Do not introduce Reanimated
- Reuse `ANIMATION_DURATION`, `ANIMATION_EASING`, and `SPRING_CONFIGS`
- Use `useNativeDriver: true` when the animated properties support it
- If the animation becomes reusable, move it to `src/theme/hooks/`

## Pattern 5: Keep Static Styles Static

Good:

```typescript
const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
  },
});

<View
  style={[styles.root, { backgroundColor: surface, borderColor: border }]}
/>;
```

Avoid putting everything inline:

```typescript
<View
  style={{
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    backgroundColor: surface,
    borderColor: border,
  }}
/>
```

## Pattern 6: When to Promote to Theme Style Factory

Move styles out of the component and into `src/theme/components/{Name}.styles.ts` if any of these become true:

- The component needs `variant`, `size`, `state`, or `mode`
- The same visual logic is reused in more than one file
- Colors, border radius, and typography are all derived from theme state
- The component belongs to `src/components/core` or `src/components/form`

