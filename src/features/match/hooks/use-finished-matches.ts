"use client";

import { useQuery } from "@tanstack/react-query";

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
        .select(
          "id, map_pick, round_score, started_at, finished_at, match_teams(match_team_players(nickname, player_id_nullable))",
        )
        .eq("status", "FINISHED")
        .not("finished_at", "is", null)
        .order("finished_at", { ascending: false })
        .limit(LIMIT)
        .throwOnError();

      return (data ?? []).map(({ match_teams, ...match }) => ({
        ...match,
        // Only tracked (deaf) players have player_id_nullable set.
        players: match_teams.flatMap((team) =>
          team.match_team_players
            .filter((p) => p.player_id_nullable)
            .map((p) => p.nickname),
        ),
      }));
    },
  });
}
