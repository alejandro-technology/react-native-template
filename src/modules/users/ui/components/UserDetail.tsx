import React from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { Text, Card, Button, Icon, Avatar } from '@components/core';
import { EmptyState, LoadingState, ErrorState } from '@components/layout';
// Navigation
import { UsersRoutes } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';
// Modules
import { formatDate } from '@modules/core';
// Theme
import { spacing } from '@theme/index';
// Store
import { useAppStorage } from '@modules/core/application/app.storage';
// Application
import { useUser } from '../../application/user.queries';
import { useUserDelete } from '../../application/user.mutations';

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const { goBack, navigate } = useNavigationUsers();
  const { open, close } = useAppStorage(state => state.modal);
  const { mutateAsync: deleteUserAsync } = useUserDelete();
  const { data: user, isLoading, isError, error } = useUser(userId);

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
    return <UserDetailEmpty onBack={goBack} />;
  }

  // Events
  function handleEdit() {
    user && navigate(UsersRoutes.UserForm, { user });
  }

  function handleDelete() {
    if (user?.name) {
      open({
        type: 'delete',
        entityName: user.name,
        entityType: 'usuario',
        onConfirm: onDeleteConfirm,
      });
    }
  }

  async function onDeleteConfirm() {
    await deleteUserAsync(userId);
    close();
    goBack();
  }
  return (
    <View style={styles.content}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Avatar
            name={user.name}
            userId={user.id}
            size="xl"
            imageUrl={user.avatar}
          />
          <Text variant="h2">{user.name}</Text>
        </View>

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

        {user.birthDate && (
          <View style={styles.infoRow}>
            <Text variant="caption">Fecha de nacimiento:</Text>
            <Text variant="body">{formatDate(user.birthDate)}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text variant="caption">Fechas</Text>
        <Text variant="body">Creado: {formatDate(user.createdAt)}</Text>
        <Text variant="body">Actualizado: {formatDate(user.updatedAt)}</Text>
      </Card>

      <View>
        <Button variant="secondary" onPress={handleEdit} style={styles.button}>
          Editar Usuario
        </Button>
        <Button variant="primary" style={styles.button} onPress={handleDelete}>
          Eliminar Usuario
        </Button>
      </View>
    </View>
  );
}

export function UserDetailEmpty({ onBack }: { onBack: () => void }) {
  return (
    <EmptyState
      title="Usuario no encontrado"
      message="El usuario que buscas no existe o fue eliminado"
      icon={<Icon name="user" size={42} />}
      onAction={onBack}
      actionLabel="Volver"
    />
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
  header: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  button: {
    marginBottom: spacing.sm,
  },
});
