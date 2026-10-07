import type { TablesInsert, TablesUpdate } from "@/types/database";

import { createAdminClient } from "./admin";

const supabase = createAdminClient();

const onConflictConfig = {
  matchTeams: "match_id, team_id",
  matchTeamPlayers: "match_team_id, player_id_mandatory",
  playerStatsNormalized: "match_team_player_id",
};

export async function getExistingPlayers(playerIds: string[]) {
  const { data } = await supabase
    .from("players")
    .select("id, faceit_elo")
    .in("id", playerIds)
    .throwOnError();
  return data ?? [];
}

export async function upsertPlayers(players: TablesInsert<"players">[]) {
  await supabase.from("players").upsert(players).throwOnError();
}

export async function updateMatch(
  id: string,
  updates: TablesUpdate<"matches">,
) {
  await supabase.from("matches").update(updates).match({ id }).throwOnError();
}

export async function upsertMatch(match: TablesInsert<"matches">) {
  await supabase.from("matches").upsert(match).throwOnError();
}

export async function deleteMatch(id: string) {
  await supabase.from("matches").delete().match({ id }).throwOnError();
}

export async function updateMatchTeam(
  match_id: string,
  team_id: string,
  rows: TablesUpdate<"match_teams">,
) {
  await supabase
    .from("match_teams")
    .update(rows)
    .match({ match_id, team_id })
    .throwOnError();
}

export async function upsertMatchTeam(team: TablesInsert<"match_teams">) {
  const { data } = await supabase
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
  await supabase
    .from("match_team_players")
    .upsert(players, { onConflict: onConflictConfig.matchTeamPlayers })
    .throwOnError();
}

export async function getActiveMatches() {
  const { data } = await supabase
    .from("matches")
    .select("id")
    .in("status", ["READY", "ONGOING"])
    .throwOnError();
  return data ?? [];
}
