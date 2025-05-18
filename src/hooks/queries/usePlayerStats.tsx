import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function usePlayerStats(player_id_mandatory: string) {
  return useQuery(
    supabase
      .from("match_team_players")
      .select(
        "id, player_stats_normalized(kills, deaths, headshots, kr_ratio, adr, assists)",
      )
      .match({ player_id_mandatory }),
  );
}
