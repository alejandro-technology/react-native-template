import Config from 'react-native-config';

export type ServiceProvider = 'http' | 'firebase' | 'supabase' | 'mock';

interface Config {
  SERVICE_PROVIDER: ServiceProvider;
  ROOT_CREDENTIALS: {
    USERNAME: string;
    PASSWORD: string;
  };
}

const SERVICE_PROVIDER = Config.SERVICE_PROVIDER as ServiceProvider;

export const CONFIG: Config = {
  SERVICE_PROVIDER: SERVICE_PROVIDER || 'firebase',
  ROOT_CREDENTIALS: {
    // Root credentials for mock service (read from .env)
    USERNAME: Config.ROOT_USERNAME || 'user@example.com',
    PASSWORD: Config.ROOT_PASSWORD || 'example123',
  },
};
