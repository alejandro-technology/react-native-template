# CLAUDE.md

Template React Native con Clean Architecture. Las reglas arquitectónicas y de diseño están en `.claude/rules/`. Los skills de enforcement, generación y especialidad están en `.claude/skills/`. Los agentes están en `.claude/agents/`. Este archivo documenta **solo lo que no está en esos archivos**.

## Stack y Versiones

| Dependencia | Versión | Notas |
|---|---|---|
| React Native | 0.83.4 | New Architecture habilitada |
| React | 19.2.0 | |
| TypeScript | 5.8.3 | |
| Node | >=20 | Definido en `engines` |
| Package manager | bun | CI usa `bun install`, dev local también |

## Scripts Principales

```bash
bun run android          # Compilar y correr en Android
bun run ios              # Compilar y correr en iOS
bun run start            # Metro bundler
bun run test             # Jest
bun run lint             # ESLint
bun run prettier         # Formatear src/
bun run pod-cocoa        # bundle install en ios/
bun run pod-install      # bundle exec pod install en ios/
bun run clean-android    # Limpiar build Android + gradlew clean
bun run clean-ios        # Limpiar build iOS + Pods + Podfile.lock
bun run clean-watch      # Limpiar watchman
bun run clean-node       # Limpiar node_modules + bun.lockb
bun run claude           # Copiar .ai/ → .claude/ (sincronizar skills)
```

## Punto de Entrada y Composición de Providers

`App.tsx` → `AppProvider` → `RootNavigator`

Orden de providers (de afuera hacia adentro):
```
SecureProvider          → Bloquea dispositivos rooteados (JailMonkey)
  QueryClientProvider   → React Query (sin config custom en prod)
    ThemeProvider        → Contexto de tema con persistencia MMKV
      SafeAreaProvider   → Safe area insets
        GestureHandler   → Usa theme.colors.background como fondo
          NavigationProvider → NavigationContainer
```

## Configuración del Service Provider

En `src/config/config.ts` cambiar `CONFIG.SERVICE_PROVIDER`:

| Valor | Usa | Configurar |
|---|---|---|
| `'http'` | Axios → API REST | `src/config/api.routes.ts` (cambiar `API_ROUTES.ROOT`) |
| `'firebase'` | Firestore directo | `ios/GoogleService-Info.plist` + `android/app/google-services.json` |
| `'mock'` | Datos hardcoded | Sin configuración externa |

Cada módulo tiene un factory `{entity}.service.ts` que resuelve la implementación según este valor. No se necesita cambiar nada más.

## Inventario de Módulos

| Módulo | Tipo | Propósito |
|---|---|---|
| `products` | Feature completo | CRUD de referencia con las 4 capas. Copiar este al crear un módulo nuevo |
| `users` | Feature completo | Gestión de usuarios con las 4 capas |
| `authentication` | Feature | Login/registro con HTTP, Firebase y mock |
| `core` | Compartido | Estado global (Zustand): toast y modal de confirmación de borrado |
| `network` | Infraestructura | AxiosService singleton (baseURL desde `API_ROUTES.ROOT`, timeout 10s) |
| `firebase` | Infraestructura | Servicios de Firestore y Storage |
| `examples` | Showcase | Galería de componentes para referencia visual |

## Repositorios de Configuración

- **Rutas API REST**: `src/config/api.routes.ts` — `API_ROUTES.ROOT` apunta al backend
- **Colecciones Firestore**: `src/config/collections.routes.ts` — nombres de colecciones
- **Config general**: `src/config/config.ts` — service provider y credenciales root (solo mock)

## Navegación

- **Root**: `RootNavigator` renderiza condicionalmente `PublicNavigator` o `PrivateNavigator` según `useAuth().isAuthenticated`
- **Public stack**: `PublicStackNavigator` con `PublicRoutes` (`Examples | Authentication`)
- **Private stack**: `PrivateStackNavigator` con `PrivateRoutes` (`Products | Users | Example`)
- **Stacks por módulo**: `src/navigation/stacks/{Module}StackNavigator.tsx`
- **Rutas tipadas**: `src/navigation/routes/{module}.routes.ts` con enum + ParamList
- **Hooks de navegación**: `useNavigationPublic`, `useNavigationPrivate`, `useNavigationProducts`, `useNavigationUsers`, `useNavigationAuthentication`
- Pantalla inicial (no auth): `Examples` (primer screen en PublicNavigator)
- Pantalla inicial (auth): `Example` (primer screen en PrivateNavigator)

## Componentes Disponibles

**Core** (`@components/core`): AnimatedPressable, Avatar, Badge, Button, Card, Checkbox, DatePicker, Modal, Select, Text, TextInput, Toast

**Form** (`@components/form`): Checkbox, DatePicker, Select, TextInput — wrappers de core con `useController` de react-hook-form

**Layout** (`@components/layout`): DeleteConfirmationSheet, EmptyState, ErrorState, Header, ItemSeparatorComponent, LoadingState, RootLayout, Toolbar

## Estado Global (Zustand)

`useAppStorage` en `src/modules/core/infrastructure/app.storage.ts` expone:

- **modal**: `open({entityName, entityType, onConfirm})` / `close()` / `visible`
- **toast**: `show({message, type, duration?, position?})` / `hide()` / `visible`

Tipos de toast: `'success' | 'error' | 'info'`. Posición: `'top' | 'bottom'`. Duración default: 3000ms.

Los componentes `GlobalToast` y `GlobalDeleteConfirmation` están montados en `AppProvider` y se controlan desde cualquier parte vía el store.

## Testing

- **Custom render**: `import { render } from '@utils/test-utils'` — envuelve con QueryClient + ThemeProvider + SafeAreaProvider
- **Mocks globales** (`jest.setup.js`): gesture-handler, MMKV, Firebase (app/auth/firestore), react-navigation, jail-monkey
- **Coverage**: Sin threshold global. Thresholds específicos por archivo (Button, TextInput, Text al 100% lines)
- **Excluidos de coverage**: `*.styles.ts`, `*.types.ts`, `*.scheme.ts`, `*.adapter.ts`, `*.routes.ts`, `index.ts`, `test-utils.tsx`
- **QueryClient de test**: `retry: false`, `gcTime: 0`

## Repositorio de Interfaces (Domain)

Cada módulo feature define un `{entity}.repository.ts` en domain con la interfaz del servicio. Ejemplo de `ProductRepository`:
```typescript
getAll(filter?): Promise<ProductEntity[] | Error>
getById(id): Promise<ProductEntity | Error>
create(data): Promise<ProductEntity | Error>
update(id, data): Promise<ProductEntity | Error>
delete(id): Promise<void | Error>
```
Las tres implementaciones (http, firebase, mock) implementan esta misma interfaz.

## Idioma

- **UI y mensajes de error de validación**: Español
- **Código, nombres de variables, tipos**: Inglés
- **Formateo de fechas**: Meses en español (`Ene`, `Feb`, ... en `core/domain/date.utils.ts`)

## Sincronización .ai ↔ .claude

El directorio `.ai/` es la fuente de verdad que se comparte entre herramientas de IA. El script `bun run claude` copia `.ai/` a `.claude/` para sincronizar. Si se editan skills o reglas, hacerlo en `.ai/` y luego correr el script.

## Skills Sugeridas (Pendientes de Implementación)

| Skill | Tipo | Descripción |
|-------|------|-------------|
| internationalization | enforcement | Sistema i18n/l10n con i18next, estructura de locales, migración de strings |
| deep-linking | enforcement | Deep links y universal links con React Navigation, configuración iOS/Android |
| push-notifications | specialty | Notificaciones push end-to-end: permisos, tokens, foreground/background, deep linking |
| maps-and-location | specialty | Mapas, geolocalización, geocoding, geofencing con react-native-maps |
| payments | specialty | In-app purchases, Stripe, validación de receipts siguiendo clean architecture |
| create-middleware | generation | Interceptores Axios: refresh tokens, retry, logging, headers dinámicos |
| create-test | generation | Templates de test por capa (domain, infrastructure, application, UI) |
| dependency-manager | agent | Gestión de dependencias nativas, compatibilidad New Architecture, pods, gradle |
