import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

import useRealtimeChannel from "./useRealtimeChannel";

export function useMatch(id: string) {
  const queryKey = ["match", id] as const;

  useRealtimeChannel(queryKey);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("matches")
        .select(
          "id, map_pick, location_pick, started_at, finished_at, teams:match_teams(id, avatar, name, team_win, final_score, team_players:match_team_players(id, player_id_nullable, nickname, game_skill_level, kills, deaths, assists, headshots, adr, kr_ratio))",
        )
        .match({ id })
        .order("faction", { referencedTable: "teams", ascending: true })
        .limit(1)
        .single();
      return data;
    },
  });
}
