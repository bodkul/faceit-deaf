import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export function usePlayerStatistics(playerId: string, count?: number) {
  let query = supabase
    .from("matches")
    .select(
      "match_teams!inner(team_win, match_team_players!inner(elo_before, elo_after, player_stats_normalized!inner(kills, deaths, headshots, kr_ratio)))",
      { count: "exact" },
    )
    .eq("status", "FINISHED")
    .eq("match_teams.match_team_players.player_id_mandatory", playerId)
    .order("finished_at", { ascending: false });

  if (count) {
    query = query.limit(count);
  }

  return useQuery(query);
}
