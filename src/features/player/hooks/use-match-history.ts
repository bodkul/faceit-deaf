"use client";

import { useQuery } from "@tanstack/react-query";

import { usePagination } from "@/hooks/use-pagination";
import { supabaseClient } from "@/lib/supabase";

const PAGE_SIZE = 20;

export function useMatchHistory(player_id: string) {
  const { data: totalCount = 0 } = useQuery({
    queryKey: ["player_matches_count", player_id],
    enabled: !!player_id,
    queryFn: async () => {
      const { count } = await supabaseClient
        .from("match_team_players")
        .select("*", { count: "exact", head: true })
        .eq("player_id_mandatory", player_id);
      return count ?? 0;
    },
  });

  const pagination = usePagination(totalCount, PAGE_SIZE);

  const rest = useQuery({
    queryKey: ["player_matches", player_id, pagination.pageIndex],
    enabled: !!player_id,
    queryFn: async () => {
      const start = pagination.pageOffset * PAGE_SIZE;
      const end = (pagination.pageOffset + 1) * PAGE_SIZE - 1;
      const { data } = await supabaseClient
        .from("player_matches")
        .select()
        .match({ player_id })
        .order("finished_at", { ascending: false })
        .range(start, end);
      return data;
    },
  });

  return { ...rest, ...pagination };
}
