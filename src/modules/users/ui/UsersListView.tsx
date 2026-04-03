// Componentes
import { UserList } from './components/UserList';
import { Header, RootLayout } from '@components/layout';
// Navigation
import { UsersRoutes } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';

export function UsersListView() {
  const { navigate } = useNavigationUsers();
  const onAddUser = () => navigate(UsersRoutes.UserForm);

  return (
    <RootLayout scroll={false} toolbar={false}>
      <Header
        title="Usuarios"
        onPress={onAddUser}
        pressIcon="plus"
        searchbar="users"
      />
      <UserList />
    </RootLayout>
  );
}
