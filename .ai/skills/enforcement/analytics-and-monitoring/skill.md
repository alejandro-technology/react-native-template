---
name: analytics-and-monitoring
category: enforcement
layer: cross-cutting
priority: medium
tags:
  - analytics
  - crash-reporting
  - performance
  - firebase-analytics
  - tracking
triggers:
  - 'Adding analytics'
  - 'Implementing tracking'
  - 'Crash reporting setup'
  - 'Performance monitoring'
description: Enforce analytics and monitoring patterns with factory-based providers, typed events, screen tracking via React Navigation, crash reporting, and performance monitoring.
---

# Analytics & Monitoring Skill

Enforces consistent analytics, crash reporting, and performance monitoring patterns using the project's factory architecture.

## When to Use

- Adding analytics tracking to screens or features
- Implementing crash reporting
- Setting up performance monitoring
- Creating new tracked events
- Reviewing analytics implementation

## Architecture Overview

```
┌────────────────────────────────────────────────┐
│  UI Layer                                       │
│  ┌──────────────┐  ┌───────────────────┐       │
│  │ useAnalytics │  │ Screen Tracking   │       │
│  │ hook         │  │ (auto via Nav)    │       │
│  └──────┬───────┘  └───────┬───────────┘       │
├─────────┼──────────────────┼───────────────────┤
│  Application Layer                              │
│  ┌──────┴──────────────────┴───────────┐       │
│  │ AnalyticsService (factory)           │       │
│  │ ┌──────────┬──────────┬───────────┐ │       │
│  │ │ Firebase │ Mixpanel │   Mock    │ │       │
│  │ └──────────┴──────────┴───────────┘ │       │
│  └─────────────────────────────────────┘       │
└────────────────────────────────────────────────┘
```

## Rules

### R1: Factory Pattern for Analytics Provider

Follow the same factory pattern as other services (`CONFIG.SERVICE_PROVIDER`).

```typescript
// ✅ CORRECT: Analytics repository interface
// src/modules/analytics/domain/analytics.repository.ts
export interface AnalyticsRepository {
  initialize(): Promise<void>;
  trackScreenView(screenName: string, params?: Record<string, string>): void;
  trackEvent(event: AnalyticsEvent): void;
  setUserId(userId: string | null): void;
  setUserProperties(properties: Record<string, string>): void;
}
```

```typescript
// ✅ CORRECT: Firebase analytics implementation
// src/modules/analytics/infrastructure/analytics.firebase.service.ts
import analytics from '@react-native-firebase/analytics';
import type { AnalyticsRepository } from '../domain/analytics.repository';
import type { AnalyticsEvent } from '../domain/analytics.model';

class FirebaseAnalyticsService implements AnalyticsRepository {
  async initialize(): Promise<void> {
    await analytics().setAnalyticsCollectionEnabled(true);
  }

  trackScreenView(screenName: string, params?: Record<string, string>): void {
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
      ...params,
    });
  }

  trackEvent(event: AnalyticsEvent): void {
    analytics().logEvent(event.name, event.params);
  }

  setUserId(userId: string | null): void {
    analytics().setUserId(userId);
  }

  setUserProperties(properties: Record<string, string>): void {
    Object.entries(properties).forEach(([key, value]) => {
      analytics().setUserProperty(key, value);
    });
  }
}

export default new FirebaseAnalyticsService();
```

```typescript
// ✅ CORRECT: Mock analytics (for development)
// src/modules/analytics/infrastructure/analytics.mock.service.ts
import type { AnalyticsRepository } from '../domain/analytics.repository';
import type { AnalyticsEvent } from '../domain/analytics.model';

class MockAnalyticsService implements AnalyticsRepository {
  async initialize(): Promise<void> {
    if (__DEV__) console.log('[Analytics] Initialized (mock)');
  }

  trackScreenView(screenName: string): void {
    if (__DEV__) console.log('[Analytics] Screen:', screenName);
  }

  trackEvent(event: AnalyticsEvent): void {
    if (__DEV__) console.log('[Analytics] Event:', event.name, event.params);
  }

  setUserId(userId: string | null): void {
    if (__DEV__) console.log('[Analytics] User ID:', userId);
  }

  setUserProperties(properties: Record<string, string>): void {
    if (__DEV__) console.log('[Analytics] Properties:', properties);
  }
}

export default new MockAnalyticsService();
```

```typescript
// ✅ CORRECT: Factory service
// src/modules/analytics/infrastructure/analytics.service.ts
import { CONFIG } from '@config/config';
import type { AnalyticsRepository } from '../domain/analytics.repository';

function createAnalyticsService(): AnalyticsRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'firebase':
      return require('./analytics.firebase.service').default;
    case 'http':
      return require('./analytics.firebase.service').default; // Can use Firebase for analytics even with HTTP API
    case 'mock':
      return require('./analytics.mock.service').default;
    default:
      throw new Error(`Unknown analytics provider: ${CONFIG.SERVICE_PROVIDER}`);
  }
}

const analyticsService = createAnalyticsService();
export default analyticsService;
```

### R2: Type-Safe Event Definitions

All analytics events must be defined as typed constants.

```typescript
// ✅ CORRECT: Typed events
// src/modules/analytics/domain/analytics.model.ts
export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
}

// Event catalog — add new events here
export const ANALYTICS_EVENTS = {
  // Authentication
  LOGIN_SUCCESS: { name: 'login_success' },
  LOGIN_FAILURE: { name: 'login_failure' },
  LOGOUT: { name: 'logout' },
  REGISTER_SUCCESS: { name: 'register_success' },

  // CRUD operations
  ITEM_CREATED: (entity: string) => ({
    name: 'item_created',
    params: { entity_type: entity },
  }),
  ITEM_UPDATED: (entity: string) => ({
    name: 'item_updated',
    params: { entity_type: entity },
  }),
  ITEM_DELETED: (entity: string) => ({
    name: 'item_deleted',
    params: { entity_type: entity },
  }),
  ITEM_VIEWED: (entity: string, id: string) => ({
    name: 'item_viewed',
    params: { entity_type: entity, entity_id: id },
  }),

  // Errors
  ERROR_DISPLAYED: (screen: string, errorType: string) => ({
    name: 'error_displayed',
    params: { screen, error_type: errorType },
  }),
} as const;

// ❌ INCORRECT: Untyped string events scattered across files
analyticsService.trackEvent({ name: 'some_event' }); // No catalog
```

### R3: Automatic Screen Tracking via React Navigation

Track screen views automatically using `NavigationContainer`'s `onStateChange`.

```typescript
// ✅ CORRECT: Screen tracking in NavigationProvider
// src/navigation/NavigationProvider.tsx
import { useRef } from 'react';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import analyticsService from '@modules/analytics/infrastructure/analytics.service';

function getActiveRouteName(state: NavigationState | undefined): string | undefined {
  if (!state) return undefined;
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }
  return route.name;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const routeNameRef = useRef<string | undefined>();

  const handleStateChange = (state: NavigationState | undefined) => {
    const currentRouteName = getActiveRouteName(state);
    const previousRouteName = routeNameRef.current;

    if (currentRouteName && currentRouteName !== previousRouteName) {
      analyticsService.trackScreenView(currentRouteName);
    }

    routeNameRef.current = currentRouteName;
  };

  return (
    <NavigationContainer
      onStateChange={handleStateChange}
      onReady={() => {
        // Track initial screen
        routeNameRef.current = 'InitialScreen';
      }}
    >
      {children}
    </NavigationContainer>
  );
}

// ❌ INCORRECT: Manual screen tracking in every screen
function ProductsListView() {
  useEffect(() => {
    analyticsService.trackScreenView('ProductsList'); // Don't do this manually
  }, []);
}
```

### R4: Track Events in Application Layer (Not UI)

Analytics calls belong in mutations/queries callbacks, not in UI components directly.

```typescript
// ✅ CORRECT: Track in mutation onSuccess
export function useProductCreate() {
  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = productFormToPayloadAdapter(data);
      const result = await productService.create(payload);
      if (result instanceof Error) throw result;
      return productEntityAdapter(result);
    },
    onSuccess: () => {
      analyticsService.trackEvent(ANALYTICS_EVENTS.ITEM_CREATED('product'));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      analyticsService.trackEvent(
        ANALYTICS_EVENTS.ERROR_DISPLAYED('ProductCreate', 'mutation_error'),
      );
    },
  });
}

// ❌ INCORRECT: Tracking directly in UI handler
function ProductFormView() {
  const handleSubmit = async (data) => {
    analyticsService.trackEvent({ name: 'product_created' }); // Wrong layer
    await createMutation.mutateAsync(data);
  };
}
```

### R5: Crash Reporting Setup

Configure crash reporting as part of analytics initialization.

```typescript
// ✅ CORRECT: Crash reporting with Firebase Crashlytics
// src/modules/analytics/infrastructure/crashlytics.service.ts
import crashlytics from '@react-native-firebase/crashlytics';

export const crashlyticsService = {
  initialize: async () => {
    await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
  },

  setUserId: (userId: string) => {
    crashlytics().setUserId(userId);
  },

  log: (message: string) => {
    crashlytics().log(message);
  },

  recordError: (error: Error, context?: string) => {
    if (context) crashlytics().log(context);
    crashlytics().recordError(error);
  },

  setAttribute: (key: string, value: string) => {
    crashlytics().setAttribute(key, value);
  },
};
```

```typescript
// ✅ CORRECT: Error boundary reports to crashlytics
// Integration in service error handling:
async getAll(): Promise<ProductEntity[] | Error> {
  try {
    const response = await axiosService.get<ProductEntity[]>('/products');
    return response.data;
  } catch (error) {
    const managedError = manageAxiosError(error);
    // Report non-network errors to crashlytics
    if (!isNetworkError(error)) {
      crashlyticsService.recordError(managedError, 'ProductService.getAll');
    }
    return managedError;
  }
}
```

### R6: Performance Monitoring

Track critical user flows and slow operations.

```typescript
// ✅ CORRECT: Performance trace for critical flows
// src/modules/analytics/infrastructure/performance.service.ts
import perf from '@react-native-firebase/perf';

export const performanceService = {
  startTrace: async (name: string) => {
    const trace = await perf().startTrace(name);
    return {
      stop: () => trace.stop(),
      putMetric: (key: string, value: number) => trace.putMetric(key, value),
      putAttribute: (key: string, value: string) => trace.putAttribute(key, value),
    };
  },

  // HTTP metrics are automatically captured by Firebase Performance
  // when using @react-native-firebase/perf

  startScreenTrace: async (screenName: string) => {
    const trace = await perf().startScreenTrace(screenName);
    return {
      stop: () => trace.stop(),
    };
  },
};
```

```typescript
// ✅ CORRECT: Trace in critical mutations
export function useProductCreate() {
  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const trace = await performanceService.startTrace('product_create');
      try {
        const payload = productFormToPayloadAdapter(data);
        const result = await productService.create(payload);
        if (result instanceof Error) {
          trace.putAttribute('error', 'true');
          throw result;
        }
        trace.putAttribute('error', 'false');
        return productEntityAdapter(result);
      } finally {
        await trace.stop();
      }
    },
  });
}
```

### R7: Set User Context on Authentication

When a user authenticates, set their identity across all analytics services.

```typescript
// ✅ CORRECT: Set user context on login
// In authentication mutation onSuccess:
onSuccess: (user) => {
  analyticsService.setUserId(user.id);
  analyticsService.setUserProperties({
    user_role: user.role,
    account_type: user.accountType,
  });
  crashlyticsService.setUserId(user.id);
},

// ✅ CORRECT: Clear on logout
onSuccess: () => {
  analyticsService.setUserId(null);
  crashlyticsService.setUserId('');
},
```

## Event Naming Conventions

| Convention | Example | Note |
|------------|---------|------|
| Snake_case | `item_created` | Firebase Analytics standard |
| Verb_noun | `login_success`, `item_deleted` | Action + subject |
| Max 40 chars | `product_filter_applied` | Firebase limit |
| No PII | `user_updated` (not `john_updated`) | Privacy compliance |

## Verification Checklist

```bash
# 1. Verify factory pattern for analytics
grep -r "CONFIG.SERVICE_PROVIDER" src/modules/analytics/infrastructure/
# Should have factory switch

# 2. Verify typed event usage (no raw strings)
grep -rn "trackEvent" src/modules/*/application/ --include="*.ts"
# Should reference ANALYTICS_EVENTS constants

# 3. Verify screen tracking is automatic
grep -rn "onStateChange" src/navigation/
# Should have navigation state tracking

# 4. Verify no analytics calls in UI layer
grep -rn "trackEvent\|trackScreenView" src/modules/*/ui/ --include="*.tsx"
# Should return minimal or no results (screen tracking is automatic)

# 5. Verify crash reporting on errors
grep -rn "recordError" src/modules/*/infrastructure/ --include="*.ts"
# Should have crash reporting in error paths
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@react-native-firebase/analytics` | Analytics tracking |
| `@react-native-firebase/crashlytics` | Crash reporting |
| `@react-native-firebase/perf` | Performance monitoring |

## References

- Firebase Analytics: firebase.google.com/docs/analytics
- Firebase Crashlytics: firebase.google.com/docs/crashlytics
- Firebase Performance: firebase.google.com/docs/perf-mon
- Service factory pattern: `src/modules/products/infrastructure/product.service.ts`
