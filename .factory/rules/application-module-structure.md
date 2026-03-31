---
category: application
priority: high
tags: [application, react-query, hooks, storage, cache]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Estructura de Application

La capa `application/` centraliza la orquestación de estado para la UI: queries, mutations, hooks reutilizables y stores de aplicación.

---

## Regla 1: `application/` agrupa la orquestación del módulo

**SIEMPRE**: los archivos de `application/` pertenecen a una de estas categorías:

- `*.queries.ts` → queries de React Query
- `*.mutations.ts` → mutations de React Query
- `*.hooks.ts` → hooks reutilizables sin UI
- `*.storage.ts` → stores de aplicación (por ejemplo, Zustand)

### Límites de importación

- `application` puede importar desde `domain` e `infrastructure`
- `application` **NO** debe importar desde `ui`
- `hooks.ts` y `storage.ts` deben mantenerse agnósticos de componentes visuales

---

## Regla 2: Los feature modules usan `queries.ts` y `mutations.ts`

**SIEMPRE**: en módulos CRUD, `application/` usa React Query y consume servicios de `infrastructure/`.

### Patrón obligatorio en queries y mutations

- `queries.ts` usa `useQuery`
- `mutations.ts` usa `useMutation`
- la capa `application` importa tipos de filtro desde `domain/{feature}.repository.ts`
- si un servicio retorna `Error`, la query o mutation debe hacer `throw`
- las feature queries usan `QUERY_KEYS` centralizados

```typescript
export function useProducts(filter?: ProductFilter, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(filter?.searchText),
    queryFn: async () => {
      const result = await productService.getAll(filter);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled,
  });
}
```

---

## Regla 3: Las mutations reciben `FormData`, no payload desde UI

**SIEMPRE**: la mutation recibe `FormData` desde `ui/` y hace la adaptación a payload internamente.

### Responsabilidades

- llamar `{feature}FormToPayloadAdapter(form)` dentro de `mutationFn`
- mostrar toast en `onSuccess` y `onError`
- invalidar `QUERY_KEYS` relevantes

```typescript
mutationFn: async (form: ProductFormData) => {
  const payload = productFormToPayloadAdapter(form);
  const result = await productService.create(payload);
  if (result instanceof Error) {
    throw result;
  }
  return result;
}
```

**NUNCA**:

- llamar adapters desde `*View.tsx`
- mover toasts o invalidaciones a la capa `ui`
- definir `queryKey` inline en feature modules si ya existe en `src/config/query.keys.ts`

---

## Regla 4: `hooks.ts` se usa para hooks reutilizables y shared hooks

**SIEMPRE**: `*.hooks.ts` contiene hooks reutilizables que no renderizan UI.

### Casos válidos

#### Hooks de comportamiento local reutilizable

Ejemplo: `src/modules/core/application/core.hooks.ts`

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // ...
  return debouncedValue;
}
```

#### Hooks shared basados en React Query

Ejemplo: `src/modules/firebase/application/firestore.hooks.ts`

- pueden usar `useQuery`, `useMutation` y `useQueryClient`
- pueden usar query keys locales si son hooks shared transversales
- deben mantener prefijos de cache consistentes, por ejemplo `['firestore', ...]`

**NUNCA**:

- importar componentes o estilos en `*.hooks.ts`
- meter JSX o lógica de render

---

## Regla 5: `storage.ts` se usa para estado de aplicación

**SIEMPRE**: `*.storage.ts` contiene stores de aplicación, normalmente con Zustand.

### Casos válidos

- `src/modules/core/application/app.storage.ts`
- `src/modules/authentication/application/auth.storage.ts`

### Responsabilidades

- exponer estado y acciones consumidas por la UI o por `application`
- usar tipos del dominio cuando aplique
- persistir estado solo cuando el módulo lo necesita

**NUNCA**:

- mover rendering o componentes a `storage.ts`
- mezclar servicios HTTP/Firebase dentro del store si el caso pertenece a `infrastructure`

### Cómo verificar

```bash
# Queries y mutations convierten Error en throw
grep -r "instanceof Error" src/modules/*/application/*.ts

# Feature modules usan QUERY_KEYS centralizados
grep -r "QUERY_KEYS\\." src/modules/*/application/*.ts

# Application no debe importar desde ui
grep -r "from.*ui" src/modules/*/application/*.ts
```

**Referencias**:
- `src/modules/core/application/core.hooks.ts`
- `src/modules/core/application/app.storage.ts`
- `src/modules/authentication/application/auth.storage.ts`
- `src/modules/firebase/application/firestore.hooks.ts`
- `src/modules/products/application/product.queries.ts`
- `src/modules/products/application/product.mutations.ts`
- `src/modules/users/application/user.mutations.ts`
