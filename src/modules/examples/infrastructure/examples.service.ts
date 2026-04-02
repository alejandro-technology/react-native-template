import type { ExampleDataSource } from '../domain/example-source.model';
import simpsonsService from './simpsons.http.service';
import rickAndMortyService from './rick-and-morty.http.service';
import rawgService from './rawg.http.service';
import dummyJsonProductsService from './dummy-json-products.http.service';
import type { ExampleListQuery } from '../domain/example-query.model';
import type { ExampleListPage } from '../domain/example-list-item.model';

interface ExampleListService {
  getList(query: ExampleListQuery): Promise<ExampleListPage | Error>;
}

const servicesBySource: Record<ExampleDataSource, ExampleListService> = {
  simpsons: simpsonsService,
  rickAndMorty: rickAndMortyService,
  rawg: rawgService,
  dummyJsonProducts: dummyJsonProductsService,
};

class ExamplesService {
  async getList(query: ExampleListQuery): Promise<ExampleListPage | Error> {
    return servicesBySource[query.source].getList(query);
  }
}

function createExamplesService() {
  return new ExamplesService();
}

export default createExamplesService();
