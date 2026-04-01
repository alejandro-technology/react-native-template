import { useQuery } from '@tanstack/react-query';
// Services
import productService from '../infrastructure/product.service';
// Domain
import type { ProductFilter } from '../domain/product.repository';
// Config
import { QUERY_KEYS } from '@config/query.keys';
// Storage
import { useProductsStorage } from './products.storage';
import { useConnectivityStore } from '@modules/core/application/connectivity.storage';

export function useProducts(filter?: ProductFilter, enabled = true) {
  const { isConnected } = useConnectivityStore();
  const { getProducts } = useProductsStorage();

  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(filter?.searchText),
    queryFn: async () => {
      // Si no hay conexión, usar datos del storage
      if (!isConnected) {
        return getProducts(filter);
      }

      // Si hay conexión, obtener del servicio
      const result = await productService.getAll(filter);
      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    placeholderData: () => getProducts(filter),
    enabled,
  });
}

export function useProduct(id: string, enabled = true) {
  const { isConnected } = useConnectivityStore();
  const { getProductById } = useProductsStorage();

  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_DETAIL(id),
    queryFn: async () => {
      // Si no hay conexión, usar datos del storage
      if (!isConnected) {
        return getProductById(id);
      }

      // Si hay conexión, obtener del servicio
      const result = await productService.getById(id);
      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    placeholderData: () => {
      // Usar dato del storage como placeholder mientras carga
      return getProductById(id);
    },
    enabled: enabled && Boolean(id),
  });
}
