export interface ProductEntity {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
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
