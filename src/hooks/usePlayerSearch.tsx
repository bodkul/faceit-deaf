"use client";

import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

export function usePlayerSearch(query: string) {
  const { data: players, isLoading } = useQuery({
    queryKey: ["player_search", query],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("leaderboard_players")
        .select("id, nickname, avatar, skill_level, faceit_elo, country")
        .ilike("nickname", `%${query}%`)
        .order("faceit_elo", { ascending: false })
        .limit(10);

      return data ?? [];
    },
    enabled: query.length >= 2,
  });

  return { players, isLoading };
}
