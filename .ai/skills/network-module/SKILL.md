---
name: network-module
description: Work safely inside src/modules/network for shared axios, auth refresh, connectivity state, NetInfo hooks, and Axios error mapping. Use when adding or changing transport concerns, offline detection, or normalized network errors.
license: MIT
compatibility: opencode
metadata:
  layer: infrastructure
  workflow: scaffold
  output: src/modules/network/**
---

# Network Module

Handle this task in `src/modules/network/`: $ARGUMENTS

## Decide if Network Is the Right Place

- Put the change here only if it is cross-cutting transport or connectivity behavior.
- Feature endpoints, repository methods, and entity-specific request shaping belong in each feature module infrastructure.
- UI toasts, modals, or session UX belong in `core` or providers, not here.

## Module Purpose

`network` owns shared transport concerns that all features can reuse:

- the low-level axios client and interceptor lifecycle
- auth token injection and refresh queueing
- generic connectivity detection and subscription
- normalized network error translation

If a change knows about a specific entity, screen, or feature use case, it probably belongs in that feature module rather than here.

## Current Structure

- `infrastructure/axios-client.service.ts`: shared axios instance, auth header injection, refresh queue, and auth-expired callback
- `infrastructure/netinfo.service.ts`: adapter over `@react-native-community/netinfo`
- `application/connectivity.storage.ts`: connectivity source for non-React code
- `application/use-netinfo.ts`: React hooks for connectivity state
- `domain/network.error.ts` and `domain/network.messages.ts`: shared Axios error normalization
- `index.ts`: public exports

## Public API Surface

- `src/modules/network/index.ts` is the public entry point.
- Export only the helpers, hooks, and types that other modules should consume.
- Keep queue internals, interceptor internals, and translation details private unless there is a concrete reuse need.

## Working Rules

1. Keep `axios-client.service.ts` low-level and generic. Do not add feature URLs, toast calls, or business rules.
2. Extend `manageAxiosError` and `AXIOS_MESSAGES` centrally instead of scattering Axios parsing across features.
3. Preserve the callback-based decoupling for auth expiration; do not import auth module internals here.
4. Use `getIsConnected()` for non-React consumers and hooks or store subscriptions for React consumers.
5. Expose safe fallback values when network state is unknown or fetching fails.
6. If a new helper or type is meant to be reused, export it from `src/modules/network/index.ts`.

## Common Change Flows

### Add a new Axios error mapping

1. Add or extend the user-facing message in `domain/network.messages.ts`.
2. Map the status code or axios error shape in `domain/network.error.ts`.
3. Preserve the existing pattern of meaningful `Error.name` values when needed.
4. Keep feature modules consuming the centralized translation instead of reimplementing it.

### Change token refresh behavior

1. Keep the refresh flow inside `infrastructure/axios-client.service.ts`.
2. Preserve queue behavior for concurrent 401 requests.
3. Keep auth expiration decoupled through `setAuthExpiredCallback()`.
4. Avoid coupling refresh logic to feature hooks, screens, or providers.

### Add connectivity behavior

1. Adapt raw library output in `infrastructure/netinfo.service.ts`.
2. Keep non-React state access in `application/connectivity.storage.ts`.
3. Keep React-friendly subscription logic in `application/use-netinfo.ts`.
4. Default unknown states to safe fallbacks for consumers.

## Axios Service Boundaries

- Allowed here: base URL, headers, timeouts, interceptors, token storage keys, refresh queueing, auth-expired callback wiring.
- Not allowed here: feature endpoint methods, domain payload shaping, toast rendering, modal rendering, navigation side effects.
- If a feature needs a new endpoint, add it to that feature's infrastructure service and reuse the shared axios client.

## Error Handling Rules

- Prefer one centralized translation path through `manageAxiosError()`.
- Return messages suitable for end users in Spanish.
- Keep internal branching based on axios codes, HTTP status, and backend payload shape.
- Preserve backward-compatible error names when the app may already branch on them.

## Connectivity Rules

- `getIsConnected()` is the source for code running outside React hooks or components.
- `useNetInfo()` should keep returning safe booleans even when the raw provider returns `null`.
- `netinfo.service.ts` should normalize third-party library shapes into the local domain model.
- Avoid leaking raw `@react-native-community/netinfo` types beyond the infrastructure boundary unless there is a strong reason.

## Anti-Patterns

- Do not add feature-specific repository methods here.
- Do not import auth module internals into `network`.
- Do not show UI directly from `network`.
- Do not duplicate axios error parsing inside feature services.
- Do not bypass the shared axios client for ordinary HTTP traffic unless there is a documented reason.

## Quality Bar

- Changes must remain transport-level and generic.
- Public exports should stay small and intentional.
- Unknown or failing connectivity states should degrade safely.
- Favor minimal changes because this module is consumed broadly.

## Checklist

- Confirm the change is transport-level and not feature-specific.
- Keep user-facing network messages in Spanish.
- Preserve `Promise<T | Error>` or `Error` service contracts.
- Avoid direct coupling to auth internals, providers, or feature modules.
- Run `bun run lint`, `bun run typecheck`, and `bun run test`.
