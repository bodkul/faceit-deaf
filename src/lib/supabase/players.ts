import { validate as uuidValidate } from "uuid";

import { supabaseClient } from "@/lib/supabase";

export async function getPlayerIdByNickname(nickname: string) {
  if (!uuidValidate(nickname)) {
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
  if (!uuidValidate(nickname)) {
    const { data: playerData } = await supabaseClient
      .from("players")
      .select(
        "id, avatar, nickname, steam_id_64, twitch_username, country, faceit_elo",
      )
      .match({ nickname })
      .single();

    if (playerData) return playerData;
  }

  const { data: matchPlayerData } = await supabaseClient
    .from("match_team_players")
    .select(
      "player_id_mandatory, nickname, game_skill_level, match_teams!inner(matches!inner(started_at))",
    )
    .eq("player_id_mandatory", nickname)
    .order("started_at", {
      ascending: false,
      referencedTable: "match_teams.matches",
    })
    .limit(1)
    .single();

  if (!matchPlayerData) return null;

  return {
    id: matchPlayerData.player_id_mandatory,
    nickname: matchPlayerData.nickname,
    skill_level: matchPlayerData.game_skill_level ?? 0,
    avatar: "",
    steam_id_64: "",
    twitch_username: null,
    country: null,
    faceit_elo: 0,
  };
}
