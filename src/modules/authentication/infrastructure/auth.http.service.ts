import axiosService from '@modules/network/infrastructure/axios.service';
import { storage } from '@config/storage';
import {
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
  UserEntity,
  AuthStateChangeCallback,
  AuthStateUnsubscribe,
} from '../domain/auth.model';
import { AuthRepository } from '../domain/auth.repository';
import { manageAxiosError } from '@modules/network/domain/network.error';
// Config
import { API_ROUTES } from '@config/api.routes';

const STORAGE_KEYS = {
  TOKEN: 'http-auth-token',
  USER: 'http-auth-user',
} as const;

/**
 * Implementación de AuthRepository usando HTTP/REST API
 *
 * Requiere un backend que implemente los endpoints de autenticación.
 * El token JWT se almacena en MMKV y se envía en el header Authorization.
 */
class AuthHttpService implements AuthRepository {
  private listeners: Set<AuthStateChangeCallback> = new Set();

  /**
   * Obtiene el token almacenado
   */
  private getToken(): string | null {
    return storage.getString(STORAGE_KEYS.TOKEN) ?? null;
  }

  /**
   * Guarda el token
   */
  private setToken(token: string | null): void {
    if (token) {
      storage.set(STORAGE_KEYS.TOKEN, token);
    } else {
      storage.remove(STORAGE_KEYS.TOKEN);
    }
  }

  /**
   * Obtiene el usuario almacenado
   */
  private getUserFromStorage(): UserEntity | null {
    const data = storage.getString(STORAGE_KEYS.USER);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data) as UserEntity;
    } catch {
      return null;
    }
  }

  /**
   * Guarda el usuario
   */
  private setUserInStorage(user: UserEntity | null): void {
    if (user) {
      storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      storage.remove(STORAGE_KEYS.USER);
    }
  }

  /**
   * Notifica a todos los listeners sobre cambio de estado
   */
  private notifyListeners(user: UserEntity | null): void {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error en auth state listener:', error);
      }
    });
  }

  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    try {
      const response = await axiosService.post<
        SignInResponse & { token?: string }
      >(API_ROUTES.SIGNIN, data);

      const { user, token } = response.data as SignInResponse & {
        token?: string;
      };

      // Guardar token si viene en la respuesta
      if (token) {
        this.setToken(token);
      }

      this.setUserInStorage(user);
      this.notifyListeners(user);

      return { user };
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async signup(data: SignUpPayload): Promise<SignUpResponse | Error> {
    try {
      const response = await axiosService.post<
        SignUpResponse & { token?: string }
      >(API_ROUTES.SIGNUP, data);

      const { user, token } = response.data as SignUpResponse & {
        token?: string;
      };

      // Guardar token si viene en la respuesta
      if (token) {
        this.setToken(token);
      }

      this.setUserInStorage(user);
      this.notifyListeners(user);

      return { user };
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async signout(): Promise<void | Error> {
    try {
      // Intentar llamar al endpoint de logout si existe
      const token = this.getToken();
      if (token) {
        try {
          await axiosService.post('/auth/signout');
        } catch {
          // Ignorar errores del endpoint, igual limpiamos localmente
        }
      }

      this.setToken(null);
      this.setUserInStorage(null);
      this.notifyListeners(null);
      return;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async getCurrentUser(): Promise<UserEntity | null | Error> {
    // Primero intentar obtener del storage local
    const storedUser = this.getUserFromStorage();
    const token = this.getToken();

    if (!token) {
      return null;
    }

    // Si hay token, intentar validar con el servidor
    try {
      const response = await axiosService.get<{ user: UserEntity }>('/auth/me');
      const user = response.data.user;
      this.setUserInStorage(user);
      return user;
    } catch {
      // Si falla la validación, retornar usuario almacenado si existe
      return storedUser;
    }
  }

  onAuthStateChanged(callback: AuthStateChangeCallback): AuthStateUnsubscribe {
    this.listeners.add(callback);

    // Notificar estado inicial
    const currentUser = this.getUserFromStorage();
    callback(currentUser);

    // Retornar función para cancelar suscripción
    return () => {
      this.listeners.delete(callback);
    };
  }

  async sendEmailVerification(): Promise<void | Error> {
    try {
      await axiosService.post('/auth/send-verification-email');
      return;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void | Error> {
    try {
      await axiosService.post('/auth/forgot-password', { email });
      return;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async updateProfile(data: {
    displayName?: string;
    photoURL?: string;
  }): Promise<UserEntity | Error> {
    try {
      const response = await axiosService.put<{ user: UserEntity }>(
        '/auth/profile',
        data,
      );
      const user = response.data.user;
      this.setUserInStorage(user);
      this.notifyListeners(user);
      return user;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async deleteAccount(): Promise<void | Error> {
    try {
      await axiosService.delete('/auth/account');
      this.setToken(null);
      this.setUserInStorage(null);
      this.notifyListeners(null);
      return;
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createAuthHttpService(): AuthRepository {
  return new AuthHttpService();
}

export default createAuthHttpService();
