import type { PostgrestError } from "@supabase/supabase-js";

export const onConflictConfig = {
  matchTeams: "match_id, team_id",
  matchTeamPlayers: "match_team_id, player_id_mandatory",
  playerStatsNormalized: "match_team_player_id",
};

export const handleSupabaseError = (
  operation: string,
  error: PostgrestError,
) => {
  console.error(`Error during ${operation}:`, error.message);
  throw new Error(`Failed to ${operation}: ${error.message}`);
};
