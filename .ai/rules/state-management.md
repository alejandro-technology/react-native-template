---
trigger: always_on
---

# State Management Rules

State is split by **ownership**, not by convenience. **React Query owns server
state** — it is the runtime source of truth for anything that comes from a
backend. **Zustand owns client state** — UI/session state and an offline cache.
The two never compete: persistent Zustand stores feed React Query as
`placeholderData` and offline fallback, but React Query, once online, wins.

## Core Mandates

1. **Server data lives in React Query.** Fetch, cache, and invalidate through
   `useQuery`/`useMutation`. Never copy server data into Zustand as a second
   source of truth.
2. **Keys come from `QUERY_KEYS`.** Always use the factory in
   `@config/query.keys.ts` — never inline a key array. Keys are hierarchical.
3. **Client state lives in Zustand**, in one of four well-defined store kinds
   (below). Each store owns one concern.
4. **Selector hook inside React, `.getState()` outside.** In components,
   subscribe with a narrow selector. In non-React code (`queryFn`, `mutationFn`,
   services, tests) read with `.getState()` — never call a hook outside render.
5. **Persist data, not actions.** Persisted stores use `partialize` to store
   only data and `onRehydrateStorage` to revive `Date`s via `mmkvReviver`.

## Store Taxonomy

| Kind | Example | Persisted? | Purpose |
|---|---|---|---|
| **Per-module entity cache** | `products.storage.ts` | MMKV | Offline cache + `placeholderData`; CRUD helpers mirror server ops |
| **Global app/UI store** | `core/app.storage.ts` | No | Ephemeral UI: toast, modal, onboarding, searchbar |
| **Connectivity store** | `network/connectivity.storage.ts` | No | `isConnected` + `getIsConnected()` getter + `useIsConnected()` hook |
| **Session store** | `authentication/.../auth.storage.ts` | Secure MMKV | Auth/session state |

## Persistence

- General data → `mmkvStorage` (`@config/storage`), the MMKV-backed
  `StateStorage` adapter for `zustand/persist`.
- Sensitive data (tokens, credentials) → Keychain-backed encrypted MMKV
  (`getSecureStorage()` / `secureMMKVStorage`).
- `Date`s serialize to ISO strings; `mmkvReviver` rehydrates matching strings
  back to `Date` in `onRehydrateStorage`.

## Do Not

- Do not treat a Zustand entity store as the source of truth for server data —
  it is a cache.
- Do not inline query keys; route them through `QUERY_KEYS`.
- Do not call selector hooks inside `queryFn`/`mutationFn`, services, or tests —
  use `.getState()`.
- Do not persist actions or transient flags; `partialize` data only.
- Do not store tokens/credentials in the plain `mmkvStorage` — use the
  Keychain-backed secure storage.
- Do not subscribe to a whole store when a slice selector suffices (avoids
  needless re-renders).

## See Also

- Architecture boundaries: [`architecture.md`](./architecture.md)
- Error propagation into toasts: [`error-handling.md`](./error-handling.md)
