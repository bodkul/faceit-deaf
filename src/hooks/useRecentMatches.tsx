import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

export function useRecentMatches(player_id: string) {
  return useQuery({
    queryKey: ["recent-matches", player_id],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("player_matches")
        .select("*")
        .match({ player_id })
        .order("finished_at", { ascending: false })
        .limit(10);
      return data;
    },
  });
}
