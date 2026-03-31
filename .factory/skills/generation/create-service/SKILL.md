---
name: create-service
category: generation
layer: infrastructure
priority: high
last_updated: 2026-03-31
tags:
  - factory-pattern
  - service-layer
  - axios
  - firebase
  - multi-provider
  - keychain
  - security
triggers:
  - 'Creating API service'
  - 'Creating storage service'
description: Create infrastructure services aligned with the current provider architecture: factory + HTTP/Firebase/Mock for feature modules, shared Firebase wrappers where needed, and `T | Error` return values instead of throws.
---

# Create Service

Create services following this project's 3-provider factory pattern.

## When to Use

- Creating the infrastructure layer for a new feature module
- Adding a new entity that needs HTTP, Firebase, and Mock implementations
- Any service that implements a repository interface

## Current Service Architecture

### Standard feature module

```
src/modules/{feature}/infrastructure/
├── {feature}.service.ts           # Factory (switches provider)
├── {feature}.http.service.ts      # HTTP implementation (Axios)
├── {feature}.firebase.service.ts  # Firebase implementation (Firestore)
└── {feature}.mock.service.ts      # Mock implementation (in-memory)
```

### Authentication exception

The authentication module follows the same factory idea, but the Firebase file is named differently:

```text
src/modules/authentication/infrastructure/
├── auth.service.ts
├── auth.http.service.ts
├── firebase-auth.service.ts
└── auth.mock.service.ts
```

### Shared infrastructure services

Modules like `src/modules/firebase/infrastructure/` and `src/modules/network/infrastructure/` are shared wrappers and do not use the 3-provider factory pattern.

The factory reads `CONFIG.SERVICE_PROVIDER` from `src/config/config.ts` and returns the active implementation singleton.

## Step 1: Repository Interface (Domain)

```typescript
// src/modules/{feature}/domain/{feature}.repository.ts
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

**Note:** not every repository is CRUD. `AuthRepository`, for example, has auth-specific methods (`signin`, `signup`, `signout`, etc.). Match the real contract of the module.

## Step 2: HTTP Service

```typescript
// src/modules/{feature}/infrastructure/{feature}.http.service.ts
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

### HTTP rules

- Use `axiosService`, not raw `fetch`
- Use `manageAxiosError`
- Return the domain shape expected by the repository
- Prefer `API_ROUTES` constants when the route exists in config
- **Token refresh**: `axiosService` handles 401 + token refresh automatically
- **Auth expired callback**: When token refresh fails, `axiosService.setAuthExpiredCallback()` is invoked

## Step 3: Firebase Service

Use the current shared Firebase wrappers, not raw SDK access inside feature services.

```typescript
// src/modules/{feature}/infrastructure/{feature}.firebase.service.ts
import { Timestamp } from '@react-native-firebase/firestore';
import { firestoreService } from '@modules/firebase';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { firestoreCollectionAdapter } from '@modules/firebase/domain/firestore/firestore.adapter';
import { {Feature}Repository } from '../domain/{feature}.repository';
import { COLLECTIONS } from '@config/collections.routes';

class {Feature}FirebaseService implements {Feature}Repository {
  async getAll(filter?: {Feature}Filter): Promise<{Feature}[] | Error> {
    try {
      // IMPORTANT: Firestore doesn't support full-text search or OR queries.
      // For production apps requiring search, consider Algolia.
      // Always use limit to prevent excessive reads.
      const result = await firestoreService.list<{Feature}FirebaseDoc>({
        collection: COLLECTIONS.{FEATURES},
        limit: 100, // Prevent excessive reads
      });
      // ... rest of implementation
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
  // ... other CRUD methods
}

function create{Feature}FirebaseService(): {Feature}Repository {
  return new {Feature}FirebaseService();
}

export default create{Feature}FirebaseService();
```

### Firebase rules

- **Always use `limit`** in `list()` calls to avoid downloading entire collections
- Use `firestoreService` wrapper, not raw Firestore SDK
- Use `Timestamp` from `@react-native-firebase/firestore` for date fields
- Use `firestoreCollectionAdapter` to normalize document data
- Firestore doesn't support full-text search - implement client-side filtering for small datasets only
- For search in production, consider Algolia or similar service

For authentication services, follow the auth-specific Firebase pattern in `.ai/skills/generation/create-firebase-service/SKILL.md` and use `firebaseAuthenticationService`.

## Step 4: Mock Service

```typescript
// src/modules/{feature}/infrastructure/{feature}.mock.service.ts
import {
  {Feature},
  Create{Feature}Payload,
  Update{Feature}Payload,
} from '../domain/{feature}.model';
import { {Feature}Filter, {Feature}Repository } from '../domain/{feature}.repository';

class {Feature}MockService implements {Feature}Repository {
  database: {Feature}[] = [];

  getAll(_?: {Feature}Filter): Promise<{Feature}[] | Error> {
    return Promise.resolve(this.database);
  }

  getById(id: string): Promise<{Feature} | Error> {
    const item = this.database.find(i => i.id === id);
    if (!item) return Promise.resolve(new Error('{Feature} not found'));
    return Promise.resolve(item);
  }

  create(data: Create{Feature}Payload): Promise<{Feature} | Error> {
    const item: {Feature} = {
      id: Math.random().toString(36).substring(2),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: data.description || '',
    };
    this.database.push(item);
    return Promise.resolve(item);
  }

  update(id: string, data: Update{Feature}Payload): Promise<{Feature} | Error> {
    const item = this.database.find(i => i.id === id);
    if (!item) return Promise.resolve(new Error('{Feature} not found'));
    Object.assign(item, data);
    item.updatedAt = new Date();
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

### Mock rules

- Match the domain model exactly (`Date` vs `string`, optional fields, etc.)
- Keep state in an in-memory array unless the module convention requires local persistence
- Authentication mock services are stateful and can use storage/listeners when the repository contract requires it
- **NEVER store passwords in plaintext** - mock services should simulate auth without exposing credentials

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

### Factory rules

- Return the provider singleton, not a new instance per callsite
- Match the module naming convention for provider imports
- The only allowed `throw` in this area is the factory default case for an unknown provider

## Configuration Steps

1. **API Route** — Add to `src/config/api.routes.ts` when the module has HTTP endpoints:
   ```typescript
   {FEATURES}: '/{features}',
   ```

2. **Collection** — Add to `src/config/collections.routes.ts` when the module has a Firestore provider:
   ```typescript
   {FEATURES}: '{features}',
   ```

3. **Environment Variables** — Add to `.env.example` if needed:
   ```
   API_URL=https://api.example.com
   SERVICE_PROVIDER=mock
   ```

## Error Handling

| Provider | Error Handler | Import |
|----------|--------------|--------|
| HTTP | `manageAxiosError` | `@modules/network/domain/network.error` |
| Firebase | `manageFirebaseError` | `@modules/firebase/domain/firebase.error` |
| Mock | Return `new Error()` directly | N/A |

**Rule:** service methods must not throw exceptions. Always return `Error`, except for non-async factory misconfiguration:

```typescript
async someMethod(): Promise<T | Error>
```

The application layer is responsible for converting `Error` results into `throw` inside React Query mutations.

## Security Considerations

### Secure Storage

For services that store sensitive data (tokens, credentials), use the secure storage system:

```typescript
import { initSecureStorage, getSecureStorage } from '@config/storage';

// Initialize at app startup (in AppProvider)
await initSecureStorage();

// Use for sensitive data
const secureStorage = getSecureStorage();
secureStorage.set('sensitive-key', 'sensitive-value');
```

### Keychain Integration

- `react-native-keychain` stores the MMKV encryption key in OS keychain
- On iOS: `ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY`
- Fallback for development where Keychain may not be available

### Auth Token Expiration

The `AxiosService` notifies the auth system when tokens expire:

```typescript
// In AuthProvider.tsx
axiosService.setAuthExpiredCallback(() => {
  setUnauthenticated();
});
```

## Checklist

1. Define or confirm the repository contract in `domain/`
2. Implement the HTTP provider with `axiosService` + `manageAxiosError`
3. Implement the Firebase provider using the shared Firebase wrappers with `limit`
4. Implement the mock provider matching the domain model shape
5. Create the factory in `{feature}.service.ts` using `CONFIG.SERVICE_PROVIDER`
6. Register API routes and collections only if the module needs them
7. Ensure every provider matches the repository contract exactly
8. Ensure async service methods return `Promise<T | Error>` and do not throw
9. Keep payload adaptation in `application`, not inside UI
10. Use secure storage for sensitive data
11. Run lint, typecheck, and tests after generation

## References

- Product HTTP service: `src/modules/products/infrastructure/product.http.service.ts`
- Product Firebase service: `src/modules/products/infrastructure/product.firebase.service.ts`
- Product Mock service: `src/modules/products/infrastructure/product.mock.service.ts`
- Product factory: `src/modules/products/infrastructure/product.service.ts`
- Auth factory: `src/modules/authentication/infrastructure/auth.service.ts`
- Auth Firebase provider: `src/modules/authentication/infrastructure/firebase-auth.service.ts`
- Shared Firestore wrapper: `src/modules/firebase/infrastructure/firestore.service.ts`
- Axios service with token refresh: `src/modules/network/infrastructure/axios.service.ts`
- Secure storage: `src/config/storage.ts`
- Axios error handler: `src/modules/network/domain/network.error.ts`
- Firebase error handler: `src/modules/firebase/domain/firebase.error.ts`
- Create Firebase Service skill: `.ai/skills/generation/create-firebase-service/SKILL.md`
