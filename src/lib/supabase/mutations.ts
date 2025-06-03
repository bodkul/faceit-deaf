import { supabase } from "./client";
import type { TablesInsert, TablesUpdate } from "./types";

export async function getAllMatchesForPlayer(playerId: string) {
  let allMatches: {
    match_teams: {
      matches: {
        id: string;
      } | null;
    } | null;
  }[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("match_team_players")
      .select("match_teams (matches (id))")
      .eq("player_id_mandatory", playerId)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(`Error fetching matches: ${error}`);
      throw error;
    }

    if (!data || data.length === 0) break;

    allMatches = [...allMatches, ...data];
    offset += limit;
  }

  return allMatches;
}

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

export async function upsertPlayers(players: TablesInsert<"players">[]) {
  const { error } = await supabase.from("players").upsert(players);
  if (error) {
    console.error("Failed to upsert players", error);
    throw error;
  }
}

export async function updateMatch(
  id: string,
  updates: TablesUpdate<"matches">,
) {
  const { error } = await supabase
    .from("matches")
    .update(updates)
    .match({ id });

  if (error) {
    console.error(`Failed to update match ${id}`, error);
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

export async function deleteMatch(id: string) {
  const { error } = await supabase.from("matches").delete().match({ id });
  if (error) {
    console.error("Failed to delete match", error);
    throw error;
  }
}

export async function upsertMatchTeam(team: TablesInsert<"match_teams">) {
  const { data, error } = await supabase
    .from("match_teams")
    .upsert(team, { onConflict: "match_id, team_id" })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to upsert match team", error);
    throw error;
  }

  return data;
}

export async function upsertMatchTeamPlayer(
  player: TablesInsert<"match_team_players">,
) {
  const { data, error } = await supabase
    .from("match_team_players")
    .upsert(player, { onConflict: "match_team_id, player_id_mandatory" })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to upsert match team players", error);
    throw error;
  }

  return data;
}

export async function upsertMatchTeamPlayers(
  players: TablesInsert<"match_team_players">[],
) {
  const { error } = await supabase
    .from("match_team_players")
    .upsert(players, { onConflict: "match_team_id, player_id_mandatory" });
  if (error) {
    console.error("Failed to upsert match team players", error);
    throw error;
  }
}

export async function upsertPlayerStatsNormalized(
  player: TablesInsert<"player_stats_normalized">,
) {
  const { error } = await supabase
    .from("player_stats_normalized")
    .upsert(player, { onConflict: "match_team_player_id" });
  if (error) {
    console.error("Failed to upsert player stats normalized", error);
    throw error;
  }
}
