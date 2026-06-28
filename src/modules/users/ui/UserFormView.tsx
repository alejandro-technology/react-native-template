import React, { useMemo } from 'react';
// Components
import { RootLayout } from '@components/layout';
import { UserForm } from './components/UserForm';
// Application
import { useUserCreate, useUserUpdate } from '../application/user.mutations';
// Domain
import type { UserFormData } from '../domain/user.scheme';
// Navigation
import { UsersRoutes, UsersScreenProps } from '@navigation/routes';

type ScreenProps = UsersScreenProps<UsersRoutes.UserForm>;

export function UserFormView({ navigation, route }: ScreenProps) {
  const goBack = navigation.goBack;
  const params = route.params;
  const user = params?.user;
  const isEditMode = !!user;

  // Mutations
  const { mutateAsync: createUser, isPending: isCreating } = useUserCreate();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUserUpdate();

  // Memoized values
  const isLoading = useMemo(
    () => isCreating || isUpdating,
    [isCreating, isUpdating],
  );

  // Events
  async function handleSubmit(form: UserFormData) {
    if (isEditMode) {
      await updateUser({ id: user.id, form });
    } else {
      await createUser(form);
    }
    goBack();
  }

  return (
    <RootLayout
      scroll
      padding="lg"
      title={isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
    >
      <UserForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={user}
      />
    </RootLayout>
  );
}
