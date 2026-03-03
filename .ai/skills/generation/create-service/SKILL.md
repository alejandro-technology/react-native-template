---
name: create-service
description: Create new services following the factory pattern. Use when creating API services, storage services, or any infrastructure layer service.
---

# Create Service

Create services following this project's factory pattern for dependency injection.

## When to Use

- Creating API services (infrastructure layer)
- Creating storage services
- Any service that needs to be injectable/mockable

## Service Pattern

Services use a factory function pattern with default export:

```typescript
// filepath: src/modules/{feature}/infrastructure/{feature}.service.ts
import axiosService from '@modules/network/infrastructure/axios.service';
import { SomePayload, SomeResponse } from '../domain/some.model';
import { SomeRepository } from '../domain/some.repository';
import { manageAxiosError } from '@modules/network/domain/network.error';
import { API_ROUTES } from '@config/api.routes';

class SomeService implements SomeRepository {
  async someMethod(data: SomePayload) {
    try {
      const response = await axiosService.post<SomeResponse>(
        API_ROUTES.SOME_ENDPOINT,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createSomeService(): SomeRepository {
  return new SomeService();
}

export default createSomeService();
```

## Repository Interface

Define the interface in the domain layer:

```typescript
// filepath: src/modules/{feature}/domain/{feature}.repository.ts
import { SomePayload, SomeResponse } from './some.model';

export interface SomeRepository {
  someMethod(data: SomePayload): Promise<SomeResponse | Error>;
}
```

## Error Handling Pattern

Always use `manageAxiosError` for consistent error handling:

```typescript
import { manageAxiosError } from '@modules/network/domain/network.error';

async function fetchData() {
  try {
    const response = await axiosService.get<Data>('/endpoint');
    return response.data;
  } catch (error) {
    return manageAxiosError(error);
  }
}
```

In consuming code, always check for Error:

```typescript
const result = await someService.someMethod(payload);
if (result instanceof Error) {
  throw result;
}
// Use result safely here
```

## Checklist

1. Create repository interface in `domain/{feature}.repository.ts`
2. Create model types in `domain/{feature}.model.ts`
3. Create service class implementing repository interface
4. Create factory function `create{Feature}Service()`
5. Use default export: `export default createSomeService();`
6. Handle all errors with `manageAxiosError`
7. Import axiosService from `@modules/network/infrastructure/axios.service`

## File Structure

```
src/modules/{feature}/
├── domain/
│   ├── {feature}.model.ts       # Data types/interfaces
│   ├── {feature}.repository.ts  # Repository interface
│   ├── {feature}.adapter.ts     # Data transformers
│   └── {feature}.scheme.ts      # Zod schemas
└── infrastructure/
    └── {feature}.service.ts     # Service implementation
```

---

# Project Specific (edit for other projects)

## HTTP Client

- Axios instance: `@modules/network/infrastructure/axios.service`
- Error handler: `manageAxiosError` from `@modules/network/domain/network.error`

## API Routes

- Routes defined in: `@config/api.routes`

## Error Pattern

Services MUST NOT throw exceptions. Return `Error` type instead:

```typescript
async someMethod(): Promise<T | Error>
```
