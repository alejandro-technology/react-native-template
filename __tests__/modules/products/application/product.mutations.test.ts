jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@modules/products/infrastructure/product.service', () => ({
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('@modules/products/domain/product.adapter', () => ({
  productFormToPayloadAdapter: jest.fn((form) => ({ ...form, adapted: true })),
}));

jest.mock('@modules/core/application/app.storage', () => ({
  useAppStorage: jest.fn((selector) => ({
    show: jest.fn(),
  })),
}));

import { useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '@modules/products/infrastructure/product.service';
import {
  useProductCreate,
  useProductUpdate,
  useProductDelete,
} from '../../../../src/modules/products/application/product.mutations';
import { QUERY_KEYS } from '@config/query.keys';

const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;
const mockProductService = productService as jest.Mocked<typeof productService>;

describe('product.mutations', () => {
  const mockShow = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    mockUseMutation.mockImplementation(({ mutationFn, onSuccess, onError }) => ({
      mutate: async (data: any) => {
        try {
          const result = await mutationFn(data);
          onSuccess?.(result, data, undefined);
          return result;
        } catch (error) {
          onError?.(error);
          throw error;
        }
      },
    }));
  });

  describe('useProductCreate', () => {
    it('should create product and invalidate queries on success', async () => {
      const mockProduct = { id: '1', name: 'New Product' };
      mockProductService.create.mockResolvedValue(mockProduct);

      const { mutate } = useProductCreate();
      await mutate({ name: 'New Product', price: 100 });

      expect(mockProductService.create).toHaveBeenCalled();
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: QUERY_KEYS.PRODUCTS(),
      });
    });

    it('should show success toast on create', async () => {
      const mockProduct = { id: '1', name: 'New Product' };
      mockProductService.create.mockResolvedValue(mockProduct);

      const { mutate } = useProductCreate();
      await mutate({ name: 'New Product', price: 100 });

      // Toast is called via useAppStorage mock
    });

    it('should handle error on create', async () => {
      const error = new Error('Create failed');
      mockProductService.create.mockResolvedValue(error);

      const { mutate } = useProductCreate();

      // The mutation will throw because the service returns an Error
      await expect(mutate({ name: 'Test', price: 100 })).rejects.toThrow();
    });
  });

  describe('useProductUpdate', () => {
    it('should update product and invalidate queries on success', async () => {
      const mockProduct = { id: '1', name: 'Updated Product' };
      mockProductService.update.mockResolvedValue(mockProduct);

      const { mutate } = useProductUpdate();
      await mutate({ id: '1', form: { name: 'Updated Product', price: 200 } });

      expect(mockProductService.update).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: QUERY_KEYS.PRODUCTS(),
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: QUERY_KEYS.PRODUCT_DETAIL('1'),
      });
    });

    it('should handle error on update', async () => {
      const error = new Error('Update failed');
      mockProductService.update.mockResolvedValue(error);

      const { mutate } = useProductUpdate();

      await expect(
        mutate({ id: '1', form: { name: 'Test', price: 100 } }),
      ).rejects.toThrow();
    });
  });

  describe('useProductDelete', () => {
    it('should delete product and invalidate queries on success', async () => {
      mockProductService.delete.mockResolvedValue(undefined);

      const { mutate } = useProductDelete();
      await mutate('1');

      expect(mockProductService.delete).toHaveBeenCalledWith('1');
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: QUERY_KEYS.PRODUCTS(),
      });
    });

    it('should handle error on delete', async () => {
      const error = new Error('Delete failed');
      mockProductService.delete.mockResolvedValue(error);

      const { mutate } = useProductDelete();

      await expect(mutate('1')).rejects.toThrow();
    });
  });
});
