export type ProductType = 'comida' | 'bebidas' | 'otros';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ProductType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  type: ProductType;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  type?: ProductType;
}

export interface ProductFilter {
  searchText?: string;
}
