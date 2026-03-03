---
name: code-quality
category: enforcement
layer: cross-cutting
priority: high
tags:
  - eslint
  - prettier
  - typescript
  - naming-conventions
  - imports
triggers:
  - 'Creating new files'
  - 'Code review'
  - 'Configuring tooling'
description: Enforce code quality standards including ESLint, Prettier, TypeScript, naming conventions, and import organization. Use when creating files, reviewing code style, or configuring tooling.
---

# Code Quality Skill

Enforces linting, formatting, TypeScript strictness, naming conventions, and import organization.

## When to Use

- Creating new files or components
- Reviewing code for style consistency
- Configuring ESLint, Prettier, or TypeScript
- Resolving linter or type errors
- Organizing imports and exports

## Toolchain

| Tool       | Config File       | Purpose                             |
| ---------- | ----------------- | ----------------------------------- |
| ESLint     | `.eslintrc.js`    | Code quality and React Native rules |
| Prettier   | `.prettierrc.js`  | Code formatting                     |
| TypeScript | `tsconfig.json`   | Type checking and path aliases      |
| Babel      | `babel.config.js` | Transpilation and module resolution |

## ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: '@react-native',
};
```

Uses `@react-native/eslint-config` which includes:

- React and React Native rules
- TypeScript-specific rules
- React Hooks rules (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)

## Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  arrowParens: 'avoid',
  singleQuote: true,
  trailingComma: 'all',
};
```

| Rule            | Value  | Example                 |
| --------------- | ------ | ----------------------- |
| Quotes          | Single | `'hello'` not `"hello"` |
| Trailing commas | All    | `{ a, b, }`             |
| Arrow parens    | Avoid  | `x => x` not `(x) => x` |

## TypeScript Configuration

```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "types": ["jest", "node"],
    "baseUrl": ".",
    "paths": {
      "@assets/*": ["src/assets/*"],
      "@components/*": ["src/components/*"],
      "@config/*": ["src/config/*"],
      "@containers/*": ["src/containers/*"],
      "@hooks/*": ["src/hooks/*"],
      "@modules/*": ["src/modules/*"],
      "@theme/*": ["src/theme/*"],
      "@navigation/*": ["src/navigation/*"]
    }
  }
}
```

### Path Alias Usage

```typescript
// CORRECT: Use path aliases for cross-module imports
import { Button } from '@components/core';
import { spacing } from '@theme/index';
import { API_ROUTES } from '@config/api.routes';
import productService from '@modules/products/infrastructure/product.service';

// CORRECT: Use relative imports within the same module
import { ProductEntity } from '../../domain/product.model';
import { productSchema } from '../../domain/product.scheme';
```

### Alias Rules

| Alias            | Maps To            | When to Use                 |
| ---------------- | ------------------ | --------------------------- |
| `@components/*`  | `src/components/*` | Shared UI components        |
| `@theme/*`       | `src/theme/*`      | Theme tokens, hooks, styles |
| `@config/*`      | `src/config/*`     | App configuration           |
| `@modules/*`     | `src/modules/*`    | Cross-module imports        |
| `@navigation/*`  | `src/navigation/*` | Navigation routes, hooks    |
| `@hooks/*`       | `src/hooks/*`      | Shared utility hooks        |
| `@assets/*`      | `src/assets/*`     | Static assets               |
| Relative (`../`) | Same module        | Intra-module imports        |

## Naming Conventions

| Element          | Convention                     | Example                             |
| ---------------- | ------------------------------ | ----------------------------------- |
| Components       | PascalCase                     | `Button`, `ProductItem`             |
| Component files  | PascalCase.tsx                 | `Button.tsx`, `SignUpView.tsx`      |
| Functions        | camelCase                      | `handleSubmit`, `createAuthService` |
| Hooks            | camelCase with `use` prefix    | `useProducts`, `useTheme`           |
| Interfaces/Types | PascalCase                     | `ButtonProps`, `AuthRepository`     |
| Constants        | SCREAMING_SNAKE                | `API_ROUTES`, `ANIMATION_DURATION`  |
| Enums            | PascalCase + PascalCase values | `RootRoutes.Products`               |
| Service files    | camelCase.service.ts           | `auth.service.ts`                   |
| Model files      | camelCase.model.ts             | `product.model.ts`                  |
| Schema files     | camelCase.scheme.ts            | `product.scheme.ts`                 |
| Adapter files    | camelCase.adapter.ts           | `product.adapter.ts`                |
| Test files       | PascalCase.test.tsx            | `Text.test.tsx`                     |
| Style files      | PascalCase.styles.ts           | `Button.styles.ts`                  |

### Handler Naming

```typescript
// Event handlers in components use 'handle' prefix
const handleCardPress = () => {
  /* ... */
};
const handleSubmit = (data: FormData) => {
  /* ... */
};
const handleDelete = () => {
  /* ... */
};

// Callbacks passed as props use 'on' prefix
interface Props {
  onPress: () => void;
  onSubmit: (data: FormData) => void;
  onDelete: () => void;
}
```

## Babel Configuration

```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from', // Required for Zod v4
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.jsx', '.js'],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@config': './src/config',
          '@containers': './src/containers',
          '@hooks': './src/hooks',
          '@modules': './src/modules',
          '@theme': './src/theme',
          '@navigation': './src/navigation',
        },
      },
    ],
  ],
};
```

**Critical:** `@babel/plugin-transform-export-namespace-from` is required for Zod v4 compatibility. Never remove it.

## Import Organization

Imports follow this order (separated by blank lines):

```typescript
// 1. React and React Native
import React from 'react';
import { View, StyleSheet } from 'react-native';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

// 3. Path alias imports (cross-module)
import { Button, Text } from '@components/core';
import { spacing } from '@theme/index';
import { API_ROUTES } from '@config/api.routes';

// 4. Relative imports (same module)
import { ProductEntity } from '../../domain/product.model';
import { productSchema } from '../../domain/product.scheme';

// 5. Types (if separate)
import type { ProductsScreenProps } from '@navigation/routes';
```

### Import Rules

| Rule                           | Description                                          |
| ------------------------------ | ---------------------------------------------------- |
| No unused imports              | Remove imports that aren't referenced                |
| No `React` import in RN 0.84+  | JSX transform handles this automatically             |
| Prefer named exports           | `export function Button()` over `export default`     |
| Default exports for services   | Factory singletons: `export default createService()` |
| Default exports for navigators | `export default function Navigator()`                |
| Barrel files in each layer     | `index.ts` re-exports public API                     |

## File Structure per Component

```typescript
// 1. Imports (organized as above)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@components/core';
import { spacing } from '@theme/index';

// 2. Types/Interfaces
interface ProductItemProps {
  product: ProductEntity;
  index: number;
}

// 3. Constants (if any, outside component)
const renderProductItem: ListRenderItem<ProductEntity> = ({ item, index }) => (
  <ProductItem product={item} index={index} />
);

// 4. Component
export const ProductItem = React.memo(function ProductItem({
  product,
  index,
}: ProductItemProps) {
  // hooks first
  const { navigate } = useNavigationProducts();
  const { colors } = useTheme();

  // handlers
  const handleCardPress = () => {
    navigate(ProductsRoutes.ProductDetail, { productId: product.id });
  };

  // render
  return (
    <Card onPress={handleCardPress}>
      <Text variant="body">{product.name}</Text>
    </Card>
  );
});

// 5. Styles (at bottom)
const styles = StyleSheet.create({
  container: { gap: spacing.md },
});
```

## Validation Rules

| Rule | Description                                                           |
| ---- | --------------------------------------------------------------------- |
| R1   | Single quotes for strings, trailing commas everywhere                 |
| R2   | No arrow parens for single parameters                                 |
| R3   | Path aliases for cross-module, relative for intra-module              |
| R4   | PascalCase components, camelCase functions, SCREAMING_SNAKE constants |
| R5   | `handle` prefix for internal handlers, `on` prefix for callback props |
| R6   | No unused imports, no stale `React` imports                           |
| R7   | `StyleSheet.create()` at bottom of file                               |
| R8   | Types/interfaces defined before component                             |
| R9   | Hooks at top of component body, then handlers, then render            |
| R10  | Service files export default singleton via factory                    |
| R11  | `@babel/plugin-transform-export-namespace-from` always present        |
| R12  | Path aliases in both `tsconfig.json` and `babel.config.js` must match |

## Anti-Patterns

```typescript
// WRONG: Double quotes
import { Button } from "@components/core";

// CORRECT: Single quotes
import { Button } from '@components/core';

// WRONG: Missing trailing comma
const config = {
  name: 'app',
  version: '1.0'
}

// CORRECT: Trailing comma
const config = {
  name: 'app',
  version: '1.0',
};

// WRONG: Relative import across modules
import { Button } from '../../../components/core/Button';

// CORRECT: Path alias
import { Button } from '@components/core';

// WRONG: Path alias within same module
import { ProductEntity } from '@modules/products/domain/product.model';

// CORRECT: Relative within same module
import { ProductEntity } from '../../domain/product.model';

// WRONG: Inline styles in component
<View style={{ padding: 16, gap: 12 }}>

// CORRECT: StyleSheet at bottom
<View style={styles.container}>

const styles = StyleSheet.create({
  container: { padding: spacing.base, gap: spacing.md },
});

// WRONG: Mixing handler naming conventions
const press = () => {};
const onClickItem = () => {};

// CORRECT: Consistent 'handle' prefix
const handlePress = () => {};
const handleItemClick = () => {};
```
