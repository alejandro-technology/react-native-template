import React, { useCallback } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Icon } from '@components/core';
// Components
import { ProductItem } from './ProductItem';
import {
  EmptyState,
  ErrorState,
  ItemSeparatorComponent,
  LoadingState,
} from '@components/layout';
// Modules
import { useAppStorage } from '@modules/core';
import { useDebounce } from '@modules/core/application/core.hooks';
import { useProducts } from '@modules/products/application/product.queries';
// Types
import type { Product } from '../../domain/product.model';
// Theme
import { spacing } from '@theme/index';

export function ProductList() {
  const searchText = useAppStorage(
    state => state.searchbar.products.searchText,
  );
  const debouncedSearch = useDebounce(searchText, 500);

  const {
    data: products,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useProducts({ searchText: debouncedSearch });

  const renderProductItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => <ProductItem product={item} />,
    [],
  );

  if (isLoading) {
    return <LoadingState message="Cargando productos..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar los productos"
        message={error?.message || 'No se pudieron cargar los productos'}
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
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <EmptyState
          title="Producto no encontrado"
          message="El producto que buscas no existe o fue eliminado"
          icon={<Icon name="package" size={42} />}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
});
