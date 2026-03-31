import React from 'react';
import { Animated } from 'react-native';
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
// Theme
import { useFocusSlideIn } from '@theme/hooks';
import { ANIMATION_DURATION } from '@theme/animations';

export function ProductFormView({
  route: { params },
  navigation: { goBack },
}: ProductsScreenProps<ProductsRoutes.ProductForm>) {
  const { mutateAsync: createProduct, isPending: isCreating } =
    useProductCreate();
  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useProductUpdate();

  const isLoading = isCreating || isUpdating;

  const product = params?.product;
  const isEditing = !!product;

  const { animatedStyle } = useFocusSlideIn({
    direction: 'right',
    duration: ANIMATION_DURATION.slow,
  });

  async function handleSubmit(form: ProductFormData) {
    try {
      if (isEditing) {
        await updateProduct({ id: product.id, form });
      } else {
        await createProduct(form);
      }
      goBack();
    } catch {
      // Error is handled by mutation's onError callback (shows toast)
    }
  }

  return (
    <RootLayout
      scroll
      padding="lg"
      title={isEditing ? 'Editar Producto' : 'Crear Producto'}
    >
      <Animated.View style={animatedStyle}>
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={product}
        />
      </Animated.View>
    </RootLayout>
  );
}
