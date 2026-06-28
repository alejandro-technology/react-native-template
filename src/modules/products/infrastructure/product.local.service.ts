import { sqliteDb, manageSqliteError } from '@modules/sqlite';
import { ProductRepository } from '../domain/product.repository';
import type {
  CreateProductPayload,
  Product,
  ProductFilter,
  UpdateProductPayload,
} from '../domain/product.model';
import { ProductRow, toProduct } from '../domain/product.mapper';

class ProductLocalService implements ProductRepository {
  async getAll(filter?: ProductFilter): Promise<Product[] | Error> {
    try {
      if (filter?.searchText) {
        const { results } = await sqliteDb.executeAsync(
          'SELECT * FROM products WHERE name LIKE ?',
          [`%${filter.searchText}%`],
        );
        return (results as unknown as ProductRow[]).map(toProduct);
      } else {
        const { results } = await sqliteDb.executeAsync(
          'SELECT * FROM products',
        );
        return (results as unknown as ProductRow[]).map(toProduct);
      }
    } catch (error) {
      return manageSqliteError(error);
    }
  }

  async getById(id: string): Promise<Product | Error> {
    try {
      const { results } = await sqliteDb.executeAsync(
        'SELECT * FROM products WHERE id = ? LIMIT 1',
        [id],
      );

      if (results.length === 0) {
        return new Error('Product not found');
      }

      return toProduct(results[0] as unknown as ProductRow);
    } catch (error) {
      return manageSqliteError(error);
    }
  }

  async create(payload: CreateProductPayload): Promise<Product | Error> {
    try {
      // react-native-nitro-sqlite does not support UUID generation natively,
      // so we use a fallback if not available, or just a simple string for local test.
      // Usually uuid or Math.random is sufficient for local mock.
      const id = Math.random().toString(36).substring(2, 15);
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;
      const description = payload.description ?? '';

      await sqliteDb.transaction(async tx => {
        await tx.executeAsync(
          `INSERT INTO products (id, name, description, price, type, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            payload.name,
            description,
            payload.price,
            payload.type,
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

  async update(
    id: string,
    payload: UpdateProductPayload,
  ): Promise<Product | Error> {
    try {
      const existingProductOrError = await this.getById(id);
      if (existingProductOrError instanceof Error) {
        return existingProductOrError;
      }

      const updatedAt = new Date().toISOString();
      const fields: string[] = [];
      const values: any[] = [];

      if (payload.name !== undefined) {
        fields.push('name = ?');
        values.push(payload.name);
      }
      if (payload.description !== undefined) {
        fields.push('description = ?');
        values.push(payload.description);
      }
      if (payload.price !== undefined) {
        fields.push('price = ?');
        values.push(payload.price);
      }
      if (payload.type !== undefined) {
        fields.push('type = ?');
        values.push(payload.type);
      }

      if (fields.length === 0) {
        return existingProductOrError; // Nothing to update
      }

      fields.push('updated_at = ?');
      values.push(updatedAt);
      values.push(id); // for WHERE id = ?

      const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;

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
        await tx.executeAsync('DELETE FROM products WHERE id = ?', [id]);
      });
    } catch (error) {
      return manageSqliteError(error);
    }
  }
}

function createProductLocalService(): ProductRepository {
  return new ProductLocalService();
}

export default createProductLocalService();
