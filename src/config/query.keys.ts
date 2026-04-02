export const QUERY_KEYS = {
  // Products
  PRODUCTS: (search = '') => ['products', 'search', search],
  PRODUCT_DETAIL: (id: string) => ['products', 'detail', id],
  // Users
  USERS: (search = '') => ['users', 'search', search],
  USER_DETAIL: (id: string) => ['users', 'detail', id],
  // Examples
  EXAMPLE_SOURCES: ['examples', 'sources'],
  EXAMPLE_LIST: (source: string, filtersFingerprint = '') => [
    'examples',
    'list',
    source,
    filtersFingerprint,
  ],
};
