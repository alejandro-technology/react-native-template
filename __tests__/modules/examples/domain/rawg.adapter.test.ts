import {
  mapRawgGame,
  mapRawgPageToExampleListPage,
} from '@modules/examples/domain/rawg.adapter';

describe('rawg.adapter', () => {
  it('debe mapear una pagina de juegos al modelo neutral', () => {
    const result = mapRawgPageToExampleListPage(
      {
        count: 542,
        next: 'https://api.rawg.io/api/games?key=test-key&page=3',
        previous: null,
        results: [
          {
            id: 3498,
            slug: 'grand-theft-auto-v',
            name: 'Grand Theft Auto V',
            released: '2013-09-17',
            background_image: 'https://images.rawg.io/gta-v.jpg',
            rating: 4.48,
            metacritic: 92,
            genres: [{ name: 'Action' }, { name: 'Adventure' }],
            platforms: [
              { platform: { name: 'PC' } },
              { platform: { name: 'PlayStation 5' } },
            ],
          },
        ],
      },
      2,
    );

    expect(result.currentPage).toBe(2);
    expect(result.nextPage).toBe(3);
    expect(result.totalItems).toBe(542);
    expect(result.items[0]).toEqual({
      id: '3498',
      source: 'rawg',
      title: 'Grand Theft Auto V',
      subtitle: 'Lanzamiento: 2013-09-17',
      description: 'Plataformas: PC, PlayStation 5',
      imageUrl: 'https://images.rawg.io/gta-v.jpg',
      badges: ['Action', 'Adventure'],
      metadata: [
        { label: 'Lanzamiento', value: '2013-09-17' },
        { label: 'Calificación', value: '4.5' },
        { label: 'Metacritic', value: '92' },
      ],
      rawUrl: 'https://rawg.io/games/grand-theft-auto-v',
    });
  });

  it('debe tolerar campos opcionales ausentes', () => {
    const result = mapRawgGame({
      id: 1,
      name: 'Juego sin imagen',
      released: null,
      background_image: null,
      rating: null,
      metacritic: null,
      genres: [],
      parent_platforms: [{ platform: { name: 'Xbox Series S/X' } }],
      slug: null,
    });

    expect(result).toEqual({
      id: '1',
      source: 'rawg',
      title: 'Juego sin imagen',
      subtitle: undefined,
      description: 'Plataformas: Xbox Series S/X',
      imageUrl: undefined,
      badges: [],
      metadata: [],
      rawUrl: undefined,
    });
  });
});
