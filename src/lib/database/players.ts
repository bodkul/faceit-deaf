import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/database";
import { PlayerWithStats } from "@/types/api";

export async function upsertPlayer(player: PlayerWithStats) {
  const { error } = await supabase
    .from<"players", Database["Tables"]["players"]>("players")
    .upsert({
      id: player.player_id,
      avatar: player.avatar,
      nickname: player.nickname,
      skill_level: player.games.cs2.skill_level,
      faceit_elo: player.games.cs2.faceit_elo,
      faceit_url: player.faceit_url,
      steam_id_64: player.steam_id_64,
      matches: player.lifetime.Matches,
      average_headshots_percent: player.lifetime["Average Headshots %"],
      average_kd_ratio: player.lifetime["Average K/D Ratio"],
    });

  if (error) {
    console.error(`Failed to upsert player: ${player.player_id}`, error);
  }
}

export async function upsertPlayers(players: PlayerWithStats[]) {
  await Promise.all(players.map(upsertPlayer));
}

export async function getPlayersByIds(playerIds: string[]) {
  const { data: players, error } = await supabase
    .from<"players", Database["Tables"]["players"]>("players")
    .select("id, faceit_elo")
    .in("id", playerIds);

  if (error) {
    console.error("Error fetching players by IDs", error);
    return [];
  }

  return players;
}

export async function getPlayerIds() {
  const { data: players, error } = await supabase
    .from<"players", Database["Tables"]["players"]>("players")
    .select("id")
    .order("faceit_elo", { ascending: false });

  if (error) {
    console.error("Error fetching player IDs:", error);
    return [];
  }

  return players.map((player) => player.id);
}

export async function getTwitchUsernames() {
  const { data, error } = await supabase
    .from<"players", Database["Tables"]["players"]>("players")
    .select("twitch_username")
    .not("twitch_username", "is", null);

  if (error) {
    console.error("Error fetching twitch usernames", error);
    return [];
  }

  return data.map((player) => player.twitch_username);
}
