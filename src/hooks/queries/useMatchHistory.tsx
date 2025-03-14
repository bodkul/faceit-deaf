import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { useState } from "react";

import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;

export default function useMatchHistory(
  player_id_mandatory: string | null | undefined,
  count: number,
) {
  const [page, setPage] = useState(0);

  const {
    data,
    isLoading,
    mutate,
    count: countMatches,
  } = useQuery(
    player_id_mandatory
      ? supabase
          .from("matches")
          .select(
            "id, started_at, finished_at, map_pick, round_score, team:match_teams!inner(team_win, team_players:match_team_players!inner(player_id_mandatory, player_stats))",
            { count: "exact" },
          )
          .eq("team.team_players.player_id_mandatory", player_id_mandatory)
          .not("team.team_players.player_stats", "is", null)
          .order("started_at", {
            ascending: false,
          })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      : null,
  );

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const canPreviousPage = page > 0;
  const canNextPage = page < totalPages - 1;

  return {
    matches: data || [],
    isLoadingMatches: isLoading,
    totalPages,
    canPreviousPage,
    canNextPage,
    indexPage: page + 1,
    nextPage: () => canNextPage && setPage((p) => p + 1),
    previousPage: () => canPreviousPage && setPage((p) => p - 1),
    firstPage: () => setPage(0),
    lastPage: () => setPage(totalPages - 1),
    mutateMatches: mutate,
    countMatches,
  };
}
