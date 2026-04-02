import { manageAxiosError } from '@modules/network/domain/network.error';
import { createAxiosInstance } from '@modules/network/infrastructure/axios.service';
import type { ExampleListPage } from '../domain/example-list-item.model';
import type { ExampleListQuery } from '../domain/example-query.model';
import { EXAMPLES_API_ROUTES } from './examples-api.routes';
import { mapRickAndMortyPageToExampleListPage } from '../domain/rick-and-morty.adapter';

const httpClient = createAxiosInstance({
  baseURL: EXAMPLES_API_ROUTES.RICK_AND_MORTY_ROOT,
});

class RickAndMortyHttpService {
  async getList(query: ExampleListQuery): Promise<ExampleListPage | Error> {
    try {
      const params: Record<string, string | number> = { page: query.page };
      const { searchText, advanced } = query.filters || {};

      if (searchText) {
        params.name = searchText;
      }

      if (advanced?.status) {
        params.status = String(advanced.status);
      }

      if (advanced?.gender) {
        params.gender = String(advanced.gender);
      }

      if (advanced?.species) {
        params.species = String(advanced.species);
      }

      const response = await httpClient.get(
        EXAMPLES_API_ROUTES.RICK_AND_MORTY_CHARACTERS,
        {
          params,
        },
      );

      return mapRickAndMortyPageToExampleListPage(response.data, query.page);
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createRickAndMortyHttpService() {
  return new RickAndMortyHttpService();
}

export default createRickAndMortyHttpService();
