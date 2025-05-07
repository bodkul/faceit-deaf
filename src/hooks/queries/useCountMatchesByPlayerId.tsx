import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function useCountMatchesByPlayerId(player_id_mandatory: string) {
  return useQuery(
    supabase
      .from("match_team_players")
      .select("", { count: "exact" })
      .match({ player_id_mandatory }),
  );
}
