---
name: architecture
category: enforcement
layer: cross-cutting
priority: high
tags:
  - clean-architecture
  - layer-boundaries
  - module-structure
  - dependency-rules
triggers:
  - 'Creating a new feature module'
  - 'Pull request with module changes'
  - 'Module audit'
description: Enforce Clean Architecture patterns, layer boundaries, and module structure. Use when creating, reviewing, or auditing feature modules to ensure architectural consistency.
---

# Architecture Skill

Validates and enforces Clean Architecture principles across the entire codebase.

## When to Use

- Creating a new feature module
- Reviewing pull requests that add or modify module code
- Auditing existing modules for architectural drift
- Onboarding new developers to the project structure

## Architecture Overview

This project implements **Clean Architecture** with a **feature-module** structure. Each module is self-contained with four layers that follow strict dependency rules.

```
src/
├── components/        # Shared UI (core, form, layout)
├── config/           # Global configuration
├── modules/          # Feature modules (Clean Architecture)
│   └── {feature}/
│       ├── domain/         # Layer 1: Business logic (innermost)
│       ├── infrastructure/ # Layer 2: External services
│       ├── application/    # Layer 3: React Query hooks
│       └── ui/             # Layer 4: Views & components (outermost)
├── navigation/       # Route definitions and stack navigators
├── providers/        # React context composition
└── theme/            # Design system and tokens
```

## Layer Dependency Rules

### MANDATORY: Dependency flows inward only

```
UI → Application → Infrastructure → Domain
         ↓               ↓
       Domain          Domain
```

| Layer              | CAN import from                  | MUST NOT import from                   |
| ------------------ | -------------------------------- | -------------------------------------- |
| **domain**         | Nothing (pure TypeScript)        | infrastructure, application, ui, React |
| **infrastructure** | domain                           | application, ui                        |
| **application**    | domain, infrastructure           | ui                                     |
| **ui**             | application, domain (types only) | infrastructure                         |

### Rule Violations to Detect

```typescript
// VIOLATION: UI importing from infrastructure
import productService from '../infrastructure/product.service'; // In a UI file

// CORRECT: UI imports from application layer
import { useProducts } from '../application/product.queries';
```

```typescript
// VIOLATION: Domain importing React or external framework
import { useState } from 'react'; // In a domain file

// CORRECT: Domain is pure TypeScript
export interface ProductEntity {
  id: string;
  name: string;
}
```

## Module File Structure (CRUD)

Every CRUD module MUST follow this exact structure:

```
modules/{entities}/
├── domain/
│   ├── {entity}.model.ts        # Entity, CreatePayload, UpdatePayload, Filter
│   ├── {entity}.repository.ts   # Interface with 5 CRUD methods
│   ├── {entity}.scheme.ts       # Yup schema + inferred FormData type
│   ├── {entity}.adapter.ts      # formToPayload + entityAdapter
│   └── {entity}.utils.ts        # (optional) Domain-specific helpers
├── infrastructure/
│   ├── {entity}.service.ts      # Factory → returns provider singleton
│   ├── {entity}.http.service.ts # Axios implementation
│   └── {entity}.firebase.service.ts # Firestore implementation
├── application/
│   ├── {entity}.queries.ts      # useEntities + useEntity hooks
│   └── {entity}.mutations.ts    # useCreate + useUpdate + useDelete
└── ui/
    ├── {Entities}ListView.tsx    # Search + Header + List
    ├── {Entity}DetailView.tsx    # Detail + Edit/Delete
    ├── {Entity}FormView.tsx      # Create/Edit orchestrator
    └── components/
        ├── {Entity}Form.tsx      # react-hook-form + Yup
        ├── {Entity}Item.tsx      # Card navigates to detail
        └── {Entity}List.tsx      # FlashList + query hook
```

## Validation Rules

### R1: Every module has exactly 4 layers

- `domain/`, `infrastructure/`, `application/`, `ui/` must exist
- No extra top-level directories inside a module

### R2: Domain layer has no framework imports

- No `react`, `react-native`, `@tanstack`, `axios` imports
- Validation libraries are allowed in domain schema files

### R3: Repository interface defines the contract

- Uses `T | Error` return type (not throws)
- CRUD modules have exactly 5 methods: `getAll`, `getById`, `create`, `update`, `delete`

### R4: Service factory implements provider switching

- Reads `CONFIG.SERVICE_PROVIDER`
- Returns singleton via `export default create{Entity}Service()`
- Supports `'http'` and `'firebase'` cases

### R5: Application hooks follow naming convention

- Queries: `use{Entities}(filter?, enabled)` and `use{Entity}(id, enabled)`
- Mutations: `use{Entity}Create()`, `use{Entity}Update()`, `use{Entity}Delete()`

### R6: UI views follow naming convention

- `{Entities}ListView.tsx` - plural for list
- `{Entity}DetailView.tsx` - singular for detail
- `{Entity}FormView.tsx` - singular for form

## Anti-Patterns

| Anti-Pattern                   | Why It's Wrong          | Correct Approach                    |
| ------------------------------ | ----------------------- | ----------------------------------- |
| Service call in UI component   | Violates layer boundary | Use application hook                |
| Business logic in UI           | Untestable, duplicated  | Move to domain adapter              |
| Direct Axios call in component | Bypasses error handling | Use service via query hook          |
| Shared state in domain         | Domain must be pure     | Use Zustand store in core module    |
| Circular module imports        | Creates tight coupling  | Extract shared types to core module |

## Audit Checklist

- [ ] Module has all 4 layers
- [ ] Domain has zero framework imports
- [ ] Repository interface returns `T | Error`
- [ ] Service factory uses `CONFIG.SERVICE_PROVIDER`
- [ ] Application hooks convert `Error` to `throw`
- [ ] UI imports only from `application` and `domain` (types)
- [ ] File naming follows `{entity}.{layer}.ts` convention
- [ ] All user-facing strings are in Spanish
- [ ] Navigation types registered in `src/navigation/routes/`

## Example: Adding a New Module

```bash
# 1. Create directory structure
src/modules/orders/
  domain/
    order.model.ts
    order.repository.ts
    order.scheme.ts
    order.adapter.ts
  infrastructure/
    order.service.ts
    order.http.service.ts
    order.firebase.service.ts
  application/
    order.queries.ts
    order.mutations.ts
  ui/
    OrdersListView.tsx
    OrderDetailView.tsx
    OrderFormView.tsx
    components/
      OrderForm.tsx
      OrderItem.tsx
      OrderList.tsx

# 2. Register navigation
src/navigation/routes/orders.routes.ts
src/navigation/stacks/OrdersStackNavigator.tsx
src/navigation/hooks/useNavigation.ts  # Add useNavigationOrders

# 3. Register in root
src/navigation/routes/root.routes.ts   # Add to RootStackParamList
src/navigation/RootNavigator.tsx       # Add OrdersNavigator screen

# 4. Register API route
src/config/api.routes.ts               # Add ORDERS endpoint
src/config/collections.routes.ts       # Add ORDERS collection
```
