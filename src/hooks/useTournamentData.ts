import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

export const TOURNAMENT_HUB_IDS = [
  // "05049049-fdf3-4d5b-afc9-a6818f86064a", // Hub
  "a08c8b46-b418-47c3-8c25-d5831cd09f55",
  "9508886f-759a-4389-bd84-deaf02a77928",
  "74912e42-b2ba-44b6-b851-70f5fc48508d",
  "e15b0fdc-892b-4b10-bee0-7177a52f5e40",
  "d0cc790c-d813-4373-baa2-9cb91eee531d",
  "d26a3ca8-7be3-4a12-9880-e9217b826028"
];

export function useTournamentData() {
  return useQuery({
    queryKey: ["tournament"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("matches")
        .select(`
          id,
          map_pick,
          started_at,
          finished_at,
          status,
          round_score,
          teams:match_teams (
            id,
            name,
            avatar,
            team_id,
            final_score,
            first_half_score,
            second_half_score,
            overtime_score,
            team_win,
            players:match_team_players (
              id,
              nickname,
              player_id_mandatory,
              player_id_nullable,
              kills,
              deaths,
              assists,
              headshots,
              adr,
              kd_ratio,
              kr_ratio,
              mvps,
              game_skill_level
            )
          )
        `)
        .in("competition_id", TOURNAMENT_HUB_IDS)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}
