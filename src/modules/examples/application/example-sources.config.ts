import type { ExampleListFilters } from '../domain/example-query.model';
import type { ExampleDataSource } from '../domain/example-source.model';

export interface ExampleFilterField {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: Array<{ label: string; value: string }>;
}

export interface ExampleSourceCapabilities {
  supportsSearch: boolean;
  supportsFilters: boolean;
  filterFields: ExampleFilterField[];
}

export interface ExampleSourceDefinition {
  source: ExampleDataSource;
  label: string;
  description: string;
  capabilities: ExampleSourceCapabilities;
  defaultFilters?: ExampleListFilters;
}

export const DEFAULT_EXAMPLE_SOURCE: ExampleDataSource = 'rickAndMorty';

const DUMMY_JSON_PRODUCT_CATEGORY_OPTIONS = [
  'beauty',
  'fragrances',
  'furniture',
  'groceries',
  'home-decoration',
  'kitchen-accessories',
  'laptops',
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'mobile-accessories',
  'motorcycle',
  'skin-care',
  'smartphones',
  'sports-accessories',
  'sunglasses',
  'tablets',
  'tops',
  'vehicle',
  'womens-bags',
  'womens-dresses',
  'womens-jewellery',
  'womens-shoes',
  'womens-watches',
].map(category => ({
  label: formatFilterOptionLabel(category),
  value: category,
}));

const DUMMY_JSON_PRODUCT_SORT_OPTIONS = [
  { label: 'Título', value: 'title' },
  { label: 'Precio', value: 'price' },
  { label: 'Calificación', value: 'rating' },
  { label: 'Stock', value: 'stock' },
  { label: 'Marca', value: 'brand' },
  { label: 'Descuento', value: 'discountPercentage' },
];

const DUMMY_JSON_PRODUCT_ORDER_OPTIONS = [
  { label: 'Ascendente', value: 'asc' },
  { label: 'Descendente', value: 'desc' },
];

export const EXAMPLE_SOURCE_DEFINITIONS: ExampleSourceDefinition[] = [
  {
    source: 'simpsons',
    label: 'Los Simpson',
    description: 'Listado paginado de personajes de Springfield',
    capabilities: {
      supportsSearch: false,
      supportsFilters: false,
      filterFields: [],
    },
  },
  {
    source: 'rickAndMorty',
    label: 'Rick y Morty',
    description: 'Listado paginado con búsqueda y filtros por personaje',
    capabilities: {
      supportsSearch: true,
      supportsFilters: true,
      filterFields: [
        {
          key: 'status',
          label: 'Estado',
          type: 'select',
          options: [
            { label: 'Vivo', value: 'alive' },
            { label: 'Muerto', value: 'dead' },
            { label: 'Desconocido', value: 'unknown' },
          ],
        },
        {
          key: 'gender',
          label: 'Género',
          type: 'select',
          options: [
            { label: 'Mujer', value: 'female' },
            { label: 'Hombre', value: 'male' },
            { label: 'Sin género', value: 'genderless' },
            { label: 'Desconocido', value: 'unknown' },
          ],
        },
        {
          key: 'species',
          label: 'Especie',
          type: 'text',
        },
      ],
    },
  },
  {
    source: 'rawg',
    label: 'RAWG',
    description: 'Listado paginado y búsqueda de videojuegos',
    capabilities: {
      supportsSearch: true,
      supportsFilters: false,
      filterFields: [],
    },
  },
  {
    source: 'dummyJsonProducts',
    label: 'DummyJSON Products',
    description: 'Listado paginado y búsqueda de productos',
    capabilities: {
      supportsSearch: true,
      supportsFilters: true,
      filterFields: [
        {
          key: 'category',
          label: 'Categoría',
          type: 'select',
          options: DUMMY_JSON_PRODUCT_CATEGORY_OPTIONS,
        },
        {
          key: 'sortBy',
          label: 'Ordenar por',
          type: 'select',
          options: DUMMY_JSON_PRODUCT_SORT_OPTIONS,
        },
        {
          key: 'order',
          label: 'Orden',
          type: 'select',
          options: DUMMY_JSON_PRODUCT_ORDER_OPTIONS,
        },
      ],
    },
  },
];

export function getExampleSourceDefinition(
  source: ExampleDataSource,
): ExampleSourceDefinition | undefined {
  return EXAMPLE_SOURCE_DEFINITIONS.find(
    definition => definition.source === source,
  );
}

export function getDefaultExampleFilters(
  source: ExampleDataSource,
): ExampleListFilters {
  return sanitizeExampleFilters(
    source,
    cloneExampleFilters(getExampleSourceDefinition(source)?.defaultFilters),
  );
}

export function buildInitialExampleSourceFilters(): Record<
  ExampleDataSource,
  ExampleListFilters
> {
  return EXAMPLE_SOURCE_DEFINITIONS.reduce<
    Record<ExampleDataSource, ExampleListFilters>
  >((accumulator, definition) => {
    accumulator[definition.source] = getDefaultExampleFilters(
      definition.source,
    );
    return accumulator;
  }, {} as Record<ExampleDataSource, ExampleListFilters>);
}

export function sanitizeExampleFilters(
  source: ExampleDataSource,
  filters: ExampleListFilters,
): ExampleListFilters {
  const definition = getExampleSourceDefinition(source);

  if (!definition) {
    return {};
  }

  const allowedKeys = new Set(
    definition.capabilities.filterFields.map(field => field.key),
  );
  const advanced = Object.entries(filters.advanced ?? {}).reduce<
    Record<string, string | number | boolean | undefined>
  >((accumulator, [key, value]) => {
    if (!allowedKeys.has(key)) {
      return accumulator;
    }

    const normalizedValue = normalizeFilterValue(value);

    if (normalizedValue !== undefined) {
      accumulator[key] = normalizedValue;
    }

    return accumulator;
  }, {});
  const normalizedFilters: ExampleListFilters = {};

  if (definition.capabilities.supportsSearch) {
    const searchText = normalizeFilterValue(filters.searchText);

    if (typeof searchText === 'string') {
      normalizedFilters.searchText = searchText;
    }
  }

  if (!advanced.sortBy) {
    delete advanced.order;
  }

  if (Object.keys(advanced).length > 0) {
    normalizedFilters.advanced = advanced;
  }

  return normalizedFilters;
}

function cloneExampleFilters(filters?: ExampleListFilters): ExampleListFilters {
  if (!filters) {
    return {};
  }

  return {
    ...(filters.searchText ? { searchText: filters.searchText } : {}),
    ...(filters.advanced ? { advanced: { ...filters.advanced } } : {}),
  };
}

function formatFilterOptionLabel(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeFilterValue(
  value: string | number | boolean | undefined,
): string | number | boolean | undefined {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length ? normalizedValue : undefined;
}
