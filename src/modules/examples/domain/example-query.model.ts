import type { ExampleDataSource } from './example-source.model';

export interface ExampleListFilters {
  searchText?: string;
  advanced?: Record<string, string | number | boolean | undefined>;
}

export interface ExampleListQuery {
  source: ExampleDataSource;
  page: number;
  filters?: ExampleListFilters;
}
