---
name: create-module
description: Create a complete Clean Architecture module with domain, infrastructure, application, and ui layers. Use when creating a new feature module, adding a new entity, or scaffolding CRUD functionality.
license: MIT
compatibility: opencode
metadata:
  layer: domain,infrastructure,application,ui
  workflow: scaffold
  output: src/modules/{module}/**
---

# Create Module

Create a complete feature module named `$ARGUMENTS` following Clean Architecture.

## Workflow

1. **Ask for entity fields** if not provided (name, type, required/optional)
2. **Create domain layer** — use `layer-domain` skill
3. **Create infrastructure layer** — use `layer-infrastructure` skill
4. **Create application layer** — use `layer-application` skill
5. **Create UI layer** — use `layer-ui` skill
6. **Register navigation** — use `navigation` skill
7. **Register config files** (query.keys, api.routes, collections.routes)
8. **Create module index.ts** with all exports
9. **Run validation**: `bun run lint && bun run typecheck && bun run test`

## Directory Structure

```
src/modules/{module-name}/
  domain/
    {entity}.model.ts         # Entity, Create/Update payloads, Filter
    {entity}.repository.ts    # Repository interface
    {entity}.scheme.ts        # Yup schema + FormData type
    {entity}.adapter.ts       # Form-to-payload converters
  infrastructure/
    {entity}.service.ts       # Factory (singleton)
    {entity}.http.service.ts  # HTTP implementation
    {entity}.mock.service.ts  # Mock implementation
    {entity}.firebase.service.ts # Firebase implementation
  application/
    {entities}.storage.ts     # Zustand store with MMKV
    {entity}.queries.ts       # React Query query hooks
    {entity}.mutations.ts     # React Query mutation hooks
  ui/
    {Entities}ListView.tsx    # List screen
    {Entity}DetailView.tsx    # Detail screen (layout only)
    {Entity}FormView.tsx      # Form screen
    components/
      {Entity}List.tsx        # FlashList container
      {Entity}Item.tsx        # Single item row
      {Entity}Form.tsx        # Form fields
      {Entity}Detail.tsx      # Detail content + data fetching
  index.ts                    # Public exports
```

## Naming Convention

| Concept          | Convention          | Example                       |
| ---------------- | ------------------- | ----------------------------- |
| Module directory | kebab-case          | `src/modules/product-orders/` |
| Entity           | PascalCase singular | `ProductOrder`                |
| File names       | kebab-case          | `product-order.model.ts`      |
| Entity in file   | lowercase singular  | `productOrder`                |
| Plural (lists)   | lowercase plural    | `productOrders`               |

## Step 7: Register Config Files

### `src/config/query.keys.ts`

```typescript
export const QUERY_KEYS = {
  // ... existing keys
  {ENTITIES}: (search = '') => ['{entities}', 'search', search],
  {ENTITY}_DETAIL: (id: string) => ['{entities}', 'detail', id],
};
```

### `src/config/api.routes.ts`

```typescript
export const API_ROUTES = {
  // ... existing routes
  {ENTITIES}: '/{entities}',
};
```

### `src/config/collections.routes.ts`

```typescript
export const COLLECTIONS = {
  // ... existing collections
  {ENTITIES}: '{entities}',
};
```

## Step 8: Create Module Index

`src/modules/{module}/index.ts`

```typescript
// Domain
export type {
  {Entity},
  Create{Entity}Payload,
  Update{Entity}Payload,
  {Entity}Filter,
} from './domain/{entity}.model';
export type { {Entity}Repository } from './domain/{entity}.repository';

// Application - Queries
export { use{Entities}, use{Entity} } from './application/{entity}.queries';

// Application - Mutations
export {
  use{Entity}Create,
  use{Entity}Update,
  use{Entity}Delete,
} from './application/{entity}.mutations';

// Application - Storage
export { use{Entities}Storage } from './application/{entities}.storage';
```

## Step 9: Validation

Run these commands after creating the module:

```bash
bun run lint
bun run typecheck
bun run test
```

## Import Conventions

```typescript
import React from 'react';
import { View } from 'react-native';
// Types
import { Product } from '@modules/products/domain/product.model';
// Theme
import { useTheme } from '@theme/index';
// Components
import { Button } from '@components/core';
```

## Language Rules

- Code, variables, types, file names: **English**
- UI text, validation messages, toast messages: **Spanish**

## Reference

- Example module: `src/modules/products/`
