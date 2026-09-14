import { mapAsync } from "es-toolkit";

import faceitClient from "@/lib/faceit/client";

import type { Match, MatchStats, Player } from "./types";

export const GAME = "cs2";

export const fetchPlayer = async (playerId: string) => {
  try {
    return await faceitClient<Player>(`players/${playerId}`).json();
  } catch (error) {
    console.error(`Failed to fetch player with ID ${playerId}:`, error);
    throw new Error(`Unable to fetch player with ID ${playerId}`);
  }
};

export const fetchPlayers = async (playerIds: string[]) => {
  return await mapAsync(playerIds, fetchPlayer, { concurrency: 10 });
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
  return await mapAsync(matchIds, fetchMatch, { concurrency: 10 });
};

export const fetchMatchStats = async (matchId: string) => {
  try {
    return await faceitClient<MatchStats>(`matches/${matchId}/stats`).json();
  } catch (error) {
    console.error(`Failed to fetch match stats with ID ${matchId}:`, error);
    throw new Error(`Unable to fetch match stats with ID ${matchId}`);
  }
};
