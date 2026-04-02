import type { ExampleListItem } from './example-list-item.model';

interface RickAndMortyCharacterResponse {
  id: number;
  image: string;
  name: string;
  gender: string;
  species: string;
  status: string;
  type: string;
  origin: { name: string };
  location: { name: string };
  url: string;
}

interface RickAndMortyCharactersPageResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: RickAndMortyCharacterResponse[];
}

export function mapRickAndMortyPageToExampleListPage(
  response: RickAndMortyCharactersPageResponse,
  currentPage: number,
) {
  return {
    items: response.results.map(character =>
      mapRickAndMortyCharacter(character),
    ),
    currentPage,
    nextPage: getNextPageFromUrl(response.info.next),
    totalPages: response.info.pages,
    totalItems: response.info.count,
  };
}

export function mapRickAndMortyCharacter(
  character: RickAndMortyCharacterResponse,
): ExampleListItem {
  const badges = [character.status, character.species].filter(Boolean);

  return {
    id: String(character.id),
    source: 'rickAndMorty',
    title: character.name,
    subtitle: character.type || character.species,
    description: `${character.origin.name} • ${character.location.name}`,
    imageUrl: character.image,
    badges,
    metadata: [
      { label: 'Género', value: character.gender },
      { label: 'Estado', value: character.status },
    ],
    rawUrl: character.url,
  };
}

function getNextPageFromUrl(url: string | null): number | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const page = parsed.searchParams.get('page');
    return page ? Number(page) : null;
  } catch {
    return null;
  }
}
