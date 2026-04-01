export { useProducts, useProduct } from './application/product.queries';
export {
  useProductCreate,
  useProductUpdate,
  useProductDelete,
} from './application/product.mutations';
export { useProductsStorage } from './application/products.storage';
export type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from './domain/product.model';
export type {
  ProductRepository,
  ProductFilter,
} from './domain/product.repository';
