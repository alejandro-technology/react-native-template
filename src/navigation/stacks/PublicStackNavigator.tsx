import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import ExamplesNavigator from './ExampleStackNavigator';
import AuthenticationNavigator from './AuthenticationStackNavigator';
// Routes
import {
  PublicRoutes,
  PublicStackParamList,
} from '@navigation/routes/public.routes';

const Stack = createNativeStackNavigator<PublicStackParamList>();

export default function PublicNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 2500,
      }}
    >
      <Stack.Screen
        name={PublicRoutes.Examples}
        component={ExamplesNavigator}
      />
      <Stack.Screen
        name={PublicRoutes.Authentication}
        component={AuthenticationNavigator}
      />
    </Stack.Navigator>
  );
}
