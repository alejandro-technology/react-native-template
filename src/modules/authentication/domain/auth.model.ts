/**
 * Entidad de usuario autenticado
 */
export interface UserEntity {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
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
  user: UserEntity | null;
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
  user: UserEntity;
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
  user: UserEntity;
}

/**
 * Callback para cambios en el estado de autenticación
 */
export type AuthStateChangeCallback = (user: UserEntity | null) => void;

/**
 * Función para cancelar la suscripción al estado de autenticación
 */
export type AuthStateUnsubscribe = () => void;
