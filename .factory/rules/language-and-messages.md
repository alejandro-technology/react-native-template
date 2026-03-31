---
category: language
priority: medium
tags: [language, naming, messages, validations]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Idioma y Mensajes

El proyecto mezcla inglés técnico con español orientado al usuario. Esa convención debe mantenerse.

---

## Regla 1: Código y contratos técnicos en inglés

**SIEMPRE** usar inglés para:

- nombres de tipos
- variables
- funciones
- hooks
- repositorios
- payloads y filtros

### Ejemplos correctos

- `Product`
- `CreateProductPayload`
- `handleSubmit`
- `useProducts`

---

## Regla 2: UI, validaciones y mensajes visibles al usuario en español

**SIEMPRE** usar español para:

- títulos y labels de UI
- mensajes de validación de Yup
- toasts
- errores pensados para usuario final

```typescript
yup.string().required('El nombre es requerido');

show({
  message: 'Producto creado exitosamente',
  type: 'success',
});
```

**NUNCA** mezclar:

- código en español
- mensajes de usuario en inglés en features CRUD existentes

### Cómo verificar

```bash
# Revisar mensajes de validación
grep -r "required('\\|typeError('\\|max('" src/modules/*/domain/*.scheme.ts

# Revisar toasts y mensajes visibles al usuario
grep -r "message:" src/modules/*/application/*.mutations.ts src/modules/*/ui/*.tsx
```

**Referencias**:
- `src/modules/products/domain/product.scheme.ts`
- `src/modules/products/application/product.mutations.ts`
- `CLAUDE.md` sección "Idioma"
