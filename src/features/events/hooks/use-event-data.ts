import { useQuery } from "@tanstack/react-query";

import { mergeSeries } from "@/features/events/lib/series";
import { useRealtime } from "@/hooks/use-realtime";
import { eventSources } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useEventData(slug: string) {
  useRealtime(["event", slug], eventSources);

  return useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_matches")
        .select(
          `
          match_id,
          status,
          started_at,
          finished_at,
          best_of,
          score_faction1,
          score_faction2,
          winner_faction,
          teams:event_match_teams (
            id,
            faction_id,
            faction_key,
            team_name,
            is_winner
          ),
          maps:event_match_maps (
            id,
            map_name,
            match_round,
            total_rounds,
            winner_faction_id,
            team_stats:event_map_team_stats (
              id,
              faction_id,
              team_name,
              final_score,
              first_half_score,
              second_half_score,
              overtime_score,
              is_winner,
              team_headshots
            ),
            player_stats:event_map_player_stats (
              id,
              player_id,
              nickname,
              faction_id,
              result,
              kills,
              deaths,
              assists,
              headshots,
              headshots_pct,
              adr,
              kd_ratio,
              mvps,
              entry_count,
              entry_wins,
              first_kills,
              triple_kills,
              clutch_kills
            )
          ),
          events!inner()
        `,
        )
        .eq("events.slug", slug)
        .order("started_at", { ascending: false })
        .throwOnError();

      return mergeSeries(data ?? []).reverse();
    },
  });
}

export type EventMatches = NonNullable<ReturnType<typeof useEventData>["data"]>;
export type EventMatch = EventMatches[number];
