import { useMutation, useQueryClient } from '@tanstack/react-query';
// Domain
import { productFormToPayloadAdapter } from '../domain/product.adapter';
import { ProductFormData } from '../domain/product.scheme';
// Module
import { useProductsStorage } from './products.storage';
import productService from '../infrastructure/product.service';
// Core
import { useAppStorage } from '@modules/core/application/app.storage';
import { getIsConnected } from '@modules/core/application/connectivity.storage';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function useProductCreate() {
  const queryClient = useQueryClient();
  // Storage (read state directly to avoid calling hooks outside React)
  const addProduct = useProductsStorage.getState().addProduct;
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (form: ProductFormData) => {
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('No internet connection');
      }

      const payload = productFormToPayloadAdapter(form);

      // Si hay conexión, crear en el servidor
      const result = await productService.create(payload);
      if (result instanceof Error) {
        throw result;
      }

      // Agregar también al storage local
      addProduct(result);
      return result;
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
  // Storage
  const { show } = useAppStorage(s => s.toast);
  const updateProduct = useProductsStorage.getState().updateProduct;

  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: ProductFormData }) => {
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('No internet connection');
      }

      const payload = productFormToPayloadAdapter(form);

      // Si hay conexión, actualizar en el servidor
      const result = await productService.update(id, payload);
      if (result instanceof Error) {
        throw result;
      }

      // Actualizar también en storage local
      updateProduct(id, result);
      return result;
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
  // Storage
  const { show } = useAppStorage(s => s.toast);
  const deleteProduct = useProductsStorage.getState().deleteProduct;

  return useMutation({
    mutationFn: async (id: string) => {
      const connected = getIsConnected();
      if (!connected) {
        throw new Error('No internet connection');
      }

      // Si hay conexión, eliminar del servidor
      const result = await productService.delete(id);
      if (result instanceof Error) {
        throw result;
      }

      // Eliminar también del storage local
      deleteProduct(id);
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
