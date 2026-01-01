"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { useState } from "react";

import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

const PAGE_SIZE = 20;

type LeaderboardPlayer = Tables<"leaderboard_players"> & {
  id: string;
  nickname: string;
  avatar: string;
  skill_level: number;
  faceit_elo: number;
};

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
      .range(pageOffset * PAGE_SIZE, (pageOffset + 1) * PAGE_SIZE - 1)
      .overrideTypes<LeaderboardPlayer[]>(),
  );
}

export function usePlayersWithPagination() {
  const [totalCount, setTotalCount] = useState(0);
  const pagination = usePagination(totalCount, PAGE_SIZE);

  const { isLoading, count, ...rest } = usePlayers(pagination.pageOffset);

  if (typeof count === "number" && count !== totalCount) {
    setTotalCount(count);
  }

  return {
    ...rest,
    isLoading,
    count,
    ...pagination,
  };
}
