# Error Handling Rules

Errors are **values, not control flow**. A failure travels as a returned `Error`
through the service boundary, gets normalized once at the infrastructure edge,
and is only converted back into a throw at the application layer where React
Query and the toast system can act on it. This keeps services pure, predictable,
and trivially testable.

## Core Mandates

1. **Services never throw.** Every repository method returns
   `Promise<T | Error>`. Failures are caught inside the service and returned.
2. **Normalize at the backend edge.** Each `catch` returns the result of that
   backend's mapper — never a raw `error`. Mappers live in the infrastructure
   module's domain: `manageAxiosError` (`network`), `manageFirebaseError`
   (`firebase`), `manageSupabaseError` (`supabase`), `manageSqliteError`
   (`sqlite`).
3. **Tag the error, localize the message.** Mappers set `error.name` to a typed
   tag (`FormError`, `UnauthorizedError`, `NotFoundError`, `ConflictError`,
   `RateLimitError`…) for branching, and set `error.message` to a Spanish,
   UI-ready string from the module's messages constant.
4. **Re-throw at the application boundary.** In `queryFn`/`mutationFn`, check
   `instanceof Error` and throw so React Query enters its error state.
5. **Surface, never swallow.** Mutation errors become a toast; query errors
   become an `ErrorState`. An error is never silently dropped.

## TypeScript Conventions

- `interface` for object shapes; `type` for unions and aliases.
- `InferType<typeof schema>` (yup) for form data types — never hand-write them.
- `Omit` / `Pick` / `Partial` for prop and payload variations.

## Where Each Step Lives

```
domain/{name}.error.ts        — maps unknown failures to a tagged, localized Error
domain/{name}.messages.ts     — Spanish, UI-facing message constants
infrastructure/*.service.ts   — catches and returns the mapped Error, never throws
application/*.queries.ts       — re-throws the value-error so React Query reports it
application/*.mutations.ts     — offline guard plus toast on failure
ui/**                         — ErrorState for queries; global toast for mutations
```

## Do Not

- Do not `throw` from a service method, and do not return a raw caught `error` —
  return a mapped `Error`.
- Do not parse transport errors (status codes, Firebase codes) inside feature
  services — delegate to the backend mapper.
- Do not check `instanceof Error` and then ignore it; always throw, toast, or
  render an error state.
- Do not write user-facing message strings in English — UI messages are Spanish.
- Do not branch on `error.message` text; branch on `error.name`.

## See Also

- Architecture boundaries: [`architecture.md`](./architecture.md)
- State & toast ownership: [`state-management.md`](./state-management.md)
