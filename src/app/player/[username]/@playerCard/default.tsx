import { notFound } from "next/navigation";

import { getPlayerByUsername } from "@/lib/supabase";

import { PlayerCard } from "./default-client";

export default async function PlayerCardDefault({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;

  const player = await getPlayerByUsername(username);

  if (!player) notFound();

  return <PlayerCard player={player} />;
}
