import { CreateProductPayload, ProductEntity } from './product.model';
import type { ProductFormData } from './product.scheme';

export function productFormToPayloadAdapter(
  form: ProductFormData,
): CreateProductPayload {
  return {
    name: form.name,
    description: form.description,
    price: form.price,
  };
}

export function productEntityAdapter(data: ProductEntity): ProductEntity {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
