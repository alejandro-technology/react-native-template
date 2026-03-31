---
description: Crear módulo CRUD siguiendo arquitectura del template
argument-hint: <module-name>
---

Implementa un módulo CRUD nuevo llamado: `$ARGUMENTS`

Requisitos:
- Basarte en `src/modules/products` como referencia principal
- Respetar Clean Architecture por capas (`domain`, `infrastructure`, `application`, `ui`)
- Seguir reglas de `.factory/rules/` (UI module structure, services, adapters, public API, boundaries)
- Mantener naming en inglés para código y tipos
- Incluir `index.ts` (barrels) donde corresponda
- Registrar navegación/rutas si aplica
- Mantener provider factory (`http | firebase | mock`) cuando aplique

Proceso:
1. Crear estructura de carpetas/archivos:
   - `domain/`: `{feature}.model.ts`, `{feature}.repository.ts`, `{feature}.scheme.ts`, `{feature}.adapter.ts`
   - `infrastructure/`: `{feature}.service.ts`, `{feature}.http.service.ts`, `{feature}.firebase.service.ts`, `{feature}.mock.service.ts`
   - `application/`: `{feature}.queries.ts`, `{feature}.mutations.ts`
   - `ui/`: `{feature}ListView.tsx`, `{feature}DetailView.tsx`, `{feature}FormView.tsx`, `components/`

2. Implementar contratos de dominio:
   - Models con `Date` para fechas (no `string`)
   - Repository interface con retorno `Promise<T | Error>`
   - Yup schema con mensajes en español
   - Adapter `formToPayload` si hay diferencia entre FormData y Payload

3. Implementar servicios de infraestructura:
   - HTTP: usar `axiosService` + `manageAxiosError`
   - Firebase: usar `firestoreService` wrapper con `limit: 100`
   - Mock: respetar shape del dominio, sin passwords en plaintext
   - Factory: switch por `CONFIG.SERVICE_PROVIDER`

4. Implementar application:
   - Queries con `QUERY_KEYS` centralizados
   - Mutations con toast + invalidación + `instanceof Error` throw
   - `FormData` se pasa directo desde UI, adapter se llama en mutation

5. Implementar UI:
   - `*ListView.tsx`: screen delgada que usa componente `*List`
   - `*FormView.tsx`: usa `await` en mutation antes de `goBack()`
   - `components/`: un componente por archivo
   - Usar FlashList para listas

6. Configurar:
   - Agregar ruta a `src/config/api.routes.ts` (HTTP)
   - Agregar colección a `src/config/collections.routes.ts` (Firebase)
   - Agregar query keys a `src/config/query.keys.ts`
   - Registrar navegación en `src/navigation/`

7. Ejecutar validadores:
   ```bash
   bun run lint
   bun run typecheck
   bun run test -- --watch=false
   ```

Al final, reporta:
- Archivos creados/modificados
- Decisiones de arquitectura
- Resultado de validaciones
