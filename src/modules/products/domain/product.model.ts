import type { Timestamp } from '@react-native-firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
}

export interface ProductFilter {
  searchText?: string;
}

// Only need for Firebase, as the rest of the app should work with the Product interface
export interface ProductEntity
  extends Omit<Product, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductFirebase extends Omit<ProductEntity, 'id'> {}
