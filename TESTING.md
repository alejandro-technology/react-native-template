# Guía de Testing - React Native Testing Library

## 📚 Filosofía

> **"Mientras más se parezcan tus tests a cómo se usa tu software, más confianza te darán"**

### Principios Clave

✅ **SÍ hacer:**
- Testear comportamiento visible para el usuario
- Usar queries que imiten cómo el usuario encuentra elementos
- Testear flujos completos de usuario
- Usar `testID` para elementos que no tienen texto visible
- Esperar resultados asíncronos con `waitFor` o `findBy*`

❌ **NO hacer:**
- Testear detalles de implementación (state interno, métodos privados)
- Testear componentes hijos específicos
- Usar `UNSAFE_getByType` excepto cuando sea absolutamente necesario
- Confiar en la estructura del DOM/árbol de componentes

## 🏗️ Estructura de Archivos

```
src/
├── components/
│   └── core/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
├── modules/
│   └── users/
│       ├── ui/
│       │   └── components/
│       │       ├── UserList.tsx
│       │       └── __tests__/
│       │           └── UserList.test.tsx
│       └── domain/
│           └── __tests__/
│               └── user.service.test.ts
└── utils/
    └── test-utils.tsx
```

## 🔍 Queries - Orden de Prioridad

### 1. Accesibles para todos (preferir)
```tsx
getByLabelText('Email')      // Formularios
getByPlaceholderText('Buscar') // Inputs
getByText('Guardar')         // Botones, textos
getByRole('button')          // Roles nativos
```

### 2. Queries semánticas
```tsx
getByAltText('Logo')         // Imágenes
getByTitle('Cerrar')         // Elementos con título
```

### 3. TestID (último recurso)
```tsx
getByTestId('submit-button') // Cuando no hay alternativa
```

## 🎨 Patterns Comunes

### Pattern 1: Test Básico de Componente

```tsx
import { render } from '@utils/test-utils';
import { Button } from '../Button';

describe('Button', () => {
  it('debe renderizar correctamente', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });
});
```

### Pattern 2: Testing de Interacciones

```tsx
import { render, fireEvent } from '@utils/test-utils';

it('debe llamar onPress al hacer click', () => {
  const handlePress = jest.fn();
  const { getByText } = render(
    <Button onPress={handlePress}>Press</Button>
  );

  fireEvent.press(getByText('Press'));
  expect(handlePress).toHaveBeenCalledTimes(1);
});
```

### Pattern 3: Testing Asíncrono

```tsx
import { render, waitFor } from '@utils/test-utils';

it('debe cargar datos después de un delay', async () => {
  const { findByText } = render(<AsyncComponent />);

  // findBy* espera automáticamente
  expect(await findByText('Datos cargados')).toBeTruthy();

  // O usar waitFor para assertions complejas
  await waitFor(() => {
    expect(screen.getByText('Datos cargados')).toBeTruthy();
  });
});
```

### Pattern 4: Testing de Formularios

```tsx
import { render, fireEvent } from '@utils/test-utils';

it('debe validar el formulario', async () => {
  const { getByPlaceholderText, getByText, findByText } = render(
    <LoginForm />
  );

  // Ingresar datos
  fireEvent.changeText(
    getByPlaceholderText('Email'),
    'test@example.com'
  );
  fireEvent.changeText(
    getByPlaceholderText('Password'),
    'password123'
  );

  // Submit
  fireEvent.press(getByText('Login'));

  // Verificar resultado
  expect(await findByText('Login exitoso')).toBeTruthy();
});
```

### Pattern 5: Testing con React Query

```tsx
import { render, waitFor } from '@utils/test-utils';
import { createTestQueryClient } from '@utils/test-utils';

it('debe cargar y mostrar datos', async () => {
  const queryClient = createTestQueryClient();
  const { findByText } = render(<DataComponent />, { queryClient });

  expect(await findByText('Juan Pérez')).toBeTruthy();
});
```

### Pattern 6: Testing de Errores

```tsx
it('debe mostrar mensaje de error', async () => {
  // Mockear servicio para que falle
  jest.spyOn(userService, 'getUsers').mockRejectedValue(
    new Error('Network error')
  );

  const { findByText } = render(<UserList />);

  expect(await findByText('Network error')).toBeTruthy();
});
```

## 🛠️ Utilities de Testing

### Custom Render con Providers

```tsx
// Ya configurado en src/utils/test-utils.tsx
import { render } from '@utils/test-utils';

// Incluye automáticamente:
// - ThemeProvider
// - QueryClientProvider
// - SafeAreaProvider
```

### Debug de Tests

```tsx
import { render, screen } from '@utils/test-utils';

it('debug example', () => {
  const { debug } = render(<MyComponent />);

  // Imprime el árbol completo
  debug();

  // Imprime un elemento específico
  debug(screen.getByText('Hello'));
});
```

## 🎯 Queries Reference

### Variantes de Queries

- `getBy*` - Error si no encuentra (síncrono)
- `queryBy*` - Retorna null si no encuentra (para assertions negativas)
- `findBy*` - Retorna Promise, espera hasta encontrar (asíncrono)
- `getAllBy*` - Retorna array, error si no encuentra ninguno
- `queryAllBy*` - Retorna array vacío si no encuentra
- `findAllBy*` - Retorna Promise de array

### Cuándo usar cada una

```tsx
// Elemento que debe existir
expect(getByText('Hello')).toBeTruthy();

// Verificar que NO existe
expect(queryByText('Goodbye')).toBeNull();

// Esperar elemento asíncrono
const element = await findByText('Loaded!');

// Múltiples elementos
const items = getAllByRole('listitem');
expect(items).toHaveLength(3);
```

## 🧪 Matchers Personalizados

Gracias a `@testing-library/jest-native`:

```tsx
expect(element).toBeVisible();
expect(element).toBeEnabled();
expect(element).toBeDisabled();
expect(element).toHaveTextContent('Hello');
expect(element).toHaveProp('onPress');
expect(element).toHaveStyle({ color: 'red' });
```

## 🚀 Comandos NPM

```bash
# Ejecutar todos los tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Test específico
npm test Button.test

# Update snapshots
npm test -- -u
```

## 📝 Mejores Prácticas

### 1. Nombres Descriptivos

```tsx
// ❌ Malo
it('should work', () => {});

// ✅ Bueno
it('debe mostrar mensaje de error cuando el email es inválido', () => {});
```

### 2. Arrange-Act-Assert

```tsx
it('debe incrementar contador al hacer click', () => {
  // Arrange
  const { getByText, getByTestId } = render(<Counter />);

  // Act
  fireEvent.press(getByText('Increment'));

  // Assert
  expect(getByTestId('counter-value')).toHaveTextContent('1');
});
```

### 3. Tests Independientes

```tsx
// ❌ Malo - Tests dependientes
describe('Form', () => {
  let form;

  it('debe renderizar', () => {
    form = render(<Form />);
  });

  it('debe validar', () => {
    fireEvent.press(form.getByText('Submit'));
  });
});

// ✅ Bueno - Tests independientes
describe('Form', () => {
  it('debe renderizar', () => {
    const { getByText } = render(<Form />);
    expect(getByText('Submit')).toBeTruthy();
  });

  it('debe validar', () => {
    const { getByText } = render(<Form />);
    fireEvent.press(getByText('Submit'));
    // assertions...
  });
});
```

### 4. Usar beforeEach para Setup Común

```tsx
describe('UserList', () => {
  let mockUsers;

  beforeEach(() => {
    mockUsers = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    jest.spyOn(api, 'getUsers').mockResolvedValue(mockUsers);
  });

  it('debe cargar usuarios', async () => {
    // test implementation
  });
});
```

### 5. Cleanup Automático

```tsx
// No necesitas cleanup manual
// React Native Testing Library lo hace automáticamente
afterEach(() => {
  // cleanup(); // ❌ No necesario
  jest.clearAllMocks(); // ✅ Limpiar mocks sí
});
```

## 🔗 Resources

- [React Native Testing Library Docs](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎓 Ejemplos en el Proyecto

1. **Test Básico**: `src/components/core/__tests__/Button.test.tsx`
2. **Test con Estado**: `src/components/core/__tests__/TextInput.test.tsx`
3. **Test de Formulario**: `src/components/core/__tests__/LoginForm.test.tsx`
4. **Test con React Query**: `src/components/core/__tests__/UserList.test.tsx`
