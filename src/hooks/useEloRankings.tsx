import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export function useEloRankings() {
  return useQuery(
    supabase
      .from("leaderboard_players")
      .select("id, nickname, avatar, skill_level, faceit_elo, elo_before")
      .order("faceit_elo", { ascending: false })
      .limit(10),
  );
}
