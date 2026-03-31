---
name: create-adapter
category: generation
layer: domain
priority: medium
last_updated: 2026-03-31
tags:
  - adapter
  - transformer
  - mapping
  - domain
triggers:
  - 'Creating data adapter'
  - 'Mapping form to payload'
  - 'Mapping sdk response'
description: Scaffold pure adapters consistent with the current architecture: form-to-payload adapters in feature domains, response adapters when needed, and shared Firebase adapters for SDK/domain mapping.
---

# Create Adapter

Scaffold pure data transformation functions that map data between architectural layers.

## When to Use

- Transforming API responses into domain entities
- Converting form data into API payloads
- Mapping between different data representations
- Adding a new entity that needs data transformation

## Current Adapter Architecture

There is no longer a default `{feature}EntityAdapter` for CRUD modules.

Adapters now follow these patterns:

### Type 1: Form-to-Payload Adapter (default in feature modules)

Transforms validated form data into the payload type expected by the service.

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

**Key rules:**
- Input type is `{Feature}FormData` (inferred from Yup schema)
- Output type is `Create{Feature}Payload` (defined in model)
- Direct field mapping — form fields match payload fields
- Handle optional fields with appropriate defaults if needed
- Used from `application/{feature}.mutations.ts`
- UI passes `FormData` directly to the mutation; UI should not build payloads manually

### Type 2: Response Adapter (only when the service response differs from the domain shape)

Common in modules such as `authentication`, where the service returns a response wrapper and the app needs the nested user.

```typescript
// src/modules/authentication/domain/auth.adapter.ts
import { SignInResponse, AuthUser } from './auth.model';

export function signInResponseAdapter(response: SignInResponse): AuthUser {
  return response.user;
}
```

**Key rules:**
- Create it only if the response shape needs normalization/extraction
- Keep the transformation minimal and explicit
- Stay in the domain layer as a pure function

### Type 3: Shared SDK Adapter (Firebase domain modules)

For shared Firebase modules, adapters can normalize SDK types for infrastructure services.

```typescript
// src/modules/firebase/domain/storage/storage.adapter.ts
import { FirebaseStorageTypes } from '@react-native-firebase/storage';
import type { FileMetadata } from './storage.model';

export function storageMetadataAdapter(
  metadata: FirebaseStorageTypes.FullMetadata,
): FileMetadata {
  return {
    name: metadata.name,
    bucket: metadata.bucket,
    generation: metadata.generation,
    metageneration: metadata.metageneration,
    fullPath: metadata.fullPath,
    size: metadata.size,
    contentType: metadata.contentType,
    timeCreated: metadata.timeCreated,
    updated: metadata.updated,
    md5Hash: metadata.md5Hash,
  };
}
```

```typescript
// src/modules/firebase/domain/firestore/firestore.adapter.ts
import { FirestoreDocument } from './firestore.model';

export function firestoreCollectionAdapter<T extends object>(
  data: FirestoreDocument<T>[],
): Array<T & { id: string }> {
  return data.map(doc => ({
    id: doc.id,
    ...doc.data,
  }));
}
```

**Key rules:**
- Allowed in shared domain modules that define repository contracts and domain types for an SDK
- Input/output must still be strongly typed
- No side effects, async logic, or service calls

## File Structure

### Feature module

```
src/modules/{feature}/
└── domain/
    ├── {feature}.model.ts      # Entity + Payload types
    ├── {feature}.scheme.ts     # Yup schemas + FormData type
    └── {feature}.adapter.ts    # form-to-payload and response adapters
```

### Shared Firebase modules

```
src/modules/firebase/domain/
├── firestore/
│   ├── firestore.model.ts
│   └── firestore.adapter.ts
└── storage/
    ├── storage.model.ts
    └── storage.adapter.ts
```

## Usage by Layer

### Application layer

```typescript
// src/modules/{feature}/application/{feature}.mutations.ts
import { {feature}FormToPayloadAdapter } from '../domain/{feature}.adapter';

return useMutation({
  mutationFn: async (form: {Feature}FormData) => {
    const payload = {feature}FormToPayloadAdapter(form);
    const result = await {feature}Service.create(payload);
    if (result instanceof Error) {
      throw result;
    }
    return result;
  },
});
```

### Infrastructure layer

```typescript
// src/modules/firebase/infrastructure/storage.service.ts
import { storageMetadataAdapter } from '../domain/storage/storage.adapter';

return {
  metadata: storageMetadataAdapter(snapshot.metadata),
};
```

## Adapter Rules

| Rule | Description |
|------|-------------|
| **Pure functions** | No side effects, no async, no external state |
| **Domain layer only** | Adapters live in `domain/`, never in `infrastructure/` or `ui/` |
| **Strict typing** | Input and output types must be explicitly defined |
| **No React imports** | Domain adapters must not import React or UI concerns |
| **No service usage** | Adapters never call repositories, SDKs, or network APIs |
| **Single file per feature** | All adapters in `{feature}.adapter.ts` |
| **Named exports** | Use `export function`, not `export default` |
| **Generate only needed adapters** | Do not scaffold unused adapters by default |

## Do Not Generate by Default

- Do not create `{feature}EntityAdapter` unless there is a real transformation need
- Do not call adapters from the UI layer when the application mutation can do it
- Do not use `Record<string, any>` or `any`
- Do not mix multiple unrelated responsibilities in the same adapter

## Naming Convention

| Adapter Type | Naming Pattern | Example |
|-------------|----------------|---------|
| Form-to-payload | `{feature}FormToPayloadAdapter` | `productFormToPayloadAdapter` |
| Response adapter | `{action}ResponseAdapter` | `signInResponseAdapter` |
| Metadata adapter | `{domain}MetadataAdapter` | `storageMetadataAdapter` |
| Collection adapter | `{domain}CollectionAdapter` | `firestoreCollectionAdapter` |

## Verification Checklist

```bash
# 1. Adapters exist in domain layer
ls src/modules/*/domain/*.adapter.ts
# Each feature module should have an adapter file when transformation is needed

# 2. No React imports in domain adapters
grep -r "import.*from 'react\|import.*from 'react-native'" src/modules/*/domain/*.adapter.ts
# Should return 0 results

# 3. Feature adapters are consumed from application
grep -r "ToPayloadAdapter\|ResponseAdapter" src/modules/*/application/*.ts
# Should show adapter imports in mutations when applicable

# 4. Shared Firebase adapters can be consumed from infrastructure
grep -r "storageMetadataAdapter\|firestoreCollectionAdapter" src/modules/firebase src/modules/*/infrastructure
# Should show usage only where SDK/domain normalization is needed
```

## References

- Product adapter: `src/modules/products/domain/product.adapter.ts`
- User adapter: `src/modules/users/domain/user.adapter.ts`
- Authentication adapter: `src/modules/authentication/domain/auth.adapter.ts`
- Storage adapter: `src/modules/firebase/domain/storage/storage.adapter.ts`
- Firestore adapter: `src/modules/firebase/domain/firestore/firestore.adapter.ts`
- Create Module skill: `.ai/skills/generation/create-module/skill.md`
