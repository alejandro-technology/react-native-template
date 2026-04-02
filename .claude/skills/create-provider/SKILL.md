---
name: create-provider
description: Create a new app-level provider in src/providers/ following the project patterns (simple wrapper, side-effect, async init, security gate). Use when adding cross-cutting concerns like analytics, feature flags, crash reporting, or SDK initialization.
license: MIT
compatibility: opencode
metadata:
  layer: providers
  workflow: scaffold
  output: src/providers/{Name}Provider.tsx
---

# Skill: Create Provider

Create a new app-level provider in `src/providers/`.

## When to Use

- Adding a new cross-cutting concern (analytics, feature flags, crash reporting, A/B testing)
- Wrapping the app with a new SDK or context

## Pre-Checks

1. Confirm the concern doesn't already exist in `src/providers/`
2. Decide if async initialization is needed (e.g., SDK init)
3. Determine where in the nesting order it belongs

## Step 1: Create the Provider File

Create `src/providers/{Name}Provider.tsx`:

### Pattern A: Simple Provider (wraps a context/SDK)

```typescript
import React, { PropsWithChildren } from 'react';
// SDK / Context imports

export default function AnalyticsProvider({ children }: PropsWithChildren) {
  // Initialize or configure the concern
  // Optionally consume theme/stores for configuration

  return (
    <AnalyticsContext.Provider value={analyticsClient}>
      {children}
    </AnalyticsContext.Provider>
  );
}
```

### Pattern B: Side-Effect Provider (no wrapper, just effects)

Use when the provider monitors state and triggers side effects (e.g., network toast).

```typescript
import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { useAppStorage } from '@modules/core';

export default function NetworkProvider({ children }: PropsWithChildren) {
  const { isConnected, isLoading } = useNetInfo();
  const { show, hide } = useAppStorage(state => state.toast);
  const setConnected = useConnectivityStore(s => s.setConnected);
  const previousConnectedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setConnected(isConnected);
    }
  }, [isConnected, isLoading, setConnected]);

  useEffect(() => {
    if (isLoading) return;

    // Skip initial render
    if (previousConnectedRef.current === null) {
      previousConnectedRef.current = isConnected;
      return;
    }

    // Show toast when connection is lost
    if (!isConnected && previousConnectedRef.current === true) {
      show({
        message:
          'Sin conexion a internet. Algunas funciones pueden no estar disponibles.',
        type: 'info',
        duration: 5000,
        position: 'top',
      });
    }

    // Show reconnection message when restored
    if (isConnected && previousConnectedRef.current === false) {
      hide();
      show({
        message: 'Conexion restaurada',
        type: 'success',
        duration: 2000,
        position: 'top',
      });
    }

    previousConnectedRef.current = isConnected;
  }, [isConnected, isLoading, show, hide]);

  return <>{children}</>;
}
```

### Pattern C: Async Init Provider (blocks render until ready)

Use when the provider must initialize before the app renders (e.g., secure storage, feature flags).

```typescript
import React, { PropsWithChildren, useEffect, useState } from 'react';

export default function SecureStorageProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initSecureStorage()
      .then(() => setIsReady(true))
      .catch(error => {
        console.warn('Failed to initialize secure storage:', error);
        // Continue anyway — use fallback
        setIsReady(true);
      });
  }, []);

  if (!isReady) return null;
  return <>{children}</>;
}
```

### Pattern D: Security Gate Provider (blocks render conditionally)

Use when the provider blocks the app from rendering based on a condition (e.g., jailbreak detection).

```typescript
import JailMonkey from 'jail-monkey';
import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Text } from '@components/core';
import { commonStyles } from '@theme/index';

export default function SecureProvider({ children }: PropsWithChildren) {
  if (JailMonkey.isJailBroken()) {
    return (
      <View style={commonStyles.center}>
        <Text>
          Device is rooted. This application does not work on rooted devices.
        </Text>
      </View>
    );
  }
  return <>{children}</>;
}
```

## Step 2: Register in AppProvider

Add the new provider in `src/providers/AppProvider.tsx` following the nesting order:

```
ErrorBoundary > SecureProvider > QueryClientProvider > ThemeProvider >
SafeAreaProvider > GestureHandler > SecureStorage > Network > Auth > Navigation
```

Insert `import` at the top and nest in the correct position:

```typescript
import NewProvider from './NewProvider';

// In the JSX tree, nest at the correct level:
<SecureStorageProvider>
  <NewProvider>
    {' '}
    {/* <-- insert here if after storage, before network */}
    <NetworkProvider>...</NetworkProvider>
  </NewProvider>
</SecureStorageProvider>;
```

## Step 3: Create Test

Create `__tests__/providers/{Name}Provider.test.tsx`:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock dependencies BEFORE importing the provider
jest.mock('@modules/some-module', () => ({
  useSomeHook: () => ({ data: 'mocked' }),
}));

import NewProvider from '../../src/providers/NewProvider';

describe('NewProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <NewProvider>
        <Text>Child</Text>
      </NewProvider>,
    );
    expect(getByText('Child')).toBeTruthy();
  });
});
```

**Important testing notes for providers:**

- Use `@testing-library/react-native` directly (NOT `@utils/test-utils`) — test-utils already wraps providers
- Mock dependencies with `jest.mock()` BEFORE the import statement
- For default exports, use `{ __esModule: true, default: ... }` pattern
- Provider tests primarily verify children render correctly

## Checklist

- [ ] Provider file created with `export default function {Name}Provider`
- [ ] Uses `PropsWithChildren` as only prop type
- [ ] Registered in `AppProvider.tsx` at the correct nesting level
- [ ] Test file created in `__tests__/providers/`
- [ ] Dependencies mocked before import in test
- [ ] Run `bun run lint && bun run typecheck && bun run test`
