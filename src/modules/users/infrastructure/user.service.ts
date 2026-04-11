import { UserRepository } from '../domain/user.repository';
import userHttpService from './user.http.service';
import userFirebaseService from './user.firebase.service';
import userSupabaseService from './user.supabase.service';
import userMockService from './user.mock.service';
import { CONFIG } from '@config/config';

/**
 * User Service Factory
 *
 * This factory returns the appropriate UserRepository implementation
 * based on the SERVICE_PROVIDER configuration.
 *
 * To switch between implementations, update the SERVICE_PROVIDER
 * constant in config/config.ts
 */
function createUserService(): UserRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return userHttpService;
    case 'firebase':
      return userFirebaseService;
    case 'supabase':
      return userSupabaseService;
    case 'mock':
      return userMockService;
    default:
      throw new Error(
        `Unknown user service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}

export default createUserService();
