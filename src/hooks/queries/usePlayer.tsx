import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function usePlayer(nickname: string) {
  return useQuery(
    supabase
      .from("players")
      .select(
        "*, team_players:match_team_players(*, team:match_teams!inner(*, match:matches!inner(*)))",
      )
      .match({ nickname })
      .single(),
  );
}
