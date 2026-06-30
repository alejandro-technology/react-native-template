# Foundational Modules — Core & Network Rules

`src/modules/core/` and `src/modules/network/` are cross-cutting modules that
most of the app depends on. Treat them as stable infrastructure: prefer the
smallest safe change and preserve their public APIs unless the task clearly
requires an intentional contract change.

## Shared Mandates

1. **Stay generic.** Keep these modules cross-cutting. Feature-specific entities,
   endpoints, screens, copy, and business rules belong in their own modules.
2. **Guard the public surface.** Update each `index.ts` only when a new API must
   be public outside the module; never export internal helpers by default.
3. **Honor the contract.** Services return `Promise<T | Error>` / `Error`;
   infrastructure never throws intentionally.
4. **Language split.** Code, types, and file names in English; user-facing
   messages in Spanish.
5. **Minimize blast radius.** Avoid unnecessary renames, moved files, or behavior
   changes — many modules depend on these.
6. **No inward feature imports.** Never import a feature module into `core` or
   `network`.

## Core Module

- `application/app.storage.ts` is the app-wide transient UI store for shared UX
  (`modal`, `toast`, `searchbar`, `onboarding`). Keep it to cross-cutting UI
  coordination — not feature state or persisted business data.
- `ui/Modal.tsx` and `ui/Toast.tsx` are thin adapters over `useAppStorage`. Model
  new variants first in `domain/app.model.ts`, then wire the store and global
  wrapper.
- Global search state, if exposed, stays generic and reusable — never a dumping
  ground for feature-specific filters.
- `domain/utils/*` are pure, framework-free utilities.
- Permissions follow `domain → infrastructure → application`: contracts in
  `domain/permissions`, platform mapping in
  `infrastructure/permissions.service.ts`, hooks in
  `application/permissions/use-permissions.ts`.

## Network Module

- `infrastructure/axios-client.service.ts` is the shared low-level HTTP client
  (Axios interceptors for auth refresh). Keep it to transport, auth headers,
  refresh flow, and retry queueing; feature-specific calls stay in feature
  infrastructure services.
- `domain/network.error.ts` + `domain/network.messages.ts` are the single source
  of Axios error translation. Add new mappings there — never duplicate Axios
  parsing in feature modules.
- Connectivity is split intentionally: `application/connectivity.storage.ts` is
  the source of truth for non-React consumers via `getIsConnected()`; hooks and
  services subscribe for React usage.
- `application/use-netinfo.ts` exposes safe fallback values when connectivity
  cannot be read.
- Keep auth-expired handling decoupled: use the callback integration point the
  Axios client exposes — do not import `authentication` internals into `network`.

## Do Not

- Do not import feature modules into `core` or `network`.
- Do not duplicate Axios error parsing outside the `network` module.
- Do not export internal helpers from `index.ts`.
- Do not couple `network` to `authentication` internals.
- Do not put feature state or persisted business data in `app.storage.ts`.

After changing either module, run `bun run lint`, `bun run typecheck`, and
`bun run test`.

## See Also

- Layering and boundaries: [`architecture.md`](./architecture.md)
- Error translation contract: [`error-handling.md`](./error-handling.md)
- Connectivity and UI stores: [`state-management.md`](./state-management.md)
