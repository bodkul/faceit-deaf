import { supabase } from "@/lib/supabase";

export async function getPlayerByUsername(nickname: string) {
  const { data } = await supabase
    .from("players")
    .select(
      "id, avatar, nickname, steam_id_64, twitch_username, faceit_elo, skill_level, cover_image, country",
    )
    .match({ nickname })
    .single();
  return data;
}
