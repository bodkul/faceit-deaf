import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabaseClient } from "@/lib/supabase";

const PAGE_SIZE = 10;

export function useRecentMatches(player_id: string) {
  return useQuery(
    supabaseClient
      .from("player_matches")
      .select()
      .match({ player_id })
      .order("finished_at", { ascending: false })
      .limit(PAGE_SIZE),
  );
}
