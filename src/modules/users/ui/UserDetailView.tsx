import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
// Components
import { Text, Card, Button } from '@components/core';
import { DeleteConfirmationSheet } from './components/DeleteConfirmationSheet';
// Application
import { useUser } from '../application/user.queries';
import { useUserDelete } from '../application/user.mutations';
// Navigation
import { UsersRoutes, UsersScreenProps } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';
// Theme
import { spacing } from '@theme/index';

export function UserDetailView({
  route: {
    params: { userId },
  },
}: UsersScreenProps<UsersRoutes.UserDetail>) {
  const { goBack, navigate } = useNavigationUsers();
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const { data: user, isLoading, isError, error } = useUser(userId);
  const { mutate: deleteUser, isPending: isDeleting } = useUserDelete();

  const handleDelete = () => {
    deleteUser(userId, {
      onSuccess: () => {
        setShowDeleteSheet(false);
        goBack();
      },
    });
  };

  function handleEdit() {
    user && navigate(UsersRoutes.UserForm, { user });
  }

  if (isLoading) {
    return (
      <View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text variant="body" style={styles.loadingText}>
            Cargando...
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View>
        <View style={styles.centered}>
          <Text variant="h3" style={styles.errorTitle}>
            Error
          </Text>
          <Text variant="body">
            {error?.message || 'Usuario no encontrado'}
          </Text>
          <Button onPress={goBack} style={styles.button}>
            Volver
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <Button variant="ghost" onPress={goBack}>
          Volver
        </Button>
        <Button variant="outlined" onPress={handleEdit}>
          Editar
        </Button>
      </View>

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

        <Button
          variant="primary"
          onPress={() => setShowDeleteSheet(true)}
          style={styles.deleteButton}
        >
          Eliminar Usuario
        </Button>
      </View>

      <DeleteConfirmationSheet
        visible={showDeleteSheet}
        onClose={() => setShowDeleteSheet(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        userName={user.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorTitle: {
    color: 'red',
  },
  card: {
    gap: spacing.xs,
  },
  infoRow: {
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  deleteButton: {
    marginTop: 'auto',
  },
  button: {
    marginTop: spacing.md,
  },
});
