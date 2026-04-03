import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import { UserFormView } from '@modules/users/ui/UserFormView';
import { UsersListView } from '@modules/users/ui/UsersListView';
import { UserDetailView } from '@modules/users/ui/UserDetailView';
// Routes
import {
  UsersRoutes,
  UsersStackParamList,
} from '@navigation/routes/users.routes';

const Stack = createNativeStackNavigator<UsersStackParamList>();

export default function UsersNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={UsersRoutes.UserList} component={UsersListView} />
      <Stack.Screen name={UsersRoutes.UserDetail} component={UserDetailView} />
      <Stack.Screen name={UsersRoutes.UserForm} component={UserFormView} />
    </Stack.Navigator>
  );
}
