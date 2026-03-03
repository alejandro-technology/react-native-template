---
name: create-store
description: Create Zustand stores with optional MMKV persistence. Use when creating global state that needs to persist across app restarts.
---

# Create Store

Create Zustand stores following this project's patterns.

## When to Use

- Creating global state (auth, user preferences, theme)
- Needing client-side state that persists across app restarts
- Sharing state between multiple components
- NOT for server state (use React Query in application layer)

## Store Types

### Basic Store (No Persistence)

```typescript
// src/modules/{feature}/application/{feature}.store.ts
import { create } from 'zustand';
import { UserEntity } from '../domain/{feature}.model';

interface {Feature}State {
  user: UserEntity | null;
  isAuthenticated: boolean;
  setUser: (user: UserEntity | null) => void;
  logout: () => void;
}

export const use{Feature}Store = create<{Feature}State>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Persistent Store (With MMKV)

```typescript
// src/modules/{feature}/application/{feature}.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@config/storage';
import { UserEntity } from '../domain/{feature}.model';

interface {Feature}State {
  user: UserEntity | null;
  isAuthenticated: boolean;
  setUser: (user: UserEntity | null) => void;
  logout: () => void;
}

export const use{Feature}Store = create<{Feature}State>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: '{feature}-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

### Store with Actions

```typescript
// src/modules/{feature}/application/{feature}.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@config/storage';

interface ThemeState {
  mode: 'light' | 'dark';
  primaryColor: string;
  setMode: (mode: 'light' | 'dark') => void;
  setPrimaryColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      mode: 'light',
      primaryColor: '#007AFF',
      setMode: mode => set({ mode }),
      setPrimaryColor: primaryColor => set({ primaryColor }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
```

## Usage in Components

```typescript
import { useAuthStore } from '@modules/auth/application/auth.store';

function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <View>
      <Text>{user?.email}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

## Checklist

1. Import `create` from 'zustand'
2. Import `persist` and `createJSONStorage` from 'zustand/middleware' if needed
3. Import `mmkvStorage` from `@config/storage` for persistence
4. Define state interface with TypeScript
5. Create store with `create<StateInterface>()`
6. Use named export: `export const use{Feature}Store`
7. Storage key should be unique: `{feature}-storage`
8. Place in `src/modules/{feature}/application/`

## File Structure

```
src/modules/{feature}/
├── domain/
│   └── {feature}.model.ts
└── application/
    └── {feature}.store.ts
```

## Best Practices

- Use slices for large stores: `create<State>()((...a) =>(...sliceA, ...sliceB))`
- Keep stores focused on single responsibility
- Use selectors for optimized re-renders: `useStore((state) => state.specificField)`

---

# Project Specific (edit for other projects)

## Store Location

- Feature stores: `src/modules/{feature}/application/{feature}.store.ts`
- Global stores: `src/stores/` (if needed)

## Persistence

- Storage: react-native-mmkv
- Import from: `@config/storage`

## NOT for Server State

For server state (API data), use React Query in `application/` layer:
- Queries: `{feature}.queries.ts`
- Mutations: `{feature}.mutations.ts`
