export { useProducts, useProduct } from './application/product.queries';
export {
  useProductCreate,
  useProductUpdate,
  useProductDelete,
} from './application/product.mutations';
export type {
  ProductEntity,
  CreateProductPayload,
  UpdateProductPayload,
} from './domain/product.model';
export type {
  ProductRepository,
  ProductFilter,
} from './domain/product.repository';
