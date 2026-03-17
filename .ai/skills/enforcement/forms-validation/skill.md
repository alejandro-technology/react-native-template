---
name: forms-validation
category: enforcement
layer: ui
priority: high
tags:
  - react-hook-form
  - yup
  - form-schema
  - validation
  - adapters
triggers:
  - 'Creating forms'
  - 'Defining schemas'
  - 'Form data flow review'
description: Enforce form patterns using react-hook-form, Yup validation, and adapter functions. Use when creating forms, defining schemas, or reviewing form data flow.
---

# Forms & Validation Skill

Enforces the form architecture: Yup schemas, react-hook-form integration, and adapter-based data transformation.

## When to Use

- Creating new forms for CRUD operations
- Defining validation schemas
- Reviewing form data flow (form -> adapter -> service)
- Adding new form fields or validation rules

## Form Data Flow

```
Schema (Yup)          Form (react-hook-form)       Adapter           Service
─────────────         ──────────────────────       ─────────         ───────
productSchema    →    useForm<ProductFormData>  →   formToPayload  →  service.create()
  ├─ name                ├─ control                   └─ returns       └─ CreatePayload
  ├─ description         ├─ handleSubmit                 CreatePayload
  └─ price               └─ errors
```

## Schema Pattern (`domain/{entity}.scheme.ts`)

```typescript
import * as yup from 'yup';

export const {entity}Schema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .max(100, 'El nombre debe tener maximo 100 caracteres'),
  description: yup
    .string()
    .max(500, 'La descripcion debe tener maximo 500 caracteres')
    .optional(),
  price: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : Number(originalValue),
    )
    .required('El precio es requerido')
    .min(1, 'El precio debe ser mayor a 0'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email valido'),
});

export type {Entity}FormData = yup.InferType<typeof {entity}Schema>;
```

### Yup Rules

| Rule             | Pattern              | Example                                         |
| ---------------- | -------------------- | ----------------------------------------------- |
| Required string  | `.required('message')` | `.required('El nombre es requerido')`             |
| Max length       | `.max(N, 'message')` | `.max(100, 'Maximo 100 caracteres')`            |
| Optional field   | `.optional()`        | `.string().max(500).optional()`                 |
| Type coercion    | `.transform(...)`    | `.number().transform((v, raw) => Number(raw))` |
| Email validation | `.email('message')`  | `.email('Debe ser un email valido')`            |
| Error format     | String format ONLY   | `.required('message')` NOT `.required({ message })` |
| Language         | Spanish              | All error messages in Spanish                   |

## Form Component Pattern (`ui/components/{Entity}Form.tsx`)

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { spacing } from '@theme/index';
import { Button } from '@components/core';
import { TextInput } from '@components/form';
import type { {Entity}Entity } from '../../domain/{entity}.model';
import { {entity}Schema, {Entity}FormData } from '../../domain/{entity}.scheme';

interface {Entity}FormProps {
  onSubmit: (data: {Entity}FormData) => void;
  isLoading?: boolean;
  initialData?: {Entity}Entity;
}

export function {Entity}Form({
  onSubmit,
  isLoading = false,
  initialData,
}: {Entity}FormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{Entity}FormData>({
    resolver: yupResolver({entity}Schema),
    defaultValues: {
      name: initialData?.name || '',
      // ...other fields with defaults
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
      {/* More fields... */}
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
  container: { gap: spacing.md },
  button: { marginTop: spacing.md },
});
```

## Form View Pattern (`ui/{Entity}FormView.tsx`)

```typescript
export function {Entity}FormView({
  route: { params },
  navigation: { goBack },
}: {Entities}ScreenProps<{Entities}Routes.{Entity}Form>) {
  const { mutate: create{Entity}, isPending: isCreating } = use{Entity}Create();
  const { mutate: update{Entity}, isPending: isUpdating } = use{Entity}Update();

  const isLoading = isCreating || isUpdating;
  const {entity} = params?.{entity};
  const isEditing = !!{entity};

  const handleSubmit = (data: {Entity}FormData) => {
    const payload = {entity}FormToPayloadAdapter(data);
    if (isEditing) {
      update{Entity}({ id: {entity}.id, data: payload }, {});
    } else {
      create{Entity}(payload, {});
    }
    goBack();
  };

  return (
    <RootLayout
      scroll
      padding="lg"
      onPress={goBack}
      title={isEditing ? 'Editar {Entidad}' : 'Crear {Entidad}'}
    >
      <{Entity}Form
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={{entity}}
      />
    </RootLayout>
  );
}
```

## Adapter Pattern (`domain/{entity}.adapter.ts`)

```typescript
import { Create{Entity}Payload, {Entity}Entity } from './{entity}.model';
import type { {Entity}FormData } from './{entity}.scheme';

// Form data → API payload
export function {entity}FormToPayloadAdapter(
  form: {Entity}FormData,
): Create{Entity}Payload {
  return {
    name: form.name,
    description: form.description,
    price: form.price,
  };
}

// API response → Domain entity
export function {entity}EntityAdapter(data: {Entity}Entity): {Entity}Entity {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
```

## Validation Rules

| Rule | Description                                                    |
| ---- | -------------------------------------------------------------- |
| R1   | Schemas live in `domain/{entity}.scheme.ts`                    |
| R2   | FormData type inferred via `yup.InferType<typeof schema>`      |
| R3   | Error messages in Spanish, string format only                  |
| R4   | All string fields must have `.max()` defined                   |
| R5   | Optional fields use `.optional()` suffix                       |
| R6   | Numeric fields from inputs use `transform` for coercion        |
| R7   | Form uses `yupResolver`                                         |
| R8   | Form component receives `onSubmit`, `isLoading`, `initialData` |
| R9   | FormView handles create/edit mode via `params?.{entity}`       |
| R10  | FormView calls adapter before passing to mutation              |
| R11  | Submit button text: `'Actualizar'` (edit) or `'Crear'` (new)   |

## Anti-Patterns

```typescript
// WRONG: Validation logic in component
if (name.length < 1) setError('Required');

// CORRECT: Yup schema handles all validation
const schema = yup.object({ name: yup.string().required('El nombre es requerido') });

// WRONG: Sending form data directly to service
createProduct(formData);

// CORRECT: Transform via adapter
const payload = productFormToPayloadAdapter(formData);
createProduct(payload);

// WRONG: Object format for error messages
.min(1, { message: 'El nombre es requerido' })

// CORRECT: String format
.min(1, 'El nombre es requerido')
```
