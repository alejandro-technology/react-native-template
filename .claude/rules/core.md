---
alwaysApply: true
description: Core architecture rules for React Native projects with Clean Architecture. Edit this file to adapt it to your project.
---

# Architecture

React Native v0.84.0 project with **Clean Architecture**.

## Structure

```
src/
├── components/        # Reusable UI components
│   ├── core/         # Base components (Button, Text, Modal, etc.)
│   ├── form/         # Form-integrated components (with react-hook-form)
│   └── layout/       # Layout components (RootLayout)
├── config/           # App configuration (API routes, storage keys)
├── modules/          # Feature modules (authentication, network, examples)
│   └── {feature}/
│       ├── domain/       # Business logic (models, repositories, adapters, schemas)
│       ├── infrastructure/  # External services (API calls)
│       ├── application/  # React Query hooks (mutations, queries)
│       └── ui/           # UI components and views
├── providers/        # React context providers (AppProvider, ThemeProvider)
└── theme/            # Design system (colors, typography, spacing, shadows)
```

## Path Aliases

```typescript
// Components
import { Button } from '@components/core';
import { TextInput } from '@components/form';
// Theme
import { useTheme, spacing } from '@theme/index';
// Config
import { API_ROUTES } from '@config/api.routes';
// Modules
import authService from '@modules/authentication/infrastructure/auth.service';
```

## Key Dependencies

- **State**: Zustand (global), TanStack Query (server state)
- **Forms**: react-hook-form + @hookform/resolvers + Zod
- **Network**: Axios
- **Storage**: react-native-mmkv
- **Navigation**: Custom navigator (no React Navigation)
- **UI**: react-native-gesture-handler, react-native-safe-area-context

## Layer Rules

1. **ui**: (Components and views) consumes hooks from application. MUST NOT import from infrastructure.
2. **application**: (Hooks) depends on domain and infrastructure.
3. **infrastructure**: (API services) implements repositories and HTTP calls.
4. **domain**: (Types, models, schemas) pure TypeScript, no framework dependencies.
