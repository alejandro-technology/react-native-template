---
name: module-scaffold
description: >
  Scaffold a complete Clean Architecture module: run the directory scaffold
  script, then delegate each layer to its dedicated skill. Use when creating a
  new feature module from scratch. Orchestrates layer-domain, layer-infrastructure,
  layer-application, layer-ui, and navigation.
license: MIT
compatibility: React Native 0.83+, TypeScript strict mode, bun package manager. Requires project structure from react-native-template.
metadata:
  version: "1.0"
  category: module-scaffolding
  layer: domain,infrastructure,application,ui
  workflow: scaffold
  output: src/modules/{module}/**
---

# Module Scaffold

Scaffold a complete Clean Architecture module named `$ARGUMENTS`.

## Step 0: Create Directory Structure

Before filling any files, run the scaffold script:

```bash
# Note: Replace <AGENT_DIR> with your active agent directory (e.g., .agents, .opencode, .claude)
./<AGENT_DIR>/skills/module-scaffold/scripts/scaffold-module.sh <module-name> <EntityName>
# Example:
./<AGENT_DIR>/skills/module-scaffold/scripts/scaffold-module.sh orders Order
```

This creates all required files as empty stubs. The remaining steps fill them in using the layer skills.

## Step 1: Gather Entity Fields

Ask for entity fields if not provided: name, type (string | number | boolean | Date), required/optional.

## Workflow: Layer-by-Layer

After scaffolding, load and apply each skill in order:

| Step | Load skill | Fills |
|------|-----------|-------|
| 2 | `layer-domain` | `domain/` — model, repository, scheme, adapter |
| 3 | `layer-infrastructure` | `infrastructure/` — service factory + providers |
| 4 | `layer-application` | `application/` — queries, mutations, storage |
| 5 | `layer-ui` | `ui/` — screens + components |
| 6 | `navigation` | `navigation/` — routes, stack, typed hook |

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

### `src/config/collections.routes.ts` (Firebase only)

```typescript
export const COLLECTIONS = {
  // ... existing collections
  {ENTITIES}: '{entities}',
};
```

## Step 8: Create Module Index

```typescript
// src/modules/{module}/index.ts

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

```bash
bun run lint
bun run typecheck
bun run test
```

## Naming Conventions

| Concept | Convention | Example |
|---------|-----------|---------|
| Module directory | kebab-case | `src/modules/product-orders/` |
| Entity | PascalCase singular | `ProductOrder` |
| File names | kebab-case | `product-order.model.ts` |
| Entity variable | camelCase singular | `productOrder` |
| Plural (lists) | camelCase plural | `productOrders` |

## Registration Checklist

- [ ] `QUERY_KEYS.{entity}` registered in `src/config/query.keys.ts`
- [ ] `API_ROUTES.{ENTITY}` registered in `src/config/api.routes.ts` (for HTTP)
- [ ] Route enum exported from `src/navigation/routes/index.ts`
- [ ] Module appears in `PrivateStackNavigator` or `PublicNavigator`
- [ ] `index.ts` exports only the public API
- [ ] `bun run typecheck` passes

## See Also

- Reference implementation: `src/modules/products/`
- Template assets: [`assets/`](assets/) — starter templates for model, repository, messages
