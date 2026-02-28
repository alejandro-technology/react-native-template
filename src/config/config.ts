export type ServiceProvider = 'http' | 'firebase';

interface Config {
  SERVICE_PROVIDER: ServiceProvider;
}


export const CONFIG: Config = {
  SERVICE_PROVIDER: 'firebase',
};
