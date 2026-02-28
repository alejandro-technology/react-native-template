import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Button } from '@components/core';
import { RootLayout } from '@components/layout';
import { UserForm } from './components/UserForm';
// Application
import { useUserCreate, useUserUpdate } from '../application/user.mutations';
// Domain
import type { UserFormData } from '../domain/user.scheme';
import { userFormToPayloadAdapter } from '../domain/user.adapter';
// Navigation
import { UsersRoutes, UsersScreenProps } from '@navigation/routes';
// Theme
import { spacing } from '@theme/index';

export function UserFormView({
  route: { params },
  navigation: { goBack },
}: UsersScreenProps<UsersRoutes.UserForm>) {
  const { mutate: createUser, isPending: isCreating } = useUserCreate();
  const { mutate: updateUser, isPending: isUpdating } = useUserUpdate();

  const isLoading = isCreating || isUpdating;

  const user = params?.user;
  const isEditing = !!user;

  const handleSubmit = (data: UserFormData) => {
    const payload = userFormToPayloadAdapter(data);

    if (isEditing) {
      updateUser({ id: user.id, data: payload }, {});
    } else {
      createUser(payload, {});
    }
    goBack();
  };

  return (
    <RootLayout>
      <View style={styles.header}>
        <Button variant="ghost" onPress={goBack}>
          Cancelar
        </Button>
      </View>

      <UserForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={user}
      />
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
});
