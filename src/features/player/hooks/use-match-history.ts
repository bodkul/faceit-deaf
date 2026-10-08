"use client";

import { useQuery } from "@tanstack/react-query";

import { usePagination } from "@/hooks/use-pagination";
import { useRealtime } from "@/hooks/use-realtime";
import { topics } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const PAGE_SIZE = 20;

export function useMatchHistory(player_id: string) {
  useRealtime(["player_matches_count", player_id], [topics.player(player_id)]);
  useRealtime(["player_matches", player_id], [topics.player(player_id)]);

  const { data: totalCount = 0 } = useQuery({
    queryKey: ["player_matches_count", player_id],
    enabled: !!player_id,
    queryFn: async () => {
      const { count } = await supabase
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
      const { data } = await supabase
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
