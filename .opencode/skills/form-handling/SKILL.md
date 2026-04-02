---
name: form-handling
description: Create a complete form flow with react-hook-form, yup validation, domain adapters, and separation between FormView and Form component. Load when implementing create or edit screens.
license: MIT
compatibility: opencode
metadata:
  layer: ui,domain
  workflow: scaffold
  output: src/modules/{module}/ui/{Entity}FormView.tsx, src/modules/{module}/ui/components/{Entity}Form.tsx
---

# Form Handling Skill

**Description**: Create a complete form flow following the project's strict separation of concerns for validation, mapping, UI, and side effects.
**Use when**: Implementing a screen to create or edit an entity.

## Workflow

### 1. Domain Schema (`domain/{entity}.scheme.ts`)

- Use `yup` to define the validation schema (`{entity}Schema`).
- Define the TypeScript form type using `yup.InferType` (`export type {Entity}FormData = yup.InferType<typeof {entity}Schema>;`).

```typescript
// domain/product.scheme.ts
import * as yup from 'yup';

export const productSchema = yup.object({
  name: yup.string().required('El nombre es requerido'),
  price: yup.number().positive('Debe ser mayor a 0').required('Requerido'),
});

export type ProductFormData = yup.InferType<typeof productSchema>;
```

### 2. Domain Adapter (`domain/{entity}.adapter.ts`)

- Create functions to adapt `{Entity}FormData` to `Create{Entity}Payload` and `Update{Entity}Payload`.
- Clean data here (e.g., trim strings, parse numbers/dates).

```typescript
// domain/product.adapter.ts
import { ProductFormData } from './product.scheme';
import { CreateProductPayload } from './product.model';

export function adaptProductFormToCreatePayload(
  data: ProductFormData,
): CreateProductPayload {
  return {
    name: data.name.trim(),
    priceInCents: data.price * 100,
  };
}
```

### 3. UI Component (`ui/components/{Entity}Form.tsx`)

- Define `interface Props { defaultValues?: Partial<{Entity}FormData>; onSubmit: (data: {Entity}FormData) => void; isLoading?: boolean; }`.
- Initialize `useForm<{Entity}FormData>` with `yupResolver({entity}Schema)`.
- Map `defaultValues` carefully.
- Use `TextInput`, `Select`, `Checkbox` from `@components/form` by passing the `control` object and `name` props.
- Attach `handleSubmit(onSubmit)` to a `<Button>` from `@components/core`.

```typescript
// ui/components/ProductForm.tsx
import React from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextInput } from '@components/form';
import { Button } from '@components/core';
import { productSchema, ProductFormData } from '../../domain/product.scheme';

interface Props {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export function ProductForm({ defaultValues, onSubmit, isLoading }: Props) {
  const { control, handleSubmit } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: defaultValues || { name: '', price: 0 },
  });

  return (
    <View style={{ gap: 16 }}>
      <TextInput
        name="name"
        control={control}
        label="Nombre"
        placeholder="Ej. Zapatos"
      />
      <TextInput
        name="price"
        control={control}
        label="Precio"
        keyboardType="numeric"
      />
      <Button onPress={handleSubmit(onSubmit)} isLoading={isLoading}>
        Guardar
      </Button>
    </View>
  );
}
```

### 4. UI View (`ui/{Entity}FormView.tsx`)

- Check route params for edit mode (`isEditing`).
- Extract React Query mutations (`use{Entity}Create`, `use{Entity}Update`).
- Create an asynchronous `onSubmit` handler.
- Inside `onSubmit`:
  1. Call adapter to map `FormData` -> `Payload`.
  2. Call mutation `mutateAsync(payload)`.
  3. `navigation.goBack()`.
- Render `<RootLayout>` containing the `<{Entity}Form>` component. Pass `isLoading={isPending}`.

```typescript
// ui/ProductFormView.tsx
import React from 'react';
import { RootLayout } from '@components/layout';
import { ProductForm } from './components/ProductForm';
import {
  useProductCreate,
  useProductUpdate,
} from '../application/product.mutations';
import { adaptProductFormToCreatePayload } from '../domain/product.adapter';

export function ProductFormView({ route, navigation }) {
  const isEditing = !!route.params?.product;
  const { mutateAsync: createProduct, isPending: isCreating } =
    useProductCreate();
  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useProductUpdate();

  const handleSubmit = async (formData: ProductFormData) => {
    if (isEditing) {
      // you would normally adapt the form data to an UpdatePayload here
      await updateProduct({ id: route.params.product.id, payload: formData });
    } else {
      const payload = adaptProductFormToCreatePayload(formData);
      await createProduct(payload);
    }
    navigation.goBack();
  };

  return (
    <RootLayout title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}>
      <ProductForm
        defaultValues={route.params?.product}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </RootLayout>
  );
}
```

## Verification

- Is the schema strict?
- Are inputs using the custom wrapped ones from `@components/form`?
- Did you use `InferType`?
- Are mutations happening exclusively in `FormView`, while `useForm` is strictly in `Form`?
