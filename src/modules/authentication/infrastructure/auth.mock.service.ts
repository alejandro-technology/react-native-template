import { storage } from '@config/storage';
import type { AuthRepository } from '../domain/auth.repository';
import type {
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
  UserEntity,
  AuthStateChangeCallback,
  AuthStateUnsubscribe,
} from '../domain/auth.model';

/**
 * Usuario mock almacenado
 */
interface MockUser {
  id: string;
  email: string;
  password: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

const STORAGE_KEYS = {
  USERS: 'mock-auth-users',
  CURRENT_USER: 'mock-auth-current-user',
} as const;

/**
 * Genera un ID único para usuarios mock
 */
function generateMockId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convierte MockUser a UserEntity (sin password)
 */
function mockUserToEntity(mockUser: MockUser): UserEntity {
  return {
    id: mockUser.id,
    email: mockUser.email,
    displayName: mockUser.displayName,
    photoURL: mockUser.photoURL,
    emailVerified: mockUser.emailVerified,
    createdAt: mockUser.createdAt,
    lastLoginAt: mockUser.lastLoginAt,
  };
}

/**
 * Implementación mock de AuthRepository
 *
 * Simula autenticación sin backend real, útil para:
 * - Desarrollo sin conexión
 * - Testing
 * - Demos
 *
 * Los datos se persisten en MMKV para mantener sesión entre reinicios.
 */
class AuthMockService implements AuthRepository {
  private listeners: Set<AuthStateChangeCallback> = new Set();

  /**
   * Obtiene todos los usuarios registrados
   */
  private getUsers(): MockUser[] {
    const data = storage.getString(STORAGE_KEYS.USERS);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data) as MockUser[];
    } catch {
      return [];
    }
  }

  /**
   * Guarda la lista de usuarios
   */
  private saveUsers(users: MockUser[]): void {
    storage.set(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  /**
   * Obtiene el usuario actual de la sesión
   */
  private getCurrentUserFromStorage(): MockUser | null {
    const data = storage.getString(STORAGE_KEYS.CURRENT_USER);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data) as MockUser;
    } catch {
      return null;
    }
  }

  /**
   * Guarda el usuario actual en la sesión
   */
  private setCurrentUserInStorage(user: MockUser | null): void {
    if (user) {
      storage.set(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      storage.remove(STORAGE_KEYS.CURRENT_USER);
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

  async signup(data: SignUpPayload): Promise<SignUpResponse | Error> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getUsers();
    const existing = users.find(user => user.email === data.email);

    if (existing) {
      return new Error('El correo electrónico ya está en uso.');
    }

    const now = new Date().toISOString();
    const newUser: MockUser = {
      id: generateMockId(),
      email: data.email,
      password: data.password,
      displayName: data.displayName ?? null,
      photoURL: null,
      emailVerified: false,
      createdAt: now,
      lastLoginAt: now,
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUserInStorage(newUser);

    const userEntity = mockUserToEntity(newUser);
    this.notifyListeners(userEntity);

    return { user: userEntity };
  }

  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getUsers();
    const user = users.find(
      u => u.email === data.email && u.password === data.password,
    );

    if (!user) {
      return new Error('Credenciales inválidas.');
    }

    // Actualizar lastLoginAt
    user.lastLoginAt = new Date().toISOString();
    this.saveUsers(users);
    this.setCurrentUserInStorage(user);

    const userEntity = mockUserToEntity(user);
    this.notifyListeners(userEntity);

    return { user: userEntity };
  }

  async signout(): Promise<void | Error> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    this.setCurrentUserInStorage(null);
    this.notifyListeners(null);
    return;
  }

  async getCurrentUser(): Promise<UserEntity | null | Error> {
    const mockUser = this.getCurrentUserFromStorage();
    if (!mockUser) {
      return null;
    }
    return mockUserToEntity(mockUser);
  }

  onAuthStateChanged(callback: AuthStateChangeCallback): AuthStateUnsubscribe {
    this.listeners.add(callback);

    // Notificar estado inicial
    const currentUser = this.getCurrentUserFromStorage();
    if (currentUser) {
      callback(mockUserToEntity(currentUser));
    } else {
      callback(null);
    }

    // Retornar función para cancelar suscripción
    return () => {
      this.listeners.delete(callback);
    };
  }

  async sendEmailVerification(): Promise<void | Error> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = this.getCurrentUserFromStorage();
    if (!currentUser) {
      return new Error('No hay usuario autenticado');
    }

    // En mock, simplemente marcamos como verificado
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].emailVerified = true;
      this.saveUsers(users);
      this.setCurrentUserInStorage(users[userIndex]);
      this.notifyListeners(mockUserToEntity(users[userIndex]));
    }

    return;
  }

  async sendPasswordResetEmail(email: string): Promise<void | Error> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return new Error('No existe un usuario con este correo electrónico.');
    }

    // En mock, solo simulamos el envío
    console.log(`[Mock] Email de recuperación enviado a: ${email}`);
    return;
  }

  async updateProfile(data: {
    displayName?: string;
    photoURL?: string;
  }): Promise<UserEntity | Error> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = this.getCurrentUserFromStorage();
    if (!currentUser) {
      return new Error('No hay usuario autenticado');
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return new Error('Usuario no encontrado');
    }

    // Actualizar campos
    if (data.displayName !== undefined) {
      users[userIndex].displayName = data.displayName;
    }
    if (data.photoURL !== undefined) {
      users[userIndex].photoURL = data.photoURL;
    }

    this.saveUsers(users);
    this.setCurrentUserInStorage(users[userIndex]);

    const userEntity = mockUserToEntity(users[userIndex]);
    this.notifyListeners(userEntity);

    return userEntity;
  }

  async deleteAccount(): Promise<void | Error> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = this.getCurrentUserFromStorage();
    if (!currentUser) {
      return new Error('No hay usuario autenticado');
    }

    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== currentUser.id);
    this.saveUsers(filteredUsers);
    this.setCurrentUserInStorage(null);
    this.notifyListeners(null);

    return;
  }
}

function createAuthMockService(): AuthRepository {
  return new AuthMockService();
}

export default createAuthMockService();
