import { notFound } from "next/navigation";

import { getPlayerByUsername } from "@/lib/supabase";

import { Maps } from "./page-client";

export default async function PlayerPage({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;

  const player = await getPlayerByUsername(username);

  if (!player) notFound();

  return <Maps playerId={player.id} />;
}
