---
name: react-native-firebase
category: specialty
layer: infrastructure
priority: medium
last_updated: 2026-03-25
tags:
  - firebase
  - firestore
  - auth
  - storage
triggers:
  - 'Using Firebase services'
  - 'Implementing authentication'
  - 'Creating Firebase service'
description: Firebase integration patterns following Clean Architecture. Covers Firestore CRUD with T|Error pattern, Firebase Auth with repository interface, Cloud Storage, and centralized error handling with Spanish messages. Only documents installed packages (app, auth, firestore, storage v23.0.0).
---

# React Native Firebase

Firebase integration following the project's Clean Architecture and T|Error pattern.

## Installed Packages

```json
"@react-native-firebase/app": "23.0.0",
"@react-native-firebase/auth": "23.0.0",
"@react-native-firebase/firestore": "23.0.0",
"@react-native-firebase/storage": "23.0.0"
```

**No other Firebase packages are installed.** Cloud Functions, Crashlytics, Analytics, Messaging, and Remote Config are NOT available.

## Firebase Module Structure

```
src/modules/firebase/
├── domain/
│   ├── firebase.error.ts         # manageFirebaseError() — centralized error handler
│   ├── firebase.messages.ts      # FIREBASE_MESSAGES — Spanish error messages
│   ├── firestore.model.ts        # Firestore operation types
│   ├── firestore.repository.ts   # Firestore service interface
│   ├── storage.model.ts          # Storage operation types
│   ├── storage.repository.ts     # Storage service interface
│   └── storage.adapter.ts        # Firebase metadata adapter
├── infrastructure/
│   ├── firebase.config.ts        # Firebase app instance
│   ├── firestore.service.ts      # Firestore read/write operations
│   └── storage.service.ts        # Cloud Storage file operations
└── application/
    ├── firestore.hooks.ts        # Custom React hooks
    ├── storage.mutations.ts      # React Query mutations
    └── storage.queries.ts        # React Query queries
```

## Error Handling: `manageFirebaseError()`

All Firebase services use `manageFirebaseError()` to convert Firebase errors into `Error` objects with localized Spanish messages. This follows the T|Error pattern — services NEVER throw.

**Location**: `src/modules/firebase/domain/firebase.error.ts`

```typescript
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';

// Usage in any Firebase service method:
async getAll(): Promise<Entity[] | Error> {
  try {
    // ... Firebase operation
    return data;
  } catch (error) {
    return manageFirebaseError(error); // Returns Error, NEVER throws
  }
}
```

**Error codes handled**:

| Category | Codes | Message (Spanish) |
|----------|-------|-------------------|
| Auth | `auth/email-already-in-use` | El correo electrónico ya está en uso |
| Auth | `auth/invalid-email` | El correo electrónico no es válido |
| Auth | `auth/weak-password` | La contraseña debe tener al menos 6 caracteres |
| Auth | `auth/user-not-found` | No existe un usuario con este correo electrónico |
| Auth | `auth/wrong-password` | La contraseña es incorrecta |
| Auth | `auth/network-request-failed` | No pudimos conectar con el servidor... |
| Storage | `storage/object-not-found` | El archivo no fue encontrado |
| Storage | `storage/unauthorized` | No tienes permisos... |
| Storage | `storage/quota-exceeded` | Has excedido tu cuota... |
| Firestore | `firestore/not-found` | El documento no fue encontrado |
| Firestore | `firestore/already-exists` | El documento ya existe |
| Firestore | `firestore/permission-denied` | Permiso denegado |
| Firestore | `firestore/unavailable` | Servicio no disponible |

Some errors set `error.name` for special handling:
- `'DuplicateIdentifierError'` — email-already-in-use, already-exists
- `'FormError'` — invalid-email, weak-password, invalid-argument

## Firestore CRUD Pattern (Feature Modules)

Feature modules implement Firestore services as classes implementing the repository interface. Uses `COLLECTIONS` from config.

### Firebase Service Template

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
        items = items.filter(item =>
          item.name.toLowerCase().includes(searchLower),
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

### Key Rules

- **Always** use `COLLECTIONS.{FEATURES}` from `@config/collections.routes`, never hardcode collection names
- **Always** return `Promise<T | Error>`, never throw
- **Always** wrap Firebase calls in try/catch and use `manageFirebaseError(error)` in catch
- **Always** implement the repository interface from domain
- Client-side filtering (Firestore doesn't support full-text search natively)
- Set `createdAt`/`updatedAt` timestamps as ISO strings

### Collections Config

```typescript
// src/config/collections.routes.ts
export const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
};
```

Add new collections here when creating new modules.

## Authentication

The auth module follows Clean Architecture with 3 provider implementations.

### Auth Repository Interface

```typescript
// src/modules/authentication/domain/auth.repository.ts
export interface AuthRepository {
  signup(data: SignUpPayload): Promise<SignUpResponse | Error>;
  signin(data: SignInPayload): Promise<SignInResponse | Error>;
  signout(): Promise<void | Error>;
  getCurrentUser(): Promise<UserEntity | null | Error>;
  onAuthStateChanged(callback: AuthStateCallback): AuthStateUnsubscribe;
  sendEmailVerification(): Promise<void | Error>;
  sendPasswordResetEmail(email: string): Promise<void | Error>;
  updateProfile(data: Partial<UserEntity>): Promise<UserEntity | Error>;
  deleteAccount(): Promise<void | Error>;
}
```

### Firebase Auth Service

```typescript
// src/modules/authentication/infrastructure/firebase-auth.service.ts
import auth from '@react-native-firebase/auth';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { AuthRepository } from '../domain/auth.repository';

class FirebaseAuthService implements AuthRepository {
  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    try {
      const credential = await auth().signInWithEmailAndPassword(
        data.email,
        data.password,
      );
      return { user: firebaseUserToEntity(credential.user) };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  // onAuthStateChanged is the ONE method that doesn't follow T|Error
  // It uses a listener callback pattern
  onAuthStateChanged(callback: AuthStateCallback): AuthStateUnsubscribe {
    return auth().onAuthStateChanged(user => {
      callback(user ? firebaseUserToEntity(user) : null);
    });
  }

  // ... other methods follow same T|Error pattern
}
```

### Auth State Management Flow

```
FirebaseAuthService.onAuthStateChanged()
    ↓ (listener callback)
AuthProvider (sets up listener in useEffect)
    ↓ (updates store)
useAuthStorage (Zustand + secure MMKV persistence)
    ↓ (provides hooks)
UI Components: useAuth(), useIsAuthenticated(), useCurrentAuthUser()
```

The `AuthProvider` lives in UI layer and imports from infrastructure (this is the documented exception to the architecture rule — it needs the `onAuthStateChanged` listener).

### Auth Service Factory

```typescript
// src/modules/authentication/infrastructure/auth.service.ts
function createAuthService(): AuthRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http': return authHttpService;
    case 'firebase': return authFirebaseService;
    case 'mock': return authMockService;
    default: throw new Error(`Unknown provider: ${CONFIG.SERVICE_PROVIDER}`);
  }
}
export default createAuthService();
```

## Configuration

### Firebase Config Files

| Platform | File | Git Status |
|----------|------|------------|
| iOS | `ios/GoogleService-Info.plist` | gitignored |
| Android | `android/app/google-services.json` | gitignored |

These files must be obtained from the Firebase Console and placed manually.

### Service Provider Switch

In `src/config/config.ts`, set `CONFIG.SERVICE_PROVIDER`:

| Value | Uses |
|-------|------|
| `'firebase'` | Firestore + Firebase Auth |
| `'http'` | Axios + REST API |
| `'mock'` | Hardcoded data |

No code changes needed in feature modules — the factory pattern handles the switch.

## Checklist: Adding Firebase to a New Module

1. Add collection name to `src/config/collections.routes.ts`
2. Create `{feature}.firebase.service.ts` in infrastructure/
3. Implement `{Feature}Repository` interface
4. Use `COLLECTIONS.{FEATURES}` for collection name
5. Use `manageFirebaseError(error)` in all catch blocks
6. Return `Promise<T | Error>`, never throw
7. Register in factory: `case 'firebase': return {feature}FirebaseService`
8. Set `createdAt`/`updatedAt` timestamps in create/update

## References

- Firebase module: `src/modules/firebase/`
- Error handling: `src/modules/firebase/domain/firebase.error.ts`
- Error messages: `src/modules/firebase/domain/firebase.messages.ts`
- Product Firebase service: `src/modules/products/infrastructure/product.firebase.service.ts`
- User Firebase service: `src/modules/users/infrastructure/user.firebase.service.ts`
- Auth Firebase service: `src/modules/authentication/infrastructure/firebase-auth.service.ts`
- Collections config: `src/config/collections.routes.ts`
- Create Firebase Service skill: `.ai/skills/generation/create-firebase-service/skill.md`
