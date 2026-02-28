import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Button } from '@components/core';
import { RootLayout } from '@components/layout';
import { ProductForm } from './components/ProductForm';
// Application
import {
  useProductCreate,
  useProductUpdate,
} from '../application/product.mutations';
// Domain
import type { ProductFormData } from '../domain/product.scheme';
import { productFormToPayloadAdapter } from '../domain/product.adapter';
// Navigation
import { ProductsRoutes, ProductsScreenProps } from '@navigation/routes';
// Theme
import { spacing } from '@theme/index';

export function ProductFormView({
  route: { params },
  navigation: { goBack },
}: ProductsScreenProps<ProductsRoutes.ProductForm>) {
  const { mutate: createProduct, isPending: isCreating } = useProductCreate();
  const { mutate: updateProduct, isPending: isUpdating } = useProductUpdate();

  const isLoading = isCreating || isUpdating;

  const product = params?.product;
  const isEditing = !!product;

  const handleSubmit = (data: ProductFormData) => {
    const payload = productFormToPayloadAdapter(data);

    if (isEditing) {
      updateProduct({ id: product.id, data: payload }, {});
    } else {
      createProduct(payload, {});
    }
    goBack();
  };

  return (
    <RootLayout>
      <View style={styles.header}>
        <Button variant="ghost" onPress={goBack}>
          Cancelar
        </Button>
      </View>

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={product}
      />
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
});
