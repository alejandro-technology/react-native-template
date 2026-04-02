import type { ExampleDataSource } from '../domain/example-source.model';
import { useExamplesStorage } from './examples.storage';
import type { ExampleListFilters } from '../domain/example-query.model';

export function useSelectedExampleSource(): ExampleDataSource {
  return useExamplesStorage(state => state.selectedSource);
}

export function useExampleFilters(
  source: ExampleDataSource,
): ExampleListFilters {
  return useExamplesStorage(state => state.sourceFilters[source]);
}
