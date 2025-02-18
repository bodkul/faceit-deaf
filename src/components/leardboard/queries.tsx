"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { subHours } from "date-fns";
import { useState } from "react";

import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;
const dayAgo = subHours(new Date(), 24);

export function usePlayersCount() {
  return useQuery(
    supabase.from("players").select("*", { count: "exact", head: true }),
  );
}

export function usePlayers(count: number) {
  const [page, setPage] = useState(0);

  const { data, isLoading, mutate } = useQuery(
    supabase
      .from("players")
      .select(
        "id, nickname, avatar, skill_level, faceit_elo, eloHistory (player_elo)",
        { count: "exact" },
      )
      .gt("eloHistory.created_at", dayAgo.toISOString())
      .limit(1, { referencedTable: "eloHistory" })
      .order("faceit_elo", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
  );

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const canPreviousPage = page > 0;
  const canNextPage = page < totalPages - 1;

  return {
    players: data || [],
    isLoading,
    totalPages,
    canPreviousPage,
    canNextPage,
    indexPage: page + 1,
    nextPage: () => canNextPage && setPage((p) => p + 1),
    previousPage: () => canPreviousPage && setPage((p) => p - 1),
    firstPage: () => setPage(0),
    lastPage: () => setPage(totalPages - 1),
    mutate,
  };
}
