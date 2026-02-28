---
name: create-module
description: Create new feature modules following Clean Architecture. Use when creating a new feature with domain, infrastructure, application, and UI layers.
---

# Create Module

Create feature modules following Clean Architecture with four layers.

## When to Use

- Creating new features (authentication, profile, settings, etc.)
- Adding major functionality that needs separation of concerns

## Module Structure

```
src/modules/{feature}/
├── domain/
│   ├── {feature}.model.ts       # Data types and interfaces
│   ├── {feature}.repository.ts  # Repository interface (contract)
│   ├── {feature}.adapter.ts     # Data transformers between layers
│   └── {feature}.scheme.ts      # Zod validation schemas
├── infrastructure/
│   └── {feature}.service.ts     # API/external service implementation
├── application/
│   ├── {feature}.mutations.ts   # React Query mutations
│   └── {feature}.queries.ts     # React Query queries
└── ui/
    ├── {Feature}View.tsx        # Main view component
    └── components/
        └── {Feature}Form.tsx    # View-specific components
```

## Layer Responsibilities

### Domain Layer

Business logic, independent of frameworks.

**Model** (`{feature}.model.ts`):

```typescript
export interface UserEntity {
  id: string;
  email: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
}

export interface CreateUserResponse {
  user: UserEntity;
  token: string;
}
```

**Repository** (`{feature}.repository.ts`):

```typescript
import { CreateUserPayload, CreateUserResponse } from './user.model';

export interface UserRepository {
  create(data: CreateUserPayload): Promise<CreateUserResponse | Error>;
}
```

**Adapter** (`{feature}.adapter.ts`):

```typescript
import {
  CreateUserPayload,
  CreateUserResponse,
  UserEntity,
} from './user.model';
import { RegisterFormData } from './user.scheme';

export function createUserPayloadAdapter(
  form: RegisterFormData,
): CreateUserPayload {
  return {
    email: form.email,
    password: form.password,
  };
}

export function createUserResponseAdapter(
  response: CreateUserResponse,
): UserEntity {
  return response.user;
}
```

**Schema** (`{feature}.scheme.ts`):

```typescript
import z from 'zod';

export const registerSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

### Infrastructure Layer

External services implementation.

```typescript
// See create-service skill for full pattern
import axiosService from '@modules/network/infrastructure/axios.service';
import { CreateUserPayload, CreateUserResponse } from '../domain/user.model';
import { UserRepository } from '../domain/user.repository';
import { manageAxiosError } from '@modules/network/domain/network.error';
import { API_ROUTES } from '@config/api.routes';

class UserService implements UserRepository {
  async create(data: CreateUserPayload) {
    try {
      const response = await axiosService.post<CreateUserResponse>(
        API_ROUTES.CREATE_USER,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createUserService(): UserRepository {
  return new UserService();
}

export default createUserService();
```

### Application Layer

React Query hooks for state management.

**Mutations** (`{feature}.mutations.ts`):

```typescript
import { useMutation } from '@tanstack/react-query';
import { RegisterFormData } from '../domain/user.scheme';
import {
  createUserPayloadAdapter,
  createUserResponseAdapter,
} from '../domain/user.adapter';
import userService from '../infrastructure/user.service';

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const payload = createUserPayloadAdapter(data);
      const result = await userService.create(payload);
      if (result instanceof Error) {
        throw result;
      }
      return createUserResponseAdapter(result);
    },
  });
}
```

**Queries** (`{feature}.queries.ts`):

```typescript
import { useQuery } from '@tanstack/react-query';
import userService from '../infrastructure/user.service';

export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const result = await userService.getById(userId);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
  });
}
```

### UI Layer

React components and views.

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@components/core';
import { spacing } from '@theme/index';
import { RootLayout } from '@components/layout';

interface UserViewProps {
  onBack?: () => void;
}

export default function UserView({ onBack }: UserViewProps) {
  return (
    <RootLayout onBack={onBack}>
      <View style={styles.container}>
        <Text variant="h1">User Profile</Text>
      </View>
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
});
```

## Best Practices

1. **Dependency Injection** - Domain layer should not depend on infrastructure
2. **Single Responsibility** - Each file has one purpose
3. **Repository Pattern** - Abstract data sources behind repository interfaces
4. **Adapter Pattern** - Transform data between layers
5. **Query Keys** - Use consistent query key structure for cache management

## Checklist

1. Create module directory structure
2. Define models in `domain/{feature}.model.ts`
3. Define repository interface in `domain/{feature}.repository.ts`
4. Create Zod schemas in `domain/{feature}.scheme.ts`
5. Create adapters in `domain/{feature}.adapter.ts`
6. Implement service in `infrastructure/{feature}.service.ts`
7. Create React Query hooks in `application/`
8. Create UI components in `ui/`

---

# Project Specific (edit for other projects)

## Stack

- Validation: Zod
- Data fetching: @tanstack/react-query
- HTTP: Axios
- Error pattern: `manageAxiosError` (returns Error, no throw)

## Path Aliases

- `@modules` - Feature modules
- `@components` - Shared components
- `@theme` - Theme tokens and hooks
- `@config` - App configuration

## Validation Messages

Use Spanish for validation messages:
- `'El campo es requerido'`
- `'Email inválido'`
- `'Mínimo {min} caracteres'`
