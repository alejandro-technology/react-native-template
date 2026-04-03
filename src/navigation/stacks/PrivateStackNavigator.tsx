import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import UsersNavigator from './UsersStackNavigator';
import ProductsNavigator from './ProductsStackNavigator';
// Routes
import { PrivateRoutes, PrivateStackParamList } from '@navigation/routes';
import AuthExampleView from '@modules/examples/ui/AuthExampleView';

const Stack = createNativeStackNavigator<PrivateStackParamList>();

export default function PrivateNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={PrivateRoutes.Example} component={AuthExampleView} />
      <Stack.Screen
        name={PrivateRoutes.Products}
        component={ProductsNavigator}
      />
      <Stack.Screen name={PrivateRoutes.Users} component={UsersNavigator} />
    </Stack.Navigator>
  );
}
