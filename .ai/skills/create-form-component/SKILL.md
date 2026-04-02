---
name: create-form-component
description: Create a form component wrapper that integrates with react-hook-form. Use when creating form inputs, checkboxes, selects, or date pickers for forms.
license: MIT
compatibility: opencode
metadata:
  layer: ui
  workflow: scaffold
  output: src/components/form/{Component}.tsx
---

# Create Form Component

Create a form component wrapper for `$ARGUMENTS`.

## Prerequisites

The core component must already exist in `src/components/core/`.

## Files to Create/Modify

```
src/components/form/{Component}.tsx  # NEW: Form wrapper
src/components/form/index.ts         # MODIFY: Add export
```

## Step 1: Create Form Component

`src/components/form/{Component}.tsx`

```typescript
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import {
  Control,
  FieldValues,
  Path,
  useController,
  FieldError,
} from 'react-hook-form';
// Core component
import {
  {Component} as {Component}Core,
  {Component}Props as {Component}CoreProps,
} from '../core/{Component}';

// Form-specific props
interface {Component}Props<T extends FieldValues = FieldValues>
  extends Omit<{Component}CoreProps, 'value' | 'onChange' | 'error'> {
  control: Control<T>;
  name: Path<T>;
}

export const {Component} = React.forwardRef<RNTextInput, {Component}Props>(
  function {Component}Inner<T extends FieldValues>(
    { name, control, ...rest }: {Component}Props<T>,
    ref: React.ForwardedRef<RNTextInput>,
  ) {
    const {
      field: { value, onChange, onBlur },
      fieldState: { error },
    } = useController({ name, control });

    return (
      <{Component}Core
        ref={ref}
        value={value ? String(value) : ''}
        onChangeText={onChange}
        onBlur={onBlur}
        error={error?.message}
        {...rest}
      />
    );
  },
) as <T extends FieldValues>(
  props: {Component}Props<T> & { ref?: React.ForwardedRef<RNTextInput> },
) => React.ReactElement;
```

## Step 2: Export Component

Add to `src/components/form/index.ts`:

```typescript
export { {Component} } from './{Component}';
```

## Patterns by Component Type

### TextInput

```typescript
const {
  field: { value, onChange, onBlur },
  fieldState: { error },
} = useController({ name, control });

return (
  <TextInputCore
    ref={ref}
    value={value ? String(value) : ''}
    onChangeText={onChange}
    onBlur={onBlur}
    error={error?.message}
    {...rest}
  />
);
```

### Checkbox

```typescript
const {
  field: { value, onChange },
  fieldState: { error },
} = useController({ name, control });

return (
  <CheckboxCore
    checked={Boolean(value)}
    onCheckedChange={onChange}
    error={error?.message}
    {...rest}
  />
);
```

### Select

```typescript
const {
  field: { value, onChange },
  fieldState: { error },
} = useController({ name, control });

return (
  <SelectCore
    value={value}
    onValueChange={onChange}
    error={error?.message}
    {...rest}
  />
);
```

### DatePicker

```typescript
const {
  field: { value, onChange },
  fieldState: { error },
} = useController({ name, control });

return (
  <DatePickerCore
    value={value instanceof Date ? value : undefined}
    onChange={onChange}
    error={error?.message}
    {...rest}
  />
);
```

## Rules

1. **Import core component with alias**: `import { {Component} as {Component}Core } from '../core/{Component}'`
2. **Use `useController`** from `react-hook-form` to connect to form state
3. **Pass `error?.message`** from `fieldState` to core component's error prop
4. **Extend core props**, omit conflicting props: `Omit<CoreProps, 'value' | 'onChange' | 'error'>`
5. **Add form-specific props**: `control: Control<T>` and `name: Path<T>`
6. **Use `forwardRef`** when core component supports refs
7. **Generic type** `<T extends FieldValues>` for type-safe form values

## Usage Example

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextInput } from '@components/form';
import { productSchema, ProductFormData } from '../domain/product.scheme';

function ProductForm() {
  const { control, handleSubmit } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
  });

  return (
    <View>
      <TextInput
        control={control}
        name="name"
        label="Nombre"
        placeholder="Ingrese el nombre"
      />
      <TextInput
        control={control}
        name="description"
        label="Descripción"
        multiline
      />
    </View>
  );
}
```

## Checklist

- [ ] Core component exists in `@components/core`
- [ ] Form component uses `useController` hook
- [ ] Props extend core props with `Omit<..., conflicting>`
- [ ] Generic type `<T extends FieldValues>` added
- [ ] Error message passed from `fieldState.error?.message`
- [ ] Component exported from `@components/form/index.ts`

## Reference

- Example: `src/components/form/TextInput.tsx`
- Example: `src/components/form/Checkbox.tsx`
- Example: `src/components/form/Select.tsx`
