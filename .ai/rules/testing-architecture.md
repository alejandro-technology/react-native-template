---
category: testing
priority: medium
tags: [testing, jest, providers, test-utils, keychain]
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

### Error Handlers

- tests para `manageAxiosError` y `manageFirebaseError`
- verificar mapeo de códigos de error a mensajes en español

**NUNCA**:

- crear un `QueryClient` distinto en código feature de producción
- saltarse los mocks globales existentes si el caso ya está cubierto por `jest.setup.js`

---

## Regla 3: Mocks globales en `jest.setup.js`

**SIEMPRE**: los mocks de dependencias nativas se definen en `jest.setup.js`.

### Mocks actuales

| Dependencia | Mock |
|-------------|------|
| `react-native-mmkv` | Mock con métodos `getString`, `set`, `delete`, `clearAll` |
| `react-native-keychain` | Mock con `getGenericPassword`, `setGenericPassword` |
| `@react-native-firebase/*` | Mock con métodos auth/firestore básicos |
| `@react-navigation/native` | Mock con `useNavigation`, `useRoute` |
| `react-native-gesture-handler` | Mock con `View` como componente base |
| `react-native-svg` | Mock con elementos SVG como `View` |
| `jail-monkey` | Mock con `isJailBroken` retornando `false` |

### Agregar nuevo mock

1. Agregar en `jest.setup.js`:
```javascript
jest.mock('new-dependency', () => ({
  // mock implementation
}));
```

2. Si es una dependencia que requiere transform, agregar a `transformIgnorePatterns` en `jest.config.js`

---

## Regla 4: Coverage thresholds por archivo

**SIEMPRE**: el proyecto tiene thresholds de coverage específicos por archivo.

### Thresholds globales

- Branches: 20%
- Functions: 20%
- Lines: 25%
- Statements: 25%

### Thresholds por componente core

- `Button.tsx`: 100% functions/lines/statements, 70% branches
- `TextInput.tsx`: 100% functions/lines/statements, 90% branches
- `Text.tsx`: 100% all

### Archivos excluidos de coverage

- `*.styles.ts`, `*.types.ts`, `*.scheme.ts`
- `*.adapter.ts`, `*.routes.ts`
- `index.ts`, `test-utils.tsx`

### Cómo verificar

```bash
# El proyecto corre tests con Jest
bun run test

# Los tests de UI deberían reutilizar el render customizado
grep -r "@utils/test-utils" __tests__

# Verificar coverage
bun run test:coverage
```

**Referencias**:
- `src/utils/test-utils.tsx`
- `jest.setup.js`
- `jest.config.js`
- `__tests__/components/`
- `__tests__/modules/network/manageAxiosError.test.ts`
- `__tests__/modules/firebase/manageFirebaseError.test.ts`
