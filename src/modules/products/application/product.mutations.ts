import { useMutation, useQueryClient } from '@tanstack/react-query';
// Domain
import { productFormToPayloadAdapter } from '../domain/product.adapter';
import { ProductFormData } from '../domain/product.scheme';
// Module
import { useProductsStorage } from './products.storage';
import productService from '../infrastructure/product.service';
// Core
import { useAppStorage } from '@modules/core/application/app.storage';
import { useConnectivityStore } from '@modules/core/application/connectivity.storage';
// Config
import { QUERY_KEYS } from '@config/query.keys';

export function useProductCreate() {
  const queryClient = useQueryClient();
  // Storage
  const { addProduct } = useProductsStorage();
  const { show } = useAppStorage(s => s.toast);
  const { isConnected } = useConnectivityStore();

  return useMutation({
    mutationFn: async (form: ProductFormData) => {
      const payload = productFormToPayloadAdapter(form);

      if (!isConnected) {
        show({
          message: 'Sin conexión a internet.',
          type: 'info',
        });

        return;
      }

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
  const { isConnected } = useConnectivityStore();
  const { updateProduct } = useProductsStorage();

  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: ProductFormData }) => {
      const payload = productFormToPayloadAdapter(form);

      if (!isConnected) {
        show({
          message: 'Sin conexión a internet.',
          type: 'info',
        });
        return;
      }

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
  const { isConnected } = useConnectivityStore();
  const { deleteProduct } = useProductsStorage();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isConnected) {
        show({
          message: 'Sin conexión a internet.',
          type: 'info',
        });
        return;
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
