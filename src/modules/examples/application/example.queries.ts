import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { QUERY_KEYS } from '@config/query.keys';
import { getIsConnected } from '@modules/network/application/connectivity.storage';

import { EXAMPLE_SOURCE_DEFINITIONS } from './example-sources.config';
import examplesService from '../infrastructure/examples.service';
import type { ExampleListPage } from '../domain/example-list-item.model';
import type { ExampleListFilters } from '../domain/example-query.model';
import type { ExampleDataSource } from '../domain/example-source.model';
import { useExamplesStorage } from './examples.storage';

function buildFiltersFingerprint(filters?: ExampleListFilters) {
  return JSON.stringify(filters ?? {});
}

function getNextPageParam(page: ExampleListPage) {
  return page.nextPage ?? undefined;
}

export function useExampleSources(
  enabled = true,
): UseQueryResult<typeof EXAMPLE_SOURCE_DEFINITIONS, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.EXAMPLE_SOURCES,
    queryFn: async () => EXAMPLE_SOURCE_DEFINITIONS,
    placeholderData: EXAMPLE_SOURCE_DEFINITIONS,
    enabled,
  });
}

export function useExampleListInfinite({
  source,
  filters,
  enabled = true,
}: {
  source: ExampleDataSource;
  filters?: ExampleListFilters;
  enabled?: boolean;
}): UseInfiniteQueryResult<InfiniteData<ExampleListPage, number>, Error> {
  const filtersFingerprint = buildFiltersFingerprint(filters);
  const cachedPage = useExamplesStorage
    .getState()
    .getCachedPage(source, filtersFingerprint);
  const setCache = useExamplesStorage.getState().setCache;

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.EXAMPLE_LIST(source, filtersFingerprint),
    initialPageParam: 1,
    enabled,
    queryFn: async ({ pageParam }) => {
      if (!getIsConnected() && cachedPage) {
        return cachedPage;
      }

      const result = await examplesService.getList({
        source,
        page: Number(pageParam),
        filters,
      });

      if (result instanceof Error) {
        throw result;
      }

      setCache(source, filtersFingerprint, result);
      return result;
    },
    getNextPageParam,
    getPreviousPageParam: () => undefined,
    placeholderData: cachedPage
      ? {
          pageParams: [1],
          pages: [cachedPage],
        }
      : undefined,
  });
}

export function useExampleListBySource(
  source: ExampleDataSource,
): UseInfiniteQueryResult<InfiniteData<ExampleListPage, number>, Error> {
  return useExampleListInfinite({ source });
}
