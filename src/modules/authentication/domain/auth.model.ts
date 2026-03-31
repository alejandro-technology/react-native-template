import type { User } from '@modules/users/domain/user.model';

/**
 * Entidad de usuario autenticado
 */
export interface AuthUser extends Pick<User, 'id' | 'email'> {
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date | null;
  lastLoginAt: Date | null;
}

/**
 * Estado de autenticación
 */
export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

/**
 * Estado completo de autenticación
 */
export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Payload para registro de usuario
 */
export interface SignUpPayload {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Respuesta de registro
 */
export interface SignUpResponse {
  user: AuthUser;
}

/**
 * Payload para inicio de sesión
 */
export interface SignInPayload {
  email: string;
  password: string;
}

/**
 * Respuesta de inicio de sesión
 */
export interface SignInResponse {
  user: AuthUser;
}

/**
 * Callback para cambios en el estado de autenticación
 */
export type AuthStateChangeCallback = (user: AuthUser | null) => void;

/**
 * Función para cancelar la suscripción al estado de autenticación
 */
export type AuthStateUnsubscribe = () => void;
