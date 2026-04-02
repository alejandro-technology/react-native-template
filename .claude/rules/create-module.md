# Create Module Rules

Rules for creating a new feature module following Clean Architecture.

## Naming Convention

- Module: `src/modules/{module-name}/` (kebab-case)
- Entity: PascalCase singular (`Product`, `Order`)
- Files: `{entity}.model.ts` (lowercase singular)

## Directory Structure

```
src/modules/{module-name}/
  domain/           # model, repository, scheme, adapter
  infrastructure/   # service factory, http, firebase, mock
  application/      # queries, mutations, storage, hooks
  ui/               # screens, components
    components/
      {Entity}Detail.tsx  # Detail content + data fetching
  index.ts          # public exports
```

## Registration Checklist

1. `src/config/query.keys.ts` — Add query key entries
2. `src/config/api.routes.ts` — Add API route
3. `src/config/collections.routes.ts` — Add Firestore collection
4. Navigation — routes, stack, private routes, typed hook
5. `src/modules/{module}/index.ts` — Export hooks and types

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
