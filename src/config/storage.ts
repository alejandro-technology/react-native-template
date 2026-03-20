import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

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

/**
 * Instancia MMKV con encriptación para datos sensibles (tokens, credenciales)
 */
export const secureStorage = createMMKV({
  id: 'rnca-secure-storage',
  encryptionKey: 'rnca-secure-key',
});

/**
 * Adaptador StateStorage para zustand persist con encriptación
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
