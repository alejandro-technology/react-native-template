import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
// Components
import { ProductItem } from './ProductItem';
// Hooks
import { useProducts } from '@modules/products/application/product.queries';
// Theme
import { spacing } from '@theme/index';
import { EmptyState, ErrorState, LoadingState } from '@components/layout';

interface ProductListProps {
  searchText: string;
}

export function ProductList({ searchText }: ProductListProps) {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useProducts({ searchText });
  if (isLoading) {
    return <LoadingState message="Cargando productos..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudo cargar el producto'}
      />
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="Producto no encontrado"
        message="El producto que buscas no existe o fue eliminado"
        icon="📦"
      />
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ProductItem product={item} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
});
