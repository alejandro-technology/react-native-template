import { User } from '@modules/users/domain/user.model';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export enum UsersRoutes {
  UserList = 'UserList',
  UserDetail = 'UserDetail',
  UserForm = 'UserForm',
}

export type UsersStackParamList = {
  [UsersRoutes.UserList]: undefined;
  [UsersRoutes.UserDetail]: { userId: string };
  [UsersRoutes.UserForm]?: { user: User };
};

export type UsersScreenProps<T extends keyof UsersStackParamList> =
  NativeStackScreenProps<UsersStackParamList, T>;
