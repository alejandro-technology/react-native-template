---
name: core-module
description: Work safely inside src/modules/core for global modal or toast state, permissions, and pure shared utilities. Use when adding or changing cross-cutting app state, permission flows, or exported core helpers.
license: MIT
compatibility: opencode
metadata:
  layer: core
  workflow: scaffold
  output: src/modules/core/**
---

# Core Module

Handle this task in `src/modules/core/`: $ARGUMENTS

## Decide if Core Is the Right Place

- Put the change here only if it is shared across features or app-wide.
- If the work is a reusable primitive component, prefer `src/components/` plus theme style factories.
- If the work is about axios, connectivity, or transport concerns, use `network-module` instead.
- If the change is feature-specific, update that feature module instead of `core`.

## Module Purpose

`core` exists for app-wide capabilities that many features can depend on safely:

- global transient UX state like modal, toast, and searchbar orchestration
- shared React hooks with no feature ownership
- pure utility helpers reused across modules
- permission contracts and permission access helpers

If the change introduces product-specific copy, entity semantics, API knowledge, or screen logic, it probably does not belong here.

## Current Structure

- `application/app.storage.ts`: global modal, toast, and searchbar Zustand state
- `application/core.hooks.ts`: shared React hooks like `useDebounce`
- `application/permissions/use-permissions.ts`: React permission hooks
- `domain/app.model.ts`: modal, toast, and searchbar contracts
- `domain/utils/*`: pure format, date, and currency helpers
- `infrastructure/permissions.service.ts`: platform permission mapping and service implementation
- `ui/Modal.tsx` and `ui/Toast.tsx`: thin global wrappers

## Public API Surface

- `src/modules/core/index.ts` is the public entry point.
- Only export APIs that should be reused outside the module.
- Keep internal implementation details private when they are only used by `core` itself.
- When adding a new export, keep the grouping style already used in `index.ts`.

## Working Rules

1. Model new modal, toast, or searchbar contracts in `domain/app.model.ts` first.
2. Keep `useAppStorage` focused on app-wide ephemeral UX state. Do not move feature state here.
3. Keep utilities in `domain/utils` pure and framework-free.
4. Permission changes must preserve the layered split:
   domain: types and repository contract
   infrastructure: `react-native-permissions` integration and platform mapping
   application: React hooks that expose friendly state and actions
5. Services return `Error` instead of throwing.
6. If the new API should be public, export it from `src/modules/core/index.ts`.

## Common Change Flows

### Add a new modal variant

1. Add the discriminated union shape in `domain/app.model.ts`.
2. Update `application/app.storage.ts` only if the store contract needs extra state.
3. Create or update the rendering component under `ui/components/`.
4. Wire the variant selection in `ui/Modal.tsx`.
5. Export new types only if consumers outside `core` need them.

### Add a new toast capability

1. Extend `ToastType`, `ToastPosition`, or `ToastShowParams` in `domain/app.model.ts`.
2. Keep store updates in `application/app.storage.ts` minimal.
3. Preserve `ui/Toast.tsx` as a thin adapter over the core `Toast` component.

### Add or change a shared utility

1. Keep the function pure.
2. Avoid React, Zustand, navigation, or storage imports.
3. Prefer extending an existing utility file before creating a new one when the concern matches.
4. Export from `index.ts` only if the helper is truly shared.

### Add or change a permission

1. Update `domain/permissions/permissions.model.ts` first.
2. Reflect the platform mapping in `infrastructure/permissions.service.ts`.
3. Keep hook ergonomics in `application/permissions/use-permissions.ts` simple and consistent.
4. Unsupported permissions should degrade safely to `unavailable` instead of breaking consumers.

## Design Constraints

- `ui/Modal.tsx` and `ui/Toast.tsx` should stay thin and declarative.
- `app.storage.ts` is not a dumping ground for global state. Only keep state that truly belongs to global UX orchestration.
- Prefer extending existing unions and contracts over creating parallel boolean flags.
- Avoid adding persistence here unless there is a clear app-wide need.

## Anti-Patterns

- Do not import feature modules into `core`.
- Do not add screen-specific or entity-specific modal variants.
- Do not make utilities depend on React Native APIs if they can stay pure.
- Do not throw from permission services when the module convention is to return `Error`.
- Do not export every helper by default just because it exists.

## Quality Bar

- Names should be generic enough to survive reuse across features.
- User-facing strings remain in Spanish.
- Internal identifiers, types, and file names remain in English.
- Favor the smallest safe API change because many modules may already depend on `core`.

## Checklist

- Confirm the change is cross-cutting and not feature-specific.
- Keep user-facing text in Spanish.
- Avoid importing feature modules into `core`.
- Update public exports only when needed.
- Run `bun run lint`, `bun run typecheck`, and `bun run test`.
