---
trigger: model_decision
---

# Components Rules

Shared UI lives in `src/components/` and splits into three families with strict
roles: **core** (presentational primitives), **form** (`react-hook-form`
wrappers over core), and **layout** (screen scaffolding). Components render and
delegate — they never own business logic or fetch data.

## Core Mandates

1. **Core — presentational primitives** (`@components/core`). Stateless, theme
   driven, no data fetching and no business rules. Props extend the native prop
   type (e.g. `Omit<PressableProps, 'style'>`). Visual variants come from a theme
   style factory, not inline styling.
2. **Form — `react-hook-form` wrappers** (`@components/form`). Each wraps its
   core counterpart through `useController({ name, control })` and forwards
   `fieldState.error` to the core component. UI never reads form state directly.
3. **Layout — screen scaffolding** (`@components/layout`). Composition pieces
   (`RootLayout`, `Header`, `Toolbar`) and async-state views (`LoadingState`,
   `ErrorState`, `EmptyState`, `OfflineBanner`, `DeleteConfirmationSheet`).
   Local styles use `StyleSheet.create`.
4. **One export surface.** Every component is exported from its family's
   `index.ts`; consumers import from `@components/{core|form|layout}`.
5. **Type by composition.** Derive props with `Omit` / `Pick` / `Partial` over
   native or core prop types — do not redeclare them.

## Inventory

```
src/components/
  core/    # AnimatedPressable, Avatar, Badge, Button, Card, Checkbox,
           # DatePicker, Icon, ImagePicker, Modal, Select, Text, TextInput, Toast
  form/    # Checkbox, DatePicker, ImagePicker, Select, TextInput
  layout/  # DeleteConfirmationSheet, EmptyState, ErrorBoundary, ErrorState,
           # Header, ItemSeparatorComponent, LoadingState, OfflineBanner,
           # RootLayout, Toolbar
```

Reusable visual variants are defined as style factories in
`src/theme/components/{Component}.styles.ts`.

## Do Not

- Do not put business logic, data fetching, or React Query/Zustand reads inside
  core or form components.
- Do not hardcode colors or spacing — pull from theme tokens.
- Do not build a new primitive when an inventory component already covers it.
- Do not bypass `@components/form` by wiring `useController` ad-hoc inside a
  screen.

## See Also

- Form flow and screens: [`views-navigation.md`](./views-navigation.md)
- Tokens and style factories: [`theme-styles.md`](./theme-styles.md)
