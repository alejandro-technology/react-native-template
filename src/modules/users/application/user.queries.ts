import { useQuery } from '@tanstack/react-query';
// Module
import { useUsersStorage } from './users.storage';
import userService from '../infrastructure/user.service';
import type { UserFilter } from '../domain/user.repository';
// Config
import { QUERY_KEYS } from '@config/query.keys';
// Core
import { getIsConnected } from '@modules/network/application/connectivity.storage';

export function useUsers(filter?: UserFilter, enabled = true) {
  // Read storage helpers directly to avoid calling hooks when this module is
  // used in tests outside of a React render context.
  const getUsers = useUsersStorage.getState().getUsers;

  return useQuery({
    queryKey: QUERY_KEYS.USERS(filter?.searchText),
    queryFn: async () => {
      // Cuando la queryFn corre fuera del render, leer estado directamente
      // para evitar llamadas a hooks dentro de funciones no-component.
      const connected = getIsConnected();
      // Si no hay conexión, usar datos del storage
      if (!connected) {
        return getUsers(filter);
      }

      // Si hay conexión, obtener del servicio
      const result = await userService.getAll(filter);
      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    placeholderData: () => getUsers(filter),
    enabled,
  });
}

export function useUser(id: string, enabled = true) {
  // Read storage helpers directly to avoid calling hooks when this module is
  // used in tests outside of a React render context.
  const getUserById = useUsersStorage.getState().getUserById;

  return useQuery({
    queryKey: QUERY_KEYS.USER_DETAIL(id),
    queryFn: async () => {
      const connected = getIsConnected();
      // Si no hay conexión, usar datos del storage
      if (!connected) {
        return getUserById(id);
      }

      // Si hay conexión, obtener del servicio
      const result = await userService.getById(id);
      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    placeholderData: () => {
      // Usar dato del storage como placeholder mientras carga
      return getUserById(id);
    },
    enabled: enabled && Boolean(id),
  });
}
