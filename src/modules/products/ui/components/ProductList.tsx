import React from 'react';
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
