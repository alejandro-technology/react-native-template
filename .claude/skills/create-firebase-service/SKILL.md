---
name: create-firebase-service
description: Create new Firebase services/repositories following the project's architecture. Use when implementing data access layers with Firestore.
---

# Create Firebase Service

Create services that interact with Firebase Firestore following the project's architecture.

## When to Use

- Creating data access services (repositories) for Firestore.
- Implementing infrastructure layer for features using Firebase.
- When you need to read/write from `COLLECTIONS`.

## Service Pattern

Services should follow this pattern:

1.  **Imports**:
    -   `firestore` from `@react-native-firebase/firestore`.
    -   `COLLECTIONS` from `@config/api.collections`.
    -   `manageAppError` from `@modules/shared/app/error`.
    -   `collectionResponseAdapter` from `@modules/shared/domain/adapter` (for lists).
    -   Models from `../domain/model`.

2.  **Class Structure**:
    -   Methods for CRUD operations (`find`, `create`, `update`, `delete`).
    -   Use `firestore().collection(COLLECTIONS.name)` or `this.db`.

3.  **Error Handling**:
    -   Wrap operations in `try-catch`.
    -   Return `manageAppError(error, 'error_code')` in catch block.
    -   Do not throw errors; return them.

## Example

```typescript
import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '@config/api.routes';
import { SomeModel, SomePayload } from '../domain/model';
import { collectionResponseAdapter } from '@modules/network/domain/network.adapter';
import { manageAppError } from '@modules/network/domain/network.error';

class SomeFirebaseService {
  async findAll(parentId: string) {
    try {
      const response = await firestore()
        .collection(COLLECTIONS.someCollection)
        .where('parentId', '==', parentId)
        .get();

      return collectionResponseAdapter<SomeModel>(response);
    } catch (error: any) {
      return manageAppError(error, 'some_find_all');
    }
  }

  async create(payload: SomePayload) {
    try {
      const response = await firestore()
        .collection(COLLECTIONS.someCollection)
        .add(payload);
      return {
        ...payload,
        id: response.id,
      } as SomeModel;
    } catch (error: any) {
      return manageAppError(error, 'some_create');
    }
  }

  async update(id: string, payload: Partial<SomeModel>) {
    try {
      await firestore()
        .collection(COLLECTIONS.someCollection)
        .doc(id)
        .update(payload);
      return true;
    } catch (error: any) {
      return manageAppError(error, 'some_update');
    }
  }
  
  async delete(id: string) {
    try {
      await firestore()
        .collection(COLLECTIONS.someCollection)
        .doc(id)
        .delete();
      return true;
    } catch (error: any) {
      return manageAppError(error, 'some_delete');
    }
  }
}

function createSomeFirebaseService() {
  return new SomeFirebaseService();
}

export default createSomeFirebaseService();
```

## Checklist

1.  Define models in `domain/model.ts`.
2.  Import `COLLECTIONS` and ensure the collection name exists.
3.  Implement methods using `firestore()`.
4.  Use `collectionResponseAdapter` for queries returning multiple documents.
5.  Handle errors with `manageAppError`.
6.  Export using the factory function pattern: `export default createService();`.
