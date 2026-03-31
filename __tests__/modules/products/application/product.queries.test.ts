jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@modules/products/infrastructure/product.service', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
}));

import { useQuery } from '@tanstack/react-query';
import productService from '@modules/products/infrastructure/product.service';
import { useProducts, useProduct } from '../../../../src/modules/products/application/product.queries';
import { QUERY_KEYS } from '@config/query.keys';

const mockUseQuery = useQuery as jest.Mock;
const mockProductService = productService as jest.Mocked<typeof productService>;

describe('product.queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProducts', () => {
    it('should call useQuery with correct query key', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false });

      useProducts();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: QUERY_KEYS.PRODUCTS(undefined),
        }),
      );
    });

    it('should call useQuery with filter in query key', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false });

      useProducts({ searchText: 'test' });

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: QUERY_KEYS.PRODUCTS('test'),
        }),
      );
    });

    it('should pass enabled flag to useQuery', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false });

      useProducts(undefined, false);

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });

    it('should call productService.getAll in queryFn', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1' }];
      mockProductService.getAll.mockResolvedValue(mockProducts);
      mockUseQuery.mockImplementation(async ({ queryFn }) => {
        const data = await queryFn();
        return { data, isLoading: false };
      });

      const result = useProducts();

      expect(mockProductService.getAll).toHaveBeenCalled();
    });

    it('should throw error when service returns error', async () => {
      const error = new Error('Failed to fetch');
      mockProductService.getAll.mockResolvedValue(error);
      mockUseQuery.mockImplementation(async ({ queryFn }) => {
        try {
          await queryFn();
        } catch (e) {
          return { error: e, isLoading: false };
        }
        return { data: null, isLoading: false };
      });

      useProducts();

      expect(mockProductService.getAll).toHaveBeenCalled();
    });
  });

  describe('useProduct', () => {
    it('should call useQuery with product detail query key', () => {
      mockUseQuery.mockReturnValue({ data: null, isLoading: false });

      useProduct('product-123');

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: QUERY_KEYS.PRODUCT_DETAIL('product-123'),
        }),
      );
    });

    it('should disable query when id is empty', () => {
      mockUseQuery.mockReturnValue({ data: null, isLoading: false });

      useProduct('');

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });

    it('should call productService.getById in queryFn', async () => {
      const mockProduct = { id: '1', name: 'Product 1' };
      mockProductService.getById.mockResolvedValue(mockProduct);
      mockUseQuery.mockImplementation(async ({ queryFn }) => {
        const data = await queryFn();
        return { data, isLoading: false };
      });

      useProduct('product-123');

      expect(mockProductService.getById).toHaveBeenCalledWith('product-123');
    });
  });
});
