import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
// Components
import { Text, Card, Button } from '@components/core';
import { DeleteConfirmationSheet } from './components/DeleteConfirmationSheet';
// Application
import { useProduct } from '../application/product.queries';
import { useProductDelete } from '../application/product.mutations';
// Navigation
import { ProductsRoutes, ProductsScreenProps } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';
// Theme
import { spacing } from '@theme/index';

export function ProductDetailView({
  route: {
    params: { productId },
  },
}: ProductsScreenProps<ProductsRoutes.ProductDetail>) {
  const { goBack, navigate } = useNavigationProducts();
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { mutate: deleteProduct, isPending: isDeleting } = useProductDelete();

  const handleDelete = () => {
    deleteProduct(productId, {
      onSuccess: () => {
        setShowDeleteSheet(false);
        goBack();
      },
    });
  };

  function handleEdit() {
    product && navigate(ProductsRoutes.ProductForm, { product });
  }

  if (isLoading) {
    return (
      <View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text variant="body" style={styles.loadingText}>
            Cargando...
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View>
        <View style={styles.centered}>
          <Text variant="h3" style={styles.errorTitle}>
            Error
          </Text>
          <Text variant="body">
            {error?.message || 'Producto no encontrado'}
          </Text>
          <Button onPress={goBack} style={styles.button}>
            Volver
          </Button>
        </View>
      </View>
    );
  }
  console.log('product', product, product.name, product.description);
  return (
    <View>
      <View style={styles.header}>
        <Button variant="ghost" onPress={goBack}>
          Volver
        </Button>
        <Button variant="outlined" onPress={handleEdit}>
          Editar
        </Button>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text variant="h2">{product.name}</Text>

          {product.description ? (
            <Text variant="body" style={styles.description}>
              {product.description}
            </Text>
          ) : null}

          <Text variant="h3" style={styles.price}>
            ${product.price.toFixed(2)}
          </Text>
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

        <Button
          variant="primary"
          onPress={() => setShowDeleteSheet(true)}
          style={styles.deleteButton}
        >
          Eliminar Producto
        </Button>
      </View>

      <DeleteConfirmationSheet
        visible={showDeleteSheet}
        onClose={() => setShowDeleteSheet(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        productName={product.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorTitle: {
    color: 'red',
  },
  card: {
    gap: spacing.xs,
  },
  description: {
    opacity: 0.7,
    marginVertical: spacing.sm,
  },
  price: {
    color: 'primary',
    marginTop: spacing.sm,
  },
  deleteButton: {
    marginTop: 'auto',
  },
  button: {
    marginTop: spacing.md,
  },
});
