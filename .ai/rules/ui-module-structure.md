---
category: ui-architecture
priority: high
tags: [module-ui, file-organization, screens, components]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Estructura UI por Módulo

Para mantener consistencia en módulos feature, la capa `ui/` debe separar claramente pantallas (`View`) de componentes reutilizables.

---

## Regla 1: Separar `View` (screen) de `components/`

**SIEMPRE**: los archivos `*View.tsx` viven en la raíz de `ui/`, y los componentes visuales van en `ui/components/`.

### Estructura esperada

```text
src/modules/{feature}/ui/
├── {Feature}ListView.tsx
├── {Feature}DetailView.tsx
├── {Feature}FormView.tsx
└── components/
    ├── {Feature}List.tsx
    ├── {Feature}Item.tsx
    └── {Feature}Form.tsx
```

### Responsabilidad por tipo de archivo

- `*View.tsx`: composición de layout, navegación, hooks de application y wiring de eventos.
- `components/*.tsx`: piezas visuales del módulo (listas, ítems, formularios, secciones UI).

### Límites de importación en UI

- UI puede importar desde `application` y `domain` (tipos).
- UI **NO** debe importar desde `infrastructure`.
- Los `FormView` reciben `FormData` y lo pasan a la mutation; la adaptación a payload ocurre en `application`.

### Principio de screen delgada

- `*View.tsx` debe orquestar la screen, no contener árboles visuales grandes.
- Si una lista, formulario o sección empieza a crecer, debe extraerse a `ui/components/`.

**Referencia**: `src/modules/products/ui/` (ejemplo base del template).

---

## Regla 2: Un componente por archivo (por defecto)

**SIEMPRE que sea posible**: un archivo `.tsx` debe exportar un único componente principal.

### Excepción permitida

Se permite un segundo componente en el mismo archivo **solo si**:

1. Es muy pequeño (auxiliar/presentacional).
2. Se usa únicamente dentro del componente principal del archivo.
3. No se reutiliza desde otros archivos.

Si el componente crece o empieza a reutilizarse, debe moverse a su propio archivo dentro de `ui/components/`.

---

## Relación con la skill `create-screen`

Esta regla define el contrato estructural de la capa `ui/`.

La skill `.ai/skills/generation/create-screen/SKILL.md` debe usar esta regla para:

- generar `*View.tsx` en la raíz de `ui/`
- generar listas/forms/items en `ui/components/`
- mantener screens delgadas
- evitar imports desde `infrastructure`
- delegar la adaptación de formularios a `application`

---

## Ejemplo correcto

```tsx
// src/modules/products/ui/ProductsListView.tsx
import { useState } from 'react';
// Componentes
import { ProductList } from './components/ProductList';
// Hooks
import { useDebounce } from '@modules/core/application/core.hooks';
// Routes
import { ProductsRoutes } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';
// Theme
import { Header, RootLayout } from '@components/layout';

export function ProductsListView() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);

  const { navigate } = useNavigationProducts();
  const onAddProduct = () => navigate(ProductsRoutes.ProductForm);

  return (
    <RootLayout scroll={false} toolbar={false}>
      <Header
        title="Productos"
        onPress={onAddProduct}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <ProductList searchText={debouncedSearch} />
    </RootLayout>
  );
}

```

```tsx
// src/modules/products/ui/components/ProductList.tsx
import React from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
// Components
import {
  EmptyState,
  ErrorState,
  ItemSeparatorComponent,
  LoadingState,
} from '@components/layout';
import { Icon } from '@components/core';
import { ProductItem } from './ProductItem';
// Hooks
import { useProducts } from '@modules/products/application/product.queries';
// Types
import type { Product } from '../../domain/product.model';
// Theme
import { spacing } from '@theme/index';

const renderProductItem: ListRenderItem<Product> = ({ item, index }) => (
  <ProductItem product={item} index={index} />
);

interface ProductListProps {
  searchText: string;
}

export function ProductList({ searchText }: ProductListProps) {
  const {
    data: products,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useProducts({ searchText });
  if (isLoading) {
    return <LoadingState message="Cargando productos..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudieron cargar los productos'}
      />
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="Producto no encontrado"
        message="El producto que buscas no existe o fue eliminado"
        icon={<Icon name="package" size={42} />}
      />
    );
  }

  return (
    <FlashList
      data={products}
      keyExtractor={item => item.id}
      renderItem={renderProductItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshing={isRefetching}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
});
```

```tsx
// src/modules/products/ui/components/ProductItem.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Card } from '@components/core';
// Types
import type { Product } from '../../domain/product.model';
// Theme
import { spacing } from '@theme/index';
// Navigation
import { ProductsRoutes } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';

interface ProductItemProps {
  product: Product;
  index: number;
}

export const ProductItem = React.memo(function ProductItem({
  product,
}: ProductItemProps) {
  const { navigate } = useNavigationProducts();

  const handleCardPress = () => {
    navigate(ProductsRoutes.ProductDetail, { productId: product.id });
  };

  return (
    <Card onPress={handleCardPress}>
      <View style={styles.info}>
        <Text variant="h3">{product.name}</Text>
        {product.description ? (
          <Text variant="body">{product.description}</Text>
        ) : null}
        <Text variant="caption" color="primary">
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  info: {
    flex: 1,
    gap: spacing.xs,
  },
});
```