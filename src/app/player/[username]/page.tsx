import "@/config/dateConfig";

import { notFound } from "next/navigation";

import { PlayerCard } from "@/components/player-card";
import { getPlayer } from "@/lib/supabase/mutations";

import MatchHistories from "./components/matchHistories";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { username } = await params;

  return {
    title: username,
  };
}

export default async function Page(props: { params: Params }) {
  const { username } = await props.params;

  const { data: player } = await getPlayer(username);

  if (!player) {
    return notFound();
  }

  return (
    <>
      <PlayerCard player={player} />

      <MatchHistories playerId={player.id} />
    </>
  );
}
