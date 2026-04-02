import {
  mapDummyJsonProduct,
  mapDummyJsonProductsPageToExampleListPage,
} from '@modules/examples/domain/dummy-json-products.adapter';

describe('dummy-json-products.adapter', () => {
  it('debe mapear una pagina de productos al modelo neutral', () => {
    const result = mapDummyJsonProductsPageToExampleListPage(
      {
        products: [
          {
            id: 101,
            title: 'Apple AirPods Max Silver',
            description: 'Auriculares premium con cancelación de ruido.',
            category: 'mobile-accessories',
            price: 549.99,
            discountPercentage: 8.4,
            rating: 4.71,
            stock: 12,
            brand: 'Apple',
            thumbnail: 'https://cdn.dummyjson.com/airpods-max.png',
            availabilityStatus: 'In Stock',
          },
        ],
        total: 63,
        skip: 30,
        limit: 30,
      },
      2,
    );

    expect(result).toEqual({
      items: [
        {
          id: '101',
          source: 'dummyJsonProducts',
          title: 'Apple AirPods Max Silver',
          subtitle: 'Apple • Mobile Accessories',
          description: 'Auriculares premium con cancelación de ruido.',
          imageUrl: 'https://cdn.dummyjson.com/airpods-max.png',
          badges: ['Mobile Accessories', 'In Stock'],
          metadata: [
            { label: 'Precio', value: '$549.99' },
            { label: 'Calificación', value: '4.7' },
            { label: 'Stock', value: '12' },
            { label: 'Descuento', value: '8%' },
          ],
          rawUrl: 'https://dummyjson.com/products/101',
        },
      ],
      currentPage: 2,
      nextPage: 3,
      totalPages: 3,
      totalItems: 63,
    });
  });

  it('debe tolerar campos opcionales ausentes', () => {
    const result = mapDummyJsonProduct({
      id: 7,
      title: 'Producto sin extras',
      category: 'beauty',
      description: undefined,
      images: ['https://cdn.dummyjson.com/product.png'],
    });

    expect(result).toEqual({
      id: '7',
      source: 'dummyJsonProducts',
      title: 'Producto sin extras',
      subtitle: 'Beauty',
      description: undefined,
      imageUrl: 'https://cdn.dummyjson.com/product.png',
      badges: ['Beauty'],
      metadata: [],
      rawUrl: 'https://dummyjson.com/products/7',
    });
  });
});
