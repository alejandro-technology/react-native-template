import type { ExampleListPage } from './example-list-item.model';
import type { ExampleListQuery } from './example-query.model';

export interface ExamplesRepository {
  getList(query: ExampleListQuery): Promise<ExampleListPage | Error>;
}
