import { ProductEntity } from '@modules/products/domain/product.model';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export enum ProductsRoutes {
  ProductList = 'ProductList',
  ProductDetail = 'ProductDetail',
  ProductForm = 'ProductForm',
}

export type ProductsStackParamList = {
  [ProductsRoutes.ProductList]: undefined;
  [ProductsRoutes.ProductDetail]: { productId: string };
  [ProductsRoutes.ProductForm]?: { product: ProductEntity };
};

export type ProductsScreenProps<T extends keyof ProductsStackParamList> =
  NativeStackScreenProps<ProductsStackParamList, T>;
