import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { supabaseClient } from "@/lib/supabase";
import { isUUID } from "@/lib/utils";

export const ensurePlayerExists = cache(async (nickname: string) => {
  if (!isUUID(nickname)) {
    const { data } = await supabaseClient
      .from("players")
      .select("nickname")
      .match({ nickname })
      .single();

    if (data) return data.nickname;
  }

  const { data } = await supabaseClient
    .from("match_team_players")
    .select("nickname")
    .eq("player_id_mandatory", nickname)
    .limit(1)
    .single();

  if (!data) notFound();

  return data.nickname;
});

export async function getPlayerMetadata(
  username: string,
  suffix: string,
  description: string,
): Promise<Metadata> {
  const nickname = await ensurePlayerExists(username);

  return {
    title: `${nickname} - ${suffix}`,
    description,
  };
}
