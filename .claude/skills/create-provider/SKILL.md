---
name: create-provider
description: Create React context providers following project conventions. Use when creating context providers for dependency injection or feature-specific providers.
---

# Create Provider

Create React context providers following this project's patterns.

## When to Use

- Creating new context providers (like ThemeProvider, SecureProvider)
- Wrapping app with feature-specific providers
- Providing dependency injection for services
- When multiple components need shared state without global store

## Provider Pattern

### Basic Provider

```typescript
// src/providers/{Feature}Provider.tsx
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

interface FeatureContextValue {
  value: string;
  setValue: (value: string) => void;
}

const FeatureContext = createContext<FeatureContextValue>({
  value: '',
  setValue: () => {},
});
FeatureContext.displayName = 'FeatureContext';

export default function FeatureProvider({ children }: PropsWithChildren) {
  const [value, setValue] = useState('');

  return (
    <FeatureContext.Provider value={{ value, setValue }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeature() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within FeatureProvider');
  }
  return context;
}
```

### Provider with Dependencies

```typescript
// src/providers/NetworkProvider.tsx
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import axiosService from '@modules/network/infrastructure/axios.service';

interface NetworkContextValue {
  api: typeof axiosService;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);
NetworkContext.displayName = 'NetworkContext';

export default function NetworkProvider({ children }: PropsWithChildren) {
  const value = useMemo(
    () => ({
      api: axiosService,
    }),
    [],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
}
```

## Registering in AppProvider

After creating a provider, register it in the main AppProvider:

```typescript
// src/providers/AppProvider.tsx
import React, { PropsWithChildren } from 'react';
import { FeatureProvider } from './FeatureProvider';

export default function AppProvider({ children }: PropsWithChildren) {
  return <FeatureProvider>{children}</FeatureProvider>;
}
```

## Checklist

1. Create context with `createContext<T>()` with proper default value
2. Set `displayName` on context for React DevTools
3. Create provider component with `PropsWithChildren`
4. Create custom hook with context error guard
5. Throw error in hook if used outside provider
6. Use `useMemo` for expensive computations in value
7. Register in `AppProvider.tsx`
8. Place in `src/providers/`

## File Structure

```
src/
└── providers/
    ├── AppProvider.tsx       # Main provider
    ├── FeatureProvider.tsx   # New provider
    └── index.ts              # Barrel exports
```

## Import Order

```typescript
import React, { createContext, useContext, useState } from 'react';
// External
import { someExternal } from 'some-package';
// Internal
import { useAuthStore } from '@modules/auth/application/auth.store';
```

---

# Project Specific (edit for other projects)

## Provider Location

All providers in: `src/providers/`

## Main Providers

- `AppProvider.tsx` - Main wrapper combining all providers
- `ThemeProvider.tsx` - Theme context with useTheme hook

## Provider Order

In AppProvider, wrap in this order (innermost first):
1. NavigationContainer
2. ThemeProvider
3. QueryClientProvider
4. SafeAreaProvider
