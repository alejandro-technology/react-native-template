import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { secureMMKVStorage } from '@config/storage';
import type { UserEntity, AuthStatus } from '../domain/auth.model';

/**
 * Estado del store de autenticación
 */
interface AuthStoreState {
  // Estado
  user: UserEntity | null;
  status: AuthStatus;

  // Computed
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  setUser: (user: UserEntity | null) => void;
  setStatus: (status: AuthStatus) => void;
  setAuthenticated: (user: UserEntity) => void;
  setUnauthenticated: () => void;
  setLoading: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  status: 'idle' as AuthStatus,
  isAuthenticated: false,
  isLoading: false,
};

/**
 * Store de autenticación con persistencia MMKV
 *
 * Mantiene el estado de autenticación sincronizado entre sesiones.
 * El estado se persiste automáticamente y se rehidrata al iniciar la app.
 */
export const useAuthStorage = create<AuthStoreState>()(
  persist(
    set => ({
      ...initialState,

      setUser: user =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      setStatus: status =>
        set({
          status,
          isLoading: status === 'loading',
        }),

      setAuthenticated: user =>
        set({
          user,
          status: 'authenticated',
          isAuthenticated: true,
          isLoading: false,
        }),

      setUnauthenticated: () =>
        set({
          user: null,
          status: 'unauthenticated',
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: () =>
        set({
          status: 'loading',
          isLoading: true,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureMMKVStorage),
      // Solo persistir user y status, los computed se recalculan
      partialize: state => ({
        user: state.user,
        status: state.status,
      }),
      // Rehidratar computed al cargar
      onRehydrateStorage: () => state => {
        if (state) {
          state.isAuthenticated = state.user !== null;
          state.isLoading = state.status === 'loading';
        }
      },
    },
  ),
);

/**
 * Selectores para acceso optimizado al estado
 */
export const authSelectors = {
  user: (state: AuthStoreState) => state.user,
  status: (state: AuthStoreState) => state.status,
  isAuthenticated: (state: AuthStoreState) => state.isAuthenticated,
  isLoading: (state: AuthStoreState) => state.isLoading,
};
