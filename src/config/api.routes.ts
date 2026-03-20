import Config from 'react-native-config';

export const API_ROUTES = {
  ROOT: Config.API_URL ?? 'https://api.example.com',
  PRODUCTS: '/products',
  USERS: '/users',
  SIGNIN: '/auth/signin',
  SIGNUP: '/auth/signup',
};
