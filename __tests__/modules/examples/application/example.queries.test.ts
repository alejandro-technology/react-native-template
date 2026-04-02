jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock('@modules/network/application/connectivity.storage', () => ({
  getIsConnected: jest.fn(() => true),
}));

jest.mock('@modules/examples/infrastructure/examples.service', () => ({
  __esModule: true,
  default: {
    getList: jest.fn(),
  },
}));

jest.mock('@modules/examples/application/examples.storage', () => ({
  useExamplesStorage: {
    getState: jest.fn(() => ({
      getCachedPage: jest.fn(() => undefined),
      setCache: jest.fn(),
    })),
  },
}));

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import examplesService from '@modules/examples/infrastructure/examples.service';
import {
  useExampleListInfinite,
  useExampleSources,
} from '@modules/examples/application/example.queries';

const mockUseInfiniteQuery = useInfiniteQuery as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;
const mockExamplesService = examplesService as jest.Mocked<
  typeof examplesService
>;

describe('example.queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe usar la key de fuentes al consultar fuentes', () => {
    mockUseQuery.mockReturnValue({});

    useExampleSources();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['examples', 'sources'],
      }),
    );
  });

  it('debe usar la key de lista por fuente y filtros', () => {
    mockUseInfiniteQuery.mockReturnValue({});

    useExampleListInfinite({
      source: 'rickAndMorty',
      filters: { searchText: 'rick' },
    });

    expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['examples', 'list', 'rickAndMorty', '{"searchText":"rick"}'],
      }),
    );
  });

  it('debe consultar el servicio al ejecutar queryFn', async () => {
    mockExamplesService.getList.mockResolvedValue({
      items: [],
      currentPage: 1,
      nextPage: null,
    });
    let capturedQueryFn: any;
    mockUseInfiniteQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return {};
    });

    useExampleListInfinite({ source: 'simpsons' });
    await capturedQueryFn({ pageParam: 1 });

    expect(mockExamplesService.getList).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'simpsons',
        page: 1,
      }),
    );
  });
});
