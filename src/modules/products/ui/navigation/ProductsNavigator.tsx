import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@theme/index';

import { ProductsListView } from '../ProductsListView';
import type { ProductEntity } from '../../domain/product.model';
import type { ProductsStackParamList } from './products.navigator.types';

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export default function ProductsNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductsListWrapper}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function ProductsListWrapper() {
  const handleProductPress = useCallback((product: ProductEntity) => {
    console.log('Product pressed:', product.id);
  }, []);

  const handleAddProduct = useCallback(() => {
    console.log('Add product pressed');
  }, []);

  return (
    <ProductsListView
      onProductPress={handleProductPress}
      onAddProduct={handleAddProduct}
    />
  );
}
