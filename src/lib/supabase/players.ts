import { fetchPlayer } from "@/lib/faceit/api";
import { isUUID } from "@/lib/utils";

import { supabaseClient } from "./client";

export async function getPlayerIdByNickname(nickname: string) {
  if (!isUUID(nickname)) {
    const { data: playerData } = await supabaseClient
      .from("players")
      .select("id")
      .match({ nickname })
      .single();

    if (playerData) return playerData.id;
  }

  const { data: matchPlayerData } = await supabaseClient
    .from("match_team_players")
    .select("player_id_mandatory, match_teams!inner(matches!inner(started_at))")
    .eq("player_id_mandatory", nickname)
    .order("started_at", {
      ascending: false,
      referencedTable: "match_teams.matches",
    })
    .limit(1)
    .single();

  if (!matchPlayerData) return null;

  return matchPlayerData.player_id_mandatory;
}

export async function getPlayerByUsername(nickname: string) {
  if (!isUUID(nickname)) {
    const { data: playerData } = await supabaseClient
      .from("players")
      .select(
        "id, avatar, nickname, steam_id_64, twitch_username, country, faceit_elo",
      )
      .match({ nickname })
      .single();

    if (playerData) return playerData;
  }

  const playerDetails = await fetchPlayer(nickname);

  return {
    id: playerDetails.player_id,
    nickname: playerDetails.nickname,
    avatar: playerDetails.avatar,
    steam_id_64: playerDetails.steam_id_64,
    twitch_username: null,
    country: playerDetails.country,
    faceit_elo: playerDetails.games.cs2.faceit_elo,
  };
}
