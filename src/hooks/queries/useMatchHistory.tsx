import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function useMatchHistory(
  player_id_mandatory: string | null | undefined,
) {
  return useQuery(
    player_id_mandatory
      ? supabase
          .from("matches")
          .select(
            "id, started_at, finished_at, map_pick, round_score, team:match_teams!inner(team_win, team_players:match_team_players!inner(player_id_mandatory, player_stats))",
            { count: "exact" },
          )
          .eq("team.team_players.player_id_mandatory", player_id_mandatory)
          .not("team.team_players.player_stats", "is", null)
          .order("started_at", {
            ascending: false,
          })
          .limit(20)
      : null,
  );
}
