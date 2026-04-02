# Theme Rules

The theme system lives in `src/theme/` and provides design tokens, style factories, and animation hooks.

## Core Mandates

1. **Token-Based**: All visual values come from theme tokens (`spacing.sm`, `colors.primary`, `borderRadius.md`).
2. **Style Factories**: Component styles live in `src/theme/components/{Component}.styles.ts`, exported as `get{Component}Style()`.
3. **useTheme Hook**: Components access theme via `useTheme()` — never import color/spacing constants directly in components.
4. **Responsive**: Use `wScale`, `hScale`, `fScale` from `responsive.ts` — never hardcode pixel values in tokens.
5. **Theme Modes**: `light`, `dark`, `primary`, `premium`. Stored via Zustand + MMKV in `theme.storage.ts`.
6. **Shadows**: Platform-compatible — include both iOS `shadow*` props and Android `elevation`.

## File Structure

```
src/theme/
  index.ts                    # Re-exports everything + Theme interface + createTheme
  colors.ts                   # ThemeMode, Colors interface, color palettes
  spacing.ts                  # Spacing tokens (4px scale)
  typography.ts               # Typography variants (h1-h6, body, caption, button)
  borders.ts                  # BorderRadius tokens
  shadows.ts                  # Shadow definitions (light/dark variants)
  responsive.ts               # wScale, hScale, fScale, wp, hp, breakpoints
  animations.ts               # Duration, spring configs, easing presets
  common.ts                   # commonStyles (flex, center, etc.)
  providers/
    ThemeProvider.tsx          # Context + Zustand integration
    useTheme.ts               # useContext hook with error guard
    theme.storage.ts          # Zustand + MMKV persistence
  hooks/                      # Animation hooks (useFadeScale, useFadeSlide, etc.)
  components/                 # Style factories ({Component}.styles.ts)
```

## Golden Example: Style Factory

```typescript
// src/theme/components/Button.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { Colors, ThemeMode, colors } from '../colors';
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

export function getButtonStyle(props: ButtonStyleProps): { container: ViewStyle; text: TextStyle } {
  const themeColors = colors[props.mode ?? 'light'];
  // ... compute styles from tokens
  return { container: { ... }, text: { ... } };
}
```

## Golden Example: useTheme in Component

```typescript
const { colors, spacing, isDark, mode } = useTheme();
const styles = getButtonStyle({ mode, variant, size, disabled });
```
