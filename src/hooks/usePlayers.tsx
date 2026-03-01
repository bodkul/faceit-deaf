"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { usePagination } from "@/hooks/usePagination";
import { supabaseClient } from "@/lib/supabase";
import type { Tables } from "@/types/database";

const PAGE_SIZE = 20;

type LeaderboardPlayer = Tables<"leaderboard_players"> & {
  id: string;
  nickname: string;
  avatar: string;
  skill_level: number;
  faceit_elo: number;
};

export function usePlayersWithPagination() {
  const [totalCount, setTotalCount] = useState(0);
  const pagination = usePagination(totalCount, PAGE_SIZE);

  const { data, isLoading, ...rest } = useQuery({
    queryKey: ["leaderboard_players", pagination.pageOffset],
    queryFn: async () => {
      const start = pagination.pageOffset * PAGE_SIZE;
      const end = (pagination.pageOffset + 1) * PAGE_SIZE - 1;
      const { data, count } = await supabaseClient
        .from("leaderboard_players")
        .select(
          "id, nickname, avatar, skill_level, faceit_elo, elo_before, country",
          { count: "exact" },
        )
        .order("faceit_elo", { ascending: false })
        .range(start, end)
        .overrideTypes<LeaderboardPlayer[]>();

      if (typeof count === "number") setTotalCount(count);
      return data;
    },
  });

  return {
    data,
    isLoading,
    count: totalCount,
    ...pagination,
    ...rest,
  };
}
