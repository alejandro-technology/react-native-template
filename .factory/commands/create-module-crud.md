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
1. Crear estructura de carpetas/archivos
2. Implementar contratos de dominio y modelos CRUD
3. Implementar servicios de infraestructura necesarios
4. Implementar queries/mutations/hooks de application
5. Implementar pantallas/componentes UI con patrón screen delgada
6. Ejecutar validadores (`bun run lint`, `bun run typecheck`, `bun run test -- --watch=false`)

Al final, reporta:
- Archivos creados/modificados
- Decisiones de arquitectura
- Resultado de validaciones
