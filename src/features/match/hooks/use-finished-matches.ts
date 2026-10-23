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

const queryKey = ["finished-matches"] as const;

const LIMIT = 6;

export function useFinishedMatches() {
  // The finished-match sync broadcasts on this topic once stats are written.
  useRealtime(queryKey, [topics.liveMatches]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await supabase
        .from("matches")
        .select(MATCH_CARD_COLUMNS)
        .eq("status", "FINISHED")
        .not("finished_at", "is", null)
        .order("finished_at", { ascending: false })
        .limit(LIMIT)
        .throwOnError();

      return withTrackedPlayers(data ?? []);
    },
  });
}
