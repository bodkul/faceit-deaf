import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function usePlayedMaps() {
  const { data } = useQuery(supabase.rpc("get_map_picks_count"));

  const maps = data?.flatMap(({ map_pick, count }) => ({
    map: map_pick
      .replace("de_", "")
      .replace(/^./, (char) => char.toUpperCase()),
    count,
  }));

  return { maps };
}
