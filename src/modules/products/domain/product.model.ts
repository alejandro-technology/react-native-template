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
