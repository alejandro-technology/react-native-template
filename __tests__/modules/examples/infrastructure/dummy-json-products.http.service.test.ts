const mockGet = jest.fn();

jest.mock('@modules/network/infrastructure/axios.service', () => ({
  createAxiosInstance: jest.fn(() => ({
    get: mockGet,
  })),
}));

jest.mock('@modules/network/domain/network.error', () => ({
  manageAxiosError: jest.fn((error: unknown) => error),
}));

function loadService() {
  return require('@modules/examples/infrastructure/dummy-json-products.http.service')
    .default;
}

describe('dummy-json-products.http.service', () => {
  let dummyJsonProductsService: ReturnType<typeof loadService>;

  beforeEach(() => {
    jest.resetModules();
    mockGet.mockReset();
    dummyJsonProductsService = loadService();
  });

  it('debe consultar productos por categoria con ordenamiento', async () => {
    mockGet.mockResolvedValue({
      data: {
        products: [],
        total: 0,
        skip: 0,
        limit: 30,
      },
    });

    await dummyJsonProductsService.getList({
      source: 'dummyJsonProducts',
      page: 1,
      filters: {
        advanced: {
          category: 'smartphones',
          sortBy: 'price',
          order: 'asc',
        },
      },
    });

    expect(mockGet).toHaveBeenCalledWith('/products/category/smartphones', {
      params: {
        limit: 30,
        skip: 0,
        sortBy: 'price',
        order: 'asc',
      },
    });
  });

  it('debe consultar busqueda global con ordenamiento', async () => {
    mockGet.mockResolvedValue({
      data: {
        products: [],
        total: 0,
        skip: 0,
        limit: 30,
      },
    });

    await dummyJsonProductsService.getList({
      source: 'dummyJsonProducts',
      page: 2,
      filters: {
        searchText: 'phone',
        advanced: {
          sortBy: 'rating',
          order: 'desc',
        },
      },
    });

    expect(mockGet).toHaveBeenCalledWith('/products/search', {
      params: {
        limit: 30,
        skip: 30,
        q: 'phone',
        sortBy: 'rating',
        order: 'desc',
      },
    });
  });

  it('debe combinar categoria y busqueda filtrando localmente', async () => {
    mockGet.mockResolvedValue({
      data: {
        products: [
          {
            id: 1,
            title: 'iPhone Charger',
            description: 'Carga rápida para iPhone',
            category: 'smartphones',
          },
          {
            id: 2,
            title: 'Android Cable',
            description: 'Cable USB-C',
            category: 'smartphones',
          },
        ],
        total: 2,
        skip: 0,
        limit: 0,
      },
    });

    const result = await dummyJsonProductsService.getList({
      source: 'dummyJsonProducts',
      page: 1,
      filters: {
        searchText: 'iphone',
        advanced: {
          category: 'smartphones',
          sortBy: 'title',
          order: 'asc',
        },
      },
    });

    expect(mockGet).toHaveBeenCalledWith('/products/category/smartphones', {
      params: {
        limit: 0,
        skip: 0,
        sortBy: 'title',
        order: 'asc',
      },
    });
    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: '1',
          title: 'iPhone Charger',
        }),
      ],
      currentPage: 1,
      nextPage: null,
      totalPages: 1,
      totalItems: 1,
    });
  });
});
