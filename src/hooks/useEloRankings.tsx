import {
  useQuery,
  useSubscriptionQuery,
} from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export function useEloRankings() {
  const { data, mutate, ...query } = useQuery(
    supabase
      .from("leaderboard_players")
      .select()
      .order("faceit_elo", { ascending: false })
      .limit(10),
  );

  useSubscriptionQuery(
    supabase,
    "elo_rankings_subscription",
    {
      event: "*",
      table: "players",
      schema: "public",
    },
    ["id"],
    "avatar,nickname,skill_level,faceit_elo",
    {
      callback: () => mutate().then(),
    },
  );

  return {
    players: data,
    ...query,
  };
}
