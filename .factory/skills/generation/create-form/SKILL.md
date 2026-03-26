---
name: create-form
category: generation
layer: ui
priority: high
last_updated: 2026-03-25
tags:
  - react-hook-form
  - yup
  - form-validation
  - form-components
triggers:
  - 'Creating forms'
  - 'Adding validation'
description: Create form components with react-hook-form and Yup validation. Generates Yup schema with Spanish messages, FormData type, form component with control prop pattern, and form-to-payload adapter.
---

# Create Form

Create form components following this project's conventions.

## When to Use

- Creating complex forms (ProductForm, UserForm, ProfileForm)
- Forms that need validation with Yup
- Multi-field form sections
- Forms that integrate with React Query mutations

## Form Pattern

### 1. Yup Schema (`domain/{feature}.scheme.ts`)

```typescript
// src/modules/{feature}/domain/{feature}.scheme.ts
import * as yup from 'yup';
import type { InferType } from 'yup';

export const {feature}Schema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .max(100, 'El nombre debe tener maximo 100 caracteres'),
  description: yup
    .string()
    .max(500, 'La descripcion debe tener maximo 500 caracteres')
    .defined(),
  price: yup
    .number()
    .transform((value: number, originalValue: unknown) =>
      originalValue === '' || originalValue === null ? NaN : value,
    )
    .typeError('El precio debe ser mayor a 0')
    .min(1, 'El precio debe ser mayor a 0')
    .required('El precio debe ser mayor a 0'),
});

export type {Feature}FormData = InferType<typeof {feature}Schema>;
```

**Key rules:**
- Import `InferType` as type: `import type { InferType } from 'yup'`
- Use `.defined()` for optional strings that should still be present
- Use `.transform()` for number fields to handle empty string inputs
- All validation messages in Spanish

### 2. Form Component (`ui/components/{Feature}Form.tsx`)

```typescript
// src/modules/{feature}/ui/components/{Feature}Form.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
// Components
import { Button } from '@components/core';
import { TextInput } from '@components/form';
// Theme
import { spacing } from '@theme/index';
// Domain
import type { {Feature}Entity } from '../../domain/{feature}.model';
import { {feature}Schema, {Feature}FormData } from '../../domain/{feature}.scheme';

interface {Feature}FormProps {
  onSubmit: (data: {Feature}FormData) => void;
  isLoading?: boolean;
  initialData?: {Feature}Entity;
}

export function {Feature}Form({
  onSubmit,
  isLoading = false,
  initialData,
}: {Feature}FormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{Feature}FormData>({
    resolver: yupResolver({feature}Schema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        control={control}
        name="name"
        label="Nombre"
        placeholder="Ingresa el nombre"
        error={errors.name?.message}
      />

      <TextInput
        control={control}
        name="description"
        label="Descripcion"
        placeholder="Ingresa la descripcion (opcional)"
        error={errors.description?.message}
        multiline
        numberOfLines={3}
      />

      <TextInput
        control={control}
        name="price"
        label="Precio"
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.price?.message}
      />

      <Button
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        style={styles.button}
      >
        {initialData ? 'Actualizar' : 'Crear'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
});
```

**Key rules:**
- `Button` from `@components/core` (NOT from `@components/form`)
- `TextInput` from `@components/form` (form wrapper with `control` prop)
- Pass `control` to form TextInput (uses `useController` internally)
- Pass `error={errors.field?.message}` for error display
- Accept `initialData` for edit mode
- Accept `onSubmit` callback — parent view handles mutation logic
- Use children for button text (not `title` prop)

### 3. Form View (`ui/{Feature}FormView.tsx`)

```typescript
// src/modules/{feature}/ui/{Feature}FormView.tsx
import React from 'react';
import { Animated } from 'react-native';
// Components
import { RootLayout } from '@components/layout';
import { {Feature}Form } from './components/{Feature}Form';
// Application
import {
  use{Feature}Create,
  use{Feature}Update,
} from '../application/{feature}.mutations';
// Domain
import type { {Feature}FormData } from '../domain/{feature}.scheme';
// Navigation
import { {Feature}sRoutes, {Feature}sScreenProps } from '@navigation/routes';

export function {Feature}FormView({
  route: { params },
  navigation: { goBack },
}: {Feature}sScreenProps<{Feature}sRoutes.{Feature}Form>) {
  const { mutateAsync: createItem, isPending: isCreating } = use{Feature}Create();
  const { mutateAsync: updateItem, isPending: isUpdating } = use{Feature}Update();

  const isLoading = isCreating || isUpdating;
  const existingItem = params?.{feature};
  const isEditing = !!existingItem;

  function handleSubmit(form: {Feature}FormData) {
    if (isEditing) {
      updateItem({ id: existingItem.id, form });
    } else {
      createItem(form);
    }
    goBack();
  }

  return (
    <RootLayout
      scroll
      padding="lg"
      title={isEditing ? 'Editar {Feature}' : 'Crear {Feature}'}
    >
      <{Feature}Form
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={existingItem}
      />
    </RootLayout>
  );
}
```

**Key rule**: The FormView passes `FormData` directly to the mutation. The adapter (`{feature}FormToPayloadAdapter`) is called inside the mutation's `mutationFn` in the application layer, NOT in the UI layer.

### 4. Adapter (`domain/{feature}.adapter.ts`)

```typescript
// src/modules/{feature}/domain/{feature}.adapter.ts
import { Create{Feature}Payload } from './{feature}.model';
import type { {Feature}FormData } from './{feature}.scheme';

export function {feature}FormToPayloadAdapter(
  form: {Feature}FormData,
): Create{Feature}Payload {
  return {
    name: form.name,
    description: form.description,
    price: form.price,
  };
}
```

## File Structure

```
src/modules/{feature}/
├── domain/
│   ├── {feature}.model.ts       # Entity + Payload types
│   ├── {feature}.scheme.ts      # Yup schema + inferred FormData type
│   └── {feature}.adapter.ts     # Form to payload adapter
├── application/
│   └── {feature}.mutations.ts   # React Query mutations
└── ui/
    ├── {Feature}FormView.tsx     # Form view (handles navigation + mutation)
    └── components/
        └── {Feature}Form.tsx     # Reusable form component
```

## Validation Messages (Spanish)

Always use Spanish for validation messages:

- `'El nombre es requerido'`
- `'Email invalido'`
- `'La contrasena debe tener al menos 8 caracteres'`
- `'El precio debe ser mayor a 0'`
- `'Maximo {n} caracteres'`

## Checklist

1. Create Yup schema in `domain/{feature}.scheme.ts`
2. Export `{Feature}FormData` as `InferType<typeof schema>`
3. Create adapter in `domain/{feature}.adapter.ts`
4. Create form component in `ui/components/{Feature}Form.tsx`
5. Use `control` from `useForm` passed to form `TextInput` components
6. Import `Button` from `@components/core` (not form)
7. Import `TextInput` from `@components/form`
8. Handle create/edit modes via `initialData` prop
9. Create form view in `ui/{Feature}FormView.tsx`
10. Use `RootLayout` with `scroll`, `padding`, and `title` props
11. Use Spanish validation messages

## References

- Product form: `src/modules/products/ui/components/ProductForm.tsx`
- Product form view: `src/modules/products/ui/ProductFormView.tsx`
- Product schema: `src/modules/products/domain/product.scheme.ts`
- Product adapter: `src/modules/products/domain/product.adapter.ts`
