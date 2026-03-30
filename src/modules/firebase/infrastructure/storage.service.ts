import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  getStorage,
  list,
  putFile,
  ref,
} from '@react-native-firebase/storage';
import { manageFirebaseError } from '../domain/firebase.error';
import type { StorageRepository } from '../domain/storage/storage.repository';
import type {
  File,
  FileMetadata,
  ListOptions,
  UploadOptions,
  UploadResult,
} from '../domain/storage/storage.model';
import { adaptFirebaseMetadata } from '../domain/storage/storage.adapter';

class FirebaseStorageService implements StorageRepository {
  private storage = getStorage();

  async upload(
    path: string,
    file: File,
    options?: UploadOptions,
  ): Promise<UploadResult | Error> {
    try {
      const storageRef = ref(this.storage, path);
      const task = putFile(storageRef, file.uri, {
        contentType: options?.contentType,
        customMetadata: options?.customMetadata,
        cacheControl: options?.cacheControl,
      });

      if (options?.onProgress) {
        task.on('state_changed', snapshot => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress!(progress);
        });
      }

      const snapshot = await task;
      const url = await getDownloadURL(storageRef);

      return {
        path: snapshot.metadata.fullPath,
        url,
        metadata: adaptFirebaseMetadata(snapshot.metadata),
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getDownloadURL(path: string): Promise<string | Error> {
    try {
      const url = await getDownloadURL(ref(this.storage, path));
      return url;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(path: string): Promise<void | Error> {
    try {
      await deleteObject(ref(this.storage, path));
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async list(
    path: string,
    options?: ListOptions,
  ): Promise<FileMetadata[] | Error> {
    try {
      const storageRef = ref(this.storage, path);
      const result = await list(storageRef, {
        maxResults: options?.maxResults,
        pageToken: options?.pageToken,
      });

      const metadata = await Promise.all(
        result.items.map(item => getMetadata(item)),
      );

      return metadata.map(adaptFirebaseMetadata);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getMetadata(path: string): Promise<FileMetadata | Error> {
    try {
      const metadata = await getMetadata(ref(this.storage, path));
      return adaptFirebaseMetadata(metadata);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function createFirebaseStorageService(): StorageRepository {
  return new FirebaseStorageService();
}

export default createFirebaseStorageService();
