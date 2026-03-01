import React from 'react';
import { StyleSheet } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
// Components
import { UserItem } from './UserItem';
import {
  EmptyState,
  ErrorState,
  ItemSeparatorComponent,
  LoadingState,
} from '@components/layout';
// Hooks
import { useUsers } from '@modules/users/application/user.queries';
// Types
import type { UserEntity } from '../../domain/user.model';
// Theme
import { spacing } from '@theme/index';

const renderUserItem: ListRenderItem<UserEntity> = ({ item }) => (
  <UserItem user={item} />
);

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
    <FlashList
      data={users}
      keyExtractor={item => item.id}
      renderItem={renderUserItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
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
