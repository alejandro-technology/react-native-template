import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
// Config
import { mmkvStorage, mmkvReviver } from '@config/storage';
// Domain
import type { Product, ProductFilter } from '../domain/product.model';

interface ProductsState {
  // Estado
  products: Product[];

  // CRUD Operations
  addProduct: (product: Product) => void;
  getProducts: (filter?: ProductFilter) => Product[];
  getProductById: (id: string) => Product | undefined;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  clearProducts: () => void;
}

const initialState = {
  products: [],
};

export const useProductsStorage = create<ProductsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Create
      addProduct: (product: Product) =>
        set(state => ({
          products: [...state.products, product],
        })),

      // Read (all)
      getProducts: filter => {
        let products = get().products;

        if (filter?.searchText) {
          products = products.filter(p =>
            p.name.toLowerCase().includes(filter.searchText!.toLowerCase()),
          );
        }

        return products;
      },

      // Read (by id)
      getProductById: (id: string) => {
        return get().products.find(product => product.id === id);
      },

      // Update
      updateProduct: (id: string, updates: Partial<Product>) =>
        set(state => ({
          products: state.products.map(product =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date() }
              : product,
          ),
        })),

      // Delete
      deleteProduct: (id: string) =>
        set(state => ({
          products: state.products.filter(product => product.id !== id),
        })),

      // Clear all
      clearProducts: () => set({ products: [] }),
    }),
    {
      name: 'products-storage',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: state => ({
        products: state.products,
      }),
      onRehydrateStorage: () => state => {
        if (state?.products) {
          // Revivir fechas en productos
          state.products = state.products.map(product => ({
            ...product,
            createdAt: mmkvReviver('createdAt', product.createdAt) as Date,
            updatedAt: mmkvReviver('updatedAt', product.updatedAt) as Date,
          }));
        }
      },
    },
  ),
);
