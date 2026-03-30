import React from 'react';
import { StyleSheet } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Icon } from '@components/core';
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
import type { User } from '../../domain/user.model';
// Theme
import { spacing } from '@theme/index';

const renderUserItem: ListRenderItem<User> = ({ item, index }) => (
  <UserItem user={item} index={index} />
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
        message={error?.message || 'No se pudieron cargar los usuarios'}
      />
    );
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        title="Usuario no encontrado"
        message="El usuario que buscas no existe o fue eliminado"
        icon={<Icon name="user" size={42} />}
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
