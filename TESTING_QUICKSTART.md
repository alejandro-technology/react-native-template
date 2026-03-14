# Testing Quick Start Guide 🚀

## ✅ Setup Completado

Tu proyecto ya está configurado con React Native Testing Library. Aquí está todo lo que se ha configurado:

### Archivos Creados

```
✅ jest.config.js              # Configuración de Jest
✅ jest.setup.js               # Setup y mocks globales
✅ src/utils/test-utils.tsx    # Render customizado con providers
✅ TESTING.md                  # Guía completa de testing
```

### Ejemplos de Tests

```
✅ src/components/core/__tests__/Button.test.tsx       # Test básico
✅ src/components/core/__tests__/TextInput.test.tsx    # Test con estado
✅ src/components/core/__tests__/LoginForm.test.tsx    # Test de formulario
✅ src/components/core/__tests__/UserList.test.tsx     # Test con React Query
✅ src/hooks/__tests__/useDebounce.test.ts             # Test de hooks
```

## 🏃 Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Watch mode (re-ejecuta al guardar)
npm run test:watch

# Ver coverage
npm run test:coverage

# Actualizar snapshots
npm run test:update

# Ver output detallado
npm run test:verbose

# Ejecutar test específico
npm test Button.test

# Ejecutar tests en un directorio
npm test src/components/core
```

## 📝 Crear Tu Primer Test

### 1. Crear archivo de test

```bash
# Estructura recomendada:
# src/components/MyComponent.tsx
# src/components/__tests__/MyComponent.test.tsx
```

### 2. Template básico

```tsx
import { render, fireEvent } from '@utils/test-utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('debe renderizar correctamente', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hola Mundo')).toBeTruthy();
  });

  it('debe manejar interacciones', () => {
    const handlePress = jest.fn();
    const { getByText } = render(
      <MyComponent onPress={handlePress} />
    );

    fireEvent.press(getByText('Click me'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});
```

## 🎯 Queries Más Comunes

```tsx
// Por texto visible
getByText('Guardar')
getByText(/guardar/i)  // Case insensitive

// Por placeholder
getByPlaceholderText('Email')

// Por label
getByLabelText('Nombre')

// Por testID (último recurso)
getByTestId('submit-button')

// Para verificar que NO existe
expect(queryByText('Error')).toBeNull()

// Para elementos asíncronos
const element = await findByText('Cargado')
```

## 🔥 Snippets Útiles

### Test de formulario con validación

```tsx
it('debe validar campos requeridos', async () => {
  const { getByTestId, findByText } = render(<Form />);

  // Enviar sin llenar
  fireEvent.press(getByTestId('submit-button'));

  // Esperar mensaje de error
  expect(await findByText('Campo requerido')).toBeTruthy();
});
```

### Test con React Query

```tsx
import { createTestQueryClient } from '@utils/test-utils';

it('debe cargar datos', async () => {
  const queryClient = createTestQueryClient();
  const { findByText } = render(<List />, { queryClient });

  expect(await findByText('Item 1')).toBeTruthy();
});
```

### Test de hooks

```tsx
import { renderHook } from '@testing-library/react-native';

it('debe retornar valor', () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.value).toBe('expected');
});
```

### Mock de servicios

```tsx
import * as userService from '@modules/users/domain/user.service';

it('debe manejar error de API', async () => {
  jest
    .spyOn(userService, 'getUsers')
    .mockRejectedValue(new Error('Network error'));

  const { findByText } = render(<UserList />);
  expect(await findByText('Network error')).toBeTruthy();
});
```

## 🐛 Debug de Tests

### Ver el árbol de componentes

```tsx
const { debug } = render(<MyComponent />);
debug(); // Imprime todo el árbol
```

### Ver queries disponibles

```tsx
const { getByText, debug, ...rest } = render(<MyComponent />);
console.log(rest); // Muestra todas las queries disponibles
```

### Aumentar timeout para async

```tsx
// Por defecto es 1000ms
await findByText('Loaded', {}, { timeout: 3000 });
```

## ⚠️ Errores Comunes

### 1. "Unable to find an element with text: X"

```tsx
// ❌ Problema: El elemento no existe o texto no coincide exactamente
getByText('Submit')  // Busca "Submit" exacto

// ✅ Solución: Usar regex o verificar texto exacto
getByText(/submit/i)  // Case insensitive
getByText((content, element) => content.includes('Submit'))
```

### 2. "Multiple elements found"

```tsx
// ❌ Problema: Hay varios elementos con el mismo texto
getByText('Delete')

// ✅ Solución: Usar getAllByText o ser más específico
getAllByText('Delete')[0]
getByTestId('delete-user-1')
```

### 3. "Cannot read property of undefined"

```tsx
// ❌ Problema: Intentar acceder antes de que cargue
const element = getByText('Loaded');

// ✅ Solución: Usar query asíncrona
const element = await findByText('Loaded');
```

### 4. Tests con timers

```tsx
// ❌ Problema: setTimeout/setInterval no funcionan
it('test with timer', () => {
  // timer code...
});

// ✅ Solución: Usar fake timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
```

## 📊 Coverage Mínimo Recomendado

Tu `jest.config.js` está configurado con:

```javascript
coverageThresholds: {
  global: {
    branches: 50,    // 50% de branches
    functions: 50,   // 50% de funciones
    lines: 50,       // 50% de líneas
    statements: 50,  // 50% de statements
  },
}
```

Ajusta según tus necesidades en `jest.config.js`.

## 🎓 Próximos Pasos

1. ✅ **Lee** `TESTING.md` para guía completa
2. ✅ **Explora** los ejemplos en `__tests__/`
3. ✅ **Escribe** tests para tus componentes
4. ✅ **Ejecuta** `npm run test:coverage` regularmente
5. ✅ **Aprende** queries: https://testing-library.com/docs/queries/about

## 🆘 Ayuda

- 📖 **Guía completa**: Ver `TESTING.md`
- 🔗 **Docs oficiales**: https://callstack.github.io/react-native-testing-library/
- 💡 **Common mistakes**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

**¡Ya estás listo para empezar a testear! 🎉**
