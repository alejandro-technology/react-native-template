# Create Module Rules

Rules for creating a new feature module following Clean Architecture. This applies to both CRUD modules and non-CRUD modules such as authentication flows, backend integrations, demos, and capability-oriented modules.

## Naming Convention

- Module: `src/modules/{module-name}/` (kebab-case)
- Entity-centric modules: use a singular PascalCase entity (`Product`, `Order`) and conventional files such as `{entity}.model.ts`
- Capability or flow modules: use semantic names that describe the concern (`authentication`, `supabase`, `examples`, `firebase`)
- Files: keep file names descriptive and consistent with the layer responsibility

## Directory Structure

```
src/modules/{module-name}/
  domain/           # Optional: model, repository, scheme, adapter, source models
  infrastructure/   # Optional: service factory, http, firebase, supabase, mock, integration clients
  application/      # Optional: queries, mutations, storage, hooks, providers, source config
  ui/               # Optional: screens, components, providers
    components/
  index.ts          # Public exports only
```

Use only the folders that the module needs. CRUD modules usually implement all four layers. Non-CRUD modules may omit screens, adapters, mutations, or even the domain layer if the concern is narrower.

## Common Module Shapes

- **CRUD module**: `products`, `users`
- **Flow module**: `authentication`
- **Integration module**: `firebase`, `supabase`
- **Demo or multi-source module**: `examples`

## Registration Checklist

1. `src/config/query.keys.ts` — Add query keys only if the module uses React Query.
2. `src/config/api.routes.ts` — Add API routes only if the module consumes HTTP endpoints from the shared API config.
3. `src/config/collections.routes.ts` — Add Firestore collections only if the module uses Firebase/Firestore.
4. Navigation — Add routes, stack registration, and typed hooks only if the module exposes screens.
5. `src/modules/{module}/index.ts` — Export only the hooks, components, providers, and types that should be public.

## CRUD-Oriented Structure Example

```
src/modules/{module-name}/
  domain/           # model, repository, scheme, adapter
  infrastructure/   # service factory, http, firebase, supabase, mock
  application/      # queries, mutations, storage, hooks
  ui/               # list/detail/form screens and components
    components/
      {Entity}Detail.tsx
  index.ts
```

## Non-CRUD Structure Example

```
src/modules/{module-name}/
  domain/           # optional contracts, source models, errors
  infrastructure/   # client setup, provider-specific services, integrations
  application/      # hooks, stores, providers, query orchestration
  ui/               # semantic screens such as SignInView, LandingView, DynamicListView
    components/
    providers/
  index.ts
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

## Language

- Code, variables, files: English
- UI text, validation, toasts: Spanish
