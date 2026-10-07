import { PlayerCard } from "@/features/player/components/player-card";
import {
  ensurePlayerExists,
  getPlayerByUsername,
} from "@/features/player/queries";

export default async function PlayerCardDefault({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  const player = await getPlayerByUsername(username);

  return <PlayerCard player={player} />;
}
