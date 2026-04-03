import React, { useMemo } from 'react';

import { RootLayout } from '@components/layout';

import { useExampleListInfinite } from '../application/example.queries';
import { useExamplesStorage } from '../application/examples.storage';
import { ExampleSourceSelector } from './components/example-source-selector';
import { ExampleListScreen } from './components/example-list-screen';
import { ExampleList } from './components/example-list';
import { ExampleFiltersBar } from './components/example-filters-bar';
import { getExampleSourceDefinition } from '../application/example-sources.config';
import { useExampleListFilters } from './components/use-example-list-filters';

export default function DynamicListView() {
  const selectedSource = useExamplesStorage(state => state.selectedSource);
  const setSelectedSource = useExamplesStorage(
    state => state.setSelectedSource,
  );
  const { uiFilters, queryFilters, setFilters } =
    useExampleListFilters(selectedSource);
  const currentSourceDefinition = getExampleSourceDefinition(selectedSource);

  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useExampleListInfinite({ source: selectedSource, filters: queryFilters });

  const items = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages],
  );

  return (
    <RootLayout scroll={false} toolbar={false}>
      <ExampleListScreen
        title="Lista dinámica"
        subtitle="Cambia la fuente de datos"
      >
        <ExampleSourceSelector
          source={selectedSource}
          onChange={setSelectedSource}
        />

        {currentSourceDefinition?.capabilities ? (
          <ExampleFiltersBar
            capabilities={currentSourceDefinition.capabilities}
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
