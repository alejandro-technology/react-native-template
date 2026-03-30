import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import firestoreService from '../infrastructure/firestore.service';
import type {
  CreateDocumentPayload,
  FirestoreCollection,
  FirestoreDocument,
  ListDocumentsPayload,
  UpdateDocumentPayload,
} from '../domain/firestore/firestore.repository';

interface CreateParams<T> {
  payload: CreateDocumentPayload<T>;
}

interface UpdateParams<T> {
  payload: UpdateDocumentPayload<T>;
}

interface DeleteParams {
  collection: string;
  id: string;
}

interface ListParams {
  collection: string;
  where?: ListDocumentsPayload['where'];
  orderBy?: ListDocumentsPayload['orderBy'];
  limit?: number;
  startAfter?: ListDocumentsPayload['startAfter'];
}

export function useCreateDocument<T>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload }: CreateParams<T>) => {
      const result = await firestoreService.create<T>(payload);
      if (result instanceof Error) {
        throw result;
      }
      return result as FirestoreDocument<T>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firestore'] });
    },
  });
}

export function useGetDocument<T>(
  collection: string,
  id: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['firestore', 'document', collection, id],
    queryFn: async () => {
      const result = await firestoreService.get<T>({ collection, id });
      if (result instanceof Error) {
        throw result;
      }
      return result as FirestoreDocument<T>;
    },
    enabled,
  });
}

export function useUpdateDocument<T>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload }: UpdateParams<T>) => {
      const result = await firestoreService.update<T>(payload);
      if (result instanceof Error) {
        throw result;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'firestore',
          'document',
          variables.payload.collection,
          variables.payload.id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['firestore', 'list', variables.payload.collection],
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collection, id }: DeleteParams) => {
      const result = await firestoreService.delete({ collection, id });
      if (result instanceof Error) {
        throw result;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['firestore', 'document', variables.collection, variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['firestore', 'list', variables.collection],
      });
    },
  });
}

export function useListDocuments<T>(params: ListParams, enabled = true) {
  const { collection, where, orderBy, limit, startAfter } = params;

  return useQuery({
    queryKey: [
      'firestore',
      'list',
      collection,
      where,
      orderBy,
      limit,
      startAfter,
    ],
    queryFn: async () => {
      const result = await firestoreService.list<T>({
        collection,
        where,
        orderBy,
        limit,
        startAfter,
      });
      if (result instanceof Error) {
        throw result;
      }
      return result as FirestoreCollection<T>;
    },
    enabled,
  });
}
