---
description: Auditoría de arquitectura contra reglas del proyecto
argument-hint: <ruta-opcional>
---

Ejecuta una auditoría de arquitectura en: `$ARGUMENTS`

Si no se pasa ruta, audita todo `src/`.

Objetivo:
- Detectar violaciones de capas y límites de importación
- Detectar inconsistencias con `.factory/rules/`
- Detectar anti-patrones de servicios/adapters/query-keys/navigation/module-public-api

Formato de salida:
1. Resumen ejecutivo (estado general)
2. Hallazgos por severidad (High/Medium/Low)
3. Evidencia por hallazgo (archivo + línea + regla afectada)
4. Fix propuesto por hallazgo (acción concreta)
5. Top 5 acciones priorizadas

No hagas cambios de código en este paso, solo diagnóstico accionable.
