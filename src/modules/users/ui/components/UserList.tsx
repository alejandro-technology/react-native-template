import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
// Components
import { Text } from '@components/core';
import { UserItem } from './UserItem';
// Hooks
import { useUsers } from '@modules/users/application/user.queries';
// Theme
import { spacing } from '@theme/index';

interface UserListProps {
  searchText: string;
}

export function UserList({ searchText }: UserListProps) {
  const { data: users, isLoading, isError, error } = useUsers({ searchText });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text variant="body" style={styles.loadingText}>
          Cargando usuarios...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text variant="h3" style={styles.errorTitle}>
          Error
        </Text>
        <Text variant="body" style={styles.errorText}>
          {error?.message || 'Error al cargar los usuarios'}
        </Text>
      </View>
    );
  }

  if (!users || users.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="h3" style={styles.emptyTitle}>
          Sin usuarios
        </Text>
        <Text variant="body" style={styles.emptyText}>
          No hay usuarios disponibles
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <UserItem user={item} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorTitle: {
    color: 'red',
    marginBottom: spacing.sm,
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
