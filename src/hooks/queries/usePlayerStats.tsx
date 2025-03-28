import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function usePlayerStats(player_id: string) {
  return useQuery(supabase.rpc("get_player_stats", { player_id }));
}
