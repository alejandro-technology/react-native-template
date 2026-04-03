// Componentes
import { ProductList } from './components/ProductList';
import { Header, RootLayout } from '@components/layout';
// Navigation
import { ProductsRoutes } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';

export function ProductsListView() {
  const { navigate } = useNavigationProducts();
  const onAddProduct = () => navigate(ProductsRoutes.ProductForm);

  return (
    <RootLayout
      scroll={false}
      toolbar={false}
      fab={{ icon: 'plus', onPress: onAddProduct }}
    >
      <Header title="Productos" searchbar="products" />

      <ProductList />
    </RootLayout>
  );
}
