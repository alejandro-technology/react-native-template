jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    storage: { from: jest.fn() },
    auth: {},
  })),
}));

jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));

import { createClient } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';
// Import after mocks — singleton executes createClient at import time
import '../../../src/modules/supabase/infrastructure/supabase.client';

const mockCreateClient = createClient as jest.Mock;
const mockCreateMMKV = createMMKV as jest.Mock;

// Capture call args and MMKV instance before afterEach clears them
let capturedUrl: string;
let capturedKey: string;
let capturedOptions: any;
let mmkvInstance: any;
let mmkvCreateArgs: any;

beforeAll(() => {
  capturedUrl = mockCreateClient.mock.calls[0][0];
  capturedKey = mockCreateClient.mock.calls[0][1];
  capturedOptions = mockCreateClient.mock.calls[0][2];
  mmkvInstance = mockCreateMMKV.mock.results[0].value;
  mmkvCreateArgs = mockCreateMMKV.mock.calls[0][0];
});

describe('supabaseClient', () => {
  it('debe llamar createClient con la URL de Config', () => {
    expect(capturedUrl).toBe('https://test.supabase.co');
  });

  it('debe llamar createClient con la clave anon de Config', () => {
    expect(capturedKey).toBe('test-anon-key');
  });

  it('debe configurar auth con persistSession en true', () => {
    expect(capturedOptions.auth.persistSession).toBe(true);
  });

  it('debe configurar auth con autoRefreshToken en true', () => {
    expect(capturedOptions.auth.autoRefreshToken).toBe(true);
  });

  it('debe configurar auth con detectSessionInUrl en false', () => {
    expect(capturedOptions.auth.detectSessionInUrl).toBe(false);
  });

  it('debe crear instancia MMKV con id supabase-storage', () => {
    expect(mmkvCreateArgs).toEqual({ id: 'supabase-storage' });
  });

  it('debe usar MMKV getItem correctamente en el storage adapter', () => {
    mmkvInstance.getString.mockReturnValue('valor-almacenado');
    const result = capturedOptions.auth.storage.getItem('mi-clave');

    expect(mmkvInstance.getString).toHaveBeenCalledWith('mi-clave');
    expect(result).toBe('valor-almacenado');
  });

  it('debe retornar null desde getItem cuando el valor no existe', () => {
    mmkvInstance.getString.mockReturnValue(undefined);
    const result = capturedOptions.auth.storage.getItem('clave-inexistente');

    expect(result).toBeNull();
  });

  it('debe usar MMKV setItem correctamente en el storage adapter', () => {
    capturedOptions.auth.storage.setItem('clave', 'valor');

    expect(mmkvInstance.set).toHaveBeenCalledWith('clave', 'valor');
  });

  it('debe usar MMKV removeItem correctamente en el storage adapter', () => {
    capturedOptions.auth.storage.removeItem('clave');

    expect(mmkvInstance.remove).toHaveBeenCalledWith('clave');
  });
});

