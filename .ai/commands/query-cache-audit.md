---
description: Auditoría de React Query (keys, cache e invalidaciones)
argument-hint: <ruta-opcional>
---

Audita React Query en: `$ARGUMENTS`

Si no se indica ruta, audita todo `src/`.

Checklist de auditoría:
- Convención y estabilidad de `queryKey`
- Uso correcto de `invalidateQueries` y `setQueryData`
- Manejo de `enabled`, `staleTime`, `gcTime`, retries y errores
- Evitar lógica de UI dentro de hooks de `application`
- Coherencia con `.factory/rules/application-module-structure.md`
- Coherencia con `.factory/rules/query-keys-and-cache.md`

Formato de salida:
1. Resumen ejecutivo
2. Hallazgos High/Medium/Low
3. Evidencia (archivo + línea + snippet corto)
4. Riesgo de cada hallazgo
5. Fix recomendado (pasos concretos)
6. Quick wins (top 5)

No hagas cambios de código en este paso, solo diagnóstico accionable.
