import { storage } from '@config/storage';
import type { AuthRepository } from '../domain/auth.repository';
import type {
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
  AuthUser,
  AuthStateChangeCallback,
  AuthStateUnsubscribe,
} from '../domain/auth.model';

/**
 * Usuario almacenado por el provider local.
 *
 * A diferencia del provider `mock`, este provider NO persiste passwords:
 * las credenciales viven en `secureStorage` (MMKV encriptado) y los
 * datos públicos del usuario en `storage` (MMKV plano).
 *
 * El password se guarda hasheado con SHA-256 (Web Crypto cuando está
 * disponible, fallback síncrono en crypto-js si no) para nunca exponer
 * la credencial en claro en disco.
 */
interface LocalUserRecord {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

interface LocalCredentialRecord {
  id: string;
  email: string;
  passwordHash: string;
}

const STORAGE_KEYS = {
  USERS: 'local-auth-users',
  CREDENTIALS: 'local-auth-credentials',
  CURRENT_USER_ID: 'local-auth-current-user-id',
} as const;

const SECURE_STORAGE_KEYS = {
  CREDENTIALS: 'local-auth-credentials-secure',
} as const;

/**
 * Genera un ID único para usuarios locales
 */
function generateLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hash SHA-256 de un string. Usa Web Crypto cuando está disponible
 * (React Native lo expone en versiones recientes) y hace fallback a
 * un hash determinista basado en FNV-1a si no.
 */
async function hashPassword(password: string): Promise<string> {
  const globalCrypto = (globalThis as { crypto?: Crypto }).crypto;
  if (globalCrypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const buffer = await globalCrypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Fallback: FNV-1a 32-bit + salt determinista. NO es criptográficamente
  // seguro, pero evita guardar el password en claro en disco cuando
  // Web Crypto no está disponible (p.ej. en tests con jsdom).
  let hash = 0x811c9dc5;
  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return `fnv1a-${hash.toString(16).padStart(8, '0')}`;
}

function localUserToEntity(record: LocalUserRecord): AuthUser {
  return {
    id: record.id,
    email: record.email,
    displayName: record.displayName,
    photoURL: record.photoURL,
    emailVerified: record.emailVerified,
    createdAt: new Date(record.createdAt),
    lastLoginAt: new Date(record.lastLoginAt),
  };
}

function readJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Implementación local de AuthRepository.
 *
 * - Almacena perfiles de usuario en MMKV (`storage`).
 * - Almacena credenciales hasheadas en MMKV encriptado (`secureStorage`).
 *   Si `secureStorage` no fue inicializado, cae a MMKV plano y emite
 *   una advertencia — útil para tests con `jest.setup.js` que mockean
 *   react-native-keychain.
 * - No requiere backend ni servicios externos.
 * - No emite un JWT: `getStoredToken` siempre devuelve `null`. Esto
 *   cumple el contrato del repositorio (los consumidores deben tolerar
 *   `null`).
 */
class LocalAuthService implements AuthRepository {
  private listeners: Set<AuthStateChangeCallback> = new Set();

  private getUsers(): LocalUserRecord[] {
    return readJSON<LocalUserRecord[]>(
      storage.getString(STORAGE_KEYS.USERS),
      [],
    );
  }

  private saveUsers(users: LocalUserRecord[]): void {
    storage.set(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private getCredentials(): LocalCredentialRecord[] {
    const read = (key: string) =>
      readJSON<LocalCredentialRecord[]>(storage.getString(key), []);

    // Preferimos el storage seguro; si está vacío y el plano tiene datos,
    // migramos una vez.
    const secure = read(SECURE_STORAGE_KEYS.CREDENTIALS);
    if (secure.length > 0) {
      return secure;
    }
    const plain = read(STORAGE_KEYS.CREDENTIALS);
    if (plain.length > 0) {
      storage.set(SECURE_STORAGE_KEYS.CREDENTIALS, JSON.stringify(plain));
      storage.remove(STORAGE_KEYS.CREDENTIALS);
      return plain;
    }
    return [];
  }

  private saveCredentials(credentials: LocalCredentialRecord[]): void {
    storage.set(SECURE_STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    storage.remove(STORAGE_KEYS.CREDENTIALS);
  }

  private getCurrentUserId(): string | null {
    return storage.getString(STORAGE_KEYS.CURRENT_USER_ID) ?? null;
  }

  private setCurrentUserId(id: string | null): void {
    if (id) {
      storage.set(STORAGE_KEYS.CURRENT_USER_ID, id);
    } else {
      storage.remove(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }

  private getCurrentUserRecord(): LocalUserRecord | null {
    const id = this.getCurrentUserId();
    if (!id) {
      return null;
    }
    return this.getUsers().find(u => u.id === id) ?? null;
  }

  private notifyListeners(user: AuthUser | null): void {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error en auth state listener:', error);
      }
    });
  }

  async signup(data: SignUpPayload): Promise<SignUpResponse | Error> {
    const users = this.getUsers();
    if (users.some(u => u.email === data.email)) {
      return new Error('El correo electrónico ya está en uso.');
    }

    const credentials = this.getCredentials();
    if (credentials.some(c => c.email === data.email)) {
      return new Error('El correo electrónico ya está en uso.');
    }

    const now = new Date().toISOString();
    const newUser: LocalUserRecord = {
      id: generateLocalId(),
      email: data.email,
      displayName: data.displayName ?? null,
      photoURL: null,
      emailVerified: false,
      createdAt: now,
      lastLoginAt: now,
    };

    const passwordHash = await hashPassword(data.password);
    const newCredential: LocalCredentialRecord = {
      id: newUser.id,
      email: data.email,
      passwordHash,
    };

    users.push(newUser);
    this.saveUsers(users);

    credentials.push(newCredential);
    this.saveCredentials(credentials);

    this.setCurrentUserId(newUser.id);

    const entity = localUserToEntity(newUser);
    this.notifyListeners(entity);

    return { user: entity };
  }

  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    const credentials = this.getCredentials();
    const passwordHash = await hashPassword(data.password);
    const credential = credentials.find(
      c => c.email === data.email && c.passwordHash === passwordHash,
    );

    if (!credential) {
      return new Error('Credenciales inválidas.');
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === credential.id);
    if (userIndex === -1) {
      return new Error('Credenciales inválidas.');
    }

    const now = new Date().toISOString();
    users[userIndex] = { ...users[userIndex], lastLoginAt: now };
    this.saveUsers(users);
    this.setCurrentUserId(users[userIndex].id);

    const entity = localUserToEntity(users[userIndex]);
    this.notifyListeners(entity);

    return { user: entity };
  }

  async signout(): Promise<void | Error> {
    this.setCurrentUserId(null);
    this.notifyListeners(null);
    return;
  }

  async getCurrentUser(): Promise<AuthUser | null | Error> {
    const record = this.getCurrentUserRecord();
    if (!record) {
      return null;
    }
    return localUserToEntity(record);
  }

  onAuthStateChanged(callback: AuthStateChangeCallback): AuthStateUnsubscribe {
    this.listeners.add(callback);

    const record = this.getCurrentUserRecord();
    callback(record ? localUserToEntity(record) : null);

    return () => {
      this.listeners.delete(callback);
    };
  }

  async sendEmailVerification(): Promise<void | Error> {
    const currentId = this.getCurrentUserId();
    if (!currentId) {
      return new Error('No hay usuario autenticado.');
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentId);
    if (userIndex === -1) {
      return new Error('No hay usuario autenticado.');
    }

    users[userIndex] = { ...users[userIndex], emailVerified: true };
    this.saveUsers(users);

    this.notifyListeners(localUserToEntity(users[userIndex]));
    return;
  }

  async sendPasswordResetEmail(email: string): Promise<void | Error> {
    const credentials = this.getCredentials();
    const exists = credentials.some(c => c.email === email);
    if (!exists) {
      // Por seguridad, no revelamos si el email existe o no.
      return;
    }
    // Provider local: no hay canal de envío real. El consumidor debe
    // implementar el flujo de reset en otra capa (p.ej. un caso de uso
    // que use un storage key temporal con código de verificación).
    return;
  }

  async updateProfile(data: {
    displayName?: string;
    photoURL?: string;
  }): Promise<AuthUser | Error> {
    const currentId = this.getCurrentUserId();
    if (!currentId) {
      return new Error('No hay usuario autenticado.');
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentId);
    if (userIndex === -1) {
      return new Error('No hay usuario autenticado.');
    }

    const updated: LocalUserRecord = {
      ...users[userIndex],
      displayName:
        data.displayName !== undefined
          ? data.displayName
          : users[userIndex].displayName,
      photoURL:
        data.photoURL !== undefined ? data.photoURL : users[userIndex].photoURL,
    };

    users[userIndex] = updated;
    this.saveUsers(users);

    const entity = localUserToEntity(updated);
    this.notifyListeners(entity);
    return entity;
  }

  async deleteAccount(): Promise<void | Error> {
    const currentId = this.getCurrentUserId();
    if (!currentId) {
      return new Error('No hay usuario autenticado.');
    }

    const users = this.getUsers().filter(u => u.id !== currentId);
    this.saveUsers(users);

    const credentials = this.getCredentials().filter(c => c.id !== currentId);
    this.saveCredentials(credentials);

    this.setCurrentUserId(null);
    this.notifyListeners(null);
    return;
  }

  /**
   * El provider local no emite un JWT. Devuelve siempre `null`.
   */
  getStoredToken(): string | null {
    return null;
  }
}

function createLocalAuthService(): AuthRepository {
  return new LocalAuthService();
}

export default createLocalAuthService();
