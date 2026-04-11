// Supabase
import { supabaseClient, manageSupabaseError } from '@modules/supabase';
// Config
import { COLLECTIONS } from '@config/collections.routes';
// Domain
import { ProductRepository } from '../domain/product.repository';
import type {
  CreateProductPayload,
  Product,
  ProductFilter,
  UpdateProductPayload,
} from '../domain/product.model';

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  created_at: string;
  updated_at: string;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    type: row.type as Product['type'],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

class ProductSupabaseService implements ProductRepository {
  async getAll(filter?: ProductFilter): Promise<Product[] | Error> {
    try {
      let query = supabaseClient.from(COLLECTIONS.PRODUCTS).select('*');

      if (filter?.searchText) {
        query = query.ilike('name', `%${filter.searchText}%`);
      }

      const { data, error } = await query;

      if (error) {
        return manageSupabaseError(error);
      }

      return (data as ProductRow[]).map(toProduct);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async getById(id: string): Promise<Product | Error> {
    try {
      const { data, error } = await supabaseClient
        .from(COLLECTIONS.PRODUCTS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return manageSupabaseError(error);
      }

      return toProduct(data as ProductRow);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async create(payload: CreateProductPayload): Promise<Product | Error> {
    try {
      const { data, error } = await supabaseClient
        .from(COLLECTIONS.PRODUCTS)
        .insert({
          name: payload.name,
          description: payload.description ?? '',
          price: payload.price,
          type: payload.type,
        })
        .select()
        .single();

      if (error) {
        return manageSupabaseError(error);
      }

      return toProduct(data as ProductRow);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async update(
    id: string,
    payload: UpdateProductPayload,
  ): Promise<Product | Error> {
    try {
      const updateData: Partial<
        Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>
      > = {};

      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.description !== undefined)
        updateData.description = payload.description;
      if (payload.price !== undefined) updateData.price = payload.price;
      if (payload.type !== undefined) updateData.type = payload.type;

      const { data, error } = await supabaseClient
        .from(COLLECTIONS.PRODUCTS)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return manageSupabaseError(error);
      }

      return toProduct(data as ProductRow);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const { error } = await supabaseClient
        .from(COLLECTIONS.PRODUCTS)
        .delete()
        .eq('id', id);

      if (error) {
        return manageSupabaseError(error);
      }

      return;
    } catch (error) {
      return manageSupabaseError(error);
    }
  }
}

function createProductSupabaseService(): ProductRepository {
  return new ProductSupabaseService();
}

export default createProductSupabaseService();
