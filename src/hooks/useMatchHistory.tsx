import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/lib/supabase";

import { useMatchHistoryCount } from "./useMatchHistoryCount";

const PAGE_SIZE = 20;

export function useMatchHistory(player_id: string) {
  const { count } = useMatchHistoryCount(player_id);
  const pagination = usePagination(count ?? 0, PAGE_SIZE);

  const { data: matches, ...query } = useQuery(
    supabase
      .from("player_matches")
      .select()
      .match({ player_id })
      .order("finished_at", { ascending: false })
      .range(
        pagination.pageOffset * PAGE_SIZE,
        (pagination.pageOffset + 1) * PAGE_SIZE - 1,
      ),
  );

  return {
    ...query,
    matches,
    count,
    ...pagination,
  };
}
