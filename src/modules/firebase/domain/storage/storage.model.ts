export interface FileMetadata {
  name: string;
  bucket: string;
  generation: string;
  metageneration: string;
  fullPath: string;
  size: number;
  contentType?: string | null;
  timeCreated: string;
  updated: string;
  md5Hash: string | null;
}

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  customMetadata?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  path: string;
  url: string;
  metadata: FileMetadata;
}

export interface ListOptions {
  maxResults?: number;
  pageToken?: string;
}

export interface File {
  uri: string;
}

export interface StorageRepository {
  upload(
    path: string,
    file: File,
    options?: UploadOptions,
  ): Promise<UploadResult | Error>;
  getDownloadURL(path: string): Promise<string | Error>;
  delete(path: string): Promise<void | Error>;
  list(path: string, options?: ListOptions): Promise<FileMetadata[] | Error>;
  getMetadata(path: string): Promise<FileMetadata | Error>;
}
