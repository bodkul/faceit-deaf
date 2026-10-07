"use client";

import { useQuery } from "@tanstack/react-query";

import useRealtimeChannel from "@/hooks/use-realtime-channel";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const queryKey = ["live-matches"] as const;

export function useLiveMatches() {
  useRealtimeChannel(queryKey);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await supabase
        .from("live_matches")
        .select("id, map_pick, round_score, started_at, finished_at, players")
        .order("status", { ascending: false })
        .order("started_at", { ascending: false });
      return data;
    },
  });
}
