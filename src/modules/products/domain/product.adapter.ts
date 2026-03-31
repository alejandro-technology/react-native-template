import { CreateProductPayload } from './product.model';
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
