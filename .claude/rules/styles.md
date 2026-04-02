# Styles Rules

Use `StyleSheet.create` for screen-specific or component-local layout styles. Use theme style factories in `src/theme/components/` for reusable visual variants shared across components.

## Core Mandates

1. **Choose the Right Tool**: Use `StyleSheet.create` for local, one-off styles in screens, layout components, and feature-specific UI. Use theme style factories for reusable component APIs (`variant`, `size`, `state`).
2. **Theme First**: Read colors and dynamic theme values from `useTheme()`. Do not hardcode color values inside components.
3. **Use Existing Utilities**: Prefer `spacing`, `commonStyles`, `responsive` helpers (`wScale`, `hScale`, `fScale`, `moderateScale`, `wp`, `hp`) and `animations.ts` constants before creating new values.
4. **No Reanimated**: Use React Native `Animated` with `ANIMATION_DURATION`, `ANIMATION_EASING`, and `SPRING_CONFIGS` from `src/theme/animations.ts`.
5. **Keep Static Styles Static**: Put stable layout rules in `StyleSheet.create`; merge theme-driven values with inline style objects in the render.
6. **Avoid Pixel Magic Numbers**: Spacing uses `spacing.*`; dimensions should use responsive helpers when they are not tokenized.

## When to Use StyleSheet.create

- Screen/layout composition (`padding`, `gap`, `flexDirection`, `alignItems`)
- Small fixed helpers (`leftIcon`, `rightIcon`, separators, wrappers)
- Feature-specific UI that will not become a reusable core primitive

## When Not to Use StyleSheet.create Alone

- Reusable component variants like Button, TextInput, Card, Badge
- Theme-driven visual systems that belong in `src/theme/components/*.styles.ts`
- Animation presets that should live in theme hooks

## Golden Example: Local Styles + Theme

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@components/core';
import { spacing, useTheme } from '@theme/index';

export function ProductDetailSection() {
  const {
    colors: { surface, border },
  } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: surface, borderColor: border },
      ]}
    >
      <Text variant="h3">Detalle</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
  },
});
```

## Golden Example: Animated Without Reanimated

```typescript
const opacity = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(opacity, {
    toValue: 1,
    duration: ANIMATION_DURATION.normal,
    easing: ANIMATION_EASING.entrance,
    useNativeDriver: true,
  }).start();
}, [opacity]);
```
