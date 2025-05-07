import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function usePlayer(nickname: string) {
  return useQuery(
    supabase
      .from("players")
      .select(
        "id, avatar, nickname, faceit_url, steam_id_64, twitch_username, faceit_elo, skill_level, cover_image, country",
      )
      .match({ nickname })
      .single(),
  );
}
