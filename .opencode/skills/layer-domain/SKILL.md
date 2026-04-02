---
name: layer-domain
description: Create the domain layer for a Clean Architecture module (model, repository, scheme, adapter).
license: MIT
compatibility: opencode
metadata:
  layer: domain
  workflow: scaffold
  output: src/modules/{module}/domain/**
---

# Domain Layer

Create the domain layer for entity `$ARGUMENTS`.

## Files to Create

```
src/modules/{module}/domain/
  {entity}.model.ts       # Entity, Create/Update payloads, Filter
  {entity}.repository.ts  # Repository interface
  {entity}.scheme.ts      # Yup schema + FormData type
  {entity}.adapter.ts     # Form-to-payload converters
```

## Step 1: `{entity}.model.ts`

Define the entity interfaces and payload types.

```typescript
/**
 * {Entity} domain entity
 */
export interface {Entity} {
  id: string;
  name: string;
  // Add other fields based on entity requirements
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payload for creating a new {Entity}
 */
export interface Create{Entity}Payload {
  name: string;
  // Add other required fields for creation
}

/**
 * Payload for updating an existing {Entity}
 * All fields are optional
 */
export interface Update{Entity}Payload {
  name?: string;
  // Add other fields that can be updated
}

/**
 * Filter for querying {Entity} list
 */
export interface {Entity}Filter {
  searchText?: string;
  // Add other filter criteria
}
```

## Step 2: `{entity}.repository.ts`

Define the repository interface contract.

```typescript
import type {
  Create{Entity}Payload,
  {Entity},
  {Entity}Filter,
  Update{Entity}Payload,
} from './{entity}.model';

// Re-export for convenience
export type { {Entity}Filter };

/**
 * Repository interface for {Entity} operations
 * All methods return Promise<T | Error> - never throw
 */
export interface {Entity}Repository {
  /**
   * Get all entities, optionally filtered
   */
  getAll(filter?: {Entity}Filter): Promise<{Entity}[] | Error>;

  /**
   * Get a single entity by ID
   */
  getById(id: string): Promise<{Entity} | Error>;

  /**
   * Create a new entity
   */
  create(data: Create{Entity}Payload): Promise<{Entity} | Error>;

  /**
   * Update an existing entity
   */
  update(id: string, data: Update{Entity}Payload): Promise<{Entity} | Error>;

  /**
   * Delete an entity by ID
   */
  delete(id: string): Promise<void | Error>;
}
```

## Step 3: `{entity}.scheme.ts`

Define validation schema using Yup and derive the form data type.

```typescript
import * as yup from 'yup';
import type { InferType } from 'yup';

/**
 * Validation schema for {Entity} form
 * Messages are in Spanish for UI display
 */
export const {entity}Schema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  // Add other field validations
});

/**
 * Form data type derived from the schema
 * Use this type for react-hook-form
 */
export type {Entity}FormData = InferType<typeof {entity}Schema>;
```

### Common Yup Patterns

```typescript
// String validations
name: yup.string().required('Requerido').max(100, 'Máximo 100 caracteres'),
email: yup.string().email('Email inválido').required('Requerido'),
description: yup.string().optional(),

// Number validations
price: yup.number().required('Requerido').min(0, 'Debe ser mayor a 0'),
quantity: yup.number().integer('Debe ser entero').min(1, 'Mínimo 1'),

// Boolean
isActive: yup.boolean().default(true),

// Date
startDate: yup.date().required('Fecha requerida'),

// Enum/Select
status: yup.string().oneOf(['active', 'inactive']).required('Requerido'),

// Array
tags: yup.array().of(yup.string()).min(1, 'Mínimo 1 etiqueta'),

// Conditional
endDate: yup.date().when('hasEndDate', {
  is: true,
  then: schema => schema.required('Fecha requerida'),
}),
```

## Step 4: `{entity}.adapter.ts`

Create adapters to convert between form data and domain payloads.

```typescript
import type { Create{Entity}Payload, Update{Entity}Payload } from './{entity}.model';
import type { {Entity}FormData } from './{entity}.scheme';

/**
 * Convert form data to create payload
 */
export function {entity}FormToCreatePayloadAdapter(
  form: {Entity}FormData,
): Create{Entity}Payload {
  return {
    name: form.name,
    // Map other fields
  };
}

/**
 * Convert form data to update payload
 */
export function {entity}FormToUpdatePayloadAdapter(
  form: Partial<{Entity}FormData>,
): Update{Entity}Payload {
  return {
    name: form.name,
    // Map other fields (undefined values are filtered)
  };
}

/**
 * Alias for backwards compatibility
 */
export const {entity}FormToPayloadAdapter = {entity}FormToCreatePayloadAdapter;
```

## Rules

1. **No External Dependencies**: Domain layer MUST NOT import from infrastructure, application, or UI layers
2. **Only utility libraries**: Can depend on `yup` for validation
3. **Return Error, never throw**: Repository methods return `Promise<T | Error>`
4. **Messages in Spanish**: Validation error messages for UI display

## Naming Conventions

| Type             | Convention                     | Example                       |
| ---------------- | ------------------------------ | ----------------------------- |
| Entity interface | PascalCase                     | `Product`                     |
| Create payload   | `Create{Entity}Payload`        | `CreateProductPayload`        |
| Update payload   | `Update{Entity}Payload`        | `UpdateProductPayload`        |
| Filter           | `{Entity}Filter`               | `ProductFilter`               |
| Schema           | `{entity}Schema`               | `productSchema`               |
| Form data        | `{Entity}FormData`             | `ProductFormData`             |
| Adapter          | `{entity}FormToPayloadAdapter` | `productFormToPayloadAdapter` |

## Reference

- Example: `src/modules/products/domain/`
