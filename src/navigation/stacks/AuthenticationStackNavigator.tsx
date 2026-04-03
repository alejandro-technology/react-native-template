import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import SignInView from '@modules/authentication/ui/SignInView';
import SignUpView from '@modules/authentication/ui/SignUpView';
// Routes
import {
  AuthenticationRoutes,
  AuthenticationStackParamList,
} from '@navigation/routes/authentication.routes';

const Stack = createNativeStackNavigator<AuthenticationStackParamList>();

export default function AuthenticationNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={AuthenticationRoutes.SignIn} component={SignInView} />
      <Stack.Screen name={AuthenticationRoutes.SignUp} component={SignUpView} />
    </Stack.Navigator>
  );
}
