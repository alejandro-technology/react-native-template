---
category: forms
priority: high
tags: [forms, react-hook-form, yup, formdata]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Flujo de Formularios

Los formularios deben seguir un flujo consistente entre `domain`, `ui` y `application`.

---

## Regla 1: El contrato del formulario nace en `domain/`

**SIEMPRE**: cada feature con formulario define:

- `domain/{feature}.scheme.ts`
- `type {Feature}FormData = InferType<typeof schema>`

### Patrón esperado

```typescript
export const productSchema = yup.object({
  name: yup.string().required('El nombre es requerido'),
});

export type ProductFormData = InferType<typeof productSchema>;
```

### Importante

- validaciones y mensajes visibles al usuario van en español
- `FormData` es el contrato entre `ui` y `application`

---

## Regla 2: `FormView` orquesta y `Form.tsx` renderiza

**SIEMPRE**:

- `ui/components/{Feature}Form.tsx` contiene `useForm`, `yupResolver` y los campos
- `{Feature}FormView.tsx` decide create/edit, prepara `initialData` y llama a la mutation

```typescript
function handleSubmit(form: ProductFormData) {
  if (isEditing) {
    updateProduct({ id: product.id, form });
  } else {
    createProduct(form);
  }
}
```

**NUNCA**:

- construir payloads en `FormView`
- meter lógica grande de formulario dentro de `*View.tsx`

### Cómo verificar

```bash
# Los forms deben usar react-hook-form + yupResolver
grep -r "useForm<\\|yupResolver" src/modules/*/ui/components/*.tsx

# Las FormView deben pasar FormData a la mutation
grep -r "form }\\|create.*(form)\\|update.*form" src/modules/*/ui/*FormView.tsx
```

**Referencias**:
- `src/modules/products/domain/product.scheme.ts`
- `src/modules/products/ui/components/ProductForm.tsx`
- `src/modules/products/ui/ProductFormView.tsx`
