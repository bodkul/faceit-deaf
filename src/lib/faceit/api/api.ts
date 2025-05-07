import faceitClient from "@/lib/faceit/client";

import { HubStats, Match, MatchStats, Player, PlayerCS2Stats } from "./types";

const GAME = "cs2";
const REGION = "EU";
const ORGANIZER_ID = "faceit";
const COMPETITION_ID = "f4148ddd-bce8-41b8-9131-ee83afcdd6dd";

export async function fetchPlayer(playerId: string) {
  const response = await faceitClient.get<Player>(`/players/${playerId}`);
  return response.data;
}

export async function fetchPlayers(playerIds: string[]) {
  return await Promise.all(playerIds.map(fetchPlayer));
}

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

export async function fetchFullPlayerHistory(playerId: string) {
  let to = 0;
  const allMatches: MatchHistory[] = [];

  while (true) {
    const params = new URLSearchParams({
      game: GAME,
      limit: "100",
    });

    if (allMatches.length < 1000) {
      params.append("offset", allMatches.length.toString());
    } else {
      params.append("to", to.toString());
    }

    const response = await faceitClient.get<{ items: MatchHistory[] }>(
      `/players/${playerId}/history`,
      { params },
    );

    const { items } = response.data;

    allMatches.push(...items);

    if (items.length !== 100) break;

    to = items[items.length - 1].finished_at;
  }

  return Array.from(
    new Map(allMatches.map((m) => [m.match_id, m])).values(),
  ).filter(
    (m) =>
      m.region == REGION &&
      m.organizer_id == ORGANIZER_ID &&
      m.competition_id == COMPETITION_ID,
  );
}

export async function fetchPlayerCS2Stats(
  playerId: string,
  params?: URLSearchParams,
) {
  const response = await faceitClient.get<PlayerCS2Stats>(
    `/players/${playerId}/games/${GAME}/stats`,
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
