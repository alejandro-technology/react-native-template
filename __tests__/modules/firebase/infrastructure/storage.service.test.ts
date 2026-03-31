jest.mock('@react-native-firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn((_, path) => ({ path })),
  putFile: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
  list: jest.fn(),
  getMetadata: jest.fn(),
}));

import {
  getStorage,
  ref,
  putFile,
  getDownloadURL,
  deleteObject,
  list,
  getMetadata,
} from '@react-native-firebase/storage';
import firebaseStorageService from '../../../../src/modules/firebase/infrastructure/storage.service';
import { manageFirebaseError } from '../../../../src/modules/firebase/domain/firebase.error';

jest.mock('../../../../src/modules/firebase/domain/firebase.error', () => ({
  manageFirebaseError: jest.fn((error: unknown) => new Error(String(error))),
}));

const mockStorage = {};

(getStorage as jest.Mock).mockReturnValue(mockStorage);

describe('FirebaseStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload file and return result', async () => {
      const mockSnapshot = {
        metadata: {
          fullPath: 'uploads/test.jpg',
          name: 'test.jpg',
          size: 1024,
          contentType: 'image/jpeg',
          timeCreated: '2024-01-01T00:00:00.000Z',
          updated: '2024-01-01T00:00:00.000Z',
          downloadTokens: 'token-123',
        },
      };
      const mockUrl = 'https://firebase.com/uploads/test.jpg';

      // Create a mock task that behaves like a promise
      const mockTask = Object.assign(Promise.resolve(mockSnapshot), {
        on: jest.fn(),
      });

      (putFile as jest.Mock).mockReturnValue(mockTask);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockUrl);

      const file = { uri: 'file:///local/path/test.jpg' };
      const result = await firebaseStorageService.upload('uploads/test.jpg', file);

      expect(putFile).toHaveBeenCalled();
      expect(result).toEqual({
        path: 'uploads/test.jpg',
        url: mockUrl,
        metadata: expect.objectContaining({
          fullPath: 'uploads/test.jpg',
        }),
      });
    });

    it('should track upload progress', async () => {
      const mockSnapshot = {
        metadata: {
          fullPath: 'uploads/test.jpg',
          name: 'test.jpg',
          size: 1000,
          contentType: 'image/jpeg',
          timeCreated: '2024-01-01T00:00:00.000Z',
          updated: '2024-01-01T00:00:00.000Z',
          downloadTokens: 'token-123',
        },
      };
      const progressCallback = jest.fn();
      
      const mockTask = Object.assign(Promise.resolve(mockSnapshot), {
        on: jest.fn((event, callback) => {
          callback({ bytesTransferred: 500, totalBytes: 1000 });
        }),
      });

      (putFile as jest.Mock).mockReturnValue(mockTask);
      (getDownloadURL as jest.Mock).mockResolvedValue('https://firebase.com/uploads/test.jpg');

      const file = { uri: 'file:///local/path/test.jpg' };
      await firebaseStorageService.upload('uploads/test.jpg', file, {
        onProgress: progressCallback,
      });

      expect(progressCallback).toHaveBeenCalledWith(50);
    });

    it('should return error when upload fails', async () => {
      const error = new Error('Upload failed');
      const mockTask = Object.assign(Promise.reject(error), {
        on: jest.fn(),
      });

      (putFile as jest.Mock).mockReturnValue(mockTask);

      const file = { uri: 'file:///local/path/test.jpg' };
      const result = await firebaseStorageService.upload('uploads/test.jpg', file);

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('getDownloadURL', () => {
    it('should get download URL for file', async () => {
      const mockUrl = 'https://firebase.com/downloads/file.jpg';
      (getDownloadURL as jest.Mock).mockResolvedValue(mockUrl);

      const result = await firebaseStorageService.getDownloadURL('uploads/file.jpg');

      expect(getDownloadURL).toHaveBeenCalled();
      expect(result).toBe(mockUrl);
    });

    it('should return error when getDownloadURL fails', async () => {
      const error = new Error('URL not found');
      (getDownloadURL as jest.Mock).mockRejectedValue(error);

      const result = await firebaseStorageService.getDownloadURL('uploads/missing.jpg');

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('delete', () => {
    it('should delete file', async () => {
      (deleteObject as jest.Mock).mockResolvedValue(undefined);

      const result = await firebaseStorageService.delete('uploads/file.jpg');

      expect(deleteObject).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return error when delete fails', async () => {
      const error = new Error('Delete failed');
      (deleteObject as jest.Mock).mockRejectedValue(error);

      const result = await firebaseStorageService.delete('uploads/file.jpg');

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('list', () => {
    it('should list files in directory', async () => {
      const mockItems = [{ path: 'uploads/file1.jpg' }, { path: 'uploads/file2.jpg' }];
      const mockResult = { items: mockItems };
      const mockMetadata = [
        {
          fullPath: 'uploads/file1.jpg',
          name: 'file1.jpg',
          size: 1024,
          contentType: 'image/jpeg',
          timeCreated: '2024-01-01T00:00:00.000Z',
          updated: '2024-01-01T00:00:00.000Z',
          downloadTokens: 'token-1',
        },
        {
          fullPath: 'uploads/file2.jpg',
          name: 'file2.jpg',
          size: 2048,
          contentType: 'image/jpeg',
          timeCreated: '2024-01-01T00:00:00.000Z',
          updated: '2024-01-01T00:00:00.000Z',
          downloadTokens: 'token-2',
        },
      ];

      (list as jest.Mock).mockResolvedValue(mockResult);
      (getMetadata as jest.Mock)
        .mockResolvedValueOnce(mockMetadata[0])
        .mockResolvedValueOnce(mockMetadata[1]);

      const result = await firebaseStorageService.list('uploads');

      expect(list).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should list files with options', async () => {
      const mockResult = { items: [] };

      (list as jest.Mock).mockResolvedValue(mockResult);

      await firebaseStorageService.list('uploads', {
        maxResults: 10,
        pageToken: 'token-123',
      });

      expect(list).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          maxResults: 10,
          pageToken: 'token-123',
        }),
      );
    });

    it('should return error when list fails', async () => {
      const error = new Error('List failed');
      (list as jest.Mock).mockRejectedValue(error);

      const result = await firebaseStorageService.list('uploads');

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('getMetadata', () => {
    it('should get metadata for file', async () => {
      const mockMetadata = {
        fullPath: 'uploads/file.jpg',
        name: 'file.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        timeCreated: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-01T00:00:00.000Z',
        downloadTokens: 'token-123',
      };

      (getMetadata as jest.Mock).mockResolvedValue(mockMetadata);

      const result = await firebaseStorageService.getMetadata('uploads/file.jpg');

      expect(getMetadata).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          fullPath: 'uploads/file.jpg',
          name: 'file.jpg',
        }),
      );
    });

    it('should return error when getMetadata fails', async () => {
      const error = new Error('Metadata not found');
      (getMetadata as jest.Mock).mockRejectedValue(error);

      const result = await firebaseStorageService.getMetadata('uploads/missing.jpg');

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });
});
