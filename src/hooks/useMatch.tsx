import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabaseClient } from "@/lib/supabase";

export function useMatch(id: string) {
  const { data: match, ...query } = useQuery(
    supabaseClient
      .from("matches")
      .select(
        "map_pick, location_pick, started_at, finished_at, teams:match_teams(id, avatar, name, team_win, final_score, team_players:match_team_players(id, player_id_nullable, nickname, game_skill_level, player_stats:player_stats_normalized(kills, deaths, assists, headshots, adr, kr_ratio)))",
      )
      .match({ id })
      .order("faction", { referencedTable: "teams", ascending: true })
      .limit(1)
      .single(),
  );

  return { match, ...query };
}
