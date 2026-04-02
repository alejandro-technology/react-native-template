import React from 'react';
// Components
import { RootLayout } from '@components/layout';
// Navigation
import { UsersRoutes, UsersScreenProps } from '@navigation/routes';
// UI Components
import { UserDetail } from './components/UserDetail';

export function UserDetailView({
  route: {
    params: { userId },
  },
}: UsersScreenProps<UsersRoutes.UserDetail>) {
  return (
    <RootLayout padding="md" title="Detalle de Usuario">
      <UserDetail userId={userId} />
    </RootLayout>
  );
}
