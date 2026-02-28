import { useQuery } from '@tanstack/react-query';
import userService from '../infrastructure/user.service';
import type { UserFilter } from '../domain/user.repository';

export function useUsers(filter?: UserFilter, enabled = true) {
  return useQuery({
    queryKey: ['users', 'list', filter?.searchText],
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
    queryKey: ['users', 'detail', id],
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
