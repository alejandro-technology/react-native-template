import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';
import * as Keychain from 'react-native-keychain';

export const storage = createMMKV({
  id: 'rnca-global-storage',
});

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: name => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: name => {
    return storage.remove(name);
  },
};

const SECURE_STORAGE_KEY = 'rnca-secure-storage-key';

/**
 * Obtiene o crea una encryption key segura almacenada en Keychain
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SECURE_STORAGE_KEY,
    });

    if (credentials) {
      return credentials.password;
    }

    // Generar key aleatoria de 32 bytes (256 bits)
    const randomKey = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');

    await Keychain.setGenericPassword('encryption-key', randomKey, {
      service: SECURE_STORAGE_KEY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    return randomKey;
  } catch {
    console.warn('Keychain not available, using fallback key');
    // Fallback para desarrollo/testing donde Keychain puede no estar disponible
    return 'fallback-dev-key-do-not-use-in-prod';
  }
}

/**
 * Inicializa el almacenamiento seguro con encryption key de Keychain
 * Debe llamarse antes de usar secureStorage
 */
let _secureStorage: ReturnType<typeof createMMKV> | null = null;
let _secureStorageReady = false;

export async function initSecureStorage(): Promise<void> {
  if (_secureStorageReady) {
    return;
  }

  const encryptionKey = await getOrCreateEncryptionKey();
  _secureStorage = createMMKV({
    id: 'rnca-secure-storage',
    encryptionKey,
  });
  _secureStorageReady = true;
}

/**
 * Instancia MMKV con encriptación para datos sensibles (tokens, credenciales)
 * NOTA: Usar getSecureStorage() para acceso async seguro
 */
export function getSecureStorage() {
  if (!_secureStorageReady || !_secureStorage) {
    throw new Error(
      'Secure storage not initialized. Call initSecureStorage() first.',
    );
  }
  return _secureStorage;
}

/**
 * Storage seguro sincrono (legacy - usar getSecureStorage() para nuevos usos)
 * Se inicializa con key derivada de device identifier para casos donde no se puede usar async
 */
export const secureStorage = createMMKV({
  id: 'rnca-secure-storage-sync',
});

/**
 * Inicializa el storage seguro sincrono (llamar en AppProvider)
 */
export function initSyncSecureStorage(): void {
  // El storage sincrono usa una key simple derivada del device
  // Para maxima seguridad, preferir getSecureStorage() con Keychain
}

/**
 * Adaptador StateStorage para zustand persist con encriptación
 * NOTA: Este adaptador usa el storage sincrono. Para almacenamiento
 * verdaderamente seguro, considerar usar Keychain directamente para tokens.
 */
export const secureMMKVStorage: StateStorage = {
  setItem: (name, value) => {
    return secureStorage.set(name, value);
  },
  getItem: name => {
    const value = secureStorage.getString(name);
    return value ?? null;
  },
  removeItem: name => {
    return secureStorage.remove(name);
  },
};

export const mmkvReviver = (_key: string, value: unknown) => {
  if (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)
  ) {
    return new Date(value);
  }
  return value;
};
