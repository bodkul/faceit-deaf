import pLimit from "p-limit";

import faceitClient from "@/lib/faceit/client";

import type { Match, MatchStats, Player } from "./types";

const limit = pLimit(5);

export const fetchPlayer = async (playerId: string) => {
  try {
    return await faceitClient<Player>(`players/${playerId}`).json();
  } catch (error) {
    console.error(`Failed to fetch player with ID ${playerId}:`, error);
    throw new Error(`Unable to fetch player with ID ${playerId}`);
  }
};

export const fetchPlayers = async (playerIds: string[]) => {
  return await Promise.all(
    playerIds.map((playerId) => limit(() => fetchPlayer(playerId))),
  );
};

export const fetchMatch = async (matchId: string) => {
  try {
    return await faceitClient<Match>(`matches/${matchId}`).json();
  } catch (error) {
    console.error(`Failed to fetch match with ID ${matchId}:`, error);
    throw new Error(`Unable to fetch match with ID ${matchId}`);
  }
};

export const fetchMatches = async (matchIds: string[]) => {
  return await Promise.all(
    matchIds.map((matchId) => limit(() => fetchMatch(matchId))),
  );
};

export const fetchMatchStats = async (matchId: string) => {
  try {
    return await faceitClient<MatchStats>(`matches/${matchId}/stats`).json();
  } catch (error) {
    console.error(`Failed to fetch match stats with ID ${matchId}:`, error);
    throw new Error(`Unable to fetch match stats with ID ${matchId}`);
  }
};
