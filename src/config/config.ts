import Config from 'react-native-config';

export type ServiceProvider = 'http' | 'firebase' | 'supabase' | 'mock';

interface Config {
  SERVICE_PROVIDER: ServiceProvider;
  ROOT_CREDENTIALS: {
    USERNAME: string;
    PASSWORD: string;
  };
  RAWG_API_KEY: string;
}

const SERVICE_PROVIDER = Config.SERVICE_PROVIDER as ServiceProvider;

export const CONFIG: Config = {
  SERVICE_PROVIDER: SERVICE_PROVIDER || 'mock',
  ROOT_CREDENTIALS: {
    // Root credentials for mock service (read from .env)
    USERNAME: Config.ROOT_USERNAME || 'pruebas@gmail.com',
    PASSWORD: Config.ROOT_PASSWORD || 'pruebas123',
  },
  RAWG_API_KEY: Config.RAWG_API_KEY || '',
};
