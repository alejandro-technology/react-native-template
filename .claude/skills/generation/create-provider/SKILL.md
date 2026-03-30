---
name: create-provider
category: generation
layer: ui
priority: medium
last_updated: 2026-03-25
tags:
  - react-context
  - providers
  - dependency-injection
triggers:
  - 'Creating context providers'
  - 'Adding feature providers'
description: Create React context providers following project conventions. Use when creating context providers for dependency injection or feature-specific state.
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

### Provider with Memoized Value

```typescript
// src/providers/NetworkProvider.tsx
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

interface NetworkContextValue {
  baseUrl: string;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);
NetworkContext.displayName = 'NetworkContext';

export default function NetworkProvider({ children }: PropsWithChildren) {
  const value = useMemo(
    () => ({
      baseUrl: 'https://api.example.com',
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

After creating a provider, register it in `AppProvider`. The current provider order (outermost to innermost):

```typescript
// src/providers/AppProvider.tsx
<ErrorBoundary>
  <SecureProvider>              {/* Blocks rooted devices */}
    <QueryClientProvider>       {/* React Query */}
      <ThemeProvider>            {/* Theme context with MMKV persistence */}
        <SafeAreaProvider>       {/* Safe area insets */}
          <GestureHandlerProvider> {/* Uses theme.colors.background */}
            <AuthProvider>        {/* Authentication state */}
              <NavigationProvider>  {/* NavigationContainer */}
                <SafeAreaView>      {/* Inset padding */}
                  {children}
                </SafeAreaView>
                <GlobalDeleteConfirmation />
                <GlobalToast />
              </NavigationProvider>
            </AuthProvider>
          </GestureHandlerProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </SecureProvider>
</ErrorBoundary>
```

**Important:** The order matters:
- `ThemeProvider` must wrap anything that uses `useTheme()`
- `QueryClientProvider` must wrap anything using React Query
- `NavigationProvider` wraps the app content (NavigationContainer)
- `AuthProvider` must be inside `QueryClientProvider` (may use queries)
- Global UI components (Toast, DeleteConfirmation) are mounted inside NavigationProvider

## Checklist

1. Create context with `createContext<T>()` with proper default value
2. Set `displayName` on context for React DevTools
3. Create provider component with `PropsWithChildren`
4. Create custom hook with context error guard
5. Throw error in hook if used outside provider
6. Use `useMemo` for expensive computations in value
7. Register in `AppProvider.tsx` at appropriate nesting level
8. Default export for provider, named export for hook

## File Structure

```
src/
├── providers/
│   ├── AppProvider.tsx          # Main provider composition
│   ├── SecureProvider.tsx       # Root/jailbreak detection
│   └── NavigationProvider.tsx   # NavigationContainer
└── theme/
    └── providers/
        └── ThemeProvider.tsx     # Theme context (in theme dir)
```

**Note:** ThemeProvider lives in `src/theme/providers/` (not in `src/providers/`) because it's part of the theme system.

## References

- AppProvider: `src/providers/AppProvider.tsx`
- ThemeProvider: `src/theme/providers/ThemeProvider.tsx`
- SecureProvider: `src/providers/SecureProvider.tsx`
- NavigationProvider: `src/providers/NavigationProvider.tsx`
