import { useQuery } from "@tanstack/react-query";
import { groupBy, meanBy, orderBy } from "es-toolkit";

import { useRealtime } from "@/hooks/use-realtime";
import { topics } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Retired from the active duty pool; old matches would skew the overview.
const EXCLUDED_MAPS = ["de_train", "de_vertigo"];

export type PlayerMapStats = {
  map: string;
  matches: number;
  wins: number;
  winrate: number;
  kd: number | null;
};

export function usePlayerMaps(player_id: string) {
  useRealtime(["player-matches", player_id], [topics.player(player_id)]);

  return useQuery({
    queryKey: ["player-matches", player_id],
    queryFn: async (): Promise<PlayerMapStats[]> => {
      const { data } = await supabase
        .from("player_matches")
        .select("map, win, kd_ratio")
        .notIn("map", EXCLUDED_MAPS)
        .match({ player_id })
        .throwOnError();

      const byMap = groupBy(
        data.filter((row) => row.map),
        (row) => row.map as string,
      );

      const stats = Object.entries(byMap).map(([map, rows]) => {
        const wins = rows.filter((row) => row.win === true).length;
        const withKd = rows.filter((row) => row.kd_ratio != null);
        return {
          map,
          matches: rows.length,
          wins,
          winrate: (wins / rows.length) * 100,
          kd: withKd.length ? meanBy(withKd, (row) => row.kd_ratio ?? 0) : null,
        };
      });

      return orderBy(stats, ["matches", "map"], ["desc", "asc"]);
    },
  });
}
