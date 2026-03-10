"use client";

import { useQuery } from "@tanstack/react-query";

import { usePagination } from "@/hooks/usePagination";
import { supabaseClient } from "@/lib/supabase";
import type { Tables } from "@/types/database";

const PAGE_SIZE = 20;

type LeaderboardPlayer = Tables<"leaderboard_players"> & {
  id: string;
  nickname: string;
  avatar: string;
  faceit_elo: number;
};

export function usePlayersWithPagination() {
  const { data: totalCount = 0 } = useQuery({
    queryKey: ["leaderboard_players_count"],
    queryFn: async () => {
      const { count } = await supabaseClient
        .from("leaderboard_players")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const pagination = usePagination(totalCount, PAGE_SIZE);

  const rest = useQuery({
    queryKey: ["leaderboard_players", pagination.pageIndex],
    queryFn: async () => {
      const start = pagination.pageOffset * PAGE_SIZE;
      const end = (pagination.pageOffset + 1) * PAGE_SIZE - 1;
      const { data } = await supabaseClient
        .from("leaderboard_players")
        .select("id, nickname, avatar, faceit_elo, elo_before, country")
        .order("faceit_elo", { ascending: false })
        .range(start, end)
        .overrideTypes<LeaderboardPlayer[]>();
      return data ?? [];
    },
  });

  return { ...pagination, ...rest };
}
