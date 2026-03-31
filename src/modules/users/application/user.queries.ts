import { useQuery } from '@tanstack/react-query';
// Services
import userService from '../infrastructure/user.service';
// Domain
import type { UserFilter } from '../domain/user.repository';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function useUsers(filter?: UserFilter, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USERS(filter?.searchText),
    queryFn: async () => {
      const result = await userService.getAll(filter);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled,
  });
}

export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_DETAIL(id),
    queryFn: async () => {
      const result = await userService.getById(id);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled: enabled && Boolean(id),
  });
}
