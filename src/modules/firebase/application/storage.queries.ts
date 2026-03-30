import { useQuery } from '@tanstack/react-query';
import storageService from '../infrastructure/storage.service';
import type {
  ListOptions,
  FileMetadata,
} from '../domain/storage/storage.repository';

interface UseListFilesParams {
  path: string;
  options?: ListOptions;
  enabled?: boolean;
}

interface UseGetMetadataParams {
  path: string;
  enabled?: boolean;
}

interface UseGetDownloadURLParams {
  path: string;
  enabled?: boolean;
}

export function useListFiles({
  path,
  options,
  enabled = true,
}: UseListFilesParams) {
  return useQuery({
    queryKey: ['firebase', 'list', path, options?.pageToken],
    queryFn: async () => {
      const result = await storageService.list(path, options);
      if (result instanceof Error) {
        throw result;
      }
      return result as FileMetadata[];
    },
    enabled,
  });
}

export function useGetMetadata({ path, enabled = true }: UseGetMetadataParams) {
  return useQuery({
    queryKey: ['firebase', 'metadata', path],
    queryFn: async () => {
      const result = await storageService.getMetadata(path);
      if (result instanceof Error) {
        throw result;
      }
      return result as FileMetadata;
    },
    enabled,
  });
}

export function useGetDownloadURL({
  path,
  enabled = true,
}: UseGetDownloadURLParams) {
  return useQuery({
    queryKey: ['firebase', 'downloadUrl', path],
    queryFn: async () => {
      const result = await storageService.getDownloadURL(path);
      if (result instanceof Error) {
        throw result;
      }
      return result as string;
    },
    enabled,
  });
}
