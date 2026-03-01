import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Card, Button } from '@components/core';
import { LoadingState, ErrorState, EmptyState, RootLayout } from '@components/layout';
// Application
import { useUser } from '../application/user.queries';
import { useUserDelete } from '../application/user.mutations';
// Navigation
import { UsersRoutes, UsersScreenProps } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';
// Theme
import { spacing } from '@theme/index';
// Store
import { useAppStorage } from '@modules/core/infrastructure/app.storage';

export function UserDetailView({
  route: {
    params: { userId },
  },
}: UsersScreenProps<UsersRoutes.UserDetail>) {
  const { goBack, navigate } = useNavigationUsers();

  const { data: user, isLoading, isError, error } = useUser(userId);
  const { mutateAsync: deleteUserAsync } = useUserDelete();
  const { open, close } = useAppStorage(state => state.modal);

  function handleEdit() {
    user && navigate(UsersRoutes.UserForm, { user });
  }

  if (isLoading) {
    return <LoadingState message="Cargando usuario..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudo cargar el usuario'}
        onRetry={goBack}
        retryLabel="Volver"
      />
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Usuario no encontrado"
        message="El usuario que buscas no existe o fue eliminado"
        icon="👤"
        onAction={goBack}
        actionLabel="Volver"
      />
    );
  }

  return (
    <RootLayout padding="md" onPress={goBack} title="User Details">
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text variant="h2">{user.name}</Text>

          <View style={styles.infoRow}>
            <Text variant="caption">Email:</Text>
            <Text variant="body">{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="caption">Teléfono:</Text>
            <Text variant="body">{user.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="caption">Rol:</Text>
            <Text variant="body">{user.role}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="caption">Fechas</Text>
          <Text variant="body">
            Creado: {new Date(user.createdAt).toLocaleDateString()}
          </Text>
          <Text variant="body">
            Actualizado: {new Date(user.updatedAt).toLocaleDateString()}
          </Text>
        </Card>

        <Button variant="secondary" onPress={handleEdit}>
          Editar Usuario
        </Button>
        <Button
          variant="primary"
          onPress={() =>
            open({
              entityName: user.name,
              entityType: 'usuario',
              onConfirm: async () => {
                await deleteUserAsync(userId);
                close();
                goBack();
              },
            })
          }
        >
          Eliminar Usuario
        </Button>
      </View>
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    gap: spacing.xs,
  },
  infoRow: {
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
});
