import { notFound } from "next/navigation";

import { getPlayerIdByNickname } from "@/lib/supabase";

import RecentMatches from "./_components/recent-matches-client";
import Statistics from "./_components/statistics-client";

export default async function PlayerPage({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;

  const playerId = await getPlayerIdByNickname(username);

  if (!playerId) notFound();

  return (
    <>
      <Statistics playerId={playerId} />
      <RecentMatches playerId={playerId} />
    </>
  );
}
