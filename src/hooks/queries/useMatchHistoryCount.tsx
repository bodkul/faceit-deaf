import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function useMatchHistoryCount(
  player_id_mandatory: string | null | undefined,
) {
  return useQuery(
    player_id_mandatory
      ? supabase
          .from("matches")
          .select("match_teams!inner(match_team_players!inner())", {
            count: "exact",
            head: true,
          })
          .eq(
            "match_teams.match_team_players.player_id_mandatory",
            player_id_mandatory,
          )
      : null,
  );
}
