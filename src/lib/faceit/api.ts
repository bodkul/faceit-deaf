import { mapAsync } from "es-toolkit";

import { faceit } from "./client";
import type { Match, MatchStats, Player } from "./types";

const BATCH_CONCURRENCY = 10;

/** HTTP errors already reject in the client, so only an empty body is left. */
function unwrap<T>({ data, response }: { data?: T; response: Response }) {
  if (data === undefined) {
    throw new Error(`Empty FACEIT response from ${response.url}`);
  }
  return data;
}

export async function getPlayer(playerId: string) {
  const result = await faceit.GET("/players/{player_id}", {
    params: { path: { player_id: playerId } },
  });
  return unwrap(result) as Player;
}

export function getPlayers(playerIds: string[]) {
  return mapAsync(playerIds, (id) => getPlayer(id), {
    concurrency: BATCH_CONCURRENCY,
  });
}

export async function getMatch(matchId: string) {
  const result = await faceit.GET("/matches/{match_id}", {
    params: { path: { match_id: matchId } },
  });
  return unwrap(result) as Match;
}

export function getMatches(matchIds: string[]) {
  return mapAsync(matchIds, (id) => getMatch(id), {
    concurrency: BATCH_CONCURRENCY,
  });
}

export async function getMatchStats(matchId: string): Promise<MatchStats> {
  const result = await faceit.GET("/matches/{match_id}/stats", {
    params: { path: { match_id: matchId } },
  });
  return unwrap(result);
}
