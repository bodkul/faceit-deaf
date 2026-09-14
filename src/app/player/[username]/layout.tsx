import { TabsNav } from "@/components/tabs-nav";

import { ensurePlayerExists } from "./_lib/get-player";

const PLAYER_TABS = [
  { value: "overview", label: "Overview", path: "" },
  { value: "matches", label: "Matches", path: "/matches" },
  { value: "maps", label: "Maps", path: "/maps" },
] as const;

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
      <TabsNav basePath={`/player/${username}`} tabs={PLAYER_TABS} />
      {tabs}
    </div>
  );
}
