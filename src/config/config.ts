export type ServiceProvider = 'http' | 'firebase' | 'mock';

interface Config {
  SERVICE_PROVIDER: ServiceProvider;
  ROOT_CREDENTIALS: {
    USERNAME: string;
    PASSWORD: string;
  };
}

export const CONFIG: Config = {
  SERVICE_PROVIDER: 'firebase',
  ROOT_CREDENTIALS: {
    // Root credentials for mock service
    USERNAME: '',
    PASSWORD: '',
  },
};
