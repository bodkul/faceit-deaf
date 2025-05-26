import faceitClient from "@/lib/faceit/client";

import type { Match, MatchStats, Player } from "./types";

const DELAY_MS = 1000;
const RETRIES = 5;

export async function fetchPlayer(playerId: string) {
  const response = await faceitClient.get<Player>(`/players/${playerId}`);
  return response.data;
}

export async function fetchPlayers(playerIds: string[]) {
  return await Promise.all(playerIds.map(fetchPlayer));
}

export async function fetchMatch(matchId: string) {
  const response = await faceitClient.get<Match>(`/matches/${matchId}`);
  return response.data;
}

export async function fetchMatches(matchId: string[]) {
  return await Promise.all(matchId.map(fetchMatch));
}

export async function fetchMatchStats(matchId: string) {
  for (let i = 0; i < RETRIES; i++) {
    try {
      const response = await faceitClient.get<MatchStats>(
        `/matches/${matchId}/stats`,
      );
      return response.data;
    } catch (err) {
      if (i === RETRIES - 1) throw err;
      await new Promise((res) => setTimeout(res, DELAY_MS));
    }
  }
  throw new Error("Failed to fetch matchStats after several attempts");
}
