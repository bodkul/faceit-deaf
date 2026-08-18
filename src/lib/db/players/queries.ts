import { supabaseClient } from "@/lib/supabase";

export async function getPlayerRankings(limit = 20, offset = 0) {
  const { data, count } = await supabaseClient
    .from("players")
    .select("id, nickname, avatar, faceit_elo, country", {
      count: "exact",
    })
    .range(offset, offset + limit - 1)
    .order("faceit_elo", { ascending: false, nullsFirst: false })
    .throwOnError();

  return { players: data, count: count ?? 0 };
}
