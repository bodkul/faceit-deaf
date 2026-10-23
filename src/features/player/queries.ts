import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getPlayer } from "@/lib/faceit/api";
import { createClient } from "@/lib/supabase/server";
import { isUUID } from "@/lib/utils";

const supabase = createClient();

/**
 * A tracked player by nickname. Shared by the layout and every parallel
 * route of a player page, so it runs once per request.
 */
const getTrackedPlayer = cache(async (nickname: string) => {
  if (isUUID(nickname)) return null;

  const { data } = await supabase
    .from("players")
    .select(
      "id, avatar, cover_image, nickname, steam_id_64, twitch_username, country, faceit_elo",
    )
    .match({ nickname })
    .maybeSingle();

  return data;
});

/**
 * Resolves `/player/[username]` to a nickname: a tracked player's nickname,
 * or the FACEIT id of an untracked player who has played a tracked match.
 */
export const ensurePlayerExists = cache(async (nickname: string) => {
  const player = await getTrackedPlayer(nickname);
  if (player) return player.nickname;

  const { data } = await supabase
    .from("match_team_players")
    .select("nickname")
    .eq("player_id_mandatory", nickname)
    .limit(1)
    .maybeSingle();

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
  const player = await getTrackedPlayer(nickname);
  if (player) return player.id;

  // Untracked players are addressed by FACEIT id; ensurePlayerExists has
  // already checked that they played a match.
  await ensurePlayerExists(nickname);
  return nickname;
}

export async function getPlayerByUsername(nickname: string) {
  const player = await getTrackedPlayer(nickname);
  if (player) return player;

  const playerDetails = await getPlayer(nickname);

  return {
    id: playerDetails.player_id,
    nickname: playerDetails.nickname,
    avatar: playerDetails.avatar,
    cover_image: playerDetails.cover_image || null,
    steam_id_64: playerDetails.steam_id_64,
    twitch_username: null,
    country: playerDetails.country,
    faceit_elo: playerDetails.games.cs2.faceit_elo,
  };
}

export async function getPlayerRankings(limit = 20, offset = 0) {
  const { data, count } = await supabase
    .from("players")
    .select("id, nickname, avatar, faceit_elo, country", {
      count: "exact",
    })
    .range(offset, offset + limit - 1)
    .order("faceit_elo", { ascending: false, nullsFirst: false })
    .throwOnError();

  return { players: data, count: count ?? 0 };
}
