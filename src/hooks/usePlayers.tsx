"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { useEffect, useState } from "react";

import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;

function usePlayers(pageOffset: number) {
  return useQuery(
    supabase
      .from("leaderboard_players")
      .select(
        "id, nickname, avatar, skill_level, faceit_elo, elo_before, country",
        {
          count: "exact",
        },
      )
      .order("faceit_elo", { ascending: false })
      .range(pageOffset * PAGE_SIZE, (pageOffset + 1) * PAGE_SIZE - 1),
  );
}

export function usePlayersWithPagination() {
  const [totalCount, setTotalCount] = useState(0);
  const pagination = usePagination(totalCount, PAGE_SIZE);

  const { isLoading, count, ...rest } = usePlayers(pagination.pageOffset);

  useEffect(() => {
    if (typeof count === "number" && count !== totalCount) {
      setTotalCount(count);
    }
  }, [count, totalCount]);

  return {
    ...rest,
    isLoading,
    count,
    ...pagination,
  };
}
