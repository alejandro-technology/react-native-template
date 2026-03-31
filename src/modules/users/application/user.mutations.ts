import { useMutation, useQueryClient } from '@tanstack/react-query';
// Domain
import { userFormToPayloadAdapter } from '../domain/user.adapter';
import { UserFormData } from '../domain/user.scheme';
// Services
import userService from '../infrastructure/user.service';
// Core
import { useAppStorage } from '@modules/core/application/app.storage';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function useUserCreate() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);
  return useMutation({
    mutationFn: async (form: UserFormData) => {
      const payload = userFormToPayloadAdapter(form);
      const result = await userService.create(payload);
      if (result instanceof Error) {
        throw result;
      }
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
  const { show } = useAppStorage(s => s.toast);
  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: UserFormData }) => {
      const payload = userFormToPayloadAdapter(form);
      const result = await userService.update(id, payload);
      if (result instanceof Error) {
        throw result;
      }
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
  const { show } = useAppStorage(s => s.toast);
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await userService.delete(id);
      if (result instanceof Error) {
        throw result;
      }
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
