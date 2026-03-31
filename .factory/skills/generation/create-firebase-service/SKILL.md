---
name: create-firebase-service
category: generation
layer: infrastructure
priority: medium
last_updated: 2026-03-31
tags:
  - firebase
  - firestore
  - auth
  - repository
triggers:
  - 'Implementing Firestore access'
  - 'Creating Firebase services'
description: Create Firebase service implementations aligned with the current architecture: feature repositories use shared Firebase wrappers (`firestoreService`, `firebaseAuthenticationService`), keep SDK mapping local, and always return `T | Error`.
---

# Create Firebase Service

Create Firebase-based infrastructure services following the current project architecture.

## When to Use

- Implementing the Firebase provider for a feature repository
- Creating Firestore-backed CRUD services for feature modules
- Creating authentication services backed by Firebase Auth
- Reusing the shared Firebase wrappers exposed by `@modules/firebase`

## Current Firebase Architecture

Feature modules should not talk to the raw Firebase SDK directly unless they are the shared wrapper module itself.

### Pattern A: Feature CRUD service over `firestoreService`

Use this for modules like `products` and `users`.

- Implements the repository interface from `domain/`
- Uses `firestoreService` from `@modules/firebase`
- Uses `firestoreCollectionAdapter` when mapping collection results
- Keeps Firestore-only shapes (`Timestamp`, doc types) private to the file
- Converts Firebase docs into the domain entity before returning
- Returns `T | Error`, never throws

### Pattern B: Auth service over `firebaseAuthenticationService`

Use this for authentication modules.

- Implements `AuthRepository`
- Uses `firebaseAuthenticationService` from `@modules/firebase/infrastructure/authentication.service`
- Maps `FirebaseAuthTypes.User` to the domain `AuthUser`
- Returns response wrappers defined in the auth domain (`SignInResponse`, `SignUpResponse`)

## Pattern A: Firestore CRUD Service

### Example

```typescript
// src/modules/{feature}/infrastructure/{feature}.firebase.service.ts
import { Timestamp } from '@react-native-firebase/firestore';
import { firestoreService } from '@modules/firebase';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { firestoreCollectionAdapter } from '@modules/firebase/domain/firestore/firestore.adapter';
import type {
  Create{Feature}Payload,
  {Feature},
  {Feature}Filter,
  Update{Feature}Payload,
} from '../domain/{feature}.model';
import { {Feature}Repository } from '../domain/{feature}.repository';
import { COLLECTIONS } from '@config/collections.routes';

interface {Feature}FirebaseDoc {
  name: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface {Feature}FirebaseEntity extends {Feature}FirebaseDoc {
  id: string;
}

function to{Feature}(entity: {Feature}FirebaseEntity): {Feature} {
  return {
    ...entity,
    createdAt: new Date(entity.createdAt.seconds * 1000),
    updatedAt: new Date(entity.updatedAt.seconds * 1000),
  };
}

class {Feature}FirebaseService implements {Feature}Repository {
  async getAll(filter?: {Feature}Filter): Promise<{Feature}[] | Error> {
    try {
      const result = await firestoreService.list<{Feature}FirebaseDoc>({
        collection: COLLECTIONS.{FEATURES},
      });
      if (result instanceof Error) {
        return result;
      }

      const entities = firestoreCollectionAdapter<{Feature}FirebaseDoc>(
        result.docs,
      );
      const items = entities.map(to{Feature});

      if (filter?.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        return items.filter(
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

  async getById(id: string): Promise<{Feature} | Error> {
    try {
      const result = await firestoreService.get<{Feature}FirebaseDoc>({
        collection: COLLECTIONS.{FEATURES},
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('{Feature} no encontrado');
      }

      return to{Feature}({ id: result.id, ...result.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: Create{Feature}Payload): Promise<{Feature} | Error> {
    try {
      const now = new Date();
      const result = await firestoreService.create<{Feature}FirebaseDoc>({
        collection: COLLECTIONS.{FEATURES},
        data: {
          ...data,
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        },
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.data) {
        return new Error('No se pudo crear el {feature}');
      }

      return to{Feature}({ id: result.id, ...result.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(
    id: string,
    data: Update{Feature}Payload,
  ): Promise<{Feature} | Error> {
    try {
      const now = new Date();
      const updateResult = await firestoreService.update<{Feature}FirebaseDoc>({
        collection: COLLECTIONS.{FEATURES},
        id,
        data: {
          ...data,
          updatedAt: Timestamp.fromDate(now),
        },
      });
      if (updateResult instanceof Error) {
        return updateResult;
      }

      const result = await firestoreService.get<{Feature}FirebaseDoc>({
        collection: COLLECTIONS.{FEATURES},
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('{Feature} no encontrado');
      }

      return to{Feature}({ id: result.id, ...result.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const result = await firestoreService.delete({
        collection: COLLECTIONS.{FEATURES},
        id,
      });
      if (result instanceof Error) {
        return result;
      }
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

### Key rules

- Do not call `getFirestore()` or `firestore()` directly in feature services
- Prefer `firestoreService.list/get/create/update/delete`
- Convert `Timestamp` to `Date` before returning the domain entity
- Keep Firebase-only interfaces (`{Feature}FirebaseDoc`) local to the file
- Use localized, user-facing error messages in feature modules
- Return `Error` values; never `throw` inside service methods

## Pattern B: Firebase Auth Service

```typescript
// src/modules/authentication/infrastructure/firebase-auth.service.ts
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import firebaseAuthenticationService from '@modules/firebase/infrastructure/authentication.service';
import type { AuthRepository } from '../domain/auth.repository';
import type {
  AuthUser,
  SignInPayload,
  SignInResponse,
} from '../domain/auth.model';

function firebaseUserToEntity(firebaseUser: FirebaseAuthTypes.User): AuthUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime)
      : null,
    lastLoginAt: firebaseUser.metadata.lastSignInTime
      ? new Date(firebaseUser.metadata.lastSignInTime)
      : null,
  };
}

class FirebaseAuthService implements AuthRepository {
  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    try {
      const credential = await firebaseAuthenticationService.signin(
        data.email,
        data.password,
      );

      return {
        user: firebaseUserToEntity(credential.user),
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}
```

### Auth rules

- Use the shared wrapper `firebaseAuthenticationService`
- Keep Firebase user mapping local to the service file
- Match the repository contract exactly; auth services are not CRUD services
- Preserve the module naming convention (`firebase-auth.service.ts` in authentication)

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

- Use `manageFirebaseError` from `@modules/firebase/domain/firebase.error`
- It normalizes `auth/*`, `firestore/*`, and `storage/*` errors
- Services still return `Error` objects instead of throwing

## Checklist

1. Implement the repository interface from `domain/`
2. Use the shared Firebase wrapper (`firestoreService` or `firebaseAuthenticationService`)
3. Register the collection in `src/config/collections.routes.ts` when using Firestore CRUD
4. Keep SDK-specific mapping local to the file
5. Handle all errors with `manageFirebaseError`
6. Return `void | Error` for deletes/signout-like operations
7. Export a singleton with `create{Feature}FirebaseService()`
8. Integrate it into the module factory (`{feature}.service.ts`)

## File Structure

```
src/modules/{feature}/
└── infrastructure/
    ├── {feature}.service.ts            # Factory (switches provider)
    ├── {feature}.http.service.ts       # HTTP implementation
    ├── {feature}.firebase.service.ts   # Firestore provider for CRUD modules
    └── {feature}.mock.service.ts       # Mock implementation
```

Authentication module exception:

```text
src/modules/authentication/infrastructure/
├── auth.service.ts
├── auth.http.service.ts
├── firebase-auth.service.ts
└── auth.mock.service.ts
```

## References

- Product Firebase service: `src/modules/products/infrastructure/product.firebase.service.ts`
- User Firebase service: `src/modules/users/infrastructure/user.firebase.service.ts`
- Firebase auth service: `src/modules/authentication/infrastructure/firebase-auth.service.ts`
- Shared Firestore wrapper: `src/modules/firebase/infrastructure/firestore.service.ts`
- Shared auth wrapper: `src/modules/firebase/infrastructure/authentication.service.ts`
- Firebase error handler: `src/modules/firebase/domain/firebase.error.ts`
- Collections config: `src/config/collections.routes.ts`
- Create Service skill: `.ai/skills/generation/create-service/SKILL.md`
