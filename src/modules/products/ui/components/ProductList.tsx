import React, { useMemo } from 'react';
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
  OfflineBanner,
} from '@components/layout';
// Modules
import { useAppStorage } from '@modules/core';
import { useDebounce } from '@modules/core/application/core.hooks';
import { useProducts } from '@modules/products/application/product.queries';
import { useIsConnected } from '@modules/network/application/connectivity.storage';
// Types
import type { Product } from '../../domain/product.model';
// Theme
import { spacing } from '@theme/index';

const renderProductItem: ListRenderItem<Product> = ({ item, index }) => (
  <ProductItem product={item} index={index} />
);

export function ProductList() {
  const searchbar = useAppStorage(state => state.searchbar);
  const { searchText } = searchbar.products || {};
  const debouncedSearch = useDebounce(searchText, 500);

  const {
    data: products,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useProducts({ searchText: debouncedSearch });
  const isConnected = useIsConnected();

  const headerComponent = useMemo(
    () => (!isConnected ? <OfflineBanner /> : null),
    [isConnected],
  );

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
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListHeaderComponent={headerComponent}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
});
