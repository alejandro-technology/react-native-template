import { useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../infrastructure/product.service';

export function useProductCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof productService.create>[0]) => {
      const result = await productService.create(data);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useProductUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof productService.update>[1];
    }) => {
      const result = await productService.update(id, data);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({
        queryKey: ['products', 'detail', variables.id],
      });
    },
  });
}

export function useProductDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await productService.delete(id);
      if (result instanceof Error) {
        throw result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
