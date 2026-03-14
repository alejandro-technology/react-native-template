/**
 * Ejemplo experto: Testear componentes con React Query
 * Demuestra:
 * - Testing de queries y mutations
 * - Manejo de estados de carga
 * - Manejo de errores
 * - Testing de refetch y actualización de datos
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@utils/test-utils';
import { QueryClient } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View, Text as RNText, FlatList } from 'react-native';
import { Button } from '../Button';
import { createTestQueryClient } from '@utils/test-utils';

// Mock API
const mockUsers = [
  { id: 1, name: 'Juan Pérez', email: 'juan@ejemplo.com' },
  { id: 2, name: 'María García', email: 'maria@ejemplo.com' },
  { id: 3, name: 'Carlos López', email: 'carlos@ejemplo.com' },
];

const fetchUsers = jest.fn();
const deleteUser = jest.fn();

// Componente de ejemplo que usa React Query
interface User {
  id: number;
  name: string;
  email: string;
}

function UserListComponent() {
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (isLoading) {
    return (
      <View testID="loading-state">
        <RNText>Cargando usuarios...</RNText>
      </View>
    );
  }

  if (isError) {
    return (
      <View testID="error-state">
        <RNText>Error: {(error as Error).message}</RNText>
        <Button onPress={() => refetch()} testID="retry-button">
          Reintentar
        </Button>
      </View>
    );
  }

  if (!users || users.length === 0) {
    return (
      <View testID="empty-state">
        <RNText>No hay usuarios</RNText>
      </View>
    );
  }

  return (
    <View testID="users-list">
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View testID={`user-item-${item.id}`}>
            <RNText>{item.name}</RNText>
            <RNText>{item.email}</RNText>
            <Button
              onPress={() => deleteMutation.mutate(item.id)}
              loading={deleteMutation.isPending}
              testID={`delete-button-${item.id}`}
            >
              Eliminar
            </Button>
          </View>
        )}
      />
    </View>
  );
}

describe('UserListComponent - Testing con React Query', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    fetchUsers.mockClear();
    deleteUser.mockClear();
  });

  afterEach(() => {
    // Limpiar el cache del queryClient
    queryClient.clear();
  });

  it('debe mostrar estado de carga inicialmente', () => {
    fetchUsers.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockUsers), 100))
    );

    const { getByTestId } = render(<UserListComponent />, { queryClient });

    expect(getByTestId('loading-state')).toBeTruthy();
  });

  it('debe mostrar la lista de usuarios después de cargar', async () => {
    fetchUsers.mockResolvedValue(mockUsers);

    const { getByTestId, getByText } = render(<UserListComponent />, {
      queryClient,
    });

    // Esperar a que los datos se carguen
    await waitFor(() => {
      expect(getByTestId('users-list')).toBeTruthy();
    });

    // Verificar que todos los usuarios se renderizan
    expect(getByText('Juan Pérez')).toBeTruthy();
    expect(getByText('María García')).toBeTruthy();
    expect(getByText('Carlos López')).toBeTruthy();
  });

  it('debe mostrar estado de error cuando falla la carga', async () => {
    const errorMessage = 'Error al cargar usuarios';
    fetchUsers.mockRejectedValue(new Error(errorMessage));

    const { findByTestId, getByText } = render(<UserListComponent />, {
      queryClient,
    });

    // Esperar a que aparezca el estado de error
    const errorState = await findByTestId('error-state');
    expect(errorState).toBeTruthy();
    expect(getByText(`Error: ${errorMessage}`)).toBeTruthy();
  });

  it('debe permitir reintentar cuando hay error', async () => {
    // Primera llamada falla
    fetchUsers.mockRejectedValueOnce(new Error('Error de red'));
    // Segunda llamada tiene éxito
    fetchUsers.mockResolvedValueOnce(mockUsers);

    const { findByTestId, getByTestId, findByText } = render(
      <UserListComponent />,
      { queryClient }
    );

    // Esperar al error
    await findByTestId('error-state');

    // Presionar reintentar
    const retryButton = getByTestId('retry-button');
    fireEvent.press(retryButton);

    // Verificar que se carguen los datos
    await waitFor(() => {
      expect(findByText('Juan Pérez')).toBeTruthy();
    });

    expect(fetchUsers).toHaveBeenCalledTimes(2);
  });

  it('debe mostrar estado vacío cuando no hay usuarios', async () => {
    fetchUsers.mockResolvedValue([]);

    const { findByTestId, getByText } = render(<UserListComponent />, {
      queryClient,
    });

    const emptyState = await findByTestId('empty-state');
    expect(emptyState).toBeTruthy();
    expect(getByText('No hay usuarios')).toBeTruthy();
  });

  it('debe eliminar un usuario y actualizar la lista', async () => {
    // Setup inicial
    fetchUsers.mockResolvedValue(mockUsers);
    deleteUser.mockResolvedValue({ success: true });

    const { findByTestId, getByTestId } = render(<UserListComponent />, {
      queryClient,
    });

    // Esperar a que cargue la lista
    await findByTestId('users-list');

    // Mockear la segunda llamada con datos actualizados (sin el usuario 1)
    const updatedUsers = mockUsers.filter((u) => u.id !== 1);
    fetchUsers.mockResolvedValue(updatedUsers);

    // Eliminar el primer usuario
    const deleteButton = getByTestId('delete-button-1');
    fireEvent.press(deleteButton);

    // Esperar a que se complete la mutación
    await waitFor(
      () => {
        expect(deleteUser).toHaveBeenCalled();
        // Verificar que se llamó con el ID correcto (primer argumento)
        expect(deleteUser.mock.calls[0][0]).toBe(1);
      },
      { timeout: 3000 }
    );

    // Esperar a que se actualice la lista (el componente hace refetch)
    await waitFor(
      () => {
        expect(fetchUsers).toHaveBeenCalledTimes(2);
      },
      { timeout: 3000 }
    );
  });

  it('debe llamar a deleteUser cuando se presiona el botón eliminar', async () => {
    fetchUsers.mockResolvedValue(mockUsers);
    deleteUser.mockResolvedValue({ success: true });

    const { findByTestId, getByTestId } = render(<UserListComponent />, {
      queryClient,
    });

    await findByTestId('users-list');

    const deleteButton = getByTestId('delete-button-1');
    fireEvent.press(deleteButton);

    // Verificar que se llamó a la función de eliminar
    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalled();
    });
  });
});
