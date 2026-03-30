---
name: create-module
category: generation
layer: cross-cutting
priority: high
last_updated: 2026-03-25
tags:
  - clean-architecture
  - module-scaffold
  - feature-module
  - cruds
triggers:
  - 'Creating new feature'
  - 'Adding new entity'
description: Create new feature modules following Clean Architecture with 4 layers. Generates domain (models, repository, schemas, adapters), infrastructure (3-provider service factory), application (queries, mutations with QUERY_KEYS), and UI (views, components).
---

# Create Module

Create feature modules following Clean Architecture with four layers.

## When to Use

- Creating new features (orders, payments, settings, etc.)
- Adding major functionality that needs separation of concerns
- Copy `products` module as reference implementation

## Module Structure

```
src/modules/{feature}/
├── domain/
│   ├── {feature}.model.ts           # Entity + Payload types
│   ├── {feature}.repository.ts      # Repository interface (contract)
│   ├── {feature}.adapter.ts         # Data transformers
│   └── {feature}.scheme.ts          # Yup validation schemas + FormData
├── infrastructure/
│   ├── {feature}.service.ts         # Factory (switches http/firebase/mock)
│   ├── {feature}.http.service.ts    # HTTP implementation (Axios)
│   ├── {feature}.firebase.service.ts # Firebase implementation
│   └── {feature}.mock.service.ts    # Mock implementation
├── application/
│   ├── {feature}.queries.ts         # React Query queries
│   └── {feature}.mutations.ts       # React Query mutations
└── ui/
    ├── {Feature}ListView.tsx        # List view
    ├── {Feature}DetailView.tsx      # Detail view
    ├── {Feature}FormView.tsx        # Form view (create/edit)
    └── components/
        ├── {Feature}Form.tsx        # Form component
        ├── {Feature}Item.tsx        # List item component
        └── {Feature}List.tsx        # List component with FlashList
```

## Layer Responsibilities

### Domain Layer

Business logic, independent of frameworks. Pure TypeScript only.

**Model** (`{feature}.model.ts`):

```typescript
export interface {Feature}Entity {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
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
  {Feature}Entity,
  {Feature}Filter,
  Update{Feature}Payload,
} from './{feature}.model';

export type { {Feature}Filter };
export interface {Feature}Repository {
  getAll(filter?: {Feature}Filter): Promise<{Feature}Entity[] | Error>;
  getById(id: string): Promise<{Feature}Entity | Error>;
  create(data: Create{Feature}Payload): Promise<{Feature}Entity | Error>;
  update(id: string, data: Update{Feature}Payload): Promise<{Feature}Entity | Error>;
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

**Adapter** (`{feature}.adapter.ts`):

```typescript
import { Create{Feature}Payload, {Feature}Entity } from './{feature}.model';
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

### Infrastructure Layer

3-provider service pattern: HTTP, Firebase, and Mock.

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
  {Feature}Entity,
  {Feature}Filter,
  Update{Feature}Payload,
} from '../domain/{feature}.model';

class {Feature}HttpService implements {Feature}Repository {
  async getAll(filter?: {Feature}Filter): Promise<{Feature}Entity[] | Error> {
    try {
      const params = filter?.searchText ? { search: filter.searchText } : {};
      const response = await axiosService.get<{Feature}Entity[]>(
        API_ROUTES.{FEATURES},
        { params },
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async getById(id: string): Promise<{Feature}Entity | Error> {
    try {
      const response = await axiosService.get<{Feature}Entity>(
        `${API_ROUTES.{FEATURES}}/${id}`,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async create(data: Create{Feature}Payload): Promise<{Feature}Entity | Error> {
    try {
      const response = await axiosService.post<{Feature}Entity>(
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
  ): Promise<{Feature}Entity | Error> {
    try {
      const response = await axiosService.put<{Feature}Entity>(
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

### Application Layer

React Query hooks with centralized QUERY_KEYS and toast notifications.

**Queries** (`{feature}.queries.ts`):

```typescript
import { useQuery } from '@tanstack/react-query';
import {feature}Service from '../infrastructure/{feature}.service';
import type { {Feature}Filter } from '../domain/{feature}.repository';
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
    mutationFn: async ({ id, form }: { id: string; form: {Feature}FormData }) => {
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

### UI Layer

See `create-screen` and `create-form` skills for detailed view patterns.

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

## Checklist

1. Create module directory structure (4 layers)
2. Define entity + payload types in `domain/{feature}.model.ts`
3. Define repository interface in `domain/{feature}.repository.ts`
4. Create Yup schema in `domain/{feature}.scheme.ts`
5. Create adapters in `domain/{feature}.adapter.ts`
6. Implement HTTP service in `infrastructure/{feature}.http.service.ts`
7. Implement Firebase service in `infrastructure/{feature}.firebase.service.ts`
8. Implement Mock service in `infrastructure/{feature}.mock.service.ts`
9. Create service factory in `infrastructure/{feature}.service.ts`
10. Register API route in `src/config/api.routes.ts`
11. Register collection in `src/config/collections.routes.ts`
12. Register query keys in `src/config/query.keys.ts`
13. Create queries in `application/{feature}.queries.ts`
14. Create mutations in `application/{feature}.mutations.ts` (with toast + invalidation)
15. Create UI views and components in `ui/`
16. Setup navigation (see create-navigation skill)

## References

- Reference module: `src/modules/products/` (copy this)
- Users module: `src/modules/users/`
- Config files: `src/config/`
- Create Service skill: `.ai/skills/generation/create-service/skill.md`
- Create Form skill: `.ai/skills/generation/create-form/skill.md`
- Create Screen skill: `.ai/skills/generation/create-screen/skill.md`
- Create Navigation skill: `.ai/skills/generation/create-navigation/skill.md`
