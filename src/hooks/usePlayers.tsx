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

function usePlayersCount() {
  const { data: count, ...query } = useQuery({
    queryKey: ["leaderboard_players_count"],
    queryFn: async () => {
      const { count } = await supabaseClient
        .from("leaderboard_players")
        .select("id", { count: "exact", head: true });
      return count;
    },
  });
  return { count, ...query };
}

function usePlayers(pageOffset: number) {
  return useQuery({
    queryKey: ["leaderboard_players", pageOffset],
    queryFn: async () => {
      const start = pageOffset * PAGE_SIZE;
      const end = (pageOffset + 1) * PAGE_SIZE - 1;
      const { data } = await supabaseClient
        .from("leaderboard_players")
        .select(
          "id, nickname, avatar, skill_level, faceit_elo, elo_before, country",
        )
        .order("faceit_elo", { ascending: false })
        .range(start, end)
        .overrideTypes<LeaderboardPlayer[]>();
      return data;
    },
  });
}

export function usePlayersWithPagination() {
  const [totalCount, setTotalCount] = useState(0);
  const pagination = usePagination(totalCount, PAGE_SIZE);
  const { count } = usePlayersCount();
  const { isLoading, ...rest } = usePlayers(pagination.pageOffset);

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
