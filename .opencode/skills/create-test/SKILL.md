---
name: create-test
description: Create Jest + React Testing Library tests for components, providers, hooks, services, and stores. Load when writing or fixing any test file.
license: MIT
compatibility: opencode
metadata:
  layer: testing
  workflow: test
  output: __tests__/**/*.test.ts
---

# Skill: Create Test

Create tests for components, providers, hooks, services, and stores.

## When to Use

- Writing tests for a new component, provider, hook, or service
- Adding test coverage to an existing module
- Testing React Query hooks with offline fallback

## Pre-Checks

1. Identify the type: component, provider, hook, service, or store
2. Check `jest.setup.js` for existing global mocks
3. Determine if `@utils/test-utils` or `@testing-library/react-native` should be used

## Pattern 1: Component Test (use test-utils)

For all components (core, form, layout), use the custom render from `@utils/test-utils`.

Create `__tests__/components/{category}/{Component}.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@utils/test-utils';
import { Button } from '@components/core/Button';

describe('Button', () => {
  it('debe renderizar correctamente con texto', () => {
    const { getByText } = render(<Button>Hola Mundo</Button>);
    expect(getByText('Hola Mundo')).toBeTruthy();
  });

  it('debe ejecutar onPress al hacer click', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock}>Presionar</Button>,
    );
    fireEvent.press(getByText('Presionar'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('no debe ejecutar onPress cuando esta disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock} disabled>
        Deshabilitado
      </Button>,
    );
    fireEvent.press(getByText('Deshabilitado'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('debe aplicar diferentes variantes', () => {
    const { getByText, rerender } = render(
      <Button variant="primary">Primary</Button>,
    );
    expect(getByText('Primary')).toBeTruthy();
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(getByText('Secondary')).toBeTruthy();
  });
});
```

## Pattern 2: Provider Test (use @testing-library directly)

Provider tests MUST use `@testing-library/react-native` directly — NOT `@utils/test-utils` — to avoid circular provider wrapping.

Create `__tests__/providers/{Name}Provider.test.tsx`:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// CRITICAL: Mock dependencies BEFORE importing the provider
jest.mock('../../src/providers/SecureProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

jest.mock('@modules/authentication', () => ({
  __esModule: true,
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('@theme/providers/ThemeProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

// Import AFTER mocks
import AppProvider from '../../src/providers/AppProvider';

describe('AppProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <AppProvider>
        <Text>Child</Text>
      </AppProvider>,
    );
    expect(getByText('Child')).toBeTruthy();
  });
});
```

**Key rules for provider tests:**

- Default exports need `{ __esModule: true, default: ... }` in mocks
- Named exports use `{ ExportName: ... }` directly
- Mock ALL nested providers and heavy dependencies
- Mock `react-native-safe-area-context` if SafeAreaProvider is used

## Pattern 3: React Query Hook Test

For query/mutation hooks, use `renderHook` with a test QueryClient.

Create `__tests__/modules/{module}/application/{entity}.queries.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@utils/test-utils';

// Mock the service
jest.mock('@modules/products/infrastructure/product.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

// Mock connectivity
jest.mock('@modules/network/application/connectivity.storage', () => ({
  getIsConnected: () => true,
}));

import { useProducts } from '@modules/products/application/product.queries';
import productService from '@modules/products/infrastructure/product.service';

const mockProducts = [
  { id: '1', name: 'Product 1', price: 10 },
  { id: '2', name: 'Product 2', price: 20 },
];

function createWrapper() {
  const queryClient = createTestQueryClient();
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar los productos correctamente', async () => {
    (productService.getAll as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProducts);
  });

  it('debe manejar errores del servicio', async () => {
    (productService.getAll as jest.Mock).mockResolvedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

## Pattern 4: Mutation Hook Test

```typescript
import { renderHook, waitFor, act } from '@testing-library/react-native';

describe('useProductCreate', () => {
  it('debe crear un producto exitosamente', async () => {
    const newProduct = { id: '3', name: 'New', price: 30 };
    (productService.create as jest.Mock).mockResolvedValue(newProduct);

    const { result } = renderHook(() => useProductCreate(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: 'New', price: 30 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

## Pattern 5: Service Test

For infrastructure services, mock the HTTP/Firebase client.

Create `__tests__/modules/{module}/infrastructure/{entity}.http.service.test.ts`:

```typescript
jest.mock('@modules/network/infrastructure/axios.service', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import axiosService from '@modules/network/infrastructure/axios.service';
import { productHttpService } from '@modules/products/infrastructure/product.http.service';

describe('productHttpService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe obtener todos los productos', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    (axiosService.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await productHttpService.getAll();

    expect(result).toEqual(mockData);
    expect(axiosService.get).toHaveBeenCalledWith(
      '/products',
      expect.any(Object),
    );
  });

  it('debe retornar Error en caso de fallo', async () => {
    (axiosService.get as jest.Mock).mockRejectedValue(new Error('fail'));

    const result = await productHttpService.getAll();

    expect(result).toBeInstanceOf(Error);
  });
});
```

## Pattern 6: Zustand Store Test

```typescript
import { useProductsStorage } from '@modules/products/application/products.storage';

describe('useProductsStorage', () => {
  beforeEach(() => {
    useProductsStorage.setState({
      products: [],
    });
  });

  it('debe agregar un producto', () => {
    const product = { id: '1', name: 'Test', price: 10 };
    useProductsStorage.getState().addProduct(product);
    expect(useProductsStorage.getState().products).toContainEqual(product);
  });

  it('debe eliminar un producto', () => {
    useProductsStorage.setState({
      products: [{ id: '1', name: 'Test', price: 10 }],
    });
    useProductsStorage.getState().removeProduct('1');
    expect(useProductsStorage.getState().products).toHaveLength(0);
  });
});
```

## Pattern 7: Theme Hook Test

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useFadeScale } from '@theme/hooks/useFadeScale';

describe('useFadeScale', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('debe inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useFadeScale());
    expect(result.current.opacity).toBeInstanceOf(Animated.Value);
    expect(result.current.scale).toBeInstanceOf(Animated.Value);
  });

  it('debe aceptar configuracion personalizada', () => {
    const { result } = renderHook(() =>
      useFadeScale({ initialScale: 0.5, duration: 200 }),
    );
    expect(result.current.opacity).toBeDefined();
    expect(result.current.scale).toBeDefined();
  });
});
```

## Global Mocks Reference (jest.setup.js)

Already mocked globally — do NOT re-mock in tests unless overriding:

- `react-native-gesture-handler`
- `react-native-mmkv`
- `@react-native-firebase/app`, `auth`, `firestore`
- `@react-navigation/native` (useNavigation, useRoute, useFocusEffect)
- `jail-monkey`
- `react-native-keychain`
- `react-native-svg`
- `@react-native-community/netinfo`
- `react-native-permissions`
- `react-native-image-picker`

## test-utils.tsx Reference

The custom render wraps components with:

1. `QueryClientProvider` (retry: false, gcTime: 0)
2. `ThemeProvider`
3. `SafeAreaProvider` (initialMetrics: zeroed)

Exports:

- `render` — custom render with all providers
- `createTestQueryClient` — factory for test QueryClient
- All re-exports from `@testing-library/react-native`

## Checklist

- [ ] Correct import: `@utils/test-utils` for components, `@testing-library/react-native` for providers
- [ ] `jest.mock()` calls placed BEFORE import of module under test
- [ ] Spanish `it()` descriptions: `it('debe renderizar correctamente')`
- [ ] `beforeEach(() => jest.clearAllMocks())` in each describe block
- [ ] No real HTTP/Firebase calls — all services mocked
- [ ] Test file mirrors `src/` structure in `__tests__/`
- [ ] Run `bun run test -- path/to/file.test.ts` to verify
