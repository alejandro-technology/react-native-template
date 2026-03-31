import React, {
  createContext,
  useContext,
  useEffect,
  PropsWithChildren,
} from 'react';
import authService from '../../infrastructure/auth.service';
import { useAuthStorage, authSelectors } from '../../application/auth.storage';
import type { AuthUser, AuthStatus } from '../../domain/auth.model';

/**
 * Contexto de autenticación
 */
interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provider de autenticación
 *
 * Inicializa el listener de cambios de estado de autenticación
 * y sincroniza el estado con el store de Zustand.
 *
 * Debe envolver la aplicación para que los hooks de autenticación funcionen.
 *
 * @example
 * ```tsx
 * // En AppProvider.tsx
 * <AuthProvider>
 *   <NavigationProvider>
 *     {children}
 *   </NavigationProvider>
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const user = useAuthStorage(authSelectors.user);
  const status = useAuthStorage(authSelectors.status);
  const isAuthenticated = useAuthStorage(authSelectors.isAuthenticated);
  const isLoading = useAuthStorage(authSelectors.isLoading);

  const setAuthenticated = useAuthStorage(state => state.setAuthenticated);
  const setUnauthenticated = useAuthStorage(state => state.setUnauthenticated);
  const setLoading = useAuthStorage(state => state.setLoading);

  useEffect(() => {
    // Marcar como cargando mientras se inicializa
    setLoading();

    // Suscribirse a cambios de estado de autenticación
    const unsubscribe = authService.onAuthStateChanged(authUser => {
      if (authUser) {
        setAuthenticated(authUser);
      } else {
        setUnauthenticated();
      }
    });

    // Limpiar suscripción al desmontar
    return () => {
      unsubscribe();
    };
  }, [setAuthenticated, setUnauthenticated, setLoading]);

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder al contexto de autenticación
 *
 * Proporciona acceso al estado de autenticación actual.
 *
 * @example
 * ```tsx
 * function ProfileScreen() {
 *   const { user, isAuthenticated } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return <Text>Hola, {user?.displayName}</Text>;
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}

/**
 * Hook para verificar si el usuario está autenticado
 *
 * @example
 * ```tsx
 * function ProtectedRoute({ children }) {
 *   const isAuthenticated = useIsAuthenticated();
 *
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 *
 *   return children;
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook para obtener el usuario actual
 *
 * @example
 * ```tsx
 * function UserAvatar() {
 *   const user = useCurrentAuthUser();
 *
 *   return <Avatar source={{ uri: user?.photoURL }} />;
 * }
 * ```
 */
export function useCurrentAuthUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

export default AuthProvider;
