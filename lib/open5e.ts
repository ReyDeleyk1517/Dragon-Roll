const OPEN5E_MONSTERS_URL = "https://api.open5e.com/v1/monsters/";
const REQUEST_TIMEOUT_MS = 8000;
const SEARCH_FETCH_LIMIT = 25;

export type Open5eMonsterOption = {
  slug: string;
  name: string;
  challengeRating: string;
  type: string;
  size: string;
};

export type Open5eMonsterDetail = {
  slug: string;
  name: string;
  armorClass: number;
  maxHp: number;
  initiativeBonus: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

type Open5eMonsterResponse = {
  slug?: unknown;
  name?: unknown;
  armor_class?: unknown;
  hit_points?: unknown;
  strength?: unknown;
  dexterity?: unknown;
  constitution?: unknown;
  intelligence?: unknown;
  wisdom?: unknown;
  charisma?: unknown;
  challenge_rating?: unknown;
  type?: unknown;
  size?: unknown;
};

function toInt(value: unknown, fallback = 10): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

async function fetchJson(url: string, revalidate: number) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate },
  });

  if (!response.ok) {
    return { ok: false as const, status: response.status };
  }

  return { ok: true as const, data: (await response.json()) as unknown };
}

/**
 * Searches the Open5e monster library by name. Fetches a wide name match, then
 * re-ranks so exact and prefix matches appear first. Server-only.
 */
export async function searchOpen5eMonsters(
  query: string,
  limit = 8
): Promise<Open5eMonsterOption[]> {
  const term = query.trim();
  const url = new URL(OPEN5E_MONSTERS_URL);
  url.searchParams.set("name__icontains", term);
  url.searchParams.set("limit", String(SEARCH_FETCH_LIMIT));

  const result = await fetchJson(url.toString(), 300);

  if (!result.ok) {
    throw new Error(`Open5e search failed with status ${result.status}.`);
  }

  const { results } = result.data as { results?: Open5eMonsterResponse[] };

  const options = (results ?? []).map((monster) => ({
    slug: String(monster.slug ?? ""),
    name: String(monster.name ?? "Unknown"),
    challengeRating: String(monster.challenge_rating ?? "?"),
    type: String(monster.type ?? ""),
    size: String(monster.size ?? ""),
  }));

  const lowerTerm = term.toLowerCase();

  function relevance(name: string): number {
    const lowerName = name.toLowerCase();

    if (lowerName === lowerTerm) {
      return 0;
    }

    if (lowerName.startsWith(lowerTerm)) {
      return 1;
    }

    return 2;
  }

  return options
    .sort(
      (a, b) =>
        relevance(a.name) - relevance(b.name) ||
        a.name.localeCompare(b.name)
    )
    .slice(0, limit);
}

/**
 * Loads a single Open5e monster and normalizes it to the fields used by
 * `MonsterTemplate`. Returns `null` when the monster does not exist. Server-only.
 */
export async function getOpen5eMonster(
  slug: string
): Promise<Open5eMonsterDetail | null> {
  const url = new URL(`${encodeURIComponent(slug)}/`, OPEN5E_MONSTERS_URL);
  const result = await fetchJson(url.toString(), 86400);

  if (!result.ok) {
    if (result.status === 404) {
      return null;
    }
    throw new Error(`Open5e request failed with status ${result.status}.`);
  }

  const monster = result.data as Open5eMonsterResponse;
  const dexterity = toInt(monster.dexterity);

  return {
    slug: String(monster.slug ?? slug),
    name: String(monster.name ?? "Unknown"),
    armorClass: toInt(monster.armor_class),
    maxHp: Math.max(1, toInt(monster.hit_points, 1)),
    initiativeBonus: abilityModifier(dexterity),
    strength: toInt(monster.strength),
    dexterity,
    constitution: toInt(monster.constitution),
    intelligence: toInt(monster.intelligence),
    wisdom: toInt(monster.wisdom),
    charisma: toInt(monster.charisma),
  };
}
