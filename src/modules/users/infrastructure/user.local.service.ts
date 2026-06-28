import { sqliteDb, manageSqliteError } from '@modules/sqlite';
import { UserRepository } from '../domain/user.repository';
import { UserRow, toUser } from '../domain/user.mapper';
import type {
  CreateUserPayload,
  User,
  UserFilter,
  UpdateUserPayload,
} from '../domain/user.model';

class UserLocalService implements UserRepository {
  async getAll(filter?: UserFilter): Promise<User[] | Error> {
    try {
      if (filter?.searchText) {
        const search = `%${filter.searchText}%`;
        const { results } = await sqliteDb.executeAsync(
          'SELECT * FROM users WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?',
          [search, search, search],
        );
        return (results as unknown as UserRow[]).map(toUser);
      } else {
        const { results } = await sqliteDb.executeAsync('SELECT * FROM users');
        return (results as unknown as UserRow[]).map(toUser);
      }
    } catch (error) {
      return manageSqliteError(error);
    }
  }

  async getById(id: string): Promise<User | Error> {
    try {
      const { results } = await sqliteDb.executeAsync(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [id],
      );

      if (results.length === 0) {
        return new Error('User not found');
      }

      return toUser(results[0] as unknown as UserRow);
    } catch (error) {
      return manageSqliteError(error);
    }
  }

  async create(payload: CreateUserPayload): Promise<User | Error> {
    try {
      const id = Math.random().toString(36).substring(2, 15);
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;

      await sqliteDb.transaction(async tx => {
        await tx.executeAsync(
          `INSERT INTO users (
            id, name, email, phone, role, avatar, birth_date, terms_accepted, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            payload.name,
            payload.email,
            payload.phone,
            payload.role,
            payload.avatar ?? null,
            payload.birthDate?.toISOString() ?? null,
            payload.termsAccepted ? 1 : 0,
            createdAt,
            updatedAt,
          ],
        );
      });

      return this.getById(id);
    } catch (error) {
      return manageSqliteError(error);
    }
  }

  async update(id: string, payload: UpdateUserPayload): Promise<User | Error> {
    try {
      const existingUserOrError = await this.getById(id);
      if (existingUserOrError instanceof Error) {
        return existingUserOrError;
      }

      const updatedAt = new Date().toISOString();
      const fields: string[] = [];
      const values: any[] = [];

      if (payload.name !== undefined) {
        fields.push('name = ?');
        values.push(payload.name);
      }
      if (payload.email !== undefined) {
        fields.push('email = ?');
        values.push(payload.email);
      }
      if (payload.phone !== undefined) {
        fields.push('phone = ?');
        values.push(payload.phone);
      }
      if (payload.role !== undefined) {
        fields.push('role = ?');
        values.push(payload.role);
      }
      if (payload.birthDate !== undefined) {
        fields.push('birth_date = ?');
        values.push(payload.birthDate?.toISOString() ?? null);
      }
      if (payload.avatar !== undefined) {
        fields.push('avatar = ?');
        values.push(payload.avatar);
      }

      if (fields.length === 0) {
        return existingUserOrError; // Nothing to update
      }

      fields.push('updated_at = ?');
      values.push(updatedAt);
      values.push(id); // for WHERE id = ?

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

      await sqliteDb.transaction(async tx => {
        await tx.executeAsync(query, values);
      });

      return this.getById(id);
    } catch (error) {
      return manageSqliteError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await sqliteDb.transaction(async tx => {
        await tx.executeAsync('DELETE FROM users WHERE id = ?', [id]);
      });
    } catch (error) {
      return manageSqliteError(error);
    }
  }
}

function createUserLocalService(): UserRepository {
  return new UserLocalService();
}

export default createUserLocalService();
