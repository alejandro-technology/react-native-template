import { ProductRepository } from '../domain/product.repository';
import productHttpService from './product.http.service';
import productFirebaseService from './product.firebase.service';
import { CONFIG } from '@config/config';
import productMockService from './product.mock.service';

/**
 * Product Service Factory
 *
 * This factory returns the appropriate ProductRepository implementation
 * based on the SERVICE_PROVIDER configuration.
 *
 * To switch between implementations, update the SERVICE_PROVIDER
 * constant in config/config.ts
 */
function createProductService(): ProductRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return productHttpService;
    case 'firebase':
      return productFirebaseService;
    case 'mock':
      return productMockService;
    default:
      throw new Error(
        `Unknown product service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}

export default createProductService();
