import { FirebaseStorageTypes } from '@react-native-firebase/storage';
import type { FileMetadata } from './storage.model';

export function storageMetadataAdapter(
  metadata: FirebaseStorageTypes.FullMetadata,
): FileMetadata {
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
