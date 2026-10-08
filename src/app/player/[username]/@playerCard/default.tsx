import { RealtimeRefresh } from "@/components/realtime-refresh";
import { PlayerCard } from "@/features/player/components/player-card";
import {
  ensurePlayerExists,
  getPlayerByUsername,
} from "@/features/player/queries";
import { topics } from "@/lib/realtime/topics";

export default async function PlayerCardDefault({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  const player = await getPlayerByUsername(username);

  return (
    <>
      <RealtimeRefresh sources={[topics.player(player.id)]} />
      <PlayerCard player={player} />
    </>
  );
}
