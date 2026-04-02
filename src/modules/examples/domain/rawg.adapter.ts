import type {
  ExampleListItem,
  ExampleListPage,
} from './example-list-item.model';

interface RawgNamedValue {
  name?: string | null;
}

interface RawgPlatformValue {
  platform?: RawgNamedValue | null;
}

interface RawgGameResponse {
  id: number;
  slug?: string | null;
  name: string;
  released?: string | null;
  background_image?: string | null;
  rating?: number | null;
  metacritic?: number | null;
  genres?: RawgNamedValue[];
  platforms?: RawgPlatformValue[];
  parent_platforms?: RawgPlatformValue[];
}

interface RawgGamesPageResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGameResponse[];
}

export function mapRawgPageToExampleListPage(
  response: RawgGamesPageResponse,
  currentPage: number,
): ExampleListPage {
  return {
    items: response.results.map(game => mapRawgGame(game)),
    currentPage,
    nextPage: getNextPageFromUrl(response.next),
    totalItems: response.count,
  };
}

export function mapRawgGame(game: RawgGameResponse): ExampleListItem {
  const badges = getNames(game.genres).slice(0, 3);
  const platforms = getPlatformNames(game).slice(0, 3);
  const metadata: ExampleListItem['metadata'] = [];

  if (game.released) {
    metadata.push({ label: 'Lanzamiento', value: game.released });
  }

  if (typeof game.rating === 'number' && game.rating > 0) {
    metadata.push({ label: 'Calificación', value: game.rating.toFixed(1) });
  }

  if (typeof game.metacritic === 'number' && game.metacritic > 0) {
    metadata.push({ label: 'Metacritic', value: String(game.metacritic) });
  }

  return {
    id: String(game.id),
    source: 'rawg',
    title: game.name,
    subtitle: game.released ? `Lanzamiento: ${game.released}` : undefined,
    description: platforms.length
      ? `Plataformas: ${platforms.join(', ')}`
      : undefined,
    imageUrl: game.background_image ?? undefined,
    badges,
    metadata,
    rawUrl: game.slug ? `https://rawg.io/games/${game.slug}` : undefined,
  };
}

function getPlatformNames(game: RawgGameResponse) {
  const platforms = game.platforms?.length
    ? game.platforms
    : game.parent_platforms ?? [];

  return Array.from(
    new Set(
      platforms
        .map(platform => platform.platform?.name?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function getNames(values?: RawgNamedValue[]) {
  return (
    values
      ?.map(value => value.name?.trim())
      .filter((value): value is string => Boolean(value)) ?? []
  );
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
