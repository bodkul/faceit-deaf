import { useQuery } from "@tanstack/react-query";
import { countBy, map, orderBy } from "lodash-es";

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

      const mapsCount = countBy(data, "map");
      const mapsArray = map(mapsCount, (count, map) => ({ map, count }));
      return orderBy(mapsArray, ["count", "map"], ["desc", "asc"]);
    },
  });
}
