import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

export function useMatchHistoryCount(player_id: string | null | undefined) {
  const { data: count, ...query } = useQuery({
    queryKey: ["player-matches-count", player_id],
    enabled: !!player_id,
    queryFn: async () => {
      const { count } = await supabaseClient
        .from("player_matches")
        .select("*", {
          count: "exact",
          head: true,
        })
        .match({ player_id });
      return count;
    },
  });

  return { ...query, count };
}
