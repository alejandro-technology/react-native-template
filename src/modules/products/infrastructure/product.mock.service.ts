import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from '../domain/product.model';
import { ProductFilter, ProductRepository } from '../domain/product.repository';

class ProductMockService implements ProductRepository {
  database: Product[] = [];

  getAll(_?: ProductFilter): Promise<Product[] | Error> {
    return Promise.resolve(this.database);
  }
  getById(id: string): Promise<Product | Error> {
    const product = this.database.find(_product => _product.id === id);
    if (!product) {
      return Promise.resolve(new Error('Product not found'));
    }
    return Promise.resolve(product);
  }
  create(data: CreateProductPayload): Promise<Product | Error> {
    const product: Product = {
      id: Math.random().toString(36).substring(2),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: data.description || '',
    };
    this.database.push(product);
    return Promise.resolve(product);
  }
  update(id: string, data: UpdateProductPayload): Promise<Product | Error> {
    const product = this.database.find(_product => _product.id === id);
    if (!product) {
      return Promise.resolve(new Error('Product not found'));
    }
    Object.assign(product, data);
    product.updatedAt = new Date();
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
