import axiosService from '@modules/network/infrastructure/axios.service';
import { manageAxiosError } from '@modules/network/domain/network.error';
import { API_ROUTES } from '@config/api.routes';
import { UserRepository } from '../domain/user.repository';
import type {
  CreateUserPayload,
  UserEntity,
  UserFilter,
  UpdateUserPayload,
} from '../domain/user.model';

class UserHttpService implements UserRepository {
  async getAll(filter?: UserFilter): Promise<UserEntity[] | Error> {
    try {
      const params = filter?.searchText ? { search: filter.searchText } : {};
      const response = await axiosService.get<UserEntity[]>(API_ROUTES.USERS, {
        params,
      });
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async getById(id: string): Promise<UserEntity | Error> {
    try {
      const response = await axiosService.get<UserEntity>(
        `${API_ROUTES.USERS}/${id}`,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async create(data: CreateUserPayload): Promise<UserEntity | Error> {
    try {
      const response = await axiosService.post<UserEntity>(
        API_ROUTES.USERS,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async update(
    id: string,
    data: UpdateUserPayload,
  ): Promise<UserEntity | Error> {
    try {
      const response = await axiosService.put<UserEntity>(
        `${API_ROUTES.USERS}/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await axiosService.delete(`${API_ROUTES.USERS}/${id}`);
      return;
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createUserHttpService(): UserRepository {
  return new UserHttpService();
}

export default createUserHttpService();
