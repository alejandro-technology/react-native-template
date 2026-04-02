import { useEffect, useMemo, useRef, useState } from 'react';

import { useDebounce } from '@modules/core/application/core.hooks';

import type { ExampleListFilters } from '../../domain/example-query.model';
import type { ExampleDataSource } from '../../domain/example-source.model';
import { useExamplesStorage } from '../../application/examples.storage';
import { sanitizeExampleFilters } from '../../application/example-sources.config';

interface UseExampleListFiltersResult {
  uiFilters: ExampleListFilters;
  queryFilters: ExampleListFilters;
  setFilters: (filters: ExampleListFilters) => void;
}

export function useExampleListFilters(
  source: ExampleDataSource,
): UseExampleListFiltersResult {
  const sourceFilters = useExamplesStorage(state => state.sourceFilters);
  const setSourceFilters = useExamplesStorage(state => state.setSourceFilters);
  const skipPersistRef = useRef(false);
  const storedFilters = useMemo<ExampleListFilters>(() => {
    return sourceFilters[source] ?? {};
  }, [source, sourceFilters]);
  const [uiFilters, setUiFilters] = useState<ExampleListFilters>(() =>
    sanitizeExampleFilters(source, storedFilters),
  );
  const debouncedSearch = useDebounce(uiFilters.searchText ?? '', 400);
  const debouncedAdvanced = useDebounce(uiFilters.advanced ?? {}, 400);

  useEffect(() => {
    skipPersistRef.current = true;
    setUiFilters(sanitizeExampleFilters(source, storedFilters));
  }, [source, storedFilters]);

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }

    setSourceFilters(source, uiFilters);
  }, [source, setSourceFilters, uiFilters]);

  const queryFilters = useMemo<ExampleListFilters>(() => {
    return sanitizeExampleFilters(source, {
      searchText: debouncedSearch,
      advanced: debouncedAdvanced,
    });
  }, [debouncedAdvanced, debouncedSearch, source]);

  return {
    uiFilters,
    queryFilters,
    setFilters: nextFilters =>
      setUiFilters(sanitizeExampleFilters(source, nextFilters)),
  };
}
