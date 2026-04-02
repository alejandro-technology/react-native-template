import React from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { Text, Card, Button, Icon } from '@components/core';
import { EmptyState, LoadingState, ErrorState } from '@components/layout';
// Navigation
import { ProductsRoutes } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';
// Theme
import { spacing } from '@theme/index';
// Store
import { useAppStorage } from '@modules/core/application/app.storage';
// Application
import { useProduct } from '../../application/product.queries';
import { useProductDelete } from '../../application/product.mutations';

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const { goBack, navigate } = useNavigationProducts();
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { mutateAsync: deleteProductAsync } = useProductDelete();
  const { open, close } = useAppStorage(state => state.modal);

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

  function handleEdit() {
    product && navigate(ProductsRoutes.ProductForm, { product });
  }

  if (!product) {
    return <ProductDetailEmpty onBack={goBack} />;
  }

  return (
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
          Creado: {product.createdAt.toLocaleDateString()}
        </Text>
        <Text variant="body">
          Actualizado: {product.updatedAt.toLocaleDateString()}
        </Text>
      </Card>

      <View>
        <Button variant="secondary" onPress={handleEdit} style={styles.button}>
          Editar Producto
        </Button>
        <Button
          variant="primary"
          style={styles.button}
          onPress={() =>
            open({
              type: 'delete',
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
    </View>
  );
}

export function ProductDetailEmpty({ onBack }: { onBack: () => void }) {
  return (
    <EmptyState
      title="Producto no encontrado"
      message="El producto que buscas no existe o fue eliminado"
      icon={<Icon name="package" size={42} />}
      onAction={onBack}
      actionLabel="Volver"
    />
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
  button: {
    marginBottom: spacing.sm,
  },
});
