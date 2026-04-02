import { useMutation, useQueryClient } from '@tanstack/react-query';
// Domain
import {
  userFormToPayloadAdapter,
  userFormToUpdatePayloadAdapter,
} from '../domain/user.adapter';
import { UserFormData } from '../domain/user.scheme';
// Module
import { useUsersStorage } from './users.storage';
import userService from '../infrastructure/user.service';
// Core
import { useAppStorage } from '@modules/core/application/app.storage';
import { getIsConnected } from '@modules/network/application/connectivity.storage';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function useUserCreate() {
  const queryClient = useQueryClient();
  // Storage (read state directly to avoid calling hooks outside React)
  const addUser = useUsersStorage.getState().addUser;
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (form: UserFormData) => {
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('No internet connection');
      }

      const payload = userFormToPayloadAdapter(form);

      // Si hay conexión, crear en el servidor
      const result = await userService.create(payload);
      if (result instanceof Error) {
        throw result;
      }

      // Agregar también al storage local
      addUser(result);
      return result;
    },
    onSuccess: () => {
      show({
        message: 'Usuario creado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS() });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}

export function useUserUpdate() {
  const queryClient = useQueryClient();
  // Storage
  const { show } = useAppStorage(s => s.toast);
  const updateUser = useUsersStorage.getState().updateUser;

  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: UserFormData }) => {
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('No internet connection');
      }

      const payload = userFormToUpdatePayloadAdapter(form);

      // Si hay conexión, actualizar en el servidor
      const result = await userService.update(id, payload);
      if (result instanceof Error) {
        throw result;
      }

      // Actualizar también en storage local
      updateUser(id, result);
      return result;
    },
    onSuccess: (_, variables) => {
      show({
        message: 'Usuario actualizado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USER_DETAIL(variables.id),
      });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}

export function useUserDelete() {
  const queryClient = useQueryClient();
  // Storage
  const { show } = useAppStorage(s => s.toast);
  const deleteUser = useUsersStorage.getState().deleteUser;

  return useMutation({
    mutationFn: async (id: string) => {
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('No internet connection');
      }

      // Si hay conexión, eliminar del servidor
      const result = await userService.delete(id);
      if (result instanceof Error) {
        throw result;
      }

      // Eliminar también del storage local
      deleteUser(id);
    },
    onSuccess: () => {
      show({
        message: 'Usuario eliminado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS() });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}
