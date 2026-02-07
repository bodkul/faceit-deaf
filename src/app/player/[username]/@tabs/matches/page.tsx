import { notFound } from "next/navigation";

import { getPlayerByUsername } from "@/lib/supabase";

import MatchHistory from "./page-client";

export default async function PlayerPage({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;

  const player = await getPlayerByUsername(username);

  if (!player) notFound();

  return <MatchHistory playerId={player.id} />;
}
