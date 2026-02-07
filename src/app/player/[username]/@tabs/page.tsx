import { notFound } from "next/navigation";

import { getPlayerByUsername } from "@/lib/supabase";

import RecentMatches from "./_components/recent-matches-client";
import Statistics from "./_components/statistics-client";

export default async function PlayerPage({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;

  const player = await getPlayerByUsername(username);

  if (!player) notFound();

  return (
    <>
      <Statistics playerId={player.id} />
      <RecentMatches playerId={player.id} />
    </>
  );
}
