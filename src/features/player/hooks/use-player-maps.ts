import { useQuery } from "@tanstack/react-query";
import { countBy, map, orderBy } from "es-toolkit/compat";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function usePlayerMaps(player_id: string) {
  return useQuery({
    queryKey: ["player-matches", player_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("player_matches")
        .select("map")
        .notIn("map", ["de_train", "de_vertigo"])
        .match({ player_id })
        .order("finished_at", { ascending: false });

      const mapsCount = countBy(data, "map");
      const mapsArray = map(mapsCount, (count, map) => ({ map, count }));
      return orderBy(mapsArray, ["count", "map"], ["desc", "asc"]);
    },
  });
}
