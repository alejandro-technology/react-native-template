---
category: forms
priority: high
tags: [forms, react-hook-form, yup, formdata, async]
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
async function handleSubmit(form: ProductFormData) {
  try {
    if (isEditing) {
      await updateProduct({ id: product.id, form });
    } else {
      await createProduct(form);
    }
    goBack();
  } catch {
    // Error is handled by mutation's onError callback (shows toast)
  }
}
```

**IMPORTANTE**: `goBack()` debe llamarse **DESPUÉS** de `await` la mutation, no antes. Esto previene race conditions donde el usuario vuelve antes de saber si la operación fue exitosa.

**NUNCA**:

- construir payloads en `FormView`
- meter lógica grande de formulario dentro de `*View.tsx`
- llamar `goBack()` sin esperar el resultado de la mutation

---

## Regla 3: La mutation maneja errores con toast

**SIEMPRE**: la mutation define `onError` que muestra un toast con el mensaje de error.

```typescript
export function useProductCreate() {
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (form: ProductFormData) => {
      const payload = productFormToPayloadAdapter(form);
      const result = await productService.create(payload);
      if (result instanceof Error) throw result;
      return result;
    },
    onSuccess: () => {
      show({ message: 'Producto creado exitosamente', type: 'success' });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() });
    },
    onError: (error: Error) => {
      show({ message: error.message, type: 'error' });
    },
  });
}
```

### Cómo verificar

```bash
# Los forms deben usar react-hook-form + yupResolver
grep -r "useForm<\\|yupResolver" src/modules/*/ui/components/*.tsx

# Las FormView deben pasar FormData a la mutation y usar await
grep -r "await.*Product\\|await.*User" src/modules/*/ui/*FormView.tsx
```

**Referencias**:
- `src/modules/products/domain/product.scheme.ts`
- `src/modules/products/ui/components/ProductForm.tsx`
- `src/modules/products/ui/ProductFormView.tsx`
- `src/modules/products/application/product.mutations.ts`
