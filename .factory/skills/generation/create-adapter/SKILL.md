---
name: create-adapter
category: generation
layer: domain
priority: medium
last_updated: 2026-03-25
tags:
  - adapter
  - transformer
  - mapping
  - domain
triggers:
  - 'Creating data adapter'
  - 'Transforming API response'
  - 'Mapping form to payload'
description: Scaffold data adapters for transforming between layers — entity adapters, form-to-payload adapters. Pure functions with strict input/output typing in the domain layer.
---

# Create Adapter

Scaffold pure data transformation functions that map data between architectural layers.

## When to Use

- Transforming API responses into domain entities
- Converting form data into API payloads
- Mapping between different data representations
- Adding a new entity that needs data transformation

## Adapter Types

### Type 1: Entity Adapter (API Response → Domain Entity)

Transforms API response into the domain model. Takes the typed entity and returns a clean copy with only domain fields.

```typescript
// src/modules/{feature}/domain/{feature}.adapter.ts
import { {Feature}Entity } from './{feature}.model';

/**
 * Adapts API response to domain entity.
 * Used in: queries (application layer)
 */
export function {feature}EntityAdapter(data: {Feature}Entity): {Feature}Entity {
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

**Key rules:**
- Takes typed entity as input (not `Record<string, any>`)
- Returns the exact `{Feature}Entity` type — no extra fields
- Pure function — no side effects, no async, no imports from infrastructure
- Used in application layer queries/mutations to ensure clean domain objects

### Type 2: Form-to-Payload Adapter (FormData → API Payload)

Transforms validated form data into the payload type expected by the service.

```typescript
// src/modules/{feature}/domain/{feature}.adapter.ts
import { Create{Feature}Payload } from './{feature}.model';
import type { {Feature}FormData } from './{feature}.scheme';

/**
 * Adapts form data to API payload.
 * Used in: mutations (application layer) and form views (UI layer)
 */
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

**Key rules:**
- Input type is `{Feature}FormData` (inferred from Yup schema)
- Output type is `Create{Feature}Payload` (defined in model)
- Direct field mapping — form fields match payload fields
- Handle optional fields with appropriate defaults if needed

## File Structure

All adapters for a feature live in a single file in the domain layer:

```
src/modules/{feature}/
└── domain/
    ├── {feature}.model.ts      # Entity + Payload types
    ├── {feature}.scheme.ts     # Yup schemas + FormData type
    └── {feature}.adapter.ts    # ALL adapters for this feature
```

## Usage in Application Layer

```typescript
// In mutations — form-to-payload adapter transforms form data
// src/modules/{feature}/application/{feature}.mutations.ts
import { {feature}FormToPayloadAdapter } from '../domain/{feature}.adapter';

// Called in UI layer before mutation:
const payload = {feature}FormToPayloadAdapter(formData);
createMutation.mutate(payload);
```

```typescript
// In some queries — entity adapter ensures clean domain objects
// src/modules/{feature}/application/{feature}.queries.ts
// Note: Most queries return data directly from service without adapter
// Use entity adapter only when API response needs field filtering
```

## Usage in UI Layer

The form-to-payload adapter is typically called in the form view:

```typescript
// src/modules/{feature}/ui/{Feature}FormView.tsx
import { {feature}FormToPayloadAdapter } from '../domain/{feature}.adapter';

const handleSubmit = (data: {Feature}FormData) => {
  const payload = {feature}FormToPayloadAdapter(data);
  createMutation.mutate(payload);
};
```

## Adapter Rules

| Rule | Description |
|------|-------------|
| **Pure functions** | No side effects, no async, no external state |
| **Domain layer only** | Adapters live in `domain/`, never in `infrastructure/` or `ui/` |
| **Strict typing** | Input and output types must be explicitly defined |
| **No framework imports** | No React, no Axios, no Firebase — pure TypeScript |
| **Single file per feature** | All adapters in `{feature}.adapter.ts` |
| **Named exports** | Use `export function`, not `export default` |

## Naming Convention

| Adapter Type | Naming Pattern | Example |
|-------------|----------------|---------|
| Entity adapter | `{feature}EntityAdapter` | `productEntityAdapter` |
| Form-to-payload | `{feature}FormToPayloadAdapter` | `productFormToPayloadAdapter` |
| Payload type | `Create{Feature}Payload` | `CreateProductPayload` |

## Verification Checklist

```bash
# 1. Adapters exist in domain layer
ls src/modules/*/domain/*.adapter.ts
# Each feature module should have an adapter file

# 2. No framework imports in adapters
grep -r "import.*from 'react\|import.*from 'axios\|import.*from '@react" src/modules/*/domain/*.adapter.ts
# Should return 0 results

# 3. Adapters are used in application layer or UI layer
grep -r "Adapter" src/modules/*/application/*.ts src/modules/*/ui/*.tsx
# Should show adapter imports

# 4. No adapters in infrastructure
grep -r "EntityAdapter\|FormToPayloadAdapter" src/modules/*/infrastructure/
# Should return 0 results
```

## References

- Product adapter: `src/modules/products/domain/product.adapter.ts`
- User adapter: `src/modules/users/domain/user.adapter.ts`
- Create Module skill: `.ai/skills/generation/create-module/skill.md`
