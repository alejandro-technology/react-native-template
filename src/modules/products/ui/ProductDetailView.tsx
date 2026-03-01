import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Card, Button } from '@components/core';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  RootLayout,
  DeleteConfirmationSheet,
} from '@components/layout';
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
  const { mutate: deleteProduct, isPending: isDeleting } = useProductDelete();
  const { visible, entityName, entityType, open, close } = useAppStorage(
    state => state.modal,
  );

  const handleDelete = () => {
    deleteProduct(productId, {
      onSuccess: () => {
        close();
        goBack();
      },
    });
  };

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
              entityId: productId,
              entityName: product.name,
              entityType: 'producto',
            })
          }
        >
          Eliminar Producto
        </Button>
      </View>

      <DeleteConfirmationSheet
        visible={visible}
        onClose={close}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        entityName={entityName}
        entityType={entityType}
      />
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
