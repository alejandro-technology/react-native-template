import { createClient } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';
import Config from 'react-native-config';

const supabaseStorage = createMMKV({ id: 'supabase-storage' });

const mmkvStorageAdapter = {
  getItem: (key: string): string | null => {
    return supabaseStorage.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    supabaseStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    supabaseStorage.remove(key);
  },
};

const supabaseUrl = Config.SUPABASE_URL ?? '';
const supabaseAnonKey = Config.SUPABASE_ANON_KEY ?? '';

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabaseClient;
