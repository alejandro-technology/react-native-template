import { Timestamp } from '@react-native-firebase/firestore';
// Firebase
import { firestoreService } from '@modules/firebase';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { firestoreCollectionAdapter } from '@modules/firebase/domain/firestore/firestore.adapter';
import storageService from '@modules/firebase/infrastructure/storage.service';
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
  avatar?: string;
  termsAccepted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface UserFirebaseEntity extends UserFirebaseDoc {
  id: string;
}

function toUser(entity: UserFirebaseEntity): User {
  return {
    ...entity,
    avatar: entity.avatar ?? undefined,
    termsAccepted: entity.termsAccepted ?? false,
    createdAt: new Date(entity.createdAt.seconds * 1000),
    updatedAt: new Date(entity.updatedAt.seconds * 1000),
  };
}

async function uploadAvatarIfNeeded(
  userId: string,
  avatar: string | undefined | null,
): Promise<string | undefined> {
  if (!avatar) {
    return undefined;
  }

  // If it's already a remote URL (http/https), return as-is
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }

  // Upload local file to Firebase Storage
  const path = `users/${userId}/avatars/${Date.now()}.jpg`;
  const result = await storageService.upload(
    path,
    { uri: avatar },
    {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
      customMetadata: {
        userId,
        type: 'avatar',
        uploadedAt: new Date().toISOString(),
      },
    },
  );

  if (result instanceof Error) {
    console.warn('Failed to upload avatar:', result.message);
    return undefined;
  }

  return result.url;
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

      // First create the document to get the ID
      const result = await firestoreService.create<
        Omit<UserFirebaseDoc, 'avatar'>
      >({
        collection: COLLECTIONS.USERS,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          termsAccepted: data.termsAccepted,
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

      const userId = result.id;

      // Upload avatar if provided
      if (data.avatar) {
        const avatarUrl = await uploadAvatarIfNeeded(userId, data.avatar);
        if (avatarUrl) {
          // Update document with avatar URL
          await firestoreService.update<UserFirebaseDoc>({
            collection: COLLECTIONS.USERS,
            id: userId,
            data: {
              avatar: avatarUrl,
              updatedAt: Timestamp.fromDate(now),
            },
          });
        }
      }

      // Fetch the final document
      const finalResult = await firestoreService.get<UserFirebaseDoc>({
        collection: COLLECTIONS.USERS,
        id: userId,
      });
      if (finalResult instanceof Error) {
        return finalResult;
      }
      if (!finalResult.exists || !finalResult.data) {
        return new Error('Usuario no encontrado');
      }

      return toUser({ id: userId, ...finalResult.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(id: string, data: UpdateUserPayload): Promise<User | Error> {
    try {
      const now = new Date();

      // Handle avatar update
      // - undefined: don't change
      // - null: remove avatar
      // - string (local/remote): set avatar
      let avatarUrl: string | null | undefined;
      if (data.avatar !== undefined) {
        if (data.avatar === null) {
          // Explicitly set to null to remove avatar
          avatarUrl = null;
        } else {
          // Upload if local, return as-is if remote
          avatarUrl = await uploadAvatarIfNeeded(id, data.avatar);
        }
      }

      const updateResult = await firestoreService.update<UserFirebaseDoc>({
        collection: COLLECTIONS.USERS,
        id,
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.role !== undefined && { role: data.role }),
          ...(avatarUrl !== undefined && {
            avatar: avatarUrl as string | undefined,
          }),
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
