# Core and Network Module Rules

`src/modules/core/` and `src/modules/network/` are foundational modules. Prefer the smallest safe change and preserve their public APIs unless the task clearly requires an intentional contract change.

## Shared Guardrails

1. Keep these modules generic and cross-cutting. Feature-specific entities, endpoints, screens, copy, and business rules belong in their own modules.
2. Update each module `index.ts` only when a new API should be public outside the module. Do not export internal helpers by default.
3. Respect the project contract: services return `Promise<T | Error>` or `Error`; infrastructure code should not throw intentionally.
4. Code, types, and file names stay in English. User-facing messages stay in Spanish.
5. Because many parts of the app depend on these modules, avoid unnecessary renames, moved files, or behavior changes.

## Core Module

- `application/app.storage.ts` is the app-wide transient UI store for shared UX orchestration such as `modal`, `toast`, `searchbar`, and other truly global flows like onboarding. Keep it focused on cross-cutting UI coordination, not feature state or persisted business data.
- `ui/Modal.tsx` and `ui/Toast.tsx` are thin adapters over `useAppStorage`. New modal/toast variants should be modeled first in `domain/app.model.ts`, then wired through the store and global wrapper.
- Global search state, if exposed from `app.storage.ts`, should remain generic and reusable across screens. Do not turn it into a dumping ground for feature-specific filters.
- `domain/utils/*` are pure shared utilities. Keep them framework-free and reusable.
- Permissions follow `domain -> infrastructure -> application`: define types and contracts in `domain/permissions`, platform mapping in `infrastructure/permissions.service.ts`, and React hooks in `application/permissions/use-permissions.ts`.
- Do not import feature modules into `core`.

## Network Module

- `infrastructure/axios-client.service.ts` is the shared low-level HTTP client (using Axios interceptors for auth refresh). Keep it focused on transport concerns, auth headers, refresh flow, and retry queueing; feature-specific API calls stay in feature infrastructure services.
- `domain/network.error.ts` and `domain/network.messages.ts` are the single place for shared Axios error translation. Add new mappings there instead of duplicating Axios parsing in feature modules.
- Connectivity is split intentionally: `application/connectivity.storage.ts` is the source of truth for non-React consumers via `getIsConnected()`, and hooks/services subscribe for React usage.
- `application/use-netinfo.ts` should expose safe fallback values when connectivity cannot be read.
- Keep auth-expired handling decoupled from feature auth internals. If `axios-client.service.ts` exposes a callback-based integration point, use that boundary instead of importing authentication module internals into `network`.

## Verification

- After touching either module, run `bun run lint`, `bun run typecheck`, and `bun run test`.
