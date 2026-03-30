---
name: create-service
category: generation
layer: infrastructure
priority: high
last_updated: 2026-03-25
tags:
  - factory-pattern
  - service-layer
  - axios
  - firebase
  - multi-provider
triggers:
  - 'Creating API service'
  - 'Creating storage service'
description: Create services following the 3-provider factory pattern (HTTP/Firebase/Mock). Generates repository interface, 3 implementations, and factory with CONFIG.SERVICE_PROVIDER switching. All services return T | Error (never throw).
---

# Create Service

Create services following this project's 3-provider factory pattern.

## When to Use

- Creating the infrastructure layer for a new feature module
- Adding a new entity that needs HTTP, Firebase, and Mock implementations
- Any service that implements a repository interface

## Architecture Overview

Each feature has **4 service files**:

```
src/modules/{feature}/infrastructure/
├── {feature}.service.ts           # Factory (switches provider)
├── {feature}.http.service.ts      # HTTP implementation (Axios)
├── {feature}.firebase.service.ts  # Firebase implementation (Firestore)
└── {feature}.mock.service.ts      # Mock implementation (in-memory)
```

The factory reads `CONFIG.SERVICE_PROVIDER` from `src/config/config.ts` to select the active implementation.

## Step 1: Repository Interface (Domain)

```typescript
// src/modules/{feature}/domain/{feature}.repository.ts
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

## Step 2: HTTP Service

```typescript
// src/modules/{feature}/infrastructure/{feature}.http.service.ts
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

## Step 3: Firebase Service

See `create-firebase-service` skill for detailed Firebase implementation.

```typescript
// src/modules/{feature}/infrastructure/{feature}.firebase.service.ts
import firestore from '@react-native-firebase/firestore';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { {Feature}Repository } from '../domain/{feature}.repository';
import { COLLECTIONS } from '@config/collections.routes';
// ... (see create-firebase-service skill for full pattern)

class {Feature}FirebaseService implements {Feature}Repository {
  private firestore = firestore();
  // CRUD methods using this.firestore.collection(COLLECTIONS.{FEATURES})
}

function create{Feature}FirebaseService(): {Feature}Repository {
  return new {Feature}FirebaseService();
}

export default create{Feature}FirebaseService();
```

## Step 4: Mock Service

```typescript
// src/modules/{feature}/infrastructure/{feature}.mock.service.ts
import {
  {Feature}Entity,
  Create{Feature}Payload,
  Update{Feature}Payload,
} from '../domain/{feature}.model';
import { {Feature}Filter, {Feature}Repository } from '../domain/{feature}.repository';

class {Feature}MockService implements {Feature}Repository {
  database: {Feature}Entity[] = [];

  getAll(_?: {Feature}Filter): Promise<{Feature}Entity[] | Error> {
    return Promise.resolve(this.database);
  }

  getById(id: string): Promise<{Feature}Entity | Error> {
    const item = this.database.find(i => i.id === id);
    if (!item) return Promise.resolve(new Error('{Feature} not found'));
    return Promise.resolve(item);
  }

  create(data: Create{Feature}Payload): Promise<{Feature}Entity | Error> {
    const item: {Feature}Entity = {
      id: Math.random().toString(36).substring(2),
      ...data,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.database.push(item);
    return Promise.resolve(item);
  }

  update(id: string, data: Update{Feature}Payload): Promise<{Feature}Entity | Error> {
    const item = this.database.find(i => i.id === id);
    if (!item) return Promise.resolve(new Error('{Feature} not found'));
    Object.assign(item, data);
    item.updatedAt = new Date().toISOString();
    return Promise.resolve(item);
  }

  delete(id: string): Promise<void | Error> {
    const index = this.database.findIndex(i => i.id === id);
    if (index === -1) return Promise.resolve(new Error('{Feature} not found'));
    this.database.splice(index, 1);
    return Promise.resolve();
  }
}

function create{Feature}MockService(): {Feature}Repository {
  return new {Feature}MockService();
}

export default create{Feature}MockService();
```

## Step 5: Service Factory

```typescript
// src/modules/{feature}/infrastructure/{feature}.service.ts
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

## Configuration Steps

1. **API Route** — Add to `src/config/api.routes.ts`:
   ```typescript
   {FEATURES}: '/{features}',
   ```

2. **Collection** — Add to `src/config/collections.routes.ts`:
   ```typescript
   {FEATURES}: '{features}',
   ```

## Error Handling

| Provider | Error Handler | Import |
|----------|--------------|--------|
| HTTP | `manageAxiosError` | `@modules/network/domain/network.error` |
| Firebase | `manageFirebaseError` | `@modules/firebase/domain/firebase.error` |
| Mock | Return `new Error()` directly | N/A |

**Rule:** Services MUST NOT throw exceptions. Always return `Error`:

```typescript
async someMethod(): Promise<T | Error>
```

## Checklist

1. Create repository interface in `domain/{feature}.repository.ts`
2. Create model types in `domain/{feature}.model.ts`
3. Implement HTTP service with `manageAxiosError`
4. Implement Firebase service with `manageFirebaseError`
5. Implement Mock service with in-memory array
6. Create factory in `{feature}.service.ts` with `CONFIG.SERVICE_PROVIDER`
7. Register API route in `src/config/api.routes.ts`
8. Register collection in `src/config/collections.routes.ts`
9. All services implement `{Feature}Repository` interface
10. All methods return `Promise<T | Error>` — never throw

## References

- Product HTTP service: `src/modules/products/infrastructure/product.http.service.ts`
- Product Firebase service: `src/modules/products/infrastructure/product.firebase.service.ts`
- Product Mock service: `src/modules/products/infrastructure/product.mock.service.ts`
- Product factory: `src/modules/products/infrastructure/product.service.ts`
- Axios error handler: `src/modules/network/domain/network.error.ts`
- Firebase error handler: `src/modules/firebase/domain/firebase.error.ts`
- Create Firebase Service skill: `.ai/skills/generation/create-firebase-service/skill.md`
