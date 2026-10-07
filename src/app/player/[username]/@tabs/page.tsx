import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ensurePlayerExists,
  getPlayerMetadata,
} from "@/app/player/[username]/_lib/get-player";
import { getPlayerIdByNickname } from "@/lib/supabase/players";

import Statistics from "./_components/statistics-client";

export async function generateMetadata({
  params,
}: PageProps<"/player/[username]">): Promise<Metadata> {
  const { username } = await params;
  return getPlayerMetadata(
    username,
    "Player Stats",
    `FACEIT statistics, ELO progress, and recent performance for ${username} on CS2.`,
  );
}

export default async function PlayerPage({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  const playerId = await getPlayerIdByNickname(username);

  if (!playerId) notFound();

  return <Statistics playerId={playerId} />;
}
