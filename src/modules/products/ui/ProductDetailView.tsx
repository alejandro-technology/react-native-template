import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Card, Button } from '@components/core';
import { LoadingState, ErrorState, EmptyState, RootLayout } from '@components/layout';
// Application
import { useProduct } from '../application/product.queries';
import { useProductDelete } from '../application/product.mutations';
// Navigation
import { ProductsRoutes, ProductsScreenProps } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';
// Theme
import { spacing } from '@theme/index';
// Store
import { useAppStorage } from '@modules/core/infrastructure/app.storage';

export function ProductDetailView({
  route: {
    params: { productId },
  },
}: ProductsScreenProps<ProductsRoutes.ProductDetail>) {
  const { goBack, navigate } = useNavigationProducts();

  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { mutateAsync: deleteProductAsync } = useProductDelete();
  const { open, close } = useAppStorage(state => state.modal);

  function handleEdit() {
    product && navigate(ProductsRoutes.ProductForm, { product });
  }

  if (isLoading) {
    return <LoadingState message="Cargando producto..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudo cargar el producto'}
        onRetry={goBack}
        retryLabel="Volver"
      />
    );
  }

  if (!product) {
    return (
      <EmptyState
        title="Producto no encontrado"
        message="El producto que buscas no existe o fue eliminado"
        icon="📦"
        onAction={goBack}
        actionLabel="Volver"
      />
    );
  }
  return (
    <RootLayout padding="md" onPress={goBack} title="Product Detail">
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text variant="h2">{product.name}</Text>

          {product.description && (
            <Text variant="body">{product.description}</Text>
          )}

          <Text variant="h3">${product.price.toFixed(2)}</Text>
        </Card>

        <Card style={styles.card}>
          <Text variant="caption">Fechas</Text>
          <Text variant="body">
            Creado: {new Date(product.createdAt).toLocaleDateString()}
          </Text>
          <Text variant="body">
            Actualizado: {new Date(product.updatedAt).toLocaleDateString()}
          </Text>
        </Card>

        <Button variant="secondary" onPress={handleEdit}>
          Editar Producto
        </Button>
        <Button
          variant="primary"
          onPress={() =>
            open({
              entityName: product.name,
              entityType: 'producto',
              onConfirm: async () => {
                await deleteProductAsync(productId);
                close();
                goBack();
              },
            })
          }
        >
          Eliminar Producto
        </Button>
      </View>
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    gap: spacing.xs,
  },
});
