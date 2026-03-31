---
category: cache
priority: high
tags: [query-keys, react-query, invalidation, cache]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Query Keys y Cache

La cache de React Query debe estar centralizada y ser consistente entre módulos.

---

## Regla 1: Las query keys viven en `src/config/query.keys.ts`

**SIEMPRE**: definir keys en `QUERY_KEYS`, no inline dentro de queries o mutations.

### Patrón actual

```typescript
export const QUERY_KEYS = {
  PRODUCTS: (search = '') => ['products', 'search', search],
  PRODUCT_DETAIL: (id: string) => ['products', 'detail', id],
};
```

### Beneficios

- naming consistente
- invalidaciones predecibles
- menos duplicación entre módulos

---

## Regla 2: Invalidar lo mínimo necesario después de mutaciones

**SIEMPRE**:

- `create` invalida la lista
- `update` invalida lista + detail
- `delete` invalida la lista

```typescript
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() });
queryClient.invalidateQueries({
  queryKey: QUERY_KEYS.PRODUCT_DETAIL(variables.id),
});
```

**NUNCA**:

- usar strings hardcodeados como `['products']` dentro de `application`
- invalidar caches no relacionadas sin necesidad

### Cómo verificar

```bash
# Las queries/mutations deben usar QUERY_KEYS
grep -r "QUERY_KEYS\\." src/modules/*/application/*.ts

# Revisar si hay queryKey inline que deberían centralizarse
grep -r "queryKey: \\[" src/modules/*/application/*.ts
```

**Referencias**:
- `src/config/query.keys.ts`
- `src/modules/products/application/product.queries.ts`
- `src/modules/products/application/product.mutations.ts`
