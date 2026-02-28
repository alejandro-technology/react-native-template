import {
  CreateUserPayload,
  UserEntity,
  UserFilter,
  UpdateUserPayload,
} from './user.model';

export type { UserFilter };
export interface UserRepository {
  getAll(filter?: UserFilter): Promise<UserEntity[] | Error>;
  getById(id: string): Promise<UserEntity | Error>;
  create(data: CreateUserPayload): Promise<UserEntity | Error>;
  update(id: string, data: UpdateUserPayload): Promise<UserEntity | Error>;
  delete(id: string): Promise<void | Error>;
}
