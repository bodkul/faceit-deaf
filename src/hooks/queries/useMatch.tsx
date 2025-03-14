import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function useMatch(id: string) {
  const { data: match, ...query } = useQuery(
    supabase
      .from("matches")
      .select(
        "map_pick, location_pick, started_at, finished_at, teams:match_teams(id, avatar, name, team_win, final_score, team_players:match_team_players(id, player_id_nullable, nickname, player_stats))",
      )
      .match({ id })
      .order("faction", { referencedTable: "teams", ascending: true })
      .limit(1)
      .single(),
  );

  return { match, ...query };
}
