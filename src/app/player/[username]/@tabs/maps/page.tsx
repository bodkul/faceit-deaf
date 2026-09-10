import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ensurePlayerExists,
  getPlayerMetadata,
} from "@/app/player/[username]/_lib/get-player";
import { getPlayerIdByNickname } from "@/lib/supabase";

import { Maps } from "./page-client";

export async function generateMetadata({
  params,
}: PageProps<"/player/[username]/maps">): Promise<Metadata> {
  const { username } = await params;
  return getPlayerMetadata(
    username,
    "Map Statistics",
    `See which maps ${username} plays most, along with win rate and performance breakdowns for each.`,
  );
}

export default async function PlayerPage({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  const playerId = await getPlayerIdByNickname(username);

  if (!playerId) notFound();

  return <Maps playerId={playerId} />;
}
