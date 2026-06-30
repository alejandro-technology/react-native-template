---
trigger: always_on
---

# Conventions Rules

Cross-cutting code and language conventions that every module follows,
regardless of layer. These keep the codebase uniform and the product Spanish.

## Language

- **English** for code, types, identifiers, file names, and comments.
- **Spanish** for all user-facing text — UI copy, button labels, validation
  messages, toasts, and error messages.
- Dates render with Spanish month abbreviations (`Ene`, `Feb`…) via
  `core/domain/date.utils`.

## TypeScript

- `interface` for object shapes; `type` for unions and aliases.
- `InferType<typeof schema>` (yup) for form data types — never hand-write them.
- `Omit` / `Pick` / `Partial` for prop and payload variations.
- Full result/error contract lives in `error-handling.md`.

## Imports

- Group and order imports: external libraries → domain/types → config & theme →
  components & modules. Separate groups with a blank line.
- Use path aliases (`@config`, `@components`, `@theme`, `@modules`, `@utils`)
  instead of deep relative chains.
- Cross-module access uses `@modules/{module}/...`; same-module uses relative
  paths.

## Do Not

- Do not write UI-facing strings in English.
- Do not write identifiers, types, or file names in Spanish.
- Do not use deep relative import chains when a path alias exists.
- Do not mix unrelated concerns across import groups.

## See Also

- Result and error contract: [`error-handling.md`](./error-handling.md)
- Module naming and boundaries: [`architecture.md`](./architecture.md)
