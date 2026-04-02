import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@config/storage';

import type { ExampleListPage } from '../domain/example-list-item.model';
import type { ExampleListFilters } from '../domain/example-query.model';
import type { ExampleDataSource } from '../domain/example-source.model';
import {
  buildInitialExampleSourceFilters,
  DEFAULT_EXAMPLE_SOURCE,
  sanitizeExampleFilters,
} from './example-sources.config';

interface ExamplesState {
  selectedSource: ExampleDataSource;
  setSelectedSource: (source: ExampleDataSource) => void;
  sourceFilters: Record<ExampleDataSource, ExampleListFilters>;
  setSourceFilters: (
    source: ExampleDataSource,
    filters: ExampleListFilters,
  ) => void;
  cache: Record<string, ExampleListPage>;
  setCache: (
    source: ExampleDataSource,
    fingerprint: string,
    page: ExampleListPage,
  ) => void;
  getCachedPage: (
    source: ExampleDataSource,
    fingerprint: string,
  ) => ExampleListPage | undefined;
}

const initialFilters = buildInitialExampleSourceFilters();

export const useExamplesStorage = create<ExamplesState>()(
  persist(
    (set, get) => ({
      selectedSource: DEFAULT_EXAMPLE_SOURCE,
      sourceFilters: initialFilters,
      cache: {},
      setSelectedSource: source => set({ selectedSource: source }),
      setSourceFilters: (source, filters) =>
        set(state => ({
          sourceFilters: {
            ...state.sourceFilters,
            [source]: sanitizeExampleFilters(source, filters),
          },
        })),
      setCache: (source, fingerprint, page) =>
        set(state => ({
          cache: {
            ...state.cache,
            [`${source}:${fingerprint}`]: page,
          },
        })),
      getCachedPage: (source, fingerprint) =>
        get().cache[`${source}:${fingerprint}`],
    }),
    {
      name: 'examples-storage',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: state => ({
        selectedSource: state.selectedSource,
        sourceFilters: state.sourceFilters,
        cache: state.cache,
      }),
    },
  ),
);
