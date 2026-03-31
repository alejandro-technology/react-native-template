---
description: Crear screen delgada con View y componentes UI
argument-hint: <module> <screen-name>
---

Implementa una screen delgada para: `$ARGUMENTS`

Objetivo:
- Crear pantalla siguiendo patrón `Screen -> View -> ui/components`
- Mantener la lógica de datos en `application` (queries/mutations/hooks)
- Evitar lógica de negocio en `ui/`

Reglas obligatorias:
- Seguir `.factory/rules/ui-module-structure.md`
- Seguir límites de importación y arquitectura en `.factory/rules/`
- Mantener naming y tipos en inglés; textos UI en español

Resultado esperado:
1. `ui/{ScreenName}Screen.tsx` (contenedor fino)
2. `ui/{ScreenName}View.tsx` (layout/composición)
3. `ui/components/*` (un componente por archivo, si aplica)
4. Conexión a hooks de `application` y navegación tipada (si aplica)
5. Exportes en `index.ts` donde corresponda

Antes de finalizar:
- Ejecutar `bun run lint`
- Ejecutar `bun run typecheck`
- Ejecutar `bun run test -- --watch=false`
