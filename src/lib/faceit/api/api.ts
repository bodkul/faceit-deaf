import pMap from "p-map";
import pThrottle from "p-throttle";

import faceitClient from "@/lib/faceit/client";

import type { Match, MatchStats, Player } from "./types";

const throttle = pThrottle({ limit: 10, interval: 1000 });

export const fetchPlayer = throttle(async (playerId: string) => {
  try {
    return await faceitClient<Player>(`players/${playerId}`).json();
  } catch (error) {
    console.error(`Failed to fetch player with ID ${playerId}:`, error);
    throw new Error(`Unable to fetch player with ID ${playerId}`);
  }
});

export const fetchPlayers = async (playerIds: string[]) => {
  return await pMap(playerIds, fetchPlayer, { concurrency: 10 });
};

export const fetchMatch = throttle(async (matchId: string) => {
  try {
    return await faceitClient<Match>(`matches/${matchId}`).json();
  } catch (error) {
    console.error(`Failed to fetch match with ID ${matchId}:`, error);
    throw new Error(`Unable to fetch match with ID ${matchId}`);
  }
});

export const fetchMatches = async (matchIds: string[]) => {
  return await pMap(matchIds, fetchMatch, { concurrency: 10 });
};

export const fetchMatchStats = throttle(async (matchId: string) => {
  try {
    return await faceitClient<MatchStats>(`matches/${matchId}/stats`).json();
  } catch (error) {
    console.error(`Failed to fetch match stats with ID ${matchId}:`, error);
    throw new Error(`Unable to fetch match stats with ID ${matchId}`);
  }
});
