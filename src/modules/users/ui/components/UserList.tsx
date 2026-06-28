import React, { useCallback } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
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
import { useDebounce } from '@modules/core/application/core.hooks';
import { useAppStorage } from '@modules/core/application/app.storage';
// Types
import type { User } from '../../domain/user.model';
// Theme
import { spacing } from '@theme/index';

export function UserList() {
  const searchText = useAppStorage(state => state.searchbar.users.searchText);
  const debouncedSearch = useDebounce(searchText, 500);

  const {
    data: users,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useUsers({ searchText: debouncedSearch });

  const renderUserItem = useCallback<ListRenderItem<User>>(
    ({ item }) => <UserItem user={item} />,
    [],
  );

  if (isLoading) {
    return <LoadingState message="Cargando usuarios..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar los usuarios"
        message={error?.message || 'No se pudieron cargar los usuarios'}
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
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <EmptyState
          title="Usuario no encontrado"
          message="El usuario que buscas no existe o fue eliminado"
          icon={<Icon name="user" size={42} />}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
});
