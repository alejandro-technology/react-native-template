import { useQuery } from '@tanstack/react-query';
// Services
import productService from '../infrastructure/product.service';
// Domain
import type { ProductFilter } from '../domain/product.repository';
// Config
import { QUERY_KEYS } from '@config/query.keys';
// Storage
import { useProductsStorage } from './products.storage';
import { getIsConnected } from '@modules/core/application/connectivity.storage';

export function useProducts(filter?: ProductFilter, enabled = true) {
  // Read storage helpers directly to avoid calling hooks when this module is
  // used in tests outside of a React render context.
  const getProducts = useProductsStorage.getState().getProducts;

  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(filter?.searchText),
    queryFn: async () => {
      // Cuando la queryFn corre fuera del render, leer estado directamente
      // para evitar llamadas a hooks dentro de funciones no-component.
      const connected = getIsConnected();
      // Si no hay conexión, usar datos del storage
      if (!connected) {
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
  // Read storage helpers directly to avoid calling hooks when this module is
  // used in tests outside of a React render context.
  const getProductById = useProductsStorage.getState().getProductById;

  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_DETAIL(id),
    queryFn: async () => {
      const connected = getIsConnected();
      // Si no hay conexión, usar datos del storage
      if (!connected) {
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
