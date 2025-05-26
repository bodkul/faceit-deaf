import { notFound } from "next/navigation";

import { getPlayerByUsername } from "@/lib/supabase/players";

import MatchHistory from "./components/MatchHistory";
import { PlayerCard } from "./components/PlayerCard";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { username } = await params;

  return { title: username };
}

export default async function Page(props: { params: Params }) {
  const { username } = await props.params;

  const player = await getPlayerByUsername(username);

  if (!player) return notFound();

  return (
    <>
      <PlayerCard player={player} />
      <MatchHistory playerId={player.id} />
    </>
  );
}
