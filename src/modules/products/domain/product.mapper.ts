import { Product } from './product.model';

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  created_at: string;
  updated_at: string;
}

export function toProduct(row: ProductRow): Product {
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
