# React Native Clean Architecture Template - Agent Instructions

React Native 0.83.4 template with Clean Architecture (4 layers), New Architecture enabled, TypeScript strict mode.

## Project Rules (.factory/rules)

Follow these rules as mandatory guidance:

- `.factory/rules/architecture.md`
- `.factory/rules/reference.md`
- `.factory/rules/design-interface.md`
- `.factory/rules/application-module-structure.md`
- `.factory/rules/ui-module-structure.md`
- `.factory/rules/infrastructure-services.md`
- `.factory/rules/domain-modeling.md`
- `.factory/rules/query-keys-and-cache.md`
- `.factory/rules/navigation-module-registration.md`
- `.factory/rules/module-public-api.md`
- `.factory/rules/shared-vs-feature-boundaries.md`
- `.factory/rules/form-flow.md`
- `.factory/rules/testing-architecture.md`
- `.factory/rules/language-and-messages.md`

## Build & Test Commands

```bash
# Install dependencies (always use bun, never npm/yarn)
bun install

# Testing
bun run test                    # Run all tests
bun run test -- <path>.test.ts  # Run single test file
bun run test:watch             # Watch mode
bun run test:coverage          # With coverage report

# Code quality
bun run lint                    # ESLint check
bun run lint:fix               # ESLint fix
bun run typecheck              # TypeScript check
bun run prettier               # Format code

# App execution
bun run start                   # Start Metro bundler
bun run android                 # Run on Android
bun run ios                     # Run on iOS

# iOS setup
bun run pod-install            # Install CocoaPods

# Cleanup
bun run clean-android          # Clean Android build
bun run clean-ios              # Clean iOS build (removes Pods)
```

## Architecture Overview

Clean Architecture with 4 layers per feature module:

```
src/modules/{module}/
  domain/           → Entities, repository interfaces, Yup schemas
  infrastructure/   → Repository implementations (http, firebase, mock)
  application/     → React Query hooks (queries, mutations)
  ui/              → Screens and screen-specific components
```

Entry: `App.tsx` → `AppProvider` → `RootNavigator`

Service factory pattern: `src/config/config.ts` → `CONFIG.SERVICE_PROVIDER` (`'http'` | `'firebase'` | `'mock'`)

## Project Layout

```
src/
  assets/          → SVG icons, images
  components/
    core/          → AnimatedPressable, Avatar, Badge, Button, Card, Checkbox, DatePicker, Modal, Select, Text, TextInput, Toast
    form/          → react-hook-form wrappers
    layout/        → DeleteConfirmationSheet, EmptyState, ErrorState, Header, LoadingState, RootLayout, Toolbar
  config/          → api.routes.ts, collections.routes.ts, config.ts, query.keys.ts
  modules/
    products/     → Reference CRUD module (copy this for new modules)
    users/        → User management module
    authentication/→ Login/register (HTTP, Firebase, mock)
    core/         → Global Zustand store: toast, delete confirmation
    network/      → AxiosService singleton
    firebase/     → Firestore and Storage services
  navigation/      → RootNavigator, Public/Private stacks, typed routes
  providers/       → SecureProvider, ThemeProvider, NavigationProvider
  theme/           → Design tokens, colors, spacing, typography, style factories
  utils/           → test-utils, helpers
```

## Code Style Guidelines

### Imports

- Use path aliases: `@components/*`, `@modules/*`, `@theme/*`, `@utils/*`, `@config/*`, `@navigation/*`, `@hooks/*`
- Group imports: React → external libraries → internal packages → relative imports
- Separate with blank line between groups, with a comment label for each group

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Types
import { ButtonVariant } from '@theme/components/Button.styles';
// Theme
import { useTheme, spacing } from '@theme/index';
// Components
import { Text } from './Text';
```

### Naming Conventions

- **Files**: kebab-case (`product.service.ts`, `use-products.ts`)
- **Components/Exports**: PascalCase (`ProductCard`, `useProductCreate`)
- **Interfaces**: PascalCase with optional `I` prefix for some (use existing patterns)
- **Types**: PascalCase (`ProductFilter`, `CreateProductPayload`)
- **Functions/Variables**: camelCase (`productService`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (`SERVICE_PROVIDER`, `QUERY_KEYS`)
- **Enums**: PascalCase members (`ProductRoutes`, `ThemeMode`)
- **Theme style factories**: `get{Component}Style` (`getButtonStyle`, `getTextStyle`)

### React Component Patterns

```typescript
// Functional component with explicit props interface
interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button(props: ButtonProps) {
  // Destructure with defaults
  const {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    style: customStyle,
    ...pressableProps
  } = props;

  // Use theme hook
  const theme = useTheme();

  // Return JSX with accessibility props
  return (
    <AnimatedPressable
      style={[styles.container, customStyle]}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      {...pressableProps}
    >
      <Text style={styles.text}>{children}</Text>
    </AnimatedPressable>
  );
}
```

### TypeScript Patterns

- Use `interface` for object shapes, `type` for unions, aliases
- Use `T | Error` return pattern for services (never throw in services)
- Use `InferType` from Yup for form data types
- Use `Omit`, `Pick`, `Partial` for prop variations
- Use `React.ReactNode`, `React.FC`, `React.useCallback`, `React.memo` appropriately

### Error Handling Pattern

```typescript
// Services return T | Error, never throw
async getById(id: string): Promise<Product | Error> {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (e) {
    return new Error(e.message || 'Error fetching product');
  }
}

// Mutations check for Error and re-throw
const result = await productService.getById(id);
if (result instanceof Error) {
  throw result;
}
```

### Form Validation Schema Pattern (Yup)

```typescript
import * as yup from 'yup';
import type { InferType } from 'yup';

export const productSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  price: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? NaN : value,
    )
    .min(1, 'El precio debe ser mayor a 0')
    .required('El precio es requerido'),
});

export type ProductFormData = InferType<typeof productSchema>;
```

### Repository Interface Pattern

```typescript
// domain/product.repository.ts
import {
  CreateProductPayload,
  Product,
  ProductFilter,
  UpdateProductPayload,
} from './product.model';

export interface ProductRepository {
  getAll(filter?: ProductFilter): Promise<Product[] | Error>;
  getById(id: string): Promise<Product | Error>;
  create(data: CreateProductPayload): Promise<Product | Error>;
  update(id: string, data: UpdateProductPayload): Promise<Product | Error>;
  delete(id: string): Promise<void | Error>;
}
```

### Service Factory Pattern

```typescript
// infrastructure/product.service.ts
import { ProductRepository } from '../domain/product.repository';
import productHttpService from './product.http.service';
import productFirebaseService from './product.firebase.service';
import productMockService from './product.mock.service';
import { CONFIG } from '@config/config';

function createProductService(): ProductRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return productHttpService;
    case 'firebase':
      return productFirebaseService;
    case 'mock':
      return productMockService;
    default:
      throw new Error(`Unknown service provider: ${CONFIG.SERVICE_PROVIDER}`);
  }
}

export default createProductService();
```

### React Query Patterns

```typescript
// Queries
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_DETAIL(id),
    queryFn: async () => {
      const result = await productService.getById(id);
      if (result instanceof Error) throw result;
      return result;
    },
    enabled: enabled && Boolean(id),
  });
}

// Mutations with toast notifications
export function useProductCreate() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (form: ProductFormData) => {
      const result = await productService.create(payload);
      if (result instanceof Error) throw result;
      return result;
    },
    onSuccess: () => {
      show({ message: 'Producto creado exitosamente', type: 'success' });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() });
    },
    onError: (error: Error) => {
      show({ message: error.message, type: 'error' });
    },
  });
}
```

### Testing Patterns

- Use custom render: `import { render } from '@utils/test-utils'`
- Test QueryClient: `retry: false`, `gcTime: 0`
- Excluded from coverage: `*.styles.ts`, `*.types.ts`, `*.scheme.ts`, `*.adapter.ts`, `*.routes.ts`, `index.ts`
- Global mocks in `jest.setup.js`: gesture-handler, MMKV, Firebase, react-navigation, jail-monkey

### Styling Patterns

- Each component has a co-located `*.styles.ts` file
- Use style factories with theme: `getButtonStyle({ mode, variant, size, disabled })`
- Use theme tokens: `spacing.sm`, `colors.primary`, `borderRadius.md`
- Create base StyleSheet at bottom of file: `const baseStyle = StyleSheet.create({...})`

### Language Rules

- **Code, variables, types**: English
- **UI text and validation messages**: Spanish
- **No new runtime dependencies** without explicit justification
- **No inline comments** unless explaining complex logic

## Security

- `SecureProvider` blocks rooted/jailbroken devices via jail-monkey
- Firebase credentials gitignored: `ios/GoogleService-Info.plist`, `android/app/google-services.json`
- Never commit API keys, tokens, secrets — use `react-native-config`

## Git Workflows

- Default branch: `main`
- Pre-commit hooks: Husky + lint-staged (ESLint fix + Prettier on `src/**/*.{ts,tsx}`)
- Pre-commit checks: `bun run test`, `bun run lint`, `bun run typecheck`
- Commit style: conventional commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `perf:`, `style:`)

## Gotchas

- Path aliases configured in both `babel.config.js` and `tsconfig.json`
- MMKV for theme persistence, not AsyncStorage
- React Query defaults in `AppProvider` — never create a new QueryClient in feature code
- `.ai/` directory is source of truth for AI configs — sync with `bun run claude`
