import { AuthRepository } from '../domain/auth.repository';
import authHttpService from './auth.http.service';
import authFirebaseService from './firebase-auth.service';
import authMockService from './auth.mock.service';
import { CONFIG } from '@config/config';

/**
 * Auth Service Factory
 *
 * This factory returns the appropriate AuthRepository implementation
 * based on the SERVICE_PROVIDER configuration.
 *
 * To switch between implementations, update the SERVICE_PROVIDER
 * constant in config/config.ts
 */
function createAuthService(): AuthRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return authHttpService;
    case 'firebase':
      return authFirebaseService;
    case 'mock':
      return authMockService;
    default:
      throw new Error(
        `Unknown auth service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}

export default createAuthService();
