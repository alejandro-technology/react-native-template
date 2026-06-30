---
trigger: model_decision
---

# Theme & Styles Rules

All visual values come from the theme in `src/theme/` — tokens, style factories,
and animation presets. Components consume the theme; they never hardcode colors,
spacing, or pixel values. Local layout uses `StyleSheet.create`; reusable visual
variants live in theme style factories.

## Core Mandates

1. **Token-based.** Every visual value comes from a token (`colors.primary`,
   `spacing.md`, `borderRadius.md`, typography variants). No literal colors or
   magic numbers in components.
2. **Theme access.** Use `useTheme()` for mode-dependent values (`colors`,
   `shadows`, `mode`, `isDark`, `toggleTheme`); use `getTheme(mode)` outside
   React; import static tokens directly when the full theme object is not needed.
3. **Style factories for variants.** Reusable component styling lives in
   `src/theme/components/{Component}.styles.ts`, exported as `get{Component}Style()`.
4. **`StyleSheet.create` for local styles.** Use it for screen/layout and
   feature-specific styling; keep stable rules static and merge theme-driven
   values inline at render.
5. **Responsive helpers.** Use `wScale` / `hScale` / `fScale` (`responsive.ts`) —
   never hardcode pixel dimensions.
6. **Theme modes.** `light`, `dark`, `primary`, `premium`, persisted via
   Zustand + MMKV in `theme.storage.ts`.
7. **Animations.** Use React Native `Animated` with `ANIMATION_DURATION`,
   `ANIMATION_EASING`, and `SPRING_CONFIGS` from `animations.ts` — not Reanimated.
8. **Shadows.** Platform-compatible: iOS `shadow*` props plus Android `elevation`.

## File Structure

```
src/theme/
  index.ts          # tokens, helpers, Theme interface, getTheme
  colors.ts spacing.ts typography.ts borders.ts shadows.ts
  responsive.ts     # wScale, hScale, fScale, wp, hp, breakpoints
  animations.ts common.ts
  providers/        # ThemeProvider, useTheme, theme.storage (Zustand + MMKV)
  hooks/            # animation hooks (useFadeScale, useFadeSlide, …)
  components/       # style factories: {Component}.styles.ts
```

## Do Not

- Do not hardcode color values or pixel magic numbers in components.
- Do not put reusable variant styling in a component's local `StyleSheet` —
  promote it to a theme style factory.
- Do not introduce Reanimated; use the theme `Animated` presets.
- Do not ship shadows without both the iOS and Android variants.

## See Also

- Components that consume tokens: [`components.md`](./components.md)
- Theme persistence model: [`state-management.md`](./state-management.md)
