import { Timestamp } from '@react-native-firebase/firestore';
// Firebase
import { firestoreService } from '@modules/firebase';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { firestoreCollectionAdapter } from '@modules/firebase/domain/firestore/firestore.adapter';
// Domain
import type {
  CreateUserPayload,
  User,
  UserFilter,
  UpdateUserPayload,
} from '../domain/user.model';
import { UserRepository } from '../domain/user.repository';
// Config
import { COLLECTIONS } from '@config/collections.routes';

interface UserFirebaseDoc {
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface UserFirebaseEntity extends UserFirebaseDoc {
  id: string;
}

function toUser(entity: UserFirebaseEntity): User {
  return {
    ...entity,
    createdAt: new Date(entity.createdAt.seconds * 1000),
    updatedAt: new Date(entity.updatedAt.seconds * 1000),
  };
}

class UserFirebaseService implements UserRepository {
  async getAll(filter?: UserFilter): Promise<User[] | Error> {
    try {
      // NOTE: Firestore doesn't support full-text search or OR queries across multiple fields.
      // For production apps requiring search, consider integrating Algolia or a similar service.
      // The current approach uses client-side filtering which works for small datasets.
      // We apply a limit to prevent downloading excessive data.
      const result = await firestoreService.list<UserFirebaseDoc>({
        collection: COLLECTIONS.USERS,
        limit: 100, // Prevent excessive reads
      });
      if (result instanceof Error) {
        return result;
      }

      const entities = firestoreCollectionAdapter<UserFirebaseDoc>(result.docs);
      const users = entities.map(toUser);

      if (filter?.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        return users.filter(
          u =>
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower) ||
            u.phone.toLowerCase().includes(searchLower) ||
            u.role.toLowerCase().includes(searchLower) ||
            u.id.toLowerCase().includes(searchLower),
        );
      }

      return users;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getById(id: string): Promise<User | Error> {
    try {
      const result = await firestoreService.get<UserFirebaseDoc>({
        collection: COLLECTIONS.USERS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('Usuario no encontrado');
      }

      return toUser({ id, ...result.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: CreateUserPayload): Promise<User | Error> {
    try {
      const now = new Date();
      const result = await firestoreService.create<UserFirebaseDoc>({
        collection: COLLECTIONS.USERS,
        data: {
          ...data,
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        },
      });
      if (result instanceof Error) {
        return result;
      }

      if (!result.data) {
        return new Error('No se pudo crear el usuario');
      }

      return toUser({ id: result.id, ...result.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(id: string, data: UpdateUserPayload): Promise<User | Error> {
    try {
      const now = new Date();

      const updateResult = await firestoreService.update<UserFirebaseDoc>({
        collection: COLLECTIONS.USERS,
        id,
        data: {
          ...data,
          updatedAt: Timestamp.fromDate(now),
        },
      });
      if (updateResult instanceof Error) {
        return updateResult;
      }

      const result = await firestoreService.get<UserFirebaseDoc>({
        collection: COLLECTIONS.USERS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('Usuario no encontrado');
      }

      return toUser({ id: result.id, ...result.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const result = await firestoreService.delete({
        collection: COLLECTIONS.USERS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function createUserFirebaseService(): UserRepository {
  return new UserFirebaseService();
}

export default createUserFirebaseService();
