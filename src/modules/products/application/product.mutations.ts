import { useMutation, useQueryClient } from '@tanstack/react-query';
// Domain
import {
  productEntityToProductAdapter,
  productFormToPayloadAdapter,
} from '../domain/product.adapter';
import { ProductFormData } from '../domain/product.scheme';
// Services
import productService from '../infrastructure/product.service';
// Core
import { useAppStorage } from '@modules/core/application/app.storage';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function useProductCreate() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (form: ProductFormData) => {
      const payload = productFormToPayloadAdapter(form);
      const result = await productService.create(payload);
      if (result instanceof Error) {
        throw result;
      }
      return productEntityToProductAdapter(result);
    },
    onSuccess: () => {
      show({
        message: 'Producto creado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}

export function useProductUpdate() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: ProductFormData }) => {
      const payload = productFormToPayloadAdapter(form);
      const result = await productService.update(id, payload);
      if (result instanceof Error) {
        throw result;
      }
      return productEntityToProductAdapter(result);
    },
    onSuccess: (_, variables) => {
      show({
        message: 'Producto actualizado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCT_DETAIL(variables.id),
      });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}

export function useProductDelete() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await productService.delete(id);
      if (result instanceof Error) {
        throw result;
      }
    },
    onSuccess: () => {
      show({
        message: 'Producto eliminado exitosamente',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() });
    },
    onError: (error: Error) => {
      show({
        message: error.message,
        type: 'error',
      });
    },
  });
}
