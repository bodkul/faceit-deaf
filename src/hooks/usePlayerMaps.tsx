import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

export function usePlayerMaps(player_id: string) {
  return useQuery({
    queryKey: ["player-matches", player_id],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("player_matches")
        .select("map")
        .match({ player_id })
        .order("finished_at", { ascending: false });
      return data;
    },
  });
}
