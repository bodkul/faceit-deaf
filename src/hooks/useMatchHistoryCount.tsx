import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabaseClient } from "@/lib/supabase";

export function useMatchHistoryCount(player_id: string | null | undefined) {
  return useQuery(
    player_id
      ? supabaseClient
          .from("player_matches")
          .select("*", {
            count: "exact",
            head: true,
          })
          .match({ player_id })
      : null,
  );
}
