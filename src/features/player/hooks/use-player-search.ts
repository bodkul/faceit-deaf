"use client";

import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

export function usePlayerSearch(query: string) {
  return useQuery({
    queryKey: ["player_search", query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const { data } = await supabaseClient
        .from("players")
        .select("id, nickname, avatar, faceit_elo, country")
        .ilike("nickname", `%${query}%`)
        .order("faceit_elo", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: query.length >= 2,
  });
}
