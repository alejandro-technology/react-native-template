import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
// Componentes
import { Text } from '@components/core';
import { Button } from '@components/core';
import { TextInput } from '@components/core';
import { UserList } from './components/UserList';
// Hooks
import { useDebounce } from '../application/useDebounce';
// Routes
import { UsersRoutes } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';
// Theme
import { spacing } from '@theme/index';
import { RootLayout } from '@components/layout';

export function UsersListView() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);

  const { navigate } = useNavigationUsers();
  const onAddUser = () => navigate(UsersRoutes.UserForm);

  return (
    <RootLayout scroll={false}>
      <View style={styles.header}>
        <Text variant="h1">Usuarios</Text>
        <Button onPress={onAddUser}>Agregar</Button>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar usuarios..."
        />
      </View>

      <UserList searchText={debouncedSearch} />
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
});
