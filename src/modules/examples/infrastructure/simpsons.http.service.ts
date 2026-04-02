import { manageAxiosError } from '@modules/network/domain/network.error';
import { createAxiosInstance } from '@modules/network/infrastructure/axios.service';
import type { ExampleListPage } from '../domain/example-list-item.model';
import type { ExampleListQuery } from '../domain/example-query.model';
import { EXAMPLES_API_ROUTES } from './examples-api.routes';
import { mapSimpsonsPageToExampleListPage } from '../domain/simpsons.adapter';

const httpClient = createAxiosInstance({
  baseURL: EXAMPLES_API_ROUTES.SIMPSONS_ROOT,
});

class SimpsonsHttpService {
  async getList(query: ExampleListQuery): Promise<ExampleListPage | Error> {
    try {
      const params: Record<string, string | number> = { page: query.page };
      if (query.filters?.searchText) {
        params.name = query.filters.searchText;
      }

      const response = await httpClient.get(
        EXAMPLES_API_ROUTES.SIMPSONS_CHARACTERS,
        {
          params,
        },
      );

      return mapSimpsonsPageToExampleListPage(response.data, query.page);
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createSimpsonsHttpService() {
  return new SimpsonsHttpService();
}

export default createSimpsonsHttpService();
