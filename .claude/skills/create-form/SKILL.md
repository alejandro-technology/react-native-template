---
name: create-form
description: Create form components with react-hook-form and Zod validation. Use when creating complex forms with multiple fields and validation.
---

# Create Form

Create form components following this project's conventions.

## When to Use

- Creating complex forms (SignUpForm, ProfileForm, CheckoutForm)
- Forms that need validation with Zod
- Multi-field form sections
- Forms that integrate with React Query mutations

## Form Pattern

### Form Component

```typescript
// src/modules/{feature}/ui/components/{feature}/{Feature}Form.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextInput } from '@components/form';
import { useCreate{Feature}Mutation } from '../../application/{feature}.mutations';
import { {feature}Schema, {Feature}FormData } from '../../domain/{feature}.scheme';
import { spacing } from '@theme/index';
import { create{Feature}PayloadAdapter } from '../../domain/{feature}.adapter';

export function {Feature}Form() {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<{Feature}FormData>({
    resolver: zodResolver({feature}Schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useCreate{Feature}Mutation();

  const onSubmit = (data: {Feature}FormData) => {
    const payload = create{Feature}PayloadAdapter(data);
    mutation.mutate(payload, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        control={control}
        name="email"
        label="Email"
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        control={control}
        name="password"
        label="Contraseña"
        error={errors.password}
        secureTextEntry
      />
      <Button
        title="Guardar"
        onPress={handleSubmit(onSubmit)}
        loading={mutation.isPending}
        disabled={mutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
```

### Zod Schema

```typescript
// src/modules/{feature}/domain/{feature}.scheme.ts
import z from 'zod';

export const {feature}Schema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type {Feature}FormData = z.infer<typeof {feature}Schema>;
```

### Adapter

```typescript
// src/modules/{feature}/domain/{feature}.adapter.ts
import { {Feature}FormData } from './{feature}.scheme';
import { Create{Feature}Payload } from './{feature}.model';

export function create{Feature}PayloadAdapter(
  form: {Feature}FormData,
): Create{Feature}Payload {
  return {
    email: form.email,
    password: form.password,
  };
}
```

## Using in View

```typescript
// src/modules/{feature}/ui/{Feature}View.tsx
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { {Feature}Form } from './components/{feature}/{Feature}Form';
import { spacing } from '@theme/index';

export default function {Feature}View() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <{Feature}Form />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
});
```

## Checklist

1. Create Zod schema in `domain/{feature}.scheme.ts`
2. Create adapter in `domain/{feature}.adapter.ts`
3. Use `useForm` hook with `zodResolver`
4. Use form components from `@components/form`
5. Handle loading and error states from mutation
6. Call `reset()` on success if needed
7. Use Spanish validation messages
8. Place form in `ui/components/{feature}/`
9. Add proper spacing with `spacing` from theme

## File Structure

```
src/modules/{feature}/
├── domain/
│   ├── {feature}.model.ts       # Payload/Response types
│   ├── {feature}.scheme.ts      # Zod schema + inferred type
│   └── {feature}.adapter.ts     # Form to payload adapter
├── application/
│   └── {feature}.mutations.ts   # React Query mutation
└── ui/
    └── components/
        └── {feature}/
            ├── {Feature}Form.tsx
            └── index.ts
```

## Validation Messages (Spanish)

Always use Spanish for validation messages:

- `'El campo es requerido'`
- `'Email inválido'`
- `'Mínimo {min} caracteres'`
- `'El valor debe ser un número'`

## Best Practices

- Use `handleSubmit` wrapper for form submission
- Always disable button when mutation is pending
- Show loading state in button
- Reset form on successful submission
- Handle errors appropriately (toast, alert)

---

# Project Specific (edit for other projects)

## Form Stack

- Form library: react-hook-form
- Validation: @hookform/resolvers/zod
- Form components: `@components/form`

## Validation Messages

Use Spanish for validation messages:
- `'El campo es requerido'`
- `'Email inválido'`
- `'Mínimo {min} caracteres'`
- `'El valor debe ser un número'`
