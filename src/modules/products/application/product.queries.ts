import { useQuery } from '@tanstack/react-query';
import productService from '../infrastructure/product.service';
import type { ProductFilter } from '../domain/product.repository';

export function useProducts(filter?: ProductFilter, enabled = true) {
  return useQuery({
    queryKey: ['products', 'list', filter?.searchText],
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
    queryKey: ['products', 'detail', id],
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
