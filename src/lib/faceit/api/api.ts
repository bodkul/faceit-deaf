import { uniqBy } from "lodash-es";
import pMap from "p-map";

import { COMPETITION_ID } from "@/lib/faceit";
import faceitClient from "@/lib/faceit/client";

import type { Match, MatchStats, Player } from "./types";

export const fetchPlayer = async (playerId: string) => {
  try {
    return await faceitClient<Player>(`players/${playerId}`).json();
  } catch (error) {
    console.error(`Failed to fetch player with ID ${playerId}:`, error);
    throw new Error(`Unable to fetch player with ID ${playerId}`);
  }
};

export const fetchPlayers = async (playerIds: string[]) => {
  return await pMap(playerIds, fetchPlayer, { concurrency: 10 });
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
  return await pMap(matchIds, fetchMatch, { concurrency: 10 });
};

export const fetchMatchStats = async (matchId: string) => {
  try {
    return await faceitClient<MatchStats>(`matches/${matchId}/stats`).json();
  } catch (error) {
    console.error(`Failed to fetch match stats with ID ${matchId}:`, error);
    throw new Error(`Unable to fetch match stats with ID ${matchId}`);
  }
};

interface MatchHistory {
  match_id: string;
  game_id: string;
  region: string;
  match_type: string;
  game_mode: string;
  max_players: number;
  teams_size: number;
  teams: Record<
    string,
    {
      team_id: string;
      nickname: string;
      avatar: string;
      type: string;
      players: {
        player_id: string;
        nickname: string;
        avatar: string;
        skill_level: number;
        game_player_id: string;
        game_player_name: string;
        faceit_url: string;
      }[];
    }
  >;
  playing_players: string[];
  competition_id: string;
  competition_name: string;
  competition_type: string;
  organizer_id: string;
  status: string;
  started_at: number;
  finished_at: number;
  results: {
    winner: string;
    score: Record<string, number>;
  };
  faceit_url: string;
}

const GAME = "cs2";
const REGION = "EU";
const ORGANIZER_ID = "faceit";

export async function fetchFullPlayerHistory(playerId: string) {
  console.log(`    🔄 Загрузка истории матчей для игрока: ${playerId}`);

  let to = 0;
  let requestCount = 0;
  const allMatches: MatchHistory[] = [];

  while (true) {
    requestCount++;
    const searchParams = new URLSearchParams({
      game: GAME,
      limit: "100",
    });

    if (allMatches.length < 1000) {
      searchParams.append("offset", allMatches.length.toString());
      console.log(
        `      📥 Запрос ${requestCount}: offset=${allMatches.length}`,
      );
    } else {
      searchParams.append("to", to.toString());
      console.log(`      📥 Запрос ${requestCount}: timestamp=${to}`);
    }

    try {
      const { items } = await faceitClient<{ items: MatchHistory[] }>(
        `players/${playerId}/history`,
        { searchParams },
      ).json();

      console.log(
        `      ✅ Получено ${items.length} матчей (всего: ${allMatches.length + items.length})`,
      );

      allMatches.push(...items);

      if (items.length !== 100) {
        console.log(`      🏁 Достигнут конец истории матчей`);
        break;
      }

      to = items[items.length - 1].finished_at;
    } catch (error) {
      console.error(`      ❌ Ошибка при запросе ${requestCount}:`, error);
      throw error;
    }
  }

  console.log(
    `    🔍 Фильтрация матчей (всего загружено: ${allMatches.length})`,
  );

  const filteredUniqueMatches = uniqBy(allMatches, "match_id").filter(
    (m) =>
      m.region === REGION &&
      m.organizer_id === ORGANIZER_ID &&
      m.competition_id === COMPETITION_ID,
  );

  return filteredUniqueMatches;
}
