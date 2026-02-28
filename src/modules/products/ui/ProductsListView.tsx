import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@components/core';
import { TextInput } from '@components/core';
import { Button } from '@components/core';
import { ProductList } from './components/ProductList';
import { spacing } from '@theme/index';
import { useProducts } from '../application/product.queries';
import { useDebounce } from '../application/useDebounce';
import type { ProductEntity } from '../domain/product.model';

interface ProductsListViewProps {
  onProductPress: (product: ProductEntity) => void;
  onAddProduct: () => void;
}

export function ProductsListView({
  onProductPress,
  onAddProduct,
}: ProductsListViewProps) {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);

  const filter = useMemo(
    () => (debouncedSearch ? { searchText: debouncedSearch } : undefined),
    [debouncedSearch],
  );

  const { data: products, isLoading, isError, error } = useProducts(filter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">Productos</Text>
        <Button onPress={onAddProduct}>Agregar</Button>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar productos..."
          containerStyle={styles.searchInput}
        />
      </View>

      <ProductList
        products={products || []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onProductPress={onProductPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
});
