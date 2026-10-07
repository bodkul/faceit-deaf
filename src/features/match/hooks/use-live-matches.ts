"use client";

import { useQuery } from "@tanstack/react-query";

import useRealtimeChannel from "@/hooks/use-realtime-channel";
import { supabaseClient } from "@/lib/supabase";

const queryKey = ["live-matches"] as const;

export function useLiveMatches() {
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
