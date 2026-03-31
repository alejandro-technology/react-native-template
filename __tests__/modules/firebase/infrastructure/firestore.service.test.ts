jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn((_, name) => `collection-${name}`),
  doc: jest.fn((ref, id) => ({ ref, id })),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn((ref, ...constraints) => ({ ref, constraints })),
  where: jest.fn((field, op, value) => ({ field, op, value })),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
  limit: jest.fn(n => ({ limit: n })),
  startAfter: jest.fn(doc => ({ startAfter: doc })),
}));

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from '@react-native-firebase/firestore';
import firestoreService from '../../../../src/modules/firebase/infrastructure/firestore.service';
import { manageFirebaseError } from '../../../../src/modules/firebase/domain/firebase.error';

jest.mock('../../../../src/modules/firebase/domain/firebase.error', () => ({
  manageFirebaseError: jest.fn((error: unknown) => new Error(String(error))),
}));

const mockFirestore = {};

(getFirestore as jest.Mock).mockReturnValue(mockFirestore);

describe('FirebaseFirestoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create document with auto-generated id', async () => {
      const mockDocRef = { id: 'doc-123' };
      const mockSnapshot = {
        id: 'doc-123',
        exists: true,
        data: jest.fn().mockReturnValue({ name: 'Test' }),
      };

      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await firestoreService.create({
        collection: 'users',
        data: { name: 'Test' },
      });

      expect(addDoc).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'doc-123',
        data: { name: 'Test' },
        exists: true,
      });
    });

    it('should create document with custom id', async () => {
      const mockSnapshot = {
        id: 'custom-id',
        exists: true,
        data: jest.fn().mockReturnValue({ name: 'Test' }),
      };

      (setDoc as jest.Mock).mockResolvedValue(undefined);
      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await firestoreService.create({
        collection: 'users',
        id: 'custom-id',
        data: { name: 'Test' },
      });

      expect(setDoc).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'custom-id',
        data: { name: 'Test' },
        exists: true,
      });
    });

    it('should return error when create fails', async () => {
      const error = new Error('Create failed');
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await firestoreService.create({
        collection: 'users',
        data: { name: 'Test' },
      });

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('get', () => {
    it('should get document by id', async () => {
      const mockSnapshot = {
        id: 'doc-123',
        exists: true,
        data: jest.fn().mockReturnValue({ name: 'Test' }),
      };

      (getDoc as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await firestoreService.get({
        collection: 'users',
        id: 'doc-123',
      });

      expect(result).toEqual({
        id: 'doc-123',
        data: { name: 'Test' },
        exists: true,
      });
    });

    it('should return error when get fails', async () => {
      const error = new Error('Get failed');
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await firestoreService.get({
        collection: 'users',
        id: 'doc-123',
      });

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('update', () => {
    it('should update document', async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await firestoreService.update({
        collection: 'users',
        id: 'doc-123',
        data: { name: 'Updated' },
      });

      expect(updateDoc).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return error when update fails', async () => {
      const error = new Error('Update failed');
      (updateDoc as jest.Mock).mockRejectedValue(error);

      const result = await firestoreService.update({
        collection: 'users',
        id: 'doc-123',
        data: { name: 'Updated' },
      });

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('delete', () => {
    it('should delete document', async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await firestoreService.delete({
        collection: 'users',
        id: 'doc-123',
      });

      expect(deleteDoc).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return error when delete fails', async () => {
      const error = new Error('Delete failed');
      (deleteDoc as jest.Mock).mockRejectedValue(error);

      const result = await firestoreService.delete({
        collection: 'users',
        id: 'doc-123',
      });

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('list', () => {
    it('should list documents with no filters', async () => {
      const mockSnapshot = {
        docs: [
          { id: 'doc-1', exists: true, data: jest.fn().mockReturnValue({ name: 'Test 1' }) },
          { id: 'doc-2', exists: true, data: jest.fn().mockReturnValue({ name: 'Test 2' }) },
        ],
        size: 2,
        empty: false,
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await firestoreService.list({
        collection: 'users',
      });

      expect(result).toEqual({
        docs: [
          { id: 'doc-1', data: { name: 'Test 1' }, exists: true },
          { id: 'doc-2', data: { name: 'Test 2' }, exists: true },
        ],
        size: 2,
        empty: false,
      });
    });

    it('should list documents with where clause', async () => {
      const mockSnapshot = {
        docs: [{ id: 'doc-1', exists: true, data: jest.fn().mockReturnValue({ status: 'active' }) }],
        size: 1,
        empty: false,
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await firestoreService.list({
        collection: 'users',
        where: [{ field: 'status', operator: '==', value: 'active' }],
      });

      expect(where).toHaveBeenCalledWith('status', '==', 'active');
      expect(result!.docs).toHaveLength(1);
    });

    it('should list documents with orderBy', async () => {
      const mockSnapshot = {
        docs: [],
        size: 0,
        empty: true,
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      await firestoreService.list({
        collection: 'users',
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      });

      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should list documents with limit', async () => {
      const mockSnapshot = {
        docs: [],
        size: 0,
        empty: true,
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      await firestoreService.list({
        collection: 'users',
        limit: 10,
      });

      expect(limit).toHaveBeenCalledWith(10);
    });

    it('should list documents with startAfter', async () => {
      const mockStartAfterSnapshot = {
        id: 'last-doc',
        exists: true,
        data: jest.fn(),
      };
      const mockSnapshot = {
        docs: [],
        size: 0,
        empty: true,
      };

      (getDoc as jest.Mock).mockResolvedValue(mockStartAfterSnapshot);
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      await firestoreService.list({
        collection: 'users',
        startAfter: 'last-doc',
      });

      expect(startAfter).toHaveBeenCalled();
    });

    it('should return error when list fails', async () => {
      const error = new Error('List failed');
      (getDocs as jest.Mock).mockRejectedValue(error);

      const result = await firestoreService.list({
        collection: 'users',
      });

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });
});
