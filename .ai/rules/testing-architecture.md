---
category: testing
priority: medium
tags: [testing, jest, providers, test-utils]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Testing para la Arquitectura

Los tests deben respetar la composición real de providers y las fronteras de la arquitectura.

---

## Regla 1: Para UI usar `@utils/test-utils`

**SIEMPRE**: tests de componentes y pantallas deben importar:

```typescript
import { render } from '@utils/test-utils';
```

### Porque

`test-utils` ya monta:

- `QueryClientProvider`
- `ThemeProvider`
- `SafeAreaProvider`

y usa un `QueryClient` de test con:

- `retry: false`
- `gcTime: 0`

---

## Regla 2: Testear cada capa por su responsabilidad

### UI

- render, interacción, estados visuales

### Application

- estados de query/mutation
- invalidación, manejo de error, side effects esperados

### Infrastructure

- shape de retorno `T | Error`
- mapeos y errores del provider

**NUNCA**:

- crear un `QueryClient` distinto en código feature de producción
- saltarse los mocks globales existentes si el caso ya está cubierto por `jest.setup.js`

### Cómo verificar

```bash
# El proyecto corre tests con Jest
bun run test

# Los tests de UI deberían reutilizar el render customizado
grep -r "@utils/test-utils" __tests__
```

**Referencias**:
- `src/utils/test-utils.tsx`
- `jest.setup.js`
- `__tests__/components/`
