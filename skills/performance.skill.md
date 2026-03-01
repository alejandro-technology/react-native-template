# Skill: Optimización y Performance en React Native

## 1. Metadata

-   **Nombre**: `react-native-performance`
-   **Descripción**: Define reglas y buenas prácticas para asegurar una aplicación fluida (60 FPS) y eficiente.
-   **Propósito**: Evitar cuellos de botella en la UI, fugas de memoria y sobreconsumo de batería.
-   **Categoría**: Performance, Calidad, UX

## 2. Trigger

-   **Cuándo**: Al implementar listas, animaciones, usar imágenes, o manejar grandes volúmenes de datos.
-   **Contexto**: Componentes de lista (`FlatList`, `SectionList`), hooks (`useCallback`, `useMemo`), y carga de assets.
-   **Observa**: Renderizados innecesarios, key extractors, y optimización de imágenes.

## 3. Responsabilidades

-   **Valida**: El uso correcto de `FlashList` (recomendado) o `FlatList` optimizado.
-   **Recomienda**: Memoizar funciones pasadas como props (`useCallback`) y cálculos costosos (`useMemo`).
-   **Previene**: Funciones anónimas en render (`renderItem={() => ...}`), objetos inline en estilos, y renders bloqueantes.
-   **Optimiza**: La carga de imágenes (`Expo Image` / `FastImage`) y el layout inicial.

## 4. Reglas

### Listas Eficientes

1.  **FlashList > FlatList**:
    -   Preferir `@shopify/flash-list` para listas largas (> 20 items) o complejas.
    -   Configurar siempre `estimatedItemSize`.

2.  **Memoización de Items**:
    -   Componentes dentro de listas (`renderItem`) DEBEN estar envueltos en `React.memo`.
    -   `keyExtractor` debe ser único y estable (ID de base de datos, NO índice del array).

3.  **Funciones Estables**:
    -   Extraer funciones `renderItem` y `keyExtractor` fuera del componente o usar `useCallback`.
    -   NUNCA pasar funciones inline a componentes hijos puros (rompe `React.memo`).

### Imágenes y Assets

-   Usar formatos optimizados (WebP/PNG comprimido).
-   Dimensionar imágenes al tamaño de visualización (evitar bajar 4K para mostrar 50px).
-   Cachear imágenes remotas.

### Interacciones y Animaciones

-   Usar `react-native-reanimated` (hilo UI) en lugar de `Animated` (puente JS) para gestos complejos.
-   Evitar cálculos pesados en el hilo JS durante animaciones.
-   Usar `InteractionManager.runAfterInteractions` para tareas costosas post-navegación.

## 5. Output Esperado

-   **Feedback**: "Estás definiendo 'renderItem' como una función anónima dentro del JSX. Esto crea una nueva función en cada render y fuerza el re-renderizado de toda la lista."
-   **Severidad**: Media (Performance).
-   **Corrección**: Extraer la función y memoizarla.

## 6. Ejemplo Práctico

### Antes (Lento)

```tsx
const MyList = ({ data }) => (
  <FlatList
    data={data}
    renderItem={({ item }) => <Item title={item.title} onPress={() => console.log(item.id)} />} // ❌ Función anónima + objeto nuevo
    keyExtractor={(item, index) => index.toString()} // ❌ Índice como key (malo para reordenar)
  />
);
```

### Después (Rápido)

```tsx
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';

const MyList = ({ data }) => {
  const renderItem = useCallback(({ item }) => (
    <MemoizedItem title={item.title} id={item.id} />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={50} // ✅ Ayuda al layout
    />
  );
};

const MemoizedItem = React.memo(Item); // ✅ Previene re-renders innecesarios
```
