---
name: create-firebase-service
category: generation
layer: infrastructure
priority: medium
last_updated: 2026-03-25
tags:
  - firebase
  - firestore
  - nosql
  - real-time
triggers:
  - 'Implementing Firestore access'
  - 'Creating Firebase services'
description: Create Firebase/Firestore service implementations that implement repository interfaces. Generates service class with CRUD methods, error handling with manageFirebaseError, and integration with factory pattern.
---

# Create Firebase Service

Create services that interact with Firebase Firestore following the project's architecture.

## When to Use

- Creating data access services (repositories) for Firestore
- Implementing the Firebase variant of the 3-provider service pattern
- When you need to read/write from Firestore collections

## Service Pattern

Each Firebase service:

1. **Implements** the repository interface from the domain layer
2. **Uses** `firestore()` from `@react-native-firebase/firestore`
3. **Imports** collection names from `@config/collections.routes`
4. **Handles errors** with `manageFirebaseError` from `@modules/firebase/domain/firebase.error`
5. **Returns** `T | Error` — never throws

## Example

```typescript
// src/modules/{feature}/infrastructure/{feature}.firebase.service.ts
import firestore from '@react-native-firebase/firestore';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { {Feature}Repository } from '../domain/{feature}.repository';
import type {
  Create{Feature}Payload,
  {Feature}Entity,
  {Feature}Filter,
  Update{Feature}Payload,
} from '../domain/{feature}.model';
import { COLLECTIONS } from '@config/collections.routes';

class {Feature}FirebaseService implements {Feature}Repository {
  private firestore = firestore();

  async getAll(filter?: {Feature}Filter): Promise<{Feature}Entity[] | Error> {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.{FEATURES})
        .get();

      let items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as {Feature}Entity[];

      if (filter?.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        items = items.filter(
          item =>
            item.name.toLowerCase().includes(searchLower) ||
            item.id.toLowerCase().includes(searchLower),
        );
      }

      return items;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getById(id: string): Promise<{Feature}Entity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.{FEATURES}).doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return new Error('{Feature} no encontrado');
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as {Feature}Entity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: Create{Feature}Payload): Promise<{Feature}Entity | Error> {
    try {
      const now = new Date().toISOString();
      const docRef = await this.firestore.collection(COLLECTIONS.{FEATURES}).add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      const snapshot = await docRef.get();

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as {Feature}Entity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(
    id: string,
    data: Update{Feature}Payload,
  ): Promise<{Feature}Entity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.{FEATURES}).doc(id);
      const now = new Date().toISOString();

      await docRef.update({
        ...data,
        updatedAt: now,
      });

      const snapshot = await docRef.get();

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as {Feature}Entity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.{FEATURES}).doc(id);
      await docRef.delete();
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function create{Feature}FirebaseService(): {Feature}Repository {
  return new {Feature}FirebaseService();
}

export default create{Feature}FirebaseService();
```

## Collection Registration

Add the collection name in `src/config/collections.routes.ts`:

```typescript
export const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
  {FEATURES}: '{features}',  // Add new collection
};
```

## Integration with Service Factory

The Firebase service is one of 3 providers in the factory:

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

## Error Handling

Firebase errors are handled by `manageFirebaseError` which:
- Detects Firebase error codes (auth/*, firestore/*, storage/*)
- Returns localized Spanish error messages
- Returns `Error` objects with semantic `name` properties (e.g., `DuplicateIdentifierError`)
- Never throws — always returns `Error`

## Checklist

1. Create service class implementing the repository interface
2. Import `COLLECTIONS` from `@config/collections.routes` and register collection name
3. Implement all CRUD methods using `firestore()`
4. Handle errors with `manageFirebaseError` (not `manageAxiosError`)
5. Return `void` for delete operations (not `true`/`boolean`)
6. Use factory function: `export default create{Feature}FirebaseService()`
7. Integrate in `{feature}.service.ts` factory with `CONFIG.SERVICE_PROVIDER`

## File Structure

```
src/modules/{feature}/
├── domain/
│   ├── {feature}.model.ts         # Entity + Payload types
│   └── {feature}.repository.ts    # Repository interface
└── infrastructure/
    ├── {feature}.service.ts           # Factory (switches provider)
    ├── {feature}.http.service.ts      # HTTP implementation
    ├── {feature}.firebase.service.ts  # Firebase implementation
    └── {feature}.mock.service.ts      # Mock implementation
```

## References

- Product Firebase service: `src/modules/products/infrastructure/product.firebase.service.ts`
- User Firebase service: `src/modules/users/infrastructure/user.firebase.service.ts`
- Firebase error handler: `src/modules/firebase/domain/firebase.error.ts`
- Collections config: `src/config/collections.routes.ts`
- Create Service skill: `.ai/skills/generation/create-service/skill.md`
