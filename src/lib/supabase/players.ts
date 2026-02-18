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

  if (!matchPlayerData) {
    return null;
  }

  // Return a player object compatible with the expected type
  // Some fields are fallback placeholders because match_team_players lacks full player profile data
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
