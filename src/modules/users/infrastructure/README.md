# User Infrastructure - Dependency Injection

This module implements dependency injection for the User service, allowing easy switching between different data providers.

## Architecture

```
infrastructure/
├── user.service.ts         # Factory that returns the configured provider
├── user.http.service.ts    # HTTP/REST API implementation (Axios)
└── user.firebase.service.ts # Firebase Firestore implementation
```

## Available Providers

### 1. HTTP Service (Axios)
- **File**: `user.http.service.ts`
- **Use case**: Production applications with REST API backend
- **Features**:
  - RESTful API calls using Axios
  - Search filtering via query parameters
  - Centralized error handling with `manageAxiosError`
  - Configured base URL from `API_ROUTES.ROOT`

### 2. Firebase Service
- **File**: `user.firebase.service.ts`
- **Use case**: Rapid prototyping, MVPs, serverless applications
- **Features**:
  - Direct Firestore integration
  - Client-side filtering for search (name, email, phone, role, id)
  - Real-time capabilities (not implemented but available)
  - Error handling with `manageFirebaseError`

## How to Switch Providers

Open `src/config/config.ts` and change the `SERVICE_PROVIDER` constant:

```typescript
// For HTTP/REST API (recommended for production)
export const CONFIG: Config = {
  SERVICE_PROVIDER: 'http',
};

// For Firebase Firestore
export const CONFIG: Config = {
  SERVICE_PROVIDER: 'firebase',
};
```

**No other code changes are needed!** The application layer remains completely unchanged.

## API Endpoints (HTTP Provider)

When using the HTTP provider, ensure your backend implements these endpoints:

```
GET    /users           - Get all users (supports ?search=term)
GET    /users/:id       - Get user by ID
POST   /users           - Create new user
PUT    /users/:id       - Update user
DELETE /users/:id       - Delete user
```

### Expected Response Format

```typescript
// Single User
{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// User List
UserEntity[]
```

## Adding a New Provider

1. Create a new service file (e.g., `user.graphql.service.ts`)
2. Implement the `UserRepository` interface
3. Export a singleton instance
4. Add the provider to `ServiceProvider` type in `src/config/config.ts`
5. Update the switch statement in `user.service.ts`

Example:

```typescript
// user.graphql.service.ts
import { UserRepository } from '../domain/user.repository';

class UserGraphQLService implements UserRepository {
  // Implementation here
}

export default new UserGraphQLService();

// src/config/config.ts
export type ServiceProvider = 'http' | 'firebase' | 'graphql';

// user.service.ts
switch (CONFIG.SERVICE_PROVIDER) {
  case 'http':
    return userHttpService;
  case 'firebase':
    return userFirebaseService;
  case 'graphql':
    return userGraphQLService;
}
```

## Testing Different Providers

You can easily test both implementations by switching the provider:

1. Start with Firebase for rapid prototyping
2. Switch to HTTP when your backend is ready
3. No changes needed in UI components or React Query hooks

## Notes

- Both implementations return `T | Error` instead of throwing
- Mutations in the application layer convert errors to throws for React Query
- Search filtering is handled differently:
  - **HTTP**: Server-side via query parameters
  - **Firebase**: Client-side filtering after fetching all documents (searches across name, email, phone, role, and id fields)
