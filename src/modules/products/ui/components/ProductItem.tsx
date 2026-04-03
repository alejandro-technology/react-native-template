import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Card } from '@components/core';
// Types
import type { Product } from '../../domain/product.model';
// Theme
import { spacing } from '@theme/index';
// Navigation
import { ProductsRoutes } from '@navigation/routes';
import { useNavigationProducts } from '@navigation/hooks';

interface ProductItemProps {
  product: Product;
  index: number;
}

export const ProductItem = React.memo(function ProductItem({
  product,
}: ProductItemProps) {
  const { navigate } = useNavigationProducts();

  const handleCardPress = () => {
    navigate(ProductsRoutes.ProductDetail, { productId: product.id });
  };

  return (
    <Card onPress={handleCardPress}>
      <View style={styles.info}>
        <Text variant="h3">{product.name}</Text>
        {product.description ? (
          <Text variant="body">{product.description}</Text>
        ) : null}
        <Text variant="caption" color="primary">
          ${product.price.toFixed(2)}
        </Text>
        <Text variant="caption" color="textSecondary">
          {product.type}
        </Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  info: {
    flex: 1,
    gap: spacing.xs,
  },
});
