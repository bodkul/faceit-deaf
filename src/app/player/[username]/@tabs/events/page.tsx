import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RealtimeRefresh } from "@/components/realtime-refresh";
import { PlayerEvents } from "@/features/player/components/player-events";
import { getPlayerEvents } from "@/features/player/events-queries";
import {
  ensurePlayerExists,
  getPlayerIdByNickname,
  getPlayerMetadata,
} from "@/features/player/queries";
import { eventSources } from "@/lib/realtime/topics";

export async function generateMetadata({
  params,
}: PageProps<"/player/[username]/events">): Promise<Metadata> {
  const { username } = await params;
  return getPlayerMetadata(
    username,
    "Events",
    `Deaf CS2 events ${username} has played, with team results and stats for each.`,
  );
}

export default async function PlayerEventsPage({
  params,
}: PageProps<"/player/[username]/events">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  const playerId = await getPlayerIdByNickname(username);
  if (!playerId) notFound();

  const events = await getPlayerEvents(playerId);

  return (
    <>
      <RealtimeRefresh sources={eventSources} />
      <PlayerEvents events={events} playerId={playerId} />
    </>
  );
}
