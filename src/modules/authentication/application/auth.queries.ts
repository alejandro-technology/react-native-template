import { useQuery } from '@tanstack/react-query';
import authService from '../infrastructure/auth.service';

/**
 * Query keys para autenticación
 */
export const authQueryKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authQueryKeys.all, 'currentUser'] as const,
};

/**
 * Hook para obtener el usuario actual
 *
 * Consulta el servicio de autenticación para obtener el usuario
 * actualmente autenticado. Retorna null si no hay sesión activa.
 *
 * @example
 * ```tsx
 * const { data: user, isLoading } = useCurrentUser();
 *
 * if (isLoading) return <LoadingState />;
 * if (!user) return <LoginScreen />;
 * return <HomeScreen user={user} />;
 * ```
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.currentUser(),
    queryFn: async () => {
      const result = await authService.getCurrentUser();

      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
