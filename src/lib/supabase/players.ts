import { logger } from "@/lib/logger";
import { supabase } from "@/lib/supabase/client";
import type { TablesInsert } from "@/lib/supabase/types";

export async function upsertPlayers(players: TablesInsert<"players">[]) {
  const { error } = await supabase.from("players").upsert(players);

  if (error) {
    logger.error(`Failed to upsert players: ${error}`);
  }
}

export async function getPlayersByIds(playerIds: string[]) {
  const { data: players, error } = await supabase
    .from("players")
    .select("id, faceit_elo")
    .in("id", playerIds);

  if (error) {
    logger.error(`Error fetching players by IDs: ${error}`);
  }

  return players || [];
}

export async function getPlayerIds() {
  const { data: players, error } = await supabase
    .from("players")
    .select("id")
    .order("faceit_elo", { ascending: false });

  if (error) {
    logger.error(`Error fetching player IDs: ${error}`);
  }

  return players?.map((player) => player.id) || [];
}

export async function getTwitchUsernames() {
  const { data, error } = await supabase
    .from("players")
    .select("twitch_username")
    .not("twitch_username", "is", null);

  if (error) {
    logger.error(`Error fetching twitch usernames: ${error}`);
  }

  return data?.map((player) => player.twitch_username) || [];
}
