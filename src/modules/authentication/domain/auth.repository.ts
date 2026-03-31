import {
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
  AuthUser,
  AuthStateChangeCallback,
  AuthStateUnsubscribe,
} from './auth.model';

/**
 * Interfaz del repositorio de autenticación
 *
 * Define el contrato que deben implementar todos los proveedores de autenticación
 * (Firebase, HTTP, Mock, etc.)
 */
export interface AuthRepository {
  /**
   * Registra un nuevo usuario
   */
  signup(data: SignUpPayload): Promise<SignUpResponse | Error>;

  /**
   * Inicia sesión con credenciales
   */
  signin(data: SignInPayload): Promise<SignInResponse | Error>;

  /**
   * Cierra la sesión del usuario actual
   */
  signout(): Promise<void | Error>;

  /**
   * Obtiene el usuario actualmente autenticado
   * Retorna null si no hay usuario autenticado
   */
  getCurrentUser(): Promise<AuthUser | null | Error>;

  /**
   * Suscribe a cambios en el estado de autenticación
   * Retorna una función para cancelar la suscripción
   */
  onAuthStateChanged(callback: AuthStateChangeCallback): AuthStateUnsubscribe;

  /**
   * Envía un email de verificación al usuario actual
   */
  sendEmailVerification(): Promise<void | Error>;

  /**
   * Envía un email para restablecer la contraseña
   */
  sendPasswordResetEmail(email: string): Promise<void | Error>;

  /**
   * Actualiza el perfil del usuario actual
   */
  updateProfile(data: {
    displayName?: string;
    photoURL?: string;
  }): Promise<AuthUser | Error>;

  /**
   * Elimina la cuenta del usuario actual
   */
  deleteAccount(): Promise<void | Error>;
}
