import "@/config/dateConfig";

import { notFound } from "next/navigation";

import { getPlayerByUsername } from "@/lib/supabase/players";

import MatchHistories from "./components/MatchHistories";
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
      <MatchHistories playerId={player.id} />
    </>
  );
}
