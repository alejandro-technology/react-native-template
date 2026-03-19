---
name: create-adapter
category: generation
layer: domain
priority: medium
tags:
  - adapter
  - transformer
  - mapping
  - domain
triggers:
  - 'Creating data adapter'
  - 'Transforming API response'
  - 'Mapping form to payload'
description: Scaffold data adapters for transforming between layers — entity adapters, form-to-payload adapters, and API response adapters. Pure functions with strict input/output typing.
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

Transforms raw API/Firestore response into the domain model used by the application.

```typescript
// src/modules/{feature}/domain/{feature}.adapter.ts
import type { {Feature}Entity } from './{feature}.model';

/**
 * Adapts raw API response to domain entity.
 * Used in: queries (application layer)
 */
export function {feature}EntityAdapter(raw: Record<string, any>): {Feature}Entity {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    price: Number(raw.price ?? 0),
    imageUrl: String(raw.image_url ?? raw.imageUrl ?? ''),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? true),
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Adapts a list of raw API responses.
 */
export function {feature}ListAdapter(rawList: Record<string, any>[]): {Feature}Entity[] {
  return rawList.map({feature}EntityAdapter);
}
```

**Key rules:**
- Always provide fallback values (no `undefined` in output)
- Handle both snake_case (API) and camelCase (JS) field names
- Return the exact `{Feature}Entity` type — no extra fields
- Pure function — no side effects, no async, no imports from infrastructure

### Type 2: Form-to-Payload Adapter (FormData → API Payload)

Transforms validated form data into the shape expected by the API.

```typescript
// src/modules/{feature}/domain/{feature}.adapter.ts
import type { {Feature}FormData } from './{feature}.scheme';

/**
 * API payload shape (what the backend expects).
 */
export interface {Feature}Payload {
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
}

/**
 * Adapts form data to API payload.
 * Used in: mutations (application layer)
 */
export function {feature}FormToPayloadAdapter(form: {Feature}FormData): {Feature}Payload {
  return {
    name: form.name.trim(),
    description: form.description?.trim() ?? '',
    price: Number(form.price),
    image_url: form.imageUrl ?? '',
    is_active: form.isActive ?? true,
  };
}
```

**Key rules:**
- Trim strings to avoid whitespace issues
- Convert types explicitly (e.g., `Number()` for price from form string)
- Map camelCase form fields to snake_case API fields
- Handle optional fields with fallback values

### Type 3: API Response Adapter (Paginated/Wrapped Responses)

Handles API responses that wrap data in pagination or metadata structures.

```typescript
// src/modules/{feature}/domain/{feature}.adapter.ts
import type { {Feature}Entity } from './{feature}.model';

/**
 * Shape of paginated API response.
 */
export interface Paginated{Feature}Response {
  data: Record<string, any>[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

/**
 * Adapts paginated API response.
 */
export function {feature}PaginatedAdapter(response: Paginated{Feature}Response): {
  items: {Feature}Entity[];
  total: number;
  page: number;
  totalPages: number;
} {
  return {
    items: response.data.map({feature}EntityAdapter),
    total: response.meta.total,
    page: response.meta.page,
    totalPages: response.meta.total_pages,
  };
}
```

### Type 4: Firestore Document Adapter

Transforms Firestore document snapshots into domain entities.

```typescript
// src/modules/{feature}/domain/{feature}.adapter.ts
import type { {Feature}Entity } from './{feature}.model';

/**
 * Adapts Firestore document to domain entity.
 * Used in: Firebase service implementation
 */
export function {feature}FirestoreAdapter(
  id: string,
  data: Record<string, any>,
): {Feature}Entity {
  return {
    id,
    name: String(data.name ?? ''),
    description: String(data.description ?? ''),
    price: Number(data.price ?? 0),
    imageUrl: String(data.imageUrl ?? ''),
    isActive: Boolean(data.isActive ?? true),
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}
```

## File Structure

All adapters for a feature live in a single file in the domain layer:

```
src/modules/{feature}/
└── domain/
    ├── {feature}.model.ts      # Entity types
    ├── {feature}.scheme.ts     # Yup schemas + FormData type
    └── {feature}.adapter.ts    # ALL adapters for this feature
```

## Usage in Application Layer

```typescript
// In queries — entity adapter transforms API response
// src/modules/{feature}/application/{feature}.queries.ts
import { {feature}EntityAdapter } from '../domain/{feature}.adapter';

export function use{Feature}s() {
  return useQuery({
    queryKey: ['{feature}s'],
    queryFn: async () => {
      const result = await {feature}Service.getAll();
      if (result instanceof Error) throw result;
      return result.map({feature}EntityAdapter);
    },
  });
}
```

```typescript
// In mutations — form-to-payload adapter transforms form data
// src/modules/{feature}/application/{feature}.mutations.ts
import { {feature}FormToPayloadAdapter, {feature}EntityAdapter } from '../domain/{feature}.adapter';

export function use{Feature}Create() {
  return useMutation({
    mutationFn: async (data: {Feature}FormData) => {
      const payload = {feature}FormToPayloadAdapter(data);
      const result = await {feature}Service.create(payload);
      if (result instanceof Error) throw result;
      return {feature}EntityAdapter(result);
    },
  });
}
```

## Adapter Rules

| Rule | Description |
|------|-------------|
| **Pure functions** | No side effects, no async, no external state |
| **Domain layer only** | Adapters live in `domain/`, never in `infrastructure/` or `ui/` |
| **Strict typing** | Input and output types must be explicitly defined |
| **Fallback values** | Always provide defaults — never return `undefined` |
| **No framework imports** | No React, no Axios, no Firebase — pure TypeScript |
| **Single file per feature** | All adapters in `{feature}.adapter.ts` |
| **Named exports** | Use `export function`, not `export default` |

## Naming Convention

| Adapter Type | Naming Pattern | Example |
|-------------|----------------|---------|
| Entity adapter | `{feature}EntityAdapter` | `productEntityAdapter` |
| List adapter | `{feature}ListAdapter` | `productListAdapter` |
| Form-to-payload | `{feature}FormToPayloadAdapter` | `productFormToPayloadAdapter` |
| Paginated response | `{feature}PaginatedAdapter` | `productPaginatedAdapter` |
| Firestore document | `{feature}FirestoreAdapter` | `productFirestoreAdapter` |
| Payload type | `{Feature}Payload` | `ProductPayload` |

## Verification Checklist

```bash
# 1. Adapters exist in domain layer
ls src/modules/*/domain/*.adapter.ts
# Each feature module should have an adapter file

# 2. No framework imports in adapters
grep -r "import.*from 'react\|import.*from 'axios\|import.*from '@react" src/modules/*/domain/*.adapter.ts
# Should return 0 results

# 3. Adapters are used in application layer
grep -r "Adapter" src/modules/*/application/*.ts
# Should show adapter imports in queries and mutations

# 4. No adapters in infrastructure or UI
grep -r "EntityAdapter\|FormToPayloadAdapter" src/modules/*/infrastructure/ src/modules/*/ui/
# Should return 0 results (adapters are called from application layer)
```

## References

- Existing adapter: `src/modules/products/domain/product.adapter.ts`
- Existing adapter: `src/modules/users/domain/user.adapter.ts`
- Create Module skill: `.ai/skills/generation/create-module/SKILL.md`
- Error Handling skill: `.ai/skills/enforcement/error-handling/skill.md`
