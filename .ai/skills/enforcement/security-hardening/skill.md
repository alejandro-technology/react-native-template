---
name: security-hardening
description: Enforce device security, secure storage, authentication patterns, and data protection. Use when implementing auth flows, storing sensitive data, or reviewing security-sensitive code.
---

# Security Hardening Skill

Enforces security patterns for device integrity, storage, authentication, and data protection.

## When to Use

- Implementing authentication flows
- Storing sensitive data (tokens, user preferences)
- Adding API interceptors or token management
- Reviewing security-sensitive code
- Configuring device integrity checks

## Security Architecture

```
Device Layer              Storage Layer              Network Layer
────────────             ─────────────             ─────────────
SecureProvider            MMKV (encrypted)           Axios instance
  └─ JailMonkey             ├─ theme-storage          ├─ 10s timeout
     └─ blocks rooted       ├─ rnca-global-storage    ├─ JSON headers
                            └─ Zustand persist        └─ manageAxiosError()

Auth Layer
──────────
Firebase Auth (automatic token management)
HTTP Auth (manual token management via interceptors)
```

## Device Security: SecureProvider

The app blocks execution on jailbroken/rooted devices:

```typescript
// src/providers/SecureProvider.tsx
import JailMonkey from 'jail-monkey';

export default function SecureProvider({ children }: PropsWithChildren) {
  if (JailMonkey.isJailBroken()) {
    return (
      <View style={commonStyles.center}>
        <Text>Dispositivo no compatible. Esta aplicacion no funciona en dispositivos rooteados.</Text>
      </View>
    );
  }
  return <>{children}</>;
}
```

### SecureProvider Position in Provider Tree

SecureProvider wraps the entire app as the **outermost** provider:

```
SecureProvider → QueryClientProvider → ThemeProvider → SafeAreaProvider → GestureHandlerRootView → NavigationProvider
```

## Secure Storage: MMKV

### Configuration

```typescript
// src/config/storage.ts
import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const storage = createMMKV({
  id: 'rnca-global-storage',
});

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: name => storage.getString(name) ?? null,
  removeItem: name => storage.remove(name),
};

// Custom Date reviver for ISO timestamps
export const mmkvReviver = (_key: string, value: unknown) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    return new Date(value);
  }
  return value;
};
```

### Zustand Persistence Pattern

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@config/storage';

export const useThemeStorage = create<State>()(
  persist(
    set => ({
      ...initialState,
      setTheme: mode => set({ theme: getTheme(mode) }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
```

### Storage Rules

| Rule | Description |
|---|---|
| Use MMKV over AsyncStorage | Faster, encrypted, synchronous |
| Unique storage IDs | Each store uses a distinct `id`/`name` |
| Date reviver for timestamps | Prevents date strings from losing type info |
| Zustand middleware integration | `createJSONStorage(() => mmkvStorage)` |

## Authentication Patterns

### Firebase Auth (Automatic Token Management)

```typescript
// Firebase handles token lifecycle automatically
import auth from '@react-native-firebase/auth';

class AuthFirebaseService implements AuthRepository {
  async signup(data: SignUpPayload): Promise<AuthEntity | Error> {
    try {
      const result = await auth().createUserWithEmailAndPassword(
        data.email,
        data.password,
      );
      return authEntityAdapter(result.user);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async signin(data: SignInPayload): Promise<AuthEntity | Error> {
    try {
      const result = await auth().signInWithEmailAndPassword(
        data.email,
        data.password,
      );
      return authEntityAdapter(result.user);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}
```

### HTTP Auth (Token Interceptors)

When using HTTP provider, add Axios interceptors for token management:

```typescript
// Pattern for adding auth interceptors to axios.service.ts
class AxiosService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_ROUTES.ROOT,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: attach token
    this.axiosInstance.interceptors.request.use(config => {
      const token = storage.getString('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: handle 401
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          storage.delete('auth-token');
          // Navigate to sign-in
        }
        return Promise.reject(error);
      },
    );
  }
}
```

## Error Message Security

Never expose technical details to users. All error messages are user-friendly and in Spanish:

```typescript
// WRONG: Exposing technical details
return new Error(`AxiosError: ECONNREFUSED at 192.168.0.14:3002`);

// CORRECT: User-friendly message
return new Error('El servicio no esta disponible en este momento.');
```

## .gitignore Security

Ensure sensitive files are excluded:

```
# Environment
.env
.env.local
.env.production

# Credentials
*.keystore
*.jks
google-services.json
GoogleService-Info.plist

# Coverage
coverage/
```

## Validation Rules

| Rule | Description |
|---|---|
| R1 | SecureProvider is the outermost provider in AppProvider |
| R2 | MMKV used for all persistent storage, never AsyncStorage |
| R3 | Each MMKV store has a unique `id` or `name` |
| R4 | Firebase auth errors use `manageFirebaseError()` |
| R5 | HTTP auth errors use `manageAxiosError()` |
| R6 | Error messages never expose technical details |
| R7 | All user-facing error messages are in Spanish |
| R8 | Auth tokens stored via MMKV, never in plain state |
| R9 | `.gitignore` excludes `.env`, `*.keystore`, credentials |
| R10 | Services return `T \| Error`, never throw |
| R11 | Axios timeout set to 10000ms |

## Anti-Patterns

```typescript
// WRONG: AsyncStorage (slow, unencrypted)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('token', token);

// CORRECT: MMKV (fast, encrypted)
import { storage } from '@config/storage';
storage.set('token', token);

// WRONG: Storing token in React state
const [token, setToken] = useState(apiToken);

// CORRECT: Storing in MMKV
storage.set('auth-token', token);

// WRONG: Exposing stack trace to user
return new Error(error.stack);

// CORRECT: User-friendly message
return new Error('Ocurrio un error inesperado. Por favor, intentalo de nuevo.');

// WRONG: No timeout on network requests
axios.create({ baseURL: url });

// CORRECT: Always set timeout
axios.create({ baseURL: url, timeout: 10000 });

// WRONG: SecureProvider inside other providers
<ThemeProvider>
  <SecureProvider>{children}</SecureProvider>
</ThemeProvider>

// CORRECT: SecureProvider as outermost
<SecureProvider>
  <ThemeProvider>{children}</ThemeProvider>
</SecureProvider>
```
