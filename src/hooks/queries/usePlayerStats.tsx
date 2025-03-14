import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function usePlayerStats(
  player_id_param: string | null | undefined,
) {
  return useQuery(
    player_id_param
      ? supabase.rpc("get_player_stats", { player_id_param }).limit(1).single()
      : null,
  );
}
