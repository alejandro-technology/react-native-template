import type {
  ExampleListItem,
  ExampleListPage,
} from './example-list-item.model';

interface DummyJsonProductResponse {
  id: number;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  discountPercentage?: number | null;
  rating?: number | null;
  stock?: number | null;
  brand?: string | null;
  thumbnail?: string | null;
  images?: string[];
  availabilityStatus?: string | null;
}

interface DummyJsonProductsPageResponse {
  products: DummyJsonProductResponse[];
  total: number;
  skip: number;
  limit: number;
}

export function mapDummyJsonProductsPageToExampleListPage(
  response: DummyJsonProductsPageResponse,
  currentPage: number,
): ExampleListPage {
  const hasNextPage = response.skip + response.limit < response.total;

  return {
    items: response.products.map(product => mapDummyJsonProduct(product)),
    currentPage,
    nextPage: hasNextPage ? currentPage + 1 : null,
    totalPages: response.limit
      ? Math.ceil(response.total / response.limit)
      : undefined,
    totalItems: response.total,
  };
}

export function mapDummyJsonProduct(
  product: DummyJsonProductResponse,
): ExampleListItem {
  const category = formatCategory(product.category);
  const badges = [category, product.availabilityStatus].filter(
    (value): value is string => Boolean(value),
  );
  const metadata: ExampleListItem['metadata'] = [];

  if (typeof product.price === 'number') {
    metadata.push({ label: 'Precio', value: `$${product.price.toFixed(2)}` });
  }

  if (typeof product.rating === 'number' && product.rating > 0) {
    metadata.push({ label: 'Calificación', value: product.rating.toFixed(1) });
  }

  if (typeof product.stock === 'number') {
    metadata.push({ label: 'Stock', value: String(product.stock) });
  }

  if (
    typeof product.discountPercentage === 'number' &&
    product.discountPercentage > 0
  ) {
    metadata.push({
      label: 'Descuento',
      value: `${product.discountPercentage.toFixed(0)}%`,
    });
  }

  return {
    id: String(product.id),
    source: 'dummyJsonProducts',
    title: product.title,
    subtitle: [product.brand, category]
      .filter((value): value is string => Boolean(value))
      .join(' • '),
    description: product.description,
    imageUrl: product.thumbnail ?? product.images?.[0],
    badges,
    metadata,
    rawUrl: `https://dummyjson.com/products/${product.id}`,
  };
}

function formatCategory(category?: string) {
  if (!category) return undefined;

  return category
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
