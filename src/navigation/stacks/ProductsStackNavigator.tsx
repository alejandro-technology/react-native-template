import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import { ProductFormView } from '@modules/products/ui/ProductFormView';
import { ProductsListView } from '@modules/products/ui/ProductsListView';
import { ProductDetailView } from '@modules/products/ui/ProductDetailView';
// Routes
import {
  ProductsRoutes,
  ProductsStackParamList,
} from '@navigation/routes/products.routes';

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export default function ProductsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={ProductsRoutes.ProductList}
        component={ProductsListView}
      />
      <Stack.Screen
        name={ProductsRoutes.ProductDetail}
        component={ProductDetailView}
      />
      <Stack.Screen
        name={ProductsRoutes.ProductForm}
        component={ProductFormView}
      />
    </Stack.Navigator>
  );
}
