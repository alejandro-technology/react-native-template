import { CONFIG } from '@config/config';
import { manageAxiosError } from '@modules/network/domain/network.error';
import { createAxiosInstance } from '@modules/network/infrastructure/axios.service';

import type { ExampleListPage } from '../domain/example-list-item.model';
import type { ExampleListQuery } from '../domain/example-query.model';
import { mapRawgPageToExampleListPage } from '../domain/rawg.adapter';
import { EXAMPLES_API_ROUTES } from './examples-api.routes';

const httpClient = createAxiosInstance({
  baseURL: EXAMPLES_API_ROUTES.RAWG_ROOT,
});

class RawgHttpService {
  async getList(query: ExampleListQuery): Promise<ExampleListPage | Error> {
    if (!CONFIG.RAWG_API_KEY) {
      return new Error('Configura RAWG_API_KEY para consultar videojuegos');
    }

    try {
      const params: Record<string, string | number> = {
        key: CONFIG.RAWG_API_KEY,
        page: query.page,
      };
      const searchText = query.filters?.searchText?.trim();

      if (searchText) {
        params.search = searchText;
      }

      const response = await httpClient.get(EXAMPLES_API_ROUTES.RAWG_GAMES, {
        params,
      });

      return mapRawgPageToExampleListPage(response.data, query.page);
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createRawgHttpService() {
  return new RawgHttpService();
}

export default createRawgHttpService();
