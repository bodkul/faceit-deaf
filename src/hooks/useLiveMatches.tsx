"use client";

import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

import useRealtimeChannel from "./useRealtimeChannel";

export function useLiveMatches() {
  const queryKey = ["live-matches"] as const;

  useRealtimeChannel(queryKey);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("live_matches")
        .select("id, map_pick, round_score, started_at, finished_at, players")
        .order("status", { ascending: false })
        .order("started_at", { ascending: false });
      return data;
    },
  });
}
