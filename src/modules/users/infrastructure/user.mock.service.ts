import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserEntity,
} from '../domain/user.model';
import type { UserFilter, UserRepository } from '../domain/user.repository';

class UserMockService implements UserRepository {
  private database: UserEntity[] = [];

  async getAll(filter?: UserFilter): Promise<UserEntity[] | Error> {
    if (!filter?.searchText) {
      return this.database;
    }

    const searchText = filter.searchText.trim().toLowerCase();
    if (!searchText) {
      return this.database;
    }

    return this.database.filter(user => {
      const haystack = `${user.name} ${user.email} ${user.phone} ${user.role}`.toLowerCase();
      return haystack.includes(searchText);
    });
  }

  async getById(id: string): Promise<UserEntity | Error> {
    const user = this.database.find(item => item.id === id);
    if (!user) {
      return new Error('User not found');
    }
    return user;
  }

  async create(data: CreateUserPayload): Promise<UserEntity | Error> {
    const alreadyExists = this.database.some(item => item.email === data.email);
    if (alreadyExists) {
      return new Error('User already exists');
    }

    const now = new Date().toISOString();
    const user: UserEntity = {
      id: Math.random().toString(36).substring(2),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    this.database.push(user);
    return user;
  }

  async update(id: string, data: UpdateUserPayload): Promise<UserEntity | Error> {
    const user = this.database.find(item => item.id === id);
    if (!user) {
      return new Error('User not found');
    }

    Object.assign(user, data);
    user.updatedAt = new Date().toISOString();
    return user;
  }

  async delete(id: string): Promise<void | Error> {
    const index = this.database.findIndex(item => item.id === id);
    if (index === -1) {
      return new Error('User not found');
    }

    this.database.splice(index, 1);
    return;
  }
}

function createUserMockService(): UserRepository {
  return new UserMockService();
}

export default createUserMockService();
