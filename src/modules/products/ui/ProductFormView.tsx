import React, { useMemo } from 'react';
// Components
import { RootLayout } from '@components/layout';
import { ProductForm } from './components/ProductForm';
// Application
import {
  useProductCreate,
  useProductUpdate,
} from '../application/product.mutations';
// Domain
import type { ProductFormData } from '../domain/product.scheme';
// Navigation
import { ProductsRoutes, ProductsScreenProps } from '@navigation/routes';

type ScreenProps = ProductsScreenProps<ProductsRoutes.ProductForm>;

export function ProductFormView({ navigation, route }: ScreenProps) {
  const goBack = navigation.goBack;
  const params = route.params;
  const product = params?.product;
  const isEditMode = !!product;

  // Mutations
  const { mutateAsync: createProduct, isPending: isCreating } =
    useProductCreate();
  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useProductUpdate();

  // Memoized values
  const isLoading = useMemo(
    () => isCreating || isUpdating,
    [isCreating, isUpdating],
  );

  // Events
  async function handleSubmit(form: ProductFormData) {
    if (isEditMode) {
      await updateProduct({ id: product.id, form });
    } else {
      await createProduct(form);
    }
    goBack();
  }

  return (
    <RootLayout
      scroll
      padding="lg"
      title={isEditMode ? 'Editar Producto' : 'Crear Producto'}
    >
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={product}
      />
    </RootLayout>
  );
}
