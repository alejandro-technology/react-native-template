import firestore from '@react-native-firebase/firestore';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { UserRepository } from '../domain/user.repository';
import type {
  CreateUserPayload,
  UserEntity,
  UserFilter,
  UpdateUserPayload,
} from '../domain/user.model';
import { COLLECTIONS } from '@config/collections.routes';

class UserService implements UserRepository {
  private firestore = firestore();

  async getAll(filter?: UserFilter): Promise<UserEntity[] | Error> {
    try {
      const snapshot = await this.firestore.collection(COLLECTIONS.USERS).get();

      let users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as UserEntity[];

      if (filter?.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        users = users.filter(
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
      const docRef = this.firestore.collection(COLLECTIONS.USERS).doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return new Error('Usuario no encontrado');
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as UserEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: CreateUserPayload): Promise<UserEntity | Error> {
    try {
      const now = new Date().toISOString();
      const docRef = await this.firestore.collection(COLLECTIONS.USERS).add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      const snapshot = await docRef.get();

      return {
        id: snapshot.id,
        ...snapshot.data(),
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
      const docRef = this.firestore.collection(COLLECTIONS.USERS).doc(id);
      const now = new Date().toISOString();

      await docRef.update({
        ...data,
        updatedAt: now,
      });

      const snapshot = await docRef.get();

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as UserEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.USERS).doc(id);
      await docRef.delete();
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function createUserService(): UserRepository {
  return new UserService();
}

export default createUserService();
