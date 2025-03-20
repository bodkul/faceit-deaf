import { useInfiniteOffsetPaginationQuery } from "@supabase-cache-helpers/postgrest-swr";
import { useCallback } from "react";

import { supabase } from "@/lib/supabase";

import useMatchHistoriesCount from "./useMatchHistoriesCount";

const pageSize = 20;

export default function useMatchHistories(
  player_id: string | null | undefined,
) {
  const { count } = useMatchHistoriesCount(player_id);
  const totalPages = count ? Math.ceil(count / pageSize) - 1 : 0;

  const { setPage, pageIndex, isValidating, ...rest } =
    useInfiniteOffsetPaginationQuery(
      player_id
        ? supabase
            .from("matches")
            .select(
              "id, started_at, finished_at, map_pick, round_score, team:match_teams!inner(team_win, team_players:match_team_players!inner(id, player_id_mandatory, player_stats))",
            )
            .eq("team.team_players.player_id_mandatory", player_id)
            .order("started_at", {
              ascending: false,
            })
        : null,
      { pageSize, revalidateOnFocus: false, revalidateOnReconnect: false },
    );

  const firstPagefn = useCallback(() => {
    setPage(0);
  }, [setPage]);

  const lastPagefn = useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  return {
    count,
    pageIndex: pageIndex + 1,
    totalPages: totalPages + 1,
    isValidating,
    firstPage: !isValidating && pageIndex > 0 ? firstPagefn : null,
    lastPage: !isValidating && pageIndex < totalPages ? lastPagefn : null,
    ...rest,
  };
}
