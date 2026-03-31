---
category: modules
priority: medium
tags: [module-api, barrel-exports, boundaries]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de API Pública del Módulo

Cada módulo debe exponer una superficie pública mínima y estable mediante `src/modules/{feature}/index.ts`.

---

## Regla 1: `index.ts` es la API pública del módulo

**SIEMPRE**: exponer desde el barrel solo lo necesario para consumir el módulo desde afuera.

### Exportar normalmente

- hooks de `application`
- tipos de `domain`
- contratos públicos del repositorio

```typescript
export { useProducts, useProduct } from './application/product.queries';
export {
  useProductCreate,
  useProductUpdate,
  useProductDelete,
} from './application/product.mutations';
export type { Product, CreateProductPayload } from './domain/product.model';
```

---

## Regla 2: No exportar detalles internos

**NUNCA** exponer desde `index.ts`:

- servicios de `infrastructure`
- componentes de `ui`
- helpers internos que no formen parte del contrato público

### Regla práctica

- desde fuera del módulo, preferir `@modules/{feature}`
- dentro del propio módulo, preferir imports relativos entre capas

### Cómo verificar

```bash
# Revisar barrels de módulos
ls src/modules/*/index.ts

# Los barrels no deberían exportar infrastructure ni ui
grep -r "infrastructure\\|/ui/" src/modules/*/index.ts
```

**Referencias**:
- `src/modules/products/index.ts`
- `src/modules/users/index.ts`
