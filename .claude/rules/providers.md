# Providers Rules

App-level providers live in `src/providers/`. They wrap the entire app in `AppProvider`.

## Core Mandates

1. **Single Responsibility**: Each provider handles exactly one concern (security, networking, storage, navigation, gestures).
2. **Props**: Use `PropsWithChildren` — providers only receive `children`.
3. **Default Export**: Every provider uses `export default function {Name}Provider`.
4. **Nesting Order**: `ErrorBoundary > SecureProvider > QueryClientProvider > ThemeProvider > SafeAreaProvider > GestureHandler > SecureStorage > Network > Auth > Navigation`.
5. **QueryClient**: Defined once in `AppProvider` — never create another in feature code.
6. **No Business Logic**: Providers configure infrastructure, not domain rules.

## File Structure

```
src/providers/
  AppProvider.tsx              # Root — composes all providers
  SecureProvider.tsx           # Blocks rooted/jailbroken devices
  SecureStorageProvider.tsx    # Initializes encrypted MMKV storage
  NetworkProvider.tsx          # Monitors connectivity, shows toast
  NavigationProvider.tsx       # NavigationContainer with theme mapping
  GestureHandlerProvider.tsx   # GestureHandlerRootView + StatusBar
```

## Golden Example: Simple Provider

```typescript
import React, { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme, commonStyles } from '@theme/index';

export default function GestureHandlerProvider({
  children,
}: PropsWithChildren) {
  const {
    isDark,
    colors: { background: backgroundColor },
  } = useTheme();
  return (
    <GestureHandlerRootView style={{ ...commonStyles.flex, backgroundColor }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {children}
    </GestureHandlerRootView>
  );
}
```

## Golden Example: Async Init Provider

```typescript
export default function SecureStorageProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initSecureStorage()
      .then(() => setIsReady(true))
      .catch(() => setIsReady(true)); // fallback — continue anyway
  }, []);

  if (!isReady) return null;
  return <>{children}</>;
}
```
