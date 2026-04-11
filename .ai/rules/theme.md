# Theme Rules

The theme system lives in `src/theme/` and provides design tokens, style factories, and animation hooks.

## Core Mandates

1. **Token-Based**: All visual values come from theme tokens (`spacing.sm`, `colors.primary`, `borderRadius.md`).
2. **Style Factories**: Reusable component styles live in `src/theme/components/{Component}.styles.ts`, exported as `get{Component}Style()`.
3. **Theme Access**: Use `useTheme()` when you need mode-dependent values such as `colors`, `shadows`, `mode`, `isDark`, or `toggleTheme`. It is also valid to import static tokens directly when the component does not need the full theme object.
4. **Import Surface**: Prefer `@theme/index` for common imports. Deep imports such as `@theme/borders` or `@theme/components/Button.styles` are also acceptable when they keep the dependency explicit and avoid pulling unrelated theme utilities.
5. **Responsive**: Use `wScale`, `hScale`, `fScale` from `responsive.ts` — never hardcode pixel values in tokens.
6. **Theme Modes**: `light`, `dark`, `primary`, `premium`. Stored via Zustand + MMKV in `theme.storage.ts`.
7. **Shadows**: Platform-compatible — include both iOS `shadow*` props and Android `elevation`.

## File Structure

```
src/theme/
  index.ts                    # Re-exports tokens, helpers, Theme interface, and getTheme
  colors.ts                   # ThemeMode, Colors interface, color palettes
  spacing.ts                  # Spacing tokens (4px scale)
  typography.ts               # Typography variants (h1-h6, body, caption, button)
  borders.ts                  # BorderRadius tokens
  shadows.ts                  # Shadow definitions (light/dark variants)
  responsive.ts               # wScale, hScale, fScale, wp, hp, breakpoints
  animations.ts               # Duration, spring configs, easing presets
  common.ts                   # commonStyles (flex, center, etc.)
  providers/
    ThemeProvider.tsx         # Context + Zustand integration
    useTheme.ts               # useContext hook with error guard
    theme.storage.ts          # Zustand + MMKV persistence
  hooks/                      # Animation hooks (useFadeScale, useFadeSlide, etc.)
  components/                 # Style factories ({Component}.styles.ts)
```

## Golden Example: Style Factory

```typescript
// src/theme/components/Button.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';
import { borderRadius } from '../borders';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  mode?: ThemeMode;
  disabled?: boolean;
}

export function getButtonStyle(
  props: ButtonStyleProps,
): { container: ViewStyle; text: TextStyle } {
  const themeColors = colors[props.mode ?? 'light'];
  return { container: { ... }, text: { ... } };
}
```

## Golden Example: useTheme in Component

```typescript
const { colors, mode, isDark } = useTheme();
const styles = getButtonStyle({ mode, variant, size, disabled });
```

## Golden Example: Static Token Import

```typescript
import { spacing } from '@theme/index';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
});
```

## Helpers

- Use `getTheme(mode)` when you need to derive theme values outside React components or hooks.
- Use `useTheme()` inside React components when rendering depends on the active theme mode.
