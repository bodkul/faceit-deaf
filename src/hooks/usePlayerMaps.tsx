import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export function usePlayerMaps(player_id: string) {
  return useQuery(
    supabase
      .from("player_matches")
      .select("map")
      .match({ player_id })
      .order("finished_at", { ascending: false }),
  );
}
