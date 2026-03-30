import type { Timestamp } from '@react-native-firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface UserFilter {
  searchText?: string;
}

// Only need for Firebase, as the rest of the app should work with the Product interface
export interface UserEntity extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserFirebase extends Omit<UserEntity, 'id'> {}
