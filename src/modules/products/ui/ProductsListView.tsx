import React, { useState } from 'react';
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
