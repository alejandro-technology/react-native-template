import type { ExampleListItem } from './example-list-item.model';

interface SimpsonsCharacterResponse {
  id: number;
  age: number | null;
  gender: string;
  name: string;
  occupation: string;
  portrait_path: string;
  phrases: string[];
  status: string;
}

interface SimpsonsCharactersPageResponse {
  count: number;
  next: string | null;
  prev: string | null;
  pages: number;
  results: SimpsonsCharacterResponse[];
}

export function mapSimpsonsPageToExampleListPage(
  response: SimpsonsCharactersPageResponse,
  currentPage: number,
) {
  return {
    items: response.results.map(character => mapSimpsonsCharacter(character)),
    currentPage,
    nextPage: getNextPageFromUrl(response.next),
    totalPages: response.pages,
    totalItems: response.count,
  };
}

export function mapSimpsonsCharacter(
  character: SimpsonsCharacterResponse,
): ExampleListItem {
  const imageUrl = character.portrait_path.startsWith('http')
    ? character.portrait_path
    : `https://cdn.thesimpsonsapi.com/500${character.portrait_path}`;

  return {
    id: String(character.id),
    source: 'simpsons',
    title: character.name,
    subtitle: character.occupation,
    description: character.phrases[0] || undefined,
    imageUrl,
    badges: [character.status, character.gender].filter(Boolean),
    metadata: character.age
      ? [{ label: 'Edad', value: String(character.age) }]
      : [],
    rawUrl: `https://thesimpsonsapi.com/api/characters/${character.id}`,
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
