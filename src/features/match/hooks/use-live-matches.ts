"use client";

import { useQuery } from "@tanstack/react-query";

import {
  MATCH_CARD_COLUMNS,
  withTrackedPlayers,
} from "@/features/match/lib/match-cards";
import { useRealtime } from "@/hooks/use-realtime";
import { topics } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const queryKey = ["live-matches"] as const;

export function useLiveMatches() {
  useRealtime(queryKey, [topics.liveMatches]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await supabase
        .from("matches")
        .select(MATCH_CARD_COLUMNS)
        .in("status", ["READY", "ONGOING"])
        .is("finished_at", null)
        .order("status", { ascending: false })
        .order("started_at", { ascending: false })
        .throwOnError();

      return withTrackedPlayers(data ?? []);
    },
  });
}
