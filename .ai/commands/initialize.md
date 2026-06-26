---
description: Inicializa y valida el template
agent: build
---

Usa @TEMPLATE_USAGE.md como checklist oficial.

Objetivo: ejecutar automaticamente todo lo posible para dejar el proyecto listo.
No inventes credenciales ni valores privados. No hagas cambios destructivos salvo que se pida explicitamente en argumentos.

Argumentos opcionales en $ARGUMENTS:

- `--clean-examples`: elimina el modulo de ejemplo y ajusta navegacion relacionada.
- `--skip-checks`: no corre test/typecheck/lint.

Pasos a ejecutar:

1. Entorno

- Si `.env` no existe, copia `.env.example` a `.env`.
- Valida que existan `API_URL`, `SERVICE_PROVIDER`, `ROOT_USERNAME`, `ROOT_PASSWORD`.
- Si faltan variables, agregalas usando placeholders seguros y marcando TODO.

2. Firebase (solo validacion automatica)

- Lee `SERVICE_PROVIDER` desde `.env`.
- Si `SERVICE_PROVIDER=firebase`, verifica existencia de:
  - `android/app/google-services.json`
  - `ios/GoogleService-Info.plist`
- Si faltan, no crees archivos falsos: reporta accion manual requerida.

3. Seguridad (validacion)

- Verifica si `ROOT_USERNAME`/`ROOT_PASSWORD` siguen en valores por defecto.
- Si siguen por defecto, reporta recomendacion para cambiarlos/removerlos en produccion.

4. Limpieza opcional

- Solo si `$ARGUMENTS` contiene `--clean-examples`, elimina:
  - `src/modules/examples/`
  - `src/navigation/stacks/ExampleStackNavigator.tsx` (si existe)
- Ajusta rutas/stacks/imports para que compile sin modulo examples.
- Si NO se pasa `--clean-examples`, solo reporta esta tarea como pendiente.

5. Verificaciones

- Salvo que `$ARGUMENTS` contenga `--skip-checks`, ejecuta:
  - `bun run test`
  - `bun run typecheck`
  - `bun run lint`

6. CI/CD

- Revisa `.github/workflows/` y reporta que cambios deben hacerse manualmente (secrets, jobs, deploy).

Entrega final en formato breve:

- `Hecho`: lista de acciones completadas.
- `Pendiente manual`: lo que requiere decision/credenciales humanas.
- `Errores`: comandos que fallaron y sugerencia puntual.
