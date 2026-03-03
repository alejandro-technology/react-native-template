---
name: testing-strategy
category: enforcement
layer: cross-cutting
priority: high
tags:
  - jest
  - testing-library
  - mocking
  - coverage
  - unit-tests
triggers:
  - 'Writing tests'
  - 'Creating test utilities'
  - 'Test code review'
description: Enforce testing patterns, test utilities, mocking strategies, and coverage requirements. Use when writing tests, creating test utilities, or reviewing test code.
---

# Testing Strategy Skill

Enforces the testing architecture, utilities, mocking patterns, and coverage rules.

## When to Use

- Writing unit tests for components
- Writing integration tests for hooks
- Creating test utilities
- Mocking services and modules
- Reviewing test code for patterns compliance

## Test Architecture

```
__tests__/
├── modules/
│   ├── products/
│   │   ├── ui/
│   │   │   ├── ProductItem.test.tsx
│   │   │   ├── ProductList.test.tsx
│   │   │   └── ProductDetailView.test.tsx
│   │   ├── application/
│   │   │   ├── product.queries.test.ts
│   │   │   └── product.mutations.test.ts
│   │   └── domain/
│   │       ├── product.adapter.test.ts
│   │       └── product.scheme.test.ts
│   └── authentication/
│       └── ...
├── components/
│   ├── core/
│   │   ├── Text.test.tsx
│   │   ├── Button.test.tsx
│   │   └── Modal.test.tsx
│   └── form/
│       └── TextInput.test.tsx
└── App.test.tsx
```

## Test Utilities

All tests use the custom render utility with required providers:

```typescript
// jest/test-utils.tsx
import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@theme/providers/ThemeProvider';

function AllProviders({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <NavigationContainer>{children}</NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react-native';
export { customRender as render };
```

### Import in Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@test-utils';
```

## Component Test Pattern

### Basic Component Test

```typescript
import { render, screen } from '@test-utils';
import { Button } from '@components/core';

describe('Button', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders with label', () => {
    render(<Button onPress={jest.fn()}>Guardar</Button>);
    expect(screen.getByText('Guardar')).toBeOnTheScreen();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Guardar</Button>);
    fireEvent.press(screen.getByText('Guardar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    render(
      <Button onPress={jest.fn()} loading>
        Guardar
      </Button>,
    );
    expect(screen.getByTestId('loading-indicator')).toBeOnTheScreen();
  });
});
```

### List Item Component Test

```typescript
import { render, screen, fireEvent } from '@test-utils';
import { ProductItem } from '@modules/products/ui/components/ProductItem';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@navigation/hooks', () => ({
  useNavigationProducts: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

describe('ProductItem', () => {
  beforeEach(() => jest.clearAllMocks());

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'A description',
    price: 100,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('renders product name', () => {
    render(<ProductItem product={mockProduct} index={0} />);
    expect(screen.getByText('Test Product')).toBeOnTheScreen();
  });

  it('navigates to detail on press', () => {
    render(<ProductItem product={mockProduct} index={0} />);
    fireEvent.press(screen.getByText('Test Product'));
    expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {
      productId: '1',
    });
  });
});
```

## Service Mocking Pattern

### Mock Infrastructure Services

```typescript
// Mock at the top of the file
jest.mock('@modules/products/infrastructure/product.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import productService from '@modules/products/infrastructure/product.service';

describe('useProducts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches products successfully', async () => {
    const mockProducts = [{ id: '1', name: 'Product 1' }];
    (productService.getAll as jest.Mock).mockResolvedValue(mockProducts);

    // Test hook...
  });

  it('handles error response', async () => {
    (productService.getAll as jest.Mock).mockResolvedValue(
      new Error('No se pudieron cargar los productos'),
    );

    // Test error handling...
  });
});
```

### Mock Theme

```typescript
jest.mock('@theme/index', () => ({
  spacing: { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32 },
  borderRadius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  getColors: () => ({
    primary: '#3B82F6',
    background: '#f6f6f8',
    text: '#1F2937',
    textSecondary: '#6B7280',
  }),
  ANIMATION_DURATION: { fast: 200, normal: 400, slow: 600, slowest: 1000 },
}));
```

### Mock Navigation

```typescript
jest.mock('@navigation/hooks', () => ({
  useNavigationProducts: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));
```

## Domain Layer Tests

### Adapter Tests

```typescript
import { productFormToPayloadAdapter } from '@modules/products/domain/product.adapter';

describe('productFormToPayloadAdapter', () => {
  it('transforms form data to API payload', () => {
    const formData = {
      name: 'New Product',
      description: 'Description',
      price: 100,
    };

    const payload = productFormToPayloadAdapter(formData);

    expect(payload).toEqual({
      name: 'New Product',
      description: 'Description',
      price: 100,
    });
  });

  it('handles optional fields', () => {
    const formData = {
      name: 'Product',
      price: 50,
    };

    const payload = productFormToPayloadAdapter(formData);

    expect(payload.description).toBeUndefined();
  });
});
```

### Schema Tests

```typescript
import { productSchema } from '@modules/products/domain/product.scheme';

describe('productSchema', () => {
  it('validates correct data', () => {
    const result = productSchema.safeParse({
      name: 'Valid Product',
      description: 'A description',
      price: '100',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = productSchema.safeParse({
      name: '',
      price: '100',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre es requerido');
    }
  });

  it('coerces price from string to number', () => {
    const result = productSchema.safeParse({
      name: 'Product',
      price: '100',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.price).toBe('number');
    }
  });
});
```

## What NOT to Test

| Exclude                    | Reason                                          |
| -------------------------- | ----------------------------------------------- |
| `index.ts` barrel files    | Only re-exports, no logic                       |
| `*.model.ts`               | TypeScript interfaces only, no runtime behavior |
| `*.repository.ts`          | Interface definitions, no implementation        |
| External library internals | Trust React Query, Zustand, Zod                 |
| Style factory outputs      | Visual testing handled separately               |

## What to Test

| Priority | Target               | Pattern                             |
| -------- | -------------------- | ----------------------------------- |
| P0       | Domain adapters      | Pure function input/output          |
| P0       | Zod schemas          | Valid/invalid data, error messages  |
| P1       | List item components | Rendering, navigation on press      |
| P1       | Form components      | Field rendering, validation, submit |
| P2       | React Query hooks    | Success/error states, cache keys    |
| P2       | View components      | Loading/error/empty/success states  |
| P3       | Utility functions    | Edge cases, formatting              |

## Validation Rules

| Rule | Description                                                                   |
| ---- | ----------------------------------------------------------------------------- |
| R1   | Tests live in `__tests__/` mirroring `src/` structure                         |
| R2   | Use `@test-utils` render, never raw `@testing-library/react-native`           |
| R3   | Mock services at file top: `jest.mock('@modules/.../infrastructure/service')` |
| R4   | Clear mocks: `beforeEach(() => jest.clearAllMocks())`                         |
| R5   | Service mocks return `T \| Error` matching the real contract                  |
| R6   | Never test `index.ts`, `*.model.ts`, or `*.repository.ts`                     |
| R7   | Test file names: `{Component}.test.tsx` or `{module}.test.ts`                 |
| R8   | Each `describe` block covers one component or function                        |
| R9   | Query hook tests verify `queryKey` structure                                  |
| R10  | Mutation hook tests verify cache invalidation keys                            |
| R11  | Schema tests check Spanish error messages                                     |

## Anti-Patterns

```typescript
// WRONG: Importing render directly from testing-library
import { render } from '@testing-library/react-native';

// CORRECT: Use test-utils wrapper with providers
import { render } from '@test-utils';

// WRONG: Not clearing mocks
describe('ProductItem', () => {
  it('test 1', () => {
    /* uses mocks */
  });
  it('test 2', () => {
    /* stale mocks from test 1 */
  });
});

// CORRECT: Clear before each
describe('ProductItem', () => {
  beforeEach(() => jest.clearAllMocks());
  it('test 1', () => {
    /* fresh mocks */
  });
  it('test 2', () => {
    /* fresh mocks */
  });
});

// WRONG: Mocking service that throws
(productService.getAll as jest.Mock).mockRejectedValue(new Error('fail'));

// CORRECT: Service returns Error, doesn't throw
(productService.getAll as jest.Mock).mockResolvedValue(new Error('fail'));

// WRONG: Testing implementation details
expect(component.state.isLoading).toBe(true);

// CORRECT: Testing user-visible behavior
expect(screen.getByText('Cargando...')).toBeOnTheScreen();
```
