---
name: api-layer
category: enforcement
layer: infrastructure
priority: high
tags:
  - service-factory
  - dual-provider
  - axios
  - firebase
  - http-client
triggers:
  - 'Creating a new service'
  - 'Adding API endpoints'
  - 'Switching data providers'
description: Guide and enforce the dual-provider service architecture (HTTP + Firebase), factory pattern, and error contract. Use when creating services, implementing API calls, or switching data providers.
---

# API Layer Skill

Enforces the service factory pattern, dual-provider architecture, and error handling contract.

## When to Use

- Creating a new service (HTTP or Firebase implementation)
- Adding API endpoints
- Implementing data access logic
- Reviewing service layer code
- Switching between HTTP and Firebase providers

## Core Pattern: Service Factory

Every entity has three infrastructure files:

```
infrastructure/
├── {entity}.service.ts           # Factory (decides which provider)
├── {entity}.http.service.ts      # Axios implementation
└── {entity}.firebase.service.ts  # Firestore implementation
```

### Factory File (`{entity}.service.ts`)

```typescript
import { {Entity}Repository } from '../domain/{entity}.repository';
import {entity}HttpService from './{entity}.http.service';
import {entity}FirebaseService from './{entity}.firebase.service';
import { CONFIG } from '@config/config';

function create{Entity}Service(): {Entity}Repository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return {entity}HttpService;
    case 'firebase':
      return {entity}FirebaseService;
    default:
      throw new Error(
        `Unknown {entity} service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}

export default create{Entity}Service();
```

### HTTP Service (`{entity}.http.service.ts`)

```typescript
import axiosService from '@modules/network/infrastructure/axios.service';
import { manageAxiosError } from '@modules/network/domain/network.error';
import { API_ROUTES } from '@config/api.routes';
import { {Entity}Repository } from '../domain/{entity}.repository';
import type {
  Create{Entity}Payload,
  {Entity}Entity,
  {Entity}Filter,
  Update{Entity}Payload,
} from '../domain/{entity}.model';

class {Entity}HttpService implements {Entity}Repository {
  async getAll(filter?: {Entity}Filter): Promise<{Entity}Entity[] | Error> {
    try {
      const params = filter?.searchText ? { search: filter.searchText } : {};
      const response = await axiosService.get<{Entity}Entity[]>(
        API_ROUTES.{ENTITIES},
        { params },
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async getById(id: string): Promise<{Entity}Entity | Error> {
    try {
      const response = await axiosService.get<{Entity}Entity>(
        `${API_ROUTES.{ENTITIES}}/${id}`,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async create(data: Create{Entity}Payload): Promise<{Entity}Entity | Error> {
    try {
      const response = await axiosService.post<{Entity}Entity>(
        API_ROUTES.{ENTITIES},
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async update(id: string, data: Update{Entity}Payload): Promise<{Entity}Entity | Error> {
    try {
      const response = await axiosService.put<{Entity}Entity>(
        `${API_ROUTES.{ENTITIES}}/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await axiosService.delete(`${API_ROUTES.{ENTITIES}}/${id}`);
      return;
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function create{Entity}HttpService(): {Entity}Repository {
  return new {Entity}HttpService();
}

export default create{Entity}HttpService();
```

### Firebase Service (`{entity}.firebase.service.ts`)

```typescript
import firestore from '@react-native-firebase/firestore';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { {Entity}Repository } from '../domain/{entity}.repository';
import type {
  Create{Entity}Payload,
  {Entity}Entity,
  {Entity}Filter,
  Update{Entity}Payload,
} from '../domain/{entity}.model';
import { COLLECTIONS } from '@config/collections.routes';

class {Entity}FirebaseService implements {Entity}Repository {
  private firestore = firestore();

  async getAll(filter?: {Entity}Filter): Promise<{Entity}Entity[] | Error> {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.{ENTITIES})
        .get();

      let items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as {Entity}Entity[];

      if (filter?.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        items = items.filter(item =>
          // Filter by all searchable string fields
          Object.values(item).some(
            val => typeof val === 'string' && val.toLowerCase().includes(searchLower),
          ),
        );
      }

      return items;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getById(id: string): Promise<{Entity}Entity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.{ENTITIES}).doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return new Error('{Entidad} no encontrado/a');
      }

      return { id: snapshot.id, ...snapshot.data() } as {Entity}Entity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: Create{Entity}Payload): Promise<{Entity}Entity | Error> {
    try {
      const now = new Date().toISOString();
      const docRef = await this.firestore.collection(COLLECTIONS.{ENTITIES}).add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      const snapshot = await docRef.get();
      return { id: snapshot.id, ...snapshot.data() } as {Entity}Entity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(id: string, data: Update{Entity}Payload): Promise<{Entity}Entity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.{ENTITIES}).doc(id);
      await docRef.update({ ...data, updatedAt: new Date().toISOString() });
      const snapshot = await docRef.get();
      return { id: snapshot.id, ...snapshot.data() } as {Entity}Entity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await this.firestore.collection(COLLECTIONS.{ENTITIES}).doc(id).delete();
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function create{Entity}FirebaseService(): {Entity}Repository {
  return new {Entity}FirebaseService();
}

export default create{Entity}FirebaseService();
```

## Error Contract: `T | Error`

### Rule: Services NEVER throw. They return `Error`.

```typescript
// CORRECT: Return Error
async getById(id: string): Promise<ProductEntity | Error> {
  try {
    // ...
  } catch (error) {
    return manageAxiosError(error); // Returns Error, does NOT throw
  }
}

// WRONG: Throwing in service
async getById(id: string): Promise<ProductEntity> {
  // ...throws on failure -- FORBIDDEN
}
```

### Rule: Application hooks convert `Error` to `throw` for React Query

```typescript
// In application/product.queries.ts
queryFn: async () => {
  const result = await productService.getAll(filter);
  if (result instanceof Error) {
    throw result; // React Query catches this
  }
  return result;
},
```

## Configuration Registration

When adding a new entity, register endpoints in:

**`src/config/api.routes.ts`:**

```typescript
export const API_ROUTES = {
  // ...existing
  ORDERS: '/orders',
};
```

**`src/config/collections.routes.ts`:**

```typescript
export const COLLECTIONS = {
  // ...existing
  ORDERS: 'orders',
};
```

## Switching Providers

Change one value in `src/config/config.ts`:

```typescript
export const CONFIG: Config = {
  SERVICE_PROVIDER: 'firebase', // Change to 'http' for REST API
};
```

No other code changes needed. UI and application layers remain untouched.

## Validation Rules

| Rule | Description                                                                       |
| ---- | --------------------------------------------------------------------------------- |
| R1   | Every entity has 3 infrastructure files (factory + http + firebase)               |
| R2   | Factory reads `CONFIG.SERVICE_PROVIDER`, nothing else                             |
| R3   | HTTP service uses `axiosService` from network module                              |
| R4   | Firebase service uses `firestore()` from `@react-native-firebase/firestore`       |
| R5   | All service methods return `Promise<T \| Error>`                                  |
| R6   | Error handling uses `manageAxiosError` (HTTP) or `manageFirebaseError` (Firebase) |
| R7   | Factory exports singleton via `export default create{Entity}Service()`            |
| R8   | HTTP search uses server-side `{ params: { search } }`                             |
| R9   | Firebase search uses client-side `.filter()` after fetch                          |
| R10  | Firebase `create` sets both `createdAt` and `updatedAt` as ISO strings            |

## Anti-Patterns

```typescript
// WRONG: Direct axios call (bypasses factory)
const data = await axios.get('/products');

// WRONG: Throwing in service method
throw new Error('Not found');

// WRONG: Hardcoding provider in factory
return productHttpService; // Must use CONFIG switch

// WRONG: Missing error handler
catch (error) { return error; } // Must use manageAxiosError/manageFirebaseError
```
