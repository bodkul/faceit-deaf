import { supabaseClient } from "@/lib/supabase";

export async function getPlayerByUsername(nickname: string) {
  const { data } = await supabaseClient
    .from("players")
    .select(
      "id, avatar, nickname, steam_id_64, twitch_username, country, skill_level, faceit_elo",
    )
    .match({ nickname })
    .single();
  return data;
}
