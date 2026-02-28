---
name: create-navigation
description: Create navigation structure with React Navigation. Use when setting up app navigation, stacks, or routes.
---

# React Navigation Template

## Objetivo

Guía reusable para implementar react-navigation en proyectos React Native con TypeScript, siguiendo patrones extraídos de DevsuBank y extendidos a stacks, tabs y drawer.

## Patrón base detectado en DevsuBank

- Contenedor raíz con `NavigationContainer` y `navigationRef`.
- Rutas y params centralizados en `src/navigation/config/routes.ts` con `as const` y tipos derivados.
- Navegadores por módulo en `src/navigation/stacks/`.
- Hook tipado de navegación en `src/navigation/hooks/`.
- Pantallas tipadas con `RouteProp`.
- Uso de alias de paths en imports (`@navigation/*`).

Referencias: [RootNavigation.tsx](file:///Users/crisanger/Documents/PROJECTS/DEVSU/DevsuBank/src/navigation/RootNavigation.tsx), [routes.ts](file:///Users/crisanger/Documents/PROJECTS/DEVSU/DevsuBank/src/navigation/config/routes.ts), [ProductsStackNavigation.tsx](file:///Users/crisanger/Documents/PROJECTS/DEVSU/DevsuBank/src/navigation/stacks/ProductsStackNavigation.tsx), [useNavigation.tsx](file:///Users/crisanger/Documents/PROJECTS/DEVSU/DevsuBank/src/navigation/hooks/useNavigation.tsx), [ProductsFormView.tsx](file:///Users/crisanger/Documents/PROJECTS/DEVSU/DevsuBank/src/modules/products/ui/views/ProductsFormView.tsx), [ProductDetailView.tsx](file:///Users/crisanger/Documents/PROJECTS/DEVSU/DevsuBank/src/modules/products/ui/views/ProductDetailView.tsx)

## Estructura recomendada de carpetas

Basada en `src/navigation/` de DevsuBank y extendida para tabs y drawer:

```
src/
  navigation/
    config/
      routes.ts
      linking.ts
      guards.ts
      state.ts
    hooks/
      useNavigation.tsx
      useRouteParams.ts
    stacks/
      RootStackNavigation.tsx
      ProductsStackNavigation.tsx
    tabs/
      MainTabsNavigation.tsx
    drawers/
      MainDrawerNavigation.tsx
    RootNavigation.tsx
```

## Paso a paso de implementación

### 1) Instalar dependencias de navegación

En un proyecto nuevo, instala lo necesario según el tipo de navegador que uses:

- `@react-navigation/native`
- `@react-navigation/native-stack`
- Opcionales:
  - `@react-navigation/bottom-tabs`
  - `@react-navigation/drawer`

También instala y configura `react-native-screens`, `react-native-gesture-handler`, `react-native-safe-area-context` y `react-native-reanimated` según la guía oficial.

Checklist de dependencias:

```
@react-navigation/native
@react-navigation/native-stack
react-native-screens
react-native-safe-area-context
react-native-gesture-handler
react-native-reanimated
```

### 2) Definir rutas y params tipados

`src/navigation/config/routes.ts`

```ts
export const AppRoutes = {
  Home: 'Home',
  Details: 'Details',
  Settings: 'Settings',
} as const;

export type AppRouteName = (typeof AppRoutes)[keyof typeof AppRoutes];

export type RootStackParamsList = {
  [AppRoutes.Home]: undefined;
  [AppRoutes.Details]: { id: string };
  [AppRoutes.Settings]: { section?: string };
};
```

### 3) Crear stacks por dominio

`src/navigation/stacks/RootStackNavigation.tsx`

```tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamsList } from '@navigation/config/routes';
import HomeView from '@modules/home/ui/views/HomeView';
import DetailsView from '@modules/home/ui/views/DetailsView';
import SettingsView from '@modules/settings/ui/views/SettingsView';

const RootStack = createNativeStackNavigator<RootStackParamsList>();

export default function RootStackNavigation() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name={AppRoutes.Home} component={HomeView} />
      <RootStack.Screen name={AppRoutes.Details} component={DetailsView} />
      <RootStack.Screen name={AppRoutes.Settings} component={SettingsView} />
    </RootStack.Navigator>
  );
}
```

### 4) Configurar tabs y drawer (opcional)

`src/navigation/tabs/MainTabsNavigation.tsx`

```tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppRoutes, RootStackParamsList } from '@navigation/config/routes';
import HomeView from '@modules/home/ui/views/HomeView';
import SettingsView from '@modules/settings/ui/views/SettingsView';

const Tabs = createBottomTabNavigator<RootStackParamsList>();

export default function MainTabsNavigation() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name={AppRoutes.Home} component={HomeView} />
      <Tabs.Screen name={AppRoutes.Settings} component={SettingsView} />
    </Tabs.Navigator>
  );
}
```

`src/navigation/drawers/MainDrawerNavigation.tsx`

```tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AppRoutes, RootStackParamsList } from '@navigation/config/routes';
import HomeView from '@modules/home/ui/views/HomeView';
import SettingsView from '@modules/settings/ui/views/SettingsView';

const Drawer = createDrawerNavigator<RootStackParamsList>();

export default function MainDrawerNavigation() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name={AppRoutes.Home} component={HomeView} />
      <Drawer.Screen name={AppRoutes.Settings} component={SettingsView} />
    </Drawer.Navigator>
  );
}
```

### 5) RootNavigation con contenedor y ref

`src/navigation/RootNavigation.tsx`

```tsx
import React from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import RootStackNavigation from '@navigation/stacks/RootStackNavigation';
import { linking } from '@navigation/config/linking';
import { onStateChange, initialState } from '@navigation/config/state';

export const navigationRef = createNavigationContainerRef();

export default function RootNavigation() {
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      initialState={initialState}
      onStateChange={onStateChange}
    >
      <RootStackNavigation />
    </NavigationContainer>
  );
}
```

### 6) Registrar navegación en el árbol de providers

`src/App.tsx`

```tsx
import AppProvider from '@providers/AppProvider';
import RootNavigation from '@navigation/RootNavigation';

export default function App() {
  return (
    <AppProvider>
      <RootNavigation />
    </AppProvider>
  );
}
```

### 7) Hooks tipados de navegación y params

`src/navigation/hooks/useNavigation.tsx`

```tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamsList } from '@navigation/config/routes';

export const useRootNavigation = () =>
  useNavigation<NativeStackNavigationProp<RootStackParamsList>>();
```

`src/navigation/hooks/useRouteParams.ts`

```ts
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamsList } from '@navigation/config/routes';

export function useRouteParams<T extends keyof RootStackParamsList>() {
  return useRoute<RouteProp<RootStackParamsList, T>>();
}
```

### 8) Tipado en pantallas

```tsx
import React from 'react';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamsList } from '@navigation/config/routes';

type DetailsViewProps = {
  route: RouteProp<RootStackParamsList, 'Details'>;
};

export default function DetailsView({ route }: DetailsViewProps) {
  const { id } = route.params;
  return null;
}
```

### 9) Guards y middleware de navegación

`src/navigation/config/guards.ts`

```ts
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamsList } from './routes';

export type NavigationGuardContext = {
  isAuthenticated: boolean;
  currentRouteName?: keyof RootStackParamsList;
};

export function canNavigateToSettings(ctx: NavigationGuardContext) {
  if (!ctx.isAuthenticated) return false;
  return true;
}
```

Uso en navegación (middleware ligero con `onStateChange`):

```ts
import { NavigationState } from '@react-navigation/native';
import { AppRoutes } from './routes';
import { canNavigateToSettings } from './guards';

export function shouldBlockRoute(
  state: NavigationState,
  isAuthenticated: boolean,
) {
  const current = state.routes[state.index]?.name as
    | keyof typeof AppRoutes
    | undefined;
  if (current === AppRoutes.Settings) {
    return !canNavigateToSettings({
      isAuthenticated,
      currentRouteName: current,
    });
  }
  return false;
}
```

Patrón recomendado:

- Evalúa `shouldBlockRoute` en `onStateChange`.
- Si bloquea, navega a una ruta segura con `navigationRef`.

### 10) Deep linking

`src/navigation/config/linking.ts`

```ts
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamsList, AppRoutes } from './routes';

export const linking: LinkingOptions<RootStackParamsList> = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      [AppRoutes.Home]: 'home',
      [AppRoutes.Details]: 'products/:id',
      [AppRoutes.Settings]: 'settings/:section?',
    },
  },
};
```

### 11) Manejo de estado de navegación

`src/navigation/config/state.ts`

```ts
import { NavigationState } from '@react-navigation/native';

let cachedState: NavigationState | undefined;

export const initialState = cachedState;

export function onStateChange(state?: NavigationState) {
  cachedState = state;
}
```

Para persistencia real, reemplaza `cachedState` por un storage real del proyecto.

### 12) Navegación condicional por autenticación

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import GuestRoutes from '@navigation/stacks/GuestStackNavigation';
import PrivateRoutes from '@navigation/stacks/PrivateStackNavigation';
import { useAuthState } from '@modules/auth/application/useAuthState';

export default function RootNavigation() {
  const isAuthenticated = useAuthState(state => state.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <PrivateRoutes /> : <GuestRoutes />}
    </NavigationContainer>
  );
}
```

### 13) Navegadores anidados

```tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeView from '@modules/home/ui/views/HomeView';
import SettingsView from '@modules/settings/ui/views/SettingsView';
import FeedView from '@modules/home/ui/views/FeedView';
import MessagesView from '@modules/home/ui/views/MessagesView';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Feed" component={FeedView} />
      <Tabs.Screen name="Messages" component={MessagesView} />
    </Tabs.Navigator>
  );
}

export default function RootStackNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeTabs} />
      <Stack.Screen name="Settings" component={SettingsView} />
    </Stack.Navigator>
  );
}
```

### 14) Acciones de navegación comunes

```tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamsList } from '@navigation/config/routes';

type Nav = NativeStackNavigationProp<RootStackParamsList>;

export function useNavActions() {
  const navigation = useNavigation<Nav>();
  return {
    goHome: () => navigation.navigate('Home'),
    openDetails: (id: string) => navigation.navigate('Details', { id }),
    replaceDetails: (id: string) => navigation.replace('Details', { id }),
    pushDetails: (id: string) => navigation.push('Details', { id }),
    back: () => navigation.goBack(),
    toTop: () => navigation.popToTop(),
  };
}
```

### 15) Opciones de pantalla y headers

```tsx
<Stack.Screen
  name="Details"
  component={DetailsView}
  options={{
    headerShown: true,
    title: 'Details',
  }}
/>

<Stack.Screen
  name="Details"
  component={DetailsView}
  options={({ route }) => ({
    title: route.params.id,
    headerShown: false,
  })}
/>

<Stack.Navigator
  screenOptions={{
    headerShown: false,
    animation: 'slide_from_right',
    gestureEnabled: true,
  }}
>
```

### 16) Estado de navegación con hooks

```tsx
import { useNavigationState } from '@react-navigation/native';

export function useCurrentRouteName() {
  return useNavigationState(state => state.routes[state.index].name);
}

export function useCanGoBack() {
  return useNavigationState(state => state.routes.length > 1);
}
```

### 17) Paso y lectura de parámetros

```tsx
navigation.navigate('Details', { id: '123' });

function DetailsView({
  route,
}: {
  route: RouteProp<RootStackParamsList, 'Details'>;
}) {
  const { id } = route.params;
  return null;
}

const { params } = useRoute<RouteProp<RootStackParamsList, 'Details'>>();
```

## Mejores prácticas

- Centraliza rutas y params en un único archivo con `as const`.
- Evita strings literales de rutas en vistas y componentes.
- Usa hooks tipados para navegación y params.
- Separa navegadores por módulo o feature para escalar.
- Usa `navigationRef` solo para acciones globales (logout, reset, deep links).
- Evita lógica de negocio en navegadores; delega a guards/middleware.
- Mantén params ligeros y pasa IDs en lugar de objetos grandes.
- Agrega pruebas con mocks de navegadores y hooks.
- Usa navegación condicional en el root para flujos auth/guest.

## Ejemplo de uso modular en componentes

```tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useRootNavigation } from '@navigation/hooks/useNavigation';
import { AppRoutes } from '@navigation/config/routes';

export default function ProductItem({ id }: { id: string }) {
  const navigation = useRootNavigation();
  return (
    <Pressable onPress={() => navigation.navigate(AppRoutes.Details, { id })}>
      <Text>Ver detalle</Text>
    </Pressable>
  );
}
```

## Pruebas recomendadas

- Mock de stacks para asegurar que el contenedor renderiza.
- Mock del hook de navegación para validar `navigate` y `goBack`.

Referencias: [RootNavigation.test.tsx](file:///Users/crisanger/Documents/PROJECTS/DEVSU/DevsuBank/__tests__/navigation/RootNavigation.test.tsx), [ProductsStackNavigation.test.tsx](file:///Users/crisanger/Documents/PROJECTS/DEVSU/DevsuBank/__tests__/navigation/stacks/ProductsStackNavigation.test.tsx)

## Checklist final

1. Crear estructura `src/navigation/`.
2. Definir rutas y params tipados.
3. Crear stacks/tabs/drawer necesarios.
4. Crear hooks tipados de navegación y params.
5. Configurar `RootNavigation` con contenedor y ref.
6. Registrar navegación en `App` o provider raíz.
7. Configurar deep linking si aplica.
8. Añadir pruebas básicas de navegación.
