import React from 'react';
// Components
import { RootLayout } from '@components/layout';
// Navigation
import { ProductsRoutes, ProductsScreenProps } from '@navigation/routes';
// UI Components
import { ProductDetail } from './components/ProductDetail';

export function ProductDetailView({
  route: {
    params: { productId },
  },
}: ProductsScreenProps<ProductsRoutes.ProductDetail>) {
  return (
    <RootLayout padding="md" title="Detalle de Producto">
      <ProductDetail productId={productId} />
    </RootLayout>
  );
}
