---
name: components-gallery
description: >
  Complete usage gallery for every component in src/components/ (core, form, layout)
  with all props, variants, and real code examples. Load when implementing UI,
  choosing components, checking available props/variants, or composing screens.
metadata:
  version: "1.0"
  category: ui-patterns

---

## Component Families

This project has three component families. Load the relevant reference file for full props, variants, and examples.

### Core Components (`@components/core`)
Presentational, theme-driven primitives. No business logic.

Available: `AnimatedPressable`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `DatePicker`, `Icon`, `ImagePicker`, `Modal`, `Select`, `Text`, `TextInput`, `Toast`

→ Read [references/core-components.md](references/core-components.md) for full props, variants, and usage examples.

### Form Components (`@components/form`)
Thin `react-hook-form` wrappers over core components via `useController`.

Available: `TextInput`, `Checkbox`, `Select`, `DatePicker`, `ImagePicker`

→ Read [references/form-components.md](references/form-components.md) for props and usage.

### Layout Components (`@components/layout`)
Screen scaffolding: `RootLayout`, `Header`, `Toolbar`, `LoadingState`, `ErrorState`, `EmptyState`, `ErrorBoundary`, `DeleteConfirmationSheet`, `OfflineBanner`, `ItemSeparatorComponent`

→ Read [references/layout-components.md](references/layout-components.md) for props and usage.

## Screen Patterns

For complete screen composition examples (list screen, detail screen, form screen):
→ Read [references/screen-patterns.md](references/screen-patterns.md)

## Import Aliases

```typescript
import { Button, Text, TextInput } from '@components/core';
import { TextInput as FormTextInput } from '@components/form';
import { RootLayout, LoadingState, ErrorState, EmptyState } from '@components/layout';
```

## Gotchas

- Form components wrap core components — they add `control` and `name` props via `useController`
- Always use `@components/core` alias, never relative paths across modules
- `RootLayout` composes `Header` + `GestureHandler` + `SafeAreaView` — never nest another `SafeAreaView` inside
- `LoadingState`, `ErrorState`, `EmptyState` are the ONLY way to show async states — never use raw `ActivityIndicator`
- Toast is controlled via `useAppStorage(s => s.toast.show)` — never render Toast directly
