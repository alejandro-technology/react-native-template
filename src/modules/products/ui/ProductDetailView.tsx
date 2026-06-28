import React from 'react';
// Components
import { RootLayout } from '@components/layout';
// Navigation
import { ProductsRoutes, ProductsScreenProps } from '@navigation/routes';
// UI Components
import { ProductDetail } from './components/ProductDetail';

type ScreenProps = ProductsScreenProps<ProductsRoutes.ProductDetail>;

export function ProductDetailView({ route }: ScreenProps) {
  const { productId } = route.params;

  return (
    <RootLayout padding="md" title="Detalle de Producto">
      <ProductDetail productId={productId} />
    </RootLayout>
  );
}
