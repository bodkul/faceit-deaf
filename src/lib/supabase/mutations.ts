import { supabase, type TablesInsert } from "@/lib/supabase";

export async function getExistingPlayers(playerIds: string[]) {
  const { data, error } = await supabase
    .from("players")
    .select("id, faceit_elo")
    .in("id", playerIds);

  if (error) {
    console.error(`Error fetching players by IDs: ${error}`);
    throw error;
  }

  return data;
}

export async function addEloHistory(items: TablesInsert<"eloHistory">[]) {
  const { error } = await supabase.from("eloHistory").insert(items);
  if (error) {
    console.error(`Failed to insert elo history: ${error}`);
    throw error;
  }
}

export async function upsertPlayers(players: TablesInsert<"players">[]) {
  const { error } = await supabase.from("players").upsert(players);
  if (error) {
    console.error("Failed to upsert players", error);
    throw error;
  }
}

export async function upsertMatch(match: TablesInsert<"matches">) {
  const { error } = await supabase.from("matches").upsert(match);
  if (error) {
    console.error("Failed to upsert match", error);
    throw error;
  }
}

export async function upsertMatchTeam(team: TablesInsert<"match_teams">) {
  const { data, error } = await supabase
    .from("match_teams")
    .upsert(team)
    .select("id")
    .single();

  if (error) {
    console.error("Failed to upsert match team", error);
    throw error;
  }

  return data;
}

export async function upsertMatchTeamPlayers(
  players: TablesInsert<"match_team_players">[],
) {
  const { error } = await supabase.from("match_team_players").upsert(players);
  if (error) {
    console.error("Failed to upsert match team players", error);
    throw error;
  }
}
