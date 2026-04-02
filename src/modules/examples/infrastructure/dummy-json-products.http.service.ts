import { manageAxiosError } from '@modules/network/domain/network.error';
import { createAxiosInstance } from '@modules/network/infrastructure/axios.service';

import type { ExampleListPage } from '../domain/example-list-item.model';
import type {
  ExampleListFilters,
  ExampleListQuery,
} from '../domain/example-query.model';
import { mapDummyJsonProductsPageToExampleListPage } from '../domain/dummy-json-products.adapter';
import { EXAMPLES_API_ROUTES } from './examples-api.routes';

const DUMMY_JSON_PRODUCTS_PAGE_SIZE = 30;
const DUMMY_JSON_SORT_FIELDS = new Set([
  'title',
  'price',
  'rating',
  'stock',
  'brand',
  'discountPercentage',
]);
const DUMMY_JSON_SORT_ORDERS = new Set(['asc', 'desc']);

interface SearchableDummyJsonProduct {
  id: number;
  title: string;
  description?: string;
  category?: string;
  brand?: string | null;
}

const httpClient = createAxiosInstance({
  baseURL: EXAMPLES_API_ROUTES.DUMMY_JSON_ROOT,
});

class DummyJsonProductsHttpService {
  async getList(query: ExampleListQuery): Promise<ExampleListPage | Error> {
    try {
      const filters = query.filters ?? {};
      const searchText = filters.searchText?.trim();
      const category = getAdvancedStringValue(filters, 'category');
      const sortBy = getSortBy(filters);
      const order = sortBy ? getSortOrder(filters) : undefined;

      if (category && searchText) {
        const response = await httpClient.get(
          `${
            EXAMPLES_API_ROUTES.DUMMY_JSON_PRODUCTS_CATEGORY
          }/${encodeURIComponent(category)}`,
          {
            params: buildRequestParams({
              page: 1,
              limit: 0,
              sortBy,
              order,
            }),
          },
        );

        const filteredProducts = filterProductsBySearch(
          response.data.products,
          searchText,
        );
        const skip = (query.page - 1) * DUMMY_JSON_PRODUCTS_PAGE_SIZE;

        return mapDummyJsonProductsPageToExampleListPage(
          {
            products: filteredProducts.slice(
              skip,
              skip + DUMMY_JSON_PRODUCTS_PAGE_SIZE,
            ),
            total: filteredProducts.length,
            skip,
            limit: DUMMY_JSON_PRODUCTS_PAGE_SIZE,
          },
          query.page,
        );
      }

      const params = buildRequestParams({
        page: query.page,
        searchText,
        sortBy,
        order,
      });

      const response = await httpClient.get(getEndpoint(searchText, category), {
        params,
      });

      return mapDummyJsonProductsPageToExampleListPage(
        response.data,
        query.page,
      );
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function createDummyJsonProductsHttpService() {
  return new DummyJsonProductsHttpService();
}

export default createDummyJsonProductsHttpService();

function getEndpoint(searchText?: string, category?: string) {
  if (category) {
    return `${
      EXAMPLES_API_ROUTES.DUMMY_JSON_PRODUCTS_CATEGORY
    }/${encodeURIComponent(category)}`;
  }

  return searchText
    ? EXAMPLES_API_ROUTES.DUMMY_JSON_PRODUCTS_SEARCH
    : EXAMPLES_API_ROUTES.DUMMY_JSON_PRODUCTS;
}

function buildRequestParams({
  page,
  limit = DUMMY_JSON_PRODUCTS_PAGE_SIZE,
  searchText,
  sortBy,
  order,
}: {
  page: number;
  limit?: number;
  searchText?: string;
  sortBy?: string;
  order?: string;
}) {
  const params: Record<string, string | number> = {
    limit,
    skip: limit > 0 ? (page - 1) * limit : 0,
  };

  if (searchText) {
    params.q = searchText;
  }

  if (sortBy) {
    params.sortBy = sortBy;

    if (order) {
      params.order = order;
    }
  }

  return params;
}

function getAdvancedStringValue(filters: ExampleListFilters, key: string) {
  const value = filters.advanced?.[key];

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length ? normalizedValue : undefined;
}

function getSortBy(filters: ExampleListFilters) {
  const value = getAdvancedStringValue(filters, 'sortBy');
  return value && DUMMY_JSON_SORT_FIELDS.has(value) ? value : undefined;
}

function getSortOrder(filters: ExampleListFilters) {
  const value = getAdvancedStringValue(filters, 'order');
  return value && DUMMY_JSON_SORT_ORDERS.has(value) ? value : undefined;
}

function filterProductsBySearch(
  products: SearchableDummyJsonProduct[],
  searchText: string,
) {
  const normalizedSearch = searchText.trim().toLowerCase();

  return products.filter(product => {
    return [product.title, product.description, product.brand, product.category]
      .filter((value): value is string => Boolean(value))
      .some(value => value.toLowerCase().includes(normalizedSearch));
  });
}
