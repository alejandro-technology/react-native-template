import { AuthRepository } from '../domain/auth.repository';
import authHttpService from './auth.http.service';
import authFirebaseService from './auth.firebase.service';
import authSupabaseService from './auth.supabase.service';
import authMockService from './auth.mock.service';
import { CONFIG } from '@config/config';

function createAuthService(): AuthRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return authHttpService;
    case 'firebase':
      return authFirebaseService;
    case 'supabase':
      return authSupabaseService;
    case 'mock':
      return authMockService;
    default:
      throw new Error(
        `Unknown auth service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}

export default createAuthService();
