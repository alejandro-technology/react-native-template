---
paths:
  - 'src/modules/*/ui/*FormView.tsx'
  - 'src/modules/*/ui/components/*Form.tsx'
  - 'src/modules/*/domain/*.scheme.ts'
  - 'src/modules/*/domain/*.adapter.ts'
---

# Form Handling Rules

The project uses a strict pattern for forms, separating the UI orchestration from the form state management.

## Core Mandates

1. **Library Stack**: ALWAYS use `react-hook-form` paired with `@hookform/resolvers/yup` and `yup` for validation.
2. **Separation of Concerns**:
   - `{Entity}FormView.tsx` handles navigation, fetching initial data (if editing), and invoking React Query mutations (`use{Entity}Create`, `use{Entity}Update`). It does NOT contain `react-hook-form` hooks.
   - `{Entity}Form.tsx` contains the `useForm` hook, form fields, layout, and calls `handleSubmit(onSubmit)`. It receives initial default values as props and an `onSubmit` callback.
3. **Schemas**: Validation schemas must live in `src/modules/{module}/domain/{entity}.scheme.ts`. Use `InferType` to generate the TypeScript type for the form data.
4. **Adapters**: Form data often differs from API payloads. Use adapters in `src/modules/{module}/domain/{entity}.adapter.ts` to map `FormData` to `CreatePayload` or `UpdatePayload`.
5. **Form Components**: ALWAYS use the wrapped input components from `src/components/form/` (e.g., `TextInput`, `Select`, `Checkbox`) which already integrate with `useController`.

_For implementation details and golden examples, load the `form-handling` skill._
