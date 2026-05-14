import type { TablesInsert, TablesUpdate } from "@/types/database";

import { supabaseClient } from "./client";
import { handleSupabaseError, onConflictConfig } from "./utils";

export async function getExistingPlayers(playerIds: string[]) {
  const { data, error } = await supabaseClient
    .from("players")
    .select("id, faceit_elo")
    .in("id", playerIds);

  if (error) {
    handleSupabaseError("fetch players by IDs", error);
  }

  return data || [];
}

export async function upsertPlayers(players: TablesInsert<"players">[]) {
  const { error } = await supabaseClient.from("players").upsert(players);

  if (error) {
    handleSupabaseError("upsert players", error);
  }
}

export async function updateMatch(
  id: string,
  updates: TablesUpdate<"matches">,
) {
  const { error } = await supabaseClient
    .from("matches")
    .update(updates)
    .match({ id });

  if (error) {
    handleSupabaseError(`update match with ID ${id}`, error);
  }
}

export async function upsertMatch(match: TablesInsert<"matches">) {
  const { error } = await supabaseClient.from("matches").upsert(match);

  if (error) {
    handleSupabaseError("upsert match", error);
  }
}

export async function deleteMatch(id: string) {
  const { error } = await supabaseClient.from("matches").delete().match({ id });

  if (error) {
    handleSupabaseError(`delete match with ID ${id}`, error);
  }
}

export async function updateMatchTeam(
  match_id: string,
  team_id: string,
  rows: TablesUpdate<"match_teams">,
) {
  const { error } = await supabaseClient
    .from("match_teams")
    .update(rows)
    .match({ match_id, team_id });

  if (error) {
    handleSupabaseError("update match team", error);
  }
}

export async function upsertMatchTeam(team: TablesInsert<"match_teams">) {
  const { data, error } = await supabaseClient
    .from("match_teams")
    .upsert(team, { onConflict: onConflictConfig.matchTeams })
    .select("id")
    .single();

  if (error) {
    handleSupabaseError("upsert match team", error);
  }

  return data;
}

export async function upsertMatchTeamPlayer(
  player: TablesInsert<"match_team_players">,
) {
  const { error } = await supabaseClient
    .from("match_team_players")
    .upsert(player, { onConflict: onConflictConfig.matchTeamPlayers });

  if (error) {
    handleSupabaseError("upsert match team player", error);
  }
}

export async function upsertMatchTeamPlayers(
  players: TablesInsert<"match_team_players">[],
) {
  const { error } = await supabaseClient
    .from("match_team_players")
    .upsert(players, { onConflict: onConflictConfig.matchTeamPlayers });

  if (error) {
    handleSupabaseError("upsert match team players", error);
  }
}

export async function getActiveMatches() {
  const { data, error } = await supabaseClient
    .from("matches")
    .select("id")
    .in("status", ["READY", "ONGOING"]);

  if (error) {
    handleSupabaseError(`fetch existing matches`, error);
  }

  return data || [];
}
