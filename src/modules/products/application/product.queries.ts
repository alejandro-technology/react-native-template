import { useQuery } from '@tanstack/react-query';
// Services
import productService from '../infrastructure/product.service';
// Domain
import type { ProductFilter } from '../domain/product.repository';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function useProducts(filter?: ProductFilter, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(filter?.searchText),
    queryFn: async () => {
      const result = await productService.getAll(filter);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled,
  });
}

export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_DETAIL(id),
    queryFn: async () => {
      const result = await productService.getById(id);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled: enabled && Boolean(id),
  });
}
