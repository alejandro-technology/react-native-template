import { useMutation, useQueryClient } from '@tanstack/react-query';
// Domain
import { RegisterFormData, SignInFormData } from '../domain/auth.scheme';
import {
  signInPayloadAdapter,
  signInResponseAdapter,
  signUpPayloadAdapter,
  signUpResponseAdapter,
} from '../domain/auth.adapter';
// Infrastructure
import authService from '../infrastructure/auth.service';
import { useAuthStorage } from '../infrastructure/auth.storage';
// Application
import { authQueryKeys } from './auth.queries';

/**
 * Hook de mutación para registro de usuario
 *
 * @example
 * ```tsx
 * const { mutate: signup, isPending } = useSignupMutation();
 *
 * const handleSubmit = (data: RegisterFormData) => {
 *   signup(data, {
 *     onSuccess: (user) => navigation.navigate('Home'),
 *     onError: (error) => showToast(error.message),
 *   });
 * };
 * ```
 */
export function useSignupMutation() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStorage(state => state.setAuthenticated);

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const payload = signUpPayloadAdapter(data);
      const result = await authService.signup(payload);

      if (result instanceof Error) {
        throw result;
      }

      return signUpResponseAdapter(result);
    },
    onSuccess: user => {
      // Actualizar store de autenticación
      setAuthenticated(user);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
    },
  });
}

/**
 * Hook de mutación para inicio de sesión de usuario
 *
 * @example
 * ```tsx
 * const { mutate: signin, isPending } = useSigninMutation();
 *
 * const handleSubmit = (data: SignInFormData) => {
 *   signin(data, {
 *     onSuccess: (user) => navigation.navigate('Home'),
 *     onError: (error) => showToast(error.message),
 *   });
 * };
 * ```
 */
export function useSigninMutation() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStorage(state => state.setAuthenticated);

  return useMutation({
    mutationFn: async (data: SignInFormData) => {
      const payload = signInPayloadAdapter(data);
      const result = await authService.signin(payload);

      if (result instanceof Error) {
        throw result;
      }

      return signInResponseAdapter(result);
    },
    onSuccess: user => {
      // Actualizar store de autenticación
      setAuthenticated(user);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
    },
  });
}

/**
 * Hook de mutación para cerrar sesión
 *
 * @example
 * ```tsx
 * const { mutate: signout, isPending } = useSignoutMutation();
 *
 * const handleLogout = () => {
 *   signout(undefined, {
 *     onSuccess: () => navigation.navigate('Login'),
 *   });
 * };
 * ```
 */
export function useSignoutMutation() {
  const queryClient = useQueryClient();
  const setUnauthenticated = useAuthStorage(state => state.setUnauthenticated);

  return useMutation({
    mutationFn: async () => {
      const result = await authService.signout();

      if (result instanceof Error) {
        throw result;
      }

      return;
    },
    onSuccess: () => {
      // Actualizar store de autenticación
      setUnauthenticated();
      // Limpiar todas las queries de autenticación
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
    },
  });
}

/**
 * Hook de mutación para enviar email de verificación
 */
export function useSendEmailVerificationMutation() {
  return useMutation({
    mutationFn: async () => {
      const result = await authService.sendEmailVerification();

      if (result instanceof Error) {
        throw result;
      }

      return;
    },
  });
}

/**
 * Hook de mutación para enviar email de recuperación de contraseña
 */
export function useSendPasswordResetEmailMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const result = await authService.sendPasswordResetEmail(email);

      if (result instanceof Error) {
        throw result;
      }

      return;
    },
  });
}

/**
 * Hook de mutación para actualizar perfil de usuario
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStorage(state => state.setAuthenticated);

  return useMutation({
    mutationFn: async (data: { displayName?: string; photoURL?: string }) => {
      const result = await authService.updateProfile(data);

      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    onSuccess: user => {
      // Actualizar store de autenticación
      setAuthenticated(user);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
    },
  });
}

/**
 * Hook de mutación para eliminar cuenta
 */
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const setUnauthenticated = useAuthStorage(state => state.setUnauthenticated);

  return useMutation({
    mutationFn: async () => {
      const result = await authService.deleteAccount();

      if (result instanceof Error) {
        throw result;
      }

      return;
    },
    onSuccess: () => {
      // Actualizar store de autenticación
      setUnauthenticated();
      // Limpiar todas las queries
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
    },
  });
}
