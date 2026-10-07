import { ensurePlayerExists } from "@/app/player/[username]/_lib/get-player";
import { getPlayerByUsername } from "@/lib/supabase/players";

import { PlayerCard } from "./default-client";

export default async function PlayerCardDefault({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  const player = await getPlayerByUsername(username);

  return <PlayerCard player={player} />;
}
