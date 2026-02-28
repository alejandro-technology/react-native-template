import { ProductRepository } from '../domain/product.repository';
import productHttpService from './product.http.service';
import productFirebaseService from './product.firebase.service';
import { CONFIG } from '@config/config';

/**
 * Product Service Factory
 *
 * This factory returns the appropriate ProductRepository implementation
 * based on the PRODUCT_SERVICE_PROVIDER configuration.
 *
 * To switch between implementations, update the PRODUCT_SERVICE_PROVIDER
 * constant in product.config.ts
 */
function createProductService(): ProductRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return productHttpService;
    case 'firebase':
      return productFirebaseService;
    default:
      throw new Error(
        `Unknown product service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}

export default createProductService();
