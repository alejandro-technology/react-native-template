import {
  CreateUserPayload,
  User,
  UserFilter,
  UpdateUserPayload,
} from './user.model';

export type { UserFilter };
export interface UserRepository {
  getAll(filter?: UserFilter): Promise<User[] | Error>;
  getById(id: string): Promise<User | Error>;
  create(data: CreateUserPayload): Promise<User | Error>;
  update(id: string, data: UpdateUserPayload): Promise<User | Error>;
  delete(id: string): Promise<void | Error>;
}
