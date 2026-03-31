import {
  CreateProductPayload,
  Product,
  ProductFilter,
  UpdateProductPayload,
} from './product.model';

export type { ProductFilter };
export interface ProductRepository {
  getAll(filter?: ProductFilter): Promise<Product[] | Error>;
  getById(id: string): Promise<Product | Error>;
  create(data: CreateProductPayload): Promise<Product | Error>;
  update(id: string, data: UpdateProductPayload): Promise<Product | Error>;
  delete(id: string): Promise<void | Error>;
}
