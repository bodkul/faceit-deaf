import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

import { supabaseClient } from "./client";

const onConflictConfig = {
  matchTeams: "match_id, team_id",
  matchTeamPlayers: "match_team_id, player_id_mandatory",
  playerStatsNormalized: "match_team_player_id",
};

export async function getExistingPlayers(playerIds: string[]) {
  const { data } = await supabaseClient
    .from("players")
    .select("id, faceit_elo")
    .in("id", playerIds)
    .throwOnError();
  return data ?? [];
}

export async function upsertPlayers(players: TablesInsert<"players">[]) {
  await supabaseClient.from("players").upsert(players).throwOnError();
}

export async function updateMatch(
  id: string,
  updates: TablesUpdate<"matches">,
) {
  await supabaseClient
    .from("matches")
    .update(updates)
    .match({ id })
    .throwOnError();
}

export async function upsertMatch(match: TablesInsert<"matches">) {
  await supabaseClient.from("matches").upsert(match).throwOnError();
}

export async function deleteMatch(id: string) {
  await supabaseClient.from("matches").delete().match({ id }).throwOnError();
}

export async function updateMatchTeam(
  match_id: string,
  team_id: string,
  rows: TablesUpdate<"match_teams">,
) {
  await supabaseClient
    .from("match_teams")
    .update(rows)
    .match({ match_id, team_id })
    .throwOnError();
}

export async function upsertMatchTeam(team: TablesInsert<"match_teams">) {
  const { data } = await supabaseClient
    .from("match_teams")
    .upsert(team, { onConflict: onConflictConfig.matchTeams })
    .select("id")
    .single()
    .throwOnError();
  return data;
}

export async function upsertMatchTeamPlayers(
  players: TablesInsert<"match_team_players">[],
) {
  await supabaseClient
    .from("match_team_players")
    .upsert(players, { onConflict: onConflictConfig.matchTeamPlayers })
    .throwOnError();
}

export async function getActiveMatches() {
  const { data } = await supabaseClient
    .from("matches")
    .select("id")
    .in("status", ["READY", "ONGOING"])
    .throwOnError();
  return data ?? [];
}
