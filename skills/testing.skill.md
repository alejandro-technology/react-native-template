# Skill: Estrategia de Testing

## 1. Metadata

-   **Nombre**: `testing-strategy`
-   **Descripción**: Define los niveles de pruebas requeridos y las herramientas a utilizar.
-   **Propósito**: Asegurar la calidad del código, prevenir regresiones y facilitar la refactorización segura.
-   **Categoría**: Calidad, DevOps

## 2. Trigger

-   **Cuándo**: Antes de cada PR, al crear una nueva Feature, o al refactorizar lógica crítica.
-   **Contexto**: Carpetas `__tests__` y configuración de Jest.
-   **Observa**: Cobertura de código, estructura de tests, y uso de mocks.

## 3. Responsabilidades

-   **Valida**: Que existan tests para los componentes de UI críticos, la lógica de dominio (modelos/adaptadores), y los hooks de aplicación.
-   **Recomienda**: Escribir tests *antes* del código (TDD) o *junto con* el código.
-   **Previene**: Tests frágiles que dependen de detalles de implementación (usar `screen.getByText` en lugar de `wrapper.find('Text')`).
-   **Optimiza**: La velocidad de ejecución de los tests (evitar sleeps, mocks lentos).

## 4. Reglas

### Niveles de Pruebas

1.  **Unitarias (Domain/Application)**:
    -   Probar funciones puras, adaptadores, y hooks personalizados aislados.
    -   Herramienta: `jest`, `@testing-library/react-hooks`.
    -   Ubicación: `src/modules/*/domain/__tests__/*.test.ts`.

2.  **Integración (UI/Application)**:
    -   Probar componentes y pantallas completas conectadas a un store mockeado.
    -   Herramienta: `@testing-library/react-native`.
    -   Ubicación: `src/modules/*/ui/__tests__/*View.test.tsx`.
    -   **Regla**: Mockear SIEMPRE la capa de infraestructura (`msw` o `jest.mock`). NUNCA hacer peticiones reales en tests.

3.  **End-to-End (E2E)**:
    -   Probar flujos completos de usuario (Login -> Home -> Logout).
    -   Herramienta: `Detox` o `Maestro` (Opcional/Futuro).

### Convenciones

-   Nombres de archivos: `*.test.tsx` o `*.spec.ts`.
-   Usar `describe`, `it`, `expect`.
-   Mocks manuales en `__mocks__` si es necesario.

## 5. Output Esperado

-   **Feedback**: "El hook 'useAuth' no tiene tests unitarios. Crea un archivo 'useAuth.test.ts' para verificar los casos de éxito y error."
-   **Severidad**: Alta (Calidad).
-   **Corrección**: Generar el esqueleto del test.

## 6. Ejemplo Práctico

### Antes (Sin Test)

```tsx
// src/modules/auth/application/useLogin.ts
export const useLogin = () => { ... } // Lógica compleja sin verificar
```

### Después (Con Test)

```tsx
// src/modules/auth/application/__tests__/useLogin.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useLogin } from '../useLogin';
import { authService } from '../../infrastructure/auth.service';

jest.mock('../../infrastructure/auth.service'); // Mock del servicio

describe('useLogin', () => {
  it('should call login service on submit', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ token: '123' });
    
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login('user', 'pass');
    });

    expect(authService.login).toHaveBeenCalledWith('user', 'pass');
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```
