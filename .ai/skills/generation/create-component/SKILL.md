---
name: create-component
description: Create new React Native components following project conventions. Use when creating UI components, form components, or layout components.
---

# Create Component

Create React Native components following this project's conventions.

## When to Use

- Creating new UI components
- Creating form components with react-hook-form integration
- Creating layout components

## Component Types

### Core Components (`src/components/core/`)

Base UI components without form integration.

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@components/core';
import { spacing } from '@theme/index';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
});
```

### Form Components (`src/components/form/`)

Components integrated with react-hook-form.

```typescript
import React from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import { TextInput as CoreTextInput } from '@components/core';

interface TextInputProps {
  control: Control<any>;
  name: string;
  label: string;
  error?: FieldError;
}

export function TextInput({ control, name, label, error }: TextInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <CoreTextInput
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}
```

## Checklist

1. Define interface for props with PascalCase: `ComponentNameProps`
2. Use named export: `export function ComponentName()`
3. Import theme utilities from `@theme/index`
4. Use `spacing` from theme for consistent padding/margin
5. Use `useTheme()` hook for colors that support dark mode
6. Create styles with `StyleSheet.create()` at bottom of file
7. Export from barrel file (`index.ts`) in component folder

## File Structure

```
src/components/
├── core/
│   ├── Button.tsx
│   ├── Text.tsx
│   ├── index.ts          # Barrel export
├── form/
│   ├── TextInput.tsx
│   ├── index.ts
└── layout/
    ├── RootLayout.tsx
    └── index.ts
```

## Import Order

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMutation } from '@tanstack/react-query';
// Component
import { Button } from '@components/core';
// Theme
import { useTheme, spacing } from '@theme/index';
// Types
import { SomeType } from './types';
```

Order: React → React Native → External libs → Internal aliases → Relative imports

---

# Project Specific (edit for other projects)

## Theme Configuration

- Theme location: `src/theme/`
- Hook: `useTheme()` from `@theme/index`
- Tokens: `colors`, `spacing`, `typography`, `borders`, `shadows`

## Component Aliases

- `@components/core` - Base UI components
- `@components/form` - Form-integrated components
- `@components/layout` - Layout components
