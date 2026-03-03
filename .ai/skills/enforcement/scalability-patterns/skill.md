---
name: scalability-patterns
description: Enforce scalability patterns including provider composition, module isolation, configuration centralization, and new feature bootstrapping. Use when adding modules, scaling architecture, or reviewing project structure.
---

# Scalability Patterns Skill

Enforces patterns that allow the template to scale from a starter project to a production application.

## When to Use

- Adding new feature modules
- Scaling the provider architecture
- Centralizing configuration
- Planning multi-environment deployment
- Reviewing architectural boundaries

## Provider Composition Architecture

### Provider Order (Outermost to Innermost)

```typescript
// src/providers/AppProvider.tsx
export default function AppProvider({ children }: PropsWithChildren) {
  return (
    <SecureProvider>                    {/* 1. Device security gate */}
      <QueryClientProvider client={queryClient}>  {/* 2. Server state */}
        <ThemeProvider>                 {/* 3. Theme context */}
          <SafeAreaProvider>            {/* 4. Safe area insets */}
            <GestureHandlerRootView>   {/* 5. Gesture support */}
              <NavigationProvider>     {/* 6. Navigation container */}
                {children}
                <GlobalDeleteConfirmation />
                <GlobalToast />
              </NavigationProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SecureProvider>
  );
}
```

### Adding New Providers

When adding a new provider (e.g., analytics, feature flags):

```typescript
// 1. Create the provider in src/providers/
export default function AnalyticsProvider({ children }: PropsWithChildren) {
  // Initialize analytics SDK
  return <>{children}</>;
}

// 2. Add to AppProvider in the correct position
// Rule: SDK/infra providers go OUTSIDE ThemeProvider
// Rule: UI-dependent providers go INSIDE NavigationProvider
<SecureProvider>
  <QueryClientProvider client={queryClient}>
    <AnalyticsProvider>              {/* New: SDK provider */}
      <ThemeProvider>
        {/* ... */}
      </ThemeProvider>
    </AnalyticsProvider>
  </QueryClientProvider>
</SecureProvider>
```

### Provider Position Rules

| Provider Type | Position | Reason |
|---|---|---|
| Security gates | Outermost | Block app before anything loads |
| SDK/infra providers | Outside ThemeProvider | Don't need UI context |
| State providers | Outside NavigationProvider | State available everywhere |
| UI providers | Inside ThemeProvider | Need theme context |
| Global UI components | Inside NavigationProvider | Need navigation context |

## Module Isolation

### Adding a New Feature Module

Every module is self-contained with 4 layers:

```
modules/{entities}/
├── domain/           # Pure TypeScript, no framework
│   ├── {entity}.model.ts
│   ├── {entity}.repository.ts
│   ├── {entity}.scheme.ts
│   ├── {entity}.adapter.ts
│   └── {entity}.utils.ts
├── infrastructure/   # External services
│   ├── {entity}.service.ts          # Factory (provider switcher)
│   ├── {entity}.http.service.ts     # HTTP implementation
│   └── {entity}.firebase.service.ts # Firebase implementation
├── application/      # React Query hooks
│   ├── {entity}.queries.ts
│   └── {entity}.mutations.ts
└── ui/               # React Native views
    ├── {Entities}ListView.tsx
    ├── {Entity}DetailView.tsx
    ├── {Entity}FormView.tsx
    └── components/
        ├── {Entity}Form.tsx
        ├── {Entity}Item.tsx
        └── {Entity}List.tsx
```

### Module Registration Checklist

When adding module `{Entities}`:

1. **Config** — Add API route and collection name:
   ```typescript
   // src/config/api.routes.ts
   export const API_ROUTES = {
     // ...existing
     {ENTITIES}: '/{entities}',
   };

   // src/config/collections.routes.ts
   export const COLLECTIONS = {
     // ...existing
     {ENTITIES}: '{entities}',
   };
   ```

2. **Navigation** — Create routes, stack, and hook:
   ```typescript
   // src/navigation/routes/{entities}.routes.ts
   // src/navigation/stacks/{Entities}StackNavigator.tsx
   // src/navigation/hooks/useNavigation.ts (add hook)
   // src/navigation/routes/index.ts (add export)
   ```

3. **Root Navigator** — Register the stack:
   ```typescript
   // src/navigation/RootNavigator.tsx
   <Stack.Screen name={RootRoutes.{Entities}} component={{Entities}Navigator} />

   // src/navigation/routes/root.routes.ts
   [RootRoutes.{Entities}]: NavigatorScreenParams<{Entities}StackParamList>;
   ```

4. **React Query Keys** — Follow the convention:
   ```typescript
   // List queries:  ['{entities}', 'list', searchText]
   // Detail queries: ['{entities}', 'detail', id]
   // Mutations invalidate: ['{entities}']
   ```

## Configuration Centralization

### Service Provider Switching

```typescript
// src/config/config.ts
export type ServiceProvider = 'http' | 'firebase';

interface Config {
  SERVICE_PROVIDER: ServiceProvider;
}

export const CONFIG: Config = {
  SERVICE_PROVIDER: 'firebase',
};
```

One config change switches **all** modules simultaneously. Each service factory reads from `CONFIG`:

```typescript
// Pattern used by every module's service.ts
import { CONFIG } from '@config/config';

function create{Entity}Service(): {Entity}Repository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return {entity}HttpService;
    case 'firebase':
      return {entity}FirebaseService;
    default:
      throw new Error(`Unknown provider: ${CONFIG.SERVICE_PROVIDER}`);
  }
}
export default create{Entity}Service();
```

### Adding a New Provider Type

1. Add type to config:
   ```typescript
   export type ServiceProvider = 'http' | 'firebase' | 'supabase';
   ```

2. Create implementation for each module:
   ```typescript
   // modules/{entities}/infrastructure/{entity}.supabase.service.ts
   class {Entity}SupabaseService implements {Entity}Repository {
     // Implement all 5 methods
   }
   ```

3. Add case to each factory:
   ```typescript
   case 'supabase':
     return {entity}SupabaseService;
   ```

4. No changes needed in domain, application, or UI layers.

### API Routes Centralization

```typescript
// src/config/api.routes.ts
export const API_ROUTES = {
  ROOT: 'http://192.168.0.14:3002/bp',
  PRODUCTS: '/products',
  USERS: '/users',
  SIGNIN: '/auth/signin',
  SIGNUP: '/auth/signup',
};
```

### Firebase Collections Centralization

```typescript
// src/config/collections.routes.ts
export const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
};
```

## React Query Cache Architecture

### Key Hierarchy

```
                      ┌─ ['{entities}', 'list', searchText]
{entities} ──────────┤
                      └─ ['{entities}', 'detail', id]
```

### Cache Invalidation Matrix

| Mutation | Invalidates | Why |
|---|---|---|
| Create | `['{entities}']` | Refreshes all lists |
| Update | `['{entities}']` + `['{entities}', 'detail', id]` | Refreshes lists and specific detail |
| Delete | `['{entities}']` | Refreshes all lists |

### Scaling Query Keys

For modules with nested resources:

```typescript
// Orders with line items
queryKey: ['orders', 'list', filter]
queryKey: ['orders', 'detail', orderId]
queryKey: ['orders', orderId, 'items', 'list']
queryKey: ['orders', orderId, 'items', 'detail', itemId]
```

## Global UI Components

Toast and confirmation modal are managed globally via Zustand:

```typescript
// src/modules/core/infrastructure/app.storage.ts
interface AppState {
  toast: {
    show: (config: ToastConfig) => void;
    hide: () => void;
  };
  modal: {
    show: (config: ModalConfig) => void;
    hide: () => void;
  };
}
```

### Adding New Global UI

1. Add state to `app.storage.ts`
2. Create the component in `src/components/core/`
3. Add to `AppProvider` inside `NavigationProvider`:
   ```typescript
   <NavigationProvider>
     {children}
     <GlobalDeleteConfirmation />
     <GlobalToast />
     <GlobalNewComponent />          {/* New */}
   </NavigationProvider>
   ```

## Shared Hooks

Cross-cutting hooks live in `src/hooks/`:

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

### When to Use Shared vs Module Hooks

| Shared (`@hooks/*`) | Module (`application/`) |
|---|---|
| `useDebounce` | `useProducts` |
| `useKeyboard` | `useProductCreate` |
| `useNetworkStatus` | `useAuthSignIn` |
| Generic utilities | Feature-specific queries/mutations |

## Validation Rules

| Rule | Description |
|---|---|
| R1 | Every module has exactly 4 layers: domain, infrastructure, application, UI |
| R2 | Service factory reads from `CONFIG.SERVICE_PROVIDER` |
| R3 | API routes centralized in `src/config/api.routes.ts` |
| R4 | Firebase collections centralized in `src/config/collections.routes.ts` |
| R5 | Provider order: Security → State → Theme → SafeArea → Gesture → Navigation |
| R6 | New modules register in: config, navigation routes, root navigator |
| R7 | Query keys follow `['{entities}', 'list'\|'detail', param]` pattern |
| R8 | Create/Delete invalidate list; Update invalidates list + detail |
| R9 | Global UI components placed inside NavigationProvider in AppProvider |
| R10 | Cross-cutting hooks in `src/hooks/`, feature hooks in `application/` |
| R11 | Adding a new provider type requires zero changes to domain/application/UI |
| R12 | Each module is independently removable (no cross-module domain imports) |

## Anti-Patterns

```typescript
// WRONG: Module importing from another module's domain
import { ProductEntity } from '@modules/products/domain/product.model';
// in users module — creates coupling

// CORRECT: Each module owns its own types
// If shared types are needed, extract to src/modules/core/domain/

// WRONG: Hardcoded API URL in service
const response = await axios.get('http://192.168.0.14:3002/bp/products');

// CORRECT: Centralized config
const response = await this.axiosInstance.get(API_ROUTES.PRODUCTS);

// WRONG: Provider-specific logic in application layer
import firestore from '@react-native-firebase/firestore';
export function useProducts() {
  return useQuery({
    queryFn: () => firestore().collection('products').get(),
  });
}

// CORRECT: Application layer calls abstract service
export function useProducts() {
  return useQuery({
    queryFn: () => productService.getAll(),
  });
}

// WRONG: Duplicating React Query config
const queryClient = new QueryClient(); // in multiple files

// CORRECT: Single QueryClient in AppProvider
// Configured once, provided globally

// WRONG: Adding feature hooks to src/hooks/
// src/hooks/useProducts.ts ← Feature-specific!

// CORRECT: Feature hooks in module's application layer
// src/modules/products/application/product.queries.ts
```
