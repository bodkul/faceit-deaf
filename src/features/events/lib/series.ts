import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";

type SeriesTeam = {
  faction_id: string;
  team_name: string;
  is_winner: boolean | null;
  faction_key?: string;
};

type SeriesMap = { winner_faction_id: string | null; match_round?: number };

type SeriesMatch = {
  match_id: string;
  started_at: string | null;
  finished_at?: string | null;
  best_of: number | null;
  score_faction1?: number | null;
  score_faction2?: number | null;
  teams: SeriesTeam[];
  maps: SeriesMap[];
};

const MAPS_TO_WIN = 2;

function pairKey(match: SeriesMatch) {
  return match.teams
    .map((t) => normalizeTeamName(t.team_name))
    .sort()
    .join("|");
}

function mapWins(maps: SeriesMap[], factionId: string) {
  return maps.filter((m) => m.winner_faction_id === factionId).length;
}

function isDecided(match: SeriesMatch) {
  return match.teams.some(
    (t) => mapWins(match.maps, t.faction_id) >= MAPS_TO_WIN,
  );
}

/** Folds the next game of a series into it; the winner is whoever took more maps. */
function append<M extends SeriesMatch>(series: M, next: M): M {
  const maps = [...series.maps, ...next.maps].map((map, index) =>
    map.match_round === undefined ? map : { ...map, match_round: index + 1 },
  );
  const wins = (t: SeriesTeam) => mapWins(maps, t.faction_id);
  const [a, b] = series.teams.map(wins);
  const score = (key: string) => {
    const team = series.teams.find((t) => t.faction_key === key);
    return team ? wins(team) : null;
  };

  return {
    ...series,
    best_of: Math.max(series.best_of ?? 1, 3),
    finished_at: next.finished_at ?? series.finished_at,
    score_faction1: score("faction1"),
    score_faction2: score("faction2"),
    teams: series.teams.map((team) => ({
      ...team,
      is_winner: a === b ? null : wins(team) === Math.max(a, b),
    })),
    maps,
  };
}

/**
 * Some BO3 series were played as separate FACEIT matches (BO1 + BO1 + BO1,
 * or a BO3 whose decider was replayed as a BO1). Matches between the same
 * two teams on the same day are merged until one team has won two maps.
 *
 * Each series keeps the id of its first match; `match_ids` lists all of them
 * so links to any game resolve to the series.
 */
export function mergeSeries<M extends SeriesMatch>(
  matches: M[],
): (M & { match_ids: string[] })[] {
  const ordered = [...matches].sort((a, b) =>
    (a.started_at ?? "").localeCompare(b.started_at ?? ""),
  );

  const series: (M & { match_ids: string[] })[] = [];
  const open = new Map<string, number>();

  for (const match of ordered) {
    const key = `${match.started_at?.slice(0, 10)}|${pairKey(match)}`;
    const index = open.get(key);

    if (index !== undefined && match.best_of === 1) {
      const current = series[index];
      series[index] = {
        ...append(current, match),
        match_ids: [...current.match_ids, match.match_id],
      };
      if (isDecided(series[index])) open.delete(key);
      continue;
    }

    series.push({ ...match, match_ids: [match.match_id] });
    if (!isDecided(match) && match.started_at) {
      open.set(key, series.length - 1);
    } else {
      open.delete(key);
    }
  }

  return series;
}
