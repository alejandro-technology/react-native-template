import React from 'react';

import { RootLayout } from '@components/layout';

import { useExampleListInfinite } from '../application/example.queries';
import { ExampleListScreen } from './components/example-list-screen';
import { ExampleList } from './components/example-list';
import { ExampleFiltersBar } from './components/example-filters-bar';
import { getExampleSourceDefinition } from '../application/example-sources.config';
import { useExampleListFilters } from './components/use-example-list-filters';

export default function RickAndMortyListView() {
  const { uiFilters, queryFilters, setFilters } =
    useExampleListFilters('rickAndMorty');

  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useExampleListInfinite({ source: 'rickAndMorty', filters: queryFilters });

  const items = data?.pages.flatMap(page => page.items);
  const capabilities = getExampleSourceDefinition('rickAndMorty')?.capabilities;

  return (
    <RootLayout scroll={false} toolbar={false}>
      <ExampleListScreen
        title="Lista de Rick y Morty"
        subtitle="Personajes del multiverso"
      >
        {capabilities ? (
          <ExampleFiltersBar
            capabilities={capabilities}
            filters={uiFilters}
            onChange={setFilters}
          />
        ) : null}
        <ExampleList
          items={items}
          isLoading={isLoading}
          isError={isError}
          error={error as Error | null}
          isRefetching={isRefetching}
          onRefresh={refetch}
          onEndReached={fetchNextPage}
          hasNextPage={hasNextPage}
        />
      </ExampleListScreen>
    </RootLayout>
  );
}
