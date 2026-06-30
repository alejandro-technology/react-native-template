---
trigger: always_on
---

# Architecture Rules

The template combines **Modular Architecture** (one self-contained module per
feature) with **Clean Architecture** layering inside each module. The goal is a
codebase where a feature can be read, tested, and swapped without leaking into
the rest of the app, and where the data backend is a configuration detail — not
a rewrite.

## Core Mandates

1. **Module = feature boundary.** Every feature is a folder in `src/modules/`
   that owns its four layers. Nothing about a feature lives outside its module
   except shared UI (`src/components`), config (`src/config`), and cross-cutting
   infrastructure modules (`network`, `firebase`, `supabase`, `sqlite`, `core`).
2. **Dependencies point inward.** `ui → application → infrastructure → domain`.
   An inner layer MUST NOT import from an outer one. `domain` imports nothing
   from the project and no React/framework code — only pure libraries (e.g.
   `yup`).
3. **The backend is swappable.** Infrastructure resolves its implementation from
   `CONFIG.SERVICE_PROVIDER` (`local | supabase | firebase | http | mock`)
   through a per-entity factory. Application and UI never know which backend is
   active.
4. **Program against interfaces.** Application and UI depend on the domain
   `Repository` interface, never on a concrete service.
5. **Cross-module access goes through the public boundary.** Import another
   module via `@modules/{module}/...`; import inside the same module via relative
   paths. Each module exposes an `index.ts`.

## The Four Layers

| Layer | Owns | May depend on |
|---|---|---|
| **domain** | Entities/payloads (`*.model.ts`), repository interface (`*.repository.ts`), validation (`*.scheme.ts`), form→payload adapter (`*.adapter.ts`), DTO mapper (`*.mapper.ts`), error mappers (`*.error.ts`) | nothing (pure TS + `yup`) |
| **infrastructure** | Service factory (`*.service.ts`) + provider implementations (`*.http/firebase/supabase/local/mock.service.ts`) | domain |
| **application** | React Query hooks (`*.queries.ts`, `*.mutations.ts`), Zustand stores (`*.storage.ts`), use-case logic | domain, infrastructure |
| **ui** | Screens (`*View.tsx`) and screen components | application, domain |

## File Structure

```
src/
├── components/             # Shared UI: core / form / layout
├── config/                 # config.ts, api.routes.ts, storage.ts, query.keys.ts…
├── modules/
│   └── {feature}/
│       ├── domain/         # model, repository, scheme, adapter, mapper, error
│       ├── infrastructure/ # {entity}.service.ts factory + provider impls
│       ├── application/     # queries, mutations, storage
│       ├── ui/             # {Entity}View screens + components/
│       └── index.ts        # public boundary
├── navigation/             # routes, stacks, hooks
├── providers/              # AppProvider composition (Secure, Query, Theme…)
├── theme/                  # design tokens + ThemeProvider
└── utils/                  # test-utils
```

## Module Taxonomy

Not every module implements all four layers. A module uses only the layers its
responsibility requires:

- **Feature module** — full 4 layers. Examples: `products`, `users`,
  `authentication`. Start from `products`.
- **Infrastructure module** — `domain` + `infrastructure` only; exposes a client
  and its error mapper for feature modules to build on. Examples: `network`
  (Axios singleton), `firebase`, `supabase`, `sqlite`.
- **Shared-state module** — `application` only. Example: `core` (global Zustand
  store: toast, modal, onboarding, searchbar).
- **Showcase module** — UI-heavy reference gallery. Example: `examples`.

## Module Naming & Registration

**Naming**

- Module folder: `kebab-case` — `src/modules/{module-name}/`.
- Entity-centric module: a singular `PascalCase` entity (`Product`, `Order`) with
  files named by layer role (`{entity}.model.ts`, `{entity}.service.ts`…).
- Capability/flow module: a semantic name describing the concern
  (`authentication`, `firebase`, `examples`).

**Registration — a module registers only what it uses**

- `config/query.keys.ts` — add keys only if the module uses React Query.
- `config/api.routes.ts` — add routes only if it consumes shared HTTP endpoints.
- `config/collections.routes.ts` — add collections only if it uses Firestore.
- Navigation (routes + stack + typed hook) — only if it exposes screens.
- `index.ts` — export only the public API (hooks, components, providers, types);
  never internal helpers.

## Do Not

- Do not import `infrastructure` or `application` from `domain`, or any
  React/framework code into `domain`.
- Do not import a concrete `*.{provider}.service.ts` from UI or application —
  always go through the factory singleton.
- Do not reach into another module's internal layers; cross only through
  `@modules/{module}`.
- Do not force a module to implement layers or providers it does not need.
- Do not put feature logic in `src/components`, `src/config`, or `src/utils`.

## See Also

- Error contract: [`error-handling.md`](./error-handling.md)
- State ownership: [`state-management.md`](./state-management.md)
