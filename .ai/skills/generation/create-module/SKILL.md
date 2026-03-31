---
name: create-module
category: generation
layer: cross-cutting
priority: high
last_updated: 2026-03-31
tags:
  - clean-architecture
  - module-scaffold
  - feature-module
  - cruds
triggers:
  - 'Creating new feature'
  - 'Adding new entity'
description: Create new CRUD feature modules following the current Clean Architecture baseline. Generates domain, infrastructure, application, UI, query keys, and barrel exports aligned with the existing `products` and `users` modules.
---

# Create Module

Create feature modules following the current project baseline.

## When to Use

- Creating new features (orders, payments, settings, etc.)
- Adding major functionality that needs separation of concerns
- Copy `products` module as reference implementation

## Scope

This skill is mainly for **CRUD-style feature modules** like `products` and `users`.

If the module is highly specialized, such as:

- authentication
- shared Firebase wrappers
- shared network infrastructure

do not force the CRUD template blindly; adapt the repository and service contracts to the real use case.

## Current Module Structure

```
src/modules/{feature}/
├── domain/
│   ├── {feature}.model.ts          # Entity + payloads + filter model
│   ├── {feature}.repository.ts     # Repository interface (contract)
│   ├── {feature}.adapter.ts        # Form-to-payload adapter
│   └── {feature}.scheme.ts         # Yup validation schema + FormData
├── infrastructure/
│   ├── {feature}.service.ts        # Factory (switches http/firebase/mock)
│   ├── {feature}.http.service.ts   # HTTP implementation
│   ├── {feature}.firebase.service.ts # Firebase implementation
│   └── {feature}.mock.service.ts   # Mock implementation
├── application/
│   ├── {feature}.queries.ts        # React Query queries
│   └── {feature}.mutations.ts      # React Query mutations
└── ui/
    ├── {Feature}ListView.tsx       # List view
    ├── {Feature}DetailView.tsx     # Detail view
    ├── {Feature}FormView.tsx       # Form view
    └── components/
        ├── {Feature}Form.tsx       # Form component
        ├── {Feature}Item.tsx       # List item component
        └── {Feature}List.tsx       # List component

src/modules/{feature}/index.ts      # Barrel exports
```

## Mandatory Architecture Rules

- Respect the 4 layers: `domain`, `infrastructure`, `application`, `ui`
- Dependency flow is inward only: `ui -> application -> infrastructure -> domain`
- UI must not import from `infrastructure`
- Services return `T | Error`; they do not throw inside async methods
- Application queries/mutations convert `Error` into `throw` for React Query
- UI screens stay thin and delegate heavy rendering to `ui/components/`

References:

- `.ai/rules/architecture.md`
- `.ai/rules/ui-module-structure.md`

## Layer Responsibilities and Patterns

### Domain Layer

Business logic, independent of frameworks. Pure TypeScript only.

**Model** (`{feature}.model.ts`):

```typescript
export interface {Feature} {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create{Feature}Payload {
  name: string;
  description?: string;
  price: number;
}

export interface Update{Feature}Payload {
  name?: string;
  description?: string;
  price?: number;
}

export interface {Feature}Filter {
  searchText?: string;
}
```

**Repository** (`{feature}.repository.ts`):

```typescript
import {
  Create{Feature}Payload,
  {Feature},
  {Feature}Filter,
  Update{Feature}Payload,
} from './{feature}.model';

export type { {Feature}Filter };
export interface {Feature}Repository {
  getAll(filter?: {Feature}Filter): Promise<{Feature}[] | Error>;
  getById(id: string): Promise<{Feature} | Error>;
  create(data: Create{Feature}Payload): Promise<{Feature} | Error>;
  update(id: string, data: Update{Feature}Payload): Promise<{Feature} | Error>;
  delete(id: string): Promise<void | Error>;
}
```

**Schema** (`{feature}.scheme.ts`):

```typescript
import * as yup from 'yup';
import type { InferType } from 'yup';

export const {feature}Schema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  description: yup
    .string()
    .max(500, 'La descripción debe tener máximo 500 caracteres')
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

**Adapter** (`{feature}.adapter.ts`):

```typescript
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

### Domain rules

- Do not generate `{feature}EntityAdapter` by default
- Default adapter pattern is `FormData -> CreatePayload`
- UI messages and validation messages stay in Spanish
- Code and type names stay in English

### Infrastructure Layer

Use the current 3-provider pattern for CRUD modules: HTTP, Firebase, and Mock.

**Factory** (`{feature}.service.ts`):

```typescript
import { {Feature}Repository } from '../domain/{feature}.repository';
import {feature}HttpService from './{feature}.http.service';
import {feature}FirebaseService from './{feature}.firebase.service';
import {feature}MockService from './{feature}.mock.service';
import { CONFIG } from '@config/config';

function create{Feature}Service(): {Feature}Repository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return {feature}HttpService;
    case 'firebase':
      return {feature}FirebaseService;
    case 'mock':
      return {feature}MockService;
    default:
      throw new Error(
        `Unknown service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}

export default create{Feature}Service();
```

**HTTP Service** (`{feature}.http.service.ts`):

```typescript
import axiosService from '@modules/network/infrastructure/axios.service';
import { manageAxiosError } from '@modules/network/domain/network.error';
import { API_ROUTES } from '@config/api.routes';
import { {Feature}Repository } from '../domain/{feature}.repository';
import type {
  Create{Feature}Payload,
  {Feature},
  {Feature}Filter,
  Update{Feature}Payload,
} from '../domain/{feature}.model';

class {Feature}HttpService implements {Feature}Repository {
  async getAll(filter?: {Feature}Filter): Promise<{Feature}[] | Error> {
    try {
      const params = filter?.searchText ? { search: filter.searchText } : {};
      const response = await axiosService.get<{Feature}[]>(
        API_ROUTES.{FEATURES},
        { params },
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async getById(id: string): Promise<{Feature} | Error> {
    try {
      const response = await axiosService.get<{Feature}>(
        `${API_ROUTES.{FEATURES}}/${id}`,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async create(data: Create{Feature}Payload): Promise<{Feature} | Error> {
    try {
      const response = await axiosService.post<{Feature}>(
        API_ROUTES.{FEATURES},
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async update(
    id: string,
    data: Update{Feature}Payload,
  ): Promise<{Feature} | Error> {
    try {
      const response = await axiosService.put<{Feature}>(
        `${API_ROUTES.{FEATURES}}/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await axiosService.delete(`${API_ROUTES.{FEATURES}}/${id}`);
      return;
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function create{Feature}HttpService(): {Feature}Repository {
  return new {Feature}HttpService();
}

export default create{Feature}HttpService();
```

**Firebase Service**: follow `.ai/skills/generation/create-firebase-service/SKILL.md`

**Mock Service**: follow `.ai/skills/generation/create-service/SKILL.md` pattern and match the domain shape exactly, especially `Date` fields.

### Infrastructure rules

- Service methods return `Promise<T | Error>`
- The only allowed `throw` is in the factory default case for unknown provider
- CRUD Firebase services should use shared wrappers like `firestoreService`, not raw SDK access in feature modules

### Application Layer

React Query hooks with centralized QUERY_KEYS and toast notifications.

**Queries** (`{feature}.queries.ts`):

```typescript
import { useQuery } from '@tanstack/react-query';
// Services
import {feature}Service from '../infrastructure/{feature}.service';
// Domain
import type { {Feature}Filter } from '../domain/{feature}.repository';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function use{Feature}s(filter?: {Feature}Filter, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.{FEATURES}(filter?.searchText),
    queryFn: async () => {
      const result = await {feature}Service.getAll(filter);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled,
  });
}

export function use{Feature}(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.{FEATURE}_DETAIL(id),
    queryFn: async () => {
      const result = await {feature}Service.getById(id);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled: enabled && Boolean(id),
  });
}
```

**Mutations** (`{feature}.mutations.ts`):

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Domain
import { {Feature}FormData } from '../domain/{feature}.scheme';
import { {feature}FormToPayloadAdapter } from '../domain/{feature}.adapter';
// Services
import {feature}Service from '../infrastructure/{feature}.service';
// Core
import { useAppStorage } from '@modules/core/application/app.storage';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function use{Feature}Create() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (form: {Feature}FormData) => {
      const payload = {feature}FormToPayloadAdapter(form);
      const result = await {feature}Service.create(payload);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    onSuccess: () => {
      show({
        message: '{Feature} creado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.{FEATURES}() });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}

export function use{Feature}Update() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async ({
      id,
      form,
    }: {
      id: string;
      form: {Feature}FormData;
    }) => {
      const payload = {feature}FormToPayloadAdapter(form);
      const result = await {feature}Service.update(id, payload);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    onSuccess: (_, variables) => {
      show({
        message: '{Feature} actualizado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.{FEATURES}() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.{FEATURE}_DETAIL(variables.id),
      });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}

export function use{Feature}Delete() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await {feature}Service.delete(id);
      if (result instanceof Error) {
        throw result;
      }
    },
    onSuccess: () => {
      show({
        message: '{Feature} eliminado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.{FEATURES}() });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}
```

**Nota**: Las mutations reciben `FormData` desde el UI y llaman al adapter internamente. El UI NO debe llamar al adapter directamente.

**Register QUERY_KEYS** in `src/config/query.keys.ts`:

```typescript
export const QUERY_KEYS = {
  // ... existing keys
  {FEATURES}: (search = '') => ['{features}', 'search', search],
  {FEATURE}_DETAIL: (id: string) => ['{features}', 'detail', id],
};
```

### Application rules

- Import the filter type from `domain/{feature}.repository.ts`
- Queries and mutations call the service and `throw` only after `instanceof Error`
- Toasts and invalidations live in `application`, not in `ui`

### UI Layer

Use the screen structure rule and the generation skills for screens/forms/navigation.

```text
src/modules/{feature}/ui/
├── {Feature}ListView.tsx
├── {Feature}DetailView.tsx
├── {Feature}FormView.tsx
└── components/
    ├── {Feature}List.tsx
    ├── {Feature}Item.tsx
    └── {Feature}Form.tsx
```

### UI rules

- `*View.tsx` lives in `ui/`
- supporting visual components live in `ui/components/`
- keep one main component per file
- screens stay thin
- UI imports from `application` and `domain` (types), never from `infrastructure`

See:

- `.ai/skills/generation/create-screen/SKILL.md`
- `.ai/skills/generation/create-form/SKILL.md`
- `.ai/skills/generation/create-navigation/SKILL.md`

## Barrel Exports

Each module should expose its public API in `src/modules/{feature}/index.ts`.

Example:

```typescript
export { use{Feature}s, use{Feature} } from './application/{feature}.queries';
export {
  use{Feature}Create,
  use{Feature}Update,
  use{Feature}Delete,
} from './application/{feature}.mutations';
export type {
  {Feature},
  Create{Feature}Payload,
  Update{Feature}Payload,
} from './domain/{feature}.model';
export type {
  {Feature}Repository,
  {Feature}Filter,
} from './domain/{feature}.repository';
```

## Configuration Steps

After creating the module:

1. **API Routes** — Add endpoint to `src/config/api.routes.ts`:
   ```typescript
   {FEATURES}: '/{features}',
   ```

2. **Collections** — Add to `src/config/collections.routes.ts`:
   ```typescript
   {FEATURES}: '{features}',
   ```

3. **Query Keys** — Add to `src/config/query.keys.ts` (see above)

4. **Navigation** — See `create-navigation` skill for route setup

5. **Barrel exports** — Update `src/modules/{feature}/index.ts`

## Mutation Naming Convention

| Operation | Hook Name | Example |
|-----------|-----------|---------|
| Create | `use{Feature}Create` | `useProductCreate` |
| Update | `use{Feature}Update` | `useProductUpdate` |
| Delete | `use{Feature}Delete` | `useProductDelete` |

## Query Naming Convention

| Operation | Hook Name | Example |
|-----------|-----------|---------|
| List | `use{Feature}s` | `useProducts` |
| Detail | `use{Feature}` | `useProduct` |

## Anti-Patterns to Avoid

- Generating `{Feature}Entity` instead of `{Feature}`
- Using `string` for `createdAt` / `updatedAt` in CRUD domain entities
- Creating `EntityAdapter` by default when no transformation is needed
- Calling adapters from UI screens
- Importing `infrastructure` directly from UI
- Throwing from async service methods
- Putting large lists/forms directly inside `*View.tsx`

## Checklist

1. Create module directory structure (4 layers)
2. Define entity + payload types in `domain/{feature}.model.ts`
3. Define repository interface in `domain/{feature}.repository.ts`
4. Create Yup schema in `domain/{feature}.scheme.ts`
5. Create `FormToPayloadAdapter` in `domain/{feature}.adapter.ts`
6. Implement HTTP service in `infrastructure/{feature}.http.service.ts`
7. Implement Firebase service in `infrastructure/{feature}.firebase.service.ts`
8. Implement Mock service in `infrastructure/{feature}.mock.service.ts`
9. Create service factory in `infrastructure/{feature}.service.ts`
10. Register API route in `src/config/api.routes.ts`
11. Register collection in `src/config/collections.routes.ts`
12. Register query keys in `src/config/query.keys.ts`
13. Create queries in `application/{feature}.queries.ts`
14. Create mutations in `application/{feature}.mutations.ts`
15. Create UI views and `ui/components/` files
16. Setup navigation
17. Add `src/modules/{feature}/index.ts`
18. Run lint, typecheck, and tests

## References

- Reference module: `src/modules/products/` (copy this)
- Users module: `src/modules/users/`
- Config files: `src/config/`
- Create Service skill: `.ai/skills/generation/create-service/SKILL.md`
- Create Firebase Service skill: `.ai/skills/generation/create-firebase-service/SKILL.md`
- Create Form skill: `.ai/skills/generation/create-form/SKILL.md`
- Create Screen skill: `.ai/skills/generation/create-screen/SKILL.md`
- Create Navigation skill: `.ai/skills/generation/create-navigation/SKILL.md`
