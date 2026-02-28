import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
// Components
import { UserItem } from './UserItem';
// Hooks
import { useUsers } from '@modules/users/application/user.queries';
// Theme
import { spacing } from '@theme/index';
import { EmptyState, ErrorState, LoadingState } from '@components/layout';

interface UserListProps {
  searchText: string;
}

export function UserList({ searchText }: UserListProps) {
  const { data: users, isLoading, isError, error } = useUsers({ searchText });

  if (isLoading) {
    return <LoadingState message="Cargando usuarios..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudo cargar el usuario'}
      />
    );
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        title="Usuario no encontrado"
        message="El usuario que buscas no existe o fue eliminado"
        icon="👤"
      />
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
});
