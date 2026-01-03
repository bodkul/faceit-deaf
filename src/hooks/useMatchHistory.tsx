import { useQuery } from "@tanstack/react-query";

import { usePagination } from "@/hooks/usePagination";
import { supabaseClient } from "@/lib/supabase";

import { useMatchHistoryCount } from "./useMatchHistoryCount";

const PAGE_SIZE = 20;

export function useMatchHistory(player_id: string) {
  const { count } = useMatchHistoryCount(player_id);
  const pagination = usePagination(count ?? 0, PAGE_SIZE);

  const query = useQuery({
    queryKey: ["player-matches", player_id, pagination.pageIndex],
    enabled: !!player_id,
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("player_matches")
        .select()
        .eq("player_id", player_id)
        .order("finished_at", { ascending: false })
        .range(
          pagination.pageOffset * PAGE_SIZE,
          (pagination.pageOffset + 1) * PAGE_SIZE - 1,
        );
      return data;
    },
  });

  return { ...query, ...pagination, count };
}
