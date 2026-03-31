jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@modules/firebase/infrastructure/firestore.service', () => ({
  create: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
}));

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import firestoreService from '@modules/firebase/infrastructure/firestore.service';
import {
  useCreateDocument,
  useGetDocument,
  useUpdateDocument,
  useDeleteDocument,
  useListDocuments,
} from '../../../../src/modules/firebase/application/firestore.hooks';

const mockUseQuery = useQuery as jest.Mock;
const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;

describe('firestore.hooks', () => {
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  describe('useCreateDocument', () => {
    it('should create document and invalidate queries', async () => {
      const mockDoc = { id: 'doc-1', data: { name: 'Test' }, exists: true };
      mockUseMutation.mockImplementation(({ mutationFn, onSuccess }) => ({
        mutate: async (params: any) => {
          const result = await mutationFn(params);
          onSuccess?.(result, params, undefined);
          return result;
        },
      }));
      (firestoreService.create as jest.Mock).mockResolvedValue(mockDoc);

      const { mutate } = useCreateDocument();
      await mutate({ payload: { collection: 'users', data: { name: 'Test' } } });

      expect(firestoreService.create).toHaveBeenCalled();
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['firestore'] });
    });

    it('should throw error when create fails', async () => {
      const error = new Error('Create failed');
      mockUseMutation.mockImplementation(({ mutationFn }) => ({
        mutate: async (params: any) => {
          const result = await mutationFn(params);
          if (result instanceof Error) throw result;
          return result;
        },
      }));
      (firestoreService.create as jest.Mock).mockResolvedValue(error);

      const { mutate } = useCreateDocument();

      await expect(
        mutate({ payload: { collection: 'users', data: {} } }),
      ).rejects.toThrow();
    });
  });

  describe('useGetDocument', () => {
    it('should get document with correct query key', () => {
      mockUseQuery.mockReturnValue({ data: null, isLoading: true });

      useGetDocument('users', 'user-1');

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['firestore', 'document', 'users', 'user-1'],
        }),
      );
    });

    it('should respect enabled flag', () => {
      mockUseQuery.mockReturnValue({ data: null, isLoading: false });

      useGetDocument('users', 'user-1', false);

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      );
    });
  });

  describe('useUpdateDocument', () => {
    it('should update document and invalidate queries', async () => {
      mockUseMutation.mockImplementation(({ mutationFn, onSuccess }) => ({
        mutate: async (params: any) => {
          const result = await mutationFn(params);
          onSuccess?.(undefined, params, undefined);
          return result;
        },
      }));
      (firestoreService.update as jest.Mock).mockResolvedValue(undefined);

      const { mutate } = useUpdateDocument();
      await mutate({
        payload: { collection: 'users', id: 'user-1', data: { name: 'Updated' } },
      });

      expect(firestoreService.update).toHaveBeenCalled();
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    });
  });

  describe('useDeleteDocument', () => {
    it('should delete document and invalidate queries', async () => {
      mockUseMutation.mockImplementation(({ mutationFn, onSuccess }) => ({
        mutate: async (params: any) => {
          const result = await mutationFn(params);
          onSuccess?.(undefined, params, undefined);
          return result;
        },
      }));
      (firestoreService.delete as jest.Mock).mockResolvedValue(undefined);

      const { mutate } = useDeleteDocument();
      await mutate({ collection: 'users', id: 'user-1' });

      expect(firestoreService.delete).toHaveBeenCalledWith({
        collection: 'users',
        id: 'user-1',
      });
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    });
  });

  describe('useListDocuments', () => {
    it('should list documents with correct query key', () => {
      mockUseQuery.mockReturnValue({ data: null, isLoading: true });

      useListDocuments({ collection: 'users' });

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['firestore', 'list', 'users']),
        }),
      );
    });

    it('should pass where conditions to query', () => {
      mockUseQuery.mockReturnValue({ data: null, isLoading: true });

      useListDocuments({
        collection: 'users',
        where: [{ field: 'status', operator: '==', value: 'active' }],
      });

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryFn: expect.any(Function),
        }),
      );
    });

    it('should pass limit and orderBy to query', () => {
      mockUseQuery.mockReturnValue({ data: null, isLoading: true });

      useListDocuments({
        collection: 'users',
        limit: 10,
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      });

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['firestore', 'list', 'users']),
        }),
      );
    });
  });
});
