import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/database";
import { Player } from "@/types/api";

export async function upsertPlayer(player: Player) {
  const { error } = await supabase
    .from<"players", Database["Tables"]["players"]>("players")
    .upsert({
      id: player.player_id,
      avatar: player.avatar,
      nickname: player.nickname,
      skill_level: player.games.cs2.skill_level,
      faceit_elo: player.games.cs2.faceit_elo,
      faceit_url: player.faceit_url,
    });

  if (error) {
    console.error(`Failed to upsert player: ${player.player_id}`, error);
  }
}

export async function upsertPlayers(players: Player[]) {
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

export async function getPlayers() {
  const { data: players, error } = await supabase
    .from<"players", Database["Tables"]["players"]>("players")
    .select("*, eloHistory ( player_elo, created_at )")
    .gt(
      "eloHistory.created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    )
    .order("faceit_elo", { ascending: false });

  if (error) {
    console.error("Error fetching players", error);
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
