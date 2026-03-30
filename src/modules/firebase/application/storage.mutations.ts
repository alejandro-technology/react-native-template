import { useMutation } from '@tanstack/react-query';
import storageService from '../infrastructure/storage.service';
import type {
  File,
  ListOptions,
  UploadOptions,
  UploadResult,
} from '../domain/storage/storage.repository';

interface UploadParams {
  path: string;
  file: File;
  options?: UploadOptions;
}

interface DeleteParams {
  path: string;
}

interface ListParams {
  path: string;
  options?: ListOptions;
}

interface GetMetadataParams {
  path: string;
}

interface GetDownloadURLParams {
  path: string;
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ path, file, options }: UploadParams) => {
      const result = await storageService.upload(path, file, options);
      if (result instanceof Error) {
        throw result;
      }
      return result as UploadResult;
    },
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: async ({ path }: DeleteParams) => {
      const result = await storageService.delete(path);
      if (result instanceof Error) {
        throw result;
      }
    },
  });
}

export function useListFiles() {
  return useMutation({
    mutationFn: async ({ path, options }: ListParams) => {
      const result = await storageService.list(path, options);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
  });
}

export function useGetMetadata() {
  return useMutation({
    mutationFn: async ({ path }: GetMetadataParams) => {
      const result = await storageService.getMetadata(path);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
  });
}

export function useGetDownloadURL() {
  return useMutation({
    mutationFn: async ({ path }: GetDownloadURLParams) => {
      const result = await storageService.getDownloadURL(path);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
  });
}
