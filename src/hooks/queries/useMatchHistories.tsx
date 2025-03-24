import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import useMatchHistoriesCount from "./useMatchHistoriesCount";

const PAGE_SIZE = 20;

export default function useMatchHistories(playerId: string) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { count } = useMatchHistoriesCount(playerId);

  const query = useQuery(
    supabase
      .from("matches")
      .select(
        "id, started_at, finished_at, map_pick, round_score, team:match_teams!inner(team_win, team_players:match_team_players!inner(id, player_id_mandatory, player_stats))",
      )
      .eq("team.team_players.player_id_mandatory", playerId)
      .order("started_at", {
        ascending: false,
      })
      .range(
        currentPageIndex * PAGE_SIZE,
        (currentPageIndex + 1) * PAGE_SIZE - 1,
      ),
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  );

  useEffect(() => {
    setTotalPages(count ? Math.floor(count / PAGE_SIZE) : 1);
  }, [count]);

  const firstPageFn = useCallback(() => setCurrentPageIndex(0), []);

  const previousPageFn = useCallback(
    () => setCurrentPageIndex((p) => p - 1),
    [],
  );

  const nextPageFn = useCallback(() => setCurrentPageIndex((p) => p + 1), []);

  const lastPageFn = useCallback(
    () => setCurrentPageIndex(totalPages),
    [totalPages],
  );

  const canPreviousPage = !query.isLoading && currentPageIndex > 0;
  const canNextPage = !query.isLoading && currentPageIndex < totalPages - 1;

  return {
    ...query,
    count,
    pageIndex: currentPageIndex + 1,
    totalPages: totalPages + 1,
    canPreviousPage,
    canNextPage,
    firstPage: canPreviousPage ? firstPageFn : null,
    previousPage: canPreviousPage ? previousPageFn : null,
    nextPage: canNextPage ? nextPageFn : null,
    lastPage: canNextPage ? lastPageFn : null,
  };
}
