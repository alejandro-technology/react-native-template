---
name: layer-application
description: >
  Create the application layer for a Clean Architecture module: React Query
  queries with offline fallback and placeholderData, mutations with toast
  feedback and storage sync, Zustand store with MMKV persistence, and utility
  hooks (useDebounce, useToggle). Use when implementing data fetching, caching,
  server state management, offline-first behavior, or CRUD operations for a
  feature module.
license: MIT
compatibility: React Native 0.83+, TypeScript strict mode, bun package manager. Requires project structure from react-native-template.
metadata:
  version: "1.0"
  category: architecture-layer
  layer: application
  workflow: scaffold
  output: src/modules/{module}/application/**
---

# Application Layer

Create the application layer for entity `$ARGUMENTS`.

## Files to Create

```
src/modules/{module}/application/
  {entities}.storage.ts     # Zustand store with MMKV persistence
  {entity}.queries.ts       # React Query query hooks
  {entity}.mutations.ts     # React Query mutation hooks
  {module}.hooks.ts         # Custom hooks (optional)
```

## Store Template
Zustand store with MMKV persistence for offline support.
→ See [references/templates.md](references/templates.md) for full code.

## Queries Template
React Query hooks with offline fallback.
→ See [references/templates.md](references/templates.md) for full code.

## Mutations Template
React Query mutation hooks with toast notifications.
→ See [references/templates.md](references/templates.md) for full code.

## Utility Hooks Template
Custom utility hooks for the module.
→ See [references/templates.md](references/templates.md) for full code.

## Rules

1. **Queries**: Always check connectivity, use `placeholderData` from storage
2. **Mutations**: Check connectivity before calling service, sync storage on success
3. **Toast**: Show success/error messages via `useAppStorage`
4. **Storage**: Use MMKV persistence, rehydrate Date fields
5. **Query Keys**: Use `QUERY_KEYS` from `@config/query.keys`

## Reference

- Example: `src/modules/products/application/`

## Validation

- [ ] `bun run typecheck` — hooks, store, and query types align
- [ ] All query keys use `QUERY_KEYS.{entity}.*` — no inline arrays
- [ ] Mutation calls `getIsConnected()` before the service call
- [ ] Zustand store has `partialize` that excludes action functions
- [ ] `mmkvReviver` is set in `onRehydrateStorage` for stores with Date fields
