import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Card } from '@components/core';
// Types
import type { ProductEntity } from '../../domain/product.model';
// Theme
import { useTheme, spacing } from '@theme/index';
// Navigation
import { ProductsRoutes } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';

interface ProductItemProps {
  product: ProductEntity;
}

export function ProductItem({ product }: ProductItemProps) {
  const theme = useTheme();
  const { navigate } = useNavigationProducts();
  const onPress = () =>
    navigate(ProductsRoutes.ProductDetail, { productId: product.id });

  return (
    <Card onPress={onPress}>
      <View style={styles.info}>
        <Text variant="h3">{product.name}</Text>
        {product.description ? (
          <Text variant="body">{product.description}</Text>
        ) : null}
        <Text variant="caption" style={{ color: theme.colors.primary }}>
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  info: {
    flex: 1,
    gap: spacing.xs,
  },
});
