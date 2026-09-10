import { ensurePlayerExists } from "@/app/player/[username]/_lib/get-player";

import { PlayerCard } from "./default-client";

export default async function PlayerCardDefault({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  return <PlayerCard username={username} />;
}
