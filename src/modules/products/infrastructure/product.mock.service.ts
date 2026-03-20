import {
  ProductEntity,
  CreateProductPayload,
  UpdateProductPayload,
} from '../domain/product.model';
import { ProductFilter, ProductRepository } from '../domain/product.repository';

class ProductMockService implements ProductRepository {
  database: ProductEntity[] = [];

  getAll(_?: ProductFilter): Promise<ProductEntity[] | Error> {
    return Promise.resolve(this.database);
  }
  getById(id: string): Promise<ProductEntity | Error> {
    const product = this.database.find(_product => _product.id === id);
    if (!product) {
      return Promise.resolve(new Error('Product not found'));
    }
    return Promise.resolve(product);
  }
  create(data: CreateProductPayload): Promise<ProductEntity | Error> {
    const product: ProductEntity = {
      id: Math.random().toString(36).substring(2),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: data.description || '',
    };
    this.database.push(product);
    return Promise.resolve(product);
  }
  update(
    id: string,
    data: UpdateProductPayload,
  ): Promise<ProductEntity | Error> {
    const product = this.database.find(_product => _product.id === id);
    if (!product) {
      return Promise.resolve(new Error('Product not found'));
    }
    Object.assign(product, data);
    product.updatedAt = new Date().toISOString();
    return Promise.resolve(product);
  }
  delete(id: string): Promise<void | Error> {
    const index = this.database.findIndex(product => product.id === id);
    if (index === -1) {
      return Promise.resolve(new Error('Product not found'));
    }
    this.database.splice(index, 1);
    return Promise.resolve();
  }
}

function createProductMockService(): ProductRepository {
  return new ProductMockService();
}

export default createProductMockService();
