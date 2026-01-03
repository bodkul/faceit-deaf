import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabaseClient } from "@/lib/supabase";

export function usePlayerMaps(player_id: string) {
  return useQuery(
    supabaseClient
      .from("player_matches")
      .select("map")
      .match({ player_id })
      .order("finished_at", { ascending: false }),
  );
}
