import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { faceit } from "@/lib/faceit/client";
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

export async function getPlayerIdByNickname(nickname: string) {
  if (!isUUID(nickname)) {
    const { data: playerData } = await supabaseClient
      .from("players")
      .select("id")
      .match({ nickname })
      .single();

    if (playerData) return playerData.id;
  }

  const { data: matchPlayerData } = await supabaseClient
    .from("match_team_players")
    .select("player_id_mandatory, match_teams!inner(matches!inner(started_at))")
    .eq("player_id_mandatory", nickname)
    .order("started_at", {
      ascending: false,
      referencedTable: "match_teams.matches",
    })
    .limit(1)
    .single();

  if (!matchPlayerData) return null;

  return matchPlayerData.player_id_mandatory;
}

export async function getPlayerByUsername(nickname: string) {
  if (!isUUID(nickname)) {
    const { data: playerData } = await supabaseClient
      .from("players")
      .select(
        "id, avatar, nickname, steam_id_64, twitch_username, country, faceit_elo",
      )
      .match({ nickname })
      .single();

    if (playerData) return playerData;
  }

  const playerDetails = await faceit.players.getPlayerDetails(nickname);

  return {
    id: playerDetails.player_id,
    nickname: playerDetails.nickname,
    avatar: playerDetails.avatar,
    steam_id_64: playerDetails.steam_id_64,
    twitch_username: null,
    country: playerDetails.country,
    faceit_elo: playerDetails.games.cs2.faceit_elo,
  };
}

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
