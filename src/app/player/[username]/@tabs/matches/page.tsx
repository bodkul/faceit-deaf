import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MatchHistory from "@/features/player/components/player-matches";
import {
  ensurePlayerExists,
  getPlayerIdByNickname,
  getPlayerMetadata,
} from "@/features/player/queries";

export async function generateMetadata({
  params,
}: PageProps<"/player/[username]/matches">): Promise<Metadata> {
  const { username } = await params;
  return getPlayerMetadata(
    username,
    "Match History",
    `Full match history for ${username}, including scores, K/D, ADR, and ELO changes for every game.`,
  );
}

export default async function PlayerPage({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  const playerId = await getPlayerIdByNickname(username);

  if (!playerId) notFound();

  return <MatchHistory playerId={playerId} />;
}
