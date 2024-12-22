import faceitClient from "@/lib/faceit/client";

import { HubStats, Match, MatchStats, Player, PlayerCS2Stats } from "./types";

export async function fetchPlayer(playerId: string) {
  const response = await faceitClient.get<Player>(`/players/${playerId}`);
  return response.data;
}

export async function fetchPlayers(playerIds: string[]) {
  return await Promise.all(playerIds.map(fetchPlayer));
}

export async function fetchPlayerCS2Stats(
  playerId: string,
  params?: URLSearchParams,
) {
  const response = await faceitClient.get<PlayerCS2Stats>(
    `/players/${playerId}/games/cs2/stats`,
    {
      params,
    },
  );
  return response.data;
}

export async function fetchMatch(matchId: string) {
  const response = await faceitClient.get<Match>(`/matches/${matchId}`);
  return response.data;
}

export async function fetchMatchStats(matchId: string) {
  const response = await faceitClient.get<MatchStats>(
    `/matches/${matchId}/stats`,
  );
  return response.data;
}

export async function fetchHubStats(hubId: string) {
  const response = await faceitClient.get<HubStats>(`/hubs/${hubId}/stats`);
  return response.data;
}
