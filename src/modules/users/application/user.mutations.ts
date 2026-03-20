import { useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../infrastructure/user.service';
import { useAppStorage } from '@modules/core/application/app.storage';

export function useUserCreate() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);
  return useMutation({
    mutationFn: async (data: Parameters<typeof userService.create>[0]) => {
      const result = await userService.create(data);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    onSuccess: () => {
      show({
        message: 'Usuario creado exitosamente',
        type: 'success',
        position: 'bottom',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUserUpdate() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof userService.update>[1];
    }) => {
      const result = await userService.update(id, data);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    onSuccess: (_, variables) => {
      show({
        message: 'Usuario actualizado exitosamente',
        type: 'success',
        position: 'bottom',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', variables.id],
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
        position: 'bottom',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
