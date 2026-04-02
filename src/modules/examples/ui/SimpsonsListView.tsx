import React from 'react';

import { RootLayout } from '@components/layout';

import { useExampleListInfinite } from '../application/example.queries';
import { ExampleListScreen } from './components/example-list-screen';
import { ExampleList } from './components/example-list';

export default function SimpsonsListView() {
  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useExampleListInfinite({ source: 'simpsons' });

  const items = data?.pages.flatMap(page => page.items);

  return (
    <RootLayout scroll={false} toolbar={false}>
      <ExampleListScreen
        title="Lista de Los Simpson"
        subtitle="Personajes de Springfield"
      >
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
