import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export function useMatchHistoryCount(player_id: string | null | undefined) {
  return useQuery(
    player_id
      ? supabase
          .from("player_matches")
          .select("*", {
            count: "exact",
            head: true,
          })
          .match({ player_id })
      : null,
  );
}
