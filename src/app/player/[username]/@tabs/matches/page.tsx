import { notFound } from "next/navigation";

import { getPlayerIdByNickname } from "@/lib/supabase";

import MatchHistory from "./page-client";

export default async function PlayerPage({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;

  const playerId = await getPlayerIdByNickname(username);

  if (!playerId) notFound();

  return <MatchHistory playerId={playerId} />;
}
