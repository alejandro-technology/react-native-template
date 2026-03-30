import { Timestamp } from '@react-native-firebase/firestore';
// Firebase
import { firestoreService } from '@modules/firebase';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { firestoreCollectionAdapter } from '@modules/firebase/domain/firestore/firestore.adapter';
// Domain
import type {
  CreateUserPayload,
  UserEntity,
  UserFilter,
  UpdateUserPayload,
  UserFirebase,
} from '../domain/user.model';
import { UserRepository } from '../domain/user.repository';
// Config
import { COLLECTIONS } from '@config/collections.routes';

class UserFirebaseService implements UserRepository {
  async getAll(filter?: UserFilter): Promise<UserEntity[] | Error> {
    try {
      const result = await firestoreService.list<UserFirebase>({
        collection: COLLECTIONS.USERS,
      });
      if (result instanceof Error) {
        return result;
      }

      const users = firestoreCollectionAdapter<UserEntity>(result.docs);

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

  async getById(id: string): Promise<UserEntity | Error> {
    try {
      const result = await firestoreService.get<Omit<UserEntity, 'id'>>({
        collection: COLLECTIONS.USERS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('Usuario no encontrado');
      }

      const userEntity: UserEntity = {
        id,
        ...result.data,
      };
      return userEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: CreateUserPayload): Promise<UserEntity | Error> {
    try {
      const now = new Date();
      const result = await firestoreService.create<Omit<UserEntity, 'id'>>({
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

      return {
        id: result.id,
        ...(result.data as Omit<UserEntity, 'id'>),
      } as UserEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(
    id: string,
    data: UpdateUserPayload,
  ): Promise<UserEntity | Error> {
    try {
      const now = new Date();

      const updateResult = await firestoreService.update<
        Omit<UserEntity, 'id'>
      >({
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

      const result = await firestoreService.get<Omit<UserEntity, 'id'>>({
        collection: COLLECTIONS.USERS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('Usuario no encontrado');
      }

      const userEntity: UserEntity = {
        id,
        ...result.data,
      };
      return userEntity;
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
