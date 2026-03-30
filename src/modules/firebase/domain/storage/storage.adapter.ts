import type { FileMetadata } from './storage.model';

export function adaptFirebaseMetadata(metadata: {
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
}): FileMetadata {
  return {
    name: metadata.name,
    bucket: metadata.bucket,
    generation: metadata.generation,
    metageneration: metadata.metageneration,
    fullPath: metadata.fullPath,
    size: metadata.size,
    contentType: metadata.contentType,
    timeCreated: metadata.timeCreated,
    updated: metadata.updated,
    md5Hash: metadata.md5Hash,
  };
}
