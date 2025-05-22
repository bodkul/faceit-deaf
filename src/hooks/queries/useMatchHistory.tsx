import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/lib/supabase";

import useMatchHistoryCount from "./useMatchHistoryCount";

const PAGE_SIZE = 20;

export default function useMatchHistory(playerId: string) {
  const { count } = useMatchHistoryCount(playerId);
  const pagination = usePagination(count ?? 0, PAGE_SIZE);

  const { data: matches, ...query } = useQuery(
    supabase
      .from("matches")
      .select(
        `
          id, started_at, finished_at, map_pick, round_score,
          team:match_teams!inner(
            team_win,
            team_players:match_team_players!inner(
              id, player_id_mandatory, elo_before, elo_after,
              player_stats:player_stats_normalized(
                kills, deaths, assists, headshots, adr, kr_ratio
              )
            )
          )
        `,
      )
      .eq("team.team_players.player_id_mandatory", playerId)
      .order("started_at", { ascending: false })
      .range(
        pagination.pageOffset * PAGE_SIZE,
        (pagination.pageOffset + 1) * PAGE_SIZE - 1,
      ),
  );

  return {
    ...query,
    matches,
    count,
    ...pagination,
  };
}
