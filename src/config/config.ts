export type ProductServiceProvider = 'http' | 'firebase';

export const CONFIG: Config = {
  SERVICE_PROVIDER: 'firebase',
};

interface Config {
  SERVICE_PROVIDER: ProductServiceProvider;
}
