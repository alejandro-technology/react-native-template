import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
// Componentes
import { Text } from '@components/core';
import { Button } from '@components/core';
import { TextInput } from '@components/core';
import { ProductList } from './components/ProductList';
// Hooks
import { useDebounce } from '../application/useDebounce';
// Routes
import { ProductsRoutes } from '@navigation/routes/products.routes';
import { useNavigationProducts } from '@navigation/hooks/useNavigation';
// Theme
import { spacing } from '@theme/index';
import { RootLayout } from '@components/layout';

export function ProductsListView() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);

  const { navigate } = useNavigationProducts();
  const onAddProduct = () => navigate(ProductsRoutes.ProductForm);

  return (
    <RootLayout>
      <View style={styles.header}>
        <Text variant="h1">Productos</Text>
        <Button onPress={onAddProduct}>Agregar</Button>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar productos..."
        />
      </View>

      <ProductList searchText={debouncedSearch} />
    </RootLayout>
  );
}

const styles = StyleSheet.create({
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
});
