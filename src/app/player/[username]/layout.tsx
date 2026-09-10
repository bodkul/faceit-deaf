import { PlayerTabs } from "./_components/player-tabs";
import { ensurePlayerExists } from "./_lib/get-player";

export default async function PlayerLayout({
  playerCard,
  tabs,
  params,
}: LayoutProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  return (
    <div className="flex flex-col gap-4">
      {playerCard}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <PlayerTabs username={username} />
        <div className="flex flex-col gap-4">{tabs}</div>
      </div>
    </div>
  );
}
