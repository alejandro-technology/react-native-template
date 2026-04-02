import axiosService from '@modules/network/infrastructure/axios-client.service';
import { manageAxiosError } from '@modules/network/domain/network.error';
import { API_ROUTES } from '@config/api.routes';
import { ProductRepository } from '../domain/product.repository';
import type {
  CreateProductPayload,
  Product,
  ProductFilter,
  UpdateProductPayload,
} from '../domain/product.model';

class ProductHttpService implements ProductRepository {
  async getAll(filter?: ProductFilter): Promise<Product[] | Error> {
    try {
      const params = filter?.searchText ? { search: filter.searchText } : {};
      const response = await axiosService.get<Product[]>(API_ROUTES.PRODUCTS, {
        params,
      });
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async getById(id: string): Promise<Product | Error> {
    try {
      const response = await axiosService.get<Product>(
        `${API_ROUTES.PRODUCTS}/${id}`,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async create(data: CreateProductPayload): Promise<Product | Error> {
    try {
      const response = await axiosService.post<Product>(
        API_ROUTES.PRODUCTS,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async update(
    id: string,
    data: UpdateProductPayload,
  ): Promise<Product | Error> {
    try {
      const response = await axiosService.put<Product>(
        `${API_ROUTES.PRODUCTS}/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await axiosService.delete(`${API_ROUTES.PRODUCTS}/${id}`);
      return;
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createProductHttpService(): ProductRepository {
  return new ProductHttpService();
}

export default createProductHttpService();
