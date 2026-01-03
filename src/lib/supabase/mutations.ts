import { chunk } from "lodash-es";
import pMap from "p-map";

import type { TablesInsert, TablesUpdate } from "@/types/database";

import { supabase } from "./client";
import { handleSupabaseError, onConflictConfig } from "./utils";

export async function getPlayers() {
  const { data, error } = await supabase.from("players").select("id, nickname");

  if (error) {
    handleSupabaseError("fetch all players", error);
  }

  return data || [];
}

export async function getExistingPlayers(playerIds: string[]) {
  const { data, error } = await supabase
    .from("players")
    .select("id, faceit_elo")
    .in("id", playerIds);

  if (error) {
    handleSupabaseError("fetch players by IDs", error);
  }

  return data || [];
}

export async function upsertPlayers(players: TablesInsert<"players">[]) {
  const { error } = await supabase.from("players").upsert(players);

  if (error) {
    handleSupabaseError("upsert players", error);
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
    handleSupabaseError(`update match with ID ${id}`, error);
  }
}

export async function upsertMatch(match: TablesInsert<"matches">) {
  const { error } = await supabase.from("matches").upsert(match);

  if (error) {
    handleSupabaseError("upsert match", error);
  }
}

export async function deleteMatch(id: string) {
  const { error } = await supabase.from("matches").delete().match({ id });

  if (error) {
    handleSupabaseError(`delete match with ID ${id}`, error);
  }
}

export async function updateMatchTeam(
  match_id: string,
  team_id: string,
  rows: TablesUpdate<"match_teams">,
) {
  const { error } = await supabase
    .from("match_teams")
    .update(rows)
    .match({ match_id, team_id });

  if (error) {
    handleSupabaseError("update match team", error);
  }
}

export async function upsertMatchTeam(team: TablesInsert<"match_teams">) {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("match_team_players")
    .upsert(player, { onConflict: onConflictConfig.matchTeamPlayers })
    .select("id")
    .single();

  if (error) {
    handleSupabaseError("upsert match team player", error);
  }

  return data;
}

export async function upsertMatchTeamPlayers(
  players: TablesInsert<"match_team_players">[],
) {
  const { error } = await supabase
    .from("match_team_players")
    .upsert(players, { onConflict: onConflictConfig.matchTeamPlayers });

  if (error) {
    handleSupabaseError("upsert match team players", error);
  }
}

export async function upsertPlayerStatsNormalized(
  player: TablesInsert<"player_stats_normalized">,
) {
  const { error } = await supabase
    .from("player_stats_normalized")
    .upsert(player, { onConflict: onConflictConfig.playerStatsNormalized });

  if (error) {
    handleSupabaseError("upsert player stats normalized", error);
  }
}

export async function getMatchesCount(playerId: string) {
  const { count, error } = await supabase
    .from("match_team_players")
    .select("", { count: "exact", head: true })
    .eq("player_id_mandatory", playerId);

  if (error) {
    handleSupabaseError("fetch existing matches by IDs", error);
  }

  return count;
}

export async function getMatchesIds(matchesIds: string[]) {
  if (matchesIds.length === 0) {
    return [];
  }

  const chunks = chunk(matchesIds, 200);
  console.log(`    📦 Разбито на ${chunks.length} чанков по 200 матчей`);

  const results = await pMap(
    chunks,
    async (matchesChunk, index) => {
      console.log(
        `      🔍 Обработка чанка ${index + 1}/${chunks.length} (${matchesChunk.length} матчей)`,
      );

      const { data, error } = await supabase
        .from("matches")
        .select("id")
        .in("id", matchesChunk);

      if (error) {
        handleSupabaseError(
          `fetch existing matches by IDs (chunk ${index + 1})`,
          error,
        );
        return [];
      }

      return data || [];
    },
    { concurrency: 5 },
  );

  const allResults = results.flat();

  console.log(
    `    ✅ Найдено существующих матчей: ${allResults.length}/${matchesIds.length}`,
  );

  return allResults;
}

export async function getActiveMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("id")
    .in("status", ["READY", "ONGOING"]);

  if (error) {
    handleSupabaseError(`fetch existing matches`, error);
  }

  return data || [];
}
