---
trigger: model_decision
---

# Providers & Bootstrap Rules

App-level providers live in `src/providers/` and are composed, outside-in, by
`AppProvider`. Each provider configures exactly one piece of infrastructure;
none carries domain logic. Composition order matters because inner providers
depend on the context established by outer ones.

## Core Mandates

1. **Single responsibility.** One concern per provider (security, query client,
   theme, safe area, gestures, storage, network, navigation).
2. **`children` only.** Providers take `PropsWithChildren` and nothing else.
3. **Default export.** `export default function {Name}Provider`.
4. **Nesting order.** Outside-in:
   `ErrorBoundary → SecureProvider → QueryClientProvider → ThemeProvider →
   SafeAreaProvider → GestureHandler → SecureStorage → Network → Auth →
   Navigation`.
5. **One QueryClient.** Created once in `AppProvider`; never instantiate another
   in feature code.
6. **No business logic.** Providers configure infrastructure, not domain rules.
7. **Gate on async init.** A provider that initializes asynchronously (e.g.
   secure storage) renders nothing until ready, then mounts its children.

## File Structure

```
src/providers/
  AppProvider.tsx              # Root — composes all providers
  SecureProvider.tsx           # Blocks rooted/jailbroken devices (jail-monkey)
  SecureStorageProvider.tsx    # Initializes encrypted MMKV storage
  NetworkProvider.tsx          # Monitors connectivity, surfaces toast
  NavigationProvider.tsx       # NavigationContainer with theme mapping
  GestureHandlerProvider.tsx   # GestureHandlerRootView + StatusBar
```

## Do Not

- Do not create a second `QueryClient` outside `AppProvider`.
- Do not give a provider more than one responsibility or any domain logic.
- Do not render children before an async-init provider is ready.
- Do not reorder the nesting so an inner provider loses a context it depends on.

## See Also

- App entry and layering: [`architecture.md`](./architecture.md)
- Secure storage and connectivity stores: [`state-management.md`](./state-management.md)
