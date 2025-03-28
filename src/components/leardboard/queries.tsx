"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { subHours } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;
const dayAgo = subHours(new Date(), 24);

function usePlayers(currentPageIndex: number) {
  return useQuery(
    supabase
      .from("players")
      .select(
        "id, nickname, avatar, skill_level, faceit_elo, eloHistory (player_elo)",
        { count: "exact" },
      )
      .gt("eloHistory.created_at", dayAgo.toISOString())
      .limit(1, { referencedTable: "eloHistory" })
      .order("faceit_elo", { ascending: false })
      .range(
        currentPageIndex * PAGE_SIZE,
        (currentPageIndex + 1) * PAGE_SIZE - 1,
      ),
  );
}

export default function usePlayersWithPagination() {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { isLoading, count, ...rest } = usePlayers(currentPageIndex);

  useEffect(() => {
    if (!isLoading) {
      setTotalPages(count ? Math.ceil(count / PAGE_SIZE) - 1 : 0);
    }
  }, [count, isLoading]);

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

  const canPreviousPage = !isLoading && currentPageIndex > 0;
  const canNextPage = !isLoading && currentPageIndex < totalPages;

  return {
    ...rest,
    isLoading,
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
