import React from 'react';
// Components
import { RootLayout } from '@components/layout';
// Navigation
import { UsersRoutes, UsersScreenProps } from '@navigation/routes';
// UI Components
import { UserDetail } from './components/UserDetail';

type ScreenProps = UsersScreenProps<UsersRoutes.UserDetail>;

export function UserDetailView({ route }: ScreenProps) {
  const { userId } = route.params;

  return (
    <RootLayout padding="md" title="Detalle de Usuario">
      <UserDetail userId={userId} />
    </RootLayout>
  );
}
