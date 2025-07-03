import faceitClient from "@/lib/faceit/client";

import type { Match, MatchStats, Player } from "./types";

export const fetchPlayer = async (playerId: string) => {
  return await faceitClient<Player>(`players/${playerId}`).json();
};

export const fetchPlayers = async (playerIds: string[]) => {
  return await Promise.all(playerIds.map(fetchPlayer));
};

export const fetchMatch = async (matchId: string) => {
  return await faceitClient<Match>(`matches/${matchId}`).json();
};

export const fetchMatches = async (matchId: string[]) => {
  return await Promise.all(matchId.map(fetchMatch));
};

export const fetchMatchStats = async (matchId: string) => {
  return await faceitClient<MatchStats>(`matches/${matchId}/stats`).json();
};
