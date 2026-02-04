import { validate as uuidValidate } from "uuid";

import { supabaseClient } from "@/lib/supabase";

export async function getPlayerByUsername(nickname: string) {
  if (!uuidValidate(nickname)) {
    // First, try to get player from the players table
    const { data: playerData } = await supabaseClient
      .from("players")
      .select(
        "id, avatar, nickname, steam_id_64, twitch_username, country, skill_level, faceit_elo",
      )
      .match({ nickname })
      .single();

    if (playerData) {
      return playerData;
    }
  }

  // If not found in players table, try to get from match_team_players
  const { data: matchPlayerData } = await supabaseClient
    .from("match_team_players")
    .select("player_id_mandatory, nickname, game_skill_level")
    .eq("player_id_mandatory", nickname)
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (!matchPlayerData) {
    return null;
  }

  // Return a player object compatible with the expected type
  // Some fields will be null since match_team_players doesn't have all player info
  return {
    id: matchPlayerData.player_id_mandatory,
    nickname: matchPlayerData.nickname,
    skill_level: matchPlayerData.game_skill_level ?? 0,
    avatar: "", // No avatar in match_team_players
    steam_id_64: "", // No steam_id in match_team_players
    twitch_username: null,
    country: null,
    faceit_elo: 0, // No elo in match_team_players
  };
}
