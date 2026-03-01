# Skill: Navegación y Tipado de Rutas

## 1. Metadata

-   **Nombre**: `react-navigation-types`
-   **Descripción**: Define cómo configurar, estructurar y usar React Navigation con TypeScript estricto.
-   **Propósito**: Garantizar la seguridad de tipos en la navegación y evitar errores de rutas inexistentes o parámetros incorrectos.
-   **Categoría**: Arquitectura, Calidad, DX

## 2. Trigger

-   **Cuándo**: Al añadir una nueva pantalla, crear un Stack Navigator, o usar `useNavigation`.
-   **Contexto**: `src/navigation/*`.
-   **Observa**: Definiciones de rutas, tipos de parámetros, y configuración de navegadores.

## 3. Responsabilidades

-   **Valida**: Que todas las rutas estén definidas en un Enum o Constante. Que los parámetros estén tipados en `ParamListBase`.
-   **Recomienda**: Usar un hook wrapper `useAppNavigation` en lugar de `useNavigation` genérico.
-   **Previene**: Strings mágicos en `navigation.navigate('ScreenName')`.
-   **Optimiza**: La carga diferida de pantallas (si aplica) y la gestión de memoria en Stacks profundos.

## 4. Reglas

### Estructura de Navegación

1.  **Rutas Centralizadas**:
    -   Definir nombres de rutas en `src/navigation/routes/*.routes.ts` como Enums o Objetos constantes.
    -   Ejemplo: `export enum UserRoutes { LIST = 'UserList', DETAIL = 'UserDetail' }`.

2.  **Tipado de Parámetros**:
    -   Crear `type UserStackParamList = { [UserRoutes.LIST]: undefined; [UserRoutes.DETAIL]: { id: string }; }`.
    -   Extender `RootStackParamList` globalmente si es necesario para deep linking.

3.  **Hooks Tipados**:
    -   Usar `NativeStackScreenProps` para los props de las pantallas.
    -   Usar `useNavigation<NativeStackNavigationProp<UserStackParamList>>()` en componentes anidados.

### Anti-patrones Prohibidos

-   ❌ `navigation.navigate('Home')` sin tipado (usar constantes).
-   ❌ Pasar objetos complejos (funciones, instancias de clases) como parámetros de navegación. (Solo IDs o datos serializables).
-   ❌ Anidar navegadores innecesariamente (performance).
-   ❌ Definir componentes de pantalla inline en `Stack.Screen`.

## 5. Output Esperado

-   **Feedback**: "La ruta 'ProfileSettings' se está usando como string literal. Define una constante en `routes/profile.routes.ts` y agrégala al ParamList."
-   **Severidad**: Media (Mantenibilidad/Tipado).
-   **Corrección**: Crear la constante y el tipo correspondiente.

## 6. Ejemplo Práctico

### Antes (Incorrecto)

```tsx
// src/screens/HomeScreen.tsx
const HomeScreen = ({ navigation }) => {
  return (
    <Button 
      title="Go to Details" 
      onPress={() => navigation.navigate('Details', { user: { name: 'John', date: new Date() } })} // ❌ String mágico y objeto complejo
    />
  );
};
```

### Después (Correcto)

```tsx
// 1. Routes Definition: src/navigation/routes/home.routes.ts
export enum HomeRoutes {
  HOME = 'Home',
  DETAILS = 'Details',
}

// 2. Param List: src/navigation/stacks/HomeStack.tsx
export type HomeStackParamList = {
  [HomeRoutes.HOME]: undefined;
  [HomeRoutes.DETAILS]: { userId: string }; // ✅ Solo ID
};

// 3. Screen Component
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<HomeStackParamList, HomeRoutes.HOME>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <Button 
      title="Go to Details" 
      onPress={() => navigation.navigate(HomeRoutes.DETAILS, { userId: '123' })} 
    />
  );
};
```
