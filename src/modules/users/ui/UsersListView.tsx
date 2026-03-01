import { useState } from 'react';
// Componentes
import { UserList } from './components/UserList';
import DeleteConfirmationSheetUser from './components/DeleteConfirmationSheet';
// Hooks
import { useDebounce } from '@modules/core/application/core.hooks';
// Routes
import { UsersRoutes } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';
// Theme
import { Header, RootLayout } from '@components/layout';

export function UsersListView() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);

  const { navigate } = useNavigationUsers();
  const onAddUser = () => navigate(UsersRoutes.UserForm);

  return (
    <RootLayout scroll={false} toolbar={false}>
      <Header
        title="Usuarios"
        onPress={onAddUser}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <UserList searchText={debouncedSearch} />

      <DeleteConfirmationSheetUser />
    </RootLayout>
  );
}
