import { CreateProductPayload, Product, ProductEntity } from './product.model';
import type { ProductFormData } from './product.scheme';

/**
 * The functions provided are adapters that convert data between different representations for product
 * entities and payloads.
 * @param {ProductFormData} form - The `form` parameter in the `productFormToPayloadAdapter` function
 * represents the data structure of a form containing information about a product, such as its name,
 * description, and price.
 * @returns The `productFormToPayloadAdapter` function returns a `CreateProductPayload` object based on
 * the provided `ProductFormData`. The `productEntityToProductAdapter` function returns a `Product`
 * object based on the provided `ProductEntity`. The `productEntityToProductsAdapter` function returns
 * an array of `Product` objects based on an array of `ProductEntity` objects.
 */
export function productFormToPayloadAdapter(
  form: ProductFormData,
): CreateProductPayload {
  return {
    name: form.name,
    description: form.description,
    price: form.price,
  };
}

/**
 * The function `productEntityToProductAdapter` converts a `ProductEntity` object to a `Product` object
 * by mapping their respective properties.
 * @param {ProductEntity} data - The `data` parameter in the `productEntityToProductAdapter` function
 * is of type `ProductEntity`, which likely represents an entity or object containing information about
 * a product. The function takes this `ProductEntity` object as input and returns a `Product` object
 * with properties such as `id`,
 * @returns The function `productEntityToProductAdapter` is returning a `Product` object that is
 * created by mapping the properties of a `ProductEntity` object `data` to the corresponding properties
 * of the `Product` object. The returned `Product` object includes the `id`, `name`, `description`,
 * `price`, `createdAt`, and `updatedAt` properties. The `createdAt` and `updatedAt
 */
export function productEntityToProductAdapter(data: ProductEntity): Product {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    createdAt: new Date(data.createdAt.seconds * 1000),
    updatedAt: new Date(data.updatedAt.seconds * 1000),
  };
}

/**
 * The function `productEntityToProductsAdapter` converts an array of `ProductEntity` objects to an
 * array of `Product` objects by mapping and transforming the properties.
 * @param {ProductEntity[]} data - The `data` parameter in the `productEntityToProductsAdapter`
 * function is an array of `ProductEntity` objects. Each `ProductEntity` object represents a product
 * with properties like `id`, `name`, `description`, `price`, `createdAt`, and `updatedAt`. The
 * function maps over
 * @returns The `productEntityToProductsAdapter` function returns an array of `Product` objects. Each
 * `Product` object contains properties such as `id`, `name`, `description`, `price`, `createdAt`, and
 * `updatedAt`, which are extracted from the `ProductEntity` objects passed in the `data` array. The
 * `createdAt` and `updatedAt` properties are converted from Firestore Timestamp objects to
 */
export function productEntityToProductsAdapter(
  data: ProductEntity[],
): Product[] {
  return data.map(productEntityToProductAdapter);
}
