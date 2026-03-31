---
category: domain
priority: high
tags: [domain, models, repository, adapter]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Modelado en Domain

La capa `domain/` define entidades, payloads, filtros, contratos y adapters mínimos.

---

## Regla 1: Los módulos CRUD usan el shape actual del dominio

**SIEMPRE**: un módulo CRUD define:

- `{Feature}` como entidad principal
- `Create{Feature}Payload`
- `Update{Feature}Payload`
- `{Feature}Filter`

### Patrón esperado

```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Importante

- usar `Product`, `User`, etc. y no `ProductEntity` en `domain/*.model.ts`
- para features CRUD, `createdAt` y `updatedAt` son `Date`
- el repositorio se define en `domain/{feature}.repository.ts`

---

## Regla 2: Los adapters en domain son mínimos y específicos

**SIEMPRE**: crear solo adapters que realmente se necesiten.

### Patrón por defecto

- `FormData -> CreatePayload`

```typescript
export function productFormToPayloadAdapter(
  form: ProductFormData,
): CreateProductPayload {
  return {
    name: form.name,
    description: form.description,
    price: form.price,
  };
}
```

### NUNCA por defecto

- crear `{feature}EntityAdapter` si no hay transformación real
- mover lógica de UI o infraestructura a `domain/`

### Cómo verificar

```bash
# Domain no depende de frameworks de UI o data fetching
grep -r "from 'react\\|from '@tanstack\\|from 'axios" src/modules/*/domain/

# CRUD domain models no deberían usar sufijo Entity
grep -r "interface .*Entity" src/modules/*/domain/*.model.ts
```

**Referencias**:
- `src/modules/products/domain/product.model.ts`
- `src/modules/products/domain/product.repository.ts`
- `src/modules/products/domain/product.adapter.ts`
- `src/modules/users/domain/user.adapter.ts`
