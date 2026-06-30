---
name: create-styles
description: Create component-local styles with StyleSheet.create integrating the theme system. Load when adding or editing *.styles.ts files or co-located component styles.
license: MIT
compatibility: opencode
metadata:
  version: "1.0"
  category: theming-styling
  layer: ui
  workflow: scaffold
  output: src/components/**/*.tsx, src/theme/components/*.styles.ts
---

# Skill: Create Styles

Create component-local styles with `StyleSheet.create` while integrating the existing theme system.

## When to Use

- A screen or feature component needs custom layout styles
- A component needs a few local helper styles (`wrapper`, `row`, `icon`, `content`)
- You need theme-aware colors or spacing, but the styles are not reusable enough for `src/theme/components/*.styles.ts`
- You need `Animated` transitions without Reanimated

## Decision Rule

Choose between these two approaches first:

### Use `StyleSheet.create` when

- The styles are local to one file
- The styling is mostly layout/composition
- There is no public `variant`/`size` API to support
- The component already exists in a feature or layout layer

Examples from this repo:

- `src/components/layout/Header.tsx`
- `src/components/layout/RootLayout.tsx`
- `src/modules/products/ui/components/ProductDetail.tsx`
- `src/components/core/Button.tsx` for small local helpers like icon spacing

### Use a theme style factory when

- The component is reusable across modules
- It has variants, sizes, states, or theme-driven visual rules
- It belongs in `src/components/core` or `src/components/form`

Examples from this repo:

- `src/theme/components/Button.styles.ts`
- `src/theme/components/TextInput.styles.ts`
- `src/theme/components/Card.styles.ts`

## Style Patterns
Available patterns: local-stylesheet, base-plus-factory, responsive-helpers, animated, static-separation, when-to-promote.
→ See [references/patterns.md](references/patterns.md) for full code.

## Checklist

- [ ] `StyleSheet.create` used only for local/static styles
- [ ] Theme colors come from `useTheme()`
- [ ] Spacing uses `spacing.*`
- [ ] Layout helpers reuse `commonStyles` when applicable
- [ ] Dimensions use `responsive.ts` helpers instead of magic numbers
- [ ] Animations use RN `Animated` + `src/theme/animations.ts`
- [ ] Reusable variant/state logic lives in `src/theme/components/*.styles.ts`
- [ ] Run `bun run lint`, `bun run typecheck`, and `bun run test`
