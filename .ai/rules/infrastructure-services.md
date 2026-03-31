---
category: infrastructure
priority: high
tags: [services, providers, http, firebase, mock]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Servicios de Infrastructure

La capa `infrastructure/` implementa contratos del dominio usando el patrón de providers del proyecto.

---

## Regla 1: Todo módulo CRUD usa factory `http | firebase | mock`

**SIEMPRE**: un feature CRUD debe tener:

```text
infrastructure/
├── {feature}.service.ts
├── {feature}.http.service.ts
├── {feature}.firebase.service.ts
└── {feature}.mock.service.ts
```

### Factory obligatorio

- lee `CONFIG.SERVICE_PROVIDER`
- retorna el singleton del provider
- el único `throw` permitido en infrastructure está en el `default` del factory

```typescript
function createProductService(): ProductRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return productHttpService;
    case 'firebase':
      return productFirebaseService;
    case 'mock':
      return productMockService;
    default:
      throw new Error(
        `Unknown product service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}
```

---

## Regla 2: Los providers siguen el patrón actual del proyecto

### HTTP

- usa `axiosService`
- usa `API_ROUTES`
- maneja errores con `manageAxiosError`

### Firebase

- usa wrappers compartidos como `firestoreService`
- usa `manageFirebaseError`
- no usa SDK raw en módulos feature si ya existe wrapper compartido

### Mock

- implementa el mismo contrato del repositorio
- respeta exactamente el shape del dominio, especialmente `Date`

### Regla transversal

**SIEMPRE**: los métodos async retornan `Promise<T | Error>` o `Promise<void | Error>`, nunca lanzan excepciones.

### Cómo verificar

```bash
# Infrastructure no lanza throw dentro de métodos async
grep "throw" src/modules/*/infrastructure/*.service.ts

# Servicios Firebase de features usan wrappers compartidos
grep -r "firestoreService" src/modules/*/infrastructure/*.firebase.service.ts
```

**Referencias**:
- `src/modules/products/infrastructure/product.service.ts`
- `src/modules/products/infrastructure/product.http.service.ts`
- `src/modules/products/infrastructure/product.firebase.service.ts`
- `src/modules/products/infrastructure/product.mock.service.ts`
